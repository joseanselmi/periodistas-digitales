# Microsoft Clarity — mapas de calor + grabaciones de sesión

> Instalado el **2026-07-09** (tarjeta Trello #64). Complementa a GA4 (#63):
> GA4 dice *cuántos* y *de dónde*; Clarity muestra **cómo se comportan** —
> dónde hacen clic, hasta dónde scrollean y grabaciones de sesión anónimas.
> Nace para apoyar la investigación de la **fuga de checkout** (#40): ver con
> los ojos qué hace la gente en la landing antes de irse.

## Datos del proyecto

| Campo | Valor |
|---|---|
| **Project ID** | `v9wfmhebpr` |
| Panel | https://clarity.microsoft.com/projects/view/v9wfmhebpr/dashboard |
| Cuenta | Clarity de Jose (gratis, ilimitado) |
| Dominio | `sistemadeingresosdiariosia.com` |

## Páginas cubiertas (9)

El snippet de Clarity está pegado en el `<head>` de las mismas 9 páginas que
GA4, **justo después del bloque de GA4**:

`index.html`, `landing.html`, `gracias.html`, `landing-leadgen-v1.html`, y las
5 guías `guia-*.html`.

## Convive con GA4 y el Meta Pixel

Los tres corren juntos sin pisarse:
- **Meta Pixel** → optimización de anuncios.
- **GA4** → analítica de tráfico por URL (cuántos, de dónde).
- **Clarity** → comportamiento visual (heatmaps + grabaciones).

## Qué se obtiene y cómo leerlo

En [clarity.microsoft.com](https://clarity.microsoft.com) → proyecto:

- **Heatmaps (mapas de calor)**: menú *Heatmaps*. Elegís una URL y ves:
  - **Click map**: dónde tocan (qué botón/enlace se lleva los clics).
  - **Scroll map**: hasta qué % de la página baja la gente (dónde abandonan).
- **Recordings (grabaciones)**: menú *Recordings*. Videos anónimos de sesiones
  reales — se ve el mouse/scroll de cada visitante. Ideal para detectar dónde
  duda o se frena antes del checkout.
- **Dashboard**: métricas de comportamiento — *dead clicks* (clics que no hacen
  nada), *rage clicks* (clics repetidos de frustración), *scroll depth*, etc.

> ⚠️ **Limitación**: el checkout está en el dominio de Hotmart → Clarity (igual
> que GA4 y el Pixel) **no puede entrar ahí**. Clarity graba toda la landing y
> las guías propias, que es donde arranca la decisión de compra.

> Los datos aparecen en minutos (más rápido que los informes estándar de GA4).

## Cómo agregar Clarity a una página nueva

Pegar este snippet en el `<head>` (una sola vez por página):

```html
<!-- Microsoft Clarity — mapas de calor + grabaciones de sesión — proyecto v9wfmhebpr -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "v9wfmhebpr");
</script>
```

## Deploy

Igual que todo el curso: `vercel --prod` desde `sistema-ingresos/`.
