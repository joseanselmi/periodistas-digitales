// api/_lib/candado.js — un solo dueño por vez para las corridas que MANDAN mails.
//
// POR QUÉ EXISTE. El 07/08/2026 salieron ~1.800 mails a 580 personas: hasta 3 copias de la
// misma guía a la misma persona en un minuto. No fue el cron ni un límite de Brevo: el embudo
// se protege de repetir leyendo los atributos del contacto en Brevo, y esos se escriben DESPUÉS
// de mandar. Dos corridas simultáneas no se ven entre ellas — las dos leen "pendiente" y las dos
// mandan. El auto-encadenado es seguro de a uno, pero nada impedía que arrancaran varias cadenas
// a la vez (el cron + un script a mano + un reintento). Esto es lo que faltaba.
//
// CÓMO FUNCIONA. Una fila en `ops_flags` (name = el candado):
//   - `value`      = el token del dueño (un UUID).
//   - `updated_at` = cuándo lo tomó o lo renovó por última vez. Sumado al TTL da el vencimiento.
//   - tomar()   — si no hay fila, la inserta; si la hay y está viva, NO manda a nadie.
//   - renovar() — cada eslabón de la cadena estira el vencimiento con SU token.
//   - soltar()  — al terminar, si no queda cadena viva.
// El vencimiento es la red de seguridad: si una corrida muere a mitad (timeout de Vercel), el
// candado se libera solo pasado el TTL en vez de dejar el embudo trabado para siempre. Por eso
// el TTL lo pasa quien llama y no lo guarda la fila: cada candado sabe cuánto dura el suyo.
//
// TODAS LAS OPERACIONES SON ATÓMICAS, no "leer y después escribir":
//   - insertar sin upsert → si otro llegó primero, Postgres devuelve 409 y perdimos la carrera;
//   - renovar, soltar y pisar un candado vencido van con el token EXACTO en el filtro
//     (compare-and-swap): si la fila ya es de otro, el filtro no encuentra nada y la operación
//     devuelve 0 filas en vez de pisar trabajo ajeno.
// Un `select` seguido de un `update` volvería a tener la misma ventana que causó el incidente.
//
// ⚠️ El token va SOLO en `value`, sin nada pegado, y por eso los filtros son `eq.<uuid>` pelado.
// Guardar ahí un `token|fecha` y buscarlo con `like` NO funciona: PostgREST no expande el
// comodín si el valor va entre comillas, y renovar/soltar fallaban en silencio — o sea que el
// candado no se soltaba nunca y el embudo quedaba trabado hasta que venciera. Lo agarró la
// prueba de scratchpad/probar-candado.mjs; no se ve leyendo el código.
//
// FALLA CON RUIDO, NUNCA MUDA: si Supabase no contesta, `tomar` devuelve ok con `sinRed:true`
// y quien llama sigue enviando (un hipo de Supabase no puede dejar al embudo un día sin salir),
// pero tiene que decirlo en su respuesta. Lo que NO se hace nunca es enviar cuando el candado
// está tomado por otro.

const { randomUUID } = require('crypto');

const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const TABLA = 'ops_flags';

function rest(path, opts) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json', ...(opts && opts.headers) },
  });
}

const hayBase = () => !!(SB_URL && SB_KEY);

const venceEn = (updatedAt, ttlSeg) => new Date(new Date(updatedAt).getTime() + ttlSeg * 1000);
const sigueViva = (updatedAt, ttlSeg) => venceEn(updatedAt, ttlSeg).getTime() > Date.now();

async function fila(nombre) {
  const r = await rest(`${TABLA}?name=eq.${encodeURIComponent(nombre)}&select=name,value,updated_at&limit=1`, {});
  if (!r.ok) throw new Error(`candado leer ${r.status}: ${(await r.text()).slice(0, 120)}`);
  const filas = await r.json();
  return (filas && filas[0]) || null;
}

// Intenta quedarse con el candado. Devuelve { ok, token, motivo }.
// ok:false = hay otra corrida viva → el que llama NO debe mandar nada.
//
// ⚠️ EL TTL TIENE QUE SER EL MISMO PARA UN MISMO NOMBRE DE CANDADO. El vencimiento no está
// guardado: lo calcula quien lee, sumándole su TTL a `updated_at`. Dos llamadas al mismo candado
// con TTL distinto ven cosas distintas de la misma fila — una lo da por vencido y la otra por
// vivo, que es justamente el desacuerdo que este archivo existe para evitar.
async function tomar(nombre, ttlSeg = 180) {
  if (!hayBase()) return { ok: true, sinRed: true, motivo: 'sin Supabase: corriendo SIN candado' };
  const token = randomUUID();
  try {
    const actual = await fila(nombre);
    if (!actual) {
      // Sin upsert: el 409 por clave duplicada es justamente la señal de que otro llegó primero.
      const r = await rest(TABLA, {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ name: nombre, value: token, updated_at: new Date().toISOString() }),
      });
      if (r.status === 409) return { ok: false, motivo: 'otra corrida tomó el candado en el mismo instante' };
      if (!r.ok) throw new Error(`candado insertar ${r.status}: ${(await r.text()).slice(0, 120)}`);
      return { ok: true, token };
    }
    const vence = venceEn(actual.updated_at, ttlSeg).toISOString();
    if (sigueViva(actual.updated_at, ttlSeg)) {
      return { ok: false, motivo: `hay una corrida viva (el candado vence ${vence})`, vence };
    }
    // Vencido: lo pisa UNO SOLO — el que todavía vea el token viejo exacto.
    const r = await rest(`${TABLA}?name=eq.${encodeURIComponent(nombre)}&value=eq.${encodeURIComponent(actual.value)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ value: token, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) throw new Error(`candado pisar ${r.status}: ${(await r.text()).slice(0, 120)}`);
    const filas = await r.json();
    if (!filas.length) return { ok: false, motivo: 'otra corrida se quedó con el candado vencido' };
    return { ok: true, token, vencido_pisado: vence };
  } catch (e) {
    console.error('[candado] tomar:', e && e.message || e);
    return { ok: true, sinRed: true, motivo: `no se pudo consultar el candado (${e && e.message || e}): corriendo SIN candado` };
  }
}

// Estira el vencimiento — mueve `updated_at` a ahora, que es de donde sale. No recibe TTL: el
// TTL lo aplica quien lee, no la fila. Sólo lo consigue quien tenga el token vigente: si otro
// pisó el candado (porque el nuestro venció), devuelve ok:false y esa corrida tiene que frenar.
async function renovar(nombre, token) {
  if (!hayBase() || !token) return { ok: true, sinRed: true };
  try {
    const r = await rest(`${TABLA}?name=eq.${encodeURIComponent(nombre)}&value=eq.${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ value: token, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) throw new Error(`candado renovar ${r.status}`);
    const filas = await r.json();
    return { ok: filas.length > 0, motivo: filas.length ? '' : 'el candado ya no es nuestro (venció y lo tomó otra corrida)' };
  } catch (e) {
    console.error('[candado] renovar:', e && e.message || e);
    return { ok: true, sinRed: true };
  }
}

// Libera el candado. Borra la fila sólo si sigue siendo nuestra: si el TTL venció y otra corrida
// ya arrancó con su propio token, este delete no la toca.
async function soltar(nombre, token) {
  if (!hayBase() || !token) return { ok: true };
  try {
    const r = await rest(`${TABLA}?name=eq.${encodeURIComponent(nombre)}&value=eq.${encodeURIComponent(token)}`, {
      method: 'DELETE', headers: { Prefer: 'return=minimal' },
    });
    return { ok: r.ok };
  } catch (e) {
    console.error('[candado] soltar:', e && e.message || e);
    return { ok: false };
  }
}

// Quién lo tiene ahora, para poder mirarlo sin tocarlo (modo dry / diagnóstico). El TTL va por
// parámetro por lo mismo que en `tomar`: la fila no sabe cuánto dura este candado.
async function estado(nombre, ttlSeg = 180) {
  if (!hayBase()) return { disponible: false, motivo: 'sin Supabase' };
  try {
    const actual = await fila(nombre);
    if (!actual) return { disponible: true, libre: true };
    const viva = sigueViva(actual.updated_at, ttlSeg);
    return { disponible: true, libre: !viva, vence: venceEn(actual.updated_at, ttlSeg).toISOString() };
  } catch (e) { return { disponible: false, motivo: String(e && e.message || e) }; }
}

module.exports = { tomar, renovar, soltar, estado };
