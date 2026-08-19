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
  // Leadr es OTRO repo y OTRO proyecto de Vercel (../Leadr → www.leadr.cloud). Sus mails se
  // declaran igual que los de Make: no los ejecutamos nosotros, pero son parte de lo que recibe
  // un comprador nuestro. Quedaron fuera del inventario hasta el 14/08/2026 justamente por vivir
  // del otro lado de la frontera — y "está en el otro repo" es la misma clase de excusa que dejó
  // a republicadores sin secuencia: nadie lo miraba porque no era de nadie.
  LEADR: 'Leadr (repo aparte)',
};

// ── TRIGGERS: qué dispara el flujo ───────────────────────────────────────────
// Un flujo puede tener los dos a la vez: el primer mensaje por evento (al instante, que es lo
// que Jose pide siempre) y el resto por reloj. La recuperación es exactamente eso.
const TRIGGER = {
  EVENTO: 'evento',   // un webhook: un lead nuevo, una compra, un carrito abandonado
  RELOJ: 'reloj',     // un cron
  // A MANO es un trigger legítimo, no un flujo a medio hacer: hay envíos que conviene que
  // decida una persona (una tanda de rescate se manda cuando hay algo que decir, no cada martes).
  // Se declara para poder distinguir "nadie lo dispara porque así se quiso" de "nadie lo dispara
  // y nadie se dio cuenta" — que es el agujero que este archivo existe para no repetir.
  MANO: 'a mano',
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
      { clave: 'regalo3',    horas: 120, tag: 'regalo3-periodico',   marcador: 'MAIL3_AT',       stage: 3,    flag: 'regalos', plataforma: PLATAFORMA.CODIGO },
      { clave: 'regalo4',    horas: 168, tag: 'regalo4-pilares',     marcador: 'MAIL4_AT',       stage: 4,    flag: 'regalos', plataforma: PLATAFORMA.CODIGO },
      { clave: 'mail5',      horas: 192, tag: 'regalo5-agentes-ia',  marcador: 'MAIL5_AT',       stage: null, flag: 'mail5',   plataforma: PLATAFORMA.CODIGO },
      { clave: 'mailoferta', horas: 216, tag: 'oferta-email',        marcador: 'OFERTA_MAIL_AT', stage: 5,    flag: 'oferta',  plataforma: PLATAFORMA.CODIGO },
    ],
    // Piezas que NO las manda nuestro motor. Se declaran igual: son parte del flujo y si una
    // falla, la persona queda a medio camino. Que no las ejecutemos no las hace invisibles.
    piezasAjenas: [
      { clave: 'regalo1', horas: 0, tag: 'regalo1-guia-claude', plataforma: PLATAFORMA.MAKE, detalle: 'escenario 9474482' },
      { clave: 'regalo2', horas: 48, tag: 'regalo2-50-prompts', plataforma: PLATAFORMA.BREVO_AUTO, detalle: 'plantilla #1 · ⚠️ sin link de baja' },
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
    // 339 de sus 510 contactos están sólo en esta lista y no recibieron nada más
    // (recontado el 18/08: eran 196 de 326 el 10/08 — el hueco CRECE, porque el
    // anuncio `ad5-lectores` sigue activo y gastando mientras el paso siguiente no existe).
    motor: null,

    audiencia: { de: 'lista de Brevo', id: 6, nombre: 'Leadgen - Republicadores' },
    dia0: 'cuándo entró el lead',

    piezas: [],
    piezasAjenas: [
      { clave: 'guia', horas: 0, tag: 'republicadores-r1', plataforma: PLATAFORMA.MAKE, detalle: 'escenario 9602489' },
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
      { clave: 'paso1', horas: 0, tag: 'recup-carrito-1', marcador: 'paso_recuperacion=1', plataforma: PLATAFORMA.CODIGO },
      { clave: 'paso2', horas: 24, tag: 'recup-carrito-2', marcador: 'paso_recuperacion=2', plataforma: PLATAFORMA.CODIGO },
    ],
    piezasAjenas: [],

    excluye: ['ya compró (pasa a `recuperado`)', 'ya marcado `perdido`', 'menos de 12 h desde el último mensaje'],
    topes: { porCorrida: 80 },
    gapMinimoHoras: 12,
    perdidoTrasHoras: 120, // tras el paso 2, ~4 días sin compra → perdido
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
      { clave: 'paso1', horas: 0, tag: 'recup-rechazo-1', marcador: 'paso_recuperacion=1', plataforma: PLATAFORMA.CODIGO },
      { clave: 'paso2', horas: 24, tag: 'recup-rechazo-2', marcador: 'paso_recuperacion=2', plataforma: PLATAFORMA.CODIGO },
    ],
    piezasAjenas: [],

    excluye: ['ya compró (pasa a `recuperado`)', 'ya marcado `perdido`', 'menos de 12 h desde el último mensaje'],
    topes: { porCorrida: 80 },
    gapMinimoHoras: 12,
    perdidoTrasHoras: 96, // más corto que el carrito: una tarjeta rechazada se enfría antes
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

  // ───────────────────────────────────────────────────────────────────────────
  // LOS TRES FLUJOS DE LEADR (documentados el 14/08/2026).
  //
  // El bono de "1 mes de Leadr Pro" que viene con el curso genera correo, y ese correo no estaba
  // en ningún inventario: FLUJOS.md lo despachaba con una línea ("lo manda la plataforma Leadr,
  // no este sistema") y ahí terminaba. Vivía en el punto ciego entre los dos repos — el clásico
  // "no es de nadie". Se documenta acá, del lado del CURSO, porque es el curso el que lo dispara
  // y es el comprador del curso quien lo recibe. Que la ejecución esté en otro repo no lo saca
  // del inventario, igual que las piezas de Make no salen por correr en Make.
  // ───────────────────────────────────────────────────────────────────────────
  'leadr-acceso': {
    nombre: 'Acceso a Leadr que viene con la compra',
    objetivo: 'Que el comprador pueda ENTRAR a usar el mes de Pro que le regalamos, no sólo tenerlo.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.EVENTO, que: 'webhook de Hotmart: compra aprobada', quien: PLATAFORMA.CODIGO, detalle: 'api/hotmart.js → POST a la API interna de Leadr /api/internal/course-access' },
    ],
    // El disparo vive acá; el envío, en `../Leadr/app/lib/acceso.ts`. Se nombra el nuestro porque
    // es el que se puede romper de este lado: si el webhook no llama, del otro lado no pasa nada.
    motor: 'sistema-ingresos/api/hotmart.js',

    audiencia: { de: 'tabla', id: 'ventas', nombre: 'compradores del curso (producto 7966973)' },
    dia0: 'cuándo se aprobó la compra',

    piezas: [],
    piezasAjenas: [
      { clave: 'acceso', horas: 0, tag: 'leadr-acceso-curso', plataforma: PLATAFORMA.LEADR, detalle: 'asunto "Tu acceso a Leadr (viene con el curso)" · sale por Brevo, NUNCA por el SMTP de Supabase' },
      // El auto-servicio no lo dispara nadie de nuestro lado: lo pide la persona cuando su link
      // venció. Se declara porque es una pieza real que llega a su casilla, y porque es la que
      // hoy salva la mayoría de los accesos (verificado 11/08: joaquinadg pidió uno y entró).
      { clave: 'relink', horas: null, tag: 'leadr-acceso-reenvio', plataforma: PLATAFORMA.LEADR, detalle: 'asunto "Tu nuevo link para entrar a Leadr" · lo pide la persona desde /entrar cuando el link venció' },
    ],

    // ⚠️ ESTE ES EL HUECO. Si el comprador YA tenía cuenta en Leadr, el endpoint le extiende el
    // plan y devuelve `upgraded` SIN mandar ningún mail: se le regala el Pro y no se entera.
    // Hoy es 1 de 17 (parceparce894, compró el 28/07 con cuenta desde el 22/05), pero crece a
    // medida que las dos listas se superponen.
    excluye: ['🔴 quien YA tenía cuenta en Leadr — se le extiende el plan y NO recibe ningún mail'],
    topes: {},
    condiciones: [
      'el link del mail VENCE, y antes de las 24 h que prometía el copy viejo',
      'el mail lleva `hashed_token` a /entrar, nunca el `action_link` de Supabase (flujo implícito vs PKCE)',
      '/entrar no canjea con GET: las precargas de Gmail gastaban el token antes que la persona',
    ],

    metrica: 'compradores que llegaron a INICIAR SESIÓN. Desde que el mail sale por Brevo (30/07): 3 de 6. Antes, con el SMTP de Supabase: 0 de 11.',
    apagado: 'no hay flag: se apaga sacando la llamada del webhook (api/hotmart.js) o el secreto LEADR_INTERNAL_SECRET.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'leadr-reactivacion': {
    nombre: 'Rescate de quien no entró a Leadr',
    objetivo: 'Devolverle la llave a quien tiene cuenta y nunca pudo entrar, y contarle las novedades a quien sí entró.',
    dueno: 'Sofia (Email)',

    // A MANO A PROPÓSITO — decisión de Jose, 14/08/2026. No es un flujo a medio hacer: una tanda
    // de rescate se manda cuando hay algo que decir, no en piloto automático. Queda escrito para
    // que dentro de tres meses nadie lo lea como un cron caído y "lo arregle".
    trigger: [
      { tipo: TRIGGER.MANO, que: 'alguien corre el script cuando decide mandar una tanda', quien: PLATAFORMA.LEADR },
    ],
    motor: '../Leadr/app/scripts/reactivacion-leadr.mjs',

    audiencia: { de: 'tabla', id: 'users (base de Leadr)', nombre: 'segmento A: nunca inició sesión · segmento B: ya entró alguna vez' },
    dia0: 'no hay: la tanda se arma con el estado del día en que se corre',

    piezas: [],
    piezasAjenas: [
      { clave: 'segmento-a', horas: null, tag: 'leadr-reactivacion-a', plataforma: PLATAFORMA.LEADR, detalle: 'link de acceso NUEVO para quien nunca entró' },
      { clave: 'segmento-b', horas: null, tag: 'leadr-reactivacion-b', plataforma: PLATAFORMA.LEADR, detalle: 'qué se sumó desde la última vez, para quien ya entró' },
    ],

    excluye: ['quien ya entró (para el segmento A)'],
    topes: {},
    condiciones: ['tiene `--dry` y `--solo <email>`: probar antes de mandar la tanda entera'],

    metrica: 'rescatados / contactados. Tres tandas (30/07, 31/07, 02/08): 1 de 18.',
    apagado: 'no aplica — no corre solo. Para que no salga, no se corre.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'email-manifiesto': {
    nombre: 'Tanda única a toda la base — "el negocio que sostenía al periodismo"',
    objetivo: 'Reactivar la base entera con un mensaje de posición y llevarla al curso. Y, sobre todo, medir quién sigue vivo en la lista.',
    dueno: 'Sofia (Email)',

    // A MANO Y UNA SOLA VEZ. Es una campaña de Brevo disparada por API el 18/08/2026, no un
    // flujo que corre solo: no tiene cron, no tiene cola y no se puede repetir (una campaña de
    // Brevo se manda una vez). Se declara igual porque le llegó a 1.227 personas: un envío que
    // no está en el inventario es exactamente el agujero que este archivo existe para evitar.
    trigger: [
      { tipo: TRIGGER.MANO, que: 'se creó la campaña de Brevo y se disparó por API', quien: PLATAFORMA.BREVO_AUTO, detalle: 'campaña #4, 18/08/2026' },
    ],
    motor: null,

    audiencia: { de: 'lista de Brevo', id: 5, nombre: 'listas 5 + 6 deduplicadas por Brevo — 1.258 únicos, 1.227 tras sacar bajas y compradores' },
    dia0: 'no hay: tanda única, el día que se mandó',

    piezas: [],
    piezasAjenas: [
      // Sin tag de Brevo: el plan Starter lo rechaza con 405. La sincronización lo reconoce POR
      // EL ASUNTO (brevo-events-sync.js: `ev.tag || porAsunto.get(ev.subject)`), que está cargado
      // en funnel_steps. Si alguien edita el asunto en Brevo y no toca esa fila, la campaña pasa
      // a mostrar CERO — indistinguible de "no la abrió nadie".
      { clave: 'manifiesto', horas: 0, tag: 'email-manifiesto', plataforma: PLATAFORMA.BREVO_AUTO, detalle: 'asunto "Lo que se está muriendo no es el periodismo" · CTA a /?src=em-manifiesto' },
    ],

    excluye: ['compradores (lista de exclusión Brevo #7, 21 emails de customers+ventas)', 'dados de baja (emailBlacklisted)'],
    topes: {},
    condiciones: ['no se repite: una campaña de Brevo sólo se puede enviar una vez'],

    metrica: 'aperturas, NO ventas. Con 1.227 destinatarios lo esperable son 10-25 clics y 0-1 ventas: cero ventas ahí no significa que el mensaje falló, significa que no hay muestra. Las ventas, si las hay, entran por ventas.src = Email-Manifiesto.',
    apagado: 'no aplica — ya salió y no vuelve a salir.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'email-comunidad': {
    nombre: 'El semanal de la comunidad',
    objetivo: 'Sostener la relación con quien sigue leyendo: comunidad, alumnos que avanzan, oficio. Lleva al curso o a Leadr. Es el canal que NO se paga — el activo propio que no se apaga cuando se pausa un anuncio.',
    dueno: 'Sofia (Email)',

    // A MANO, UNA CAMPAÑA DE BREVO POR SEMANA. No hay cron ni cola: la decisión del 13/08
    // congela MOTORES nuevos, no mails, y una campaña de Brevo no puede mandarse dos veces —
    // así que el bug de las dos corridas no puede repetirse acá. Se automatiza recién cuando
    // haya 8-10 envíos y se sepa qué ángulo funciona; antes sería automatizar una incógnita.
    trigger: [
      { tipo: TRIGGER.MANO, que: 'se crea la campaña de Brevo y se programa, un envío por semana', quien: PLATAFORMA.BREVO_AUTO },
    ],
    motor: null,

    // ⚠️ La audiencia NO es la lista: la lista es el vehículo. Quién recibe lo decide la vista
    // `v_email_comunidad_audiencia`, que se recalcula cada vez que se la consulta, y el script
    // `ads-agent/scripts/datos/sincronizar-audiencia-comunidad.mjs` deja la lista 8 igual a eso
    // ANTES de cada envío. Congelar esta lista a mano es volver al problema que resuelve.
    audiencia: { de: 'lista de Brevo', id: 8, nombre: 'Comunidad - activos · se reescribe desde v_email_comunidad_audiencia antes de cada envío (19/08: 425 activos + 299 nuevos = 724)' },
    dia0: 'no hay: es un canal permanente, no una secuencia. Cada envío es su propio día 0.',

    // Las piezas se agregan de a una, a medida que se mandan: el envío 12 todavía no está
    // escrito y anotarlo antes sería inventar historia. La numeración manda el `src`.
    piezas: [],
    piezasAjenas: [
      { clave: 'comunidad-01', horas: 0, tag: 'comunidad-01', plataforma: PLATAFORMA.BREVO_AUTO, detalle: 'PENDIENTE de escribir · CTA a /?src=em-comunidad-01' },
    ],

    excluye: [
      'compradores (los saca la propia vista: cruce con ventas + customers)',
      'quien marcó spam alguna vez — para siempre, no se negocia',
      'quien nunca recibió nada por rebote (2+ rebotes, 0 entregas)',
      'DORMIDOS: sin apertura ni clic en 60 días, o 3 mails de este canal sin abrir ninguno',
      'dados de baja (Brevo nunca le manda a un emailBlacklisted)',
    ],
    topes: { porSemana: 1 },
    condiciones: [
      'el lead NUEVO (menos de 30 días y menos de 3 mails recibidos) entra aunque no haya abierto nada todavía: si no, el que se anotó ayer quedaría dormido desde el día uno, en silencio',
      '~724 destinatarios × 4 semanas = ~2.900 mails/mes. El plan de Brevo es de ~10.000 y el embudo ya consume ~7.500: si el embudo se reactiva, esto es lo primero que aprieta',
    ],

    metrica: 'CLIC SOBRE APERTURAS, acumulado por ángulo — no ventas por mail. Con ~700 destinatarios un solo envío no distingue nada, y 2-4 ventas por semana es ruido. Se lee en v_email_comunidad_angulos, que avisa sola cuando la muestra es chica. Las ventas entran por ventas.src = Email-Comunidad-NN.',
    apagado: 'no hay flag: no se manda solo. Para frenarlo, no se programa la campaña de la semana.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  'leadr-vencimiento': {
    nombre: 'Aviso de que se vence el Pro',
    objetivo: 'Que el comprador sepa que su mes se termina y pueda decidir si paga. Es el único momento en que Leadr puede convertir.',
    dueno: 'Sofia (Email)',

    trigger: [
      { tipo: TRIGGER.RELOJ, que: 'haría falta un cron diario que mire plan_expires_at', quien: PLATAFORMA.LEADR },
    ],
    // 🔴 SIN MOTOR: no existe. Nadie avisa ni antes ni después de que el Pro se cae. Y sin aviso
    // no hay decisión de pagar, así que la #59 va a medir 0 conversiones sin poder distinguir
    // "no quisieron" de "no se enteraron". Verificado el 14/08/2026 contra los crons de Leadr:
    // los cinco que hay son Clara, el Director, los costos de Make y Clarity ×2. Ninguno de mail.
    motor: null,

    audiencia: { de: 'tabla', id: 'users (base de Leadr)', nombre: "plan = 'pro' con plan_expires_at cerca" },
    dia0: 'la fecha de vencimiento del plan',

    piezas: [],
    piezasAjenas: [],

    excluye: ['quien ya paga', 'quien nunca inició sesión (avisarle que se le vence algo que nunca usó suena a burla)'],
    topes: {},
    condiciones: [
      '⏰ la primera ola vence entre el 28 y el 31/08/2026: 6 personas. Si no hay nada armado antes, se pierden y hay que esperar a septiembre',
      '⚠️ la baja a `basic` sólo ocurre cuando la persona ENTRA al dashboard: quien no vuelve queda marcado `pro` para siempre en la base',
    ],

    metrica: 'compradores que pasan a Pro pago al vencerse el regalo. Hoy: 0 de 0 — nadie llegó a que le avise nada.',
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

// ── TRADUCTORES A CADA MOTOR ─────────────────────────────────────────────────
// La ficha guarda el tiempo en HORAS, una sola unidad para todos los flujos. Antes cada motor
// tenía la suya —el embudo en días, la recuperación en horas— y eso era la mitad del problema:
// para tocar algo había que averiguar primero en qué idioma estaba escrito. Cada motor recibe
// acá lo suyo, ya convertido. Traducir en un solo lugar es lo que hace que la ficha sea la
// fuente y no un espejo que se desincroniza.

// Para wa-funnel.js (el embudo de guías): piensa en días.
function piezasParaMotor(clave) {
  const f = FLUJOS[clave];
  if (!f) throw new Error(`flujo desconocido: ${clave}`);
  return f.piezas.map((p) => ({
    send: p.clave, marcador: p.marcador, tag: p.tag, minDays: p.horas / 24, stage: p.stage ?? null, flag: p.flag,
  }));
}

// Para recuperacion.js: piensa en horas y en "pasos" numerados. El número de paso sale del orden
// de las piezas (1, 2, …) y se guarda en `paso_recuperacion` — por eso el orden del array importa.
function secuenciaParaRecuperacion(clave) {
  const f = FLUJOS[clave];
  if (!f) throw new Error(`flujo desconocido: ${clave}`);
  return {
    perdidoTrasHoras: f.perdidoTrasHoras,
    pasos: f.piezas.map((p, i) => ({ paso: i + 1, minHoras: p.horas })),
  };
}

// El motor de recuperación atiende dos flujos que comparten todo menos el copy y los plazos.
// Se arma acá el mapa `tipo → secuencia` que ese motor espera, para que no tenga que saber
// cuáles de los flujos de la ficha le tocan.
const RECUPERACION_POR_TIPO = {
  carrito_abandonado: 'recup-carrito',
  pago_rechazado: 'recup-rechazo',
};
function secuenciasDeRecuperacion() {
  const out = {};
  for (const [tipo, clave] of Object.entries(RECUPERACION_POR_TIPO)) out[tipo] = secuenciaParaRecuperacion(clave);
  return out;
}

module.exports = {
  FLUJOS, PLATAFORMA, TRIGGER, validarFlujo, validarTodos,
  piezasParaMotor, secuenciaParaRecuperacion, secuenciasDeRecuperacion, RECUPERACION_POR_TIPO,
};
