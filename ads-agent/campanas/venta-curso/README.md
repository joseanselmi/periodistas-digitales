# venta-curso — la campaña de venta directa del curso

**Padre:** [`campanas/`](../README.md)

La campaña que manda tráfico frío al checkout del curso (US$ 27). Es la que más
gastó y la que más aprendizajes dejó.

## Un detalle de nombre

En Meta **no se llama siempre igual**: la campaña se renombra por mes
(`CURSO Periodistas — VENTAS — Jun 2026`, `— Julio 2026`, y la activa hoy figura
como `Curso Sistema de ingresos diarios para periodistas - VENTAS - Junio 2026`).

Son ediciones mensuales de lo mismo, al mismo público. Por eso la carpeta lleva
el nombre de **qué hace** —vender el curso— y no la copia literal de un mes.
Es la única excepción a la regla de "la carpeta se llama como la campaña en
Meta": ahí el nombre en Meta es una fecha, no una identidad.

## Los anuncios

Cada uno en [`ads/`](ads/README.md), con su matrícula:

| Anuncio | Ángulo | Estado |
|---|---|---|
| `ad1-fomo` | El que sostiene la campaña. 87% del tráfico | 🟢 Activo |
| `ad2-fomo2` | Test B, mismo conjunto que ad1 | Ver ficha |
| `ad3-mundial` | Campaña propia, en paralelo, mientras durara el Mundial | Terminado |

La matrícula (`adN-angulo`) es **la misma cadena** en tres lugares: el `?src=` de
la URL, el campo "Origen" de la venta en Hotmart y la fila de
[`../../registro-anuncios.md`](../../registro-anuncios.md). Así se sigue una venta
hasta el anuncio que la trajo.

## Lo que se aprendió

El histórico completo —gasto, compras y CPA por versión— está en
[`../../docs/HISTORICO-ADS.md`](../../docs/HISTORICO-ADS.md).

Lo más caro de aprender, y que conviene no repetir: **buen CTR con conversión
baja no es problema del anuncio**. Es la landing o el checkout. Diagnosticar por
escalón (CTR de enlace → pagos iniciados → compras) antes de tocar el creativo.

Y los anuncios en prueba **no se mueven hasta ~US$ 70 de gasto** acumulado: antes
de eso la muestra es demasiado chica para leer una señal.
