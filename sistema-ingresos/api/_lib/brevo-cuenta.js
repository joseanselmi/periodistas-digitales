// api/_lib/brevo-cuenta.js — ¿le queda saldo a Brevo para mandar?
//
// ── POR QUÉ EXISTE (01/09/2026) ──────────────────────────────────────────────
// Del 28/08 al 01/09 no salió UN SOLO mail automático y ningún sistema avisó: ni las guías a
// los leads nuevos, ni el embudo, ni el Panel de Salud, ni el Panel de Comando. La cuenta se
// quedó en 0 créditos (la suscripción Starter figura `cancelled` desde el 28/08 — la tarjeta
// estaba rechazada) y desde ahí Brevo dejó de entregar.
//
// ── LO QUE HACE ÚNICO A ESTE FALLO ───────────────────────────────────────────
// NO se puede detectar mirando la respuesta del envío. Verificado contra la API el 01/09:
// las corridas del 29 y del 30/08 anotaron `enviado:{ofertareenvio:1}` porque
// `POST /v3/smtp/email` contestó OK, y sin embargo el informe diario de Brevo dice 1 pedido
// esos días — el de Make, con otro tag — y CERO del embudo. El mail del embudo no se rechazó:
// se evaporó. Ni siquiera figura como "pedido".
//
// Por eso el chequeo tiene que ser PREVIO y preguntarle a la CUENTA, que es el único lugar
// donde el problema se ve. Un chequeo sobre la respuesta del envío —que es lo que parecía
// obvio— habría seguido diciendo que todo salió bien.
//
// ── EL DAÑO QUE EVITA ────────────────────────────────────────────────────────
// El embudo escribe el marcador en Brevo ANTES de mandar (la reserva, para que dos corridas no
// manden lo mismo). Con la cuenta seca la reserva se escribe, el envío se evapora, y la persona
// queda marcada como "ya lo recibió" PARA SIEMPRE. Ya pasó con dos personas y con las dos
// piezas que venden:
//   · garyjcamacho@gmail.com  → la OFERTA (28/08) y su REENVÍO (30/08)
//   · anibalmora475@gmail.com → el REENVÍO de la oferta (29/08)
// Ninguno de esos tres mails existió nunca. Sin este freno, cada día de cuenta seca quema un
// par más, en silencio y sin vuelta atrás.
//
// ── REGLA DE DISEÑO: FALLA ABIERTO ───────────────────────────────────────────
// Si no se puede saber cuánto saldo hay (la API no contesta, el plan viene con una forma que no
// conocemos), esto devuelve `sabemos:false` y NADIE frena nada. Un falso "no hay créditos"
// apagaría todos los mails del negocio, que es peor que el problema que resuelve. Sólo se frena
// cuando Brevo dice, con un número, que el saldo es cero.

const BREVO = 'https://api.brevo.com/v3';

// Tipos de crédito que se gastan al MANDAR un mail. `sendLimit` es el cupo mensual de un plan
// de suscripción; `send` son créditos prepagos. Los demás que devuelve Brevo (por ejemplo `sms`)
// no tienen nada que ver con el correo y contarlos daría saldo donde no lo hay.
const TIPOS_DE_ENVIO = new Set(['sendLimit', 'send']);

/**
 * Le pregunta a Brevo cuánto saldo de envío le queda a la cuenta.
 *
 * Devuelve siempre un objeto, nunca tira:
 *   { sabemos, creditos, seco, plan, cancelado, motivo }
 *
 *   sabemos   — false si no se pudo averiguar. Con false, NO se frena nada (falla abierto).
 *   creditos  — número de créditos de envío, o null si no se sabe.
 *   seco      — true SOLO si Brevo dijo explícitamente que el saldo es 0.
 *   cancelado — true si algún plan de marketing figura como `cancelled` (la señal temprana:
 *               el 28/08 el plan quedó cancelado y recién horas después se acabó el saldo).
 *   motivo    — una línea en castellano, lista para leer en una alarma.
 */
async function estadoCuenta(apiKey = process.env.BREVO_API_KEY, ms = 8000) {
  if (!apiKey) {
    return { sabemos: false, creditos: null, seco: false, plan: null, cancelado: false, motivo: 'no hay BREVO_API_KEY para preguntar' };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`${BREVO}/account`, {
      headers: { 'api-key': apiKey, accept: 'application/json' },
      signal: ctrl.signal,
    });
    if (!r.ok) {
      return { sabemos: false, creditos: null, seco: false, plan: null, cancelado: false, motivo: `Brevo /account contestó ${r.status}` };
    }
    const j = await r.json();
    const planes = Array.isArray(j.plan) ? j.plan : [];
    const deEnvio = planes.filter((p) => p && TIPOS_DE_ENVIO.has(p.creditsType));

    // Ningún plan de envío reconocible: no sabemos, y no frenamos. Pasa, por ejemplo, con las
    // cuentas de pago por uso, cuya forma no vimos nunca acá.
    if (!deEnvio.length) {
      return { sabemos: false, creditos: null, seco: false, plan: planes, cancelado: false, motivo: 'el plan de Brevo no declara créditos de envío (forma desconocida)' };
    }
    // Un solo crédito no numérico y preferimos no saber antes que inventar un cero.
    if (deEnvio.some((p) => !Number.isFinite(Number(p.credits)))) {
      return { sabemos: false, creditos: null, seco: false, plan: planes, cancelado: false, motivo: 'Brevo devolvió créditos no numéricos' };
    }

    const creditos = deEnvio.reduce((a, p) => a + Number(p.credits), 0);
    const verticales = Array.isArray(j.planVerticals) ? j.planVerticals : [];
    const cancelado = verticales.some((v) => v && String(v.status).toLowerCase() === 'cancelled');
    const seco = creditos <= 0;

    let motivo;
    if (seco && cancelado) motivo = 'Brevo está en 0 créditos y la suscripción figura CANCELADA (tarjeta rechazada): no sale ni un mail';
    else if (seco) motivo = 'Brevo está en 0 créditos: no sale ni un mail';
    else if (cancelado) motivo = `la suscripción de Brevo figura CANCELADA — quedan ${creditos} créditos y no se van a renovar`;
    else motivo = `quedan ${creditos} créditos de envío`;

    return { sabemos: true, creditos, seco, plan: planes, cancelado, motivo };
  } catch (e) {
    return { sabemos: false, creditos: null, seco: false, plan: null, cancelado: false, motivo: `no se pudo preguntar a Brevo (${(e && e.message) || e})` };
  } finally {
    clearTimeout(t);
  }
}

// Umbral de aviso temprano. Un día del embudo son ~90-150 mails, así que 500 es "te quedan
// menos de una semana" — margen para pagar antes de que se corte, no después.
const AVISO_BAJO = parseInt(process.env.BREVO_CREDITOS_AVISO || '500', 10);

module.exports = { estadoCuenta, AVISO_BAJO };
