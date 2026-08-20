-- Atribución — lo que vive en la base, guardado acá porque una vista que sólo existe en
-- Supabase es invisible para cualquiera que lea el repo (la auditoría del 18/08 encontró 14 así).
-- APLICADO el 20/08/2026 en `periodistas-marketing` (wxyimqkjlwfncvzozpjy) como migraciones:
--   src_estandar_y_campana · src_estandar_qa_a_pruebas · v_campana_embudo
--
-- El estándar que implementan está en NOMENCLATURA-SRC.md. Si cambia el estándar, cambia ACÁ.
--
--   f_src_estandar()        → traduce un src viejo al estándar AL LEER (no toca ninguna fila)
--   f_src_campana()         → la campaña = nivel 2 del src
--   f_campana_email_a_src() → el puente entre lo ENVIADO (Brevo) y lo CLICADO (events)
--   v_campana_embudo        → el embudo de punta a punta, por campaña y por pieza
--
-- El texto vigente de cualquiera de ellas se recupera con:
--   select prosrc from pg_proc where proname = 'f_src_estandar';
--   select pg_get_viewdef('v_campana_embudo'::regclass, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Por qué existe f_src_estandar()
--
-- Las filas viejas NO se reescriben: una venta de julio tiene que seguir diciendo lo que decía.
-- Pero si julio dice `Email-Regalo1` y agosto dice `em-guias-r1`, no se pueden comparar. La
-- traducción va acá, al LEER, que es lo único que permite mirar los dos meses juntos sin
-- falsificar el pasado.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function f_src_estandar(s text) returns text
language sql immutable as $$
  select case
    when s is null or btrim(s) = '' then null
    -- pruebas nuestras: NO son tráfico real. Se agrupan para poder descartarlas de un saque.
    when lower(s) in ('test','qa','chequeo','verificacion','formulario','valentina','link-pie',
                      '_removed_','--sanitized--','reenganche-prueba','ping-limite')
                                                           then 'test-' || replace(lower(s),'_','')
    when lower(s) like 'prueba%' or lower(s) like 'test%'
      or lower(s) like 'qa-%'    or lower(s) like 'chequeo%' then 'test-' || lower(s)
    -- anuncios
    when s = 'ad1-fomo'                 then 'ad-fomo-a1'
    when s = 'ad1-fomo-coment'          then 'ad-fomo-a1-com'
    when s = 'ad3-mundial'              then 'ad-mundial-a3'
    when s = 'ad5-lectores'             then 'ad-lectores-a5'
    when s in ('ad4','ad4-perfil')      then 'ad-lectores-a4'
    when s = 'ad-guia-claude'           then 'ad-guias-a2'
    -- mails
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
    -- whatsapp (canal cerrado; queda por el histórico)
    when s = 'WhatsApp-Regalo3'         then 'wa-guias-r3'
    when s = 'WhatsApp-Regalo4'         then 'wa-guias-r4'
    when s = 'WhatsApp-Oferta'          then 'wa-guias-oferta'
    when s = 'WhatsApp-Reenvio'         then 'wa-reenvio'
    when s = 'wa-seguimiento'           then 'wa-asistente'
    -- guías y landings
    when s = 'PDF-Regalo4'              then 'pdf-guias-r4'
    when s = 'guia-lectores'            then 'pdf-lectores'
    when s = 'Landing-page-1'           then 'dir-landing'
    when s = 'Landing-tu-medio'         then 'dir-tumedio'
    when s = 'LeadGen-1USD'             then 'dir-leadgen'
    when s = 'recup-abandono'           then 'em-recup-abandono'
    when s = 'recup-rechazo'            then 'em-recup-rechazo'
    else lower(s)
  end
$$;

-- La CAMPAÑA es el nivel 2 del src. Es el nivel que agrupa un anuncio con los mails que salen
-- de él: `ad-fomo-a1` y `em-guias-r1` no comparten canal, pero sí campaña.
-- El orgánico es la excepción A PROPÓSITO: ahí el nivel 2 es la plataforma, porque una historia
-- de Instagram no pertenece a ninguna campaña.
create or replace function f_src_campana(s text) returns text
language sql immutable as $$
  select case
    when e is null                                then null
    when split_part(e,'-',1) = 'og'               then 'organico-' || split_part(e,'-',2)
    when split_part(e,'-',1) = 'test'             then 'pruebas'
    when split_part(e,'-',1) = 'dir'              then 'directo'
    when split_part(e,'-',2) = ''                 then split_part(e,'-',1)
    else split_part(e,'-',2)
  end
  from (select f_src_estandar(s) as e) x
$$;

-- ⚠️ EL PUENTE QUE FALTABA. `comunicaciones_email` guarda el nombre de la campaña de Brevo
-- (`regalo1-guia-claude`) y `events`/`ventas` guardan el src (`em-guias-r1`). Son la MISMA
-- pieza con dos nombres distintos, así que hasta el 20/08/2026 los ENVÍOS y los CLICS no se
-- podían cruzar: no había forma de contestar "a cuánta gente le mandé esto y cuántos compraron".
--
-- Esto es un parche de lectura, no la cura. La cura es que el que manda el mail escriba el
-- `src` en la fila — ver la ficha del pipeline "mandar un mail" en NOMENCLATURA-SRC.md.
create or replace function f_campana_email_a_src(c text) returns text
language sql immutable as $$
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
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- v_campana_embudo — el embudo de punta a punta, por CAMPAÑA y por PIEZA
--
-- Una campaña vive en varios canales a la vez: un anuncio que capta, los mails que salen
-- después, la guía que se descarga. Cada pedazo estaba en una tabla distinta y con un nombre
-- distinto, así que "¿esta campaña cuánto vendió?" no se podía contestar sin cruzar cuatro
-- pantallas a mano.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace view v_campana_embudo as
with envios as (
  select f_campana_email_a_src(campana) as src,
         count(*)              as mails_enviados,
         count(entregado_en)   as mails_entregados,
         count(abierto_en)     as mails_abiertos,
         count(clic_en)        as mails_clic
  from comunicaciones_email
  where f_campana_email_a_src(campana) is not null
  group by 1
),
anuncios as (
  select f_src_estandar(src) as src,
         sum(impresiones)::bigint as impresiones,
         sum(link_clicks)::bigint as clics_anuncio,
         round(sum(spend_usd)::numeric, 2) as gasto_usd
  from meta_insights_diario
  group by 1
),
visitas as (
  select f_src_estandar(src) as src,
         count(*) filter (where tipo_evento = 'pageview')       as visitas,
         count(*) filter (where tipo_evento = 'pdf_open')       as guias_abiertas,
         count(*) filter (where tipo_evento = 'click_checkout') as clic_checkout
  from events
  where src is not null and btrim(src) <> ''
  group by 1
),
compras as (
  select f_src_estandar(src) as src,
         count(*) filter (where estado is null or estado not in ('devuelta','contracargo')) as ventas,
         count(*) filter (where estado in ('devuelta','contracargo'))                        as ventas_caidas,
         round(sum(comision_usd) filter (where estado is null or estado not in ('devuelta','contracargo'))::numeric, 2) as neto_usd
  from ventas
  where src is not null and btrim(src) <> ''
  group by 1
),
piezas as (
  select src from envios   union
  select src from anuncios union
  select src from visitas  union
  select src from compras
)
select
  f_src_campana(p.src)            as campana,
  split_part(p.src, '-', 1)       as canal,
  p.src                           as pieza,
  coalesce(a.impresiones, 0)      as impresiones,
  coalesce(a.clics_anuncio, 0)    as clics_anuncio,
  coalesce(a.gasto_usd, 0)        as gasto_usd,
  coalesce(e.mails_enviados, 0)   as mails_enviados,
  coalesce(e.mails_entregados, 0) as mails_entregados,
  coalesce(e.mails_abiertos, 0)   as mails_abiertos,
  coalesce(e.mails_clic, 0)       as mails_clic,
  coalesce(v.visitas, 0)          as visitas,
  coalesce(v.guias_abiertas, 0)   as guias_abiertas,
  coalesce(v.clic_checkout, 0)    as clic_checkout,
  coalesce(c.ventas, 0)           as ventas,
  coalesce(c.ventas_caidas, 0)    as ventas_caidas,
  coalesce(c.neto_usd, 0)         as neto_usd
from piezas p
left join envios   e on e.src = p.src
left join anuncios a on a.src = p.src
left join visitas  v on v.src = p.src
left join compras  c on c.src = p.src
where p.src is not null;

-- ⚠️ Lo que esta vista NO puede contestar, y conviene saberlo antes de sacar conclusiones:
--
-- 1. Las ventas SIN src (6 de 33) no aparecen en ninguna campaña. No se inventan.
-- 2. `recup-carrito-1` y `recup-carrito-2` son dos mails distintos que comparten un solo src
--    (`em-recup-abandono`): no se puede saber cuál de los dos produjo el clic.
-- 3. `guias_abiertas` cuenta ABERTURAS, no personas: el 30% son bots y previsualizadores.
--    Para gente de verdad hay que contar IPs distintas descartando los user-agent de bot.