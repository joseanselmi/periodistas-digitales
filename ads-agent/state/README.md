# state/ — Estado persistente de cada agente

Un archivo `<agente>-state.json` por agente autónomo. Es la "memoria de trabajo"
de cada uno: qué hizo, cuándo corrió por última vez, qué quedó pendiente. Los
scripts lo leen al arrancar y lo actualizan al terminar, para no repetir trabajo
y para poder reportar el estado del equipo.

## Archivos

`clara`, `dante`, `director`, `luna`, `mateo`, `max`, `nicolas`, `ricardo`,
`sofia`, `valentina`, `valeria` → `*-state.json`.

## Diferencia con cerebro/

- [`../cerebro/`](../cerebro/README.md) = **quién es** el agente (personalidad,
  reglas). No cambia solo.
- `state/` = **qué está haciendo** el agente ahora. Se actualiza cada corrida.

## Espejo en la nube

El "Panel de Comando" diario corre en la nube y no puede leer estos JSON del
repo. Por eso [`sistema-ingresos/api/_lib/sync-estados.js`](../../sistema-ingresos/api/_lib/README.md)
los copia a la tabla `agentes_estado` de Supabase, de donde el panel los lee.
Detalle en [NOTIFICACIONES-CARTERO.md](../docs/NOTIFICACIONES-CARTERO.md) (tarjeta
Trello #32).
