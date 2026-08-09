# Embudo de regalos — cómo decide qué mandarle a quién

Código: [`api/wa-funnel.js`](../api/wa-funnel.js) · Cron diario 13:00 UTC (10 ART), ver
[`vercel.json`](../vercel.json) · Campaña `meta-leadgen-guia-claude` (lista Brevo #5).

⚠️ **Todo este embudo va por EMAIL.** El archivo se llama `wa-funnel.js` por historia —nació
como embudo de WhatsApp— pero desde el 09/08/2026 no manda un solo mensaje por ese canal, y
el código que lo hacía ya no existe. Las plantillas de WhatsApp quedaron como archivo
histórico en [PLANTILLAS-WHATSAPP.md](PLANTILLAS-WHATSAPP.md): **no describen nada vigente**.

Acá está la **lógica de quién recibe qué**, que cambió el 2026-08-01.

## El recorrido

| Día | Pieza | Marcador en Brevo | Tag en Brevo |
|---|---|---|---|
| 0 | Regalo 1 (email) | — | `regalo1-guia-claude` (lo manda Make) |
| 2 | Regalo 2 (email) | — | `regalo2-50-prompts` (automatización de Brevo) |
| 5 | Regalo 3 — periódico digital | `MAIL3_AT` | `regalo3-periodico` |
| 7 | Regalo 4 — los 5 pilares | `MAIL4_AT` | `regalo4-pilares` |
| 8 | Regalo 5 — agentes de IA | `MAIL5_AT` | `regalo5-agentes-ia` |
| 9 | **Oferta** (la que vende) | `OFERTA_MAIL_AT` | `oferta-email` |
| +48 h | Reenvío de la oferta a quien no la abrió | `OFERTA_MAIL2_AT` | `oferta-reenvio` |

## La regla: se manda lo que FALTA, no "el paso siguiente"

Cada corrida busca, para cada lead, **la primera pieza que le falta y que ya le tocaba**
(orden 3 → 4 → 5 → oferta, respetando el día del embudo: un lead de ayer no recibe hoy
el Regalo 3). Manda una sola y la marca.

**Qué prueba que una pieza ya salió — dos fuentes, no una:**

1. El **marcador** en Brevo (`MAIL3_AT`, etc.).
2. El **registro por persona** en Supabase (`comunicaciones_email`), que llena el webhook
   de Brevo con lo que se mandó de verdad.

Hace falta cruzar las dos porque el marcador se escribe *después* del envío y en otra
llamada: siempre existe una ventana donde el mail salió y el marcador no. Ver
*Los dos incidentes* abajo.

**Topes:** un mail por persona por día (lo marca `WA_SENT_AT`) y `PIEZAS_CAP_DIA` (500)
para toda la campaña, contado sobre la gente ya tocada ese día — **no por corrida**,
porque la función se re-dispara a sí misma hasta 12 veces (Vercel Hobby sólo permite un
cron diario). En la práctica la cadena se corta sola en ~6 corridas: el ritmo real es
~350/día.

**Quiénes quedan afuera:** los que compraron (tabla `ventas`) y los bloqueados en Brevo
(rebote duro, queja de spam o baja) — a estos últimos Brevo no les entrega, así que si no
se saltearan, el envío fallaría, el marcador no se escribiría y volverían a la cola todos
los días para siempre.

**WhatsApp** quedó como canal secundario: sólo sale si Meta dice que el número puede
entregar (hoy no, ver la tarjeta #89) y nunca a alguien que ese día ya recibe un mail.
`WA_STAGE` se sigue actualizando —sólo hacia adelante— para que WhatsApp no repita nada
si el número revive, pero **ya no decide nada**.

## Cómo se mira el estado

```bash
curl "https://sistemadeingresosdiariosia.com/api/wa-funnel?mode=dry&key=$CRON_SECRET"
```

- `total_faltante` — cuántos mails se deben. **Tiene que bajar todos los días hasta 0.**
- `le_falta_a` — el desglose por pieza.
- `registro_envios` — si dice `NO DISPONIBLE`, el cruce contra el registro no está
  actuando y volvemos a depender sólo del marcador: ahí es donde aparecen los duplicados.

> ⚠️ **`mode=dry` es obligatorio.** Sin ese parámetro el modo por defecto es `cron`, que
> **envía de verdad**.

El **Panel de Salud** diario ([`api/salud.js`](../api/salud.js), flujo "🎁 Embudo de
regalos (email)") trae el mismo número y avisa 🔴 si hay cola y hace dos días que no sale
ningún mail. Los dos números tienen que coincidir: si difieren, uno de los dos miente.

## Los dos incidentes que explican por qué está armado así

**1. El Regalo 4 no le llegó a nadie en todo julio.** El embudo decidía el paso siguiente
mirando `WA_STAGE`, que avanza cuando se *dispara* el WhatsApp, no cuando llega. Desde que
Meta capó el número (13/07) quedaron 400 leads marcados como "embudo terminado" sin haber
recibido los Regalos 3 y 4, y como el cálculo sólo miraba hacia adelante, no había forma de
completárselos. Encima la cola salía en orden fijo y el reenvío de la oferta se comía 38 de
los 45 segundos de presupuesto: entraban 11 Regalos 3 por día y el Regalo 4, que iba justo
detrás, no salía nunca. Al detectarlo faltaban **2.177 mails** sobre 919 leads.

**2. 67 Regalos 3 repetidos (31/07).** Al empezar a armar la cola por marcador, salieron de
nuevo mails que esa gente ya había recibido el 29/07: el mail había salido pero el marcador
nunca se escribió (el código de entonces hacía dos PUT después de enviar y bastaba con que
el segundo fallara). De ahí el cruce contra `comunicaciones_email`.

## Trampas conocidas

- **PostgREST corta en 1.000 filas** por más que se pida `limit=20000`, y sin avisar. La
  consulta del registro de envíos traía 944 de 1.306 hasta que se paginó. Vale para
  cualquier consulta REST a Supabase.
- **Vercel Hobby topea en 12 funciones** y `api/` tiene 12 justas: agregar una rompe todo
  deploy del curso. Las nuevas van en `api/_lib/`.
- **Vercel deploya el working tree, no el commit**: verificar con el comando de arriba
  después de cualquier deploy.
- Los flags `MAILREGALOS_ENABLED`, `MAIL5_ENABLED` y `MAILOFERTA_ENABLED` apagan cada
  pieza. Una pieza apagada se saltea y **no** bloquea a las de atrás.
