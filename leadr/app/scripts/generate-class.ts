import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { generateSlidesHTML } from '../lib/slides-html'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

const SYSTEM_PROMPT = `Eres un experto en educación digital y periodismo. Generas clases completas, visuales y detalladas pensadas para periodistas tradicionales de 35 a 60 años que están migrando al mundo digital.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

El JSON tiene esta estructura:
{
  "title": "Título de la clase",
  "description": "Descripción de 2-3 oraciones",
  "slides": [...],
  "body": "...artículo completo en HTML..."
}

═══════════════════════════════
CAMPO "slides" — 11 a 14 slides.
═══════════════════════════════

Orden obligatorio:
1. type:"title" — heading + subheading motivador
2. type:"checklist" — "Qué vas a aprender": items: 4-6 objetivos
3. type:"diagram" — Mapa conceptual. SIEMPRE incluir "subheading" explicando la relación. center: concepto central, nodes: 4-8 nodos
4. type:"content" — Por qué importa. subheading: 3-4 oraciones con dato real, contexto, impacto
5. type:"bullets" — Concepto principal parte 1. 3-4 bullets claros
6. type:"bullets" — Parte 2 del concepto. Igual de concreto
7. type:"content" — Parte 3 si aplica
8. type:"practice" — Ejemplo práctico. steps: 4-6 pasos. tip: consejo clave
9. type:"errors" — bullets: 4-5 errores con su consecuencia real
10. type:"exercise" — subheading: contexto, task: tarea específica paso a paso
11. type:"resources" — items: 4-6 objetos { text, url, tag }. URLs REALES y verificables
12. type:"bullets" — Resumen: 4-5 takeaways accionables

Tipos disponibles: title, content, bullets, checklist, practice, errors, exercise, resources, diagram

═══════════════════════════════
CAMPO "body" — Artículo completo en HTML
═══════════════════════════════

Artículo largo en HTML con estas secciones (sin clases CSS):
- <h2> secciones principales
- <h3> subsecciones
- <p> párrafos de 3-4 oraciones mínimo
- <ul><li> listas
- <ol><li> pasos
- <blockquote> notas importantes
- <strong> términos clave
- <a href="URL"> links reales

Secciones obligatorias del artículo:
1. Introducción: qué es el tema, por qué importa hoy para periodistas
2. Conceptos fundamentales: explicación detallada
3. Cómo funciona paso a paso con ejemplos de redacción
4. Ejemplo práctico completo: situación real de un periodista
5. Errores comunes y cómo evitarlos
6. Tu ejercicio: instrucciones detalladas
7. Recursos para seguir aprendiendo

Tono: periodista hablando a otro periodista. Segunda persona. Cercano, sin tecnicismos, sin lenguaje académico. Mínimo 800 palabras.`

const CLASSES: { id: number; instruction: string }[] = [
  {
    id: 15,
    instruction: `Crea una clase completa sobre "Algoritmos al desnudo: cómo deciden qué ves y qué publicas".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos.

La clase debe explicar:
- Qué es un algoritmo en términos simples (analogía con un editor que decide qué aparece en portada)
- Cómo funciona el algoritmo de Facebook: engagement, tiempo de visualización, comentarios
- Cómo funciona el algoritmo de Instagram: primeras horas, saves, shares
- Cómo funciona el algoritmo de Google: palabras clave, autoridad, velocidad de carga
- Por qué algunas noticias llegan a miles y otras no llegan a nadie
- Qué puede hacer el periodista para publicar a favor del algoritmo sin perder criterio editorial

Ejemplo periodístico: un periodista publicó la misma noticia dos veces con diferente titular y hora de publicación, y obtuvo resultados completamente distintos. Explica qué hizo diferente.

Recursos reales: Meta Business Suite, Google Analytics, herramientas de análisis de redes sociales.`,
  },
  {
    id: 16,
    instruction: `Crea una clase completa sobre "Cómo detectar noticias falsas e imágenes manipuladas".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos.

La clase debe enseñar técnicas concretas y gratuitas:
- Reverse image search: cómo usar Google Images y TinEye para rastrear el origen de una imagen
- Qué son los metadatos de una imagen y cómo verlos (fecha, cámara, ubicación GPS)
- Cómo detectar imágenes editadas con Photoshop o IA (FotoForensics, Hive Moderation)
- Qué es un deepfake y cómo identificarlo visualmente
- Cómo verificar videos virales (InVID, YouTube DataViewer)
- Cómo verificar si un sitio web es real o fue creado para desinformar

Ejemplo periodístico: una imagen circuló en redes como "foto de hoy" pero era de hace 3 años y de otro país. Muestra paso a paso cómo un periodista la verificó en 5 minutos.

Recursos reales: TinEye.com, FotoForensics.com, InVID (extensión de Chrome), Snopes, Chequeado.`,
  },
  {
    id: 17,
    instruction: `Crea una clase completa sobre "Búsquedas avanzadas que la mayoría no usa".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos.

La clase debe enseñar operadores de búsqueda reales:
- Operadores básicos de Google: comillas exactas, site:, filetype:, intitle:, inurl:
- Cómo buscar documentos PDF y Excel públicos de gobiernos y organismos
- Búsqueda avanzada en Twitter/X: from:, since:, until:, filter:links
- Cómo buscar en Facebook perfiles y páginas específicas
- Google Dorks básicos para encontrar información pública
- Cómo guardar búsquedas como alertas (Google Alerts)

Ejemplo periodístico: un periodista necesitaba el presupuesto de una municipalidad que no estaba en la web oficial. Usando filetype:pdf site:municipio.gob encontró el documento en 2 minutos.

Recursos reales: Google Advanced Search, Google Alerts, Twitter Advanced Search, Bellingcat Online Investigation Toolkit.`,
  },
  {
    id: 18,
    instruction: `Crea una clase completa sobre "OSINT básico: encontrar fuentes e información oculta".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos.

La clase debe enseñar técnicas de OSINT (Open Source Intelligence) aplicadas al periodismo:
- Qué es OSINT y por qué es una habilidad esencial para el periodista moderno
- Cómo verificar la identidad de una fuente usando redes sociales y registros públicos
- Cómo usar LinkedIn para encontrar fuentes expertas en cualquier tema
- Cómo rastrear si una cuenta de Twitter/X es real o un bot (Botometer, análisis manual)
- Cómo buscar información de empresas: registros mercantiles, propietarios, historial
- Herramientas gratuitas: Maltego CE, SpiderFoot HX, Pipl (alternativas gratuitas)
- La Wayback Machine: cómo ver versiones anteriores de sitios web

Ejemplo periodístico: un periodista necesitaba verificar si la empresa que le pagaba a un funcionario existía realmente y quién la controlaba. Muestra el proceso de investigación paso a paso usando herramientas gratuitas.

Recursos reales: Web.Archive.org, Whois.domaintools.com, OpenCorporates.com, Hunter.io, LinkedIn.`,
  },
  {
    id: 19,
    instruction: `Crea una clase completa sobre "Protege tu trabajo y tus fuentes: seguridad digital para periodistas".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos.

La clase debe enseñar seguridad digital práctica y sin paranoias:
- Por qué los periodistas son un objetivo: hackeos, espionaje de gobiernos, doxing
- Contraseñas seguras: qué hace débil a una contraseña, cómo crear contraseñas fuertes
- Gestores de contraseñas: qué son y cómo instalar Bitwarden (gratuito)
- Qué rastro dejas cuando navegas: cookies, IP, historial, y cómo protegerte básicamente
- Signal: qué es, cómo instalar, cómo usarlo para proteger comunicaciones con fuentes
- Verificación en dos pasos: cómo activarla en Gmail, Instagram y Facebook
- Cómo reconocer un correo de phishing antes de hacer clic

Ejemplo periodístico: un periodista de investigación perdió acceso a su cuenta de Gmail y con ella a meses de intercambios con una fuente confidencial. Explica qué falló y cómo evitarlo.

Recursos reales: Signal.org, Bitwarden.com, Have I Been Pwned, EFF's Surveillance Self-Defense (ssd.eff.org).`,
  },
  {
    id: 20,
    instruction: `Crea una clase completa sobre "Automatiza sin programar: herramientas que trabajan mientras duermes".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos, que ya tienen o quieren tener un periódico digital en redes sociales.

La clase debe enseñar automatización práctica sin código:
- Qué es la automatización y por qué es clave para un periodista con poco tiempo
- Google Alerts: cómo crear alertas de palabras clave para monitorear tu nicho automáticamente
- IFTTT: qué es y cómo crear una automatización simple (RSS → publicación automática)
- Make (antes Integromat): qué es, cuándo usarlo, ejemplo de flujo básico para periodistas
- Cómo programar publicaciones en Meta Business Suite (gratis y sin terceros)
- Buffer o Later para programar en múltiples redes a la vez
- RSS: qué es y cómo usarlo para monitorear muchos medios a la vez con Feedly

Ejemplo periodístico: un periodista digital publica en Instagram, Facebook y Twitter al mismo tiempo, con contenido adaptado a cada red, en menos de 15 minutos al día usando estas herramientas.

Recursos reales: Google Alerts, Make.com, IFTTT.com, Meta Business Suite, Feedly.com, Buffer.com.`,
  },
  {
    id: 21,
    instruction: `Crea una clase completa sobre "El periodista multiplataforma: gestiona todo sin agotarte".

Contexto: Para periodistas de 35-60 años con experiencia en medios tradicionales, sin conocimientos técnicos, que quieren publicar en varias plataformas simultáneamente sin colapsar.

La clase debe enseñar:
- Por qué publicar en una sola plataforma es arriesgoso (depender del algoritmo de una red)
- Cómo adaptar el mismo contenido a diferentes formatos: post, historia, reel, newsletter
- Calendario editorial digital: cómo planificar una semana de publicaciones en 30 minutos
- Notion o Google Sheets como calendario editorial simple y gratuito
- Cómo reutilizar contenido antiguo (evergreen content) sin que parezca repetitivo
- Qué métricas mirar y cuáles ignorar para no perder el tiempo
- Cómo definir cuánto tiempo dedicas a cada plataforma según tu audiencia real

Ejemplo periodístico: una periodista que publicaba todos los días en 4 redes estaba agotada. Reorganizó su trabajo con un calendario editorial y bajó de 2 horas diarias a 45 minutos, manteniendo el alcance.

Recursos reales: Notion.so, Google Sheets, Meta Business Suite Insights, Later.com, Canva (para adaptar formatos).`,
  },
]

async function generateClass(classItem: { id: number; instruction: string }) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  console.log(`\n🚀 Generando Clase ${classItem.id}...`)

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: classItem.instruction }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Clase ${classItem.id}: Claude no devolvió JSON válido`)

  const contentData = JSON.parse(jsonMatch[0])
  console.log(`  ✅ Contenido: "${contentData.title}" — ${contentData.slides.length} slides`)

  const html = generateSlidesHTML(contentData.slides)

  const timestamp = Date.now()
  const storagePath = `classes/${timestamp}/index.html`

  const { error: uploadError } = await supabase.storage
    .from('slides')
    .upload(storagePath, Buffer.from(html, 'utf-8'), {
      contentType: 'text/html',
      upsert: false,
    })

  if (uploadError) throw new Error(`Upload error: ${uploadError.message}`)

  const slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl

  const { error: dbError } = await supabase
    .from('classes')
    .update({
      title: contentData.title,
      description: contentData.description,
      slides_url: slidesUrl,
      slides_json: { slides: contentData.slides, body: contentData.body ?? null },
    })
    .eq('id', classItem.id)

  if (dbError) throw new Error(`DB error: ${dbError.message}`)

  console.log(`  ✅ Clase ${classItem.id} subida correctamente.`)
  await new Promise(r => setTimeout(r, 2000))
}

async function main() {
  console.log(`📚 Generando ${CLASSES.length} clases del módulo Tecnología para Periodistas...\n`)

  for (const cls of CLASSES) {
    await generateClass(cls)
  }

  console.log('\n🎉 Todas las clases generadas y subidas.')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
