import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ovwlsnnhiuoxoazyrhvt.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BRAND = {
  primary: '#22D3EE',
  secondary: '#7C3AED',
  bg: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
}

// ─── Slides ───────────────────────────────────────────────────────────────────

const slides = [
  {
    type: 'title',
    heading: 'Perplexity Pro en profundidad',
    subheading: 'La herramienta que lee internet por vos',
  },
  {
    type: 'checklist',
    title: 'Qué vas a aprender',
    items: [
      'Por qué Perplexity resuelve lo que Google no puede bajo presión de cierre',
      'Cómo formular preguntas que dan respuestas útiles — no solo links',
      'Los modos de búsqueda y cuándo usar cada uno',
      'Los 4 casos de uso concretos que van a cambiar tu rutina diaria',
      'Cómo integrar Perplexity al sistema Notion + Claude',
    ],
  },
  {
    type: 'diagram',
    title: 'Cómo encaja en tu flujo de trabajo',
    subheading:
      'Perplexity es la entrada de información del stack. Lo que encontrás acá alimenta Notion, y ese material procesado llega a Claude para el borrador final. Cada herramienta tiene un rol claro.',
    center: 'Tu cobertura periodística',
    nodes: [
      'Perplexity Pro (búsqueda)',
      'Notion (organización)',
      'Claude Pro (redacción)',
      'Publicación final',
    ],
  },
  {
    type: 'content',
    title: 'El problema real bajo deadline',
    subheading:
      'Google te da links — vos hacés el trabajo de síntesis. Cuando cubrís una sesión del congreso y necesitás verificar un dato en dos minutos, no podés abrir cinco pestañas. Perplexity lee esas fuentes por vos y te devuelve la respuesta con cita al documento original. Esos minutos que ahorrás por búsqueda, en un día de cobertura intensa, son horas.',
  },
  {
    type: 'bullets',
    title: 'Cómo preguntar bien',
    bullets: [
      '❌ "inflación Argentina" → resultado genérico, poco útil',
      '✅ "¿Cuál fue la inflación de Argentina en marzo 2025 según el INDEC?" → dato exacto con fuente',
      'Regla: preguntá como le preguntarías a un colega que sabe del tema',
      'Incluí siempre: sujeto + período + fuente que te interesa',
    ],
  },
  {
    type: 'bullets',
    title: 'Modos de búsqueda (Focus)',
    bullets: [
      'Web — búsqueda general, el 80% del tiempo',
      'Académico — papers, estudios y reportes de organismos con citas formales',
      'YouTube — busca dentro de videos, útil para declaraciones y entrevistas',
      'Reddit — foros y opiniones, para entender el clima de debate de un tema',
    ],
  },
  {
    type: 'bullets',
    title: 'Los 4 usos que cambian tu rutina',
    bullets: [
      'Briefing matutino: resumen del beat en 2 minutos con filtro de 48h',
      'Verificación: confirmás o corregís un dato antes de publicar en 30 segundos',
      'Contexto pre-entrevista: perfil completo de persona o institución en 60 segundos',
      'Cronología: reconstruís la historia de un tema con fuentes para cada hito',
    ],
  },
  {
    type: 'practice',
    title: 'Briefing matutino — paso a paso',
    steps: [
      'Abrí perplexity.ai y asegurate de estar en modo Web',
      'Escribí: "¿Qué novedades hubo sobre [tu tema] en [país] en las últimas 48 horas?"',
      'Activá el filtro de fecha: últimas 48 horas (menú debajo del buscador)',
      'Revisá las citas numeradas — hacé clic en las que te interesen para ir a la fuente',
      'Copiá los datos relevantes a tu Notion con la fuente correspondiente',
    ],
    tip: 'Guardá las preguntas que mejor funcionan para tu beat. En dos semanas tenés una biblioteca de prompts probados.',
  },
  {
    type: 'errors',
    title: 'Lo que Perplexity NO puede hacer',
    bullets: [
      'Publicar sin verificar la fuente — puede malinterpretar una cita',
      'Analizar documentos que vos le pasás — para eso está Claude',
      'Reemplazar el trabajo directo con fuentes — es punto de partida, no destino',
      'Garantizar actualización en tiempo real — puede tener lag en temas muy recientes',
    ],
  },
  {
    type: 'exercise',
    title: 'Tu ejercicio de hoy',
    subheading:
      'Hacé las tres búsquedas antes de cerrar esta clase y compará el tiempo con lo que tardabas antes.',
    task: '1. Briefing: preguntá sobre tu tema de cobertura con filtro 48h\n2. Verificación: confirmá un dato que usaste recientemente\n3. Pre-entrevista: buscá contexto de alguien que vas a entrevistar esta semana',
  },
  {
    type: 'resources',
    title: 'Recursos para seguir',
    items: [
      { text: 'Perplexity Pro — plan de pago con Pro Search y Spaces', url: 'https://www.perplexity.ai/pro', tag: 'Herramienta' },
      { text: 'Reuters Institute — periodismo, IA y automatización', url: 'https://reutersinstitute.politics.ox.ac.uk/journalism-ai-and-automation', tag: 'Guía' },
      { text: 'Poynter — verificación de información en la era de la IA', url: 'https://www.poynter.org/fact-checking', tag: 'Artículo' },
      { text: 'Notion — base de datos para gestión editorial', url: 'https://www.notion.so', tag: 'Herramienta' },
    ],
  },
  {
    type: 'bullets',
    title: 'Lo que te llevás de esta clase',
    bullets: [
      'Perplexity acorta el tiempo de búsqueda — no reemplaza tu criterio periodístico',
      'La calidad de la pregunta determina la calidad de la respuesta',
      'El modo Académico es clave para temas con base científica o técnica',
      'Siempre verificás en la fuente primaria antes de publicar cualquier dato',
      'Perplexity es la entrada del sistema → Notion → Claude → publicación',
    ],
  },
]

// ─── Body HTML ────────────────────────────────────────────────────────────────

const body = `
<h2>Por qué Perplexity y no solo Google</h2>
<p>Todos usamos Google. Lo usamos desde hace veinte años y funciona. Así que la pregunta real no es "¿qué es Perplexity?" — la pregunta es para qué sirve que Google no puede cubrir. Porque son herramientas distintas que resuelven problemas distintos, y entender esa diferencia es lo que determina si esta herramienta te cambia la rutina o se queda instalada sin usar.</p>
<p>Google es un índice. Te muestra qué páginas existen sobre un tema. Vos decidís cuáles abrir, cuáles leer, qué información extraer, cómo sintetizarla. Ese proceso, que parece automático porque lo hacés hace años, en realidad te lleva tiempo. Tiempo que bajo presión de cierre no siempre tenés.</p>
<p>Perplexity hace ese trabajo de síntesis por vos. Toma las fuentes más relevantes para tu pregunta, las lee, y te devuelve una respuesta redactada con cada dato atribuido a su fuente. No tenés que abrir cinco pestañas. No tenés que comparar tres notas para ver si dicen lo mismo. La síntesis ya está hecha. Vos verificás y decidís.</p>

<h2>Cómo funciona por dentro</h2>
<p>Cuando escribís una pregunta en Perplexity, el sistema identifica las fuentes más relevantes en la web, extrae los fragmentos pertinentes, los sintetiza en una respuesta coherente y numera cada afirmación con su fuente original. Ese número es clickeable — te lleva directo al párrafo exacto del documento donde se basa esa afirmación.</p>
<p>Eso es lo que lo hace útil para periodistas. No te obliga a confiar ciegamente en la síntesis. Te da el camino para ir a la fuente si necesitás verificar. Y en la mayoría de los casos de uso cotidiano — briefing matutino, contexto rápido, verificación simple — esa síntesis es suficiente para arrancar.</p>

<h2>La diferencia entre buscar y preguntar</h2>
<p>Esta es la habilidad más importante que vas a desarrollar con Perplexity. La herramienta está diseñada para responder preguntas, no para interpretar palabras clave como hace Google.</p>
<p>Cuando escribís "inflación Argentina", Perplexity hace su mejor intento de adivinar qué querés saber. A veces acierta. Muchas veces no. Te devuelve algo genérico que no sirve. Cuando escribís "¿Cuál fue la inflación de Argentina en marzo 2025 según el INDEC y cómo se compara con el mes anterior?", Perplexity tiene suficiente contexto para darte exactamente lo que necesitás. Dato, fuente, comparación.</p>
<p>La regla práctica: preguntá como le preguntarías a un colega que sabe del tema. Con sujeto, verbo, contexto específico y la fuente que te interesa. No como escribís en el buscador.</p>

<h2>Los modos de búsqueda y cuándo usarlos</h2>
<p>Perplexity tiene modos llamados Focus que cambian el universo de fuentes donde busca. Para periodistas, dos importan especialmente.</p>
<p>El <strong>modo Web</strong> es el default. Busca en toda la web y es el que vas a usar el 80% del tiempo para coberturas de actualidad, verificación de datos recientes y contexto general.</p>
<p>El <strong>modo Académico</strong> es el que más diferencia hace cuando cubrís temas con base científica. Salud, medio ambiente, economía, educación. En modo Académico, Perplexity busca prioritariamente en publicaciones científicas, papers revisados por pares, reportes de organismos internacionales y fuentes académicas verificadas. La diferencia entre citar una nota de blog y citar un estudio del Lancet es enorme, y el modo Académico te lleva directamente a esas fuentes.</p>
<p>Los modos <strong>YouTube</strong> y <strong>Reddit</strong> son útiles para entender el clima de opinión sobre un tema, ver cómo se está discutiendo algo en foros especializados, o encontrar testimonios que las fuentes oficiales no cubren.</p>

<h2>Filtrar por fecha: el paso que casi todos se saltan</h2>
<p>Perplexity sin filtro de fecha puede devolverte resultados de hace dos o tres años mezclados con resultados de hoy. Para coberturas de actualidad, eso es un problema. El filtro de fecha está en el menú de opciones justo debajo del campo de búsqueda. Podés elegir últimas 24 horas, última semana, último mes, o definir un rango personalizado.</p>
<p>Para el briefing matutino sobre tu beat, usás 24–48 horas. Para reconstruir la historia de un tema, definís el rango que te interesa. Este ajuste de diez segundos hace que los resultados sean significativamente más útiles para trabajo de actualidad.</p>

<h2>Los cuatro usos concretos que van a cambiar tu rutina</h2>
<p><strong>El briefing de la mañana.</strong> Antes de arrancar el día, escribís una pregunta sobre tu tema de cobertura con filtro de 48 horas. "¿Qué novedades hubo sobre el conflicto docente en la provincia de Buenos Aires en las últimas 48 horas?" En dos minutos tenés el panorama del día con fuentes. No reemplaza tu monitoreo completo — te da el punto de partida y te ahorra la media hora de rastreo inicial.</p>
<p>Sofía cubre salud pública. Su rutina de mañana era abrir doce portales antes del primer pitch del día. Ahora escribe una pregunta en Perplexity con el filtro de 48 horas y tiene el panorama en dos minutos. Después profundiza solo en lo que le interesa.</p>
<p><strong>La verificación antes de publicar.</strong> Alguien te dice un dato. Antes de incluirlo en tu nota, lo preguntás en Perplexity. "¿Cuál es la tasa de homicidios en Argentina en 2024 según fuentes oficiales?" Si el dato que te dieron es correcto, Perplexity te da la fuente para citarla. Si es incorrecto, te muestra el número real. Treinta segundos que pueden salvarte de un error que después no tiene corrección limpia.</p>
<p><strong>El contexto antes de una entrevista.</strong> Vas a hablar con alguien que no conocés bien. "¿Quién es [nombre], cuál es su trayectoria y en qué controversias estuvo involucrado?" Un minuto y tenés el perfil básico. La entrevista arranca de otro nivel cuando llegás con contexto. Las preguntas son más específicas, más difíciles de esquivar.</p>
<p><strong>Reconstruir la historia de un tema.</strong> Cuando necesitás cronología — un proyecto de ley que lleva tres años, una disputa sindical con varios capítulos. "¿Cuáles fueron los hitos principales del conflicto entre [empresa] y los trabajadores de [sector] entre 2022 y 2025?" Te devuelve una línea de tiempo con fuentes para cada evento. Es el esqueleto sobre el que construís tu propia cronología verificando cada punto.</p>

<h2>Lo que Perplexity no puede hacer</h2>
<p>Siendo honesto: Perplexity puede equivocarse. El modelo puede leer mal una fuente, malinterpretar un dato en contexto, o sintetizar de forma imprecisa algo que en el documento original era más matizado. Por eso siempre hacés clic en la cita y leés el fragmento original antes de usar ese dato en una nota.</p>
<p>Tampoco sirve para analizar documentos que vos le pasás. Si tenés un expediente de 80 páginas, un informe presupuestario o un contrato que necesitás procesar, la herramienta correcta es Claude. Perplexity es para búsqueda y síntesis de información pública en la web. Claude es para procesar material que vos ya tenés.</p>

<h2>Las funciones Pro que realmente justifican el costo</h2>
<p>La versión gratuita cubre los casos de uso básicos. El plan Pro ($20/mes) agrega tres cosas que para un periodista activo hacen diferencia.</p>
<p><strong>Pro Search</strong> es una búsqueda más profunda que consulta más fuentes y da respuestas más completas. Lo usás cuando el tema es complejo o cuando la respuesta estándar no te convence.</p>
<p><strong>Spaces</strong> son proyectos de investigación persistentes. Creás un espacio para una cobertura larga — una causa judicial, una investigación de varios meses — y ese espacio recuerda el contexto de tus búsquedas anteriores sobre ese tema. No tenés que repetir el contexto cada vez.</p>
<p>El <strong>límite de consultas diarias</strong> en la versión gratuita lo alcanzás rápido en un día de cobertura intensa. Pro elimina ese techo.</p>

<h2>Tu ejercicio</h2>
<p>Esta semana, reemplazá Google por Perplexity en exactamente tres situaciones. Primero: mañana a primera hora, escribí tu briefing matutino con filtro de 48 horas y medí cuánto tardás. Segundo: la próxima vez que alguien te pase un dato antes de publicar, verificalo en Perplexity antes de incluirlo. Tercero: antes de tu próxima entrevista, buscá contexto sobre la persona o institución con la que vas a hablar.</p>
<p>Después de los tres usos, decidís si lo incorporás a tu rutina. No te pido que confíes en mi palabra — te pido que lo midas vos.</p>

<h2>Recursos para seguir aprendiendo</h2>
<p><a href="https://www.perplexity.ai/pro">Perplexity Pro</a> — el plan de pago con acceso a Pro Search, Spaces y sin límite de consultas diarias. Vale la pena si lo usás más de 5 veces por día.</p>
<p><a href="https://reutersinstitute.politics.ox.ac.uk/journalism-ai-and-automation">Reuters Institute — Periodismo, IA y automatización</a> — investigación académica sobre cómo las redacciones reales están adoptando herramientas de IA. Útil para entender el contexto más amplio.</p>
<p><a href="https://www.poynter.org/fact-checking">Poynter — verificación en la era de la IA</a> — guías prácticas sobre cómo verificar información cuando las herramientas de IA pueden generar contenido falso convincente.</p>
`

// ─── Slide HTML generator (inline desde slides-html.ts) ───────────────────────

function slideHtml(slide, brand, index, total) {
  const progress = Math.round(((index + 1) / total) * 100)

  let content = ''

  switch (slide.type) {
    case 'title':
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:4rem;">
          <div style="width:48px;height:4px;background:${brand.primary};border-radius:2px;margin-bottom:2rem;"></div>
          <h1 style="font-size:2.8rem;font-weight:700;color:${brand.text};line-height:1.2;margin-bottom:1rem;max-width:800px;">${slide.heading ?? ''}</h1>
          ${slide.subheading ? `<p style="font-size:1.25rem;color:${brand.primary};opacity:0.8;">${slide.subheading}</p>` : ''}
        </div>`
      break

    case 'content':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
          <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.5rem;">${slide.title ?? ''}</h2>
          ${slide.subheading ? `<p style="font-size:1.1rem;color:${brand.text};opacity:0.85;line-height:1.8;">${slide.subheading}</p>` : ''}
        </div>`
      break

    case 'bullets':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
          <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? ''}</h2>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
            ${(slide.bullets ?? []).map(b => `
              <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                <span style="width:8px;height:8px;border-radius:50%;background:${brand.primary};margin-top:0.45rem;flex-shrink:0;"></span>
                ${b}
              </li>`).join('')}
          </ul>
        </div>`
      break

    case 'checklist':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
          <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? 'Qué vas a aprender'}</h2>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
            ${(slide.items ?? []).map(item => {
              const text = typeof item === 'string' ? item : item.text
              return `
              <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};line-height:1.5;">
                <span style="width:20px;height:20px;border-radius:50%;background:${brand.primary}25;border:1.5px solid ${brand.primary};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="${brand.primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                ${text}
              </li>`
            }).join('')}
          </ul>
        </div>`
      break

    case 'practice':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;">
          <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.75rem;">${slide.title ?? 'Ejemplo práctico'}</h2>
          <ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.steps ?? []).map((step, i) => `
              <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                <span style="width:26px;height:26px;border-radius:8px;background:${brand.primary};color:${brand.bg};font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</span>
                ${step}
              </li>`).join('')}
          </ol>
          ${slide.tip ? `
            <div style="margin-top:1.5rem;padding:1rem 1.25rem;background:${brand.primary}15;border:1px solid ${brand.primary}40;border-radius:10px;font-size:0.9rem;color:${brand.text};opacity:0.9;">
              <span style="color:${brand.primary};font-weight:600;">💡 Tip: </span>${slide.tip}
            </div>` : ''}
        </div>`
      break

    case 'errors':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;">
          <h2 style="font-size:2rem;font-weight:700;color:#F87171;margin-bottom:2rem;">${slide.title ?? 'Errores comunes'}</h2>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">
            ${(slide.bullets ?? []).map(b => `
              <li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;">
                <span style="width:20px;height:20px;border-radius:50%;background:#EF444425;border:1.5px solid #EF4444;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;font-size:0.7rem;color:#EF4444;font-weight:700;">✕</span>
                ${b}
              </li>`).join('')}
          </ul>
        </div>`
      break

    case 'exercise':
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:3rem;text-align:center;">
          <div style="background:${brand.primary}10;border:1px solid ${brand.primary}35;border-radius:20px;padding:2.5rem 3rem;max-width:640px;width:100%;">
            <div style="font-size:2.5rem;margin-bottom:1rem;">🎯</div>
            <h2 style="font-size:1.75rem;font-weight:700;color:${brand.text};margin-bottom:0.75rem;">${slide.title ?? 'Tu ejercicio'}</h2>
            ${slide.subheading ? `<p style="font-size:1rem;color:${brand.text};opacity:0.7;line-height:1.6;margin-bottom:1.5rem;">${slide.subheading}</p>` : ''}
            ${slide.task ? `
              <div style="background:${brand.bg};border-radius:12px;padding:1.25rem 1.5rem;border:1px solid ${brand.primary}25;text-align:left;">
                <p style="color:${brand.primary};font-size:0.95rem;font-weight:500;line-height:1.8;white-space:pre-line;">${slide.task}</p>
              </div>` : ''}
          </div>
        </div>`
      break

    case 'resources':
      content = `
        <div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;">
          <h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title ?? 'Recursos'}</h2>
          <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">
            ${(slide.items ?? []).map((item, i) => {
              const isObj = typeof item === 'object' && item !== null
              const text = isObj ? item.text : String(item)
              const url = isObj ? item.url : undefined
              const tag = isObj ? item.tag : undefined
              return `
              <li style="display:flex;align-items:center;gap:1rem;font-size:1rem;color:${brand.text};padding:0.75rem 1rem;background:${brand.bg};border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                <span style="color:${brand.primary};font-weight:700;font-size:0.8rem;min-width:22px;">${String(i + 1).padStart(2, '0')}</span>
                <span style="flex:1;opacity:0.85;">${url ? `<a href="${url}" target="_blank" style="color:${brand.text};text-decoration:underline;text-underline-offset:3px;opacity:0.85;">${text}</a>` : text}</span>
                ${tag ? `<span style="font-size:0.7rem;padding:0.2rem 0.6rem;background:${brand.primary}20;color:${brand.primary};border-radius:20px;white-space:nowrap;">${tag}</span>` : ''}
              </li>`
            }).join('')}
          </ul>
        </div>`
      break

    case 'diagram': {
      const nodes = slide.nodes ?? []
      const cols = nodes.length <= 3 ? nodes.length : Math.ceil(nodes.length / 2)
      const hasText = !!slide.subheading
      content = `
        <div style="display:flex;flex-direction:column;height:100%;padding:2.25rem 3rem;gap:1rem;box-sizing:border-box;overflow:auto;">
          <h2 style="font-size:1.5rem;font-weight:700;color:${brand.text};flex-shrink:0;">${slide.title ?? ''}</h2>
          ${hasText ? `<p style="font-size:0.95rem;color:${brand.text};opacity:0.75;line-height:1.65;flex-shrink:0;">${slide.subheading}</p>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;flex:1;justify-content:center;">
            <div style="background:${brand.primary};color:${brand.bg};padding:0.55rem 1.75rem;border-radius:12px;font-size:0.95rem;font-weight:700;text-align:center;box-shadow:0 0 20px ${brand.primary}44;flex-shrink:0;">
              ${slide.center ?? ''}
            </div>
            <div style="width:2px;height:14px;background:linear-gradient(${brand.primary},${brand.primary}00);flex-shrink:0;"></div>
            <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:0.6rem;width:100%;">
              ${nodes.map((n, i) => `
                <div style="background:${brand.bg};border:1px solid ${brand.primary}35;border-radius:10px;padding:0.6rem 0.75rem;text-align:center;font-size:0.8rem;color:${brand.text};opacity:0.9;">
                  <span style="display:block;width:18px;height:18px;border-radius:50%;background:${brand.primary}20;border:1.5px solid ${brand.primary}60;color:${brand.primary};font-size:0.6rem;font-weight:700;line-height:18px;text-align:center;margin:0 auto 0.3rem;">${i + 1}</span>
                  ${n}
                </div>`).join('')}
            </div>
          </div>
        </div>`
      break
    }

    default:
      content = `<div style="padding:3.5rem 4rem;"><p style="color:${brand.text};">${JSON.stringify(slide)}</p></div>`
  }

  return `
    <div class="slide" style="width:100%;height:100%;background:${brand.surface};border-radius:16px;overflow:hidden;position:relative;flex-direction:column;">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.06);">
        <div style="height:100%;width:${progress}%;background:${brand.primary};transition:width 0.3s;"></div>
      </div>
      <div style="position:absolute;bottom:1.5rem;right:2rem;font-size:0.75rem;color:${brand.text};opacity:0.3;font-family:monospace;">
        ${index + 1} / ${total}
      </div>
      ${content}
    </div>`
}

function generateSlidesHTML(slides, brand) {
  const slidesHtml = slides.map((s, i) => slideHtml(s, brand, i, slides.length)).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slides</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${brand.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    #container { width: min(900px, 96vw); aspect-ratio: 16/9; position: relative; }
    .slide { display: none; width: 100%; height: 100%; }
    .slide.active { display: flex; }
    #nav { position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; align-items: center; background: rgba(2,6,23,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.4rem 0.5rem; backdrop-filter: blur(8px); }
    #nav button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: ${brand.text}; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: background 0.15s; display: flex; align-items: center; gap: 0.4rem; min-height: 36px; }
    #nav button:hover:not(:disabled) { background: rgba(255,255,255,0.14); }
    #nav button:disabled { opacity: 0.25; cursor: default; }
    #counter { color: ${brand.text}; opacity: 0.45; font-size: 0.75rem; min-width: 3.5rem; text-align: center; }
    #hint { position: fixed; bottom: 4.5rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.4rem; opacity: 1; transition: opacity 0.5s; pointer-events: none; }
    #hint.hidden { opacity: 0; }
    #hint-text { color: ${brand.primary}; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
    #hint-arrow { width: 20px; height: 20px; border-right: 2px solid ${brand.primary}; border-bottom: 2px solid ${brand.primary}; transform: rotate(45deg); animation: bounce 1s ease-in-out infinite; opacity: 0.7; }
    @keyframes bounce { 0%,100% { transform: rotate(45deg) translateY(0); } 50% { transform: rotate(45deg) translateY(4px); } }
    #tap-prev, #tap-next { position: fixed; top: 0; bottom: 4rem; width: 20%; cursor: pointer; z-index: 10; }
    #tap-prev { left: 0; }
    #tap-next { right: 0; }
    #progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: ${brand.primary}; transition: width 0.3s ease; opacity: 0.7; }
  </style>
</head>
<body>
  <div id="progress-bar"></div>
  <div id="container">${slidesHtml}</div>
  <div id="tap-prev" onclick="go(-1)"></div>
  <div id="tap-next" onclick="go(1)"></div>
  <div id="hint">
    <span id="hint-text">Tocá el lado derecho o usá las flechas para avanzar</span>
    <div id="hint-arrow"></div>
  </div>
  <div id="nav">
    <button id="prev" onclick="go(-1)">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      Anterior
    </button>
    <span id="counter">1 / ${slides.length}</span>
    <button id="next" onclick="go(1)">
      Siguiente
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>
  <script>
    let cur = 0;
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;
    let hintDismissed = false;
    function dismissHint() {
      if (hintDismissed) return;
      hintDismissed = true;
      document.getElementById('hint').classList.add('hidden');
    }
    function show(n) {
      slides[cur].classList.remove('active');
      cur = Math.max(0, Math.min(n, total - 1));
      slides[cur].classList.add('active');
      document.getElementById('counter').textContent = (cur + 1) + ' / ' + total;
      document.getElementById('prev').disabled = cur === 0;
      document.getElementById('next').disabled = cur === total - 1;
      document.getElementById('progress-bar').style.width = ((cur + 1) / total * 100) + '%';
      dismissHint();
    }
    function go(d) { show(cur + d); }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
    });
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); }
    }, { passive: true });
    setTimeout(dismissHint, 4000);
    show(0);
  </script>
</body>
</html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Buscar grupo "Tecnología para Periodistas"
  console.log('Buscando grupo...')
  const { data: groups, error: groupError } = await supabase
    .from('groups')
    .select('id, name')
    .ilike('name', '%tecnolog%')

  if (groupError) { console.error('Error buscando grupo:', groupError); process.exit(1) }
  if (!groups?.length) { console.error('Grupo no encontrado'); process.exit(1) }

  const group = groups[0]
  console.log(`Grupo encontrado: "${group.name}" (id: ${group.id})`)

  // 2. Generar HTML
  console.log('Generando HTML de slides...')
  const html = generateSlidesHTML(slides, BRAND)

  // 3. Subir a Supabase Storage
  console.log('Subiendo slides a Storage...')
  const timestamp = Date.now()
  const storagePath = `classes/${timestamp}/index.html`

  const { error: uploadError } = await supabase.storage
    .from('slides')
    .upload(storagePath, Buffer.from(html, 'utf-8'), {
      contentType: 'text/html',
      upsert: false,
    })

  if (uploadError) { console.error('Error subiendo slides:', uploadError); process.exit(1) }

  const slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl
  console.log('Slides URL:', slidesUrl)

  // 4. Insertar clase en DB
  console.log('Creando clase en base de datos...')
  const { data: newClass, error: dbError } = await supabase
    .from('classes')
    .insert({
      title: 'Perplexity Pro en profundidad',
      description: 'Dominá la herramienta de búsqueda con IA que lee internet por vos. Briefings en 2 minutos, verificación en 30 segundos, contexto antes de cada entrevista.',
      group_id: group.id,
      plan_required: 'pro',
      slides_url: slidesUrl,
      slides_json: { slides, body },
      status: 'published',
    })
    .select()
    .single()

  if (dbError) { console.error('Error creando clase:', dbError); process.exit(1) }

  console.log('✓ Clase creada con id:', newClass.id)
  console.log('✓ Listo — buscala en /dashboard o /admin/clases')
}

main()
