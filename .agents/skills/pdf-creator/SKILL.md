---
version: 0.1.0
name: pdf-creator
description: |
  Crea guías/ebooks en PDF con el sistema de diseño de marca (oscuro, indigo/cyan,
  Space Grotesk + DM Sans + JetBrains Mono) a partir de un HTML estructurado en
  secciones, y los exporta a PDF con QA visual previo vía Puppeteer. Termina
  SIEMPRE corriendo el lint obligatorio de la skill pdf-guide-linter antes de
  mostrar o publicar nada — no es un paso opcional.
  Basado en lo aprendido construyendo sistema-ingresos/campanas/guia-claude-periodistas/guias/guia-claude-periodistas.pdf
  (guía de regalo de la campaña $1 "Guia Claude Periodistas") y en el bug de
  márgenes de sistema-ingresos/campanas/guia-claude-periodistas/guias/guia-periodico-digital-ig-fb.pdf (2026-06-26).
  Use when: "crear un PDF", "guía descargable", "ebook", "lead magnet en PDF",
  "regalo en PDF", "exportar guía a PDF", o cualquier pieza de contenido
  multi-página que se vaya a entregar como PDF por email/WhatsApp/landing.
  NOT for: carruseles de Instagram/Facebook (usar export-slides.mjs /
  export-slides-auto.mjs, que exportan JPG cuadrados de 1080x1080, no PDF).
allowed-tools: Read, Write, Edit, Bash, Glob
---

# PDF Creator

Convierte un documento HTML en un PDF de varias páginas, con el mismo lenguaje visual que ya usa la marca en `sistema-ingresos/campanas/guia-claude-periodistas/guias/guia-claude-periodistas.html`. El script que hace la conversión es `ads-agent/scripts/exportar/export-pdf.mjs` (Puppeteer).

## Flujo completo

1. **Escribir el HTML** siguiendo la plantilla de estructura de abajo (sección "Estructura obligatoria del HTML").
2. **Guardarlo** en la carpeta del proyecto correspondiente (ej. `sistema-ingresos/<nombre>.html` si va a vivir en el sitio público, o dentro de la carpeta de la campaña en `ads-agent/campaigns/<fecha>/`). Si la guía vive fuera de `sistema-ingresos/`, copiar también ahí el logo (ver sección "Logo y marca en la portada") — el HTML lo referencia con una ruta relativa simple (`logo-periodistas-digitales.png`), no funciona como `../sistema-ingresos/...`.
3. **Exportar**: `node ads-agent/scripts/exportar/export-pdf.mjs <ruta.html>` — genera el PDF y una carpeta `qa-<nombre>/` con una captura PNG de cada página.
4. **Revisar las capturas de QA** una por una antes de mostrarle nada al usuario o de mandar el PDF a algún lado. Buscar específicamente:
   - Cajas (`code-box`, `case-card`, `callout`, `cta-box`) que se corten a la mitad entre dos páginas.
   - Texto que se desborda de su contenedor.
   - Fuentes que no cargaron (si el texto se ve en una fuente genérica tipo Times/Arial en vez de Space Grotesk/DM Sans, las fuentes no llegaron a cargar — volver a correr el export).
   - Fondos transparentes/blancos donde debería verse el fondo oscuro de marca (señal de que `printBackground` no se aplicó).
5. **Corregir el HTML** si algo está mal y repetir el paso 3-4 hasta que las capturas se vean bien. Es normal iterar 2-3 veces — así se hizo la guía original.
6. **Correr el lint obligatorio**: `node ads-agent/scripts/exportar/lint-pdf-guide.mjs <ruta.html>` (skill `pdf-guide-linter`). Esto NO es opcional ni algo que el usuario tenga que pedir — es el último paso de este flujo, siempre. Si el exit code es 1, corregir lo que reporte y repetir el lint hasta que pase. **No mostrar la guía al usuario ni publicarla con el lint en rojo** — el 2026-06-26 esta misma guía se mostró y se publicó dos veces con el mismo bug de márgenes sin detectarlo, precisamente porque no existía este chequeo mecánico todavía.
7. **Publicar**: si el PDF se va a linkear desde un email o landing, copiarlo a `sistema-ingresos/<nombre>.pdf` (se sirve en `https://sistemadeingresosdiariosia.com/<nombre>.pdf`) y deployar si hace falta.
8. **Usar el link con tracker, no el link directo, en cualquier lugar donde alguien hace clic individualmente** (botón de email, CTA de landing): `https://sistemadeingresosdiariosia.com/api/d?file=<nombre>.pdf&src=<fuente>&sck=<tag>` — ver sección "Tracker de descargas" más abajo. Excepción: headers tipo "Documento" de plantillas de WhatsApp (ver esa sección, ahí no aporta nada).
9. **Pegar el link en la tarjeta de Trello correspondiente** (comentario dedicado, no de paso dentro de otro comentario más largo) — ver Regla 6 de `ads-agent/cerebro/trello-manager.md`. Obligatorio, no opcional.

## Tracker de descargas (estándar, desde 2026-06-27)

Un PDF servido como archivo estático no deja ningún rastro de quién lo descargó. `sistema-ingresos/api/d.js` (función serverless en Vercel) resuelve esto: registra el hit y recién después redirige al PDF real — invisible para quien hace clic, mismo archivo, demora imperceptible.

**Uso:** en vez de linkear directo a `https://sistemadeingresosdiariosia.com/<nombre>.pdf`, usar:
```
https://sistemadeingresosdiariosia.com/api/d?file=<nombre>.pdf&src=<fuente>&sck=<tag>
```
`file` está validado contra un patrón seguro (no acepta URLs externas ni path traversal — no es un open-redirect). `src`/`sck` son libres, usarlos para identificar de dónde viene el clic (ej. `src=Email-Regalo1`, `src=WhatsApp-Oferta`).

**Dónde SÍ usarlo:** cualquier link que cada destinatario clickea individualmente — botones de descarga en emails (Brevo/Make), botones CTA de landing.

**Dónde NO usarlo:** headers tipo "Documento" en plantillas de WhatsApp. Meta descarga el archivo **una sola vez**, al aprobar la plantilla — no por cada envío — así que ahí el tracker no cuenta nada y solo agrega una redirección innecesaria. Para WhatsApp, linkear el PDF directo.

**Cómo consultar los datos:** no hay dashboard, se lee de los logs de la función:
```
vercel logs https://sistemadeingresosdiariosia.com --no-follow --since 7d --json | grep pdf_download
```
Cada línea es un JSON con `file`, `src`, `sck` y `ts`. Esto no es "100% infalible" (ningún sistema de analytics lo es — bots, prefetch, etc.), pero es la señal más directa que existe hoy de una descarga real, mucho más confiable que solo medir aperturas de email.

**Ya migrado a esto (2026-06-27):** Regalo 1 (escenario Make `9433023` + `ads-agent/scripts/publicar/send-email.mjs`), Regalo 2 (`ads-agent/scripts/publicar/send-email.mjs`, backfill). **Pendiente:** la automatización de Regalo 2 en Brevo (pegada directo en su editor, no alcanzable por API).

## Estructura obligatoria del HTML

Cada página del PDF final = un `<section class="page">` (o `<section class="cover">` para la portada). El script `export-pdf.mjs` busca exactamente ese selector — si no se usa, no va a detectar páginas. Dentro de cada `<section class="page">`, todo el contenido real va envuelto en un único `<div class="page-inner">...</div>` (obligatorio, no opcional — ver por qué en las reglas de CSS de abajo):

```html
<section class="page">
  <div class="page-inner">
    <div class="eyebrow">...</div>
    <h2>...</h2>
    <p>...</p>
  </div>
</section>
```

```html
<style>
/* ... paleta y tipografía de marca, ver brand-context.mjs ... */
:root {
  --bg: #07070f; --text: #f1f5f9; --muted: #94a3b8;
  --indigo: #6366f1; --cyan: #22d3ee; --amber: #f59e0b;
}
body { background: var(--bg); color: var(--text); font-family:'DM Sans',sans-serif; }
h1,h2,h3 { font-family:'Space Grotesk',sans-serif; }
/* TODA página centra verticalmente su contenido — no solo las "cortas".
   Sin esto, cualquier página cuyo contenido no llene el alto físico de
   una hoja Letter deja un hueco de fondo vacío al final, antes del salto
   de página (ver "Lecciones" más abajo). Aplicar SIEMPRE, en TODAS las
   secciones .page (TOC incluida) — no es opt-in por sección. */
.page { max-width:760px; margin:0 auto; padding:64px 32px; min-height:100vh; display:flex; flex-direction:column; justify-content:center; }
/* Envolver el contenido real de cada página en un único .page-inner.
   Esto evita que code-box/case-card/callout/etc. se vuelvan ítems flex
   directos (rompería su page-break-inside:avoid si llegan a desbordar
   a una página siguiente). */
.page-inner { width:100%; }

/* Reglas de paginación — IMPRESCINDIBLES, sin esto el PDF sale roto */
.code-box, .case-card, .cta-box, .callout, .quote {
    page-break-inside: avoid; break-inside: avoid;
}
h2, h3 { page-break-after: avoid; break-after: avoid; }
@media print {
    .page:not(:last-of-type) { page-break-after: always; }
}
</style>
```

Componentes reutilizables ya probados (copiar el CSS de `sistema-ingresos/campanas/guia-claude-periodistas/guias/guia-claude-periodistas.html` o `sistema-ingresos/campanas/guia-claude-periodistas/guias/guia-periodico-digital-ig-fb.html` cuando se necesiten): `.cover` (portada con gradiente radial), `.cover-logo-row`/`.cover-mark`/`.cover-brandname` (lockup de marca, ver siguiente sección), `.toc-list` (tabla de contenidos numerada), `.code-box` (bloque de prompt para copiar, con `.var` para placeholders en cyan), `.case-card` (tarjeta numerada de caso de uso), `.callout` / `.callout-green` (avisos ámbar/verde), `.example-bad` / `.example-good` (comparación lado a lado), `.cta-box` (cierre con oferta), `.device-mockup` (mockup de chat/navegador), `.cal-table` (tabla tipo calendario).

## Logo y marca en la portada (estándar, desde 2026-06-26)

Toda guía nueva debe usar el logo real de Periodistas Digitales en la portada — **no** el placeholder genérico `{ }` que usaron las guías anteriores a esta fecha. El archivo maestro vive en `sistema-ingresos/campanas/guia-claude-periodistas/guias/logo-periodistas-digitales.webp` (PNG con canal alfa real, fondo ya removido). Si la guía se genera en otra carpeta, copiar el PNG ahí también.

Estructura de la portada (lockup logo + nombre de marca, separado del título de la guía):

```html
<section class="cover">
    <div class="cover-logo-row">
        <div class="cover-mark"><img src="logo-periodistas-digitales.png" alt="Periodistas Digitales"></div>
        <div class="cover-brandname">Periodistas Digitales</div>
    </div>
    <div class="cover-body">
        <div class="cover-eyebrow">Guía gratuita</div> <!-- NO repetir "Periodistas Digitales" acá, ya está arriba -->
        <h1>Título de la guía...</h1>
        <p class="cover-sub">Bajada de la guía...</p>
    </div>
    <div class="cover-brand">sistemadeingresosdiariosia.com</div>
</section>
```

```css
.cover-logo-row { display:flex; align-items:center; gap:16px; margin-bottom:40px; }
.cover-mark { width:72px; height:72px; flex-shrink:0; }
.cover-mark img { width:100%; height:100%; object-fit:contain; }
.cover-brandname { font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:1.6rem; color:var(--text); letter-spacing:-.01em; }
```

## Lecciones de la guía anterior (por qué estas reglas existen)

- **`printBackground: true` es obligatorio en Puppeteer** — sin esto, Chrome no imprime fondos oscuros/gradientes y el PDF sale con fondo blanco, rompiendo todo el diseño.
- **Esperar `document.fonts.ready` antes de exportar** — Google Fonts carga async; si se exporta demasiado rápido, el PDF cae a una fuente del sistema.
- **`page-break-inside: avoid` en cada caja** — sin esto, una tarjeta de caso o un bloque de prompt se puede cortar justo en la mitad entre dos páginas.
- **Una idea por `<section class="page">`** — no meter dos temas distintos en la misma sección esperando que el navegador la divida bien; si el contenido es largo, partirlo en 2 secciones (así se hizo con los "10 casos de uso", cada uno en su propia sección).
- **`format: 'Letter'`** (no A4) — la audiencia es Latinoamérica.
- **Siempre QA visual antes de entregar** — la guía anterior pasó por varias rondas de capturas (`audit-page*.png`, `pdf-page*.png`) antes de la versión final. No asumir que la primera exportación está lista para mandar.
- **El centrado vertical (`min-height:100vh` en `.page`) va SIEMPRE, no solo en páginas "cortas"** — la primera versión de esta guía lo aplicó solo a 2 secciones que parecían cortas a simple vista, y Jose encontró el mismo hueco en otras páginas que parecían "llenas" (con `case-card`, listas, tablas) pero tampoco llegaban al alto físico completo de una hoja Letter. Es muy difícil estimar a ojo si un bloque de contenido llena ~1056px reales — más simple y seguro aplicar `.page` (con el centrado) y el wrapper `.page-inner` a TODAS las secciones por igual desde el primer borrador, TOC incluida.
- **Antes de exportar, las capturas de QA en sí no avisan si falta el centrado** — `section.screenshot()` mide el bounding box real del elemento, así que si `.page` tiene `min-height:100vh` aplicado correctamente, la captura YA sale con el alto físico completo (1520×2400 con el viewport/deviceScaleFactor de este script) y se puede confirmar el centrado ahí mismo. Si una captura sale con el contenido pegado arriba y mucho negro abajo, es señal de que esa sección no tiene `min-height:100vh` — no asumir que solo "se ve mal en el PDF final".
- **Cuidado con conjugaciones "vos" filtradas** — el hábito por defecto de la marca es "vos" (`tenés`, `elegí`, `armá`), pero estas guías van en "tú". Antes de exportar la versión final, grepear el HTML por patrones como `ás \b|és \b|í \b|tenés|podés|sabés|querés` para encontrar verbos en "vos" que se cuelan sin querer — pasó varias veces en la guía de IG/FB del 2026-06-26.
- **El escaneo de "vos" tiene tres puntos ciegos que se comió varias rondas el 2026-06-27** — no alcanza con buscar terminaciones `ás/és/ís/á`: (1) los imperativos de verbos `-er`/`-ir` terminan en **`-é` y `-í` pelados** (`hacé`→haz, `repetí`→repite, `conocé`→conoce, `construí`→construye) — incluir `é\b` e `í\b`; (2) los stems cortos no llegan a 3 letras antes de la vocal (`usá`→usa) — no exigir `{3,}` antes de la terminación; (3) las formas al inicio de oración/heading van con **mayúscula** (`Empezá`, `Hacé`, `Tenés`) — el reemplazo tiene que ser case-insensitive preservando la mayúscula. Lo más seguro: un script Python que escanee `\b[A-Za-záéíóúñ]{2,}[áéí]\b` + `(?:ás|és|ís)\b` sobre el texto sin tags, con una whitelist de palabras válidas (`más, además, está, estás, aquí, acá, así, quizás, país, día, café, Panamá, qué, será, ahí`), y reemplace con mapa case-insensitive. Repetir hasta que el scan dé vacío.
- **El lint exige `class="page"` y `class="page-inner"` EXACTOS** — cuenta esos strings literales. Si una sección lleva una clase extra (`class="page chapter"` o `class="page-inner chapter"`), el lint no la cuenta y reporta desbalance página/page-inner. La clase que distingue (ej. aperturas de capítulo) NO puede ir en `.page` ni en `.page-inner`: ponerla en un hijo, o estilar con selectores de hermano sobre un elemento interno (ej. `.chapter-num + h2`, `.chapter-num ~ p`). Pasó el 2026-06-27 con la guía de agentes.

## Tono y copy (heredado de brand-context.mjs)

Español latam, "tú" (no "vos" en estas guías — distinto del resto de la marca, que usa "vos"/"tú" según el producto: revisar `BRAND.audience.language` antes de escribir). Sin claims de ingresos garantizados, sin emojis en exceso, párrafos cortos. Cada prompt completo debe ser copiable tal cual (sin que falte contexto).
