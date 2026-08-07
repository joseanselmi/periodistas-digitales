# Módulo 1 · Fundamentos

**Padre:** [`sistema-ingresos/curso/`](../README.md)

El alumno entra con oficio periodístico pero sin entender cómo un medio propio
genera ingresos, y sale entendiendo la máquina completa —de cómo lo encuentra
gente nueva hasta cómo aparece el ingreso— y sabiendo diagnosticar en qué etapa
se le frena.

## Las clases

| Archivo | De qué trata |
|---|---|
| `clase_1_1_guion.md` | **1.1 · El negocio de un medio de nicho.** Activo vs producto, audiencia propia vs prestada, la confianza como capital. |
| `clase_1_2_guion.md` | **1.2 · La máquina por dentro: las cinco etapas.** Alcance, atención, seguimiento, audiencia propia, ingreso. |
| `clase_1_3_guion.md` | **1.3 · Alcance: cómo te encuentra la gente que no sabe que existís.** Por qué una plataforma te reparte o no. |
| `clase_1_4_guion.md` | **1.4 · De visitante a seguidor.** Qué decide alguien en los tres segundos en que te ve por primera vez. |
| `clase_1_5_guion.md` | **1.5 · De seguidor a suscriptor.** Por qué el correo es el único canal que es realmente tuyo. |
| `clase_1_6_guion.md` | **1.6 · El efecto compuesto.** La mecánica de por qué crece lento y después se dispara. |
| `clase_1_7_guion.md` | **1.7 · Cómo saber si tu máquina está funcionando.** Señales que avisan antes de que haya ingresos. |

`ESTRUCTURA-M1.md` es el mapa del módulo: qué concepto vive en qué clase, para
que no se repitan entre sí.

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
| [`clase_1_1_guion.md`](clase_1_1_guion.md) | Guion — Clase 1.1 · El negocio de un medio de  | `ClaseFundamentos1.tsx` |
| [`clase_1_2_guion.md`](clase_1_2_guion.md) | Guion — Clase 1.2 · La máquina por dentro: las | `ClaseFundamentos2.tsx` |
| [`clase_1_3_guion.md`](clase_1_3_guion.md) | Guion — Clase 1.3 · Alcance: cómo te encuentra | `ClaseFundamentos3.tsx` |
| [`clase_1_4_guion.md`](clase_1_4_guion.md) | Guion — Clase 1.4 · De visitante a seguidor: q | `ClaseFundamentos4.tsx` |
| [`clase_1_5_guion.md`](clase_1_5_guion.md) | Guion — Clase 1.5 · De seguidor a suscriptor:  | `ClaseFundamentos5.tsx` |
| [`clase_1_6_guion.md`](clase_1_6_guion.md) | Guion — Clase 1.6 · El efecto compuesto: por q | `ClaseFundamentos6.tsx` |
| [`clase_1_7_guion.md`](clase_1_7_guion.md) | Guion — Clase 1.7 · Cómo saber si tu máquina e | `ClaseFundamentos7.tsx` |

Las animaciones viven en [`../video-studio/src/`](../video-studio/README.md).
**Ojo:** esa carpeta es el **respaldo**; el proyecto donde se trabaja de verdad
está fuera del repo, en `remotion-curso`. No están junto al guion porque cada
animación importa el kit, los subtítulos y las duraciones por ruta relativa
dentro de `src/`, y separarlas rompería el proyecto entero.
