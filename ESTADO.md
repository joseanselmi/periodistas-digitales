# ESTADO — foto en vivo del negocio

_Generado el 2026-08-07 10:57 UTC por `node herramientas/estado.mjs`. Si esta fecha no es de hoy, **volvé a correrlo antes de sacar conclusiones**._

Este archivo se REGENERA, no se edita a mano. Las decisiones y el detalle técnico
viven en las tarjetas de Trello y en los `.md` de cada proyecto; acá están sólo los
hechos frescos que hacen falta para saber en qué estamos y qué sigue.

## 🚦 Semáforo

- 🟢 **Embudo** encendido — 843 envíos en cola: {"mailoferta":15,"ofertareenvio":112,"regalo3":524,"regalo4":185,"mail5":7}

## 💰 Ventas (neto de Jose)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📥 Embudo de las guías gratis

**919 leads** en la lista. Dónde está parado cada uno (atributo `WA_STAGE`):

- etapa 0: **150** leads _(nunca recibieron el primer regalo)_
- etapa 3: **179** leads
- etapa 4: **53** leads
- etapa 5: **537** leads


Cuántos recibieron cada paso **por email** (el embudo va 100% por mail desde el 29/07):

- Regalo 3 → **378** · Regalo 4 → **190** · Regalo 5 → **583**
- Oferta → **537** · reenvío de la oferta → **172**

_(el Regalo 3 y el 4 empezaron a salir por mail el 28/07; a quien los recibió antes por WhatsApp sólo lo registra su `WA_STAGE`, no el marcador)_

### Cola de hoy (ensayo del cron, no manda nada)

- **843** envíos pendientes: `{"mailoferta":15,"ofertareenvio":112,"regalo3":524,"regalo4":185,"mail5":7}`
- Embudo encendido (`WA_FUNNEL_ENABLED`)

### Entrega de WhatsApp (últimos 7 días)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📧 Email (Brevo, últimos 30 días)

Lista "Leadgen - Guía Claude": **897 contactos**.

| paso del embudo | enviados | entregados | aperturas únicas | clics únicos |
|---|---|---|---|---|
| Regalo 3 · periódico digital (día 5) | 446 | 430 | 52 (12%) | 15 (3%) |
| Regalo 4 · los 5 pilares (día 7) | 191 | 183 | 18 (10%) | 1 (1%) |
| Regalo 5 · agentes de IA (día 8) | 584 | 563 | 130 (23%) | 35 (6%) |
| OFERTA (día 9) — la que vende | 538 | 517 | 63 (12%) | 11 (2%) |
| Reenvío de la oferta (+48 h, a los que no abrieron) | 174 | 164 | 8 (5%) | 1 (1%) |
| _todo el correo (incluye Regalos 1 y 2)_ | 3469 | 3318 | 597 (18%) | 199 (6%) |

### Qué hicieron los que abrieron (eventos en la landing)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

### ¿El embudo vendió?

> ⚠️ No disponible: falta una de las dos fuentes (ventas o lista de leads).

## 🧭 Trello — qué falta, tarjeta por tarjeta

### En progreso (5)

**[#123 Sacar el máximo provecho a Brevo — exprimir el embudo de email](https://trello.com/c/YNEs9Cnk)** — 3/8 · Sofia (Email) · últ. 2026-08-07
- ⬜ 2. JOSE: escribirle a mano, uno por uno, a los 11 que clicaron la oferta y no compraron. Preguntar qué los frenó. Con 11 no se arma una campaña, pero la respuesta vale más que cualquier test
- ⬜ 3. ⏸️ EN PAUSA — A/B del asunto de la oferta. Los datos del 07/08 lo desarman: el clic-sobre-apertura ya es 15-23% en TODAS las cohortes, o sea que el asunto no es lo que está roto. Con 154 personas enganchadas un A/B mide ruido. Se retoma cuando la lista esté limpia y haya volumen vivo
- ⬜ 6. Reemplazar el disparo por reloj (cron 10 ART) por automatización por comportamiento en Brevo ("2 días después de abrir el Regalo 4 y no clicar"). SOLO cuando 1-5 estén hechos: automatizar un embudo que no convierte es multiplicar por cero
- ⬜ 7. Decidir el add-on de €7/mes (10.000 emails): hoy se usa el 40% (~4.000/mes). Bajarlo son €84/año, pero el embudo crece — revisar recién después del ítem 5. La decisión se registra en #46
- ⬜ 8. JOSE: mirar el mail de re-enganche (te llegó a joseanselmi27@gmail.com el 07/08, asunto "¿Te sirvieron las guías?") y dar el OK. Recién ahí se enciende REENGANCHE_ENABLED=1 en Vercel y salen los 575 (239 frenados por la puerta + 336 que ya la habían recibido a ciegas)

**[#120 🔑 Rotar el token de Trello — estuvo en el repo público](https://trello.com/c/VhTuV6Fq)** — 1/4 · últ. 2026-08-07
- ⬜ Entrar a trello.com/app-key, revocar el token viejo y generar uno nuevo (Jose)
- ⬜ Pegar el token nuevo en .mcp.json (local) y en ads-agent/.env TRELLO_TOKEN
- ⬜ Probar que el tablero sigue respondiendo: node ads-agent/scripts/utiles/trello-task.mjs listar Ricardo

**[#117 🔴 333 emails de compradores y leads están en el repo PÚBLICO de GitHub](https://trello.com/c/FtyUrMMB)** — 1/3 · últ. 2026-08-07
- ⬜ (JOSE) Decidir si se reescribe el historial del repo para borrar los 4 CSV. Implica force push y romper cualquier clon existente. Alternativa más simple: hacer el repo privado, que resuelve la exposición sin tocar la historia
- ⬜ Sacar los 4 CSV del índice con `git rm --cached` y commitear, para que dejen de estar en la copia actual del repo (esto NO los borra del historial ni del disco — es el paso previo, independiente de la decisión de arriba)

**[#110 🔑 Decidir si se rota la clave de Brevo (estaba escrita a mano en el repo)](https://trello.com/c/SUwX3OeJ)** — 1/3 · Nicolas (Backend) · últ. 2026-08-07
- ⬜ Jose decide: ¿se rota la clave de Brevo o se deja?
- ⬜ Si se rota: clave nueva en Brevo → Make 9474482 (módulos 3, 4, 30 y 40) → .env.local de Leadr → Vercel de Leadr → Vercel de sistema-ingresos → envío de prueba que confirme que sale

**[#106 🎯 EMBUDO republicadores (ex "el periodista del muro") — ad + landing + guías + campaña propia (por fases)](https://trello.com/c/vFd9rZQ3)** — 18/35 · Mateo (Media Buyer), Luna (CRO/Landing) · últ. 2026-08-01
- ⬜ (JOSE) Mirar /tu-medio en un teléfono real — ya está EN VIVO. El QA da ✅ aunque el layout esté roto, así que esto solo lo ve un ojo humano
- ⬜ Correr qa-salud-sitio.mjs incluyendo /tu-medio y /privacidad (velocidad + links/botones). Ya están publicadas
- ⬜ Guías 2, 3 y 4 de la secuencia (qué publicar → cómo leer tus números → del favor al presupuesto)
- ⬜ Lectura a los 7-10 días: costo por lead, qué imagen y qué copy ganaron, y aperturas de la guía. Con promedio de 3 días, no días sueltos
- ⬜ (JOSE) Leer la guía y validar los 7 consejos contra tu propia experiencia — son consenso de oficio, no política publicada por Meta. La guía NO cita ninguna estadística, justamente para no inventar datos ajenos
- ⬜ Corregir en Canva el CTA del creativo: dice "GUIA" sin tilde (arriba, en la misma pieza, está bien escrito). Reexportar y reemplazar en el repo Y en Meta
- ⬜ (JOSE) Pasar la app de Meta de "Desarrollo" a "En vivo" en developers.facebook.com (pide URL de política de privacidad → ya existe /privacidad). Sin eso el token puede LEER anuncios pero no escribir creativos, y todo cambio de formulario/creativo tiene que hacerlo Jose a mano
- ⬜ Reintentar el mail de reparación a elizabethcotanina0@gmail.com — rebotó por buzón lleno (452-4.2.2, temporal). Probar el 02/08 con `node scripts/publicar/send-email.mjs --campaign republicadores-guia-fix --csv <csv con ese mail>`
- _…y 9 más_

### Bloqueada (7)

**[#70 Contenido Leadr · Semana 20-26 jul → Seguridad Digital](https://trello.com/c/Ov5SPFfx)** — 3/4 · Director (Academico) · últ. 2026-07-31
- ⬜ NOVEDAD: post comunidad "Módulo Seguridad Digital completo" + 1 tip accionable

**[#40 Fuga de checkout del curso (86% abandono) + motivos de cancelación Hotmart](https://trello.com/c/qM5vVbJo)** — 4/5 · Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ Exportar el CSV de cancelaciones con rango AMPLIO (30-60 días) y analizar el mix (rechazo de tarjeta vs persuasión) → define el cambio concreto del checkout

**[#59 Revisar Pro de Leadr — cuántos pagan de verdad vs regalados](https://trello.com/c/1xeibaWl)** — 6/7 · Bruno (Data Analyst) · últ. 2026-07-31
- ⬜ Definir política: qué pasa cuando se vence el mes gratis del bono del curso (¿downgrade automático? ¿aviso previo?)

**[#36 Capturar rechazos de tarjeta de Hotmart (hueco de recuperación)](https://trello.com/c/BvvEtt86)** — 5/13 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ Confirmar el nombre real del evento contra el raw payload en los logs de Vercel (/api/hotmart) cuando llegue un rechazo real
- ⬜ Habilitar ese evento en la config de webhooks de Hotmart y/o mapearlo en classifyPotencial (sistema-ingresos/api/hotmart.js)
- ⬜ Probar E2E: rechazo real → entra a clientes_potenciales como pago_rechazado → dispara recup_rechazo_1 solo
- ⬜ Jose: habilitar scope Ventas/Reportes en la credencial de Hotmart (hoy da 403) — destraba también el backfill de ventas
- ⬜ Cargar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (para que el sync escriba)
- ⬜ E2E: node scripts/datos/hotmart-sync.mjs --dry-run --solo-rechazos (parado en ads-agent/) — confirma que la API devuelve rechazos + mapeo → sin dry-run → verificar que el cron manda recup_rechazo_1
- ⬜ Dejar scripts/datos/hotmart-sync.mjs de cron diario (antes del cron de recuperación) para que los rechazos entren solos
- ⬜ PUENTE MANUAL (sin API, disponible ya): importador ads-agent/scripts/datos/hotmart-rechazos-csv.mjs ✅ listo y probado → Jose exporta el CSV del panel "Motivos de rechazo" y Claude lo inserta en clientes_potenciales

**[#98 Estado del negocio en vivo dentro del repo (node estado.mjs → ESTADO.md)](https://trello.com/c/vFkbcxvb)** — 5/7 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ (JOSE) Pegar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (Supabase → periodistas-marketing → Project Settings → API → service_role). Sin eso, ventas y entrega de WhatsApp quedan fuera del informe
- ⬜ Correr el informe completo (ya con Supabase) y confirmar que las 6 secciones traen datos

**[#89 WhatsApp fuera de servicio — canal CERRADO hasta que se verifique el negocio en Meta](https://trello.com/c/HhfWhrB9)** — 2/8 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ (JOSE) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- ⬜ (JOSE) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.
- ⬜ Al quedar verificado + nombre aprobado: re-test de envío real y confirmar en conversaciones_wa que vuelve a entregar (entregado/leido, no fallido).
- ⬜ POST-verificación (idea de Jose): 1 WhatsApp corto "no reclamaste tu regalo, está en tu mail 👉" para subir aperturas del email. Solo sirve cuando el número vuelva a entregar.
- ⬜ (de la #33) Template Insights: verificar si Meta ya lo habilitó (daba "not available") → el reporte diario debería mostrar leídos/entregados. Si sigue sin habilitarse, montar webhook propio de estados (sent/delivered/read) en api/wa-webhook.js
- ⬜ (de la #50, solo si vuelve a usarse WhatsApp para regalos) Plantillas con botón → /api/d ya creadas: regalo3_link_periodico (1532705275224411) y regalo4_link_pilares (2687951991599180). Al aprobarse: cambiar buildTemplatePayload en wa-funnel.js + deploy → contar aperturas en events (pdf_open, src=WhatsApp-Regalo3/4). HOY EN PAUSA: el embudo de regalos va 100% por email (#94)

**[#84 🎙️ Voz final del curso — ElevenLabs (Creator + voz argentina)](https://trello.com/c/7on7Y0rr)** — 0/4 · Director (Academico) · últ. 2026-07-18
- ⬜ Activar plan ElevenLabs Creator (Jose)
- ⬜ Diseñar o elegir la voz argentina (voice_id)
- ⬜ Regenerar los audios de todas las clases con la voz final
- ⬜ Re-render de las clases con la voz final

### En revision (11)

**[#113 Verificar que Valentina publique la story sola (16/08)](https://trello.com/c/0GjViBKj)** — sin checklist ⚠️ · últ. 2026-08-07

**[#118 Admin de Leadr: panel de agentes por evidencia + menú contraíble + CPL](https://trello.com/c/RLEJDywJ)** — 9/12 · últ. 2026-08-03
- ⬜ PENDIENTE JOSE: mirar la página renderizada (leadr.cloud/admin/equipo)
- ⬜ PENDIENTE: poner active=false en team_members a los 4 dados de baja (hoy el código los filtra, pero la base sigue diciendo que están activos)
- ⬜ PENDIENTE: el gasto del panel viene ~1 día atrasado, así que el CPL sale más barato que el real. Decidir si se muestra la fecha del último gasto sincronizado

**[#109 📊 Campañas en Leadr — una página por campaña con el embudo paso a paso en vivo](https://trello.com/c/McxkZs9Y)** — 9/14 · Nicolas (Backend), Luna (CRO/Landing) · últ. 2026-08-03
- ⬜ Jose mira la página (/admin/campanas en Leadr) y da el visto bueno visual
- ⬜ Etiquetar en Make (escenario 9474482) el Regalo 1 (módulo 3) y la guía de republicadores (módulo 30): sumar "tags":["regalo1-guia-claude"] y "tags":["rep-guia-que-te-lean"] al JSON. Es un campo más en el body, pero toca un flujo de entrega vivo → no se hizo sin avisar
- ⬜ Decidir el Regalo 2: hoy es el paso 3 de una automatización de Brevo (plantilla 1) y las automatizaciones no dejan etiquetar. O se saca y se manda desde el cron como los Regalos 3-5, o ese paso se lee siempre del respaldo
- ⬜ Cambiar la página para que lea SOLO la base y deje de consultar Brevo en vivo — recién después de confirmar con los envíos del cron de mañana (13:00 UTC) que el webhook no pierde ningún aviso
- ⬜ ⚠️ El cron `recuperacion` (15:00 UTC) NO se disparó el 03/08: a las 19:12 UTC ninguna de las 5 tablas que escribe tenía dato de ese día, aunque el 02/08 sí corrió (todas con timestamp 15:11, a 300 ms una de otra). NO es el código: `/api/recuperacion?mode=stats` responde OK con el deploy nuevo. Revisar 2-3 días si el disparo se saltea seguido — en Hobby la hora del cron no está garantizada. Si se repite, evaluar disparo externo

**[#115 🤖 Director autónomo — que la clase semanal de Leadr se publique sola](https://trello.com/c/RHLeiYfn)** — 10/11 · Nicolas (Backend), Director (Academico) · últ. 2026-08-01
- ⬜ CONFIRMAR mañana 01→02/08: que el cron de las 13:00 UTC corrió solo (agent_states del director con fecha nueva)

**[#114 🔴 Embudo Guía Claude: el Regalo 4 no le llegó a NADIE en todo julio — completar los 2.177 mails adeudados](https://trello.com/c/p2MtUfEx)** — 15/18 · Nicolas (Backend), Sofia (Email) · últ. 2026-08-01
- ⬜ ⏳ Que la cola llegue a 0: verificar el 07/08 que le_falta_a dé 0 en las 4 piezas
- ⬜ ⏳ Vigilar rebotes/spam: hoy 5,1% y 0 spam sobre 355 mails. Si el rebote pasa de 8% o hay quejas, bajar PIEZAS_CAP_DIA
- ⬜ ⏳ 01/08: confirmar que la corrida del cron (10 ART) salió sola y sin duplicados

**[#71 Contenido Leadr · Semana 27 jul-2 ago → Automatización](https://trello.com/c/2a3MCENA)** — 3/4 · Director (Academico) · últ. 2026-08-01
- ⬜ RECURSO PRO: plantilla/prompt de un flujo automatizado para periodistas (ej. resumen de fuentes con IA)

**[#108 Link de acceso a Leadr vencido = callejón sin salida (0 de 18 entraron)](https://trello.com/c/4EuUeUB5)** — 9/11 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ Probar en vivo con un link vencido de verdad (que aparezca el cartel y llegue el mail nuevo)
- ⬜ El 02/08: contar cuántos de los 17 entraron — select email, last_sign_in_at from auth.users where last_sign_in_at > '2026-07-31'. Si vuelve a dar 0, el problema no era la llave

**[#53 Desbloquear el trabajo de los agentes y que corran diarios solos](https://trello.com/c/3XHNa8oW)** — 8/9 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ EL PROBLEMA DE FONDO: que el reporte llegue a donde Jose mira. 32 recomendaciones y 4 Paneles de Salud sin abrir — uno avisa en rojo que el 100% de los WhatsApp fallan. Llevarlo a Telegram (el puente ya existe) en vez de un mail más

**[#107 📣 Orgánico FB: convertir la guía "Que te lean miles" en serie de posts](https://trello.com/c/DOhEmqkI)** — 10/13 · Valentina (Organico) · últ. 2026-07-31
- ⬜ Programar 29, 30 y 31/08 cuando la cola baje de 29 (re-correr schedule-muro.mjs, es idempotente) — contenido ya listo
- ⬜ (JOSE) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro
- ⬜ A los 7 días de arrancar: mirar qué posteo trajo más comentarios y si aparecieron lectores nuevos (no conocidos) — es el mismo recuento C/L que enseñamos

**[#105 Visor de datos en el admin de Leadr (/admin/datos)](https://trello.com/c/hCg9UqXJ)** — 3/4 · Nicolas (Backend), Valeria (Frontend) · últ. 2026-07-30
- ⬜ Jose abre /admin/datos y confirma que las 18 tablas cargan bien

**[#52 Inbox de WhatsApp en Leadr (/admin/chats) — ver hilos + campaña](https://trello.com/c/ZhXVDMsn)** — 9/11 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Confirmar con Jose que ve el panel de campaña tras el build de Leadr (05/07)
- ⬜ ⚠️ Mantenimiento: si en el futuro se cambia el texto de una plantilla en Meta, re-sincronizar las constantes de chats-client.tsx (FUNNEL_GUIA_CLAUDE / RECUP_*). No es automático — el texto literal está hardcodeado.

### Por hacer (9)

**[#46 Contabilidad automática — buzón de facturas (gastos@)](https://trello.com/c/Y1YEouzN)** — 8/16 · Bruno (Data Analyst) · últ. 2026-08-07
- ⬜ Poner gastos@ como email de facturación en cada proveedor (Vercel, Supabase, Brevo, Make, higgsfield, Anthropic, dominio)
- ⬜ Revisar los fijos que siguen en $0 y confirmar uno por uno si son gratis de verdad o si nadie los cargó (Anthropic y Dominios son los que quedan)
- ⬜ 🐛 v_pnl_mensual suma EUR como si fuera USD: gf hace sum(monto) sin mirar `moneda` y la columna se llama gastos_fijos_usd. Julio: €21 de Brevo contados como $21 (real ≈ $22,7). Convertir o separar por moneda
- ⬜ 🐛 Los fijos no se arrastran de mes: agosto arranca en $0 y el P&L muestra ganancia inflada hasta que llegan las facturas (Make 18/08, Brevo 24/08). No hay ningún mecanismo que use `recurrente` — verificado por grep
- ⬜ Make.com — Perfil → Subscription/Billing → email de facturación = gastos@leadr.cloud
- ⬜ Dominio leadr.cloud (Hostinger) — Datos de facturación → email = gastos@leadr.cloud
- ⬜ Dominio sistemadeingresosdiariosia.com — en su registrador → email de facturación = gastos@leadr.cloud
- ⬜ ⚠️ Meta Ads — SOLO verificar que la factura siga llegando al Gmail. NO redirigir a gastos@ ni cargar como fijo: ya se carga solo a nivel cuenta (si se mete al buzón, el gasto se DUPLICA). Igual para WhatsApp de Meta (se estima en la tabla `mensajes`)

**[#91 Producir VSL para la landing y testear](https://trello.com/c/TmOQfLNe)** — 0/8 · Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ Escribir guion VSL corto (2-3 min): problema -> mecanismo unico -> oferta -> CTA (metodo Luis Mena)
- ⬜ Aprobar guion con Jose
- ⬜ Producir el video (voz + visuales)
- ⬜ Montar el VSL arriba de la landing (definir player / autoplay muteado)
- ⬜ Definir el test: A/B o version v4-con-VSL contra v3-sin-VSL
- ⬜ Trackear reproduccion + retencion + scroll + tasa checkout
- ⬜ Veredicto del test (VSL sube conversion vs v3?)
- ⬜ ⛔ NO montar el VSL en la landing antes del veredicto de v3 (~12/08, #73). Si entra antes, ensucia la medición y no se sabe qué movió la aguja. Además #91 y #99 compiten por ser v4: entra UNA sola.

**[#62 Upsell post-compra: "Tu Periódico Digital + Redacción IA" (página ESPERA)](https://trello.com/c/XvzdCj3l)** — 8/16 · Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ Armar la planilla plantilla ya publicada como CSV (columnas + notas de ejemplo)
- ⬜ Grabar 3 videos cortos de los pasos que traban: publicar CSV, conectar CSV en Lovable, pegar en la planilla
- ⬜ Plantilla de sitio de respaldo + mini-FAQ de los 5 errores comunes (anti-reembolso)
- ⬜ Configurar el upsell de 1 clic en Hotmart (embudo post-compra)
- ⬜ Empaquetar la entrega y definir dónde vive (acceso Hotmart / carpeta)
- ⬜ Probar el flujo completo E2E (compra → OTO → aceptar → entrega) antes de encender
- ⬜ Documentar la decisión técnica en un archivo del repo
- ⬜ Grabar la Mini VSL del upsell (5-6 min, voz en off + grabación de pantalla) con el guión

**[#73 Trazabilidad por versiones — landing v3 (identificación) + checkout v3 (PayPal ON) midiendo](https://trello.com/c/sFqLzsAH)** — 16/21 · Bruno (Data Analyst), Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ ~05/08: chequeo intermedio v3 (scroll Clarity vs 31,78% + ventas/día). No tocar la landing hasta el veredicto
- ⬜ ~05/08: chequear checkout v3 — ¿vuelve el volumen que LLEGA (0,33/día en v2 vs 1,44 en v1) y los carritos abandonados?
- ⬜ ~12/08: veredicto landing v3 (scroll y ventas/día; clics SOLO como control) y veredicto checkout v3 vs v1 (completion 26,9%)
- ⬜ Confirmar en la config de pagos de Hotmart si BILLET/efectivo quedó prendido (apareció 1 pago BILLET MXN en v2)
- ⬜ Antes de dar por buena una versión: mirar el hero en un teléfono real. El QA no revisa layout, da ✅ igual

**[#101 🎬 CURSO EN VIDEO (Sistema de Ingresos) — tarjeta maestra](https://trello.com/c/m2WA7HJP)** — 10/30 · Director (Academico) · últ. 2026-07-31
- ⬜ M4 El nombre y la marca — producido; falta voz Chris (cuota ElevenLabs, reset ~19 ago) → HANDOFF-M4.md
- ⬜ Pegar embeds M4 (cuando salga, va ANTES que M4… ojo: M5 antes que M4 en el orden)
- ⬜ Confirmar EN Hotmart que los 7 embeds de M1 están realmente pegados: la #92 (archivada el 31/07) decía que faltaba subirlos y acá figura hecho. Una de las dos estaba mal — mirarlo antes de darlo por cerrado.
- ⬜ M1 (índigo) — falta la 1.4 (escalera)
- ⬜ M2 (cyan) — generar módulo + 5 clases
- ⬜ M3 (verde) — generar módulo + 4 clases
- ⬜ M4 (rosa) — generar módulo + 5 clases
- ⬜ M5 (violeta) — generar módulo + 6 clases
- _…y 12 más_

**[#102 Radar de Tendencias TikTok — bono del curso](https://trello.com/c/UbfSnBSU)** — 6/10 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ Cargar ANTHROPIC_API_KEY en ads-agent/.env y probar la capa de IA
- ⬜ Curar cuentas del grupo 3 (virales/sucesos/calle) — es donde explota primero
- ⬜ Programar corridas automáticas (definir cuántas por día)
- ⬜ Publicar el resultado donde lo vea el alumno (página + email)

**[#39 Publicar ad2-fomo2 · test creativo B a $10/día](https://trello.com/c/DfdLqvnD)** — 4/14 · Mateo (Media Buyer) · últ. 2026-07-30
- ⬜ Decidir estructura: conjunto PROPIO $10/día (test limpio, recomendado) vs. mismo conjunto de ad1
- ⬜ Crear/duplicar el conjunto con el targeting de ad1 (30-55, geo, exclusiones, optimización Compra, dataset Periodistas del Futuro 2.0)
- ⬜ Anuncio nuevo: subir ads2-fomo2.png (1080×1080)
- ⬜ Copy = idéntico al de ad1 (texto principal, título "Tu propio periódico digital con IA", descripción, CTA "Más información")
- ⬜ URL de destino = https://sistemadeingresosdiariosia.com/?src=ad2-fomo2 (con el ?src, clave para atribución en Hotmart)
- ⬜ Nombre del anuncio en Meta = "ad2-fomo2 · FOMO+IA creativo B"
- ⬜ Presupuesto $10/día · destino = la landing (NO directo a Hotmart)
- ⬜ Publicar y verificar que quede "En revisión"/"Activo"; actualizar registro-anuncios.md (estado → 🟢 Activo + fecha)
- _…y 2 más_

**[#88 YouTube orgánico — muchos videos/día (listados) para tráfico](https://trello.com/c/GLz5iqdN)** — 0/8 · Valentina (Organico) · últ. 2026-07-19
- ⬜ Definir formato y nicho (Shorts vertical vs largo; tema: periodismo + IA / noticias)
- ⬜ Definir volumen diario y ventana de prueba (ej. 3-5 videos/día × 2 semanas)
- ⬜ Crear variante "pública" del pipeline de subida (privacyStatus=public, sin playlist del curso, tags/SEO)
- ⬜ Definir método de producción para volumen (animado con el kit vs formato más rápido)
- ⬜ Producir el 1er lote de videos
- ⬜ Subir 1er lote LISTADO + arrancar cadencia diaria
- ⬜ Medir a 7-14 días (vistas, impresiones, CTR, suscriptores, tráfico a la landing)
- ⬜ Decidir: escalar el formato ganador o pivotar

**[#76 Flujo de mensajes del bot de Messenger](https://trello.com/c/W8XAfN6Y)** — 0/6 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ Conectar la app de Facebook al webhook de Messenger (permiso pages_messaging) y suscribir la página al evento messages/messaging_postbacks
- ⬜ Crear endpoint api/messenger.js (verify GET + recibir POST) que guarde el lead entrante en Supabase (misma tabla/lógica que wa-funnel)
- ⬜ Definir la cadencia de mensajes (bienvenida → regalos 1-4 sin precio → oferta con link a la landing), respetando la ventana de 24h de Messenger
- ⬜ Excluir compradores del flujo (mismo criterio que wa-funnel) y agregar anti-bucle/dedup por sender_id
- ⬜ Puente a Telegram: reenviar los mensajes entrantes de Messenger para que Jose lea/responda (igual que el puente de WhatsApp)
- ⬜ Probar E2E con un mensaje real de prueba y verificar OUTCOMES (lead guardado, cadencia disparada, exclusión de compradores) antes de darlo por LIVE

## ⏳ Esperando a Jose

- [#89](https://trello.com/c/HhfWhrB9) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- [#89](https://trello.com/c/HhfWhrB9) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.
- [#84](https://trello.com/c/7on7Y0rr) Activar plan ElevenLabs Creator 
- [#98](https://trello.com/c/vFkbcxvb) Pegar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (Supabase → periodistas-marketing → Project Settings → API → service_role). Sin eso, ventas y entrega de WhatsApp quedan fuera del informe
- [#106](https://trello.com/c/vFd9rZQ3) Mirar /tu-medio en un teléfono real — ya está EN VIVO. El QA da ✅ aunque el layout esté roto, así que esto solo lo ve un ojo humano
- [#106](https://trello.com/c/vFd9rZQ3) Leer la guía y validar los 7 consejos contra tu propia experiencia — son consenso de oficio, no política publicada por Meta. La guía NO cita ninguna estadística, justamente para no inventar datos ajenos
- [#106](https://trello.com/c/vFd9rZQ3) Pasar la app de Meta de "Desarrollo" a "En vivo" en developers.facebook.com (pide URL de política de privacidad → ya existe /privacidad). Sin eso el token puede LEER anuncios pero no escribir creativos, y todo cambio de formulario/creativo tiene que hacerlo Jose a mano
- [#106](https://trello.com/c/vFd9rZQ3) Contestarle el comentario a Erick Agustin Sivila Flores en el anuncio de Facebook: ya está arreglado, que lo intente de nuevo (también se le reenvió por correo). Fue el que avisó del 404
- [#117](https://trello.com/c/FtyUrMMB) Decidir si se reescribe el historial del repo para borrar los 4 CSV. Implica force push y romper cualquier clon existente. Alternativa más simple: hacer el repo privado, que resuelve la exposición sin tocar la historia
- [#120](https://trello.com/c/VhTuV6Fq) Entrar a trello.com/app-key, revocar el token viejo y generar uno nuevo 
- [#107](https://trello.com/c/DOhEmqkI) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro

## 📋 Tarjetas sin checklist

- [#113 Verificar que Valentina publique la story sola (16/08)](https://trello.com/c/0GjViBKj) — En revision

_Regla del tablero: toda tarjeta activa lleva checklist con pasos concretos._
