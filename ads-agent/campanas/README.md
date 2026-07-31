# Campañas — cómo se nombran

Convención acordada con Jose el 30/07/2026. Antes había tres criterios mezclados
—`meta-leadgen-guia-claude` nombrada por el imán, `meta-ads-directo` por el objetivo y
las carpetas de `campaigns/` por fecha— y con eso, a la sexta campaña no se encuentra
nada.

## El nombre

```
<canal>-<objetivo>-<segmento>
```

| Slot | Valores | Qué es |
|---|---|---|
| **canal** | `meta` · `google` · `organico` · `email` | Por dónde llega la persona |
| **objetivo** | `leadgen` · `venta` | Si captura el correo o va al checkout |
| **segmento** | `republicadores`, … | **Quién es** la persona |

### La regla que importa: el segmento, nunca el imán

El regalo cambia —una campaña puede tener cuatro guías— y el anuncio cambia. **La
persona a la que le hablás, no.** Por eso el tercer slot es el segmento.

Es el error que arrastra `meta-leadgen-guia-claude`: está nombrada por su imán, así que
el día que esa guía se reemplace, el nombre miente.

## La carpeta

Una por segmento, acá en `ads-agent/campanas/<segmento>/`, con la estrategia:

```
campanas/<segmento>/
  README.md          ← a quién le habla, el ángulo, dónde está cada pieza, las reglas
  COPY.md            ← copy y racional de la landing
  EMBUDO-GUIAS.md    ← problemas del segmento + secuencia de imanes
```

## El nombre interno NO se filtra a las URLs públicas

Lo interno describe a la persona en nuestros términos; lo público le habla a ella.
Un periodista no tiene por qué encontrarse con que lo catalogamos de "republicador"
en la URL desde la que descarga su guía.

| | Interno | Público |
|---|---|---|
| Campaña | `meta-leadgen-republicadores` | — |
| Carpeta | `ads-agent/campanas/republicadores/` | — |
| Landing | — | `/tu-medio` |
| Guía | — | `/guias/que-te-lean-miles.pdf` |

Y hay un beneficio práctico además del cuidado: **se puede renombrar una campaña sin
romper un solo link ni perder atribución**, porque el código interno y la URL no están
atados.

## Dónde vive cada cosa

- **Estrategia** (esto) → `ads-agent/campanas/<segmento>/` — no se deploya
- **Anuncios** → `ads-agent/ads-curso/<matrícula>/ficha.md` — matrícula `adN-angulo`
- **Landings y guías públicas** → `sistema-ingresos/` — es lo único que Vercel publica

## Campañas activas

| Campaña | Segmento | Estado |
|---|---|---|
| `meta-leadgen-republicadores` | El periodista que republica en su perfil noticias de otros | 🟡 En armado — [#106](https://trello.com/c/vFd9rZQ3) |
| `meta-venta-republicadores` | El mismo, para venta directa a `/tu-medio` | 🟡 Landing lista, anuncio `ad4-perfil` sin publicar |
| `meta-leadgen-guia-claude` | (sin definir — nombrada por el imán) | 🟢 Corriendo, 890 leads |
