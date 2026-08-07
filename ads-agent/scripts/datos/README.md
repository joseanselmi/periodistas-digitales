# scripts/datos — traer y sincronizar datos

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Todo lo que **lee de una plataforma externa** y lo baja: Meta, GA4, Clarity,
Hotmart, Brevo, el inbox. No deciden ni publican nada — solo traen.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
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
- `meta-embudo-diario-por-anuncio.mjs` — ver "Los tres syncs de Meta" abajo
- `meta-gasto-diario-toda-la-cuenta.mjs` — ídem
- `meta-gasto-total-por-anuncio.mjs` — ídem
- `parse-compradores.mjs`
- `sync-comunicaciones.mjs`
- `sync-embudo-contenido.mjs` — guarda en `funnel_steps` **qué dice** cada mail
  del embudo, para que la página de Campañas de Leadr lo muestre. Correrlo cada
  vez que se edita el copy de un regalo o de la oferta.

Los `*-sync.mjs` escriben en la base `periodistas-marketing` — el detalle de qué
tabla toca cada uno está en [`../../docs/ARQUITECTURA-DATOS.md`](../../docs/ARQUITECTURA-DATOS.md).

---

## Los tres syncs de Meta — cuál usar

Los tres bajan datos de la misma cuenta publicitaria, pero **no traen lo mismo**.
Elegir el equivocado no da error: da una tabla que nadie está llenando, o un
número viejo que se ve igual que uno fresco.

Dos preguntas alcanzan para decidir: **¿querés plata o querés el embudo?** y
**¿querés el total de siempre o el día por día?**

| Script | Qué trae | Dónde lo deja | Qué mira |
|---|---|---|---|
| `meta-gasto-total-por-anuncio.mjs` | Cuánto gastó cada anuncio **en toda su vida** — un solo número, sin abrir por día. Con impresiones, clics, CTR y frecuencia. | tabla `campanas` (una fila por anuncio, la actualiza) | **Solo los anuncios que ya tienen ficha** en `campanas`. Si un anuncio no la tiene, lo avisa y sigue — no la inventa. |
| `meta-embudo-diario-por-anuncio.mjs` | El **embudo completo** de cada anuncio, **día por día**: gasto, clics al enlace, vistas de la landing, pagos iniciados y compras. | tabla `meta_insights_diario` (una fila por día y anuncio) | Solo los anuncios con **matrícula `adN-angulo`** en el nombre del conjunto o del anuncio. |
| `meta-gasto-diario-toda-la-cuenta.mjs` | Cuánto gastó **cada campaña, día por día**. Solo plata, clics e impresiones — no abre el embudo. | tabla `meta_gasto_diario` (una fila por día y campaña) | **La cuenta entera. No filtra nada**: entren o no en un embudo, tengan ficha o no. |

**Cuándo usar cada uno:**

- **"¿Cuánto me costó cada venta / cuánto rinde este anuncio?"** →
  `meta-gasto-total-por-anuncio.mjs`. Es el que cruza con las ventas de Hotmart
  para dar CPA y ROAS por anuncio.
- **"¿Cómo viene este anuncio día a día? ¿En qué escalón se me cae la gente?"** →
  `meta-embudo-diario-por-anuncio.mjs`. Es el único que trae pagos iniciados y
  compras, que es lo que permite ver dónde se corta el embudo.
- **"¿Cuánta plata se está yendo en total? ¿Hay algo gastando que no estoy
  mirando?"** → `meta-gasto-diario-toda-la-cuenta.mjs`. Es el único que ve la
  cuenta entera. Los otros dos, por diseño, **no ven** lo que no está registrado.

⚠️ **El tercero existe por un punto ciego real.** La campaña "interacción" venía
gastando ~$2 por día desde diciembre de 2024 — $340 en total — y no aparecía en
ninguna tabla ni en ninguna pantalla, porque los otros dos syncs solo miran lo que
ya está registrado. Nadie mintió: no había dónde verla. Si vas a preguntarte
"¿cuánto estoy gastando?", el que contesta es este.

**Los tres corren solos** desde el cron de `recuperacion` (15:00 UTC, 1 vez por
día), con los **mismos nombres** del lado de la nube en
`sistema-ingresos/api/_lib/`. Correrlos a mano sirve para mirar algo en el momento,
para un backfill (`--dias 400` en el de toda la cuenta) o para verificar un cambio.

> Los tres pegan contra la API de Meta y **escriben en la base**. Todos tienen un
> modo que solo muestra: `--dry-run` en los dos "por anuncio", `--dry` en el de
> toda la cuenta.

### Historial de nombres (07/08/2026) — para que nadie lo revierta

| Antes | Ahora |
|---|---|
| `meta-spend-sync.mjs` | `meta-gasto-total-por-anuncio.mjs` |
| `meta-daily-sync.mjs` | `meta-embudo-diario-por-anuncio.mjs` |
| `meta-gasto-sync.mjs` | `meta-gasto-diario-toda-la-cuenta.mjs` |

Los gemelos de `sistema-ingresos/api/_lib/` se renombraron igual (`.js`), y sus
funciones pasaron a llamarse `runMetaGastoTotalPorAnuncio`,
`runMetaEmbudoDiarioPorAnuncio` y `runMetaGastoDiarioTodaLaCuenta`. El único que
los importa es `sistema-ingresos/api/recuperacion.js`, que ya quedó actualizado.

**Por qué se cambiaron:** `spend` y `gasto` son **la misma palabra en dos
idiomas**, y estaban en la misma carpeta apuntando a tablas distintas. Es la
misma trampa que ya costó una rotura en este repo con `campaigns/` vs `campanas/`,
ahora en versión inglés/español. Además, `daily`, `spend` y `gasto` decían *cuándo*
o *en qué idioma*, pero ninguno decía **qué trae** ni **a qué le presta atención**:
había que abrir el archivo para saber si miraba un anuncio o la cuenta entera.

**El criterio nuevo:** el nombre dice **qué trae** (`gasto` o `embudo`), **de qué
período** (`total` o `diario`) y **de qué alcance** (`por-anuncio` o
`toda-la-cuenta`). Todo en castellano, como el resto del repo. Si mañana aparece un
cuarto sync, el nombre se arma con esas tres piezas.

**Lo que a propósito NO se tocó**, porque renombrarlo rompe en silencio:

- Las **tablas** de Supabase (`campanas`, `meta_insights_diario`,
  `meta_gasto_diario`, `gastos_meta_mensual`) — las leen Leadr y las consultas.
- Las **variables de entorno** cargadas en Vercel (`META_SPEND_PRESET`,
  `META_GASTO_DIAS`). Si se les cambia el nombre, quedan sin efecto y el script
  sigue andando con el valor por defecto sin avisar.
