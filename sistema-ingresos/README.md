# sistema-ingresos/ — Landing + backend del curso

Todo lo del curso **"Sistema de Ingresos Diarios"** (pago único en Hotmart, $27):
las páginas web y las funciones serverless que lo hacen funcionar.

**Deploy:** Vercel, proyecto `sistema-ingresos-landing` →
`sistemadeingresosdiariosia.com`. Se publica con `vercel --prod` desde la raíz
del repo.

## Las páginas (HTML en la raíz)

| Archivo | Página |
|---|---|
| `index.html` | Landing / página de ventas principal |
| `landing.html`, `landing-leadgen-v1.html` | Variantes de landing (leadgen) |
| `gracias.html` | Post-compra ("gracias") — entrega + identidad de marca |
| `guia-*.html` | Las guías-regalo (lead magnets): 5 pilares, agentes IA, periódico digital IG/FB |
| `logo-*.webp` | Logo |

## El backend

- [`api/`](api/README.md) — funciones serverless de Vercel: webhook de compra,
  tracking, recuperación de carritos, embudo de WhatsApp, panel de salud, etc.
- [`api/_lib/`](api/_lib/README.md) — helpers compartidos (no son endpoints).
- `track.js` — beacon de tracking que corre en el navegador y le pega a
  `api/event.js`.
- `vercel.json` — configuración del deploy y los crons.
- `qa-salud-sitio.mjs` — test de salud del sitio (velocidad + botones/links,
  incluido el checkout). Correr en las páginas ante cualquier cambio.

## El contenido del curso

- [`modulo_3_monetizacion/`](modulo_3_monetizacion/README.md) y
  [`modulo_4_profesionalizacion/`](modulo_4_profesionalizacion/README.md) —
  clases (guiones en `.md`).
- `clase_final.md` — clase de cierre.
- [`img/`](img/README.md) — imágenes de las landings.

## Documentación operativa (`.md` en la raíz)

`TRACKING.md` (tracking Meta/CAPI) · `RECUPERACION.md` · `POST-COMPRA.md` ·
`PUENTE-WHATSAPP-TELEGRAM.md` · `PLANTILLAS-WHATSAPP.md` ·
`TRAZABILIDAD-VERSIONES.md` · `ANALYTICS-GA4.md` · `ANALYTICS-CLARITY.md` ·
`AGENDA-TRELLO.md` · `analisis-landing.md`.

## Regla de oro

Cada cambio en una página = correr `qa-salud-sitio.mjs` en las 10 páginas y
verificar en vivo antes de darlo por bueno (la landing no se puede romper).
