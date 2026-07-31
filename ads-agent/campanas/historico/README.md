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
- `TEMPLATE/` — molde para armar una campaña nueva (copiar y renombrar por fecha).
- `reports/` — reportes generados.

## Cómo se usa

```bash
# Revisar los ads de una campaña (imagen + copy con Claude Vision)
node ../scripts/agentes/review.mjs campanas/historico/2026-05-08/config.json

# Traer métricas frescas de Meta
node ../scripts/datos/fetch-meta.mjs
```

## Notas de análisis

- La verdad de las ventas/atribución NO sale de Meta (que sub-cuenta compras):
  sale de la base de marketing por `payload.origin.src`. Ver
  [ARQUITECTURA-DATOS.md](../../docs/ARQUITECTURA-DATOS.md).
- Un anuncio nuevo es un **test**: no se mueve hasta ~$70 de gasto.
