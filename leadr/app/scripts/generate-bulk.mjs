/**
 * Genera slides para las 8 clases del grupo Claude (ids 22-29)
 * y actualiza cada registro en Supabase.
 *
 * Uso: node scripts/generate-bulk.mjs
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const SYSTEM_SLIDES = `Eres un experto en educación digital y periodismo. Generas slides de clases para periodistas que aprenden IA. Nivel intermedio, tono cercano y práctico.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

{
  "title": "Título de la clase",
  "description": "Descripción de 2-3 oraciones",
  "slides": [...]
}

CAMPO "slides" — 11 a 14 slides. Orden obligatorio:
1. type:"title" — Título + subtítulo motivador.
2. type:"checklist" — "Qué vas a aprender": 4-6 objetivos. Campo "items":["..."]
3. type:"diagram" — Mapa conceptual. "subheading" 1-2 oraciones. "center":"concepto central", "nodes":["nodo 1",...] (4-8 nodos).
4. type:"content" — Por qué importa. "subheading": 3-4 oraciones con dato real.
5. type:"bullets" — Concepto principal parte 1. 3-4 bullets directos.
6. type:"bullets" o "content" — Parte 2 del concepto.
7. type:"content" o "bullets" — Parte 3 si aplica.
8. type:"practice" — Ejemplo práctico. "steps": 4-6 pasos. "tip": consejo clave.
9. type:"errors" — Errores comunes. "bullets": 4-5 errores reales.
10. type:"exercise" — Ejercicio. "subheading": contexto, "task": tarea concreta.
11. type:"resources" — "items": 4-6 objetos { "text":"nombre", "url":"https://...", "tag":"Video|Herramienta|Artículo|Guía" }. URLs REALES.
12. type:"bullets" — Resumen: 4-5 takeaways accionables.

Tipos: title, content, bullets, checklist, practice, errors, exercise, resources, diagram, quote.`

const SYSTEM_BODY = `Eres un experto en periodismo digital y escritura educativa. Escribís artículos en HTML para periodistas que aprenden IA. Tono cercano, práctico, sin tecnicismos.

Devuelve ÚNICAMENTE el HTML del artículo, sin markdown, sin explicaciones adicionales.

Estructura obligatoria con estas etiquetas exactas:
- <h2> para secciones principales
- <h3> para subsecciones
- <p> para párrafos (mínimo 3 oraciones)
- <ul><li> para listas
- <blockquote> para citas o notas importantes
- <strong> para términos clave

Secciones: Introducción, Conceptos clave, Cómo hacerlo paso a paso, Ejemplo práctico, Errores comunes, Tu ejercicio, Recursos.
Extensión: 600-800 palabras. Directo y útil.`

// Colores de brand de Leadr
const BRAND = {
  primary: '#22D3EE',
  secondary: '#7C3AED',
  bg: '#020617',
  surface: '#0F172A',
  text: '#F8FAFC',
}

const CLASES = [
  {
    id: 22,
    instruction: `Clase: "Hablale bien a Claude: cómo dar contexto para respuestas útiles"

Descripción: Claude no sabe quién sos ni para qué medio trabajás. En esta clase aprendés a presentarte al modelo, darle el tono correcto y el marco de trabajo — para que cada respuesta sea relevante para vos, no genérica.

Contexto: Es la tercera clase de un curso de Claude para periodistas. Ya saben crear cuenta y usar la interfaz básica. Ahora aprenden a mejorar la calidad de las respuestas dando contexto.

Puntos clave a cubrir:
- Qué es el "contexto" en términos de IA y por qué cambia todo
- La diferencia entre un prompt genérico y uno con contexto periodístico
- Cómo presentarte: medio, sección, audiencia, tono editorial
- El concepto de "rol": pedirle a Claude que actúe como editor, investigador o verificador
- Plantilla de contexto base que el periodista puede reusar siempre
- Ejercicio: escribir tu prompt de contexto personal y probarlo con una consulta real`
  },
  {
    id: 23,
    instruction: `Clase: "Investigá cualquier tema en 10 minutos antes de salir a cubrir"

Descripción: Antes de una cobertura tenés que entender el contexto, los actores y los antecedentes. Aprendés a pedirle a Claude un briefing rápido: resumen del tema, cronología, fuentes clave y ángulos que otros no están cubriendo.

Contexto: Cuarta clase del curso. El periodista ya sabe dar contexto. Ahora aplica eso a una tarea concreta: prepararse para cubrir una nota.

Puntos clave a cubrir:
- Por qué el periodista necesita un briefing antes de cubrir (ejemplos reales de errores por no prepararse)
- Cómo pedir un resumen ejecutivo de un tema complejo
- Cómo pedir la cronología de un conflicto o caso
- Cómo identificar los actores clave y sus posiciones
- Cómo pedirle ángulos no cubiertos o preguntas que nadie está haciendo
- Advertencia: Claude tiene fecha límite de conocimiento, qué verificar siempre
- Ejercicio: elegir una nota de mañana y preparar el briefing completo`
  },
  {
    id: 24,
    instruction: `Clase: "Del blanco de la pantalla al primer borrador"

Descripción: La nota en blanco es el peor momento del periodista. En esta clase usás Claude para generar un primer borrador estructurado a partir de tus notas de campo — vos corregís y elevás, pero nunca arrancás de cero.

Contexto: Quinta clase. El periodista ya investigó con Claude. Ahora lo usa para redactar.

Puntos clave a cubrir:
- El bloqueo del periodista ante la pantalla en blanco (es un problema real y común)
- Cómo convertir tus notas de campo en input para Claude (audio transcripto, notas rápidas, datos sueltos)
- Cómo pedir el borrador: estructura, extensión, tono, formato (nota larga, noticia, crónica)
- La regla de oro: Claude da el 60%, vos ponés el 40% restante (voz, criterio, ética)
- Qué no delegar nunca: la selección de qué incluir y qué omitir
- Cómo pedirle que reescriba párrafos específicos que no funcionan
- Ejercicio: llevar tus notas de campo de una nota reciente y generar el borrador`
  },
  {
    id: 25,
    instruction: `Clase: "Preparate para cualquier entrevista con IA"

Descripción: Una entrevista bien preparada cambia todo. Aprendés a pedirle a Claude que analice el perfil del entrevistado, sus declaraciones anteriores y el contexto para generar preguntas que van al hueso.

Contexto: Sexta clase. Aplicación muy concreta de Claude a una tarea central del periodismo.

Puntos clave a cubrir:
- Por qué la preparación es la diferencia entre una entrevista buena y una memorable
- Cómo pedirle a Claude que analice el perfil público de alguien
- Cómo generar preguntas desde distintos ángulos: biográfico, técnico, político, personal
- Las preguntas incómodas: cómo pedirle a Claude que piense en las contradicciones del entrevistado
- Cómo adaptar las preguntas según el formato: TV, radio, texto, podcast
- Qué hacer con la respuesta: filtrar, priorizar, añadir las propias
- Advertencia: Claude no reemplaza conocer a fondo al entrevistado — es un punto de partida
- Ejercicio: preparar preguntas para una entrevista real de la semana`
  },
  {
    id: 26,
    instruction: `Clase: "Qué puede verificar Claude (y qué no)"

Descripción: Claude puede equivocarse y no siempre te avisa. En esta clase entendés sus límites reales: qué sirve para chequear, cuándo confirmar por otra vía y cómo usarlo como punto de partida sin comprometer tu credibilidad.

Contexto: Séptima clase. Crítica para el periodismo responsable — muchos periodistas confían ciegamente en la IA.

Puntos clave a cubrir:
- Qué son las "alucinaciones" y por qué Claude las produce (explicación simple, sin tecnicismos)
- Qué puede verificar con confianza: conceptos, definiciones, contexto histórico, gramática
- Qué NO puede verificar: hechos recientes, citas exactas, estadísticas específicas, nombres propios
- La trampa del texto confiante: Claude suena seguro incluso cuando está equivocado
- Regla de oro: si va a publicarse con tu firma, verificás por fuente primaria
- Cómo pedirle a Claude que sea honesto sobre su incertidumbre
- Herramientas de verificación que sí son confiables para el periodista
- Ejercicio: tomar una respuesta de Claude y verificar tres datos por fuente primaria`
  },
  {
    id: 27,
    instruction: `Clase: "Un contenido, cinco formatos"

Descripción: Escribiste el artículo. Ahora convertilo en hilo de X, post de LinkedIn, guión de reel, intro de newsletter y titular SEO — todo con Claude, en minutos. El mismo trabajo, cinco veces el alcance.

Contexto: Octava clase. Clase Pro orientada a maximizar el rendimiento del trabajo ya hecho.

Puntos clave a cubrir:
- Por qué la distribución multiplataforma es hoy parte del trabajo periodístico
- Las diferencias de tono, formato y extensión entre plataformas (X vs LinkedIn vs Instagram vs newsletter)
- Cómo pedirle a Claude que adapte sin perder la esencia periodística
- Hilo de X: cómo estructurar la información en tweets que enganchen
- Post de LinkedIn: tono más reflexivo, mayor extensión, llamada a la acción
- Guión de reel: narración en primera persona, ritmo visual, duración
- Newsletter: el intro que hace que abran el mail, no el artículo copiado
- Titular SEO: palabras clave, longitud, intención de búsqueda
- Ejercicio: tomar un artículo propio y generar los cinco formatos`
  },
  {
    id: 28,
    instruction: `Clase: "Tu biblioteca de prompts periodísticos"

Descripción: Los mejores prompts no se improvisan, se guardan. En esta clase armás tu colección personal de prompts que funcionan para investigar, redactar, verificar y publicar — para no reinventar la rueda cada vez.

Contexto: Novena clase Pro. El periodista ya usó Claude para múltiples tareas. Ahora sistematiza lo que funciona.

Puntos clave a cubrir:
- Por qué los prompts son activos de trabajo (igual que tus contactos o tu agenda)
- Las categorías de prompts que todo periodista necesita: investigación, redacción, adaptación, verificación, titulares
- Cómo escribir un prompt reutilizable con variables (ej: "[TEMA]", "[MEDIO]", "[AUDIENCIA]")
- Dónde guardar los prompts: Notion, documento de texto, carpeta en Claude Projects
- Los 10 prompts base que debería tener todo periodista digital (con ejemplos concretos)
- Cómo mejorar un prompt que no funciona: el ciclo de iteración
- Ejercicio: escribir y guardar 3 prompts propios en cada categoría`
  },
  {
    id: 29,
    instruction: `Clase: "Claude Projects: dale memoria a tu cobertura"

Descripción: Claude Projects te permite crear un espacio con contexto permanente. Aprendés a armar un proyecto por temática — política, economía, cultura — donde Claude ya sabe quién sos, qué cubrís y cómo escribís.

Contexto: Décima y última clase Pro del curso. El cierre del viaje — de usuario básico a sistema de trabajo propio.

Puntos clave a cubrir:
- Qué es Claude Projects y en qué se diferencia de una conversación normal
- Por qué la memoria es el salto de nivel: no repetir contexto cada vez
- Cómo crear un proyecto: nombre, instrucciones del sistema, archivos de contexto
- Qué subir como contexto: estilo editorial, coberturas anteriores, fuentes recurrentes, línea del medio
- Proyectos recomendados para un periodista: por fuente, por temática, por formato
- Cómo mantener el proyecto actualizado sin que se vuelva un caos
- La diferencia entre un periodista que usa Claude y uno que tiene un sistema con Claude
- Ejercicio: crear tu primer proyecto real y probarlo con una tarea de esta semana`
  },

  // ── CHATGPT ──
  {
    id: 30,
    instruction: `Clase: "Cómo hablarle bien a ChatGPT: contexto y roles para periodistas"

ChatGPT responde mejor cuando sabe quién sos. Esta clase enseña a dar contexto: medio, audiencia, tono. Es la diferencia entre una respuesta genérica y una publicable.

Contexto: Segunda clase del grupo ChatGPT para periodistas. Ya saben crear cuenta. Ahora aprenden a mejorar la calidad de las respuestas.

Puntos clave:
- Qué es el contexto en IA y por qué cambia todo
- Diferencia entre un prompt genérico y uno periodístico
- Cómo presentarte: medio, sección, audiencia, tono editorial
- El concepto de "rol": pedirle a ChatGPT que actúe como editor, investigador o verificador
- Plantilla de contexto base reutilizable
- Qué es el System Prompt y cómo usarlo en ChatGPT
- Ejercicio: escribir tu prompt de contexto personal y probarlo`
  },
  {
    id: 31,
    instruction: `Clase: "Investigá cualquier tema en 10 minutos antes de salir a cubrir"

Antes de cubrir necesitás contexto rápido. Esta clase enseña a pedir un briefing completo a ChatGPT: actores, antecedentes, cronología, ángulos no cubiertos.

Contexto: Tercera clase del grupo ChatGPT. El periodista ya sabe dar contexto. Ahora lo aplica a preparar coberturas.

Puntos clave:
- Por qué la preparación cambia la calidad de la cobertura
- Cómo pedir un resumen ejecutivo de un tema complejo
- Cómo pedir cronología y actores clave
- Cómo identificar ángulos que nadie está cubriendo
- Advertencia: ChatGPT tiene fecha de corte de conocimiento — qué verificar siempre
- Diferencias entre ChatGPT y búsqueda web (ChatGPT con Search)
- Ejercicio: preparar briefing para una cobertura real de esta semana`
  },
  {
    id: 32,
    instruction: `Clase: "Del grabador al texto: resumir y extraer claves de entrevistas"

Tenés una hora de transcripción y necesitás las 10 frases que importan. Esta clase enseña a usar ChatGPT para resumir, identificar citas clave y organizar lo que dijeron las fuentes.

Contexto: Cuarta clase. Caso de uso muy concreto y muy frecuente en el día a día del periodista.

Puntos clave:
- El problema real: horas de audio, minutos para publicar
- Cómo pegar texto largo en ChatGPT correctamente (límites de contexto)
- Cómo pedir resumen ejecutivo vs citas textuales vs temas principales
- Cómo identificar contradicciones o momentos de interés en la transcripción
- Herramientas de transcripción automática que trabajan bien con ChatGPT
- Qué nunca delegar: la selección editorial de qué incluir y qué omitir
- Ejercicio: transcribir 10 minutos de audio y extraer las 5 citas más importantes`
  },
  {
    id: 33,
    instruction: `Clase: "De tus notas al primer borrador sin bloqueo creativo"

La pantalla en blanco frena a cualquiera. Esta clase enseña a convertir notas de campo en un primer borrador estructurado con ChatGPT.

Contexto: Quinta clase. Aplicación directa a la tarea más difícil del periodista: arrancar a escribir.

Puntos clave:
- El bloqueo del periodista ante la pantalla en blanco (es universal y tiene solución)
- Cómo convertir notas de campo en input para ChatGPT
- Cómo pedir el borrador: estructura, extensión, tono, formato (nota, crónica, informe)
- La regla: ChatGPT da el 60%, vos ponés el 40% — voz, criterio y ética son tuyos
- Cómo pedirle que reescriba párrafos específicos que no funcionan
- Qué nunca delegar: qué incluir y qué omitir, eso define al periodista
- Ejercicio: llevar notas de campo de una nota reciente y generar el borrador`
  },
  {
    id: 34,
    instruction: `Clase: "Titulares, leads y bajadas que funcionan"

El titular define si leen o no. Esta clase enseña a pedirle a ChatGPT opciones de título, distintas versiones del lead y la bajada perfecta para cada formato.

Contexto: Sexta clase. Muy práctica y de resultado inmediato — el periodista ve la diferencia en minutos.

Puntos clave:
- Por qué el titular es la decisión editorial más importante
- Cómo pedir 10 opciones de titular y cuáles elegir (criterios periodísticos)
- El lead: las 5 preguntas básicas y cómo pedirle a ChatGPT que las responda
- Bajadas para web vs papel vs newsletter vs redes
- Titulares SEO vs titulares periodísticos: cuándo usar cada uno
- Cómo pedir versiones para distintos ángulos del mismo artículo
- Ejercicio: tomar un artículo propio y generar 5 titulares alternativos`
  },
  {
    id: 35,
    instruction: `Clase: "Qué puede verificar ChatGPT (y qué no)"

ChatGPT inventa con confianza. Esta clase enseña qué son las alucinaciones, cuándo confiar y cuándo verificar siempre por fuente primaria.

Contexto: Séptima clase. Crítica para el periodismo responsable. Muchos periodistas confían ciegamente en la IA y eso tiene consecuencias.

Puntos clave:
- Qué es una alucinación y por qué ChatGPT las produce (explicación sin tecnicismos)
- Qué puede verificar con confianza: conceptos, gramática, contexto histórico
- Qué NO puede verificar: hechos recientes, citas exactas, estadísticas, nombres propios
- La trampa del texto confiante: suena seguro aunque esté equivocado
- Regla de oro: si va a publicarse con tu firma, verificás por fuente primaria
- ChatGPT con Search: mejora pero no resuelve el problema de verificación
- Herramientas de verificación que sí son confiables para periodistas
- Ejercicio: tomar una respuesta de ChatGPT y verificar tres datos`
  },
  {
    id: 36,
    instruction: `Clase: "Mismo contenido, distintas plataformas"

Escribiste la nota. Ahora necesitás el hilo de X, el post de LinkedIn, el guión del reel y la intro de la newsletter. Esta clase enseña a adaptar con ChatGPT sin perder la esencia periodística.

Contexto: Octava clase Pro. Maximizar el rendimiento del trabajo ya hecho es hoy parte central del periodismo digital.

Puntos clave:
- Por qué la distribución multiplataforma es trabajo periodístico, no marketing
- Las diferencias de tono y formato entre X, LinkedIn, Instagram y newsletter
- Hilo de X: estructura que engancha, datos duros primero
- Post de LinkedIn: tono más reflexivo, mayor extensión, llamada a la acción
- Guión de reel: narración en primera persona, ritmo visual, duración óptima
- Newsletter: el intro que hace que abran, no el artículo copiado
- Ejercicio: tomar un artículo propio y generar los cuatro formatos`
  },
  {
    id: 37,
    instruction: `Clase: "ChatGPT avanzado: Custom Instructions y memoria"

Con Custom Instructions ChatGPT ya sabe quién sos antes de escribir la primera palabra. Esta clase enseña a configurar el perfil periodístico permanente y activar la memoria.

Contexto: Novena clase Pro. El periodista ya usó ChatGPT para múltiples tareas. Ahora sistematiza con herramientas avanzadas.

Puntos clave:
- Qué son las Custom Instructions y por qué cambian todo
- Cómo escribir instrucciones efectivas: medio, audiencia, tono, restricciones
- La memoria de ChatGPT: qué guarda, qué no, cómo controlarlo
- Cómo organizar conversaciones por proyecto o temática
- GPTs personalizados: qué son y cuándo vale la pena usarlos
- La diferencia entre un periodista que usa ChatGPT y uno que tiene un sistema
- Ejercicio: configurar tus Custom Instructions y testearlas con tres tareas reales`
  },
  {
    id: 38,
    instruction: `Clase: "Tu workflow completo: un día de trabajo con ChatGPT"

La clase de cierre. Integrás todo: mañana de investigación, tarde de redacción, cierre de publicación y distribución. Un día real de periodismo con IA de principio a fin.

Contexto: Décima y última clase Pro del grupo ChatGPT. El cierre del viaje — de usuario ocasional a sistema de trabajo propio.

Puntos clave:
- La mañana del periodista digital: monitoreo, agenda y briefing con ChatGPT
- La tarde de producción: borrador, edición, titulares y verificación
- El cierre: distribución multiplataforma y newsletter
- Cómo medir qué te ahorra tiempo y qué no vale la pena
- Los límites éticos: qué nunca debe generarse completamente con IA
- La diferencia entre usar ChatGPT como herramienta y depender de él
- Ejercicio: documentar tu propio workflow durante una semana y optimizarlo`
  },
]

function generateSlidesHTML(slides, brand) {
  const b = { ...{ primary: '#22D3EE', secondary: '#7C3AED', bg: '#020617', surface: '#0F172A', text: '#F8FAFC' }, ...brand }

  const slideHTML = slides.map((slide, i) => {
    let content = ''

    if (slide.type === 'title') {
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem;">
          <h1 style="font-size:2.5rem;font-weight:800;color:${b.text};margin-bottom:1rem;line-height:1.2;">${slide.heading || slide.title || ''}</h1>
          ${slide.subheading ? `<p style="font-size:1.2rem;color:${b.primary};opacity:0.9;">${slide.subheading}</p>` : ''}
        </div>`
    } else if (slide.type === 'checklist') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:1.5rem;">${slide.heading || 'Qué vas a aprender'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.75rem;">
            ${(slide.items || []).map(item => `<li style="display:flex;align-items:flex-start;gap:0.75rem;color:${b.text};font-size:1.05rem;"><span style="color:${b.primary};font-weight:700;flex-shrink:0;">✓</span>${item}</li>`).join('')}
          </ul>
        </div>`
    } else if (slide.type === 'bullets') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.8;margin-bottom:1.25rem;font-size:1rem;line-height:1.6;">${slide.subheading}</p>` : ''}
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.75rem;">
            ${(slide.bullets || slide.items || []).map(b2 => `<li style="display:flex;align-items:flex-start;gap:0.75rem;color:${b.text};font-size:1rem;line-height:1.5;"><span style="color:${b.primary};flex-shrink:0;font-size:1.2rem;">→</span>${b2}</li>`).join('')}
          </ul>
        </div>`
    } else if (slide.type === 'content') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};font-size:1.05rem;line-height:1.75;opacity:0.9;">${slide.subheading}</p>` : ''}
        </div>`
    } else if (slide.type === 'practice') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Ejemplo práctico'}</h2>
          <ol style="padding:0 0 0 1.25rem;display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.25rem;">
            ${(slide.steps || []).map(s => `<li style="color:${b.text};font-size:1rem;line-height:1.5;">${s}</li>`).join('')}
          </ol>
          ${slide.tip ? `<div style="background:${b.primary}15;border-left:3px solid ${b.primary};padding:0.75rem 1rem;border-radius:0 8px 8px 0;color:${b.primary};font-size:0.95rem;"><strong>💡 Tip:</strong> ${slide.tip}</div>` : ''}
        </div>`
    } else if (slide.type === 'errors') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:#F87171;margin-bottom:1.25rem;">${slide.heading || 'Errores comunes'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.75rem;">
            ${(slide.bullets || slide.items || []).map(e => `<li style="display:flex;align-items:flex-start;gap:0.75rem;color:${b.text};font-size:1rem;line-height:1.5;"><span style="color:#F87171;flex-shrink:0;font-weight:700;">✗</span>${e}</li>`).join('')}
          </ul>
        </div>`
    } else if (slide.type === 'exercise') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:${b.secondary};margin-bottom:1rem;">${slide.heading || 'Tu ejercicio'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.8;margin-bottom:1rem;font-size:1rem;line-height:1.6;">${slide.subheading}</p>` : ''}
          ${slide.task ? `<div style="background:${b.secondary}20;border:1px solid ${b.secondary}40;padding:1rem 1.25rem;border-radius:10px;color:${b.text};font-size:1rem;line-height:1.6;">${slide.task}</div>` : ''}
        </div>`
    } else if (slide.type === 'resources') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Recursos'}</h2>
          <div style="display:flex;flex-direction:column;gap:0.6rem;">
            ${(slide.items || []).map(item => {
              const text = typeof item === 'string' ? item : item.text
              const url = typeof item === 'string' ? '#' : (item.url || '#')
              const tag = typeof item === 'string' ? '' : (item.tag || '')
              return `<a href="${url}" target="_blank" style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.875rem;background:${b.surface};border:1px solid rgba(255,255,255,0.1);border-radius:8px;text-decoration:none;color:${b.text};font-size:0.95rem;">${tag ? `<span style="background:${b.primary}20;color:${b.primary};font-size:0.75rem;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">${tag}</span>` : ''}<span>${text}</span></a>`
            }).join('')}
          </div>
        </div>`
    } else if (slide.type === 'diagram') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.8rem;font-weight:700;color:${b.primary};margin-bottom:0.75rem;">${slide.heading || slide.center || 'Mapa conceptual'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.75;margin-bottom:1.25rem;font-size:0.95rem;line-height:1.6;">${slide.subheading}</p>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;">
            <span style="background:${b.primary};color:${b.bg};padding:0.5rem 1rem;border-radius:8px;font-weight:700;font-size:0.95rem;">${slide.center || ''}</span>
            ${(slide.nodes || []).map(node => `<span style="background:${b.surface};border:1px solid ${b.primary}40;color:${b.text};padding:0.5rem 1rem;border-radius:8px;font-size:0.9rem;">${node}</span>`).join('')}
          </div>
        </div>`
    } else {
      content = `<div style="padding:2rem;"><p style="color:${b.text};">${slide.heading || ''}</p></div>`
    }

    return `<div class="slide" style="min-height:100vh;background:${b.bg};display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid rgba(255,255,255,0.05);">${content}</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${b.bg}; color: ${b.text}; }
  .slide { scroll-snap-align: start; }
  html { scroll-snap-type: y mandatory; }
</style>
</head>
<body>${slideHTML}</body>
</html>`
}

async function procesarClase(clase) {
  console.log(`\n⏳ [${clase.id}] Generando: "${clase.instruction.split('\n')[0]}"`)

  try {
    // 1a. Generar slides
    const msgSlides = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: SYSTEM_SLIDES,
      messages: [{ role: 'user', content: `Crea los slides para esta clase: ${clase.instruction}` }],
    })
    const rawSlides = msgSlides.content[0].type === 'text' ? msgSlides.content[0].text.trim() : ''
    const jsonMatch = rawSlides.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude no devolvió JSON válido en slides')
    const slidesData = JSON.parse(jsonMatch[0])
    console.log(`  ✓ Slides generados: "${slidesData.title}"`)

    // 1b. Generar body por separado
    const msgBody = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_BODY,
      messages: [{ role: 'user', content: `Escribe el artículo complementario para esta clase: ${clase.instruction}` }],
    })
    const body = msgBody.content[0].type === 'text' ? msgBody.content[0].text.trim() : null
    console.log(`  ✓ Artículo generado`)

    // 2. Generar HTML
    const html = generateSlidesHTML(slidesData.slides, BRAND)

    // 3. Subir a Storage
    const storagePath = `classes/${clase.id}-${Date.now()}/index.html`
    const { error: uploadError } = await supabase.storage
      .from('slides')
      .upload(storagePath, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: false })
    if (uploadError) throw new Error(`Storage: ${uploadError.message}`)

    const slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl
    console.log(`  ✓ Slides subidos`)

    // 4. Actualizar en DB
    const { error: dbError } = await supabase
      .from('classes')
      .update({
        title: slidesData.title,
        description: slidesData.description,
        slides_url: slidesUrl,
        slides_json: { slides: slidesData.slides, body: body ?? null },
      })
      .eq('id', clase.id)
    if (dbError) throw new Error(`DB: ${dbError.message}`)

    console.log(`  ✅ Clase ${clase.id} actualizada`)
    return { id: clase.id, ok: true, title: slidesData.title }

  } catch (err) {
    console.error(`  ❌ Error en clase ${clase.id}:`, err.message)
    return { id: clase.id, ok: false, error: err.message }
  }
}

async function main() {
  // Solo reintentamos las 5 que fallaron
  const pendientes = CLASES.filter(c => [37,38].includes(c.id))
  console.log(`🚀 Reintentando ${pendientes.length} clases pendientes...\n`)

  const resultados = []
  for (const clase of pendientes) {
    const resultado = await procesarClase(clase)
    resultados.push(resultado)
    // Pausa entre llamadas para no saturar la API
    if (pendientes.indexOf(clase) < pendientes.length - 1) {
      console.log('  ⏱  Esperando 3s...')
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  console.log('\n═══════════════════════════════')
  console.log('Resultado final:')
  resultados.forEach(r => {
    console.log(`  ${r.ok ? '✅' : '❌'} [${r.id}] ${r.ok ? r.title : r.error}`)
  })
  console.log(`\n${resultados.filter(r => r.ok).length}/${resultados.length} clases generadas con éxito`)
}

main().catch(console.error)
