-- ════════════════════════════════════════════════════════════════════════════
-- FUNCIONES de `periodistas-marketing` (wxyimqkjlwfncvzozpjy)
-- Foto del 01/09/2026 · 11 funciones
--
-- ⚠️ ES UNA FOTO, NO LA FUENTE. Ver db/README.md. El POR QUÉ de las tres `f_src_*`
-- está comentado en docs/atribucion-vistas.sql, que es el archivo que manda si hay
-- que cambiar el criterio de atribución.
--
-- Se agrupan por para qué sirven, no por orden alfabético:
--   1. Atribución (las que traducen `src`)      f_src_estandar · f_src_campana
--                                               f_campana_email_a_src
--   2. RPC que llama el código                  contexto_contacto · marcar_entrega
--                                               merge_comunicaciones · sync_landing_versiones
--   3. Triggers                                 events_resolve_step · gastos_set_updated_at
--                                               set_agentes_bitacora_updated_at · set_updated_at
-- ════════════════════════════════════════════════════════════════════════════


-- ─── 1. ATRIBUCIÓN ──────────────────────────────────────────────────────────
-- Traducen un `src` viejo al estándar AL LEER, sin reescribir ninguna fila: una venta
-- de julio tiene que seguir diciendo lo que decía. Detalle en docs/atribucion-vistas.sql.

CREATE OR REPLACE FUNCTION public.f_src_estandar(s text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when s is null or btrim(s) = '' then null
    when lower(s) in ('test','qa','chequeo','verificacion','formulario','valentina','link-pie',
                      '_removed_','--sanitized--','reenganche-prueba','ping-limite')
                                                           then 'test-' || replace(lower(s),'_','')
    when lower(s) like 'prueba%' or lower(s) like 'test%'
      or lower(s) like 'qa-%'    or lower(s) like 'chequeo%' then 'test-' || lower(s)
    when s = 'ad1-fomo'                 then 'ad-fomo-a1'
    when s = 'ad1-fomo-coment'          then 'ad-fomo-a1-com'
    when s = 'ad3-mundial'              then 'ad-mundial-a3'
    when s = 'ad5-lectores'             then 'ad-lectores-a5'
    when s in ('ad4','ad4-perfil')      then 'ad-lectores-a4'
    when s = 'ad-guia-claude'           then 'ad-guias-a2'
    when s = 'Email-Regalo1'            then 'em-guias-r1'
    when s = 'Email-Regalo2'            then 'em-guias-r2'
    when s = 'Email-Regalo3'            then 'em-guias-r3'
    when s = 'Email-Regalo4'            then 'em-guias-r4'
    when s = 'Email-Regalo5'            then 'em-guias-r5'
    when s = 'Email-Oferta'             then 'em-guias-oferta'
    when s = 'Email-Oferta2'            then 'em-guias-oferta2'
    when s = 'Email-Manifiesto'         then 'em-manifiesto'
    when s = 'Email-Republicadores-R1'  then 'em-lectores-r1'
    when s = 'Email-Republicadores-fix' then 'em-lectores-fix'
    when s like 'Email-Reenganche%'     then 'em-reenganche'
    when s = 'WhatsApp-Regalo3'         then 'wa-guias-r3'
    when s = 'WhatsApp-Regalo4'         then 'wa-guias-r4'
    when s = 'WhatsApp-Oferta'          then 'wa-guias-oferta'
    when s = 'WhatsApp-Reenvio'         then 'wa-reenvio'
    when s = 'wa-seguimiento'           then 'wa-asistente'
    when s = 'PDF-Regalo4'              then 'pdf-guias-r4'
    when s = 'guia-lectores'            then 'pdf-lectores'
    when s = 'Landing-page-1'           then 'dir-landing'
    when s = 'Landing-tu-medio'         then 'dir-tumedio'
    when s = 'LeadGen-1USD'             then 'dir-leadgen'
    when s = 'recup-abandono'           then 'em-recup-abandono'
    when s = 'recup-rechazo'            then 'em-recup-rechazo'
    else lower(s)
  end
$function$;


CREATE OR REPLACE FUNCTION public.f_src_campana(s text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when e is null                                then null
    when split_part(e,'-',1) = 'og'               then 'organico-' || split_part(e,'-',2)
    when split_part(e,'-',1) = 'test'             then 'pruebas'
    when split_part(e,'-',1) = 'dir'              then 'directo'
    when split_part(e,'-',2) = ''                 then split_part(e,'-',1)
    else split_part(e,'-',2)
  end
  from (select f_src_estandar(s) as e) x
$function$;


-- El puente entre lo ENVIADO (campañas de Brevo) y lo CLICADO (events.src).
CREATE OR REPLACE FUNCTION public.f_campana_email_a_src(c text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case c
    when 'regalo1-guia-claude'       then 'em-guias-r1'
    when 'regalo2-50-prompts'        then 'em-guias-r2'
    when 'regalo3-periodico'         then 'em-guias-r3'
    when 'regalo4-pilares'           then 'em-guias-r4'
    when 'regalo5-agentes-ia'        then 'em-guias-r5'
    when 'oferta-email'              then 'em-guias-oferta'
    when 'oferta-reenvio'            then 'em-guias-oferta2'
    when 'republicadores-r1'         then 'em-lectores-r1'
    when 'republicadores-recuperado' then 'em-lectores-fix'
    when 'republicadores-guia-fix'   then 'em-lectores-fix'
    when 'email-manifiesto'          then 'em-manifiesto'
    when 'reenganche'                then 'em-reenganche'
    when 'recup-carrito-1'           then 'em-recup-abandono'
    when 'recup-carrito-2'           then 'em-recup-abandono'
    when 'reenganche-prueba'         then 'test-reenganche'
    when 'ping-limite'               then 'test-ping'
    else null
  end
$function$;


-- ─── 2. RPC QUE LLAMA EL CÓDIGO ─────────────────────────────────────────────

-- Todo lo que sabemos de un teléfono, en un solo JSON. La lo usa el asistente de WhatsApp
-- para contestar sabiendo si la persona compró, abandonó un pago o es sólo un lead.
-- Cruza por los ÚLTIMOS 8 DÍGITOS: el prefijo "9" argentino hace que el mismo número
-- llegue escrito de dos formas distintas.
CREATE OR REPLACE FUNCTION public.contexto_contacto(p_phone text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with p as (
    select right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 8) as suf
  )
  select jsonb_strip_nulls(jsonb_build_object(
    'compra', (
      select to_jsonb(t) from (
        select nombre, ultimo_producto, pais, ultima_compra_en, primera_compra_en
        from customers c, p
        where p.suf <> '' and right(regexp_replace(coalesce(c.telefono, ''), '\D', '', 'g'), 8) = p.suf
        order by ultima_compra_en desc nulls last
        limit 1
      ) t
    ),
    'potencial', (
      select to_jsonb(t) from (
        select nombre, tipo, producto, valor, moneda, motivo_rechazo,
               estado_recuperacion, paso_recuperacion, ultimo_contacto_en, ocurrido_en
        from clientes_potenciales cp, p
        where p.suf <> '' and right(regexp_replace(coalesce(cp.telefono, ''), '\D', '', 'g'), 8) = p.suf
        order by ocurrido_en desc nulls last
        limit 1
      ) t
    ),
    'lead', (
      select to_jsonb(t) from (
        select nombre, email, funnel, es_periodista, utm_campaign,
               coalesce(ocurrido_en, created_at) as registrado_en
        from leads l, p
        where p.suf <> '' and right(regexp_replace(coalesce(l.telefono, ''), '\D', '', 'g'), 8) = p.suf
        order by coalesce(ocurrido_en, created_at) desc nulls last
        limit 1
      ) t
    )
  ));
$function$;


-- El estado de entrega de WhatsApp sólo AVANZA: enviado(1) → fallido(2) → entregado(3) → leido(4).
-- Los webhooks de Meta llegan desordenados, así que sin este rango un "enviado" tardío
-- pisaría un "leído" que ya había llegado.
CREATE OR REPLACE FUNCTION public.marcar_entrega(p_wamid text, p_estado text, p_ts timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  rank_new int := case p_estado
    when 'leido' then 4 when 'entregado' then 3 when 'fallido' then 2 when 'enviado' then 1 else 0 end;
  rank_old int;
begin
  if rank_new = 0 then return; end if;
  select case estado_entrega
    when 'leido' then 4 when 'entregado' then 3 when 'fallido' then 2 when 'enviado' then 1 else 0 end
    into rank_old
    from public.conversaciones_wa
   where wamid = p_wamid and direccion = 'out'
   order by id desc limit 1;
  if rank_old is null then return; end if;      -- no hay fila saliente para ese wamid
  if rank_new <= coalesce(rank_old, 0) then return; end if;
  update public.conversaciones_wa
     set estado_entrega = p_estado,
         entregado_en = case when p_estado in ('entregado','leido') and entregado_en is null then p_ts else entregado_en end,
         leido_en     = case when p_estado = 'leido' then p_ts else leido_en end
   where wamid = p_wamid and direccion = 'out';
end $function$;


-- Guarda los eventos de email de Brevo. UN HISTÓRICO SÓLO COMPLETA, NUNCA PISA:
-- el texto se rellena con coalesce (nunca se borra lo que ya había) y en las fechas
-- gana la MÁS VIEJA (least ignora los null). Un upsert común borraría lo aprendido.
CREATE OR REPLACE FUNCTION public.merge_comunicaciones(filas jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  tocadas integer;
begin
  insert into public.comunicaciones_email as c (
    mensaje_id, email, asunto, campana,
    enviado_en, entregado_en, abierto_en, clic_en, rebotado_en, spam_en,
    actualizado_en
  )
  select
    s.mensaje_id, s.email, s.asunto, s.campana,
    s.enviado_en, s.entregado_en, s.abierto_en, s.clic_en, s.rebotado_en, s.spam_en,
    now()
  from (
    select
      f->>'mensaje_id'                              as mensaje_id,
      min(nullif(f->>'email', ''))                  as email,
      min(nullif(f->>'asunto', ''))                 as asunto,
      min(nullif(f->>'campana', ''))                as campana,
      min((f->>'enviado_en')::timestamptz)          as enviado_en,
      min((f->>'entregado_en')::timestamptz)        as entregado_en,
      min((f->>'abierto_en')::timestamptz)          as abierto_en,
      min((f->>'clic_en')::timestamptz)             as clic_en,
      min((f->>'rebotado_en')::timestamptz)         as rebotado_en,
      min((f->>'spam_en')::timestamptz)             as spam_en
    from jsonb_array_elements(filas) as f
    where f->>'mensaje_id' is not null
    group by 1
  ) s
  on conflict (mensaje_id) do update set
    -- Texto: solo se completa lo que falta. Nunca se borra.
    email        = coalesce(c.email, excluded.email),
    asunto       = coalesce(c.asunto, excluded.asunto),
    campana      = coalesce(c.campana, excluded.campana),
    -- Fechas: la más vieja gana. least() ignora los null.
    enviado_en   = least(c.enviado_en,   excluded.enviado_en),
    entregado_en = least(c.entregado_en, excluded.entregado_en),
    abierto_en   = least(c.abierto_en,   excluded.abierto_en),
    clic_en      = least(c.clic_en,      excluded.clic_en),
    rebotado_en  = least(c.rebotado_en,  excluded.rebotado_en),
    spam_en      = least(c.spam_en,      excluded.spam_en),
    actualizado_en = now();

  get diagnostics tocadas = row_count;
  return tocadas;
end $function$;


-- Recalcula y GUARDA las métricas de la versión ACTIVA de la landing en landing_versiones.
-- ⚠️ `checkout_clicks` acá son SESIONES distintas, no clics. Es una métrica distinta de
-- `clics_checkout` aunque el nombre se parezca — confundirlas ya dio un veredicto mal
-- calculado (ver la memoria de la landing v5).
CREATE OR REPLACE FUNCTION public.sync_landing_versiones()
 RETURNS TABLE(version text, sesiones integer, checkout_clicks integer, compras integer, bumps integer, tasa numeric, neto numeric)
 LANGUAGE plpgsql
AS $function$
declare v record; s int; c int; cp int; bp int; nc numeric; nt numeric; t numeric;
begin
  select * into v from landing_versiones where activa is true order by vigente_desde desc limit 1;
  if not found then return; end if;

  select count(distinct session_id),
         count(distinct session_id) filter (where tipo_evento='click_checkout')
    into s, c
    from events
   where ocurrido_en >= v.vigente_desde
     and (v.vigente_hasta is null or ocurrido_en < v.vigente_hasta)
     and tipo_evento in ('pageview','click_checkout')
     and url ~ '^https?://sistemadeingresosdiariosia\.com/($|[?#])';

  -- Clasificacion por la tabla products (no por nombre): curso vs extras del embudo.
  select count(*) filter (where p.tipo = 'curso_principal'),
         count(*) filter (where p.tipo in ('order_bump','upsell')),
         coalesce(sum(ve.comision_usd) filter (where p.tipo = 'curso_principal'), 0),
         coalesce(sum(ve.comision_usd) filter (where p.tipo in ('curso_principal','order_bump','upsell')), 0)
    into cp, bp, nc, nt
    from ventas ve
    join products p on p.producto_id_hotmart = ve.producto_id
   where ve.ocurrido_en >= v.vigente_desde
     and (v.vigente_hasta is null or ve.ocurrido_en < v.vigente_hasta);

  t := case when s > 0 then round(100.0 * c / s, 2) else 0 end;

  update landing_versiones
     set sesiones = s, checkout_clicks = c, compras = cp, bumps = bp,
         neto_curso_usd = nc, neto_total_usd = nt, tasa_landing_checkout = t,
         medido_desde = v.vigente_desde::date, medido_hasta = current_date
   where id = v.id;

  return query select v.version, s, c, cp, bp, t, nt;
end $function$;


-- ─── 3. TRIGGERS ────────────────────────────────────────────────────────────

-- Al insertar un event con `payload->>'step'`, le resuelve solo el funnel_step_id
-- y el funnel_id. Así quien manda el evento no necesita conocer los ids.
CREATE OR REPLACE FUNCTION public.events_resolve_step()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.funnel_step_id is null
     and coalesce(new.payload->>'step','') <> '' then
    select s.id, s.funnel_id
      into new.funnel_step_id, new.funnel_id
    from public.funnel_steps s
    join public.funnels f on f.id = s.funnel_id
    where s.slug = new.payload->>'step'
      and (new.payload->>'funnel' is null or f.slug = new.payload->>'funnel')
    limit 1;
  end if;
  return new;
end;
$function$;


CREATE OR REPLACE FUNCTION public.gastos_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$;


CREATE OR REPLACE FUNCTION public.set_agentes_bitacora_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$function$;


CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
