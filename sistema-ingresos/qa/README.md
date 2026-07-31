# qa — test de salud del sitio

**Padre:** [`sistema-ingresos/`](../README.md)

```bash
cd sistema-ingresos
node qa/qa-salud-sitio.mjs
```

Pega contra el **sitio en vivo** y revisa las 10 páginas: velocidad (TTFB, peso,
cantidad de assets) y que ningún botón o link esté roto, **incluido el checkout**.

Deja dos archivos acá al lado:

- `reporte-salud-sitio.md` — para leer.
- `reporte-salud-sitio.json` — para que lo consuma otra cosa.

Se regeneran en cada corrida: no se editan a mano.

## Cuándo correrlo

**Después de cada cambio en una página**, y de nuevo un rato más tarde. Dos
detalles que se pagan caro si se olvidan:

1. **Vercel deploya el working tree, no el commit.** Antes de analizar una
   versión hay que chequear qué está realmente en vivo.
2. Este script mira **producción**. Si el cambio todavía no se deployó, lo que
   reporta es la versión anterior — sano no significa que tu cambio esté bien.

Para probar cambios **antes** de deployar, levantar el sitio local con el ruteo
real (rewrites y redirects incluidos):

```bash
cd sistema-ingresos && vercel dev
```

Y para chequear que no quedaron rutas rotas en el repo,
`node herramientas/verificar-repo.mjs` desde la raíz.

## Relacionado

El 5º flujo de [`../api/salud.js`](../api/README.md) hace este mismo chequeo
desde la nube y lo suma al panel diario.
