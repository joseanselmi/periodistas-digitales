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

## Qué animación es de qué clase

Los nombres no lo dicen solos, así que la tabla completa —guion ↔ animación—
está en el README de cada módulo:
[M0](../modulo_0_bienvenida/README.md) · [M1](../modulo_1_fundamentos/README.md) ·
[M2](../modulo_2_ia/README.md) · [M3](../modulo_3_verificacion/README.md) ·
[M4](../modulo_4_marca/README.md) · [M5](../modulo_5_nicho/README.md).

La convención: **el nombre del módulo, no su número.** `ClaseFundamentos3` es la
clase 3 del módulo 1; `ClaseIA4` es la 2.4; `ClaseNicho6` es la 5.6. El módulo 0
es la excepción — sus animaciones van por tema (`ClaseBienvenida`, `ClaseLeadr`).

> Hay un `Clase01.tsx` suelto que no corresponde a ninguna clase publicada.
> Parece un borrador temprano de la bienvenida. No se borró por las dudas, pero
> **no se usa**: si alguien busca la 0.1, es `ClaseBienvenida.tsx`.

## Por qué las animaciones no están junto a su guion

Es la regla del repo —cada cosa con lo que la usa— y acá **no se aplica**, por
dos motivos concretos:

1. **Cada animación importa el kit, los subtítulos y las duraciones por ruta
   relativa dentro de `src/`**, y `Root.tsx` las junta a todas. Separarlas rompe
   el proyecto.
2. **Esta carpeta es un espejo de un proyecto externo.** Si le cambiamos la
   forma, deja de servir para restaurar, que es su único trabajo.

Por eso el puente es la tabla, no la mudanza.

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
