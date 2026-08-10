// api/_lib/flujos.js — LA DEFINICIÓN DE CADA FLUJO DE MAILS, COMO DATO.
//
// Un flujo se DESCRIBE acá y se EJECUTA con un motor. La descripción no es documentación
// suelta: es esto, y el código la lee. Si un flujo no está acá, no existe.
//
// POR QUÉ EXISTE (10/08/2026). Había dos motores definiendo lo mismo en idiomas distintos:
// `wa-funnel.js` con `PIEZAS` (en días, marcando en atributos de Brevo) y `recuperacion.js` con
// `SECUENCIAS` (en horas, marcando en una columna de Supabase). Mismo concepto, dos formas. Un
// tercer flujo iba a inventar una tercera. Eso es lo que hacía caro probar cualquier cosa: cada
// experimento arrancaba averiguando en cuál de los dos idiomas se hacía.
//
// LAS CICATRICES QUE DEFINEN LOS CAMPOS. Cada campo obligatorio está acá porque su ausencia
// costó algo real esta semana:
//   · `motor: null`      → republicadores capturó 326 leads y no les mandó nada después de la
//                          guía. 196 personas, con el anuncio activo y gastando. La pieza
//                          funcionaba y devolvía 200; lo que faltaba era el paso siguiente, que
//                          no estaba en ningún lado y por eso no fallaba.
//   · pieza sin `tag`    → los mails de recuperación salían sin etiqueta, así que en Brevo no se
//                          podían identificar y no había forma de saber si llegaban. El Panel de
//                          Salud dio verde un mes entero mientras no llegaba nada.
//   · sin `metrica`      → 944 leads y 1 venta estuvo a la vista semanas sin que nadie lo dijera.
//   · sin `plataforma`   → el embudo de guías corre repartido entre Make, Brevo y código propio,
//                          y sólo se descubría leyendo los tres.
//
// ⚠️ UN FLUJO DE MAILS NO ES UNA CAMPAÑA DE META. Una campaña de anuncios puede no mandar un
// solo mail (`interaccion`, `venta-curso`) y un flujo puede no tener anuncio detrás (la
// recuperación arranca con una compra fallida). Las campañas declaran a qué flujo alimentan en
// su `brief.md`; acá viven los flujos.
//
// El inventario legible para humanos es `sistema-ingresos/docs/FLUJOS.md`, y sale de acá.

// ── PLATAFORMAS donde puede correr una pieza ──────────────────────────────────
// Escritas como constantes para que no haya doce formas de decir "Make".
const PLATAFORMA = {
  CODIGO: 'código propio (Vercel)',
  MAKE: 'Make',
  BREVO_AUTO: 'automatización de Brevo',
};

// ── TRIGGERS: qué dispara el flujo ───────────────────────────────────────────
// Un flujo puede tener los dos a la vez: el primer mensaje por evento (al instante, que es lo
// que Jose pide siempre) y el resto por reloj. La recuperación es exactamente eso.
const TRIGGER = {
  EVENTO: 'evento',   // un webhook: un lead nuevo, una compra, un carrito abandonado
  RELOJ: 'reloj',     // un cron
};

const FLUJOS = {
  // ───────────────────────────────────────────────────────────────────────────
  'guias-claude': {
    nombre: 'Las 4 guías gratis',
    objetivo: 'Entregar las guías prometidas en el anuncio y, al final, ofrecer el curso.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'lead nuevo de Meta Lead Ads', quien: PLATAFORMA.MAKE, detalle: 'escenario 9474482' },
      { tipo: TRIGGER.RELOJ, que: 'cron diario 15:00 España (13:00 UTC)', quien: PLATAFORMA.CODIGO },
    ],
    motor: 'sistema-ingresos/api/wa-funnel.js',

    audiencia: { de: 'lista de Brevo', id: 5, nombre: 'Leadgen - Guía Claude' },
    dia0: 'cuándo se creó el contacto en Brevo (createdAt)',

    // El orden de este array ES el orden de prioridad de la cola. No reordenar sin querer:
    // `wa-funnel.js` despacha por el índice, y la oferta tiene que ir antes que los regalos.
    piezas: [
      { clave: 'regalo3',    dia: 5, tag: 'regalo3-periodico',   marcador: 'MAIL3_AT',       stage: 3,    flag: 'regalos', plataforma: PLATAFORMA.CODIGO },
      { clave: 'regalo4',    dia: 7, tag: 'regalo4-pilares',     marcador: 'MAIL4_AT',       stage: 4,    flag: 'regalos', plataforma: PLATAFORMA.CODIGO },
      { clave: 'mail5',      dia: 8, tag: 'regalo5-agentes-ia',  marcador: 'MAIL5_AT',       stage: null, flag: 'mail5',   plataforma: PLATAFORMA.CODIGO },
      { clave: 'mailoferta', dia: 9, tag: 'oferta-email',        marcador: 'OFERTA_MAIL_AT', stage: 5,    flag: 'oferta',  plataforma: PLATAFORMA.CODIGO },
    ],
    // Piezas que NO las manda nuestro motor. Se declaran igual: son parte del flujo y si una
    // falla, la persona queda a medio camino. Que no las ejecutemos no las hace invisibles.
    piezasAjenas: [
      { clave: 'regalo1', dia: 0, tag: 'regalo1-guia-claude', plataforma: PLATAFORMA.MAKE, detalle: 'escenario 9474482' },
      { clave: 'regalo2', dia: 2, tag: 'regalo2-50-prompts', plataforma: PLATAFORMA.BREVO_AUTO, detalle: 'plantilla #1 · ⚠️ sin link de baja' },
    ],

    excluye: ['ya compró (cruce con `ventas`)', 'de baja en Brevo (`emailBlacklisted`)', 'ya recibió algo hoy'],
    topes: { piezasPorDia: 500, reenganchePorDia: 150, reenvioPorDia: 80 },
    condiciones: ['puerta de enganche: la oferta no sale a quien nunca abrió ni clicó nada en 90 días'],

    metrica: 'ventas atribuidas al flujo. Hoy: 944 leads → 1 venta.',
    apagado: 'WA_FUNNEL_ENABLED=0 apaga el flujo entero; cada pieza tiene su flag (MAILREGALOS_ENABLED, MAIL5_ENABLED, MAILOFERTA_ENABLED).',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'republicadores': {
    nombre: 'Que te lean miles',
    objetivo: 'Entregar la guía a los republicadores y —esto todavía NO existe— llevarlos al curso.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'lead nuevo de Meta Lead Ads', quien: PLATAFORMA.MAKE, detalle: 'escenario 9602489' },
    ],
    // 🔴 SIN MOTOR: entrega la guía y se detiene. `wa-funnel.js` lee sólo la lista 5.
    // 196 de sus 326 contactos están sólo en esta lista y no recibieron nada más.
    // El anuncio `ad5-lectores` sigue activo y gastando.
    motor: null,

    audiencia: { de: 'lista de Brevo', id: 6, nombre: 'Leadgen - Republicadores' },
    dia0: 'cuándo entró el lead',

    piezas: [],
    piezasAjenas: [
      { clave: 'guia', dia: 0, tag: 'republicadores-r1', plataforma: PLATAFORMA.MAKE, detalle: 'escenario 9602489' },
    ],

    excluye: [],
    topes: {},
    condiciones: [],

    metrica: 'ventas atribuidas. Hoy: 0 — no hay pieza que venda.',
    apagado: 'pausar el anuncio en Meta; no hay flag porque no hay motor.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'recup-carrito': {
    nombre: 'Recuperación de carrito abandonado',
    objetivo: 'Que quien empezó la compra y no la terminó vuelva al checkout.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'webhook de Hotmart: carrito abandonado', quien: PLATAFORMA.CODIGO, detalle: 'api/hotmart.js → 1er mail al instante' },
      { tipo: TRIGGER.RELOJ, que: 'cron diario 17:00 España (15:00 UTC)', quien: PLATAFORMA.CODIGO, detalle: 'el recordatorio, y red de seguridad del 1º' },
    ],
    motor: 'sistema-ingresos/api/recuperacion.js',

    audiencia: { de: 'tabla', id: 'clientes_potenciales', nombre: "tipo = 'carrito_abandonado'" },
    dia0: 'ocurrido_en — cuándo abandonó',

    piezas: [
      { clave: 'paso1', dia: 0, tag: 'recup-carrito-1', marcador: 'paso_recuperacion=1', plataforma: PLATAFORMA.CODIGO },
      { clave: 'paso2', dia: 1, tag: 'recup-carrito-2', marcador: 'paso_recuperacion=2', plataforma: PLATAFORMA.CODIGO },
    ],
    piezasAjenas: [],

    excluye: ['ya compró (pasa a `recuperado`)', 'ya marcado `perdido`', 'menos de 12 h desde el último mensaje'],
    topes: { porCorrida: 80 },
    condiciones: ['se da por perdido ~5 días después del paso 2 sin compra'],

    metrica: 'recuperados / contactados. Hoy: 0 de 30.',
    apagado: 'RECUP_ENABLED=0 apaga los dos flujos de recuperación (el instantáneo y el cron).',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'recup-rechazo': {
    nombre: 'Recuperación de pago rechazado',
    objetivo: 'Que quien puso la tarjeta y se le cayó el pago vuelva a intentarlo.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'webhook de Hotmart: pago rechazado/cancelado', quien: PLATAFORMA.CODIGO, detalle: 'api/hotmart.js → 1er mail al instante' },
      { tipo: TRIGGER.RELOJ, que: 'cron diario 17:00 España (15:00 UTC)', quien: PLATAFORMA.CODIGO },
    ],
    motor: 'sistema-ingresos/api/recuperacion.js',

    audiencia: { de: 'tabla', id: 'clientes_potenciales', nombre: "tipo = 'pago_rechazado'" },
    dia0: 'ocurrido_en — cuándo se cayó el pago',

    piezas: [
      { clave: 'paso1', dia: 0, tag: 'recup-rechazo-1', marcador: 'paso_recuperacion=1', plataforma: PLATAFORMA.CODIGO },
      { clave: 'paso2', dia: 1, tag: 'recup-rechazo-2', marcador: 'paso_recuperacion=2', plataforma: PLATAFORMA.CODIGO },
    ],
    piezasAjenas: [],

    excluye: ['ya compró (pasa a `recuperado`)', 'ya marcado `perdido`', 'menos de 12 h desde el último mensaje'],
    topes: { porCorrida: 80 },
    condiciones: ['⚠️ es el grupo MÁS cercano a comprar: escribieron todo y pusieron la tarjeta'],

    metrica: 'recuperados / contactados. Hoy: 0.',
    apagado: 'RECUP_ENABLED=0.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'post-compra': {
    nombre: 'Post-compra',
    objetivo: 'Que quien compró sepa qué hacer, y reciba lo que le prometimos.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'webhook de Hotmart: compra aprobada', quien: PLATAFORMA.CODIGO, detalle: 'api/hotmart.js' },
    ],
    // 🔴 SIN MOTOR: no existe. Verificado comprador por comprador el 09/08/2026 contra Brevo —
    // ningún comprador recibe un mail NUESTRO después de comprar. Recibe los de Hotmart y el
    // mail de acceso de Leadr, que los manda otra plataforma.
    motor: null,

    audiencia: { de: 'tabla', id: 'ventas', nombre: 'quien acaba de comprar' },
    dia0: 'cuándo compró',

    piezas: [],
    piezasAjenas: [],

    excluye: ['pidió reembolso'],
    topes: {},
    condiciones: [],

    metrica: 'sin definir — no hay flujo todavía.',
    apagado: 'no aplica.',
  },
};

// ── EL VALIDADOR ─────────────────────────────────────────────────────────────
// Un flujo incompleto tiene que GRITAR, no quedarse callado. Es toda la diferencia entre los dos
// agujeros de esta semana y haberlos visto el primer día: los dos eran flujos a los que les
// faltaba el paso siguiente, y como cada pieza suelta funcionaba, nada fallaba.
//
// Se distingue a propósito entre ERROR y AVISO:
//   · ERROR = la ficha está mal escrita (falta un campo). Se arregla escribiéndola.
//   · AVISO = la ficha está bien y describe algo que está mal en la realidad (un flujo sin motor
//     es una ficha correcta que dice "esto captura y se detiene"). No se puede "arreglar"
//     escribiendo: hay que construir el flujo. Por eso no tumba nada, pero se ve.
const OBLIGATORIOS = ['nombre', 'objetivo', 'dueno', 'trigger', 'audiencia', 'dia0', 'metrica', 'apagado'];

function validarFlujo(clave, f) {
  const errores = [];
  const avisos = [];

  for (const campo of OBLIGATORIOS) {
    const v = f[campo];
    const vacio = v == null || v === '' || (Array.isArray(v) && !v.length);
    if (vacio) errores.push(`falta "${campo}"`);
  }
  // `motor` es obligatorio pero puede ser null A PROPÓSITO: null significa "no hay motor".
  // Lo que no se acepta es que la clave no esté, porque entonces no se sabe si es null o si
  // alguien se olvidó de contestar — que es justo la duda que este archivo viene a matar.
  if (!('motor' in f)) errores.push('falta "motor" (poner null si no hay, pero contestarlo)');
  if (!('piezas' in f)) errores.push('falta "piezas" (poner [] si no manda nada propio)');

  const piezas = [...(f.piezas || []), ...(f.piezasAjenas || [])];
  for (const p of piezas) {
    if (!p.tag) errores.push(`la pieza "${p.clave || '?'}" no tiene etiqueta — sin etiqueta no se puede saber si llegó`);
    if (!p.plataforma) errores.push(`la pieza "${p.clave || '?'}" no dice en qué plataforma corre`);
  }

  if (f.motor === null && piezas.length <= 1) {
    avisos.push('SIN MOTOR: entrega su primera pieza y se detiene. Quien entre acá no recibe nada más.');
  }
  if (!piezas.length) avisos.push('no tiene ni una pieza: el flujo no existe todavía.');

  return { errores, avisos };
}

// Corre al cargar el módulo. Si una ficha está mal escrita, revienta acá y no en producción
// tres semanas después.
function validarTodos({ silencioso = false } = {}) {
  const problemas = [];
  for (const [clave, f] of Object.entries(FLUJOS)) {
    const { errores, avisos } = validarFlujo(clave, f);
    for (const e of errores) problemas.push({ clave, nivel: 'error', texto: e });
    for (const a of avisos) problemas.push({ clave, nivel: 'aviso', texto: a });
  }
  const errores = problemas.filter((p) => p.nivel === 'error');
  if (errores.length) {
    throw new Error(`Fichas de flujo mal escritas:\n${errores.map((e) => `  · ${e.clave}: ${e.texto}`).join('\n')}`);
  }
  if (!silencioso) {
    for (const a of problemas) console.warn(`[flujos] ⚠️ ${a.clave}: ${a.texto}`);
  }
  return problemas;
}

validarTodos({ silencioso: true });

// Las piezas de un flujo en el formato que consume wa-funnel.js. Traducir acá —y no copiar la
// lista allá— es lo que hace que esta ficha sea la fuente y no un espejo que se desincroniza.
function piezasParaMotor(clave) {
  const f = FLUJOS[clave];
  if (!f) throw new Error(`flujo desconocido: ${clave}`);
  return f.piezas.map((p) => ({
    send: p.clave, marcador: p.marcador, tag: p.tag, minDays: p.dia, stage: p.stage ?? null, flag: p.flag,
  }));
}

module.exports = { FLUJOS, PLATAFORMA, TRIGGER, validarFlujo, validarTodos, piezasParaMotor };
