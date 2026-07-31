# datos — lo que escriben los scripts

**Padre:** [`ads-agent/`](../README.md)

Todo lo de acá lo **genera un script**. No se edita a mano y **se puede borrar
sin consecuencia**: se vuelve a generar corriendo el script otra vez.

| Carpeta | Lo escribe | Qué es |
|---|---|---|
| `meta-exports/` | [`scripts/datos/fetch-meta.mjs`](../scripts/datos/README.md) | El volcado crudo de la API de Meta: campañas, ad sets, anuncios e insights. Uno por corrida |
| `reports/` | `scripts/agentes/monitor.mjs` | El informe diario de monitoreo |
| `auditorias/` | `scripts/agentes/audit-cmo.mjs` | Las auditorías del CMO sobre una campaña |
| `radar/` | `scripts/agentes/radar-tendencias.mjs` | Qué se está hablando hoy en las fuentes que seguimos |

Se corren siempre parados en `ads-agent/`:

```bash
cd ads-agent
node --env-file=.env.local scripts/datos/fetch-meta.mjs
```

## La única excepción

`radar/fuentes.json` **sí se edita a mano**: es la lista de cuentas y feeds que
lee el radar. Todo lo demás de esa carpeta es salida.

## Por qué existe esta carpeta

Hasta el 2026-08-01 esto vivía mezclado dentro de `campaigns/`, junto a las
carpetas de trabajo de cada campaña. Dos problemas: no se distinguía qué era
insumo y qué resultado, y `campaigns/` convivía con `campanas/` —dos nombres a
una letra de distancia y con significados distintos—, que es una trampa servida.

Ahora la separación es por lo que la cosa **es**: una campaña va en
[`../campanas/`](../campanas/README.md), lo que un script produce va acá.

> Si algo de acá empieza a editarse a mano, es señal de que dejó de ser un dato
> generado y hay que moverlo a donde corresponda.
