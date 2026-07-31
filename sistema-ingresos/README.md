# sistema-ingresos/ — el curso y todo lo que lo vende

Todo lo del curso **"Sistema de Ingresos Diarios"** (pago único en Hotmart,
US$ 27): las páginas, el contenido, las campañas y las funciones serverless que
lo hacen funcionar.

**Deploy:** Vercel, proyecto `sistema-ingresos-landing` →
`sistemadeingresosdiariosia.com`. Se publica con `vercel --prod` desde la raíz
del repo.

## Mapa

Nada suelto: en la raíz solo están este README y `vercel.json`.

| Carpeta | Qué hay |
|---|---|
| [`paginas/`](paginas/README.md) | Las 5 páginas del sitio + `track.js` + sus imágenes. `index.html` es la home (`/`) |
| [`api/`](api/README.md) | Las 12 funciones serverless. 🔒 No se mueve |
| [`campanas/`](campanas/README.md) | Lo público de cada campaña: su landing, sus guías y sus imágenes |
| [`curso/`](curso/README.md) | El producto principal: 6 módulos, la clase de cierre, quizzes, portadas y el estudio de video |
| [`order-bumps/`](order-bumps/README.md) | Lo que se agrega **en** el checkout |
| [`upsells/`](upsells/README.md) | El OTO de **después** de la compra |
| [`docs/`](docs/README.md) | Cómo funciona la máquina (tracking, recuperación, canales, medición) |
| [`qa/`](qa/README.md) | El test de salud del sitio y sus reportes |

**Cada cosa vive con lo que la usa.** No hay carpetas transversales: las imágenes
de las páginas están en `paginas/img/`, las de una campaña en
`campanas/<campaña>/img/`, y cada guía lleva su propio logo al lado para que su
PDF se pueda exportar sola.

## ⚠️ Acá la URL casi nunca es la ruta del archivo

Es lo primero que hay que entender antes de mover algo. Vercel publica **todo**
lo que cuelga de esta carpeta, y el ruteo está desacoplado de las rutas por los
`rewrites` de [`vercel.json`](vercel.json). Tres consecuencias:

1. **La home es un rewrite.** `/` → `/paginas/index.html`. Sin esa línea, el
   dominio da 404.
2. **Mover un archivo cambia su URL** salvo que se ajuste su rewrite. Varias URLs
   ya salieron por email y WhatsApp (las guías, la página del upsell) y no se
   pueden cambiar.
3. **Lo que no lleva rewrite queda expuesto.** Por eso hay redirects que sacan de
   circulación `/curso/*`, `/order-bumps/*`, `/docs/*.md` y `/campanas/*.{md,html,pdf}`:
   es contenido pago o interno.

Cosa nueva que tenga que verse (página, guía, campaña) = **sumar su rewrite**.

## Antes de deployar, en este orden

```bash
node herramientas/verificar-repo.mjs   # ninguna ruta rota, ninguna URL sin destino
cd sistema-ingresos && vercel dev      # el ruteo real, local — probar con curl
node qa/qa-salud-sitio.mjs             # las 10 páginas en vivo (después del deploy)
```

El primero chequea también el **contrato con Vercel**: que `api/` siga en su
lugar y que cada cron apunte a una función que existe.

## Regla de oro

Cada cambio en una página = correr [`qa/qa-salud-sitio.mjs`](qa/README.md) y
verificar en vivo antes de darlo por bueno. Y re-verificar un rato después:
**Vercel deploya el working tree, no el commit**, así que antes de sacar
conclusiones de una versión hay que confirmar qué está realmente publicado.
