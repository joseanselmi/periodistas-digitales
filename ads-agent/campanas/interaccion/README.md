# interacción — el gasto fijo de marca

**Padre:** [`ads-agent/campanas/`](../README.md) · Nombre en Meta: `interacción`
· ID `120214924832110063` · Corriendo desde el **14 de diciembre de 2024**

## ⛔ Está prendida a propósito. No proponer apagarla.

Esta ficha existe por un solo motivo: **ya se marcó tres veces como "fuga de
plata", en tres sesiones distintas, y las tres veces la respuesta fue la misma.**
Sin una carpeta que lo diga, cualquiera que cruce el gasto de Meta contra la
documentación la va a volver a encontrar como sorpresa.

Jose la mantiene encendida por dos razones:

1. **Que la página de Facebook crezca de a poco.**
2. **Que Meta vea una cuenta con actividad sostenida**, no una cuenta dormida.

Es un **costo fijo de marca**, del mismo tipo que el hosting. No se juzga contra
las ventas de la semana, igual que no se juzga el dominio. Por diseño **no
produce leads ni ventas**: compra impresiones e interacción.

## Qué está gastando

| Conjunto | Estado | Por día |
|---|---|---|
| `Calentamiento 1 - 15/12/25` | 🟢 activo | $1,00 |
| `Interacción` | 🟢 activo | $1,00 |
| `PERIODICO URGENTE 1` | ⏸️ pausado | — |

**~$2,00 por día.** Acumulado desde diciembre de 2024: unos **$347**.

> Objetivo en Meta: `OUTCOME_ENGAGEMENT`. Es la razón de que no aparezca en
> ningún embudo: no hay nada que atribuirle.

## Lo único que sí es candidato a apagar

Su anuncio **`V1 15/12/25 1USD`**: unos **$30 por mes para 1 solo clic en 30
días**. Apagar ese anuncio es independiente de mantener viva la campaña, y es la
única decisión abierta acá.

## Por qué era invisible hasta el 31/07/2026

`meta-gasto-total-por-anuncio.mjs` solo mira anuncios que **ya tienen ficha** en
`campanas` y cuyo nombre lleva la matrícula `adN-angulo`. "interacción" no la
tiene, así que para el sistema no existía. Y Jose la daba por apagada: en
noviembre de 2025 apagó uno de sus tres conjuntos y los otros dos siguieron.
Apagás un conjunto, ves que algo se apagó, y la campaña sigue en verde.

Lo que se construyó para que no vuelva a pasar:
[`meta-gasto-diario-toda-la-cuenta.mjs`](../../scripts/datos/README.md), que trae
el gasto de **todas** las campañas sin filtrar, y el panel de campañas que lo
muestra en ámbar arriba en vez de esconderlo en un reporte.

## La regla que deja

**Un gasto que aparece solo no es automáticamente un error.** Antes de proponer
cortarlo, preguntar para qué está. Y cuando la respuesta es "está bien así",
**escribirla** — porque una alarma que salta por algo ya decidido se vuelve ruido
que nadie lee, que es exactamente lo que pasó con las recomendaciones de Mateo.

## Al leer el estado en Meta

Mirar **`effective_status`**, nunca `status`. El primero dice cómo lo
configuraste; el segundo mira además si el conjunto o la cuenta lo frenaron.
Leer el equivocado hizo reportar un anuncio como activo cuando estaba apagado.
