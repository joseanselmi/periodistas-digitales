# ESTADO — foto en vivo del negocio

_Generado el 2026-08-09 09:16 UTC por `node herramientas/estado.mjs`. Si esta fecha no es de hoy, **volvé a correrlo antes de sacar conclusiones**._

Este archivo se REGENERA, no se edita a mano. Las decisiones y el detalle técnico
viven en las tarjetas de Trello y en los `.md` de cada proyecto; acá están sólo los
hechos frescos que hacen falta para saber en qué estamos y qué sigue.

## 🚦 Semáforo

_sin datos_

## 💰 Ventas (neto de Jose)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📥 Embudo de las guías gratis

**919 leads** en la lista. Dónde está parado cada uno (atributo `WA_STAGE`):

- etapa 0: **8** leads _(nunca recibieron el primer regalo)_
- etapa 3: **8** leads
- etapa 4: **347** leads
- etapa 5: **556** leads


Cuántos recibieron cada paso **por email** (el embudo va 100% por mail desde el 29/07):

- Regalo 3 → **788** · Regalo 4 → **668** · Regalo 5 → **698**
- Oferta → **556** · reenvío de la oferta → **252**

_(el Regalo 3 y el 4 empezaron a salir por mail el 28/07; a quien los recibió antes por WhatsApp sólo lo registra su `WA_STAGE`, no el marcador)_

### Cola de hoy (ensayo del cron, no manda nada)

_salteado por `--rapido`_

### Entrega de WhatsApp (últimos 7 días)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📧 Email (Brevo, últimos 30 días)

Lista "Leadgen - Guía Claude": **895 contactos**.

| paso del embudo | enviados | entregados | aperturas únicas | clics únicos |
|---|---|---|---|---|
| Regalo 3 · periódico digital (día 5) | 1692 | 1651 | 137 (8%) | 33 (2%) |
| Regalo 4 · los 5 pilares (día 7) | 828 | 807 | 56 (7%) | 10 (1%) |
| Regalo 5 · agentes de IA (día 8) | 699 | 675 | 149 (22%) | 37 (5%) |
| OFERTA (día 9) — la que vende | 557 | 536 | 70 (13%) | 14 (3%) |
| Reenvío de la oferta (+48 h, a los que no abrieron) | 457 | 437 | 10 (2%) | 1 (0%) |
| _todo el correo (incluye Regalos 1 y 2)_ | 5738 | 5536 | 740 (13%) | 222 (4%) |

### Qué hicieron los que abrieron (eventos en la landing)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

### ¿El embudo vendió?

> ⚠️ No disponible: falta una de las dos fuentes (ventas o lista de leads).

## 🧭 Trello — qué falta, tarjeta por tarjeta

### En progreso (3)

**[#123 📧 BREVO — tarjeta única (embudo de email). Todo lo de Brevo va acá](https://trello.com/c/YNEs9Cnk)** — 10/23 · Sofia (Email) · últ. 2026-08-08
- ⬜ 2.1 JOSE: copiar de Brevo → Automatizaciones → Configuración el código de seguimiento y pegarlo acá en un comentario. La clave ya se sabe (d2xqy9vy25se1gfvyjyg4khw) pero hace falta el snippet tal como Brevo lo entrega
- ⬜ 2.2 CLAUDE: instalar el tracker en landing, landing-leadgen-v1 y gracias. NO en las 9 páginas: cada script suma peso y las landings ya costó bajarlas a 1,39MB. Después verificar que Brevo RECIBE las visitas — un script pegado que no reporta se ve idéntico a uno que funciona
- ⬜ 2.3 JOSE: crear en Brevo el segmento dinámico "abrió o clicó algún mail en los últimos 90 días" (la API no crea segmentos, es sólo de UI). Contrastar el número contra los ~480 que devuelve `/api/wa-funnel?mode=puerta`: si da MUY distinto, el filtro no dice lo que creemos. Va ANTES de la primera campaña o ésta sale a 1.037 en vez de a 480
- ⬜ 2.4 JOSE: mandar la PRIMERA campaña de la historia de la cuenta, al segmento de 2.3. El objetivo del primer envío es aprender el flujo, no vender. Comprobar las dos cosas que la campaña da gratis y el transaccional no: link de baja al pie y reporte de apertura/clic sin consultar la API a mano
- ⬜ 2.5 Con el tracker ya reportando: reemplazar el disparo por reloj por automatización por comportamiento ("entró a la landing y no compró en 48 h"). Hoy el cron manda el día 9 le pase lo que le pase a la persona. Este es el último paso, no el primero: automatizar un embudo que no convierte es multiplicar por cero
- ⬜ 3.1 Escribirle a mano, uno por uno, a los 11 que clicaron la oferta y no compraron (la lista está en el primer comentario de esta tarjeta). Preguntar qué los frenó. Con 11 no se arma una campaña, pero la respuesta vale más que cualquier test
- ⬜ 3.2 Mirar la pantalla de FACTURACIÓN de Brevo. La API dice plan "Starter": si Jose cree que paga uno superior, es plata que no está llegando. Es el único dato que no se puede ver por API
- ⬜ 3.3 Decidir el add-on de €7/mes (10.000 emails). ⚠️ NO decidirlo con el consumo de agosto: está inflado por los ~1.800 créditos que se comieron los repetidos del 07/08. Esperar una semana limpia. La decisión se registra en #46
- _…y 5 más_

**[#117 🔑 SEGURIDAD — secretos y datos personales en el repo público (tarjeta única)](https://trello.com/c/FtyUrMMB)** — 1/8 · Bruno (Data Analyst) · últ. 2026-08-07
- ⬜ (JOSE) Decidir si se reescribe el historial del repo para borrar los 4 CSV. Implica force push y romper cualquier clon existente. Alternativa más simple: hacer el repo privado, que resuelve la exposición sin tocar la historia
- ⬜ Sacar los 4 CSV del índice con `git rm --cached` y commitear, para que dejen de estar en la copia actual del repo (esto NO los borra del historial ni del disco — es el paso previo, independiente de la decisión de arriba)
- ⬜ JOSE: entrar a trello.com/app-key, revocar el token viejo y generar uno nuevo. Es lo único de esta tarjeta que anula el riesgo sin tocar el historial del repo
- ⬜ Pegar el token nuevo en `.mcp.json` (local) y en `ads-agent/.env` → `TRELLO_TOKEN`
- ⬜ Probar que el tablero sigue respondiendo: `node ads-agent/scripts/utiles/trello-task.mjs listar Ricardo`. Si esto falla, quedó un lugar sin actualizar
- ⬜ JOSE decide. A FAVOR: estuvo semanas en texto plano en una carpeta de OneDrive sincronizada. EN CONTRA: nunca llegó a GitHub (el push protection la frenó), y rotarla obliga a cambiarla en todos lados a la vez o se cortan los envíos
- ⬜ Si se rota: en UN solo bloque de trabajo, no de a pedazos. Clave nueva en Brevo → Make 9474482 (módulos 3, 4, 30 y 40) → .env.local de Leadr → Vercel de Leadr → Vercel de sistema-ingresos → envío de prueba que confirme que sale. Si queda uno viejo, deja de salir el Regalo 1 o la oferta y nadie se entera

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

### Bloqueada (2)

**[#59 Revisar Pro de Leadr — cuántos pagan de verdad vs regalados](https://trello.com/c/1xeibaWl)** — 6/7 · Bruno (Data Analyst) · últ. 2026-07-31
- ⬜ Definir política: qué pasa cuando se vence el mes gratis del bono del curso (¿downgrade automático? ¿aviso previo?)

**[#89 WhatsApp fuera de servicio — canal CERRADO hasta que se verifique el negocio en Meta](https://trello.com/c/HhfWhrB9)** — 2/8 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ (JOSE) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- ⬜ (JOSE) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.
- ⬜ Al quedar verificado + nombre aprobado: re-test de envío real y confirmar en conversaciones_wa que vuelve a entregar (entregado/leido, no fallido).
- ⬜ POST-verificación (idea de Jose): 1 WhatsApp corto "no reclamaste tu regalo, está en tu mail 👉" para subir aperturas del email. Solo sirve cuando el número vuelva a entregar.
- ⬜ (de la #33) Template Insights: verificar si Meta ya lo habilitó (daba "not available") → el reporte diario debería mostrar leídos/entregados. Si sigue sin habilitarse, montar webhook propio de estados (sent/delivered/read) en api/wa-webhook.js
- ⬜ (de la #50, solo si vuelve a usarse WhatsApp para regalos) Plantillas con botón → /api/d ya creadas: regalo3_link_periodico (1532705275224411) y regalo4_link_pilares (2687951991599180). Al aprobarse: cambiar buildTemplatePayload en wa-funnel.js + deploy → contar aperturas en events (pdf_open, src=WhatsApp-Regalo3/4). HOY EN PAUSA: el embudo de regalos va 100% por email (#94)

### En revision (5)

**[#118 🖥️ ADMIN DE LEADR — tarjeta única (todas las páginas del panel)](https://trello.com/c/RLEJDywJ)** — 10/21 · Bruno (Data Analyst) · últ. 2026-08-07
- ⬜ PENDIENTE JOSE: mirar la página renderizada (leadr.cloud/admin/equipo)
- ⬜ PENDIENTE: el gasto del panel viene ~1 día atrasado, así que el CPL sale más barato que el real. Decidir si se muestra la fecha del último gasto sincronizado
- ⬜ leadr.cloud/admin/equipo — lo técnico ya está verificado (7 agentes activos tras dar de baja a Mateo/Nicolás/Valeria/Max el 01/08)
- ⬜ leadr.cloud/admin/campanas — el embudo paso a paso de las 3 campañas
- ⬜ leadr.cloud/admin/datos — verificado el 07/08 que las 26 tablas existen con su columna de orden (18 en marketing + 8 en leadr)
- ⬜ leadr.cloud/admin/chats — el panel de campaña con el guion de los 6 regalos y la marca de enviados
- ⬜ El CPL del panel sale más barato que el real porque el gasto de Meta viene ~1 día atrasado. Decidir si se muestra la fecha del último gasto sincronizado al lado del número
- ⬜ Etiquetar en Make (escenario 9474482) el Regalo 1 (módulo 3) y la guía de republicadores (módulo 30): sumar "tags":["regalo1-guia-claude"] y ["rep-guia-que-te-lean"] al JSON. Es un campo más en el body, pero toca un flujo de entrega VIVO → avisar antes
- _…y 3 más_

**[#108 Link de acceso a Leadr vencido = callejón sin salida (0 de 18 entraron)](https://trello.com/c/4EuUeUB5)** — 10/11 · Nicolas (Backend) · últ. 2026-08-07
- ⬜ Probar en vivo con un link vencido de verdad (que aparezca el cartel y llegue el mail nuevo)

**[#115 🤖 Director autónomo — que la clase semanal de Leadr se publique sola](https://trello.com/c/RHLeiYfn)** — 11/12 · Nicolas (Backend), Director (Academico) · últ. 2026-08-07
- ⬜ FALTA EL RESULTADO: el cron corre pero todavía no publicó NINGUNA clase solo. Las 4 últimas (grupo 18, ids 126-129) son del 01/08 00:13-00:22 UTC, cargadas a mano. Confirmar a partir del 08/08 13:00 UTC que sale la 1ª clase publicada sola — antes no le toca: el tope es una ventana MÓVIL de 7 días (publicadasRecientes(supabase, 7) en run-director/route.ts) y las 4 del 01/08 se la llenan hasta el 08/08. Verificar en classes que aparezca una fila nueva del módulo OSINT

**[#53 Desbloquear el trabajo de los agentes y que corran diarios solos](https://trello.com/c/3XHNa8oW)** — 8/10 · Nicolas (Backend) · últ. 2026-08-07
- ⬜ EL PROBLEMA DE FONDO: que el reporte llegue a donde Jose mira. 32 recomendaciones y 4 Paneles de Salud sin abrir — uno avisa en rojo que el 100% de los WhatsApp fallan. Llevarlo a Telegram (el puente ya existe) en vez de un mail más
- ⬜ 📅 16/08 — Verificar que Valentina publique la story SOLA, sin que nadie la dispare. Es la prueba de fuego: un agente que necesita que alguien lo llame no corre solo

**[#107 📣 Orgánico FB: convertir la guía "Que te lean miles" en serie de posts](https://trello.com/c/DOhEmqkI)** — 10/13 · Valentina (Organico) · últ. 2026-08-07
- ⬜ Programar 29, 30 y 31/08 — YA HAY LUGAR: cola verificada en la API de Meta el 07/08, 21 posts programados (16→28/08), tope 29. Pero conviene esperar a que Jose lea los 3 primeros (ítem de abajo): si el tono no es el del muro, mejor desarmar 21 que 24. Después: re-correr schedule-muro.mjs, es idempotente
- ⬜ (JOSE) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro
- ⬜ A los 7 días de arrancar: mirar qué posteo trajo más comentarios y si aparecieron lectores nuevos (no conocidos) — es el mismo recuento C/L que enseñamos

### Por hacer (9)

**[#127 Medir si LEEN los dolores: evento propio de scroll y tiempo por seccion](https://trello.com/c/Zcw82EV8)** — sin checklist ⚠️ · últ. 2026-08-09

**[#46 Contabilidad automática — buzón de facturas (gastos@)](https://trello.com/c/Y1YEouzN)** — 8/16 · Bruno (Data Analyst) · últ. 2026-08-07
- ⬜ Poner gastos@ como email de facturación en cada proveedor (Vercel, Supabase, Brevo, Make, higgsfield, Anthropic, dominio)
- ⬜ Revisar los fijos que siguen en $0 y confirmar uno por uno si son gratis de verdad o si nadie los cargó (Anthropic y Dominios son los que quedan)
- ⬜ 🐛 v_pnl_mensual suma EUR como si fuera USD: gf hace sum(monto) sin mirar `moneda` y la columna se llama gastos_fijos_usd. Julio: €21 de Brevo contados como $21 (real ≈ $22,7). Convertir o separar por moneda
- ⬜ 🐛 Los fijos no se arrastran de mes: agosto arranca en $0 y el P&L muestra ganancia inflada hasta que llegan las facturas (Make 18/08, Brevo 24/08). No hay ningún mecanismo que use `recurrente` — verificado por grep
- ⬜ Make.com — Perfil → Subscription/Billing → email de facturación = gastos@leadr.cloud
- ⬜ Dominio leadr.cloud (Hostinger) — Datos de facturación → email = gastos@leadr.cloud
- ⬜ Dominio sistemadeingresosdiariosia.com — en su registrador → email de facturación = gastos@leadr.cloud
- ⬜ ⚠️ Meta Ads — SOLO verificar que la factura siga llegando al Gmail. NO redirigir a gastos@ ni cargar como fijo: ya se carga solo a nivel cuenta (si se mete al buzón, el gasto se DUPLICA). Igual para WhatsApp de Meta (se estima en la tabla `mensajes`)

**[#73 💰 POR QUÉ NO COMPRAN — landing, checkout y rechazos (tarjeta única)](https://trello.com/c/sFqLzsAH)** — 16/27 · Bruno (Data Analyst), Luna (CRO/Landing) · últ. 2026-08-07
- ⬜ ~05/08: chequeo intermedio v3 (scroll Clarity vs 31,78% + ventas/día). No tocar la landing hasta el veredicto
- ⬜ ~05/08: chequear checkout v3 — ¿vuelve el volumen que LLEGA (0,33/día en v2 vs 1,44 en v1) y los carritos abandonados?
- ⬜ ~12/08: veredicto landing v3 (scroll y ventas/día; clics SOLO como control) y veredicto checkout v3 vs v1 (completion 26,9%)
- ⬜ Confirmar en la config de pagos de Hotmart si BILLET/efectivo quedó prendido (apareció 1 pago BILLET MXN en v2)
- ⬜ Antes de dar por buena una versión: mirar el hero en un teléfono real. El QA no revisa layout, da ✅ igual
- ⬜ 📅 08/08 después de las 04:00 Madrid: confirmar que entró la fila del día con las 5 dimensiones y sin nulls raros. Si el cron falla un día, ese día NO se recupera
- ⬜ Instrumentar evento propio de scroll y tiempo en la sección de dolores — la API de Clarity no lo da por sección, y es justo lo que cambió la v3
- ⬜ Sumar las columnas de comportamiento a `landing_versiones` + el cálculo que las llena por ventana. Sin esto el veredicto de una versión sigue dependiendo de 2 ventas
- _…y 3 más_

**[#101 🎬 CURSO EN VIDEO (Sistema de Ingresos) — tarjeta maestra](https://trello.com/c/m2WA7HJP)** — 10/31 · Director (Academico) · últ. 2026-08-07
- ⬜ M4 El nombre y la marca — producido; falta voz Chris (cuota ElevenLabs, reset ~19 ago) → HANDOFF-M4.md
- ⬜ Pegar embeds M4 (cuando salga, va ANTES que M4… ojo: M5 antes que M4 en el orden)
- ⬜ Confirmar EN Hotmart que los 7 embeds de M1 están realmente pegados: la #92 (archivada el 31/07) decía que faltaba subirlos y acá figura hecho. Una de las dos estaba mal — mirarlo antes de darlo por cerrado.
- ⬜ M1 (índigo) — falta la 1.4 (escalera)
- ⬜ M2 (cyan) — generar módulo + 5 clases
- ⬜ M3 (verde) — generar módulo + 4 clases
- ⬜ M4 (rosa) — generar módulo + 5 clases
- ⬜ M5 (violeta) — generar módulo + 6 clases
- _…y 13 más_

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

**[#102 Radar de Tendencias TikTok — bono del curso](https://trello.com/c/UbfSnBSU)** — 6/10 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ Cargar ANTHROPIC_API_KEY en ads-agent/.env y probar la capa de IA
- ⬜ Curar cuentas del grupo 3 (virales/sucesos/calle) — es donde explota primero
- ⬜ Programar corridas automáticas (definir cuántas por día)
- ⬜ Publicar el resultado donde lo vea el alumno (página + email)

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
- [#106](https://trello.com/c/vFd9rZQ3) Mirar /tu-medio en un teléfono real — ya está EN VIVO. El QA da ✅ aunque el layout esté roto, así que esto solo lo ve un ojo humano
- [#106](https://trello.com/c/vFd9rZQ3) Leer la guía y validar los 7 consejos contra tu propia experiencia — son consenso de oficio, no política publicada por Meta. La guía NO cita ninguna estadística, justamente para no inventar datos ajenos
- [#106](https://trello.com/c/vFd9rZQ3) Pasar la app de Meta de "Desarrollo" a "En vivo" en developers.facebook.com (pide URL de política de privacidad → ya existe /privacidad). Sin eso el token puede LEER anuncios pero no escribir creativos, y todo cambio de formulario/creativo tiene que hacerlo Jose a mano
- [#106](https://trello.com/c/vFd9rZQ3) Contestarle el comentario a Erick Agustin Sivila Flores en el anuncio de Facebook: ya está arreglado, que lo intente de nuevo (también se le reenvió por correo). Fue el que avisó del 404
- [#117](https://trello.com/c/FtyUrMMB) Decidir si se reescribe el historial del repo para borrar los 4 CSV. Implica force push y romper cualquier clon existente. Alternativa más simple: hacer el repo privado, que resuelve la exposición sin tocar la historia
- [#107](https://trello.com/c/DOhEmqkI) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro
- [#98](https://trello.com/c/vFkbcxvb) Pegar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (Supabase → periodistas-marketing → Project Settings → API → service_role). Sin eso, ventas y entrega de WhatsApp quedan fuera del informe

## 📋 Tarjetas sin checklist

- [#127 Medir si LEEN los dolores: evento propio de scroll y tiempo por seccion](https://trello.com/c/Zcw82EV8) — Por hacer

_Regla del tablero: toda tarjeta activa lleva checklist con pasos concretos._
