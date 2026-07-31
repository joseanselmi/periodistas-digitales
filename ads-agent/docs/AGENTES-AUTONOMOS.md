# Agentes autónomos — que corran diarios solos (tarjeta Trello #53)

Documento vivo. Jose no es técnico: acá queda el contexto completo para cualquier
sesión futura de Claude, sin tener que preguntarle nada técnico. **Toda decisión
nueva se escribe acá en el momento en que se toma.**

## El problema que resuelve

Los 13 agentes (Ricardo, Dante, Valentina, Mateo, Sofía, Luna, Max, Director,
Bruno, Nicolás, Valeria, Miguel, Clara) son **skills locales** (`/mateo`, `/sofia`…)
que **solo corren cuando Jose los invoca a mano**. Por eso sus `state/*.json`
quedaban congelados (la mayoría en mayo). El equipo estaba "bloqueado": nadie los
disparaba solos.

Lo único que ya corría solo en la nube eran **monitores** (Panel de Comando,
Monitor de Funnel Leads) — te *reportan* el estado, pero **no hacen el trabajo del
agente**. Clara sí es autónoma de verdad, pero porque es código en Vercel
(`scripts/agentes/clara.mjs`), no un skill.

## La decisión (2026-07-05)

Con Jose: **uno a uno** (arrancamos con Mateo como molde, y después se clona al
resto de a uno), y **modo "analizan y recomiendan, vos aprobás"** — respeta la
regla permanente de que los agentes NO ejecutan acciones hacia afuera (mandar
emails, publicar, mover presupuesto) sin el OK de Jose (ver memoria
`feedback_agentes_autonomia`). El agente autónomo **piensa y propone**; Jose (y
Claude en sesión) **disponen**.

## Arquitectura (el molde)

Cada agente autónomo es una **rutina de nube** (RemoteTrigger / claude.ai routine)
que corre en cron y hace, en una sesión limpia:

1. **Lee datos reales por MCP** (Supabase / Make). La nube **NO clona el repo** y
   **NO tiene salida a internet** (curl da 403) → todo va por conectores MCP.
   Nada de leer `state/*.json` ni `campanas/` del repo.
2. **Hace el análisis del día** con el criterio del agente (su árbol de decisión,
   sus benchmarks) — embebido en el prompt, no en archivos del repo.
3. **Escribe su recomendación** en la tabla `agentes_bitacora` (una fila por
   agente por día, idempotente).
4. **Deja el email** en el buzón de Make `notif_outbox` (169612) y **dispara el
   Cartero** (scenario 9470203) → le llega a Jose. Nunca por Gmail (el conector
   solo crea borradores). Ver `NOTIFICACIONES-CARTERO.md`.

**Regla de oro del prompt:** el agente SOLO analiza, guarda y avisa. No toca nada
hacia afuera. La acción concreta va marcada como **"ACCIÓN RECOMENDADA (esperando
tu OK)"** y Jose la aprueba respondiendo; ahí Claude (en sesión) la ejecuta y
actualiza el estado oficial.

### Tabla `agentes_bitacora` (creada 2026-07-05, migración `crear_tabla_agentes_bitacora`)

El **diario de las corridas autónomas** + la **cola de acciones que esperan OK**.
No reemplaza `agentes_estado` (ese sigue siendo el espejo del repo = "estado
oficial", lo llena `sync-estados.js` desde GitHub). Separados a propósito: así la
corrida autónoma no pisa el estado del repo, y el estado oficial solo avanza
cuando el trabajo se aprueba/hace de verdad.

| Columna | Para qué |
|---|---|
| `agente` | mateo, sofia, dante… |
| `fecha` | día de la corrida (`UNIQUE (agente, fecha)` → idempotente) |
| `metricas` (jsonb) | los números que leyó ese día (auditoría) |
| `diagnostico` | qué encontró |
| `recomendacion` | la acción concreta que propone |
| `prioridad` | alta / media / baja |
| `estado` | pendiente → aprobada / descartada / hecha |

RLS on sin políticas (mismo criterio que el resto de `periodistas-marketing`).
Para ver las recomendaciones pendientes:
```sql
SELECT agente, fecha, prioridad, recomendacion
FROM agentes_bitacora WHERE estado = 'pendiente' ORDER BY fecha DESC, prioridad;
```

## Agente #1 — Mateo (media buyer) — ✅ LIVE 2026-07-05

- **Rutina:** `trig_015hDyKE66YQP1sqQWV8bCMp` "Mateo autonomo diario - Media Buyer
  (recomienda, Jose aprueba)". Cron `0 16 * * *` (16:00 UTC / 13:00 ART).
- **Por qué 16:00 UTC:** el gasto de Meta (`campanas.gasto_usd`) lo sincroniza el
  cron de `recuperacion` a las 15:00 UTC. Mateo corre **después** para leerlo
  fresco.
- **Conectores:** Supabase (lee `campanas`/`ventas`/`clientes_potenciales`/
  `gastos_meta_mensual` + escribe `agentes_bitacora`) + Make (Cartero). Sin Gmail.
- **Qué hace:** calcula CPA (curso y total), ROAS, CTR, frecuencia por anuncio
  activo; aplica el árbol de decisión del cerebro de Mateo (CPA obj <$12, alerta
  >$15, crítico >$18; CTR >2%; freq <2.5); detecta fuga de checkout y chequeos de
  higiene (anuncio sin ficha, sync de gasto atrasado); elige UNA acción
  prioritaria; la guarda y la manda para aprobación.
- **Modelo:** `claude-sonnet-4-6` (alcanza para leer datos + aplicar el criterio;
  costo bajo para una rutina diaria).
- **Fuente de datos (05/07):** lee **`meta_insights_diario`** — métricas de Meta POR
  DÍA y por anuncio, ya en **horario ARG** (Meta reporta en el timezone de la cuenta).
  La llena el sync `meta-daily-sync` (ver abajo). Con eso Mateo manda un **resumen del
  día** con las métricas que pidió Jose: **gasto, CTR de enlace** (link_clicks/impresiones,
  NO el CTR total), **pagos iniciados** (initiate checkout), **ventas**, **% pago iniciado**
  (pagos_iniciados/link_clicks) y **% conversión a compra** (compras/pagos_iniciados) —
  más una mini-tendencia de ~5 días.
- **Reglas de decisión (metodología de Jose, ver [[feedback_analisis_ads_test]]):**
  anuncios en prueba = no mover nada hasta ~$70 de gasto; presupuesto bajo ($10/día el
  principal, $1–2/día satélites); diagnóstico por escalón (CTR enlace → % pago iniciado
  → % conv compra); buen CTR + baja conversión = checkout/oferta, no el anuncio. Estas
  reglas están en el prompt de la rutina Y en `cerebro/mateo.md` — **si cambian en el
  cerebro, actualizar el prompt** (`RemoteTrigger update`).
- **Probado E2E 2026-07-05:** `RemoteTrigger run` → fila en `agentes_bitacora` +
  email por el Cartero (verificado leyendo el mail en Gmail).

## Sync de datos: `meta-daily-sync` (métricas de Meta por día → Supabase)

La rutina de Mateo corre en la nube **sin egress**, así que no puede pegarle a Meta.
Este sync corre donde SÍ hay internet (el cron de Vercel) y deja los datos en la base:
- **Tabla `meta_insights_diario`** (migración `crear_tabla_meta_insights_diario`): grain
  `(fecha, src)`. Columnas: `spend_usd`, `impresiones`, `link_clicks`, `landing_views`,
  `pagos_iniciados`, `compras`. `fecha` = día **ARG** (Meta reporta en el TZ de la cuenta).
- **Código:** `ads-agent/scripts/datos/meta-daily-sync.mjs` (local/manual) + `sistema-ingresos/api/_lib/
  meta-daily-sync.js` (`runMetaDailySync`, serverless). Trae `insights` con
  `time_increment=1` + `actions` (initiate_checkout, purchase, landing_page_view), agrega
  por `(fecha, src)` y hace upsert. Best-effort.
- **Automatizado:** `api/recuperacion.js` lo llama en su cron diario (15:00 UTC), junto a
  `runHotmartSync` / `runMetaSpendSync` / `runSyncEstados` (tope Hobby = sin cron propio).
  Deploy 2026-07-05. Backfill inicial hecho a mano (29/06→04/07).

### El criterio de Mateo (embebido en el prompt, no en el repo)

Copiado del cerebro (`cerebro/mateo.md`) porque la nube no lee el repo. Si el
criterio de Mateo cambia en el cerebro, **hay que actualizar también el prompt de
la rutina** (`RemoteTrigger update trig_015hDyKE66YQP1sqQWV8bCMp`). Esta
duplicación es el costo de que la nube no clone el repo; se acepta a cambio de que
corra solo.

## Cómo replicar al próximo agente (uno a uno)

1. **Confirmar con Jose** que Mateo aporta valor antes de clonar (política "uno a uno").
2. Elegir el próximo (sugerido por impacto: **Sofía** email → **Dante** analytics).
3. Verificar que sus datos estén disponibles por MCP (Supabase/Make). Si el agente
   necesita algo que no está en la base, primero llevarlo a la base.
4. Copiar la rutina de Mateo (`RemoteTrigger create`), cambiar: nombre, prompt
   (PASO 1 = las queries de ese agente; PASO 2 = su criterio; PASO 4 = su formato),
   `agente` en el INSERT a `agentes_bitacora`, y los conectores si difieren.
5. `RemoteTrigger run` para probar E2E; verificar la fila en `agentes_bitacora` +
   el email. Recién ahí darlo por LIVE.
6. Documentar acá como "Agente #N — <nombre> — ✅ LIVE <fecha>".

### Notas / pendientes

- **Riesgo de inundar la casilla:** con 13 agentes mandando 1 email/día c/u +
  Panel + Monitor, son muchos mails. Durante el piloto (uno a uno) está bien para
  evaluar. **Al escalar**, evaluar **consolidar** las recomendaciones dentro del
  Panel de Comando (que ya lee la base a diario): el Panel podría leer
  `agentes_bitacora` (recomendaciones `pendiente` de hoy) y meterlas en su sección
  "PRIMER MOVIMIENTO", en vez de un email por agente.
- **Aprobar/cerrar una recomendación:** cuando Jose responde OK, Claude en sesión
  ejecuta la acción, actualiza el `state/*.json` local del agente (fuente oficial)
  y marca la fila de `agentes_bitacora` como `hecha` (o `descartada` si Jose la
  rechaza). El próximo `sync-estados` propaga el estado oficial a `agentes_estado`.
- **Agentes sin trabajo diario real** (Director/curriculum, Max/QA semanal): no
  todos justifican una rutina *diaria*. Para esos, cron semanal o dejarlos a
  demanda.
