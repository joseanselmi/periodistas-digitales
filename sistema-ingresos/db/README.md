# `db/` — lo que vive DENTRO de Supabase, copiado al repo

**Foto del 01/09/2026** del proyecto `periodistas-marketing` (`wxyimqkjlwfncvzozpjy`):
**20 vistas** y **11 funciones**.

## Por qué existe esto

Hasta hoy las vistas y las funciones existían **sólo adentro de Supabase**: cero archivos
`.sql`, cero menciones en el repo. Eso significaba tres cosas, y las tres dolieron:

1. **No se podían revisar.** La lógica de `v_personas`, `v_ingresos_mes` y `v_pnl_mensual`
   decide números que se leen todos los días, y no había dónde leerla salvo entrando al panel
   de Supabase.
2. **No tenían diff.** Cambiar una vista no dejaba rastro. Nadie podía ver qué cambió, cuándo,
   ni por qué — y una vista mal tocada da un número plausible, no un error.
3. **`verificar-repo.mjs` no las chequeaba**, porque no las conocía.

La auditoría del 18/08 encontró 14 así. Para el 01/09 ya eran 20: la deuda crecía sola, porque
crear una vista nueva no obligaba a nada.

## Qué es cada archivo, y qué NO es

| archivo | qué es |
|---|---|
| [`vistas.sql`](vistas.sql) | las 20 vistas, tal como Postgres las devuelve hoy |
| [`funciones.sql`](funciones.sql) | las 11 funciones (RPC, triggers y helpers de `src`) |

⚠️ **Esto es una FOTO, no la fuente.** La fuente sigue siendo la base. Estos archivos existen
para poder **leer, revisar y comparar** — no se aplican solos y aplicarlos a ciegas pisaría
cambios hechos después de la foto. El texto que Postgres devuelve está normalizado (reescribe
el SQL original: expande `*`, califica nombres, cambia el formato), así que **no es idéntico al
que se escribió a mano** aunque signifique lo mismo.

## Dónde vive el POR QUÉ

Estos dos archivos guardan el **qué**. El **por qué** de las piezas de atribución está
escrito, con su razonamiento completo, en otro lado — y ése sí es el que manda si hay que
cambiar el criterio:

- [`../docs/atribucion-vistas.sql`](../docs/atribucion-vistas.sql) — `f_src_estandar`,
  `f_src_campana`, `f_campana_email_a_src` y `v_campana_embudo`, comentadas una por una.
  El estándar que implementan está en `NOMENCLATURA-SRC.md`.
- [`../campanas/email-comunidad/vistas.sql`](../campanas/email-comunidad/vistas.sql) — las
  vistas del canal Comunidad.

Si el criterio cambia, se cambia **ahí** y en la base; acá sólo se vuelve a sacar la foto.

## Cómo volver a sacar la foto

Con el MCP de Supabase (proyecto `wxyimqkjlwfncvzozpjy`), o con cualquier cliente SQL:

```sql
-- las vistas
select table_name,
       pg_get_viewdef(('public.'||quote_ident(table_name))::regclass, true)
from information_schema.views
where table_schema = 'public'
order by table_name;

-- las funciones
select p.proname, pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind in ('f','p')
order by p.proname;
```

**Conviene rehacerla cada vez que se crea o se toca una vista**, y commitear el cambio junto
con el resto del trabajo: el diff de estos archivos es lo único que deja ver qué se movió.

> ⚠️ **No se puede automatizar todavía.** Un script necesitaría la `SUPABASE_SERVICE_ROLE_KEY`
> de `periodistas-marketing`, y hoy no está en ningún `.env.local` (Vercel no la deja bajar:
> está marcada "Sensitive"). Además `pg_get_viewdef` es SQL, no REST — haría falta una RPC o
> una conexión directa a Postgres. Mientras tanto, se saca a mano con las consultas de arriba.
