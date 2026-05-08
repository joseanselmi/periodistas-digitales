import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://ovwlsnnhiuoxoazyrhvt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo'
)

const BRAND = { primary: '#22D3EE', secondary: '#7C3AED', bg: '#0F172A', surface: '#1E293B', text: '#F8FAFC' }

const slides = [
  {
    type: 'title',
    heading: 'OSINT básico: encontrá lo que nadie te va a contar',
    subheading: 'Fuentes abiertas, técnicas reales, resultados verificables',
  },
  {
    type: 'checklist',
    title: 'Qué vas a aprender',
    items: [
      'Qué es OSINT y por qué los mejores periodistas lo usan a diario',
      'Operadores de búsqueda avanzada de Google que el 95% desconoce',
      'Cómo verificar identidades, empresas y propiedades con fuentes públicas',
      'Reverse image search para detectar fotos falsas o manipuladas',
      'Cómo rastrear presencia digital de una fuente o personaje público',
    ],
  },
  {
    type: 'diagram',
    title: 'El ecosistema OSINT para periodistas',
    subheading: 'OSINT (Open Source Intelligence) es la práctica de recolectar y analizar información de fuentes públicas. Para un periodista, es la diferencia entre depender de lo que las fuentes te dicen y poder verificarlo de forma independiente.',
    center: 'Investigación periodística',
    nodes: [
      'Buscadores avanzados',
      'Registros públicos',
      'Redes sociales',
      'Imágenes y metadatos',
      'Archivos web históricos',
      'Registros corporativos',
    ],
  },
  {
    type: 'content',
    title: 'Por qué OSINT cambia cómo reporteás',
    subheading: 'La mayoría de los periodistas depende de lo que las fuentes les dicen. OSINT te permite verificar esas declaraciones de forma independiente. Si alguien te dice que es dueño de una empresa, podés verificarlo en registros públicos. Si una foto "de hoy" circula en redes, podés saber si es real o tiene años. Esa capacidad de verificación independiente es lo que separa la nota que se puede defender de la que no.',
  },
  {
    type: 'bullets',
    title: 'Operadores de Google que nadie te enseñó',
    bullets: [
      '"site:nombre.com término" — busca solo dentro de un sitio específico',
      '"filetype:pdf presupuesto municipal 2024" — encuentra documentos por tipo',
      '"intitle:Juan García cargo empresa" — busca en títulos de página',
      '"before:2023-01-01 after:2022-01-01 tema" — filtrá por fecha exacta',
    ],
  },
  {
    type: 'bullets',
    title: 'Verificar personas y empresas',
    bullets: [
      'Registros societarios provinciales y nacionales — son públicos y gratuitos',
      'LinkedIn: historial laboral, conexiones y cambios de trabajo recientes',
      'WHOIS de dominios web: quién registró un sitio y cuándo',
      'Wayback Machine (web.archive.org): cómo era un sitio en el pasado',
    ],
  },
  {
    type: 'bullets',
    title: 'Reverse image search — detectar fotos falsas',
    bullets: [
      'Google Images (images.google.com): arrastrá o pegá cualquier imagen',
      'TinEye: buscá dónde apareció esa foto por primera vez en internet',
      'Si la foto "de hoy" apareció hace 3 años → es falsa',
      'También revelá quién es realmente una persona usando su foto de perfil',
    ],
  },
  {
    type: 'practice',
    title: 'Investigar a una fuente — paso a paso',
    steps: [
      'Buscá el nombre completo entre comillas: "Juan García Martínez"',
      'Agregá "site:linkedin.com" para ver su perfil laboral verificado',
      'Buscá "Juan García Martínez empresa" + filetype:pdf para documentos oficiales',
      'Revisá si tiene perfil en X/Twitter y qué declaraciones públicas tiene',
      'Usá Wayback Machine para ver si borró información de su sitio web',
      'Cruzá lo que encontraste con lo que te dijo en la entrevista',
    ],
    tip: 'Guardá capturas de pantalla de todo lo que encontrés. Las páginas web cambian y desaparecen. La evidencia que no capturás deja de existir.',
  },
  {
    type: 'errors',
    title: 'Errores que arruinan una investigación OSINT',
    bullets: [
      'Publicar sin verificar la fuente primaria — encontrar algo en Google no es verificación',
      'Confundir personas con el mismo nombre — siempre cruzá con más de un dato identificatorio',
      'No guardar captura de pantalla — la evidencia digital desaparece sin aviso',
      'Saltar pasos por presión de tiempo — una sola verificación mal hecha invalida toda la nota',
    ],
  },
  {
    type: 'exercise',
    title: 'Tu ejercicio de hoy',
    subheading: 'Elegí a alguien que vayas a entrevistar esta semana y hacé una investigación OSINT básica antes de la entrevista.',
    task: '1. Buscá su nombre entre comillas en Google\n2. Buscá "site:linkedin.com [nombre]"\n3. Buscá filetype:pdf con su nombre\n4. Verificá una foto suya con reverse image search\n5. Anotá qué encontraste que no sabías antes',
  },
  {
    type: 'resources',
    title: 'Herramientas para empezar hoy',
    items: [
      { text: 'Google Búsqueda Avanzada — todos los operadores en una sola pantalla', url: 'https://www.google.com/advanced_search', tag: 'Herramienta' },
      { text: 'Wayback Machine — archivos históricos de cualquier sitio web', url: 'https://web.archive.org', tag: 'Herramienta' },
      { text: 'Google Images — reverse image search para verificar fotos', url: 'https://images.google.com', tag: 'Herramienta' },
      { text: 'TinEye — encontrá la primera aparición de cualquier imagen en internet', url: 'https://tineye.com', tag: 'Herramienta' },
    ],
  },
  {
    type: 'bullets',
    title: 'Lo que te llevás de esta clase',
    bullets: [
      'OSINT no es hackear — es usar mejor la información pública que ya existe',
      'Los operadores de Google son tu herramienta más rápida y gratuita',
      'Siempre cruzás lo que encontrás con la fuente primaria antes de publicar',
      'Capturá pantallas de todo — la evidencia digital desaparece sin aviso',
      'Una investigación OSINT antes de cada entrevista cambia la calidad de tus preguntas',
    ],
  },
]

const body = `
<h2>Qué es OSINT y por qué importa para periodistas</h2>
<p>OSINT significa Open Source Intelligence — inteligencia de fuentes abiertas. Es la práctica de recolectar, analizar y cruzar información que ya es pública para construir un panorama verificado sobre una persona, empresa, evento o situación. No es hackear. No requiere acceso a sistemas privados. Todo lo que usás en OSINT es información que, técnicamente, cualquiera podría encontrar.</p>
<p>El problema es que la mayoría no sabe cómo encontrarla. Y ahí está la ventaja. Un periodista que domina técnicas básicas de OSINT puede verificar en veinte minutos lo que otro tardaría días en confirmar por fuentes. Puede detectar contradicciones entre lo que una fuente dice y lo que los registros públicos muestran. Puede saber antes de una entrevista exactamente qué preguntas son difíciles de esquivar.</p>

<h2>Operadores de búsqueda avanzada de Google</h2>
<p>Google tiene un lenguaje de búsqueda que la mayoría nunca aprendió. Estos operadores no son secretos — están documentados públicamente — pero el 95% de los usuarios los desconoce.</p>
<p>El operador <strong>site:</strong> limita la búsqueda a un dominio específico. Si escribís <strong>site:boletinoficial.gob.ar "Juan García"</strong> vas a encontrar todas las menciones de esa persona en el boletín oficial, sin tener que navegar el sitio entero. Si escribís <strong>site:linkedin.com "Directora de Comunicaciones" empresa</strong> encontrás perfiles de LinkedIn que coincidan.</p>
<p>El operador <strong>filetype:</strong> filtra por tipo de documento. <strong>filetype:pdf "presupuesto municipal" 2024</strong> te devuelve solo PDFs, que suelen ser documentos oficiales. También funciona con xls, doc, ppt.</p>
<p>Las <strong>comillas</strong> fuerzan la búsqueda exacta de una frase. Sin comillas, Google separa las palabras. Con comillas, busca la frase exacta. Esencial cuando buscás nombres propios o citas textuales.</p>
<p>El operador <strong>before:</strong> y <strong>after:</strong> filtra por fecha. Si necesitás saber qué se publicó sobre un tema antes de una fecha específica — por ejemplo, antes de que estallara un escándalo — estos operadores son indispensables.</p>

<h2>Cómo verificar personas y empresas</h2>
<p>Cuando una fuente te dice que es dueño de una empresa, directivo de una organización, o que tuvo tal o cual cargo, podés verificarlo. En Argentina, los registros societarios provinciales son públicos. La Inspección General de Justicia (IGJ) tiene información sobre sociedades radicadas en Buenos Aires. Cada provincia tiene su propio registro equivalente.</p>
<p>LinkedIn es una fuente valiosa aunque subestimada. Los perfiles de LinkedIn son declaraciones públicas de carrera profesional. Si alguien dice tener un cargo que no figura en su LinkedIn — o si su historial no coincide con lo que te dice — es una señal de alerta. También podés ver cambios de trabajo recientes, conexiones compartidas, y publicaciones que hizo sobre determinados temas.</p>
<p>WHOIS es una base de datos pública que muestra quién registró un dominio web y cuándo. Si alguien tiene un sitio web que presentó recientemente como "con años de historia", el WHOIS te dice la fecha exacta de registro. Podés consultarlo en who.is o directamente en los registros de dominios.</p>
<p>La Wayback Machine de Internet Archive guarda capturas históricas de sitios web. Si una empresa o persona borró información de su sitio, Archive.org probablemente tenga versiones anteriores. Es una herramienta esencial cuando estás investigando a alguien que intenta controlar su imagen online.</p>

<h2>Reverse image search: detectar fotos falsas</h2>
<p>Una de las formas más comunes de desinformación es usar fotos reales pero descontextualizadas. Una foto de una manifestación de hace cinco años se presenta como si fuera de hoy. Una imagen de otro país se atribuye a un evento local. El reverse image search corta eso de raíz.</p>
<p>Google Images permite buscar por imagen: arrastrás la foto al buscador o pegás la URL y Google te muestra dónde más aparece esa imagen en internet. Si la foto "de hoy" tiene resultados de hace tres años, es una foto falsa o mal contextualizada.</p>
<p>TinEye va más lejos: te muestra la primera vez que esa imagen apareció en internet y todas las variantes que existen. Es más específico que Google para rastrear el origen exacto de una imagen.</p>
<p>Esta técnica también funciona para verificar identidades. Si alguien tiene una foto de perfil que usó otra persona, o que es una imagen de stock, el reverse search lo revela en segundos.</p>

<h2>Cómo investigar a una fuente antes de entrevistarla</h2>
<p>El momento más importante para aplicar OSINT es antes de una entrevista. Llegás con información que la fuente no sabe que tenés, y eso cambia la dinámica completamente. No podés hacerle preguntas difíciles a alguien si no sabés qué preguntar.</p>
<p>El proceso básico: primero buscás el nombre completo entre comillas. Luego sumás contexto: empresa, cargo, ciudad, año. Después buscás en LinkedIn, en registros públicos, en el boletín oficial. Buscás filetype:pdf con su nombre para encontrar documentos donde aparece mencionado. Revisás si tiene redes sociales públicas y qué declaró en los últimos meses. Verificás su foto de perfil con reverse search.</p>
<p>Con treinta minutos de este proceso antes de cada entrevista importante, llegás sabiendo cosas que la fuente asume que no sabés. Eso te da la capacidad de hacer preguntas que no se pueden esquivar con respuestas preparadas.</p>

<h2>Lo que OSINT no puede hacer</h2>
<p>OSINT tiene límites claros. No te da acceso a información privada — no podés ver emails, chats privados, cuentas bancarias ni documentos que no son públicos. Si alguien no tiene presencia digital, tu investigación OSINT va a ser limitada. Y la información que encontrás siempre requiere verificación cruzada: encontrar algo en internet no es verificación, es un punto de partida.</p>
<p>También hay que tener cuidado con la privacidad. OSINT es legítimo cuando se aplica a figuras públicas en ejercicio de su función pública. Aplicarlo a ciudadanos privados sin justificación periodística clara es otro territorio.</p>

<h2>Tu ejercicio</h2>
<p>Antes de tu próxima entrevista importante, hacé una investigación OSINT básica de 30 minutos. Buscá el nombre entre comillas, explorá LinkedIn, buscá documentos PDF, verificá una foto. Anotá qué encontraste que no sabías. Esa información va a cambiar las preguntas que hacés — y las respuestas que obtenés.</p>
`

function slideHtml(slide, brand, index, total) {
  const progress = Math.round(((index + 1) / total) * 100)
  let content = ''
  switch (slide.type) {
    case 'title': content = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:4rem;"><div style="width:48px;height:4px;background:${brand.primary};border-radius:2px;margin-bottom:2rem;"></div><h1 style="font-size:2.8rem;font-weight:700;color:${brand.text};line-height:1.2;margin-bottom:1rem;max-width:800px;">${slide.heading??''}</h1>${slide.subheading?`<p style="font-size:1.25rem;color:${brand.primary};opacity:0.8;">${slide.subheading}</p>`:''}</div>`; break
    case 'content': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;"><h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.5rem;">${slide.title??''}</h2>${slide.subheading?`<p style="font-size:1.1rem;color:${brand.text};opacity:0.85;line-height:1.8;">${slide.subheading}</p>`:''}</div>`; break
    case 'bullets': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;"><h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title??''}</h2><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">${(slide.bullets??[]).map(b=>`<li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;"><span style="width:8px;height:8px;border-radius:50%;background:${brand.primary};margin-top:0.45rem;flex-shrink:0;"></span>${b}</li>`).join('')}</ul></div>`; break
    case 'checklist': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;"><h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title??'Qué vas a aprender'}</h2><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">${(slide.items??[]).map(item=>{const text=typeof item==='string'?item:item.text;return`<li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};line-height:1.5;"><span style="width:20px;height:20px;border-radius:50%;background:${brand.primary}25;border:1.5px solid ${brand.primary};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="${brand.primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>${text}</li>`}).join('')}</ul></div>`; break
    case 'practice': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;"><h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:1.75rem;">${slide.title??'Ejemplo práctico'}</h2><ol style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.875rem;">${(slide.steps??[]).map((step,i)=>`<li style="display:flex;align-items:flex-start;gap:1rem;font-size:1rem;color:${brand.text};opacity:0.9;line-height:1.5;"><span style="width:26px;height:26px;border-radius:8px;background:${brand.primary};color:${brand.bg};font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</span>${step}</li>`).join('')}</ol>${slide.tip?`<div style="margin-top:1.5rem;padding:1rem 1.25rem;background:${brand.primary}15;border:1px solid ${brand.primary}40;border-radius:10px;font-size:0.9rem;color:${brand.text};opacity:0.9;"><span style="color:${brand.primary};font-weight:600;">💡 Tip: </span>${slide.tip}</div>`:''}</div>`; break
    case 'errors': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;"><h2 style="font-size:2rem;font-weight:700;color:#F87171;margin-bottom:2rem;">${slide.title??'Errores comunes'}</h2><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;">${(slide.bullets??[]).map(b=>`<li style="display:flex;align-items:flex-start;gap:1rem;font-size:1.05rem;color:${brand.text};opacity:0.9;line-height:1.5;"><span style="width:20px;height:20px;border-radius:50%;background:#EF444425;border:1.5px solid #EF4444;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:0.1rem;font-size:0.7rem;color:#EF4444;font-weight:700;">✕</span>${b}</li>`).join('')}</ul></div>`; break
    case 'exercise': content = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:3rem;text-align:center;"><div style="background:${brand.primary}10;border:1px solid ${brand.primary}35;border-radius:20px;padding:2.5rem 3rem;max-width:640px;width:100%;"><div style="font-size:2.5rem;margin-bottom:1rem;">🎯</div><h2 style="font-size:1.75rem;font-weight:700;color:${brand.text};margin-bottom:0.75rem;">${slide.title??'Tu ejercicio'}</h2>${slide.subheading?`<p style="font-size:1rem;color:${brand.text};opacity:0.7;line-height:1.6;margin-bottom:1.5rem;">${slide.subheading}</p>`:''  }${slide.task?`<div style="background:${brand.bg};border-radius:12px;padding:1.25rem 1.5rem;border:1px solid ${brand.primary}25;text-align:left;"><p style="color:${brand.primary};font-size:0.95rem;font-weight:500;line-height:1.8;white-space:pre-line;">${slide.task}</p></div>`:''}</div></div>`; break
    case 'resources': content = `<div style="padding:3.5rem 4rem;height:100%;box-sizing:border-box;overflow:auto;"><h2 style="font-size:2rem;font-weight:700;color:${brand.primary};margin-bottom:2rem;">${slide.title??'Recursos'}</h2><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.75rem;">${(slide.items??[]).map((item,i)=>{const isObj=typeof item==='object'&&item!==null;const text=isObj?item.text:String(item);const url=isObj?item.url:undefined;const tag=isObj?item.tag:undefined;return`<li style="display:flex;align-items:center;gap:1rem;font-size:1rem;color:${brand.text};padding:0.75rem 1rem;background:${brand.bg};border-radius:8px;border:1px solid rgba(255,255,255,0.06);"><span style="color:${brand.primary};font-weight:700;font-size:0.8rem;min-width:22px;">${String(i+1).padStart(2,'0')}</span><span style="flex:1;opacity:0.85;">${url?`<a href="${url}" target="_blank" style="color:${brand.text};text-decoration:underline;text-underline-offset:3px;opacity:0.85;">${text}</a>`:text}</span>${tag?`<span style="font-size:0.7rem;padding:0.2rem 0.6rem;background:${brand.primary}20;color:${brand.primary};border-radius:20px;white-space:nowrap;">${tag}</span>`:''}</li>`}).join('')}</ul></div>`; break
    case 'diagram': { const nodes=slide.nodes??[]; const cols=nodes.length<=3?nodes.length:Math.ceil(nodes.length/2); content=`<div style="display:flex;flex-direction:column;height:100%;padding:2.25rem 3rem;gap:1rem;box-sizing:border-box;overflow:auto;"><h2 style="font-size:1.5rem;font-weight:700;color:${brand.text};flex-shrink:0;">${slide.title??''}</h2>${slide.subheading?`<p style="font-size:0.95rem;color:${brand.text};opacity:0.75;line-height:1.65;flex-shrink:0;">${slide.subheading}</p>`:''}<div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;flex:1;justify-content:center;"><div style="background:${brand.primary};color:${brand.bg};padding:0.55rem 1.75rem;border-radius:12px;font-size:0.95rem;font-weight:700;text-align:center;box-shadow:0 0 20px ${brand.primary}44;flex-shrink:0;">${slide.center??''}</div><div style="width:2px;height:14px;background:linear-gradient(${brand.primary},${brand.primary}00);flex-shrink:0;"></div><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:0.6rem;width:100%;">${nodes.map((n,i)=>`<div style="background:${brand.bg};border:1px solid ${brand.primary}35;border-radius:10px;padding:0.6rem 0.75rem;text-align:center;font-size:0.8rem;color:${brand.text};opacity:0.9;"><span style="display:block;width:18px;height:18px;border-radius:50%;background:${brand.primary}20;border:1.5px solid ${brand.primary}60;color:${brand.primary};font-size:0.6rem;font-weight:700;line-height:18px;text-align:center;margin:0 auto 0.3rem;">${i+1}</span>${n}</div>`).join('')}</div></div></div>`; break }
    default: content = `<div style="padding:3.5rem 4rem;"><p style="color:${brand.text};">${JSON.stringify(slide)}</p></div>`
  }
  return `<div class="slide" style="width:100%;height:100%;background:${brand.surface};border-radius:16px;overflow:hidden;position:relative;flex-direction:column;"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.06);"><div style="height:100%;width:${progress}%;background:${brand.primary};transition:width 0.3s;"></div></div><div style="position:absolute;bottom:1.5rem;right:2rem;font-size:0.75rem;color:${brand.text};opacity:0.3;font-family:monospace;">${index+1} / ${total}</div>${content}</div>`
}

function generateSlidesHTML(slides, brand) {
  const slidesHtml = slides.map((s,i) => slideHtml(s, brand, i, slides.length)).join('\n')
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Slides</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:${brand.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}#container{width:min(900px,96vw);aspect-ratio:16/9;position:relative;}.slide{display:none;width:100%;height:100%;}.slide.active{display:flex;}#nav{position:fixed;bottom:1.25rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;align-items:center;background:rgba(2,6,23,0.85);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0.4rem 0.5rem;backdrop-filter:blur(8px);}#nav button{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:${brand.text};padding:0.45rem 1rem;border-radius:8px;cursor:pointer;font-size:0.8rem;transition:background 0.15s;display:flex;align-items:center;gap:0.4rem;min-height:36px;}#nav button:hover:not(:disabled){background:rgba(255,255,255,0.14);}#nav button:disabled{opacity:0.25;cursor:default;}#counter{color:${brand.text};opacity:0.45;font-size:0.75rem;min-width:3.5rem;text-align:center;}#progress-bar{position:fixed;top:0;left:0;height:3px;background:${brand.primary};transition:width 0.3s ease;opacity:0.7;}#hint{position:fixed;bottom:4.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:0.4rem;opacity:1;transition:opacity 0.5s;pointer-events:none;}#hint.hidden{opacity:0;}#hint-text{color:${brand.primary};font-size:0.75rem;font-weight:500;white-space:nowrap;}#hint-arrow{width:20px;height:20px;border-right:2px solid ${brand.primary};border-bottom:2px solid ${brand.primary};transform:rotate(45deg);animation:bounce 1s ease-in-out infinite;opacity:0.7;}@keyframes bounce{0%,100%{transform:rotate(45deg) translateY(0);}50%{transform:rotate(45deg) translateY(4px);}}#tap-prev,#tap-next{position:fixed;top:0;bottom:4rem;width:20%;cursor:pointer;z-index:10;}#tap-prev{left:0;}#tap-next{right:0;}</style></head><body><div id="progress-bar"></div><div id="container">${slidesHtml}</div><div id="tap-prev" onclick="go(-1)"></div><div id="tap-next" onclick="go(1)"></div><div id="hint"><span id="hint-text">Tocá el lado derecho o usá las flechas para avanzar</span><div id="hint-arrow"></div></div><div id="nav"><button id="prev" onclick="go(-1)"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>Anterior</button><span id="counter">1 / ${slides.length}</span><button id="next" onclick="go(1)">Siguiente<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div><script>let cur=0;const slides=document.querySelectorAll('.slide');const total=slides.length;let hintDismissed=false;function dismissHint(){if(hintDismissed)return;hintDismissed=true;document.getElementById('hint').classList.add('hidden');}function show(n){slides[cur].classList.remove('active');cur=Math.max(0,Math.min(n,total-1));slides[cur].classList.add('active');document.getElementById('counter').textContent=(cur+1)+' / '+total;document.getElementById('prev').disabled=cur===0;document.getElementById('next').disabled=cur===total-1;document.getElementById('progress-bar').style.width=((cur+1)/total*100)+'%';dismissHint();}function go(d){show(cur+d);}document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '){e.preventDefault();go(1);}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();go(-1);}});let touchStartX=0,touchStartY=0;document.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;},{passive:true});document.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStartX;const dy=e.changedTouches[0].clientY-touchStartY;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){go(dx<0?1:-1);}},{passive:true});setTimeout(dismissHint,4000);show(0);</script></body></html>`
}

const html = generateSlidesHTML(slides, BRAND)
const timestamp = Date.now()
const path = `classes/${timestamp}/index.html`
const { error: uploadError } = await sb.storage.from('slides').upload(path, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: false })
if (uploadError) { console.error('Upload error:', uploadError); process.exit(1) }
const slidesUrl = sb.storage.from('slides').getPublicUrl(path).data.publicUrl
const { error: dbError } = await sb.from('classes').update({ slides_url: slidesUrl, slides_json: { slides, body } }).eq('id', 18)
if (dbError) { console.error('DB error:', dbError); process.exit(1) }
console.log('✓ ID 18 OSINT completada')
