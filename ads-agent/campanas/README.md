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
| Guía | — | `/api/d?file=que-te-lean-miles.pdf&src=<origen>` |

Y hay un beneficio práctico además del cuidado: **se puede renombrar una campaña sin
romper un solo link ni perder atribución**, porque el código interno y la URL no están
atados.

## Dónde vive cada cosa

- **Estrategia** (esto) → `ads-agent/campanas/<segmento>/` — no se deploya
- **Anuncios** → `ads-agent/campanas/<campaña>/ads/<matrícula>/ficha.md` — matrícula `adN-angulo`
- **Landings y guías públicas** → `sistema-ingresos/` — es lo único que Vercel publica

## Qué está corriendo hoy

**Verificado contra Meta el 2026-08-01** (`datos/meta-exports/meta-export-2026-08-01.json`).
Esta tabla se saca de ahí, **no de memoria**: para refrescarla,
`cd ads-agent && node scripts/datos/fetch-meta.mjs`.

| Nombre en Meta | Carpeta | Estado real | Presupuesto |
|---|---|---|---|
| `CURSO Periodistas — LEADS — republicadores` | [`republicadores/`](republicadores/README.md) | 🟢 **Activa** desde el 31/07 · anuncio `ad5-lectores` | $1/día |
| `Curso Sistema de ingresos diarios… VENTAS - Junio 2026` | [`venta-curso/`](venta-curso/README.md) | 🟢 **Activa** desde el 29/06 · `ad1-fomo` corriendo, `ad3-mundial` pausado | $10/día |
| `LEADGEN \| Guía Claude Periodistas \| $1d \| 2026-06` | [`historico/`](historico/README.md) | ⏸️ **Pausada** · dejó 890 leads y el embudo de email sigue andando | — |
| `interacción` | ⚠️ **ninguna** | 🟢 **Activa desde diciembre de 2024, a propósito** · dos conjuntos prendidos (`Calentamiento 1`, `Interacción`) | $2/día |

Total: **~$13/día**.

> ⛔ **`interacción` está prendida a propósito. NO proponer apagarla.** No vende
> ni junta leads: hace crecer la página de a poco y le muestra a Meta una cuenta
> con actividad sostenida. Es un **costo fijo de marca**, del mismo tipo que el
> hosting — no se juzga contra las ventas de la semana.
>
> Ya se marcó como "fuga de plata" tres veces en tres sesiones distintas, y las
> tres veces la respuesta fue la misma. Lo que falta no es una decisión: es
> **darle su carpeta con su ficha**, para que deje de aparecer como sorpresa cada
> vez que alguien mira el gasto. Una alarma que salta por algo ya decidido se
> vuelve ruido que nadie lee.
>
> Lo único abierto de esa campaña es su anuncio `V1 15/12/25 1USD`: ~$30 por mes
> para **1 clic** en 30 días. Ese sí es candidato a apagar, y es independiente de
> mantener viva la campaña.
>
> Hasta el 2026-08-01 esta tabla daba a republicadores como "en armado" y a
> guía-claude como "corriendo": exactamente al revés de la realidad, y sin
> mencionar `venta-curso`, que es la que más gasta.
