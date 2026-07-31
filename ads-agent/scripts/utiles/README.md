# scripts/utiles — herramientas sueltas

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Lo que no entra en ningún grupo por función.

- `comprimir-img-landing.mjs`
- `trello-task.mjs`

`trello-task.mjs` es el **fallback** del tablero para cuando las herramientas
`mcp__trello__*` no están cargadas en la sesión. Usa la misma API REST vía
[`../../lib/trello.mjs`](../../lib/README.md).

```bash
cd ads-agent
node scripts/utiles/trello-task.mjs listar <Agente>
```
