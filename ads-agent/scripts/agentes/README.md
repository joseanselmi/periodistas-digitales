# scripts/agentes — analizan y deciden

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Los que **miran los datos y sacan una conclusión**: qué escalar, qué pausar, qué
publicar. Cada uno responde a un agente del equipo, cuya personalidad y reglas
están en [`../../cerebro/`](../../cerebro/README.md).

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/agentes/monitor.mjs`

- `audit-cmo.mjs`
- `clara.mjs`
- `control-meta.mjs`
- `email-agent.mjs`
- `monitor.mjs`
- `organic-agent.mjs`
- `radar-tendencias.mjs`
- `review.mjs`

Recomiendan; **no ejecutan cambios en las plataformas por su cuenta** — eso lo
hacen los de [`../publicar/`](../publicar/README.md), y siempre con OK de Jose.
