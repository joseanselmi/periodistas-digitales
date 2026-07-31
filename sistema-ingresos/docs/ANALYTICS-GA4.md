# Google Analytics 4 — métricas por página del curso

> Setup instalado el **2026-07-09** (tarjeta Trello #63). Objetivo: tener
> visitas/visitantes **independientes por cada URL** del curso. Antes solo
> existía el Meta Pixel (compartido, sin desglose por página) y 6 de las 9
> páginas no medían absolutamente nada.

## Datos de la propiedad

| Campo | Valor |
|---|---|
| **ID de medición** | `G-J7J27BYHF0` |
| Cuenta GA | Tu Futuro con IA |
| Propiedad | Periodistas digitales |
| Flujo de datos (web) | Sistema de ingresos diarios para periodistas |
| Dominio | `sistemadeingresosdiariosia.com` |
| Zona horaria | Madrid |
| Moneda | USD |
| Medición mejorada | Activada (mide scroll, clics de salida, etc. automáticamente) |

Cuenta: `analytics.google.com` (login de Jose). Para ver las métricas se entra
por: cuenta **Tu Futuro con IA** → propiedad **Periodistas digitales**.

> Verificado en vivo el 2026-07-09: GA4 Tiempo Real registró la visita real con
> eventos `page_view` + `first_visit` + `session_start`. Recibe datos.

## Páginas cubiertas (9)

El snippet `gtag.js` está pegado **justo después de `<head>`** en cada una:

| Archivo | URL en producción | Rol |
|---|---|---|
| `index.html` | `/` | Landing principal (la que se sirve) |
| `landing.html` | `/landing.html` | Landing alternativa |
| `gracias.html` | `/gracias.html` | Post-compra (Hotmart redirige acá) — `noindex` |
| `landing-leadgen-v1.html` | `/landing-leadgen-v1.html` | Captura de leads |
| `guia-claude-periodistas.html` | `/guia-claude-periodistas.html` | Regalo / guía |
| `guia-completa-50-prompts.html` | `/guia-completa-50-prompts.html` | Regalo / guía |
| `guia-periodico-digital-ig-fb.html` | `/guia-periodico-digital-ig-fb.html` | Regalo / guía |
| `guia-5-pilares-ingresos-periodico-digital.html` | `/guia-5-pilares-ingresos-periodico-digital.html` | Regalo / guía |
| `guia-agentes-ia-periodistas.html` | `/guia-agentes-ia-periodistas.html` | Regalo / guía |

## Convive con el Meta Pixel (no lo reemplaza)

GA4 **no toca el Meta Pixel** (id `1086780383211630`). Son dos sistemas
distintos con propósitos distintos:

- **Meta Pixel** → optimización y atribución de los anuncios de Facebook/IG
  (PageView, ViewContent, InitiateCheckout, Purchase). Vive más abajo en el
  `<body>` de `index.html`, `landing.html` y `gracias.html`.
- **GA4** → analítica de tráfico: cuántas visitas/visitantes tiene cada URL,
  de dónde vienen, cuánto se quedan. Vive arriba en el `<head>` de las 9 páginas.

Los dos corren en paralelo sin pisarse.

## Cómo leer las métricas por página

1. Entrar a [analytics.google.com](https://analytics.google.com) y elegir la
   propiedad **Sistema de Ingresos Diarios**.
2. Menú izquierdo → **Informes** → **Interacción** → **Páginas y pantallas**.
3. La tabla lista **una fila por URL** (columna "Ruta de página"), con:
   - **Vistas** = cuántas veces se cargó esa página.
   - **Usuarios activos** = personas distintas que la vieron.
   - **Tiempo de interacción medio**, tasa de rebote, etc.
4. Arriba a la derecha se elige el **rango de fechas**.

> GA4 separa por página **solo**; no hace falta configurar nada más — el
> desglose por URL es automático a partir de la ruta.

### Ver tráfico en tiempo real (para verificar que mide)

**Informes → Tiempo real** muestra los usuarios de los últimos 30 minutos y
qué páginas están viendo ahora mismo. Es lo que se usa para confirmar que la
instalación funciona (abrir una página del sitio y ver si aparece acá).

> ⚠️ Los informes estándar ("Páginas y pantallas") tardan **hasta 24–48 h** en
> mostrar datos por primera vez. Tiempo Real es inmediato.

## Cómo agregar GA4 a una página nueva en el futuro

Estos son archivos HTML estáticos (sin build ni plantilla compartida), así que
cada página nueva necesita el snippet pegado a mano. Copiar esto **justo
después de la etiqueta `<head>`**:

```html
<!-- Google Analytics 4 (gtag.js) — propiedad "Sistema de Ingresos Diarios" G-J7J27BYHF0 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-J7J27BYHF0"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-J7J27BYHF0');
</script>
```

Regla de oro: **una sola etiqueta de Google por página** (no pegar el snippet
dos veces).

## Deploy

Como todo el curso: desde la raíz del repo, `vercel --prod` sobre el proyecto
`sistema-ingresos-landing`. Los cambios de GA4 son solo HTML estático, no
tocan ninguna API ni variable de entorno.

## Lectura por API (scripts / agentes) — Trello #65

Además del panel web, GA4 se puede **leer por código** desde el repo, sin
screenshots — para responder "¿cuántas visitas tuvo X página?" desde el chat o
sumar tráfico al Panel de Comando diario.

- **Script**: `ads-agent/scripts/datos/fetch-ga4.mjs` (usa el paquete `@google-analytics/data`,
  ya instalado en ads-agent).
- **Auth**: cuenta de servicio `ga4-lector@periodistas-analytics.iam.gserviceaccount.com`
  (proyecto Google Cloud `periodistas-analytics`), con la llave en
  `ads-agent/ga4-service-account.json` — **GITIGNORED, es secreta, nunca al repo**.
  El robot está agregado en la propiedad GA4 con rol **Administrador** (09/07;
  alcanzaría con **Lector** — bajarlo es un pendiente opcional de seguridad).
- **ID de propiedad** (numérico, distinto del `G-J7J27BYHF0` de medición):
  **`544961227`**, guardado en `ads-agent/.env.local` como `GA4_PROPERTY_ID`.

```bash
cd ads-agent
node --env-file=.env.local scripts/datos/fetch-ga4.mjs             # métricas por página, últimos 7 días
node --env-file=.env.local scripts/datos/fetch-ga4.mjs --realtime  # usuarios activos ahora
node --env-file=.env.local scripts/datos/fetch-ga4.mjs --days=30   # otro rango
```

> Verificado E2E el 2026-07-09: devolvió datos reales por página.
