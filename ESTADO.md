# ESTADO — foto en vivo del negocio

_Generado el 2026-07-31 12:11 UTC por `node herramientas/estado.mjs`. Si esta fecha no es de hoy, **volvé a correrlo antes de sacar conclusiones**._

Este archivo se REGENERA, no se edita a mano. Las decisiones y el detalle técnico
viven en las tarjetas de Trello y en los `.md` de cada proyecto; acá están sólo los
hechos frescos que hacen falta para saber en qué estamos y qué sigue.

## 🚦 Semáforo

_sin datos_

## 💰 Ventas (neto de Jose)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📥 Embudo de las guías gratis

**919 leads** en la lista. Dónde está parado cada uno (atributo `WA_STAGE`):

- etapa 0: **230** leads _(nunca recibieron el primer regalo)_
- etapa 3: **289** leads
- etapa 5: **400** leads


Cuántos recibieron cada paso **por email** (el embudo va 100% por mail desde el 29/07):

- Regalo 3 → **136** · Regalo 4 → **0** · Regalo 5 → **400**
- Oferta → **400** · reenvío de la oferta → **89**

_(el Regalo 3 y el 4 empezaron a salir por mail el 28/07; a quien los recibió antes por WhatsApp sólo lo registra su `WA_STAGE`, no el marcador)_

### Cola de hoy (ensayo del cron, no manda nada)

_salteado por `--rapido`_

### Entrega de WhatsApp (últimos 7 días)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📧 Email (Brevo, últimos 30 días)

Lista "Leadgen - Guía Claude": **919 contactos**.

| paso del embudo | enviados | entregados | aperturas únicas | clics únicos |
|---|---|---|---|---|
| Regalo 3 · periódico digital (día 5) | 204 | 197 | 22 (11%) | 6 (3%) |
| Regalo 4 · los 5 pilares (día 7) | 1 | 1 | 1 (100%) | 1 (100%) |
| Regalo 5 · agentes de IA (día 8) | 402 | 389 | 90 (23%) | 28 (7%) |
| OFERTA (día 9) — la que vende | 401 | 386 | 44 (11%) | 9 (2%) |
| Reenvío de la oferta (+48 h, a los que no abrieron) | 91 | 87 | 1 (1%) | 0 (0%) |
| _todo el correo (incluye Regalos 1 y 2)_ | 2734 | 2628 | 501 (19%) | 178 (7%) |

### Qué hicieron los que abrieron (eventos en la landing)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

### ¿El embudo vendió?

> ⚠️ No disponible: falta una de las dos fuentes (ventas o lista de leads).

## 🧭 Trello — qué falta, tarjeta por tarjeta

### En progreso (9)

**[#106 🎯 EMBUDO "el periodista del muro" — ad + landing + guías + campaña propia (por fases)](https://trello.com/c/vFd9rZQ3)** — 11/30 · Mateo (Media Buyer), Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ (JOSE) Mirar /muro en un teléfono real antes de darla por buena — el QA da ✅ igual aunque el layout esté roto
- ⬜ Correr qa-salud-sitio.mjs incluyendo /muro (velocidad + links/botones)
- ⬜ Deploy de /muro y verificar EN VIVO que index.html (v3) quedó igual — vercel sube el working tree, no el commit
- ⬜ ⚠️ URGENTE (la campaña YA corre): en Make mapear este form_id → funnel='meta-leadgen-republicadores'. Con el default 'meta-leadgen-guia-claude' los leads nuevos caen mezclados con los 944 del embudo viejo y no se pueden separar
- ⬜ Guías 2, 3 y 4 de la secuencia (qué publicar → cómo leer tus números → del favor al presupuesto)
- ⬜ Lectura a los 7-10 días: costo por lead, qué imagen y qué copy ganaron, y aperturas de la guía. Con promedio de 3 días, no días sueltos
- ⬜ (JOSE) Leer la guía y validar los 7 consejos contra tu propia experiencia — son consenso de oficio, no política publicada por Meta. La guía NO cita ninguna estadística, justamente para no inventar datos ajenos
- ⬜ Subir guia-tus-lectores.pdf a una URL pública y ponerla en el botón de la pantalla final del formulario de Lead Ads
- _…y 11 más_

**[#107 📣 Orgánico FB: convertir la guía "Que te lean miles" en serie de posts](https://trello.com/c/DOhEmqkI)** — 8/13 · Valentina (Organico) · últ. 2026-07-30
- ⬜ Programar 29, 30 y 31/08 cuando la cola baje de 29 (re-correr schedule-muro.mjs, es idempotente) — contenido ya listo
- ⬜ (JOSE) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro
- ⬜ A los 7 días de arrancar: mirar qué posteo trajo más comentarios y si aparecieron lectores nuevos (no conocidos) — es el mismo recuento C/L que enseñamos
- ⬜ 🔴 (JOSE) Decidir el disparador diario de las stories: las de página NO se pueden programar, la API las publica al instante. Opciones: cron en Vercel, Make, o a mano
- ⬜ Aplicar el bloque marcado de las portadas también a las 16 stories (hoy tienen el diseño anterior) — solo si Jose confirma que el diseño nuevo queda

**[#102 Radar de Tendencias TikTok — bono del curso](https://trello.com/c/UbfSnBSU)** — 6/10 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Cargar ANTHROPIC_API_KEY en ads-agent/.env y probar la capa de IA
- ⬜ Curar cuentas del grupo 3 (virales/sucesos/calle) — es donde explota primero
- ⬜ Programar corridas automáticas (definir cuántas por día)
- ⬜ Publicar el resultado donde lo vea el alumno (página + email)

**[#101 🎬 CURSO EN VIDEO (Sistema de Ingresos) — tarjeta maestra](https://trello.com/c/m2WA7HJP)** — 8/24 · Director (Academico) · últ. 2026-07-29
- ⬜ M4 El nombre y la marca — producido; falta voz Chris (cuota ElevenLabs, reset ~19 ago) → HANDOFF-M4.md
- ⬜ Pegar embeds M4 (cuando salga, va ANTES que M4… ojo: M5 antes que M4 en el orden)
- ⬜ M1 (índigo) — falta la 1.4 (escalera)
- ⬜ M2 (cyan) — generar módulo + 5 clases
- ⬜ M3 (verde) — generar módulo + 4 clases
- ⬜ M4 (rosa) — generar módulo + 5 clases
- ⬜ M5 (violeta) — generar módulo + 6 clases
- ⬜ Cargar en Hotmart: M1, M2, M3, M5 y final (tipo Ejercicio)
- _…y 8 más_

**[#71 Contenido Leadr · Semana 27 jul-2 ago → Automatización](https://trello.com/c/2a3MCENA)** — 0/4 · Director (Academico) · últ. 2026-07-29
- ⬜ CLASE: escribir + cargar las 4 clases faltantes de Automatización (grupo 18) en ../Leadr
- ⬜ RECURSO PRO: plantilla/prompt de un flujo automatizado para periodistas (ej. resumen de fuentes con IA)
- ⬜ NOVEDAD: post comunidad "Módulo Automatización completo" + 1 tip accionable
- ⬜ VERIFICAR: confirmar en Supabase que grupo 18 = 8/8 clases antes de mover a Hecho

**[#73 Trazabilidad por versiones — landing v3 (identificación) + checkout v3 (PayPal ON) midiendo](https://trello.com/c/sFqLzsAH)** — 16/21 · Bruno (Data Analyst), Luna (CRO/Landing) · últ. 2026-07-29
- ⬜ ~05/08: chequeo intermedio v3 (scroll Clarity vs 31,78% + ventas/día). No tocar la landing hasta el veredicto
- ⬜ ~05/08: chequear checkout v3 — ¿vuelve el volumen que LLEGA (0,33/día en v2 vs 1,44 en v1) y los carritos abandonados?
- ⬜ ~12/08: veredicto landing v3 (scroll y ventas/día; clics SOLO como control) y veredicto checkout v3 vs v1 (completion 26,9%)
- ⬜ Confirmar en la config de pagos de Hotmart si BILLET/efectivo quedó prendido (apareció 1 pago BILLET MXN en v2)
- ⬜ Antes de dar por buena una versión: mirar el hero en un teléfono real. El QA no revisa layout, da ✅ igual

**[#30 Operar y optimizar campaña ad1-fomo (primera campaña viva)](https://trello.com/c/MpM48Zc5)** — 1/5 · Mateo (Media Buyer) · últ. 2026-07-29
- ⬜ Corregir el CTA cortado en la imagen del creativo (Canva): "HAZ CLIC SI ERES PERIODISTA" completo, sin salirse del borde — pendiente menor
- ⬜ Verificar que el valor TOTAL con order bumps (curso + OBs) llegue a Meta en el Purchase — chequear el raw payload de la próxima venta real con OB (si manda solo $27, el ROAS se ve bajo)
- ⬜ Hotmart (config del producto): sacar el upsell "Nutrición para Bebés", cambiar la portada del dinero por una on-brand, mejorar la UX del área del curso
- ⬜ Crear Conversión Personalizada en Meta filtrada por content_ids=curso-sistema-ingresos (para que la campaña optimice solo compras del curso, no las de Leadr)

**[#94 Embudo de las guías gratis — 100% por EMAIL (corre solo)](https://trello.com/c/DyKdwyrB)** — 5/7 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Registro por cliente en Supabase (tabla funnel_email): fecha de cada paso enviado por email (r3/r4/r5/oferta/seguimiento), consultable — sacar el estado de los atributos escondidos de Brevo
- ⬜ Conservar el historial de WhatsApp (conversaciones_wa/mensajes) como registro del cliente potencial — NO borrar

**[#62 Upsell post-compra: "Tu Periódico Digital + Redacción IA" (página ESPERA)](https://trello.com/c/XvzdCj3l)** — 8/16 · Luna (CRO/Landing) · últ. 2026-07-16
- ⬜ Armar la planilla plantilla ya publicada como CSV (columnas + notas de ejemplo)
- ⬜ Grabar 3 videos cortos de los pasos que traban: publicar CSV, conectar CSV en Lovable, pegar en la planilla
- ⬜ Plantilla de sitio de respaldo + mini-FAQ de los 5 errores comunes (anti-reembolso)
- ⬜ Configurar el upsell de 1 clic en Hotmart (embudo post-compra)
- ⬜ Empaquetar la entrega y definir dónde vive (acceso Hotmart / carpeta)
- ⬜ Probar el flujo completo E2E (compra → OTO → aceptar → entrega) antes de encender
- ⬜ Documentar la decisión técnica en un archivo del repo
- ⬜ Grabar la Mini VSL del upsell (5-6 min, voz en off + grabación de pantalla) con el guión

### Bloqueada (5)

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

**[#86 🖼️ Imágenes generadas con IA (OpenAI)](https://trello.com/c/3yBAOq9M)** — 0/3 · Director (Academico) · últ. 2026-07-18
- ⬜ Cargar OPENAI_API_KEY + crédito (~$5) en OpenAI (Jose)
- ⬜ Generar imágenes/fondos con gpt-image-1 y tratarlos con la paleta
- ⬜ Integrar en las clases y re-renderizar

**[#84 🎙️ Voz final del curso — ElevenLabs (Creator + voz argentina)](https://trello.com/c/7on7Y0rr)** — 0/4 · Director (Academico) · últ. 2026-07-18
- ⬜ Activar plan ElevenLabs Creator (Jose)
- ⬜ Diseñar o elegir la voz argentina (voice_id)
- ⬜ Regenerar los audios de todas las clases con la voz final
- ⬜ Re-render de las clases con la voz final

### En revision (12)

**[#108 Link de acceso a Leadr vencido = callejón sin salida (0 de 18 entraron)](https://trello.com/c/4EuUeUB5)** — 9/10 · Nicolas (Backend) · últ. 2026-07-31
- ⬜ Probar en vivo con un link vencido de verdad (que aparezca el cartel y llegue el mail nuevo)

**[#93 Reorganizar estructura del repo (ads-agent + sistema-ingresos)](https://trello.com/c/D0Y45QnX)** — 5/6 · Nicolas (Backend) · últ. 2026-07-30
- ⬜ Verificar que nada se rompió tras cada tanda: correr los scripts clave de ads-agent (fetch-meta, sync) y qa-salud-sitio.mjs en las 10 páginas; confirmar deploy de sistema-ingresos en Vercel OK

**[#105 Visor de datos en el admin de Leadr (/admin/datos)](https://trello.com/c/hCg9UqXJ)** — 3/4 · Nicolas (Backend), Valeria (Frontend) · últ. 2026-07-30
- ⬜ Jose abre /admin/datos y confirma que las 18 tablas cargan bien

**[#104 Ficha por cliente: todo lo que le mandamos y si lo abrió](https://trello.com/c/mvKsdYVI)** — 4/5 · Nicolas (Backend), Valeria (Frontend) · últ. 2026-07-30
- ⬜ Confirmar mañana que la corrida diaria del panel actualizó la tabla sola

**[#103 Nadie podía entrar a Leadr: el mail de acceso no llegaba](https://trello.com/c/zbBKesUE)** — 5/6 · Nicolas (Backend), Sofia (Email) · últ. 2026-07-30
- ⬜ Verificar en 48h cuántos de los 18 crearon contraseña y entraron

**[#70 Contenido Leadr · Semana 20-26 jul → Seguridad Digital](https://trello.com/c/Ov5SPFfx)** — 3/4 · Director (Academico) · últ. 2026-07-29
- ⬜ NOVEDAD: post comunidad "Módulo Seguridad Digital completo" + 1 tip accionable

**[#77 Agenda diaria del tablero Trello (recordatorio + auto-cierre en el email diario)](https://trello.com/c/wphImuWx)** — 7/9 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Commitear los cambios a git al repo (pendiente confirmacion de Jose)
- ⬜ Confirmar el 18/07 que la seccion Agenda aparece en el email diario del Panel de Salud

**[#53 Desbloquear el trabajo de los agentes y que corran diarios solos](https://trello.com/c/3XHNa8oW)** — 6/9 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Confirmar con Jose que Mateo aporta valor (unos días de recomendaciones) antes de clonar
- ⬜ Clonar al próximo agente (sugerido: Sofía email → Dante analytics)
- ⬜ (al escalar) Consolidar recomendaciones en el Panel de Comando para no inundar la casilla

**[#52 Inbox de WhatsApp en Leadr (/admin/chats) — ver hilos + campaña](https://trello.com/c/ZhXVDMsn)** — 9/11 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Confirmar con Jose que ve el panel de campaña tras el build de Leadr (05/07)
- ⬜ ⚠️ Mantenimiento: si en el futuro se cambia el texto de una plantilla en Meta, re-sincronizar las constantes de chats-client.tsx (FUNNEL_GUIA_CLAUDE / RECUP_*). No es automático — el texto literal está hardcodeado.

**[#68 Salud del sitio del curso: test velocidad + botones + optimización de carga](https://trello.com/c/cNVUfYMB)** — 7/8 · Max (QA/Performance) · últ. 2026-07-16
- ⬜ Jose: confirmar VISUALMENTE en el celu (botón 1 línea + hero se ve bien al instante + 3D entra después)

**[#40 Fuga de checkout del curso (86% abandono) + motivos de cancelación Hotmart](https://trello.com/c/qM5vVbJo)** — 4/5 · Luna (CRO/Landing) · últ. 2026-07-16
- ⬜ Exportar el CSV de cancelaciones con rango AMPLIO (30-60 días) y analizar el mix (rechazo de tarjeta vs persuasión) → define el cambio concreto del checkout

**[#59 Revisar Pro de Leadr — cuántos pagan de verdad vs regalados](https://trello.com/c/1xeibaWl)** — 6/7 · Bruno (Data Analyst) · últ. 2026-07-05
- ⬜ Definir política: qué pasa cuando se vence el mes gratis del bono del curso (¿downgrade automático? ¿aviso previo?)

### Por hacer (12)

**[#109 📊 Campañas en Leadr — una página por campaña con el embudo paso a paso en vivo](https://trello.com/c/McxkZs9Y)** — 0/6 · Nicolas (Backend), Luna (CRO/Landing) · últ. 2026-07-31
- ⬜ Definir la fuente: el panel lee Brevo EN VIVO (decisión de Jose 31/07). comunicaciones_email queda para detalle por persona e histórico
- ⬜ Llenar funnel_steps.slug con el mismo valor que comunicaciones_email.campana (regalo1-guia-claude, regalo2-50-prompts, regalo3-periodico, regalo4-pilares, regalo5-agentes-ia, oferta-email, oferta-reenvio) — con eso el join sale solo
- ⬜ Cargar los funnel_steps de meta-leadgen-republicadores (hoy tiene 0): anuncio → formulario nativo → entrega de la guía → secuencia de emails → oferta
- ⬜ Guardar el CONTENIDO de cada mensaje para poder leerlo desde la página (hoy solo está el asunto; el cuerpo vive en Brevo y en el código del embudo)
- ⬜ Excluir del embudo los 184 correos internos (Panel de Comando, Panel de Salud, reportes de agentes): abren al 67% porque los abre Jose y distorsionan cualquier promedio
- ⬜ Construir la página en ../Leadr (repo aparte): lista de campañas → detalle con los pasos en orden, el mensaje de cada uno y su tasa de apertura y clic

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

**[#46 Contabilidad automática — buzón de facturas (gastos@)](https://trello.com/c/Y1YEouzN)** — 5/11 · Bruno (Data Analyst) · últ. 2026-07-30
- ⬜ Poner gastos@ como email de facturación en cada proveedor (Vercel, Supabase, Brevo, Make, higgsfield, Anthropic, dominio)
- ⬜ Validar con la 1ª factura real que entra sola
- ⬜ Make.com — Perfil → Subscription/Billing → email de facturación = gastos@leadr.cloud
- ⬜ Dominio leadr.cloud (Hostinger) — Datos de facturación → email = gastos@leadr.cloud
- ⬜ Dominio sistemadeingresosdiariosia.com — en su registrador → email de facturación = gastos@leadr.cloud
- ⬜ ⚠️ Meta Ads — SOLO verificar que la factura siga llegando al Gmail. NO redirigir a gastos@ ni cargar como fijo: ya se carga solo a nivel cuenta (si se mete al buzón, el gasto se DUPLICA). Igual para WhatsApp de Meta (se estima en la tabla `mensajes`)

**[#74 Programar orgánico FB — Agosto 2026](https://trello.com/c/ksKJ4IEf)** — 8/9 · Valentina (Organico) · últ. 2026-07-30
- ⬜ Agosto queda cubierto hasta el 28. Faltan 29, 30 y 31: rebotan por el tope de Meta (29 en cola) — re-correr schedule-muro.mjs desde el 3/08. Seguimiento en #107

**[#92 🎬 Módulo 1 · Fundamentos — 7 clases en video (a Hotmart)](https://trello.com/c/LQ8ZkLHg)** — 5/7 · Director (Academico) · últ. 2026-07-29
- ⬜ Portada 1.4 (escalera ascendente) — generar en ChatGPT y guardar
- ⬜ Subir a Hotmart: 7 embeds + portadas (módulo nuevo que convive con el viejo)

**[#75 Atribución de ventas al anuncio: fix ventas.src + upsells post-compra](https://trello.com/c/2jE9YpRt)** — 0/10 · Nicolas (Backend) · últ. 2026-07-29
- ⬜ Ubicar el handler del webhook en sistema-ingresos/api/hotmart y ver dónde arma el insert a `ventas`
- ⬜ Setear src = payload.data.purchase.origin.src cuando el campo directo venga vacío (fallback al payload)
- ⬜ Order bumps (origin.src vacío): heredar el src del curso del mismo comprador/checkout
- ⬜ Backfill: UPDATE de las filas históricas con src NULL usando el origin.src del payload guardado
- ⬜ Verificar E2E: una compra nueva de prueba con ?src=test debe quedar con src poblado en la columna
- ⬜ Crear vista v_ventas_atribuidas: src_atribuido = coalesce(src, src de otra venta del MISMO email que tenga src, dentro de ±7 días)
- ⬜ Solo atribuir si el mismo comprador tiene una venta con src real; si no → queda 'sin anuncio' genuino (orgánico)
- ⬜ Verificar con el caso real: Mariano (Máquina + Método sin src, mismo día que su curso ad1-fomo) → deben quedar atribuidas a ad1-fomo; Juan Manuel (Sala VIP) → sigue sin anuncio
- _…y 2 más_

**[#91 Producir VSL para la landing y testear](https://trello.com/c/TmOQfLNe)** — 0/7 · Luna (CRO/Landing) · últ. 2026-07-24
- ⬜ Escribir guion VSL corto (2-3 min): problema -> mecanismo unico -> oferta -> CTA (metodo Luis Mena)
- ⬜ Aprobar guion con Jose
- ⬜ Producir el video (voz + visuales)
- ⬜ Montar el VSL arriba de la landing (definir player / autoplay muteado)
- ⬜ Definir el test: A/B o version v4-con-VSL contra v3-sin-VSL
- ⬜ Trackear reproduccion + retencion + scroll + tasa checkout
- ⬜ Veredicto del test (VSL sube conversion vs v3?)

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

**[#72 Contenido Leadr · Semana 3-9 ago → OSINT Periodístico](https://trello.com/c/YaQyToRv)** — 0/4 · Director (Academico) · últ. 2026-07-16
- ⬜ CLASE: crear módulo OSINT desde cero — config JSON + cargar primeras clases (hoy no existe en Supabase)
- ⬜ RECURSO PRO: prompt-kit OSINT (búsqueda inversa de imágenes, geolocalización, verificación de cuentas)
- ⬜ NOVEDAD: post comunidad "Nuevo módulo: OSINT Periodístico" + 1 tip accionable
- ⬜ VERIFICAR: confirmar en Supabase que el grupo OSINT existe con clases publicadas

**[#69 📚 Sistema de contenido semanal Leadr (maestra)](https://trello.com/c/of052YuP)** — 1/14 · Director (Academico) · últ. 2026-07-16
- ⬜ F1 · Automatización (grupo 18) — 4/8
- ⬜ F1 · OSINT Periodístico — 0/8 (crear módulo)
- ⬜ F2 · Data Journalism — 3/8
- ⬜ F2 · Cobertura en Tiempo Real — 4/8
- ⬜ F2 · Especialización de Beat — 2/8
- ⬜ F2 · Investigación Avanzada — 3/8
- ⬜ F2 · Autoridad Editorial — 4/8
- ⬜ F2 · Liderazgo IA en Redacción — 0/8 (crear módulo)
- _…y 5 más_

**[#51 Configurar ChatGPT como proveedor de imágenes](https://trello.com/c/UEPGbi2J)** — 0/7 · Valentina (Organico) · últ. 2026-07-03
- ⬜ Confirmar la cuenta de ChatGPT a usar (plan free) y quién la opera
- ⬜ Definir el flujo manual: prompt → generar en ChatGPT → descargar PNG → usar en carrusel/anuncio
- ⬜ Escribir el "recipe" de prompt con la marca (paleta #07070f + indigo #6366f1 + cyan #22d3ee, texto legible en pantalla) y guardarlo en el repo (ads-agent)
- ⬜ Generar 1 imagen de prueba (un creativo/placa) y validar calidad + texto legible antes de adoptarlo
- ⬜ Documentar en el repo que higgsfield/fal.ai quedan fuera para imágenes (actualizar donde se mencionen)
- ⬜ Dar de baja la suscripción de higgsfield (coordina con #48 / Contabilidad)
- ⬜ (Futuro, opcional) Evaluar la API de OpenAI Images (pago) para automatizar cuando haya volumen

## ⏳ Esperando a Jose

- [#89](https://trello.com/c/HhfWhrB9) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- [#89](https://trello.com/c/HhfWhrB9) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.
- [#84](https://trello.com/c/7on7Y0rr) Activar plan ElevenLabs Creator 
- [#86](https://trello.com/c/3yBAOq9M) Cargar OPENAI_API_KEY + crédito (~$5) en OpenAI 
- [#98](https://trello.com/c/vFkbcxvb) Pegar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (Supabase → periodistas-marketing → Project Settings → API → service_role). Sin eso, ventas y entrega de WhatsApp quedan fuera del informe
- [#106](https://trello.com/c/vFd9rZQ3) Mirar /muro en un teléfono real antes de darla por buena — el QA da ✅ igual aunque el layout esté roto
- [#106](https://trello.com/c/vFd9rZQ3) Leer la guía y validar los 7 consejos contra tu propia experiencia — son consenso de oficio, no política publicada por Meta. La guía NO cita ninguna estadística, justamente para no inventar datos ajenos
- [#107](https://trello.com/c/DOhEmqkI) Leer los 3 primeros (16, 17 y 18/08) antes de que salgan y avisar si el tono no es el del muro
- [#107](https://trello.com/c/DOhEmqkI) 🔴 Decidir el disparador diario de las stories: las de página NO se pueden programar, la API las publica al instante. Opciones: cron en Vercel, Make, o a mano

## 📋 Tarjetas sin checklist

_todas las tarjetas activas tienen checklist_
