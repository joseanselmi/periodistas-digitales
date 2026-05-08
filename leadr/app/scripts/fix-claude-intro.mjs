import { createClient } from '@supabase/supabase-js'
import { BRAND, generateSlidesHTML } from './slide-helper.mjs'

const sb = createClient('https://ovwlsnnhiuoxoazyrhvt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo')

// Traer slides existentes y agregar diagram + body
const { data } = await sb.from('classes').select('slides_json').eq('id', 12).single()
const existingSlides = data.slides_json?.slides ?? []

// Insertar slide diagram después del checklist (posición 2)
const diagramSlide = {
  type: 'diagram',
  title: 'Cómo funciona Claude',
  subheading: 'Claude es un modelo de lenguaje grande entrenado por Anthropic. Procesá texto, analizá documentos y generá respuestas coherentes basadas en el contexto que vos le das. A diferencia de un buscador, no recupera información — la construye a partir de lo que aprendió y lo que vos le decís.',
  center: 'Claude (IA de Anthropic)',
  nodes: ['Recibe tu instrucción', 'Analiza el contexto', 'Genera una respuesta', 'Aprende de tus correcciones en la misma conversación'],
}

// Insertar después del slide tipo checklist
const checlistIdx = existingSlides.findIndex(s => s.type === 'checklist')
const insertAt = checlistIdx >= 0 ? checlistIdx + 1 : 1
const newSlides = [
  ...existingSlides.slice(0, insertAt),
  diagramSlide,
  ...existingSlides.slice(insertAt),
]

const body = `
<h2>Por qué Claude y no solo ChatGPT</h2>
<p>Cuando la mayoría de los periodistas escucha "IA para escribir", piensa en ChatGPT. Claude es menos conocido pero en muchos casos más útil para el trabajo periodístico. Fue desarrollado por Anthropic con un enfoque específico en respuestas precisas, seguras y honestas. Donde ChatGPT tiende a completar lo que cree que querés escuchar, Claude tiende a decirte cuando no sabe algo o cuando la pregunta tiene ambigüedades.</p>
<p>Para periodistas, esa diferencia importa. Una herramienta que reconoce sus propios límites es más confiable que una que siempre tiene una respuesta con total seguridad.</p>

<h2>Cómo acceder y crear tu cuenta</h2>
<p>Claude está disponible en claude.ai. Podés crear una cuenta gratuita con tu email. El plan gratuito tiene un límite de mensajes diarios — suficiente para empezar a explorar. El plan Pro ($20/mes) elimina esos límites y agrega acceso a los modelos más avanzados.</p>
<p>Una vez que creás tu cuenta, la interfaz es simple: un campo de texto donde escribís tu mensaje y Claude responde. No hay configuración técnica inicial. Podés empezar a usarlo en los primeros treinta segundos.</p>

<h2>La interfaz básica</h2>
<p>Claude funciona a través de conversaciones. Cada conversación tiene memoria dentro de sí misma: Claude recuerda lo que dijiste en los mensajes anteriores de la misma sesión. Si en el primer mensaje le explicás el contexto de tu nota, en los mensajes siguientes no necesitás repetirlo.</p>
<p>Las conversaciones no se conectan entre sí automáticamente — cada nueva conversación arranca desde cero. Para proyectos de largo aliento donde necesitás que Claude recuerde contexto entre sesiones, Claude tiene una función llamada Projects que vamos a ver en una clase más adelante.</p>

<h2>Qué puede hacer Claude para un periodista</h2>
<p>Las aplicaciones más directas para periodismo son cuatro. Primero, <strong>redacción asistida</strong>: le pasás tus notas y el ángulo que querés, y Claude genera un primer borrador. Vos lo editás y lo hacés tuyo — pero no arrancás de la hoja en blanco. Segundo, <strong>análisis de documentos</strong>: pegás el texto de un informe oficial, un expediente, un contrato, y pedís que identifique los puntos clave, las contradicciones, o los datos que te interesan.</p>
<p>Tercero, <strong>preparación de entrevistas</strong>: le describís al entrevistado y el tema, y Claude te sugiere preguntas desde distintos ángulos, incluyendo las que probablemente la fuente quiera evitar. Cuarto, <strong>reformateo de contenido</strong>: tenés una nota larga y necesitás versiones para distintos formatos — hilo de Twitter, posteo de Instagram, newsletter. Claude hace esas adaptaciones en segundos.</p>

<h2>Qué Claude no puede hacer</h2>
<p>Claude no tiene acceso a internet en tiempo real — a diferencia de Perplexity, no puede buscar información nueva. Su conocimiento tiene una fecha de corte. Si preguntás por eventos recientes, puede no tenerlos o confundirlos.</p>
<p>Tampoco inventa fuentes reales. Si le pedís que cite estudios o documentos, puede generar citas que parecen reales pero no lo son — un fenómeno llamado alucinación. Nunca publiques información que obtuviste de Claude sin verificarla en la fuente primaria.</p>

<h2>Tu primer uso — hacelo ahora</h2>
<p>La mejor forma de entender Claude es usarlo con un problema real. Abrí claude.ai, creá tu cuenta si no la tenés, y escribí este mensaje adaptado a tu situación: "Soy periodista. Estoy trabajando en una nota sobre [tema]. Tengo estas notas: [pegá tus notas]. Ayudame a identificar el ángulo más interesante y los puntos que merecen más desarrollo." La respuesta te va a mostrar qué puede hacer — y también sus límites.</p>
`

const html = generateSlidesHTML(newSlides, BRAND)
const path = `classes/${Date.now()}/index.html`
const { error: uploadError } = await sb.storage.from('slides').upload(path, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: false })
if (uploadError) { console.error('Upload error:', uploadError); process.exit(1) }
const slidesUrl = sb.storage.from('slides').getPublicUrl(path).data.publicUrl
const { error: dbError } = await sb.from('classes').update({ slides_url: slidesUrl, slides_json: { slides: newSlides, body } }).eq('id', 12)
if (dbError) { console.error('DB error:', dbError); process.exit(1) }
console.log('✓ ID 12 Claude intro — diagram + body agregados')
