# Módulo 0 · Bienvenida

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra acabando de comprar, sin saber por dónde empezar, y sale sabiendo
qué va a construir, con qué cabeza encararlo, cómo estudiar el curso, dónde está
la comunidad y con su regalo de Leadr Pro ya activado.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_01.md` | **0.1 · Bienvenida: tu medio, tu voz, tus ingresos.** Qué se va a construir a lo largo del curso. |
| `clase_02.md` | **0.2 · De periodista a emprendedor.** La mentalidad: lo difícil (el oficio) ya lo tenés. |
| `clase_03.md` | **0.3 · Cómo aprovechar el curso.** El curso como un mapa: cómo recorrerlo. |
| `clase_04.md` | **0.4 · Sumate a la comunidad.** Por qué importa, cómo entrar y cómo presentarse. |
| `clase_06_leadr.md` | **0.6 · Tu regalo: Leadr Pro.** El paso a paso real para entrar y usar la plataforma. |
| `clase_07.md` | **0.7 · Lo que hace falta para lograrlo.** Por qué ahora, largo plazo y velocidad. |

`GUION-ELEVENLABS.md` no es una clase: es el texto de voz de las tres primeras,
con la descripción de la voz del curso.

## Dos cosas raras de este módulo

**Falta la `clase_05`.** No está escrita. La 0.4 dice que "el tutorial pasa a
0.5", así que ese lugar quedó reservado para una clase de tutorial que todavía
no existe. La numeración salta de la 0.4 a la 0.6.

**Los archivos se llaman distinto que en el resto del curso** (`clase_01.md` en
vez de `clase_0_1_guion.md`), y es el único módulo sin su `ESTRUCTURA-M0.md`.

## Nada de esto es público

Toda la carpeta `/curso/` está bloqueada en la web por un redirect en
[`../../vercel.json`](../../vercel.json). El alumno recibe estas clases por
Hotmart, nunca por una dirección del sitio.

## De cada clase a su animación

El guion está acá; **el video se arma en otra carpeta**, con un archivo por
clase. Esta tabla los une — sirve para abrir la animación de la clase anterior
antes de encarar la próxima, que es como se van mejorando.

| Guion | De qué trata | Su animación |
|---|---|---|
| [`clase_01.md`](clase_01.md) | Clase 0.1 — Bienvenida: tu medio, tu voz, tus  | `ClaseBienvenida.tsx` |
| [`clase_02.md`](clase_02.md) | Clase 0.2 — De periodista a emprendedor (la tr | `ClaseTransformacion.tsx` |
| [`clase_03.md`](clase_03.md) | Clase 0.3 — Cómo aprovechar el curso | `ClaseAprovechar.tsx` |
| [`clase_04.md`](clase_04.md) | Clase 0.4 — Sumate a la comunidad | `ClaseComunidad.tsx` |
| [`clase_06_leadr.md`](clase_06_leadr.md) | Clase 0.6 — Tu regalo: Leadr Pro (cómo entrar  | `ClaseLeadr.tsx` |
| [`clase_07.md`](clase_07.md) | Clase 0.7 — Lo que hace falta para lograrlo | `ClaseLograr.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
