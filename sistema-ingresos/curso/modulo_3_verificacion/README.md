# Módulo 3 · Verificación y credibilidad con IA

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra sabiendo usar la IA y sale sabiendo que su firma vale: puede
chequear una imagen, un dato o una declaración en minutos, y mostrar cómo lo
hizo para que eso mismo le sume confianza.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_3_1_guion.md` | **3.1 · La credibilidad como base del negocio.** Es un capital: se junta lento y se cuida. |
| `clase_3_2_guion.md` | **3.2 · Verificar imágenes y videos en segundos.** Las señales que delatan un falso y la búsqueda de origen. |
| `clase_3_3_guion.md` | **3.3 · Chequear declaraciones y datos con IA.** Triangular contra varias fuentes y llegar a la primaria. |
| `clase_3_4_guion.md` | **3.4 · Transparencia: mostrar tu proceso genera confianza.** Contar cómo verificaste blinda la nota. |

`ESTRUCTURA-M3.md` es el mapa del módulo. Ahí está la advertencia que lo cruza
entero: acá la IA es a la vez la que ayuda a verificar y la que puede inventar,
así que el criterio final siempre es del periodista.

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
| [`clase_3_1_guion.md`](clase_3_1_guion.md) | Guion — Clase 3.1 · La credibilidad como base  | `ClaseVerif1.tsx` |
| [`clase_3_2_guion.md`](clase_3_2_guion.md) | Guion — Clase 3.2 · Verificar imágenes y video | `ClaseVerif2.tsx` |
| [`clase_3_3_guion.md`](clase_3_3_guion.md) | Guion — Clase 3.3 · Chequear declaraciones y d | `ClaseVerif3.tsx` |
| [`clase_3_4_guion.md`](clase_3_4_guion.md) | Guion — Clase 3.4 · Transparencia: mostrar tu  | `ClaseVerif4.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
