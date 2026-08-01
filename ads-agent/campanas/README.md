# Campañas — cómo se nombran

Convención acordada con Jose el 30/07/2026. Antes había tres criterios mezclados
—`meta-leadgen-guia-claude` nombrada por el imán, `meta-ads-directo` por el objetivo y
las carpetas de `campanas/` por fecha— y con eso, a la sexta campaña no se encuentra
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

Una por campaña, acá en `ads-agent/campanas/<campaña>/`, con **todo lo suyo
adentro** — incluidos sus anuncios:

```
campanas/<campaña>/
  README.md          ← a quién le habla, el ángulo, el estado de cada pieza
  COPY.md            ← copy y racional de la landing
  EMBUDO-GUIAS.md    ← problemas del segmento + secuencia de imanes
  ads/               ← una carpeta por anuncio: <matrícula>/ficha.md + creativo
```

> **Los anuncios van adentro de su campaña, no en una carpeta aparte.**
> Hasta el 2026-08-01 vivían todos juntos en `ads-agent/ads-curso/`, que era
> transversal: para saber de qué campaña era un anuncio había que abrir su ficha.
> Ahora la carpeta lo dice. Misma regla que las imágenes: cada cosa con lo que la
> usa, nada en un cajón compartido.

Y `historico/` guarda las campañas viejas por fecha, del esquema anterior.

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
- **Anuncios** → `ads-agent/campanas/<campaña>/ads/<matrícula>/ficha.md` — matrícula `adN-angulo`
- **Landings y guías públicas** → `sistema-ingresos/` — es lo único que Vercel publica

## Campañas activas

| Campaña | Segmento | Estado |
|---|---|---|
| `meta-leadgen-republicadores` | El periodista que republica en su perfil noticias de otros | 🟡 En armado — [#106](https://trello.com/c/vFd9rZQ3) |
| `meta-venta-republicadores` | El mismo, para venta directa a `/tu-medio` | 🟡 Landing lista, anuncio `ad4-perfil` sin publicar |
| `meta-leadgen-guia-claude` | (sin definir — nombrada por el imán) | 🟢 Corriendo, 890 leads |
