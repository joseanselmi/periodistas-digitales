import { createClient } from '@supabase/supabase-js'
import { BRAND, uploadAndUpdate } from './slide-helper.mjs'

const sb = createClient('https://ovwlsnnhiuoxoazyrhvt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo')

const slides = [
  {
    type: 'title',
    heading: 'Automatizá sin programar',
    subheading: 'Herramientas que trabajan mientras vos escribís',
  },
  {
    type: 'checklist',
    title: 'Qué vas a aprender',
    items: [
      'Qué es la automatización y por qué no necesitás saber programar',
      'Google Alerts: monitoreo automático de tus temas de cobertura',
      'RSS con Feedly: todos tus medios y fuentes en un solo lugar',
      'Cómo combinar estas herramientas para tener el briefing listo antes de arrancar',
      'Cuándo tiene sentido automatizar y cuándo no',
    ],
  },
  {
    type: 'diagram',
    title: 'El flujo de automatización básico',
    subheading: 'La automatización conecta fuentes de información con tu espacio de trabajo. En vez de ir a buscar la información, la información viene a vos. No requiere código — solo configurar las herramientas correctas una vez.',
    center: 'Tu flujo de trabajo',
    nodes: ['Google Alerts (monitoreo)', 'RSS/Feedly (medios)', 'Email (resumen diario)', 'Notion (organización)', 'Buffer (distribución)'],
  },
  {
    type: 'content',
    title: 'Automatizar no es reemplazar tu criterio',
    subheading: 'Automatizar significa que las tareas repetitivas — buscar novedades, revisar medios, distribuir contenido — las hace una herramienta en vez de vos. Tu criterio periodístico sigue siendo irreemplazable. Lo que cambia es cuánto tiempo le dedicás a las tareas mecánicas y cuánto a las que realmente requieren tu cabeza.',
  },
  {
    type: 'bullets',
    title: 'Google Alerts: tu equipo de monitoreo gratis',
    bullets: [
      'Configurás palabras clave y Google te manda un email cuando aparecen en noticias nuevas',
      'Podés crear alertas por persona, empresa, tema, o combinaciones exactas entre comillas',
      'Filtrás por idioma, región, frecuencia (inmediato, diario, semanal) y fuente',
      'Útil para: seguir a un personaje, monitorear un tema largo, rastrear menciones tuyas',
    ],
  },
  {
    type: 'bullets',
    title: 'RSS y Feedly: todos tus medios en un lugar',
    bullets: [
      'RSS es un feed de actualizaciones que casi todos los medios publican automáticamente',
      'Feedly agrega todos esos feeds y te los muestra en un solo panel organizado',
      'En vez de abrir 15 sitios por la mañana, abrís uno y ves todo lo nuevo',
      'Podés organizar por tema, prioridad, o medio — y marcar lo que ya leíste',
    ],
  },
  {
    type: 'bullets',
    title: 'Buffer: distribuí sin estar pegado al celular',
    bullets: [
      'Programás publicaciones en redes sociales con días de anticipación',
      'Escribís el contenido una vez y lo distribuís a Instagram, X y LinkedIn juntos',
      'Ver las métricas de qué funcionó y qué no desde un solo panel',
      'El plan gratuito alcanza para 3 canales y 10 publicaciones programadas',
    ],
  },
  {
    type: 'practice',
    title: 'Configurar tu sistema de monitoreo — paso a paso',
    steps: [
      'Andá a google.com/alerts e ingresá con tu cuenta de Google',
      'Creá una alerta con el nombre del tema principal que cubrís (entre comillas para exactitud)',
      'Configurá frecuencia "Una vez al día" y entrega "Solo los mejores resultados"',
      'Abrí feedly.com, creá una cuenta y buscá los 5 medios que más seguís',
      'Agregá sus RSS feeds a Feedly — la mayoría se encuentran con solo buscar el nombre del medio',
    ],
    tip: 'Empezá con 3-5 alertas de Google sobre tus temas principales. Si creás demasiadas, el email se llena de ruido y terminás ignorándolas.',
  },
  {
    type: 'errors',
    title: 'Errores que hacen que la automatización no funcione',
    bullets: [
      'Crear demasiadas alertas sin filtrar — el ruido hace que ignores todo',
      'Agregar todos los medios a Feedly — terminás con 500 artículos sin leer por día',
      'Automatizar la distribución sin revisar el contenido — errores se publican solos',
      'Pensar que la automatización reemplaza el juicio editorial — solo elimina lo mecánico',
    ],
  },
  {
    type: 'exercise',
    title: 'Tu ejercicio de hoy',
    subheading: 'Configurá tu sistema básico de monitoreo en menos de 20 minutos.',
    task: '1. Creá 3 alertas en Google Alerts sobre tus temas de cobertura principales\n2. Abrí Feedly y agregá los 5 medios que más revisás cada mañana\n3. Mañana a primera hora: abrí solo Feedly y tu email. No abras ningún sitio suelto.',
  },
  {
    type: 'resources',
    title: 'Herramientas para empezar hoy',
    items: [
      { text: 'Google Alerts — monitoreo gratuito de palabras clave en noticias', url: 'https://www.google.com/alerts', tag: 'Herramienta' },
      { text: 'Feedly — lector de RSS para organizar todos tus medios en un panel', url: 'https://feedly.com', tag: 'Herramienta' },
      { text: 'Buffer — programador de publicaciones en redes sociales', url: 'https://buffer.com', tag: 'Herramienta' },
    ],
  },
  {
    type: 'bullets',
    title: 'Lo que te llevás de esta clase',
    bullets: [
      'Automatizar es hacer que las tareas mecánicas las haga una herramienta, no vos',
      'Google Alerts + Feedly resuelven el 80% del monitoreo diario sin costo',
      'Menos alertas y feeds = más señal, menos ruido',
      'En el módulo de Make vas a ver cómo conectar estas herramientas entre sí',
      'La automatización básica no requiere código — solo configuración',
    ],
  },
]

const body = `
<h2>Qué es automatizar y por qué no necesitás programar</h2>
<p>Automatizar significa que una tarea que antes hacías vos — buscar novedades, revisar medios, publicar en redes — la hace una herramienta siguiendo reglas que vos definiste una sola vez. No requiere saber programar. Las herramientas que vamos a ver en esta clase tienen interfaces visuales que cualquiera puede usar.</p>
<p>El objetivo no es reemplazar tu criterio periodístico — eso es irreemplazable. El objetivo es liberar tiempo de las tareas mecánicas para que lo uses en las que realmente importan: investigar, entrevistar, escribir, verificar. Cada hora que una herramienta hace el monitoreo por vos es una hora que vos podés dedicar a algo que solo vos podés hacer.</p>

<h2>Google Alerts: tu equipo de monitoreo gratuito</h2>
<p>Google Alerts te manda un email cuando aparecen resultados nuevos en Google para las palabras clave que configuraste. Es gratuito, requiere solo una cuenta de Google, y funciona en segundo plano sin que tengas que hacer nada.</p>
<p>La clave está en configurar las alertas bien. Si creás una alerta para "economía", vas a recibir cientos de resultados irrelevantes por día. Si creás una alerta para <strong>"Juan García" ministerio</strong>, vas a recibir solo los resultados que mencionan a esa persona en ese contexto.</p>
<p>Las comillas funcionan igual que en Google: fuerzan la búsqueda exacta de esa frase. Podés combinar términos, excluir palabras con el signo menos, y filtrar por idioma o región. La frecuencia "una vez al día" es suficiente para la mayoría de los temas — la inmediata es para breaking news donde cada minuto importa.</p>
<p>Configurá alertas para: los nombres de las personas que cubrís regularmente, los temas de tu beat, empresas o instituciones que seguís, y también tu propio nombre para saber cuándo te citan.</p>

<h2>RSS y Feedly: todos tus medios en un solo panel</h2>
<p>RSS es un formato técnico que casi todos los sitios web publican automáticamente: una lista actualizada de sus últimas notas. No lo ves en la interfaz normal del sitio, pero existe. Los lectores de RSS como Feedly agregan todos esos feeds y los muestran en un solo lugar, organizados como vos quieras.</p>
<p>La diferencia con abrir los sitios uno por uno es enorme. En vez de entrar a doce portales y navegar cada uno para ver qué hay nuevo, abrís Feedly y ves en un panel todo lo publicado en las últimas horas, ordenado por fecha, con las fuentes que vos elegiste. Lo que ya leíste desaparece. Lo que no leíste queda marcado.</p>
<p>El plan gratuito de Feedly es suficiente para la mayoría de los casos: permite agregar múltiples feeds y organizarlos en carpetas. Podés crear carpetas por tema — política, economía, deportes — y revisar solo las que te interesan cada mañana.</p>
<p>La regla para que funcione: empezá con pocos feeds. Si agregás cincuenta medios, Feedly se convierte en otro problema de sobreinformación. Elegí los diez o quince que realmente leés y que te dan información que no encontrás en otro lado.</p>

<h2>Buffer: distribuí sin estar pegado al celular</h2>
<p>Buffer es un programador de publicaciones en redes sociales. Escribís el contenido una sola vez, seleccionás en qué redes publicar (Instagram, X, LinkedIn, Facebook), elegís la fecha y hora, y Buffer lo publica automáticamente cuando llegue ese momento.</p>
<p>Para periodistas es útil en dos situaciones: cuando publicás notas a lo largo de la semana y querés distribuirlas de forma escalonada en vez de todas juntas, y cuando querés mantener presencia en redes durante el fin de semana sin estar conectado.</p>
<p>El plan gratuito permite tres canales y diez publicaciones programadas. Es suficiente para empezar. La interfaz es simple: arrastrás las publicaciones en un calendario y ajustás los horarios.</p>

<h2>Cuándo automatizar y cuándo no</h2>
<p>La automatización funciona bien para tareas repetitivas y predecibles: monitorear palabras clave, agregar fuentes, programar distribución de contenido ya revisado. No funciona para tareas que requieren juicio: decidir qué nota publicar, cómo enmarcar un tema, qué fuente consultar.</p>
<p>El error más común es automatizar demasiado pronto o en la dirección equivocada. Automatizar la distribución de contenido sin revisar ese contenido antes de publicar significa que los errores se publican solos. Automatizar el monitoreo con demasiadas alertas significa que el ruido borra la señal.</p>
<p>Empezá con poco. Tres alertas bien configuradas y cinco feeds bien elegidos ya cambian tu rutina matutina. Cuando eso funcione, sumás más.</p>

<h2>Tu ejercicio</h2>
<p>Hoy: creá tres alertas en Google Alerts sobre tus temas principales y agregá cinco medios a Feedly. Mañana a primera hora, abrí solo esas dos herramientas — no abras ningún sitio suelto. Medí cuánto tiempo tardás en tener el panorama del día comparado con tu rutina habitual.</p>
`

await uploadAndUpdate(sb, slides, body, 20)
console.log('✓ ID 20 Automatizaciones básicas completada')
