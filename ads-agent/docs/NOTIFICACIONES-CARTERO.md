# Sistema de notificaciones por email — "Cartero" (buzón → Gmail)

**Problema que resuelve (02/07/2026):** las rutinas en la nube (Panel de Comando,
Monitor de Leads) generaban su reporte pero **nunca lo entregaban por email**. Causa
raíz real: el **conector de Gmail de Claude no puede enviar** — solo crea borradores
(es así por diseño de Anthropic; no hay herramienta "send"). Además, el **sandbox de
las rutinas no tiene salida a internet**: cualquier `curl` saliente muere con
`CONNECT tunnel failed, response 403` / `HTTP:000` (un proxy bloquea el egress). Por
eso tampoco se puede llamar a Brevo directo desde la rutina. La única puerta de salida
del sandbox son los **conectores MCP** (Gmail, Make…).

> El "fix" del 30/06 (reconectar Gmail) fue un **falso positivo**: los 2 mails que
> aparecieron en Enviados ese día eran borradores que Jose mandó a mano. Reconectar el
> scope no cambia nada porque la herramienta de envío no existe.

## Arquitectura (patrón outbox)

```
Rutina nube ──(Make MCP: data-store-records_create)──►  Buzón (Make Data Store)
      │                                                       │
      └──(Make MCP: scenarios_run 9470203)──► Cartero ◄───────┘
                                     │   (on-demand al instante;
                                     │    + poll de seguridad cada 6 h)
                                     ├─ HTTP POST a Brevo (envía el email)
                                     └─ borra el registro del buzón
                                                │
                                                ▼
                                     Inbox de joseanselmi27@gmail.com
```

La rutina **deposita** `{subject, text}` en el buzón vía Make MCP y **dispara el
Cartero** con `scenarios_run` (envío inmediato). El Cartero además hace un poll de
seguridad cada 6 h por si el disparo on-demand fallara. El envío real (HTTP a Brevo)
lo hace Make **en su nube**, que sí tiene internet.

## IDs y recursos (Make, team 1749729 / org 3703862)

| Recurso | ID | Nota |
|---|---|---|
| Data store **notif_outbox** (buzón) | **169612** | estructura `notif_outbox_struct` (598380): campos `subject`, `text` |
| Escenario **Cartero** | **9470203** | activo, `interval 21600` (poll de seguridad cada 6 h); las rutinas lo disparan on-demand con `scenarios_run` para envío inmediato |
| Remitente Brevo | `jose@sistemadeingresosdiariosia.com` | ya autenticado (mismo que usa el funnel) |
| Rutina Panel de Comando | trigger `trig_012j4zUuq56FyGnpUoVsXxci` | cron `7 11 * * *` (08:07 ART) |
| Rutina Monitor de Leads | trigger `trig_01PyUJV66vgiz891HXJQoyg4` | cron `0 12 * * *` (09:00 ART) |

### Flujo interno del Cartero (blueprint)
1. `datastore:SearchRecord` (datastore 169612, filter `subject exist`) → devuelve 1 bundle por registro.
   **Los campos se leen como `{{1.data.subject}}` y `{{1.data.text}}`** (van anidados bajo `data`); la key es `{{1.key}}`.
2. `http:MakeRequest` POST `https://api.brevo.com/v3/smtp/email` (jsonString) → `subject={{1.data.subject}}`, `htmlContent=<div ...>{{1.data.text}}</div>`.
3. `datastore:DeleteRecord` (key `{{1.key}}`) → borra el registro ya enviado.

## Contrato que deben cumplir las rutinas al depositar

`data-store-records_create` con `dataStoreId 169612` y `data = { subject, text }`:
- **subject**: una sola línea, sin comillas dobles.
- **text**: cuerpo como **HTML**. Reglas OBLIGATORIAS (si no, se rompe el JSON del envío):
  - líneas separadas con `<br>` (NUNCA saltos de línea reales),
  - sin comillas dobles (usar `'`),
  - sin backslash `\`.
  - Se permiten `<b>…</b>` y emojis.
- `subject` y `text` nunca vacíos (un asunto vacío hace que Brevo devuelva 400).

## Verificado end-to-end (02/07/2026)
Rutina real → depósito en buzón → Cartero → email en inbox → registro borrado. OK.

## Riesgos / mantenimiento
- **Registro "veneno":** si una rutina deposita un `text` con comilla doble o salto real,
  Brevo devuelve 400, el registro **no se borra** y el Cartero reintenta cada 15 min
  fallando. Tras 3 errores seguidos Make puede desactivar el escenario. Fix: borrar el
  registro malo del data store 169612 y reactivar el Cartero. Mitigación: el prompt de
  las rutinas es estricto con el formato HTML-safe.
- **Ops de Make:** con envío on-demand (`scenarios_run` desde la rutina) + poll de
  seguridad cada 6 h, el Cartero gasta ~**300 ops/mes** (poll 6 h = ~120 + 2 envíos/día
  ×3 módulos = ~180). Plan Core = 10.000/mes → ~3%. (Antes, con poll cada 15 min, eran
  ~3.000 ops/mes = 30%; se optimizó el 02/07.) Si algún día se quisiera envío garantizado
  sin depender del disparo on-demand, bajar el `interval` del Cartero (más ops).
- **Reutilizable:** cualquier rutina/agente nuevo que quiera mandar un email a Jose solo
  tiene que depositar `{subject, text}` en el buzón 169612 respetando el contrato.

## Estado de los agentes en la nube — RESUELTO 03/07 (tarjeta #32)

**Problema:** la rutina Panel corre en una sesión de la nube que **no clona el repo**
(directorio vacío, sin git) → no podía leer `ads-agent/state/*.json` y el mail salía sin
los datos de los agentes, con un aviso "repo no clonado". Confirmado que afectaba también
a la corrida **programada** de las 08:07 ART (no era solo un artefacto del run on-demand).

**Solución (Plan B — por Supabase, elegida por Jose):** la nube no lee archivos; lee una
tabla por el conector MCP de Supabase (el mismo camino que ya usa la sección Ventas).

```
ads-agent/state/*.json ──(push a GitHub)──► GitHub público
        │
        ▼  (1×/día, colgado del cron recuperacion 15:00 UTC)
sistema-ingresos/api/_lib/sync-estados.js  (runSyncEstados)
   · lista los *-state.json del repo (GitHub contents API; fallback = lista fija)
   · baja cada uno por raw.githubusercontent (repo público, sin token)
   · UPSERT por `agente` → tabla agentes_estado (Supabase periodistas-marketing)
        │
        ▼
Panel de Comando (nube) ──(Supabase MCP: SELECT * FROM agentes_estado)──► mail con agentes
```

- **Tabla:** `agentes_estado` (agente PK, estado jsonb, actualizado_en). RLS enabled; la
  lee el MCP (management) y la escribe el service_role de Vercel. Ver ARQUITECTURA-DATOS.md.
- **Endpoint manual/forzado:** `GET /api/sync-estados?key=<CRON_SECRET>` (devuelve
  `{ok,count,agentes,errores}`). Normalmente NO se llama solo — lo corre `recuperacion.js`.
- **Prompt de la rutina:** PASO 1 ahora hace `SELECT agente, estado, actualizado_en FROM
  agentes_estado` por MCP (antes hacía `Glob ads-agent/state/*.json`). Trigger
  `trig_012j4zUuq56FyGnpUoVsXxci`, editado por la API de rutinas.
- **Freshness:** el mail muestra el **último push** del repo (se refresca 1×/día). El
  detalle en vivo sigue estando en el `/rutina` **local** cuando Jose se sienta a trabajar.
- **Ojo:** `bruno` y `miguel` todavía **no se pushean** (untracked) → el sync desde GitHub
  trae 11 de 13; esos dos quedan con el último valor sembrado a mano. Al commitearlos, el
  sync los toma solos (el listado es dinámico).
