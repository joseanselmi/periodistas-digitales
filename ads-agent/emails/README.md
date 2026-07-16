# emails/ — Secuencias de email

El contenido de las secuencias de email (bienvenida + seguimiento) y el registro
de lo que se fue enviando.

## Qué hay dentro

- `dia-00-bienvenida.md`, `dia-01-*.md`, `dia-03-*.md`, `dia-07-*.md`,
  `dia-14-*.md` — los emails de la secuencia, uno por día del arco.
- `bienvenida-sin-actividad.md` — variante para quien no mostró actividad.
- `secuencia-completa.md` / `secuencia-completa.json` — la secuencia entera junta
  (el `.json` es la versión que consume el script; el `.md` la legible).
- `campaign-state.json` — estado de la campaña (por dónde va el envío, a quién ya
  se le mandó).
- `log-leadr-l1.csv`, `log-leadr-l2.csv`, `log-leadr-l3.csv` — logs de envío
  (a quién y cuándo se envió cada tanda L1/L2/L3).

## Cómo se usa

Lo maneja el agente de email (Sofía):

```bash
node ../email-agent.mjs      # arma / avanza la secuencia
node ../send-email.mjs       # envío (por Brevo)
```

## Regla importante

Los agentes **no envían emails nuevos sin aprobación**. En regalos 1–4 no se
menciona el precio; el precio se revela recién en la oferta final. Ver
[README de ads-agent](../README.md) y el cerebro de Sofía en
[`../cerebro/`](../cerebro/README.md).
