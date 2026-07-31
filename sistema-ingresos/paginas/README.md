# paginas — las páginas del sitio y lo que cargan

**Padre:** [`sistema-ingresos/`](../README.md)

| Archivo | URL pública | Qué es |
|---|---|---|
| `index.html` | **`/`** | La landing de ventas. **La página que factura.** |
| `landing.html` | `/landing.html` | Variante de landing |
| `landing-leadgen-v1.html` | `/landing-leadgen-v1.html` | Variante de captura de leads |
| `gracias.html` | `/gracias` | Post-compra: entrega + dispara la conversión |
| `privacidad.html` | `/privacidad` | Política de privacidad |
| `track.js` | `/track.js` | El beacon de tracking que cargan todas |

Y `img/` con lo que muestran.

## ⚠️ La URL no es la ruta del archivo

Ninguna de estas páginas se sirve desde `/paginas/...`. Cada una tiene su rewrite
en [`../vercel.json`](../vercel.json), **incluida la home**:

```json
{ "source": "/", "destination": "/paginas/index.html" }
```

Sin esa línea, `sistemadeingresosdiariosia.com` da 404. Es la más delicada del
archivo. **Página nueva = su rewrite.**

`track.js` conserva la URL `/track.js` a propósito: puede estar cacheado en el
navegador de gente que ya visitó el sitio.

## Por qué las imágenes se referencian con `/paginas/img/...`

Con ruta **absoluta del sitio**, no relativa — y es a propósito.

El navegador resuelve lo relativo contra **la URL que ve**, no contra la ruta
real del archivo. Como `index.html` se sirve en `/`, un `img/x.webp` relativo se
iría a buscar `/img/x.webp`, que no existe. La absoluta funciona igual desde `/`,
desde `/landing.html` y desde `/tu-medio`.

> Las guías hacen lo contrario —referencian su logo **relativo, al lado**— porque
> su HTML además se abre por `file://` al exportar el PDF y al pasar el linter, y
> ahí sí manda la ruta real del archivo. Para que también funcionen servidas, hay
> un rewrite de `/logo-periodistas-digitales.webp`.

## `img/`

- Los `.webp` que muestran las páginas de venta.
- `img/originales/` — los `.png`/`.jpg` **fuente**, que no carga ninguna página.
  El que convierte es `ads-agent/scripts/utiles/comprimir-img-landing.mjs`: lee
  de `originales/` y escribe el `.webp` un nivel arriba. Están separados a
  propósito: si vivieran juntos es cuestión de tiempo que una página termine
  sirviendo el original pesado, y la carga inicial bajó de 13,7 MB a 1,39 MB
  justamente por eso.
- `img/capturas/` — `Checkout (1).png` y `Checkouts.png`, que **no usa nadie**.
  Se pueden borrar sin consecuencia.

La landing de republicadores ([`../campanas/republicadores/`](../campanas/README.md))
reusa estas imágenes porque es un clon de `index.html` con otro copy; solo su
foto propia vive en la carpeta de esa campaña.

## La regla de oro

Cada cambio acá = correr [`../qa/qa-salud-sitio.mjs`](../qa/README.md) y
verificar en vivo. Para probar **antes** de deployar, `vercel dev` levanta el
ruteo real en local.
