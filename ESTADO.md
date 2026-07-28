# ESTADO — foto en vivo del negocio

_Generado el 2026-07-28 23:43 UTC por `node estado.mjs`. Si esta fecha no es de hoy, **volvé a correrlo antes de sacar conclusiones**._

Este archivo se REGENERA, no se edita a mano. Las decisiones y el detalle técnico
viven en las tarjetas de Trello y en los `.md` de cada proyecto; acá están sólo los
hechos frescos que hacen falta para saber en qué estamos y qué sigue.

## 🚦 Semáforo

- 🔴 **Entrada del embudo tapada** — 285 leads esperan el Regalo 3 (el primer paso). Mientras estén ahí no llegan ni al Regalo 5 ni a la oferta.
- 🟢 **Embudo** encendido — 635 envíos en cola: {"mailoferta":26,"wa_stage_5":2,"wa_stage_4":85,"wa_stage_3":285,"seguimiento":237}

## 💰 Ventas (neto de Jose)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📥 Embudo de las guías gratis

**872 leads** en la lista. Dónde está parado cada uno (atributo `WA_STAGE`):

- etapa 0: **385** leads _(nunca recibieron el primer regalo)_
- etapa 3: **87** leads
- etapa 4: **2** leads
- etapa 5: **398** leads

Recibieron por email: Regalo 5 → **400** · oferta → **372** · seguimiento → **0**. Sin teléfono: 17.

### Cola de hoy (ensayo del cron, no manda nada)

- **635** envíos pendientes: `{"mailoferta":26,"wa_stage_5":2,"wa_stage_4":85,"wa_stage_3":285,"seguimiento":237}`
- Embudo encendido (`WA_FUNNEL_ENABLED`)

### Entrega de WhatsApp (últimos 7 días)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

## 📧 Email (Brevo, últimos 30 días)

Lista "Leadgen - Guía Claude": **871 contactos**.

| pieza | enviados | entregados | aperturas únicas | clics únicos |
|---|---|---|---|---|
| **todo el correo** | 2387 | 2297 | 457 (20%) | 172 (7%) |
| oferta-email | 373 | 359 | 40 (11%) | 9 (3%) |
| regalo5-agentes-ia | 402 | 389 | 86 (22%) | 26 (7%) |

### Qué hicieron los que abrieron (eventos en la landing)

> ⚠️ No disponible: falta SUPABASE_SERVICE_ROLE_KEY (Vercel no la deja bajar: está marcada "Sensitive"). Pegarla en `ads-agent/.env.local` — Supabase → periodistas-marketing → Project Settings → API → service_role. Mientras tanto, esta sección se consulta con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`).

### ¿El embudo vendió?

> ⚠️ No disponible: falta una de las dos fuentes (ventas o lista de leads).

## 🧭 Trello — qué falta, tarjeta por tarjeta

### En progreso (7)

**[#30 Operar y optimizar campaña ad1-fomo (primera campaña viva)](https://trello.com/c/MpM48Zc5)** — 1/6 · Mateo (Media Buyer) · últ. 2026-07-19
- ⬜ Corregir el CTA cortado en la imagen del creativo (Canva): "HAZ CLIC SI ERES PERIODISTA" completo, sin salirse del borde — pendiente menor
- ⬜ Verificar que el valor TOTAL con order bumps (curso + OBs) llegue a Meta en el Purchase — chequear el raw payload de la próxima venta real con OB (si manda solo $27, el ROAS se ve bajo)
- ⬜ Hotmart (config del producto): sacar el upsell "Nutrición para Bebés", cambiar la portada del dinero por una on-brand, mejorar la UX del área del curso
- ⬜ Crear Conversión Personalizada en Meta filtrada por content_ids=curso-sistema-ingresos (para que la campaña optimice solo compras del curso, no las de Leadr)
- ⬜ Confirmar con Jose qué tracking tenía la landing vieja de WordPress/Divi y chequear que no se perdió ninguna métrica clave (cabo suelto de Fase 1)

**[#83 🗺️ Reestructuración del curso — plan curriculum (~52 clases)](https://trello.com/c/SpeVnQGk)** — 2/4 · Director (Academico) · últ. 2026-07-18
- ⬜ Módulo 0 (Bienvenida) producido
- ⬜ Módulos 1 a 12 por producir

**[#82 📚 Módulo 0 — Bienvenida (curso en video)](https://trello.com/c/e7ovuApU)** — 3/5 · Director (Academico) · últ. 2026-07-18
- ⬜ 0.4 Tutorial: tu periódico digital en 15 min (grabar pantalla)
- ⬜ Reemplazar voz Chris por la argentina final

**[#62 Upsell post-compra: "Tu Periódico Digital + Redacción IA" (página ESPERA)](https://trello.com/c/XvzdCj3l)** — 8/16 · Luna (CRO/Landing) · últ. 2026-07-16
- ⬜ Armar la planilla plantilla ya publicada como CSV (columnas + notas de ejemplo)
- ⬜ Grabar 3 videos cortos de los pasos que traban: publicar CSV, conectar CSV en Lovable, pegar en la planilla
- ⬜ Plantilla de sitio de respaldo + mini-FAQ de los 5 errores comunes (anti-reembolso)
- ⬜ Configurar el upsell de 1 clic en Hotmart (embudo post-compra)
- ⬜ Empaquetar la entrega y definir dónde vive (acceso Hotmart / carpeta)
- ⬜ Probar el flujo completo E2E (compra → OTO → aceptar → entrega) antes de encender
- ⬜ Documentar la decisión técnica en un archivo del repo
- ⬜ Grabar la Mini VSL del upsell (5-6 min, voz en off + grabación de pantalla) con el guión

**[#39 Publicar ad2-fomo2 · test creativo B a $10/día](https://trello.com/c/DfdLqvnD)** — 4/14 · Mateo (Media Buyer) · últ. 2026-07-16
- ⬜ Decidir estructura: conjunto PROPIO $10/día (test limpio, recomendado) vs. mismo conjunto de ad1
- ⬜ Crear/duplicar el conjunto con el targeting de ad1 (30-55, geo, exclusiones, optimización Compra, dataset Periodistas del Futuro 2.0)
- ⬜ Anuncio nuevo: subir ads2-fomo2.png (1080×1080)
- ⬜ Copy = idéntico al de ad1 (texto principal, título "Tu propio periódico digital con IA", descripción, CTA "Más información")
- ⬜ URL de destino = https://sistemadeingresosdiariosia.com/?src=ad2-fomo2 (con el ?src, clave para atribución en Hotmart)
- ⬜ Nombre del anuncio en Meta = "ad2-fomo2 · FOMO+IA creativo B"
- ⬜ Presupuesto $10/día · destino = la landing (NO directo a Hotmart)
- ⬜ Publicar y verificar que quede "En revisión"/"Activo"; actualizar registro-anuncios.md (estado → 🟢 Activo + fecha)
- _…y 2 más_

**[#48 Facturación: poner gastos@leadr.cloud en cada proveedor](https://trello.com/c/HQSQBVM4)** — 6/10 · Bruno (Data Analyst) · últ. 2026-07-04
- ⬜ Make.com — Perfil → Subscription/Billing → email de facturación = gastos@leadr.cloud
- ⬜ Dominio leadr.cloud (Hostinger) — Datos de facturación → email = gastos@leadr.cloud
- ⬜ Dominio sistemadeingresosdiariosia.com — en su registrador → email de facturación = gastos@leadr.cloud
- ⬜ Meta Ads — SOLO verificar que la factura siga llegando a tu Gmail. NO redirigir a gastos@ ni cargar como fijo: ya se carga solo (evita duplicar). Ver descripción.

**[#46 Contabilidad automática — buzón de facturas (gastos@)](https://trello.com/c/Y1YEouzN)** — 5/7 · Bruno (Data Analyst) · últ. 2026-07-03
- ⬜ Poner gastos@ como email de facturación en cada proveedor (Vercel, Supabase, Brevo, Make, higgsfield, Anthropic, dominio)
- ⬜ Validar con la 1ª factura real que entra sola

### Bloqueada (6)

**[#96 🎬 Módulo 4 · El nombre y la marca — 5 clases en video](https://trello.com/c/05OikLRc)** — 4/7 · Director (Academico) · últ. 2026-07-28
- ⬜ [BLOQUEADO cuota] Voz Chris f41-f45 + subtítulos
- ⬜ [BLOQUEADO cuota] Render finales + subir YouTube playlist M4
- ⬜ [después] HOTMART-M4-completo.md + portadas rosa

**[#86 🖼️ Imágenes generadas con IA (OpenAI)](https://trello.com/c/3yBAOq9M)** — 0/3 · Director (Academico) · últ. 2026-07-18
- ⬜ Cargar OPENAI_API_KEY + crédito (~$5) en OpenAI (Jose)
- ⬜ Generar imágenes/fondos con gpt-image-1 y tratarlos con la paleta
- ⬜ Integrar en las clases y re-renderizar

**[#84 🎙️ Voz final del curso — ElevenLabs (Creator + voz argentina)](https://trello.com/c/7on7Y0rr)** — 0/4 · Director (Academico) · últ. 2026-07-18
- ⬜ Activar plan ElevenLabs Creator (Jose)
- ⬜ Diseñar o elegir la voz argentina (voice_id)
- ⬜ Regenerar los audios de todas las clases con la voz final
- ⬜ Re-render de las clases con la voz final

**[#74 Programar orgánico FB — Agosto 2026](https://trello.com/c/ksKJ4IEf)** — 5/7 · Valentina (Organico) · últ. 2026-07-16
- ⬜ Programar 15/08 cuando se libere 1 lugar del tope de Meta (contenido ya listo)
- ⬜ Generar y programar agosto 16→31 a medida que se liberen lugares

**[#36 Capturar rechazos de tarjeta de Hotmart (hueco de recuperación)](https://trello.com/c/BvvEtt86)** — 5/13 · Nicolas (Backend) · últ. 2026-07-11
- ⬜ Confirmar el nombre real del evento contra el raw payload en los logs de Vercel (/api/hotmart) cuando llegue un rechazo real
- ⬜ Habilitar ese evento en la config de webhooks de Hotmart y/o mapearlo en classifyPotencial (sistema-ingresos/api/hotmart.js)
- ⬜ Probar E2E: rechazo real → entra a clientes_potenciales como pago_rechazado → dispara recup_rechazo_1 solo
- ⬜ Jose: habilitar scope Ventas/Reportes en la credencial de Hotmart (hoy da 403) — destraba también el backfill de ventas
- ⬜ Cargar SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (para que el sync escriba)
- ⬜ E2E: node hotmart-sync.mjs --dry-run --solo-rechazos (confirma que la API devuelve rechazos + mapeo) → sin dry-run → verificar que el cron manda recup_rechazo_1
- ⬜ Dejar hotmart-sync.mjs de cron diario (antes del cron de recuperación) para que los rechazos entren solos
- ⬜ PUENTE MANUAL (sin API, disponible ya): importador ads-agent/hotmart-rechazos-csv.mjs ✅ listo y probado → Jose exporta el CSV del panel "Motivos de rechazo" y Claude lo inserta en clientes_potenciales

**[#50 Contar aperturas de las guías de WhatsApp (Regalo 3 y 4 → botón con tracking)](https://trello.com/c/KWri6PkI)** — 1/4 · Bruno (Data Analyst) · últ. 2026-07-03
- ⬜ Esperar aprobación de Meta (ids 1532705275224411 / 2687951991599180)
- ⬜ Al aprobarse: cambiar buildTemplatePayload en wa-funnel.js a las plantillas nuevas + deploy
- ⬜ Verificar aperturas contadas en events (tipo_evento='pdf_open', src=WhatsApp-Regalo3/4)

### En revision (14)

**[#97 🧠 Quizzes del curso — 6 tests (M1-M5 + final)](https://trello.com/c/mFCN4meM)** — 2/5 · Director (Academico) · últ. 2026-07-28
- ⬜ [Jose] Cargar en Hotmart quizzes M1, M2, M3, M5 (tipo Ejercicio)
- ⬜ [cuando salga M4] Cargar quiz M4
- ⬜ [opcional] Quiz M0 si Jose lo pide

**[#95 🎬 Módulo 5 · Tu nicho y tu lector — 6 clases en video](https://trello.com/c/mQri8o5d)** — 6/8 · Director (Academico) · últ. 2026-07-27
- ⬜ [Jose] Subir 6 embeds a Hotmart (M5 va ANTES que M4)
- ⬜ [Jose] Generar portadas violeta (ChatGPT)

**[#87 Landing v2 — barra sticky de compra + hero reservar cupo](https://trello.com/c/h5Zs6lE0)** — 7/8 · últ. 2026-07-19
- ⬜ PENDIENTE ~31/07: veredicto v2 — comparar tasa_landing_checkout y compras de v2 vs baseline v1 (5,78% / 14 compras)

**[#80 Destapar embudo WhatsApp: Regalo 5 + auto-encadenado (throughput)](https://trello.com/c/Ft8sTsYd)** — 7/8 · Nicolas (Backend) · últ. 2026-07-17
- ⬜ PENDIENTE 18/07: tras el cron de las 10am ART, verificar que la corrida automática encadenada mandó ~130 y drenó la cola sola (chequear WA_SENT_AT del día + would_send)

**[#70 Contenido Leadr · Semana 20-26 jul → Seguridad Digital](https://trello.com/c/Ov5SPFfx)** — 3/4 · Director (Academico) · últ. 2026-07-16
- ⬜ NOVEDAD: post comunidad "Módulo Seguridad Digital completo" + 1 tip accionable

**[#73 Trazabilidad por versiones — checkout y landing (v1/v2) + medir PayPal OFF](https://trello.com/c/sFqLzsAH)** — 6/10 · Bruno (Data Analyst), Luna (CRO/Landing) · últ. 2026-07-16
- ⬜ ~24/07: chequear que no se rompió (ventas siguen normales)
- ⬜ ~31/07: medir v2 checkout y comparar completion vs v1 (26,9%)
- ⬜ Escribir veredicto v2 (ganó/perdió). Si es peor, reactivar PayPal y registrar
- ⬜ Definir medición periódica de landing_versiones (events + Clarity)

**[#77 Agenda diaria del tablero Trello (recordatorio + auto-cierre en el email diario)](https://trello.com/c/wphImuWx)** — 7/9 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ Commitear los cambios a git al repo (pendiente confirmacion de Jose)
- ⬜ Confirmar el 18/07 que la seccion Agenda aparece en el email diario del Panel de Salud

**[#68 Salud del sitio del curso: test velocidad + botones + optimización de carga](https://trello.com/c/cNVUfYMB)** — 7/8 · Max (QA/Performance) · últ. 2026-07-16
- ⬜ Jose: confirmar VISUALMENTE en el celu (botón 1 línea + hero se ve bien al instante + 3D entra después)

**[#67 Puente WhatsApp: ver adjuntos entrantes en Telegram (imagen/audio/video/doc)](https://trello.com/c/yPVDDi3p)** — 7/9 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ PENDIENTE: Nelson reenvía la imagen → confirmar E2E que llega a Telegram + descargarla para diagnosticar su error de pago
- ⬜ PENDIENTE (opcional): commitear a git los archivos del puente en prod-no-commiteados

**[#40 Fuga de checkout del curso (86% abandono) + motivos de cancelación Hotmart](https://trello.com/c/qM5vVbJo)** — 4/5 · Luna (CRO/Landing) · últ. 2026-07-16
- ⬜ Exportar el CSV de cancelaciones con rango AMPLIO (30-60 días) y analizar el mix (rechazo de tarjeta vs persuasión) → define el cambio concreto del checkout

**[#49 Verificar que el embudo de regalos avanza más allá del Regalo 3 (R4 → R5 → Oferta)](https://trello.com/c/yUPU4Xkk)** — 3/4 · Mateo (Media Buyer) · últ. 2026-07-09
- ⬜ R5 (email día 8) estaba APAGADO → encendido 09/07 (MAIL5_ENABLED=1); confirmar en la corrida del 10/07 que "Regalo 5" empieza a salir en el reporte

**[#59 Revisar Pro de Leadr — cuántos pagan de verdad vs regalados](https://trello.com/c/1xeibaWl)** — 6/7 · Bruno (Data Analyst) · últ. 2026-07-05
- ⬜ Definir política: qué pasa cuando se vence el mes gratis del bono del curso (¿downgrade automático? ¿aviso previo?)

**[#53 Desbloquear el trabajo de los agentes y que corran diarios solos](https://trello.com/c/3XHNa8oW)** — 6/9 · últ. 2026-07-05
- ⬜ Confirmar con Jose que Mateo aporta valor (unos días de recomendaciones) antes de clonar
- ⬜ Clonar al próximo agente (sugerido: Sofía email → Dante analytics)
- ⬜ (al escalar) Consolidar recomendaciones en el Panel de Comando para no inundar la casilla

**[#52 Inbox de WhatsApp en Leadr (/admin/chats) — ver hilos + campaña](https://trello.com/c/ZhXVDMsn)** — 9/14 · Nicolas (Backend) · últ. 2026-07-05
- ⬜ Confirmar con Jose que ve el panel de campaña tras el build de Leadr (05/07)
- ⬜ Endpoint en el curso que dispara sendText por Cloud API (API interna, patrón course-access)
- ⬜ Caja de respuesta en /admin/chats + manejo de la ventana de 24h (fuera de ventana: solo plantilla)
- ⬜ Loguear la respuesta de Jose (origen='jose') en conversaciones_wa
- ⬜ ⚠️ Mantenimiento: si en el futuro se cambia el texto de una plantilla en Meta, re-sincronizar las constantes de chats-client.tsx (FUNNEL_GUIA_CLAUDE / RECUP_*). No es automático — el texto literal está hardcodeado.

### Por hacer (17)

**[#94 Funnel por EMAIL + registro por cliente (mientras WhatsApp no entrega)](https://trello.com/c/DyKdwyrB)** — 1/6 · Nicolas (Backend) · últ. 2026-07-27
- ⬜ Entregar por email las guías Regalo 3 (periódico digital) y Regalo 4 (5 pilares) a cohortes pre-oferta (nunca llegaron por WhatsApp) — valor antes de vender
- ⬜ Registro por cliente en Supabase (tabla funnel_email): fecha de cada paso enviado por email (r3/r4/r5/oferta/seguimiento), consultable — sacar el estado de los atributos escondidos de Brevo
- ⬜ Conservar el historial de WhatsApp (conversaciones_wa/mensajes) como registro del cliente potencial — NO borrar
- ⬜ Reenvío a NO-abridores de la oferta (+48h, otro asunto) para subir aperturas
- ⬜ Todo automático (cron) + detrás de flag + probado en dry antes de encender

**[#89 🔴 WhatsApp NO entrega (0% desde 13/07) — verificar negocio en Meta + fix reporte de entrega](https://trello.com/c/HhfWhrB9)** — 1/6 · Nicolas (Backend) · últ. 2026-07-27
- ⬜ (JOSE) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- ⬜ (JOSE) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.
- ⬜ Decidir si pausar/bajar el ritmo del funnel (WA_FUNNEL_ENABLED=0 en Vercel) mientras el número esté LIMITED — hoy se envían ~130/día que rebotan.
- ⬜ Al quedar verificado + nombre aprobado: re-test de envío real y confirmar en conversaciones_wa que vuelve a entregar (entregado/leido, no fallido).
- ⬜ POST-verificación (idea de Jose): 1 WhatsApp corto "no reclamaste tu regalo, está en tu mail 👉" para subir aperturas del email. Solo sirve cuando el número vuelva a entregar.

**[#93 Reorganizar estructura del repo (ads-agent + sistema-ingresos)](https://trello.com/c/D0Y45QnX)** — 0/6 · Nicolas (Backend) · últ. 2026-07-26
- ⬜ Mapear estructura actual: listar carpetas/archivos de raíz, ads-agent/ y sistema-ingresos/ y anotar para qué sirve cada grupo (base para decidir dónde va cada cosa)
- ⬜ ads-agent/: agrupar los 42 .mjs sueltos en subcarpetas por función (ej. scripts/fetch, scripts/sync, scripts/gen, scripts/export) y actualizar imports/rutas relativas
- ⬜ ads-agent/: mover los .md de documentación (ARQUITECTURA-DATOS, SISTEMA-ADS, CONTABILIDAD..., etc.) a una carpeta docs/ y dejar solo README.md + CEREBRO.md en la raíz
- ⬜ sistema-ingresos/: separar los 27 .md sueltos (docs/) de los assets de guías (.html/.pdf → guias/) y dejar index.html + código (api/, módulos) en su lugar; cuidar que las rutas públicas de Vercel de las guías no cambien (o redirigir)
- ⬜ Verificar que nada se rompió tras cada tanda: correr los scripts clave de ads-agent (fetch-meta, sync) y qa-salud-sitio.mjs en las 10 páginas; confirmar deploy de sistema-ingresos en Vercel OK
- ⬜ Actualizar la documentación de rutas: CLAUDE.md (raíz), ads-agent/README.md y sistema-ingresos/README.md con la nueva estructura, para que las próximas sesiones encuentren todo

**[#92 🎬 Módulo 1 · Fundamentos — 7 clases en video (a Hotmart)](https://trello.com/c/LQ8ZkLHg)** — 5/7 · Director (Academico) · últ. 2026-07-24
- ⬜ Portada 1.4 (escalera ascendente) — generar en ChatGPT y guardar
- ⬜ Subir a Hotmart: 7 embeds + portadas (módulo nuevo que convive con el viejo)

**[#91 Producir VSL para la landing y testear](https://trello.com/c/TmOQfLNe)** — 0/7 · Luna (CRO/Landing) · últ. 2026-07-24
- ⬜ Escribir guion VSL corto (2-3 min): problema -> mecanismo unico -> oferta -> CTA (metodo Luis Mena)
- ⬜ Aprobar guion con Jose
- ⬜ Producir el video (voz + visuales)
- ⬜ Montar el VSL arriba de la landing (definir player / autoplay muteado)
- ⬜ Definir el test: A/B o version v4-con-VSL contra v3-sin-VSL
- ⬜ Trackear reproduccion + retencion + scroll + tasa checkout
- ⬜ Veredicto del test (VSL sube conversion vs v3?)

**[#90 Landing v3 — hero con el PROBLEMA al frente + fix del CTA que saltea](https://trello.com/c/WMxCXCRi)** — 0/11 · Luna (CRO/Landing) · últ. 2026-07-24
- ⬜ Reescribir H1 del hero con el problema ("Sé hacer periodismo, no sé vivir de él en internet")
- ⬜ Reescribir subtitulo del hero acorde (dolor -> promesa)
- ⬜ Cambiar CTA del hero: que NO salte a #bonos salteando el problema (bajar a seccion Problema / loop abierto)
- ⬜ Mostrar antes/despues del copy a Jose y aprobar (gate visual)
- ⬜ Registrar v3 en landing_versiones (cerrar v2: activa=false + vigente_hasta; insertar v3 activa con cambios)
- ⬜ Asegurar que se capture scroll_promedio de v3 (v2 quedo null)
- ⬜ Correr qa-salud-sitio.mjs en las 10 paginas
- ⬜ Deploy prod (vercel --prod) desde la raiz del repo
- _…y 3 más_

**[#88 YouTube orgánico — muchos videos/día (listados) para tráfico](https://trello.com/c/GLz5iqdN)** — 0/8 · Valentina (Organico) · últ. 2026-07-19
- ⬜ Definir formato y nicho (Shorts vertical vs largo; tema: periodismo + IA / noticias)
- ⬜ Definir volumen diario y ventana de prueba (ej. 3-5 videos/día × 2 semanas)
- ⬜ Crear variante "pública" del pipeline de subida (privacyStatus=public, sin playlist del curso, tags/SEO)
- ⬜ Definir método de producción para volumen (animado con el kit vs formato más rápido)
- ⬜ Producir el 1er lote de videos
- ⬜ Subir 1er lote LISTADO + arrancar cadencia diaria
- ⬜ Medir a 7-14 días (vistas, impresiones, CTR, suscriptores, tráfico a la landing)
- ⬜ Decidir: escalar el formato ganador o pivotar

**[#85 🏗️ Módulo 1 — Fundamentos (producción en video)](https://trello.com/c/uAhX2H60)** — 0/3 · Director (Academico) · últ. 2026-07-18
- ⬜ Escribir los guiones de las clases del Módulo 1
- ⬜ Producir cada clase con el sistema (voz + animación + sonido)
- ⬜ Verificar con el agente revisor y aprobar

**[#79 Auto-responder de chats pendientes de WhatsApp (revisar diario + primer mensaje)](https://trello.com/c/WjP6hjf9)** — 0/4 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ ¿Primer mensaje al instante al escalar, o en corrida diaria? (fuera de 24h WhatsApp exige plantilla aprobada por Meta)
- ⬜ Aprobar el texto del 1er mensaje: "¡Hola! Contanos un poco más en detalle en qué te podemos ayudar?"
- ⬜ ¿Un solo mensaje o cadencia de recordatorios? ¿Cuándo se da por cerrado/abandonado?
- ⬜ Resolver cómo se marca "ya respondido" (hoy la respuesta de Jose desde Telegram no cierra la escalación → pendientes eternos)

**[#76 Flujo de mensajes del bot de Messenger](https://trello.com/c/W8XAfN6Y)** — 0/6 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ Conectar la app de Facebook al webhook de Messenger (permiso pages_messaging) y suscribir la página al evento messages/messaging_postbacks
- ⬜ Crear endpoint api/messenger.js (verify GET + recibir POST) que guarde el lead entrante en Supabase (misma tabla/lógica que wa-funnel)
- ⬜ Definir la cadencia de mensajes (bienvenida → regalos 1-4 sin precio → oferta con link a la landing), respetando la ventana de 24h de Messenger
- ⬜ Excluir compradores del flujo (mismo criterio que wa-funnel) y agregar anti-bucle/dedup por sender_id
- ⬜ Puente a Telegram: reenviar los mensajes entrantes de Messenger para que Jose lea/responda (igual que el puente de WhatsApp)
- ⬜ Probar E2E con un mensaje real de prueba y verificar OUTCOMES (lead guardado, cadencia disparada, exclusión de compradores) antes de darlo por LIVE

**[#75 Fix ingesta: copiar payload.origin.src → columna ventas.src](https://trello.com/c/2jE9YpRt)** — 0/5 · Nicolas (Backend) · últ. 2026-07-16
- ⬜ Ubicar el handler del webhook en sistema-ingresos/api/hotmart y ver dónde arma el insert a `ventas`
- ⬜ Setear src = payload.data.purchase.origin.src cuando el campo directo venga vacío (fallback al payload)
- ⬜ Order bumps (origin.src vacío): heredar el src del curso del mismo comprador/checkout
- ⬜ Backfill: UPDATE de las filas históricas con src NULL usando el origin.src del payload guardado
- ⬜ Verificar E2E: una compra nueva de prueba con ?src=test debe quedar con src poblado en la columna

**[#72 Contenido Leadr · Semana 3-9 ago → OSINT Periodístico](https://trello.com/c/YaQyToRv)** — 0/4 · Director (Academico) · últ. 2026-07-16
- ⬜ CLASE: crear módulo OSINT desde cero — config JSON + cargar primeras clases (hoy no existe en Supabase)
- ⬜ RECURSO PRO: prompt-kit OSINT (búsqueda inversa de imágenes, geolocalización, verificación de cuentas)
- ⬜ NOVEDAD: post comunidad "Nuevo módulo: OSINT Periodístico" + 1 tip accionable
- ⬜ VERIFICAR: confirmar en Supabase que el grupo OSINT existe con clases publicadas

**[#71 Contenido Leadr · Semana 27 jul-2 ago → Automatización](https://trello.com/c/2a3MCENA)** — 0/4 · Director (Academico) · últ. 2026-07-16
- ⬜ CLASE: escribir + cargar las 4 clases faltantes de Automatización (grupo 18) en ../Leadr
- ⬜ RECURSO PRO: plantilla/prompt de un flujo automatizado para periodistas (ej. resumen de fuentes con IA)
- ⬜ NOVEDAD: post comunidad "Módulo Automatización completo" + 1 tip accionable
- ⬜ VERIFICAR: confirmar en Supabase que grupo 18 = 8/8 clases antes de mover a Hecho

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

**[#60 Atribuir upsells post-compra de Hotmart al anuncio que trajo al cliente](https://trello.com/c/bwZpmJmN)** — 0/5 · Mateo (Media Buyer), Bruno (Data Analyst) · últ. 2026-07-16
- ⬜ Crear vista v_ventas_atribuidas: src_atribuido = coalesce(src, src de otra venta del MISMO email que tenga src, dentro de ±7 días)
- ⬜ Solo atribuir si el mismo comprador tiene una venta con src real; si no → queda 'sin anuncio' genuino (orgánico)
- ⬜ Verificar con el caso real: Mariano (Máquina + Método sin src, mismo día que su curso ad1-fomo) → deben quedar atribuidas a ad1-fomo; Juan Manuel (Sala VIP) → sigue sin anuncio
- ⬜ Apuntar Mateo y Dante a leer src_atribuido para CPA/ROAS por anuncio (que ad1-fomo cobre el crédito completo)
- ⬜ Confirmar que el ROAS/valor real de ad1-fomo sube al incluir los upsells post-compra, y avisarle a Jose el número corregido

**[#51 Configurar ChatGPT como proveedor de imágenes](https://trello.com/c/UEPGbi2J)** — 0/7 · Valentina (Organico) · últ. 2026-07-03
- ⬜ Confirmar la cuenta de ChatGPT a usar (plan free) y quién la opera
- ⬜ Definir el flujo manual: prompt → generar en ChatGPT → descargar PNG → usar en carrusel/anuncio
- ⬜ Escribir el "recipe" de prompt con la marca (paleta #07070f + indigo #6366f1 + cyan #22d3ee, texto legible en pantalla) y guardarlo en el repo (ads-agent)
- ⬜ Generar 1 imagen de prueba (un creativo/placa) y validar calidad + texto legible antes de adoptarlo
- ⬜ Documentar en el repo que higgsfield/fal.ai quedan fuera para imágenes (actualizar donde se mencionen)
- ⬜ Dar de baja la suscripción de higgsfield (coordina con #48 / Contabilidad)
- ⬜ (Futuro, opcional) Evaluar la API de OpenAI Images (pago) para automatizar cuando haya volumen

**[#33 WhatsApp campaña periodistas — seguimiento (nombre + Template Insights)](https://trello.com/c/gijp5ldl)** — 0/2 · Mateo (Media Buyer) · últ. 2026-07-02
- ⬜ Jose: cambiar el "Nombre para mostrar" de WhatsApp de "Periodistas digitales 1" a "Periodistas Digitales" en WhatsApp Manager (pasa por revisión de Meta; el nombre viejo funciona mientras tanto). Cosmético, no urgente.
- ⬜ Desde ~04/07: verificar si Meta habilitó Template Insights (hoy da "not available") → el reporte diario debería mostrar leídos/entregados. Si a los días sigue sin habilitarse, montar webhook propio de estados (sent/delivered/read) en api/wa-webhook.js.

## ⏳ Esperando a Jose

- [#84](https://trello.com/c/7on7Y0rr) Activar plan ElevenLabs Creator 
- [#86](https://trello.com/c/3yBAOq9M) Cargar OPENAI_API_KEY + crédito (~$5) en OpenAI 
- [#89](https://trello.com/c/HhfWhrB9) Completar Business Verification en Meta Business Settings → Centro de seguridad (error 141010, business id 1313970406294022). Es el bloqueo principal.
- [#89](https://trello.com/c/HhfWhrB9) Reenviar/cambiar el nombre para mostrar del número (name_status=DECLINED) en WhatsApp Manager y esperar aprobación.

## 📋 Tarjetas sin checklist

_todas las tarjetas activas tienen checklist_
