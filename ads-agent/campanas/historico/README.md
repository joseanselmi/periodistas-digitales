# campanas/historico — las campañas de Meta ya corridas

Una subcarpeta por campaña, nombrada por fecha (`YYYY-MM-DD`). Guarda la
configuración de cada campaña de Meta Ads, los exports de métricas que se bajaron
para analizarla y las auditorías.

## Qué hay dentro

- `YYYY-MM-DD/config.json` — configuración de la campaña y sus anuncios
  (públicos, presupuesto, copy, creativos). Es el punto de partida que leen los
  scripts de review/publish.
- `meta-export-YYYY-MM-DD.json` — snapshot de métricas bajado de Meta para esa
  fecha (gasto, CTR, compras). **Estos exports vencen**: para analizar en vivo se
  vuelve a correr [`scripts/datos/fetch-meta.mjs`](../../scripts/datos/fetch-meta.mjs), no se confía en un export
  viejo.
- `cmo-audit-YYYY-MM-DD.md` — auditoría de la campaña (la produce
  [`scripts/agentes/audit-cmo.mjs`](../../scripts/agentes/audit-cmo.mjs)).
- `reports/` — reportes generados.

> El molde para armar una campaña nueva ya no está acá: se movió el 2026-08-07 a
> [`campanas/TEMPLATE/`](../TEMPLATE/README.md). Esta carpeta es archivo; la
> plantilla vigente va al lado de las campañas vivas.

## Cómo se usa

```bash
# Revisar los ads de una campaña (imagen + copy con Claude Vision)
node ../scripts/agentes/review.mjs campanas/historico/2026-05-08-v2-sin-publicar/config.json

# Traer métricas frescas de Meta
node ../scripts/datos/fetch-meta.mjs
```

## Qué pasó con la campaña del 2026-05-08

Había dos carpetas para la misma campaña y ninguna decía cuál valía:

- `2026-05-08/` — el primer armado. Los tres anuncios pasaron por
  `scripts/agentes/review.mjs` y los tres volvieron con veredicto `MEJORAR_COPY`
  (6 a 8 de puntaje), o sea que no se publicó ninguno. Sus imágenes vivían en
  fal.ai, proveedor dado de baja, así que esos links tampoco resuelven.
- `2026-05-08-v2/` — la reescritura de esos mismos copys, que es lo que quedó.

Se consolidó el **2026-08-07** en `2026-05-08-v2-sin-publicar/`: se quedó la v2 y
se borró el `config.json` de la v1 —queda en el historial de git si alguna vez
hiciera falta—. La subcarpeta `ads/` de la v1 estaba vacía y se fue con ella.

El nombre dice el final: **la v2 tampoco llegó a publicarse**. Le faltaban las
tres imágenes y quedó ahí. Además ese config vende el curso a $10; hoy vale $27,
con lo cual sirve para leer los ángulos de copy, no para relanzarlo tal cual.

## Notas de análisis

- La verdad de las ventas/atribución NO sale de Meta (que sub-cuenta compras):
  sale de la base de marketing por `payload.origin.src`. Ver
  [ARQUITECTURA-DATOS.md](../../docs/ARQUITECTURA-DATOS.md).
- Un anuncio nuevo es un **test**: no se mueve hasta ~$70 de gasto.
