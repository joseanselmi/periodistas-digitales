# Módulo 4 · El nombre y la marca

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra con el nicho y el lector ya definidos pero sin cara, y sale con
nombre elegido y verificado, colores, tipografía, logo y voz propia, todo junto
en una hoja de marca de una carilla.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_4_1_guion.md` | **4.1 · La teoría del nombre.** Qué hace que un nombre se recuerde: corto, se dice fácil, se entiende, es tuyo. |
| `clase_4_2_guion.md` | **4.2 · Creá tu nombre con IA (y chequeá que esté libre).** La IA da cantidad; el criterio y el chequeo los ponés vos. |
| `clase_4_3_guion.md` | **4.3 · Tu color.** Qué transmite cada color y cómo armar una paleta simple: principal, acento y neutros. |
| `clase_4_4_guion.md` | **4.4 · Tipografía y logo sin diseñador.** Una o dos letras legibles y un logo simple con tu nombre bien puesto. |
| `clase_4_5_guion.md` | **4.5 · El sistema de marca.** Coherencia: las mismas pocas decisiones repetidas siempre igual, también en cómo escribís. |

`ESTRUCTURA-M4.md` es el mapa del módulo.

## Este módulo está en hold

M4 está **producido y revisado, pero no subido**. Faltan los últimos pasos, que
quedaron frenados cuando se agotó la cuota mensual de voz. El detalle de qué
falta y cómo terminarlo está en [`HANDOFF-M4.md`](HANDOFF-M4.md).

Ojo con el orden: **en Hotmart M4 va después de M5**, al revés del número,
porque el nombre y la marca salen del nicho ya definido.

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
| [`clase_4_1_guion.md`](clase_4_1_guion.md) | Guion — Clase 4.1 · La teoría del nombre: qué  | `ClaseMarca1.tsx` |
| [`clase_4_2_guion.md`](clase_4_2_guion.md) | Guion — Clase 4.2 · Creá tu nombre con IA (y c | `ClaseMarca2.tsx` |
| [`clase_4_3_guion.md`](clase_4_3_guion.md) | Guion — Clase 4.3 · Tu color: qué transmite y  | `ClaseMarca3.tsx` |
| [`clase_4_4_guion.md`](clase_4_4_guion.md) | Guion — Clase 4.4 · Tipografía y logo sin dise | `ClaseMarca4.tsx` |
| [`clase_4_5_guion.md`](clase_4_5_guion.md) | Guion — Clase 4.5 · El sistema de marca: coher | `ClaseMarca5.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
