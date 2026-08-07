# Módulo 2 · Tu equipo de IA

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra mirando la IA de afuera, sin saber qué pedirle, y sale
dirigiéndola como dirige a un redactor: con roles claros, con instrucciones que
funcionan y con una biblioteca de prompts propia que puede reusar.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_2_1_guion.md` | **2.1 · Qué es la IA y cómo "piensa".** No piensa: predice la continuación de lo que le diste. |
| `clase_2_2_guion.md` | **2.2 · La anatomía de un buen prompt.** Las cuatro piezas: rol, contexto, tarea y formato. |
| `clase_2_3_guion.md` | **2.3 · Hablarle a la IA como a tu redactor.** El valor está en la segunda, tercera y cuarta instrucción. |
| `clase_2_4_guion.md` | **2.4 · Los roles de IA de tu redacción.** El que resume, el que titula, el que verifica, el que adapta, el corrector. |
| `clase_2_5_guion.md` | **2.5 · Construí tu biblioteca de prompts.** Guardar los mejores como plantillas para no reescribir desde cero. |

`ESTRUCTURA-M2.md` es el mapa del módulo: la idea central y el recurso visual de
cada clase, y la regla de que ninguna repite el esqueleto de otra.

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
| [`clase_2_1_guion.md`](clase_2_1_guion.md) | Guion — Clase 2.1 · Qué es la IA y cómo "piens | `ClaseIA1.tsx` |
| [`clase_2_2_guion.md`](clase_2_2_guion.md) | Guion — Clase 2.2 · La anatomía de un buen pro | `ClaseIA2.tsx` |
| [`clase_2_3_guion.md`](clase_2_3_guion.md) | Guion — Clase 2.3 · Hablarle a la IA como a tu | `ClaseIA3.tsx` |
| [`clase_2_4_guion.md`](clase_2_4_guion.md) | Guion — Clase 2.4 · Los roles de IA de tu reda | `ClaseIA4.tsx` |
| [`clase_2_5_guion.md`](clase_2_5_guion.md) | Guion — Clase 2.5 · Construí tu biblioteca de  | `ClaseIA5.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
