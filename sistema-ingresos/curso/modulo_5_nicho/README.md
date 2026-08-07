# Módulo 5 · Tu nicho y tu lector

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra queriendo hablarle a todos y sale con una decisión tomada: un
nicho validado, su ángulo propio dentro de él, un lector con nombre y apellido,
y una promesa editorial escrita en una línea.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_5_1_guion.md` | **5.1 · La teoría del nicho.** Enfocarte no te achica el público: te vuelve imprescindible para un grupo. |
| `clase_5_2_guion.md` | **5.2 · Los 3 filtros de un nicho rentable.** Dónde se cruzan pasión, demanda y dinero. |
| `clase_5_3_guion.md` | **5.3 · Investigar y validar tu nicho con IA.** La demanda no se supone: deja huellas concretas y se comprueba. |
| `clase_5_4_guion.md` | **5.4 · Tu ángulo único dentro del nicho.** El mismo tema, otra puerta de entrada: la tuya. |
| `clase_5_5_guion.md` | **5.5 · Tu lector ideal.** Armar el avatar: quién es, qué le duele, qué desea, cómo habla. |
| `clase_5_6_guion.md` | **5.6 · Tu propuesta editorial y tu línea.** La promesa que atrae y el filtro de qué cubrís y qué no. |

`ESTRUCTURA-M5.md` es el mapa del módulo.

Este es el módulo que se produjo **antes que M4**, al revés del número, porque el
nombre y la marca salen del nicho ya elegido. En Hotmart va en ese mismo orden.

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
| [`clase_5_1_guion.md`](clase_5_1_guion.md) | Guion — Clase 5.1 · La teoría del nicho: por q | `ClaseNicho1.tsx` |
| [`clase_5_2_guion.md`](clase_5_2_guion.md) | Guion — Clase 5.2 · Los 3 filtros de un nicho  | `ClaseNicho2.tsx` |
| [`clase_5_3_guion.md`](clase_5_3_guion.md) | Guion — Clase 5.3 · Investigar y validar tu ni | `ClaseNicho3.tsx` |
| [`clase_5_4_guion.md`](clase_5_4_guion.md) | Guion — Clase 5.4 · Tu ángulo único dentro del | `ClaseNicho4.tsx` |
| [`clase_5_5_guion.md`](clase_5_5_guion.md) | Guion — Clase 5.5 · Tu lector ideal: construí  | `ClaseNicho5.tsx` |
| [`clase_5_6_guion.md`](clase_5_6_guion.md) | Guion — Clase 5.6 · Tu propuesta editorial y t | `ClaseNicho6.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
