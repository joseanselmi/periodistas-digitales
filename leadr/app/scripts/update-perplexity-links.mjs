import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://ovwlsnnhiuoxoazyrhvt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo'
)

const goodResources = [
  { text: 'Perplexity Pro — Pro Search, Spaces y sin límite de consultas diarias', url: 'https://www.perplexity.ai/pro', tag: 'Herramienta' },
  { text: 'Instituto RTVE — herramientas de IA que todo periodista debería conocer en 2025', url: 'https://haz.institutortve.com/herramientas-ia-periodista/', tag: 'Guía' },
  { text: 'Lluís Codina — guía completa de Perplexity con capturas y casos reales', url: 'https://www.lluiscodina.com/perplexity-ai/', tag: 'Artículo' },
  { text: 'OpenWebinars — Perplexity Deep Research: informes exhaustivos en minutos', url: 'https://openwebinars.net/blog/perplexity-deep-research', tag: 'Artículo' },
]

const newBody = `
<h2>Por qué Perplexity y no solo Google</h2>
<p>Todos usamos Google. Lo usamos desde hace veinte años y funciona. Así que la pregunta real no es qué es Perplexity — la pregunta es para qué sirve que Google no puede cubrir. Porque son herramientas distintas que resuelven problemas distintos, y entender esa diferencia es lo que determina si esta herramienta te cambia la rutina o se queda instalada sin usar.</p>
<p>Google es un índice. Te muestra qué páginas existen sobre un tema. Vos decidís cuáles abrir, cuáles leer, qué información extraer, cómo sintetizarla. Ese proceso, que parece automático porque lo hacés hace años, en realidad te lleva tiempo. Tiempo que bajo presión de cierre no siempre tenés.</p>
<p>Perplexity hace ese trabajo de síntesis por vos. Toma las fuentes más relevantes para tu pregunta, las lee, y te devuelve una respuesta redactada con cada dato atribuido a su fuente. No tenés que abrir cinco pestañas. No tenés que comparar tres notas para ver si dicen lo mismo. La síntesis ya está hecha. Vos verificás y decidís.</p>

<h2>Cómo funciona por dentro</h2>
<p>Cuando escribís una pregunta en Perplexity, el sistema identifica las fuentes más relevantes en la web, extrae los fragmentos pertinentes, los sintetiza en una respuesta coherente y numera cada afirmación con su fuente original. Ese número es clickeable — te lleva directo al párrafo exacto del documento donde se basa esa afirmación.</p>
<p>Eso es lo que lo hace útil para periodistas. No te obliga a confiar ciegamente en la síntesis. Te da el camino para ir a la fuente si necesitás verificar. Y en la mayoría de los casos de uso cotidiano — briefing matutino, contexto rápido, verificación simple — esa síntesis es suficiente para arrancar.</p>

<h2>La diferencia entre buscar y preguntar</h2>
<p>Esta es la habilidad más importante que vas a desarrollar con Perplexity. La herramienta está diseñada para responder preguntas, no para interpretar palabras clave como hace Google.</p>
<p>Cuando escribís <strong>inflación Argentina</strong>, Perplexity hace su mejor intento de adivinar qué querés saber. A veces acierta. Muchas veces no. Cuando escribís <strong>¿Cuál fue la inflación de Argentina en marzo 2025 según el INDEC y cómo se compara con el mes anterior?</strong>, Perplexity tiene suficiente contexto para darte exactamente lo que necesitás. Dato, fuente, comparación.</p>
<p>La regla práctica: preguntá como le preguntarías a un colega que sabe del tema. Con sujeto, verbo, contexto específico y la fuente que te interesa. No como escribís en el buscador.</p>

<h2>Los modos de búsqueda y cuándo usarlos</h2>
<p>Perplexity tiene modos llamados Focus que cambian el universo de fuentes donde busca. Para periodistas, dos importan especialmente.</p>
<p>El <strong>modo Web</strong> es el default. Busca en toda la web y es el que vas a usar el 80% del tiempo para coberturas de actualidad, verificación de datos recientes y contexto general.</p>
<p>El <strong>modo Académico</strong> es el que más diferencia hace cuando cubrís temas con base científica. Salud, medio ambiente, economía, educación. En modo Académico, Perplexity busca prioritariamente en publicaciones científicas, papers revisados por pares y reportes de organismos internacionales. La diferencia entre citar una nota de blog y citar un estudio con peer review es enorme, y el modo Académico te lleva directamente a esas fuentes.</p>
<p>Los modos <strong>YouTube</strong> y <strong>Reddit</strong> son útiles para entender el clima de opinión sobre un tema, o encontrar testimonios que las fuentes oficiales no cubren.</p>

<h2>Filtrar por fecha: el paso que casi todos se saltan</h2>
<p>Perplexity sin filtro de fecha puede devolverte resultados de hace dos o tres años mezclados con resultados de hoy. Para coberturas de actualidad, eso es un problema. El filtro de fecha está en el menú de opciones justo debajo del campo de búsqueda. Podés elegir últimas 24 horas, última semana, último mes, o definir un rango personalizado.</p>
<p>Para el briefing matutino sobre tu beat, usás 24-48 horas. Para reconstruir la historia de un tema, definís el rango que te interesa. Este ajuste de diez segundos hace que los resultados sean significativamente más útiles para trabajo de actualidad.</p>

<h2>Los cuatro usos que van a cambiar tu rutina</h2>
<p><strong>El briefing de la mañana.</strong> Antes de arrancar el día, escribís una pregunta sobre tu tema de cobertura con filtro de 48 horas. En dos minutos tenés el panorama del día con fuentes. No reemplaza tu monitoreo completo — te da el punto de partida y te ahorra la media hora de rastreo inicial.</p>
<p><strong>La verificación antes de publicar.</strong> Alguien te dice un dato. Antes de incluirlo en tu nota, lo preguntás en Perplexity. Si el dato es correcto, Perplexity te da la fuente para citarla. Si es incorrecto, te muestra el número real. Treinta segundos que pueden salvarte de un error que después no tiene corrección limpia.</p>
<p><strong>El contexto antes de una entrevista.</strong> Vas a hablar con alguien que no conocés bien. Un minuto y tenés el perfil básico: trayectoria, declaraciones recientes, controversias. La entrevista arranca de otro nivel cuando llegás con contexto.</p>
<p><strong>Reconstruir la historia de un tema.</strong> Cuando necesitás cronología — un proyecto de ley que lleva tres años, una disputa sindical con varios capítulos. Perplexity te devuelve una línea de tiempo con fuentes para cada evento. Es el esqueleto sobre el que construís tu propia cronología verificando cada punto.</p>

<h2>Lo que Perplexity no puede hacer</h2>
<p>Siendo honesto: Perplexity puede equivocarse. El modelo puede leer mal una fuente o sintetizar de forma imprecisa algo que en el documento original era más matizado. Por eso siempre hacés clic en la cita y leés el fragmento original antes de usar ese dato en una nota.</p>
<p>Tampoco sirve para analizar documentos que vos le pasás. Si tenés un expediente de 80 páginas, la herramienta correcta es Claude. Perplexity es para búsqueda y síntesis de información pública en la web.</p>

<h2>Las funciones Pro que justifican el costo</h2>
<p><strong>Pro Search</strong> hace una búsqueda más profunda que consulta más fuentes y da respuestas más completas. Lo usás cuando el tema es complejo o cuando la respuesta estándar no te convence.</p>
<p><strong>Spaces</strong> son proyectos de investigación persistentes. Creás un espacio para una cobertura larga y ese espacio recuerda el contexto de tus búsquedas anteriores sobre ese tema. No tenés que repetir el contexto cada vez.</p>
<p>El límite de consultas diarias en la versión gratuita lo alcanzás rápido en un día de cobertura intensa. Pro lo elimina.</p>

<h2>Tu ejercicio</h2>
<p>Esta semana reemplazá Google por Perplexity en tres situaciones. Primero: el briefing matutino con filtro de 48 horas. Segundo: verificar un dato antes de publicarlo. Tercero: contexto sobre alguien que vas a entrevistar. Después de los tres usos, decidís si lo incorporás a tu rutina.</p>

<h2>Recursos para seguir aprendiendo</h2>
<p><a href="https://www.perplexity.ai/pro">Perplexity Pro</a> — el plan de pago con acceso a Pro Search, Spaces y sin límite de consultas diarias. Vale la pena si lo usás más de 5 veces por día.</p>
<p><a href="https://haz.institutortve.com/herramientas-ia-periodista/">Instituto RTVE — Herramientas de IA para periodistas 2025</a> — listado actualizado con casos de uso concretos para redacciones. Incluye Perplexity, Claude, ChatGPT y herramientas de transcripción y edición.</p>
<p><a href="https://www.lluiscodina.com/perplexity-ai/">Lluís Codina — Guía completa de Perplexity AI</a> — análisis en profundidad con capturas del proceso. Escrito para investigadores y periodistas que necesitan entender cómo funciona la herramienta por dentro.</p>
<p><a href="https://openwebinars.net/blog/perplexity-deep-research">OpenWebinars — Perplexity Deep Research</a> — explica la función de investigación profunda: cómo genera informes estructurados analizando múltiples fuentes en minutos, con comparativa frente a ChatGPT y Gemini.</p>
`

const { data: current } = await sb.from('classes').select('slides_json').eq('id', 39).single()

const slides = current.slides_json.slides.map(s => {
  if (s.type !== 'resources') return s
  return { ...s, items: goodResources }
})

const { error } = await sb.from('classes').update({
  slides_json: { slides, body: newBody }
}).eq('id', 39)

if (error) console.error('Error:', error)
else console.log('✓ Body y slides actualizados con links verificados')
