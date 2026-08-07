# video-studio — el respaldo del estudio de video

**Padre:** [`sistema-ingresos/curso/`](../README.md)

Acá vive la **copia de seguridad** del proyecto que convierte un guion en un
video animado con voz. Con él se hicieron las 28 clases publicadas del curso.

> ⚠️ **Esto es un respaldo, no el estudio.** No se trabaja acá ni se corre nada
> desde esta carpeta. El estudio que se usa de verdad está en
> `C:\Users\Jose Anselmi\remotion-curso`, fuera del repo porque tiene
> `node_modules` (cientos de megas de librerías que se pueden reinstalar).

## Qué está respaldado y qué no

| | Dónde | ¿Está a salvo? |
|---|---|---|
| **El código de las 34 clases animadas** | acá, `src/` | ✅ sí |
| El kit de animaciones y las duraciones | acá, `src/lib/` y `src/dur/` | ✅ sí |
| Los scripts de voz, subtítulos y subida a YouTube | acá, la raíz y `yt/` | ✅ sí |
| **El audio de las voces** (~830 MB) | solo en `remotion-curso/public/` | ⚠️ **no** |
| Los videos terminados | YouTube | ✅ sí, publicados |
| Las librerías (`node_modules`) | ninguna | no hace falta: `npm install` las trae |
| La clave de ElevenLabs | `remotion-curso/.env` | nunca va acá |

**El audio es lo único importante sin respaldo.** Se puede volver a generar, pero
gasta cuota de ElevenLabs — la misma que tiene el módulo 4 en pausa. Si el disco
se rompe, las voces hay que rehacerlas y pagarlas de nuevo.

## Por qué esta carpeta existe

El estudio real **no tiene copia en ningún lado**: no está en git ni en OneDrive,
vive solo en el disco de esa computadora. Si ese disco falla, se pierde la
capacidad de editar una clase o producir una nueva — los videos ya publicados
quedan en YouTube, pero no se puede volver a tocarlos.

Hasta el 2026-08-07 esta copia tenía **4 clases de 38**: quedó congelada al
principio de todo y nunca se volvió a sincronizar. Un respaldo desactualizado al
90% es peor que ninguno, porque hace creer que estás cubierto.

## Cómo se vuelve a sincronizar

Cada vez que se termina un módulo, se copian estas tres cosas desde
`remotion-curso/`: la carpeta `src/`, la carpeta `yt/` y los `.mjs` de la raíz.
**Nunca `public/` ni `node_modules/` ni `.env`.**

## Cómo se recupera, si hiciera falta

1. Copiar esta carpeta a `C:\Users\<usuario>\remotion-curso`
2. `npm install` — trae las librerías
3. Crear el `.env` con `ELEVENLABS_API_KEY`
4. Volver a generar las voces (gasta cuota) o restaurar `public/` de donde haya copia

El flujo completo para producir una clase está en la skill
[`crear-clase-video`](../../../.claude/skills/crear-clase-video/SKILL.md).
