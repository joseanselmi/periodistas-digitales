-- ════════════════════════════════════════════════════════════════════════════
-- VISTAS de `periodistas-marketing` (wxyimqkjlwfncvzozpjy)
-- Foto del 01/09/2026 · 20 vistas
--
-- ⚠️ ES UNA FOTO, NO LA FUENTE. Ver db/README.md. El texto viene de
-- pg_get_viewdef(), que NORMALIZA el SQL: no es igual al que se escribió a mano,
-- aunque signifique lo mismo.
--
-- Agrupadas por para qué sirven:
--   1. Quién es cada uno       v_personas · v_personas_origen · v_personas_panel
--                              v_compradores_email · v_comunicaciones
--   2. Email                   v_embudo_email · v_email_comunidad_envios
--                              v_email_comunidad_angulos · v_email_comunidad_audiencia
--   3. Campañas y embudo       v_campana_embudo · v_embudo_leads · v_funnel_diario
--                              v_gasto_meta
--   4. Landing                 v_landing_panel · v_clarity_semanal
--   5. Plata (P&L)             v_ingresos_mes · v_gastos_usd · v_gastos_mensajes_mes
--                              v_gastos_variables_mes · v_pnl_mensual
--
-- ⚠️ DEPENDENCIAS — el archivo ya está EN ORDEN, cada vista aparece después de las que usa:
-- v_pnl_mensual se apoya en v_ingresos_mes, v_gastos_variables_mes y v_gastos_usd;
-- v_gastos_variables_mes en v_gastos_mensajes_mes; v_comunicaciones y v_personas_panel en
-- v_personas; v_email_comunidad_angulos en v_email_comunidad_envios.
-- ════════════════════════════════════════════════════════════════════════════


-- ═══ 1. QUIÉN ES CADA UNO ═══════════════════════════════════════════════════

-- La lista única de personas. Una fila por email, con el tipo MÁS FUERTE que le
-- corresponde: comprador(1) gana a devuelto(2), a abandonó checkout(4) y a lead(5).
CREATE OR REPLACE VIEW public.v_personas AS
 WITH todas AS (
         SELECT lower(TRIM(BOTH FROM v.email)) AS email,
            NULLIF(TRIM(BOTH FROM v.telefono), ''::text) AS telefono,
            NULLIF(TRIM(BOTH FROM v.nombre), ''::text) AS nombre,
            'comprador'::text AS tipo,
            1 AS prioridad,
            v.ocurrido_en AS visto_en
           FROM ventas v
          WHERE v.email IS NOT NULL AND TRIM(BOTH FROM v.email) <> ''::text AND v.estado = 'vendida'::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM v.email)) AS lower,
            NULLIF(TRIM(BOTH FROM v.telefono), ''::text) AS "nullif",
            NULLIF(TRIM(BOTH FROM v.nombre), ''::text) AS "nullif",
            'devuelto'::text AS text,
            2,
            v.ocurrido_en
           FROM ventas v
          WHERE v.email IS NOT NULL AND TRIM(BOTH FROM v.email) <> ''::text AND v.estado <> 'vendida'::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM c.email)) AS lower,
            NULLIF(TRIM(BOTH FROM c.telefono), ''::text) AS "nullif",
            NULLIF(TRIM(BOTH FROM c.nombre), ''::text) AS "nullif",
            'comprador'::text AS text,
            3,
            c.primera_compra_en
           FROM customers c
          WHERE c.email IS NOT NULL AND TRIM(BOTH FROM c.email) <> ''::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM cp.email)) AS lower,
            NULLIF(TRIM(BOTH FROM cp.telefono), ''::text) AS "nullif",
            NULLIF(TRIM(BOTH FROM cp.nombre), ''::text) AS "nullif",
            'abandonó checkout'::text AS text,
            4,
            cp.ocurrido_en
           FROM clientes_potenciales cp
          WHERE cp.email IS NOT NULL AND TRIM(BOTH FROM cp.email) <> ''::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM l.email)) AS lower,
            NULLIF(TRIM(BOTH FROM l.telefono), ''::text) AS "nullif",
            NULLIF(TRIM(BOTH FROM l.nombre), ''::text) AS "nullif",
            'lead'::text AS text,
            5,
            l.ocurrido_en
           FROM leads l
          WHERE l.email IS NOT NULL AND TRIM(BOTH FROM l.email) <> ''::text
        )
 SELECT DISTINCT ON (email) email,
    telefono,
    nombre,
    tipo,
    visto_en AS primer_registro_en
   FROM todas
  ORDER BY email, prioridad, visto_en;


-- De dónde salió cada persona: la PRIMERA huella que dejó, prefiriendo la que tiene origen.
CREATE OR REPLACE VIEW public.v_personas_origen AS
 WITH rastros AS (
         SELECT lower(TRIM(BOTH FROM l.email)) AS email,
            COALESCE(NULLIF(TRIM(BOTH FROM l.funnel), ''::text), NULLIF(TRIM(BOTH FROM l.utm_campaign), ''::text)) AS origen,
            'se anotó a una guía'::text AS puerta,
            l.ocurrido_en AS cuando
           FROM leads l
          WHERE l.email IS NOT NULL AND TRIM(BOTH FROM l.email) <> ''::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM cp.email)) AS lower,
            NULLIF(TRIM(BOTH FROM cp.src), ''::text) AS "nullif",
            'intentó pagar y no pudo'::text AS text,
            cp.ocurrido_en
           FROM clientes_potenciales cp
          WHERE cp.email IS NOT NULL AND TRIM(BOTH FROM cp.email) <> ''::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM v.email)) AS lower,
            NULLIF(TRIM(BOTH FROM v.src), ''::text) AS "nullif",
            'compró'::text AS text,
            v.ocurrido_en
           FROM ventas v
          WHERE v.email IS NOT NULL AND TRIM(BOTH FROM v.email) <> ''::text
        UNION ALL
         SELECT lower(TRIM(BOTH FROM c.email)) AS lower,
            NULLIF(TRIM(BOTH FROM c.primer_src), ''::text) AS "nullif",
            'compró'::text AS text,
            c.primera_compra_en
           FROM customers c
          WHERE c.email IS NOT NULL AND TRIM(BOTH FROM c.email) <> ''::text
        )
 SELECT DISTINCT ON (email) email,
    origen,
    puerta,
    cuando AS primer_rastro_en
   FROM rastros
  ORDER BY email, (origen IS NULL), cuando;


-- v_personas + cuánto correo recibió y cuánto abrió. `nunca_abrio` es la señal
-- de que a esa persona le llega el mail y no lo mira: recibió y abrió CERO.
CREATE OR REPLACE VIEW public.v_personas_panel AS
 SELECT p.email,
    p.nombre,
    p.telefono,
    p.tipo,
    p.primer_registro_en,
    COALESCE(c.enviados, 0::bigint) AS enviados,
    COALESCE(c.abiertos, 0::bigint) AS abiertos,
    c.ultimo_envio,
    COALESCE(c.enviados, 0::bigint) > 0 AND COALESCE(c.abiertos, 0::bigint) = 0 AS nunca_abrio
   FROM v_personas p
     LEFT JOIN ( SELECT lower(TRIM(BOTH FROM comunicaciones_email.email)) AS email,
            count(*) AS enviados,
            count(*) FILTER (WHERE comunicaciones_email.abierto_en IS NOT NULL) AS abiertos,
            max(comunicaciones_email.enviado_en) AS ultimo_envio
           FROM comunicaciones_email
          WHERE comunicaciones_email.email IS NOT NULL AND TRIM(BOTH FROM comunicaciones_email.email) <> ''::text
          GROUP BY (lower(TRIM(BOTH FROM comunicaciones_email.email)))) c ON c.email = p.email;


-- Quién compró alguna vez, y si esa compra sigue viva (una venta se puede CAER).
CREATE OR REPLACE VIEW public.v_compradores_email AS
 SELECT email,
    min(primera_compra) AS primera_compra,
    bool_or(activa) AS tiene_compra_activa
   FROM ( SELECT lower(ventas.email) AS email,
            min(ventas.ocurrido_en) AS primera_compra,
            bool_or(COALESCE(ventas.estado, ''::text) <> ALL (ARRAY['devuelto'::text, 'contracargo'::text, 'cancelado'::text])) AS activa
           FROM ventas
          WHERE ventas.email IS NOT NULL AND ventas.email <> ''::text
          GROUP BY (lower(ventas.email))
        UNION ALL
         SELECT lower(customers.email) AS lower,
            min(customers.created_at) AS min,
            true
           FROM customers
          WHERE customers.email IS NOT NULL AND customers.email <> ''::text
          GROUP BY (lower(customers.email))) t
  GROUP BY email;


-- Todo lo que se habló con alguien, email y WhatsApp en la misma tabla, con el
-- resultado ya interpretado en castellano ("abrió", "rebotó", "entregado, sin leer").
-- El WhatsApp cruza por los ÚLTIMOS 8 DÍGITOS por el prefijo "9" argentino.
CREATE OR REPLACE VIEW public.v_comunicaciones AS
 SELECT ce.email,
    NULL::text AS telefono,
    'email'::text AS canal,
    'saliente'::text AS direccion,
    COALESCE(ce.campana, 'email'::text) AS campana,
    ce.asunto AS detalle,
    ce.enviado_en,
    ce.entregado_en IS NOT NULL AS entregado,
    ce.abierto_en IS NOT NULL AS abierto,
    ce.clic_en IS NOT NULL AS con_clic,
    ce.rebotado_en IS NOT NULL AS rebotado,
        CASE
            WHEN ce.rebotado_en IS NOT NULL THEN 'rebotó'::text
            WHEN ce.clic_en IS NOT NULL THEN 'hizo clic'::text
            WHEN ce.abierto_en IS NOT NULL THEN 'abrió'::text
            WHEN ce.entregado_en IS NOT NULL THEN 'entregado, sin abrir'::text
            ELSE 'enviado'::text
        END AS resultado
   FROM comunicaciones_email ce
UNION ALL
 SELECT p.email,
    w.telefono,
    'whatsapp'::text AS canal,
        CASE
            WHEN w.direccion = 'in'::text THEN 'entrante'::text
            ELSE 'saliente'::text
        END AS direccion,
    COALESCE(w.origen, 'whatsapp'::text) AS campana,
    "left"(COALESCE(w.texto, w.tipo, ''::text), 160) AS detalle,
    w.creado_en AS enviado_en,
    w.estado_entrega = ANY (ARRAY['entregado'::text, 'leido'::text]) AS entregado,
    w.leido_en IS NOT NULL AS abierto,
    false AS con_clic,
    w.estado_entrega = 'fallido'::text AS rebotado,
        CASE
            WHEN w.direccion = 'in'::text THEN 'respondió'::text
            WHEN w.estado_entrega = 'fallido'::text THEN 'no se entregó'::text
            WHEN w.leido_en IS NOT NULL THEN 'leyó'::text
            WHEN w.estado_entrega = 'entregado'::text THEN 'entregado, sin leer'::text
            ELSE 'enviado'::text
        END AS resultado
   FROM conversaciones_wa w
     LEFT JOIN v_personas p ON regexp_replace(COALESCE(p.telefono, ''::text), '\D'::text, ''::text, 'g'::text) <> ''::text AND "right"(regexp_replace(COALESCE(p.telefono, ''::text), '\D'::text, ''::text, 'g'::text), 8) = "right"(regexp_replace(w.telefono, '\D'::text, ''::text, 'g'::text), 8);


-- ═══ 2. EMAIL ═══════════════════════════════════════════════════════════════

-- Una fila por campaña de email: enviados, entregados, abiertos, clics, rebotes, spam.
CREATE OR REPLACE VIEW public.v_embudo_email AS
 SELECT campana AS brevo_tag,
    count(*) AS enviados,
    count(entregado_en) AS entregados,
    count(abierto_en) AS abiertos,
    count(clic_en) AS clics,
    count(rebotado_en) AS rebotes,
    count(spam_en) AS spam,
    min(enviado_en) AS primer_envio,
    max(enviado_en) AS ultimo_envio,
    max(actualizado_en) AS sincronizado_en
   FROM comunicaciones_email
  WHERE campana IS NOT NULL
  GROUP BY campana;


-- El canal Comunidad de punta a punta: del mail hasta la venta, envío por envío.
CREATE OR REPLACE VIEW public.v_email_comunidad_envios AS
 WITH paso AS (
         SELECT s.orden,
            s.brevo_tag,
            s.contenido_asunto,
            s.angulo,
            s.tono,
            s.destino,
            s.brevo_camp_id,
            "substring"(s.url, 'src=([^&]+)'::text) AS src
           FROM funnel_steps s
             JOIN funnels f ON f.id = s.funnel_id AND f.slug = 'email-comunidad'::text
          WHERE s.tipo = 'email'::text
        ), correo AS (
         SELECT comunicaciones_email.campana,
            count(*) AS enviados,
            count(comunicaciones_email.entregado_en) AS entregados,
            count(comunicaciones_email.abierto_en) AS aperturas,
            count(comunicaciones_email.clic_en) AS clics,
            count(comunicaciones_email.rebotado_en) AS rebotes,
            count(comunicaciones_email.spam_en) AS spam,
            min(comunicaciones_email.enviado_en)::date AS fecha
           FROM comunicaciones_email
          GROUP BY comunicaciones_email.campana
        ), web AS (
         SELECT events.src,
            count(DISTINCT events.session_id) FILTER (WHERE events.tipo_evento = 'pageview'::text) AS llegadas,
            count(DISTINCT events.session_id) FILTER (WHERE events.tipo_evento = 'click_checkout'::text) AS checkouts
           FROM events
          WHERE events.src IS NOT NULL
          GROUP BY events.src
        ), compras AS (
         SELECT ventas.src,
            count(*) AS ventas,
            sum(COALESCE(ventas.comision_usd, 0::numeric)) AS neto_usd
           FROM ventas
          WHERE ventas.src IS NOT NULL
          GROUP BY ventas.src
        )
 SELECT p.orden AS envio,
    p.brevo_tag AS campana,
    p.src,
    c.fecha,
    p.contenido_asunto AS asunto,
    p.angulo,
    p.tono,
    p.destino,
    p.brevo_camp_id,
    COALESCE(c.enviados, 0::bigint) AS enviados,
    COALESCE(c.entregados, 0::bigint) AS entregados,
    COALESCE(c.aperturas, 0::bigint) AS aperturas,
    COALESCE(c.clics, 0::bigint) AS clics,
    COALESCE(w.llegadas, 0::bigint) AS llegadas_a_la_pagina,
    COALESCE(w.checkouts, 0::bigint) AS checkouts_iniciados,
    COALESCE(v.ventas, 0::bigint) AS ventas,
    COALESCE(v.neto_usd, 0::numeric) AS neto_usd,
    COALESCE(c.rebotes, 0::bigint) AS rebotes,
    COALESCE(c.spam, 0::bigint) AS spam,
    round(100.0 * c.aperturas::numeric / NULLIF(c.entregados, 0)::numeric, 1) AS pct_apertura,
    round(100.0 * c.clics::numeric / NULLIF(c.aperturas, 0)::numeric, 1) AS pct_clic_sobre_apertura,
    round(100.0 * w.llegadas::numeric / NULLIF(c.clics, 0)::numeric, 1) AS pct_llegada_sobre_clic,
    round(100.0 * w.checkouts::numeric / NULLIF(w.llegadas, 0)::numeric, 1) AS pct_checkout_sobre_llegada
   FROM paso p
     LEFT JOIN correo c ON c.campana = p.brevo_tag
     LEFT JOIN web w ON w.src = p.src
     LEFT JOIN compras v ON v.src = p.src;


-- Qué ángulo funciona mejor. El clic se mide SOBRE LAS APERTURAS, no sobre los entregados.
-- La columna `confianza` avisa sola cuando la muestra es chica: con menos de 3 envíos no
-- se concluye nada — un tope que no avisa es un tope que engaña.
CREATE OR REPLACE VIEW public.v_email_comunidad_angulos AS
 SELECT COALESCE(angulo, '(sin ángulo)'::text) AS angulo,
    count(*) AS envios,
    sum(entregados) AS entregados,
    sum(aperturas) AS aperturas,
    sum(clics) AS clics,
    sum(llegadas_a_la_pagina) AS llegadas,
    sum(checkouts_iniciados) AS checkouts,
    sum(ventas) AS ventas,
    sum(neto_usd) AS neto_usd,
    round(100.0 * sum(aperturas) / NULLIF(sum(entregados), 0::numeric), 1) AS pct_apertura,
    round(100.0 * sum(clics) / NULLIF(sum(aperturas), 0::numeric), 1) AS pct_clic_sobre_apertura,
        CASE
            WHEN count(*) < 3 THEN ('⚠️ muestra chica: '::text || count(*)) || ' envío(s), no concluir'::text
            ELSE 'comparable'::text
        END AS confianza
   FROM v_email_comunidad_envios
  GROUP BY (COALESCE(angulo, '(sin ángulo)'::text));


-- A QUIÉN se le manda el semanal. Audiencia DINÁMICA: la vista decide, no una lista congelada.
--   excluido → ya compró · marcó spam · rebota siempre
--   activo   → abrió o clicó algo en los últimos 60 días
--   nuevo    → lead de menos de 30 días que todavía no tuvo su chance
--   dormido  → el resto
CREATE OR REPLACE VIEW public.v_email_comunidad_audiencia AS
 WITH base AS (
         SELECT lower(leads.email) AS email,
            max(leads.nombre) AS nombre,
            min(leads.created_at) AS primer_lead_en
           FROM leads
          WHERE leads.email IS NOT NULL AND leads.email <> ''::text AND leads.email ~~ '%@%'::text
          GROUP BY (lower(leads.email))
        ), compradores AS (
         SELECT lower(ventas.email) AS email
           FROM ventas
          WHERE ventas.email IS NOT NULL
        UNION
         SELECT lower(customers.email) AS email
           FROM customers
          WHERE customers.email IS NOT NULL
        ), ev AS (
         SELECT lower(comunicaciones_email.email) AS email,
            count(*) AS mails_recibidos,
            count(comunicaciones_email.entregado_en) AS entregados,
            count(comunicaciones_email.rebotado_en) AS rebotes,
            count(comunicaciones_email.spam_en) AS marcas_spam,
            max(GREATEST(COALESCE(comunicaciones_email.abierto_en, '-infinity'::timestamp with time zone), COALESCE(comunicaciones_email.clic_en, '-infinity'::timestamp with time zone))) AS ultimo_interes_en,
            count(*) FILTER (WHERE comunicaciones_email.abierto_en >= (now() - '60 days'::interval)) AS aperturas_60d,
            count(*) FILTER (WHERE comunicaciones_email.clic_en >= (now() - '60 days'::interval)) AS clics_60d
           FROM comunicaciones_email
          GROUP BY (lower(comunicaciones_email.email))
        ), com AS (
         SELECT lower(comunicaciones_email.email) AS email,
            count(*) AS recibidos,
            count(*) FILTER (WHERE comunicaciones_email.abierto_en IS NOT NULL OR comunicaciones_email.clic_en IS NOT NULL) AS abiertos
           FROM comunicaciones_email
          WHERE comunicaciones_email.campana ~~ 'comunidad-%'::text
          GROUP BY (lower(comunicaciones_email.email))
        )
 SELECT b.email,
    b.nombre,
    b.primer_lead_en,
    NULLIF(e.ultimo_interes_en, '-infinity'::timestamp with time zone) AS ultimo_interes_en,
    COALESCE(e.aperturas_60d, 0::bigint) AS aperturas_60d,
    COALESCE(e.clics_60d, 0::bigint) AS clics_60d,
    COALESCE(e.mails_recibidos, 0::bigint) AS mails_recibidos,
    COALESCE(c.recibidos, 0::bigint) AS comunidad_recibidos,
    COALESCE(c.abiertos, 0::bigint) AS comunidad_abiertos,
        CASE
            WHEN cp.email IS NOT NULL THEN 'excluido'::text
            WHEN COALESCE(e.marcas_spam, 0::bigint) > 0 THEN 'excluido'::text
            WHEN COALESCE(e.rebotes, 0::bigint) >= 2 AND COALESCE(e.entregados, 0::bigint) = 0 THEN 'excluido'::text
            WHEN (COALESCE(e.aperturas_60d, 0::bigint) + COALESCE(e.clics_60d, 0::bigint)) > 0 THEN 'activo'::text
            WHEN COALESCE(c.recibidos, 0::bigint) >= 3 THEN 'dormido'::text
            WHEN b.primer_lead_en >= (now() - '30 days'::interval) AND COALESCE(e.mails_recibidos, 0::bigint) < 3 THEN 'nuevo'::text
            ELSE 'dormido'::text
        END AS estado,
        CASE
            WHEN cp.email IS NOT NULL THEN 'ya compró'::text
            WHEN COALESCE(e.marcas_spam, 0::bigint) > 0 THEN 'marcó spam'::text
            WHEN COALESCE(e.rebotes, 0::bigint) >= 2 AND COALESCE(e.entregados, 0::bigint) = 0 THEN 'nunca entregó (rebota)'::text
            WHEN COALESCE(e.clics_60d, 0::bigint) > 0 THEN 'clic en 60 días'::text
            WHEN COALESCE(e.aperturas_60d, 0::bigint) > 0 THEN 'apertura en 60 días'::text
            WHEN COALESCE(c.recibidos, 0::bigint) >= 3 THEN '3 de comunidad sin abrir'::text
            WHEN b.primer_lead_en >= (now() - '30 days'::interval) AND COALESCE(e.mails_recibidos, 0::bigint) < 3 THEN 'lead nuevo, todavía sin chance'::text
            WHEN COALESCE(e.mails_recibidos, 0::bigint) >= 3 THEN 'recibió 3+ y no abrió ninguno'::text
            ELSE 'sin señal en 60 días'::text
        END AS motivo
   FROM base b
     LEFT JOIN ev e ON e.email = b.email
     LEFT JOIN com c ON c.email = b.email
     LEFT JOIN compradores cp ON cp.email = b.email;


-- ═══ 3. CAMPAÑAS Y EMBUDO ═══════════════════════════════════════════════════

-- EL EMBUDO DE PUNTA A PUNTA, por campaña y por pieza: gasto → mails → visitas → ventas.
-- Todo se une por el `src` NORMALIZADO (f_src_estandar), que es lo que permite que una
-- pieza con tres nombres distintos según la tabla cuente como una sola.
-- ⚠️ El porqué está en docs/atribucion-vistas.sql y el estándar en NOMENCLATURA-SRC.md.
CREATE OR REPLACE VIEW public.v_campana_embudo AS
 WITH envios AS (
         SELECT f_campana_email_a_src(comunicaciones_email.campana) AS src,
            count(*) AS mails_enviados,
            count(comunicaciones_email.entregado_en) AS mails_entregados,
            count(comunicaciones_email.abierto_en) AS mails_abiertos,
            count(comunicaciones_email.clic_en) AS mails_clic
           FROM comunicaciones_email
          WHERE f_campana_email_a_src(comunicaciones_email.campana) IS NOT NULL
          GROUP BY (f_campana_email_a_src(comunicaciones_email.campana))
        ), anuncios AS (
         SELECT f_src_estandar(meta_insights_diario.src) AS src,
            sum(meta_insights_diario.impresiones)::bigint AS impresiones,
            sum(meta_insights_diario.link_clicks)::bigint AS clics_anuncio,
            round(sum(meta_insights_diario.spend_usd), 2) AS gasto_usd
           FROM meta_insights_diario
          GROUP BY (f_src_estandar(meta_insights_diario.src))
        ), visitas AS (
         SELECT f_src_estandar(events.src) AS src,
            count(*) FILTER (WHERE events.tipo_evento = 'pageview'::text) AS visitas,
            count(*) FILTER (WHERE events.tipo_evento = 'pdf_open'::text) AS guias_abiertas,
            count(*) FILTER (WHERE events.tipo_evento = 'click_checkout'::text) AS clic_checkout
           FROM events
          WHERE events.src IS NOT NULL AND btrim(events.src) <> ''::text
          GROUP BY (f_src_estandar(events.src))
        ), compras AS (
         SELECT f_src_estandar(ventas.src) AS src,
            count(*) FILTER (WHERE ventas.estado IS NULL OR (ventas.estado <> ALL (ARRAY['devuelta'::text, 'contracargo'::text]))) AS ventas,
            count(*) FILTER (WHERE ventas.estado = ANY (ARRAY['devuelta'::text, 'contracargo'::text])) AS ventas_caidas,
            round(sum(ventas.comision_usd) FILTER (WHERE ventas.estado IS NULL OR (ventas.estado <> ALL (ARRAY['devuelta'::text, 'contracargo'::text]))), 2) AS neto_usd
           FROM ventas
          WHERE ventas.src IS NOT NULL AND btrim(ventas.src) <> ''::text
          GROUP BY (f_src_estandar(ventas.src))
        ), piezas AS (
         SELECT envios.src
           FROM envios
        UNION
         SELECT anuncios.src
           FROM anuncios
        UNION
         SELECT visitas.src
           FROM visitas
        UNION
         SELECT compras.src
           FROM compras
        )
 SELECT f_src_campana(p.src) AS campana,
    split_part(p.src, '-'::text, 1) AS canal,
    p.src AS pieza,
    COALESCE(a.impresiones, 0::bigint) AS impresiones,
    COALESCE(a.clics_anuncio, 0::bigint) AS clics_anuncio,
    COALESCE(a.gasto_usd, 0::numeric) AS gasto_usd,
    COALESCE(e.mails_enviados, 0::bigint) AS mails_enviados,
    COALESCE(e.mails_entregados, 0::bigint) AS mails_entregados,
    COALESCE(e.mails_abiertos, 0::bigint) AS mails_abiertos,
    COALESCE(e.mails_clic, 0::bigint) AS mails_clic,
    COALESCE(v.visitas, 0::bigint) AS visitas,
    COALESCE(v.guias_abiertas, 0::bigint) AS guias_abiertas,
    COALESCE(v.clic_checkout, 0::bigint) AS clic_checkout,
    COALESCE(c.ventas, 0::bigint) AS ventas,
    COALESCE(c.ventas_caidas, 0::bigint) AS ventas_caidas,
    COALESCE(c.neto_usd, 0::numeric) AS neto_usd
   FROM piezas p
     LEFT JOIN envios e ON e.src = p.src
     LEFT JOIN anuncios a ON a.src = p.src
     LEFT JOIN visitas v ON v.src = p.src
     LEFT JOIN compras c ON c.src = p.src
  WHERE p.src IS NOT NULL;


-- Cuántos leads entró cada embudo, y cuántos de ellos son periodistas.
CREATE OR REPLACE VIEW public.v_embudo_leads AS
 SELECT funnel AS funnel_slug,
    count(*) AS leads,
    count(*) FILTER (WHERE es_periodista) AS periodistas,
    min(COALESCE(ocurrido_en, created_at)) AS primer_lead,
    max(COALESCE(ocurrido_en, created_at)) AS ultimo_lead
   FROM leads
  WHERE funnel IS NOT NULL
  GROUP BY funnel;


-- Día por día y src por src: visitas, clics al checkout y ventas.
-- FULL JOIN a propósito: un día con ventas y sin eventos (o al revés) tiene que aparecer igual.
CREATE OR REPLACE VIEW public.v_funnel_diario AS
 WITH ev AS (
         SELECT events.ocurrido_en::date AS dia,
            COALESCE(events.src, 'sin'::text) AS src,
            count(*) FILTER (WHERE events.tipo_evento = 'pageview'::text) AS visitas,
            count(*) FILTER (WHERE events.tipo_evento = 'click_checkout'::text) AS clics_compra
           FROM events
          WHERE events.tipo_evento = ANY (ARRAY['pageview'::text, 'click_checkout'::text])
          GROUP BY (events.ocurrido_en::date), (COALESCE(events.src, 'sin'::text))
        ), ve AS (
         SELECT ventas.ocurrido_en::date AS dia,
            COALESCE(ventas.src, 'sin'::text) AS src,
            count(*) FILTER (WHERE ventas.producto ~~* '%sistema%'::text OR ventas.producto ~~* '%ingreso%'::text) AS ventas_curso,
            count(*) AS ventas_total,
            round(COALESCE(sum(ventas.valor_usd), 0::numeric), 2) AS usd
           FROM ventas
          GROUP BY (ventas.ocurrido_en::date), (COALESCE(ventas.src, 'sin'::text))
        )
 SELECT COALESCE(ev.dia, ve.dia) AS dia,
    COALESCE(ev.src, ve.src) AS src,
    COALESCE(ev.visitas, 0::bigint) AS visitas,
    COALESCE(ev.clics_compra, 0::bigint) AS clics_compra,
    COALESCE(ve.ventas_curso, 0::bigint) AS ventas_curso,
    COALESCE(ve.ventas_total, 0::bigint) AS ventas_total,
    COALESCE(ve.usd, 0::numeric) AS usd,
        CASE
            WHEN COALESCE(ev.clics_compra, 0::bigint) > 0 THEN round(100.0 * COALESCE(ve.ventas_curso, 0::bigint)::numeric / ev.clics_compra::numeric, 1)
            ELSE NULL::numeric
        END AS conv_click_a_venta_pct
   FROM ev
     FULL JOIN ve ON ev.dia = ve.dia AND ev.src = ve.src
  ORDER BY (COALESCE(ev.dia, ve.dia)) DESC, (COALESCE(ev.src, ve.src));


-- Gasto de Meta por campaña, con el embudo al que pertenece.
-- `ultimo_dia_con_gasto` sólo cuenta días con gasto > 0: es lo que distingue
-- "la campaña está apagada" de "todavía no llegó el dato" (Meta viene 1 día atrasado).
CREATE OR REPLACE VIEW public.v_gasto_meta AS
 SELECT g.meta_campana_id,
    max(g.meta_campana) AS meta_campana,
    max(g.estado) AS estado,
    f.slug AS funnel_slug,
    round(sum(g.spend_usd), 2) AS gasto_total,
    round(sum(g.spend_usd) FILTER (WHERE g.fecha >= (CURRENT_DATE - 7)), 2) AS gasto_7d,
    round(sum(g.spend_usd) FILTER (WHERE g.fecha >= (CURRENT_DATE - 30)), 2) AS gasto_30d,
    sum(g.link_clicks) AS link_clicks,
    max(g.fecha) FILTER (WHERE g.spend_usd > 0::numeric) AS ultimo_dia_con_gasto
   FROM meta_gasto_diario g
     LEFT JOIN funnels f ON f.meta_campana_id = g.meta_campana_id
  GROUP BY g.meta_campana_id, f.slug;


-- ═══ 4. LANDING ═════════════════════════════════════════════════════════════

-- EL CÁLCULO DEL PANEL /admin/landings VIVE ACÁ, no en la pantalla. Una versión por fila,
-- con todo lo que se necesita para darle veredicto: tasas, gasto, ROAS neto, y el
-- comportamiento que trae Clarity (scroll, tiempo activo, dead clicks, errores de JS).
-- `webview_pct` es la porción de tráfico que entra por el navegador de Instagram/Facebook.
-- ⚠️ El punto de equilibrio es ROAS 1,22 — un ROAS de 1,07 sigue siendo pérdida.
CREATE OR REPLACE VIEW public.v_landing_panel AS
 WITH v AS (
         SELECT landing_versiones.version,
            landing_versiones.nombre,
            landing_versiones.vigente_desde,
            COALESCE(landing_versiones.vigente_hasta, now()) AS hasta,
            landing_versiones.activa,
            landing_versiones.cambios,
            landing_versiones.veredicto,
            GREATEST(EXTRACT(epoch FROM COALESCE(landing_versiones.vigente_hasta, now()) - landing_versiones.vigente_desde) / 86400.0, 0.5) AS dias
           FROM landing_versiones
        ), ev AS (
         SELECT v_1.version,
            count(DISTINCT e.session_id) FILTER (WHERE e.tipo_evento = 'pageview'::text) AS sesiones,
            count(*) FILTER (WHERE e.tipo_evento = 'click_checkout'::text) AS clics_checkout
           FROM v v_1
             LEFT JOIN events e ON e.ocurrido_en >= v_1.vigente_desde AND e.ocurrido_en < v_1.hasta AND split_part(split_part(COALESCE(e.url, ''::text), '?'::text, 1), '#'::text, 1) = 'https://sistemadeingresosdiariosia.com/'::text
          GROUP BY v_1.version
        ), gasto AS (
         SELECT v_1.version,
            COALESCE(sum(g.spend_usd), 0::numeric) AS gasto_usd
           FROM v v_1
             LEFT JOIN meta_gasto_diario g ON g.fecha >= v_1.vigente_desde::date AND g.fecha < v_1.hasta::date AND g.meta_campana ~~* '%VENTAS%'::text
          GROUP BY v_1.version
        ), vta AS (
         SELECT v_1.version,
            count(*) FILTER (WHERE s.producto = 'Sistema de ingresos diarios para periodistas'::text) AS compras,
            count(*) FILTER (WHERE s.producto <> 'Sistema de ingresos diarios para periodistas'::text) AS bumps,
            COALESCE(sum(s.comision_usd), 0::numeric) AS neto_usd
           FROM v v_1
             LEFT JOIN ventas s ON s.ocurrido_en >= v_1.vigente_desde AND s.ocurrido_en < v_1.hasta AND lower(s.email) <> 'joseanselmi27@gmail.com'::text AND (s.producto = ANY (ARRAY['Sistema de ingresos diarios para periodistas'::text, 'Hashtags imanes - El truco para ser viral'::text, 'Guía - Consigue tus primeros 1.000 lectores en 30 días'::text]))
          GROUP BY v_1.version
        ), comp AS (
         SELECT v_1.version,
            count(c.fecha) AS dias_con_dato,
            sum(c.scroll_promedio * c.sesiones::numeric) / NULLIF(sum(c.sesiones), 0)::numeric AS scroll_promedio,
            sum(c.tiempo_activo_seg * c.sesiones::numeric) / NULLIF(sum(c.sesiones), 0)::numeric AS tiempo_activo_seg,
            sum(c.dead_clicks_pct * c.sesiones::numeric) / NULLIF(sum(c.sesiones), 0)::numeric AS dead_clicks_pct,
            sum(c.js_errors_pct * c.sesiones::numeric) / NULLIF(sum(c.sesiones), 0)::numeric AS js_errors_pct
           FROM v v_1
             LEFT JOIN clarity_diario c ON c.dimension = 'total'::text AND c.fecha >= v_1.vigente_desde::date AND c.fecha < v_1.hasta::date
          GROUP BY v_1.version
        ), web AS (
         SELECT v_1.version,
            COALESCE(sum(c.sesiones) FILTER (WHERE c.valor ~* '(instagram|facebook)'::text), 0::bigint) AS webview_sesiones,
            COALESCE(sum(c.sesiones), 0::bigint) AS sesiones_con_navegador
           FROM v v_1
             LEFT JOIN clarity_diario c ON c.dimension = 'Browser'::text AND c.fecha >= v_1.vigente_desde::date AND c.fecha < v_1.hasta::date
          GROUP BY v_1.version
        )
 SELECT v.version,
    v.nombre,
    v.activa,
    v.cambios,
    v.veredicto,
    v.vigente_desde,
    v.hasta,
    round(v.dias, 1) AS dias,
    ev.sesiones,
    ev.clics_checkout,
    round(100.0 * ev.clics_checkout::numeric / NULLIF(ev.sesiones, 0)::numeric, 2) AS tasa_checkout_pct,
    round(100.0 * vta.compras::numeric / NULLIF(ev.clics_checkout, 0)::numeric, 2) AS compra_por_clic_pct,
    round(100.0 * vta.compras::numeric / NULLIF(ev.sesiones, 0)::numeric, 2) AS conversion_pct,
    round(100.0 * vta.bumps::numeric / NULLIF(vta.compras, 0)::numeric, 2) AS attach_bumps_pct,
    round(100.0 * web.webview_sesiones::numeric / NULLIF(web.sesiones_con_navegador, 0)::numeric, 2) AS webview_pct,
    web.webview_sesiones,
    web.sesiones_con_navegador,
    round(gasto.gasto_usd, 2) AS gasto_usd,
    round(gasto.gasto_usd / v.dias, 2) AS gasto_por_dia,
    vta.compras,
    vta.bumps,
    round(vta.neto_usd, 2) AS neto_usd,
    round(vta.compras::numeric / v.dias, 2) AS compras_por_dia,
    round(vta.neto_usd / v.dias, 2) AS neto_por_dia,
    round(vta.neto_usd / NULLIF(vta.compras, 0)::numeric, 2) AS neto_por_comprador,
    round(vta.neto_usd / NULLIF(gasto.gasto_usd, 0::numeric), 2) AS roas_neto,
    round(comp.scroll_promedio, 2) AS scroll_promedio,
    round(comp.tiempo_activo_seg, 0) AS tiempo_activo_seg,
    round(comp.dead_clicks_pct, 2) AS dead_clicks_pct,
    round(comp.js_errors_pct, 2) AS js_errors_pct,
    comp.dias_con_dato AS dias_con_comportamiento
   FROM v
     LEFT JOIN ev ON ev.version = v.version
     LEFT JOIN gasto ON gasto.version = v.version
     LEFT JOIN vta ON vta.version = v.version
     LEFT JOIN comp ON comp.version = v.version
     LEFT JOIN web ON web.version = v.version
  ORDER BY v.vigente_desde;


-- Clarity por semana. Los promedios van PONDERADOS POR SESIONES: un día con 3 visitas
-- no puede pesar lo mismo que uno con 300.
CREATE OR REPLACE VIEW public.v_clarity_semanal AS
 SELECT date_trunc('week'::text, fecha::timestamp with time zone)::date AS semana,
    count(*) AS dias,
    sum(sesiones) AS sesiones,
    round(sum(scroll_promedio * sesiones::numeric) / NULLIF(sum(sesiones), 0)::numeric, 2) AS scroll_promedio,
    round(sum(tiempo_activo_seg * sesiones::numeric) / NULLIF(sum(sesiones), 0)::numeric, 0) AS tiempo_activo_seg,
    round(sum(dead_clicks_pct * sesiones::numeric) / NULLIF(sum(sesiones), 0)::numeric, 2) AS dead_clicks_pct,
    round(sum(js_errors_pct * sesiones::numeric) / NULLIF(sum(sesiones), 0)::numeric, 2) AS js_errors_pct
   FROM clarity_diario c
  WHERE dimension = 'total'::text
  GROUP BY (date_trunc('week'::text, fecha::timestamp with time zone)::date)
  ORDER BY (date_trunc('week'::text, fecha::timestamp with time zone)::date) DESC;


-- ═══ 5. PLATA (P&L) ═════════════════════════════════════════════════════════

-- Ingresos por mes. `ingresos_netos_usd` es la COMISIÓN: lo que le queda a Jose,
-- que es la métrica principal. Sólo cuenta las ventas en estado 'vendida' — una
-- devuelta o un contracargo no son ingreso.
CREATE OR REPLACE VIEW public.v_ingresos_mes AS
 SELECT date_trunc('month'::text, ocurrido_en)::date AS mes,
    count(*) AS ventas,
    round(sum(COALESCE(valor_usd, 0::numeric)), 2) AS ingresos_brutos_usd,
    round(sum(COALESCE(comision_usd, 0::numeric)), 2) AS ingresos_netos_usd
   FROM ventas
  WHERE estado = 'vendida'::text
  GROUP BY (date_trunc('month'::text, ocurrido_en)::date);


-- Los gastos cargados a mano, pasados a USD con el tipo de cambio del mes.
-- `tipo_cambio_ok` en false = el monto está SIN convertir. Que se vea, en vez de
-- mostrar un número que parece dólares y no lo es.
CREATE OR REPLACE VIEW public.v_gastos_usd AS
 SELECT g.id,
    g.servicio,
    g.categoria,
    g.tipo,
    g.fuente,
    g.monto,
    g.moneda,
    g.mes,
    g.recurrente,
    g.notas,
    g.created_at,
    g.updated_at,
        CASE
            WHEN g.moneda = 'USD'::text THEN g.monto
            WHEN tc.tasa_usd IS NOT NULL THEN round(g.monto * tc.tasa_usd, 2)
            ELSE g.monto
        END AS monto_usd,
    g.moneda = 'USD'::text OR tc.tasa_usd IS NOT NULL AS tipo_cambio_ok,
    tc.tasa_usd,
    tc.mes AS tasa_mes
   FROM gastos g
     LEFT JOIN LATERAL ( SELECT t.tasa_usd,
            t.mes
           FROM tipo_cambio t
          WHERE t.moneda = g.moneda AND t.mes <= g.mes
          ORDER BY t.mes DESC
         LIMIT 1) tc ON true;


-- Lo que cuestan los mensajes de WhatsApp. Meta cobra por CONVERSACIÓN, no por mensaje:
-- de ahí el DISTINCT ON (conversacion_key), que se queda con el primero de cada una.
CREATE OR REPLACE VIEW public.v_gastos_mensajes_mes AS
 WITH conversaciones AS (
         SELECT DISTINCT ON (mensajes.conversacion_key) mensajes.conversacion_key,
            date_trunc('month'::text, mensajes.ocurrido_en)::date AS mes,
            mensajes.automatizacion,
            mensajes.categoria_meta,
            mensajes.costo_estimado_usd
           FROM mensajes
          WHERE mensajes.conversacion_key IS NOT NULL AND mensajes.ok
          ORDER BY mensajes.conversacion_key, mensajes.ocurrido_en
        )
 SELECT mes,
    automatizacion,
    count(*) AS conversaciones,
    round(sum(costo_estimado_usd), 2) AS monto
   FROM conversaciones
  GROUP BY mes, automatizacion
  ORDER BY mes DESC, (round(sum(costo_estimado_usd), 2)) DESC;


-- Los gastos que se calculan SOLOS a partir de lo que pasó: la comisión de Hotmart
-- (bruto menos neto), el gasto de Meta y los mensajes de WhatsApp.
CREATE OR REPLACE VIEW public.v_gastos_variables_mes AS
 SELECT date_trunc('month'::text, ventas.ocurrido_en)::date AS mes,
    'Comisión Hotmart'::text AS servicio,
    'Herramientas'::text AS categoria,
    'auto:hotmart'::text AS fuente,
    round(sum(COALESCE(ventas.valor_usd, 0::numeric) - COALESCE(ventas.comision_usd, 0::numeric)), 2) AS monto
   FROM ventas
  WHERE ventas.estado = 'vendida'::text
  GROUP BY (date_trunc('month'::text, ventas.ocurrido_en)::date)
 HAVING sum(COALESCE(ventas.valor_usd, 0::numeric) - COALESCE(ventas.comision_usd, 0::numeric)) <> 0::numeric
UNION ALL
 SELECT g.mes,
    'Meta Ads'::text AS servicio,
    'Publicidad'::text AS categoria,
    'auto:meta'::text AS fuente,
    round(g.spend_usd, 2) AS monto
   FROM gastos_meta_mensual g
  WHERE g.spend_usd > 0::numeric
UNION ALL
 SELECT v_gastos_mensajes_mes.mes,
    'Mensajes · '::text || v_gastos_mensajes_mes.automatizacion AS servicio,
    'Herramientas'::text AS categoria,
    'auto:whatsapp'::text AS fuente,
    v_gastos_mensajes_mes.monto
   FROM v_gastos_mensajes_mes
  WHERE v_gastos_mensajes_mes.monto > 0::numeric;


-- EL P&L EN CASCADA, mes por mes.
-- Lo que lo hace distinto de una suma: `gastos_fijos_pendientes_usd` estima los fijos
-- que TODAVÍA NO SE CARGARON este mes, mirando qué recurrentes existieron antes y no
-- tienen fila todavía. Sin eso, un mes en curso parece mucho más rentable de lo que es
-- sólo porque nadie cargó las facturas. ⚠️ Un fijo en $0 no es gratis: es que nadie lo cargó.
CREATE OR REPLACE VIEW public.v_pnl_mensual AS
 WITH meses AS (
         SELECT v_ingresos_mes.mes
           FROM v_ingresos_mes
        UNION
         SELECT v_gastos_variables_mes.mes
           FROM v_gastos_variables_mes
        UNION
         SELECT DISTINCT gastos.mes
           FROM gastos
        ), ing AS (
         SELECT v_ingresos_mes.mes,
            v_ingresos_mes.ventas,
            v_ingresos_mes.ingresos_brutos_usd
           FROM v_ingresos_mes
        ), gv AS (
         SELECT v_gastos_variables_mes.mes,
            sum(v_gastos_variables_mes.monto) AS gastos_variables_usd
           FROM v_gastos_variables_mes
          GROUP BY v_gastos_variables_mes.mes
        ), gf AS (
         SELECT v_gastos_usd.mes,
            sum(v_gastos_usd.monto_usd) AS gastos_fijos_usd,
            count(*) FILTER (WHERE NOT v_gastos_usd.tipo_cambio_ok) AS gastos_sin_tipo_cambio
           FROM v_gastos_usd
          WHERE v_gastos_usd.tipo = 'fijo'::text
          GROUP BY v_gastos_usd.mes
        ), gvm AS (
         SELECT v_gastos_usd.mes,
            sum(v_gastos_usd.monto_usd) AS gastos_variables_manuales_usd
           FROM v_gastos_usd
          WHERE v_gastos_usd.tipo = 'variable'::text
          GROUP BY v_gastos_usd.mes
        ), pend AS (
         SELECT m_1.mes,
            sum(u.monto_usd) AS gastos_fijos_pendientes_usd,
            string_agg(u.servicio, ', '::text ORDER BY u.servicio) AS fijos_pendientes
           FROM meses m_1
             CROSS JOIN LATERAL ( SELECT DISTINCT ON (u2.servicio) u2.servicio,
                    u2.monto_usd
                   FROM v_gastos_usd u2
                  WHERE u2.tipo = 'fijo'::text AND u2.recurrente AND u2.mes < m_1.mes AND u2.monto_usd > 0::numeric AND NOT (EXISTS ( SELECT 1
                           FROM gastos g2
                          WHERE g2.servicio = u2.servicio AND g2.mes = m_1.mes))
                  ORDER BY u2.servicio, u2.mes DESC) u
          GROUP BY m_1.mes
        )
 SELECT m.mes,
    COALESCE(i.ventas, 0::bigint) AS ventas,
    COALESCE(i.ingresos_brutos_usd, 0::numeric) AS ingresos_brutos_usd,
    round(COALESCE(gv.gastos_variables_usd, 0::numeric) + COALESCE(gvm.gastos_variables_manuales_usd, 0::numeric), 2) AS gastos_variables_usd,
    round(COALESCE(gf.gastos_fijos_usd, 0::numeric), 2) AS gastos_fijos_usd,
    round(COALESCE(i.ingresos_brutos_usd, 0::numeric) - COALESCE(gv.gastos_variables_usd, 0::numeric) - COALESCE(gvm.gastos_variables_manuales_usd, 0::numeric) - COALESCE(gf.gastos_fijos_usd, 0::numeric), 2) AS ganancia_neta_usd,
    round(COALESCE(p.gastos_fijos_pendientes_usd, 0::numeric), 2) AS gastos_fijos_pendientes_usd,
    p.fijos_pendientes,
    round(COALESCE(i.ingresos_brutos_usd, 0::numeric) - COALESCE(gv.gastos_variables_usd, 0::numeric) - COALESCE(gvm.gastos_variables_manuales_usd, 0::numeric) - COALESCE(gf.gastos_fijos_usd, 0::numeric) - COALESCE(p.gastos_fijos_pendientes_usd, 0::numeric), 2) AS ganancia_neta_proyectada_usd,
    COALESCE(gf.gastos_sin_tipo_cambio, 0::bigint)::integer AS gastos_sin_tipo_cambio
   FROM meses m
     LEFT JOIN ing i ON i.mes = m.mes
     LEFT JOIN gv ON gv.mes = m.mes
     LEFT JOIN gf ON gf.mes = m.mes
     LEFT JOIN gvm ON gvm.mes = m.mes
     LEFT JOIN pend p ON p.mes = m.mes
  ORDER BY m.mes DESC;
