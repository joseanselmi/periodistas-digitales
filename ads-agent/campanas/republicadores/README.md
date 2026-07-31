# Campaña `republicadores`

**Códigos:** `meta-leadgen-republicadores` (captura) · `meta-venta-republicadores` (venta)
Convención en [../README.md](../README.md).

Primer embudo segmentado del curso. Todo lo de esta campaña vive acá o se nombra
desde acá. Seguimiento en Trello: [#106](https://trello.com/c/vFd9rZQ3).

## A quién le habla

Al **periodista —con oficio o título— que republica en su perfil personal de Facebook
noticias de otros**: lo que vio en el noticiero, lo que levantó de la página de un
diario. No produce la nota: la elige, a veces la reescribe, y la comparte. Todos los
días.

**Se mantiene el filtro de credencial** (decisión de Jose, 30/07): no le hablamos a
cualquiera que comparta noticias, sino al que viene del oficio.

## El ángulo, en una línea

No es que lo vean pocos. Es que **al tocar "compartir", la marca que se ve es la de la
otra página**: le está poniendo su criterio y su constancia a hacerle prensa gratis a
un medio que no le paga.

## Por qué se llama `republicadores`

Porque nombra **la conducta que define al segmento**: republica en su perfil noticias
de otros. No la nombramos por el imán —la guía va a cambiar— ni por el lugar. La
persona es lo único que no cambia.

⚠️ **El nombre es interno.** Lo que ve el lector es `/tu-medio` y
`/guias/que-te-lean-miles.pdf`. Nunca aparece la palabra "republicador" en una URL
pública: describe a la persona en nuestros términos, no en los suyos.

## Las piezas y dónde están

| Pieza | Dónde | Estado |
|---|---|---|
| **Guía imán (PDF)** — lo que descarga el lector | `guias/que-te-lean-miles.pdf` | ✅ 10 páginas |
| Fuente de la guía | `guias/que-te-lean-miles.html` | ✅ |
| **Landing de venta** | `landing/tu-medio.html` → ruta `/tu-medio` | ✅ sin publicar |
| Copy y racional de la landing | `estrategia/COPY.md` | ✅ |
| Mapa de problemas + secuencia de guías | `estrategia/EMBUDO-GUIAS.md` | ✅ |
| **Anuncio de leads** (descarga de la guía) | `ads/ad5-lectores/ficha.md` | 🟡 falta creativo |
| **Anuncio de venta** (a `/tu-medio`) | `ads/ad4-perfil/ficha.md` | 🟡 creativo casi listo |
| Guías 2, 3 y 4 de la secuencia | `guias/` | ⬜ sin escribir |
| Serie de posteos orgánicos | Trello [#107](https://trello.com/c/DOhEmqkI) | ⬜ |

## Métrica del PDF: enviados vs. abiertos

Son dos números distintos y salen de dos lados distintos:

| Qué | De dónde sale |
|---|---|
| **A cuántos se les envió** | Brevo (envíos de la secuencia) + la tabla `leads` |
| **Cuántos lo abrieron** | Tabla `events`, `tipo_evento='pdf_open'`, filtrando por `src` |

**El enlace de descarga va SIEMPRE por el redirector**, nunca al archivo directo:

```
/api/d?file=que-te-lean-miles.pdf&src=<de-donde-viene>
```

`api/d.js` registra la apertura y recién después redirige — imperceptible para quien
hace clic. Un `.pdf` servido como estático **no deja ningún rastro**: ni en los logs de
Vercel ni en la base.

`src` sugeridos: `ad5-lectores` (formulario del anuncio) · `email-r1` (correo de
entrega) · `organico` (la serie de posteos).

> ⚠️ **Por eso no hay ninguna ruta pública directa al PDF.** Había dejado
> `/guias/que-te-lean-miles.pdf` y la saqué: alcanzaba con que alguien enlazara esa
> para que las descargas dejaran de contarse. El único camino es `/api/d`, y las rutas
> internas bajo `/campanas/` están bloqueadas por redirección.
>
> `api/d.js` solo acepta un nombre de archivo suelto (sin carpetas, para que no sirva
> de open-redirect) y redirige a la raíz, así que **cada guía nueva necesita su
> reescritura de raíz** en `vercel.json`. Sin eso, el redirector apunta a un 404.

## Las URLs que ve el lector

Toda la campaña vive en esta carpeta, pero el lector nunca ve su estructura: las
reescrituras de `vercel.json` le muestran direcciones limpias, sin la palabra
"republicadores". Detalle en [../README.md](../README.md). La descarga de la guía:

```
https://sistemadeingresosdiariosia.com/guias/que-te-lean-miles.pdf
```

## Cómo se regenera el PDF

La fuente es el HTML; el PDF se exporta desde ahí, nunca se edita a mano. Con puppeteer
(ya instalado en `ads-agent/`), A4, sin márgenes y con fondos:

```bash
cd ads-agent
node -e "…"   # ver el bloque de export en el historial de la tarjeta #106
```

Dos cosas que rompen el PDF si se tocan sin cuidado:

- **El alto de cada sección.** Cada `.page` tiene `min-height:100vh` y debe entrar en
  A4 (1123 px). Si una sección se pasa, arrastra el corte de todas las siguientes.
  Medir antes de exportar.
- **El `footer`.** Va después del último salto de página, así que solo se lleva una
  hoja entera para una línea de crédito: está oculto en `@media print` y la firma se
  repite al pie de la última sección.

## Reglas de esta campaña

- **Sin cifras de audiencia** en la guía, la landing ni el anuncio. Un número deja
  afuera al que tiene pocos seguidores y pone a la defensiva al que tiene muchos.
- **Nada que meta miedo.** La guía responde "¿no debería abrir una página primero?" por
  ventaja ("vas a llegar con tu gente adentro"), no por amenaza. Asustarlo con el
  arranque en cero es armarle la objeción que después hay que vencer para venderle.
- **El límite con el curso:** la guía *nombra* que el perfil le da la audiencia
  equivocada, pero **no enseña a mudarla**. Mudar la audiencia sin perderla es el
  Módulo 5, y las 4 fuentes de ingreso son el Módulo 4. Eso es lo que se paga.
- **Todo separado y medido:** campaña propia, conjunto propio, `?src` propio, lista
  propia en Brevo. Si se mezcla con el embudo general (890 leads) no se puede leer nada.
