# curso — el producto principal (US$ 27)

**Padre:** [`sistema-ingresos/`](../README.md)

Los guiones de las clases de **"Sistema de Ingresos Diarios para Periodistas"**,
uno por archivo. Es contenido pedagógico, no código.

## Los módulos

| Carpeta | Módulo | Clases |
|---|---|---|
| `modulo_0_bienvenida/` | Bienvenida | 6 |
| `modulo_1_fundamentos/` | Fundamentos | 7 |
| `modulo_2_ia/` | Tu equipo de IA | 5 |
| `modulo_3_verificacion/` | Verificación y credibilidad con IA | 4 |
| `modulo_4_marca/` | El nombre y la marca | 5 |
| `modulo_5_nicho/` | Tu nicho y tu lector | 6 |

Más `clase_final.md` (el cierre de todo el curso, por eso está suelto y no dentro
de un módulo) y [`quizzes/`](quizzes/README.md).

Cada módulo tiene su `ESTRUCTURA-MN.md`, que es el mapa de sus clases y el arco
que recorren. Los guiones se llaman `clase_<módulo>_<número>_guion.md`.

**Estado:** M0, M1, M2, M3 y M5 están publicados (28 clases en YouTube, no
listadas, embebidas en Hotmart). **M4 está producido pero en hold** — ver
`modulo_4_marca/HANDOFF-M4.md`. En Hotmart el orden de subida es **M5 antes que M4**.

## `material-viejo/`

`modulo_3_monetizacion/` y `modulo_4_profesionalizacion/` son de un **currículum
anterior**: otra numeración (`clase_11`…`clase_20`) y otros temas. No son las
clases actuales y no se suben a ningún lado.

Se conservan porque el plan vigente los marca como **materia prima a re-guionar**
(ver [`docs/PLAN-CURRICULUM-DEFINITIVO.md`](docs/PLAN-CURRICULUM-DEFINITIVO.md)).
Estaban sueltos junto a los módulos reales, con números que chocaban — de ahí que
hubiera "dos módulo 3" y "dos módulo 4".

## Cómo se escribe una clase

El molde, el tono y las reglas están en `docs/`:
[`MOLDE-CLASE.md`](docs/MOLDE-CLASE.md) ·
[`PLAN-CURRICULUM-DEFINITIVO.md`](docs/PLAN-CURRICULUM-DEFINITIVO.md) ·
[`BANCO-DE-FRASES.md`](docs/BANCO-DE-FRASES.md)

Todo guion pasa por dos revisiones antes de producirse: el revisor de clase y el
agente que simula al alumno. Y **Jose aprueba el guion antes de que se produzca
el video.**

## Nada de esto es público

Aunque cuelga de `sistema-ingresos/`, que Vercel publica entero, hay un redirect
en [`../vercel.json`](../vercel.json) que manda `/curso/*` a la home: es el
contenido que la gente paga.
