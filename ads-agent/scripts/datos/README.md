# scripts/datos — traer y sincronizar datos

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Todo lo que **lee de una plataforma externa** y lo baja: Meta, GA4, Clarity,
Hotmart, Brevo, el inbox. No deciden ni publican nada — solo traen.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/datos/fetch-meta.mjs`

- `check-inbox.mjs`
- `checkout-trazabilidad.mjs`
- `download-creatives.mjs`
- `fetch-clarity.mjs`
- `fetch-ga4.mjs`
- `fetch-meta.mjs`
- `hotmart-rechazos-csv.mjs`
- `hotmart-scraper.mjs`
- `hotmart-sync.mjs`
- `meta-daily-sync.mjs`
- `meta-spend-sync.mjs`
- `parse-compradores.mjs`
- `sync-comunicaciones.mjs`

Los `*-sync.mjs` escriben en la base `periodistas-marketing` — el detalle de qué
tabla toca cada uno está en [`../../docs/ARQUITECTURA-DATOS.md`](../../docs/ARQUITECTURA-DATOS.md).
