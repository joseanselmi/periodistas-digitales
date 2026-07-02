# Recuperación de carritos abandonados + pagos rechazados

Tarjeta Trello #34. Doc vivo — Jose no es técnico, acá va todo el contexto para
cualquier sesión futura.

## Qué es

Automatización que **recupera** a los clientes potenciales que ya se guardan solos
en Supabase (tabla `clientes_potenciales` de `periodistas-marketing`, la llena el
webhook de Hotmart — ver [ARQUITECTURA-DATOS.md](../ads-agent/ARQUITECTURA-DATOS.md)
y tarjeta #25). Dos flujos según la columna `tipo`:

- `carrito_abandonado` → 3 emails para que vuelvan y compren.
- `pago_rechazado` → 2 emails avisando que el pago no se procesó + link a reintentar.

## Decisión base: el disparador (por qué un motor en Vercel Cron y no Make)

Una secuencia de recuperación es una **cadencia con delays** (+1h / +24h / +72h),
o sea necesita un scheduler con estado. Disparar al insertar la fila (Supabase
Database Webhook → Make, o el propio webhook de Hotmart) solo resuelve el **primer**
toque; los siguientes igual necesitan un poller. Como el poller es inevitable, y ya
existe **exactamente este molde funcionando y entendido** en el repo
(`api/wa-funnel.js`, el motor del embudo de WhatsApp), la recuperación se hizo con el
mismo patrón: una función que corre por Vercel Cron, lee Supabase, calcula quién está
en el paso N, manda por Brevo, guarda estado para no repetir. Todo en código,
versionado, sin depender de que nadie toque una UI de Make.

## Cómo funciona (`api/recuperacion.js`)

- **Corre** por Vercel Cron cada 6 h (`0 */6 * * *`, ver `vercel.json`). Si el plan de
  Vercel solo dispara crons 1 vez/día, el primer email llega dentro de las 24 h — es
  aceptable para v1; para acelerar se puede subir a plan que permita crons sub-diarios.
- **Fuente:** filas de `clientes_potenciales` con `estado_recuperacion in (pendiente, contactado)`.
- **Estado por persona** (columnas de la tabla):
  - `estado_recuperacion`: `pendiente → contactado → recuperado | perdido`
  - `paso_recuperacion`: `0/1/2/3` — cuántos emails ya se mandaron.
  - `ultimo_contacto_en`: timestamp del último email (respeta un gap mínimo de 12 h).
  - `recuperado_en`: cuándo se detectó la compra.
- **Anti-acoso:** antes de mandar, cruza el email con la tabla `ventas`. Si ya compró
  → `estado=recuperado` y no se le escribe más (esto además mide cuántos recuperamos).
  A quien ya está `recuperado`/`perdido` nunca se lo re-contacta. Máximo **1 email por
  persona por corrida**.
- **Perdido:** tras el último paso, si pasa el plazo sin compra → `estado=perdido`.
- **Reporte diario** por email a Jose (enviados, recuperados, en seguimiento, perdidos).

### Cadencia

| Flujo | Paso 1 | Paso 2 | Paso 3 | → perdido |
|---|---|---|---|---|
| carrito_abandonado | +1 h | +24 h | +72 h | +~4 días tras el paso 3 |
| pago_rechazado | +1 h | +24 h | — | +3 días tras el paso 2 |

### Link de recuperación / atribución

Los botones vuelven a la landing con `?src=` para atribuir la venta recuperada en la
tabla `ventas` (mismo mecanismo que el resto del tracking):

- abandono → `https://sistemadeingresosdiariosia.com/?src=recup-abandono`
- rechazo → `https://sistemadeingresosdiariosia.com/?src=recup-rechazo`

> Pendiente menor: confirmar si Hotmart entrega un link directo de reintento de pago en
> el payload. Por ahora se usa la landing (que tiene el botón de checkout) — es seguro y
> da atribución. Si aparece el link directo, se puede usar para `pago_rechazado`.

## Modos (para probar sin romper nada)

`GET /api/recuperacion?mode=<modo>&key=<CRON_SECRET>`

- `inspect` — muestra las filas candidatas y qué calculó el motor. No manda.
- `dry` — calcula a quién le toca y qué email (con el subject), **sin mandar ni tocar la DB**.
- `stats` — resumen del embudo de recuperación.
- `report` — manda el reporte diario a Jose (no manda recuperaciones).
- `live` — manda de verdad y actualiza la DB. **Requiere además `RECUP_ENABLED=1`.**
- El cron (sin `mode`) equivale a `live`, pero **si `RECUP_ENABLED != 1` se degrada a
  dry**: no manda nada hasta habilitarlo explícitamente.

## Interruptor de seguridad

Nada se envía a clientes reales hasta poner la env var **`RECUP_ENABLED=1`** en Vercel.
Mientras esté apagada, el cron corre pero solo calcula (no manda). Igual que el motor de
WhatsApp con `WA_FUNNEL_ENABLED`.

## Variables de entorno (proyecto Vercel sistema-ingresos-landing)

Ya existen todas menos el interruptor:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — base de marketing (ya cargadas).
- `BREVO_API_KEY` — envío de emails (ya cargada, la usa wa-funnel).
- `CRON_SECRET` — auth del endpoint (ya cargada).
- `RECUP_ENABLED` — **falta**: setear en `1` para el go-live.

## Compliance

- **Email:** mailear a quien entró al checkout y dejó su correo en Hotmart es interés
  legítimo (relación comercial iniciada por el usuario). Cada email lleva header
  `List-Unsubscribe` y un pie con opción de baja (responder `BAJA`). OK para v1.
- **WhatsApp (fase 2, no incluido en v1):** para contactar por WhatsApp en frío hay que
  usar una **plantilla aprobada por Meta**. Queda fuera del v1 (email-only) para no
  bloquear el lanzamiento.

## Estado

- ✅ Motor construido, sintaxis validada, lógica del plan probada en dry contra la fila
  real (Juan Aguilera) + casos sintéticos de ambas secuencias y de las ramas
  recuperado/perdido.
- ✅ Migración aplicada (`paso_recuperacion`, `ultimo_contacto_en` + índice).
- ✅ Cron agregado a `vercel.json`.
- ⏳ **Go-live pendiente de aprobación de Jose:** (1) su OK al copy; (2) `git push` +
  `vercel --prod`; (3) probar `?mode=dry` en producción; (4) recién ahí `RECUP_ENABLED=1`.

## Copy actual (fuente: `api/recuperacion.js`)

### carrito_abandonado
1. **+1 h** — asunto: *"{nombre}, ¿te quedó una duda con el Sistema de Ingresos?"* — "estuviste a un paso, respondé si tenés dudas, volvé a tu lugar".
2. **+24 h** — asunto: *"Lo que más me preguntan antes de empezar"* — objeciones tiempo/"¿sirve para mí?", primer paso.
3. **+72 h** — asunto: *"Última vez que te escribo por esto"* — cierre honesto, sin insistir.

### pago_rechazado
1. **+1 h** — asunto: *"{nombre}, tu pago no se completó (se soluciona en 1 minuto)"* — servicial, reintentar / otro medio de pago.
2. **+24 h** — asunto: *"¿Seguís queriendo entrar al Sistema de Ingresos?"* — "te guardé el lugar", reintentar.

Regla aplicada: **no se menciona el precio** hasta el cierre; tono servicial.
