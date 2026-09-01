/**
 * Crea el formulario "Antes de entrar al canal privado" — las 5 preguntas completas,
 * con los ajustes ya puestos y la hoja de respuestas vinculada.
 *
 * El detalle de POR QUÉ cada pregunta está escrita así vive en ENCUESTA-VOZ-CLIENTE.md.
 * Este archivo solo la construye.
 *
 * ── CÓMO SE CORRE (una sola vez, ~2 minutos) ──────────────────────────────────
 *   1. Ir a https://script.google.com  →  "Nuevo proyecto"
 *   2. Borrar lo que venga por defecto y pegar TODO este archivo
 *   3. Botón "Ejecutar". La primera vez Google pide permiso sobre tu propia cuenta:
 *      Revisar permisos → elegir tu cuenta → "Configuración avanzada" → "Ir a (nombre)"
 *      → Permitir. Es normal, el script es tuyo y no está verificado por Google.
 *   4. Abajo, en "Registro de ejecución", aparecen los tres links. El primero es el
 *      que hay que pasarle a Claude para engancharlo en /gracias.
 *
 * ⚠️ Los cuatro ajustes de abajo (setCollectEmail, setLimitOneResponsePerUser,
 *    setProgressBar, setShuffleQuestions) fijan valores que YA son el default de un
 *    formulario nuevo. Están escritos para dejar la intención documentada. Si alguna
 *    de esas líneas da error porque Google cambió el método, BORRALA y volvé a
 *    ejecutar: el formulario queda igual de bien.
 */
function crearEncuestaVozCliente() {
  var form = FormApp.create('Antes de entrar al canal privado');

  form.setDescription(
    'Soy José. Leo personalmente todas las respuestas — no las lee un robot ni un equipo.\n\n' +
    'Son 5 preguntas abiertas. Las dos primeras son obligatorias; las otras tres, si ' +
    'tienes dos minutos, me ayudan muchísimo.\n\n' +
    'Escribe como hablas. No busco respuestas prolijas, busco las tuyas.\n\n' +
    'Al terminar te doy el enlace del canal privado de Telegram.'
  );

  // Las 5 preguntas, en orden. [texto, obligatoria]
  // NINGUNA lleva texto de ayuda a propósito: una pregunta que necesita ejemplos está
  // mal escrita, y los ejemplos contaminan el vocabulario que veníamos a buscar.
  var preguntas = [
    ['¿A qué te dedicas hoy? (escríbelo como lo pondrías en tu bio de Instagram)', true],
    ['¿Qué te dice la gente cuando les cuentas que eres periodista?', true],
    ['Si pudieras hacerle UNA sola pregunta a un periodista que hoy ya vive de esto, ¿cuál sería?', false],
    ['¿Hubo algo que casi te hace no comprar?', false],
    ['Si le tuvieras que explicar a un colega por WhatsApp qué es esto que acabas de comprar, ¿qué le escribirías?', false]
  ];

  preguntas.forEach(function (p) {
    form.addParagraphTextItem().setTitle(p[0]).setRequired(p[1]);
  });

  // EL GATE: el link del canal vive acá, después de enviar. Por eso no hace falta
  // ni una línea de código en la web — y por eso hay que sacar el botón directo de
  // /gracias, o el formulario queda opcional y no lo llena nadie.
  form.setConfirmationMessage(
    'Gracias, de verdad. Las leo todas.\n\n' +
    'Este es el canal privado: https://t.me/+ywAiiHyHe7wyYjRk\n\n' +
    'Nos vemos adentro. — José'
  );

  // Anónimo A PROPÓSITO: sin el nombre puesto, la pregunta 4 (por qué casi no compra)
  // se contesta con honestidad. Para robar una frase no hace falta saber quién la dijo.
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false); // exigir login de Google perdería respuestas
  form.setProgressBar(false);
  form.setShuffleQuestions(false);        // el orden importa: ver ENCUESTA-VOZ-CLIENTE.md

  // Hoja de respuestas, para poder leerlas después con el conector de Drive.
  var hoja = SpreadsheetApp.create('Encuesta voz del cliente — respuestas');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  Logger.log('1) FORMULARIO (este es el link que va en /gracias): ' + form.getPublishedUrl());
  Logger.log('2) EDITAR el formulario: ' + form.getEditUrl());
  Logger.log('3) RESPUESTAS: ' + hoja.getUrl());
}
