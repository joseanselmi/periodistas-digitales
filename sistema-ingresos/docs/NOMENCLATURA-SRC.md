# Nomenclatura de `src` y `sck` — el estándar

**Para qué existe.** Que mirando una venta en Hotmart se sepa **de dónde salió**, sin cruzar nada
con nadie. Y que dentro de un año, con muchas más cosas andando a la vez, se pueda contestar la
única pregunta que importa: **qué trae las ventas de verdad.**

Tarjeta: **#145**. Decidido el 19/08/2026.

## El problema que resuelve, con los números de hoy

Las **33 ventas** registradas tienen sólo **tres** valores de `src`:

| `src` | ventas | qué dice |
|---|---|---|
| `ad1-fomo` | 17 | el anuncio. Es el único que informa algo. |
| `Landing-page-1` | 10 | **nada**: es el valor por defecto de los botones, o sea "entró sin origen". |
| *(vacío)* | 6 | nada. |

Y los **6 botones de compra tenían todos `sck=b2`**. La intención de identificar el botón estaba en
el código desde el principio; los seis decían lo mismo, así que en 33 ventas **no se sabe dónde
clicó una sola persona**.

## Lo que Hotmart permite (verificado en su central de ayuda, 19/08/2026)

- **30 caracteres** por código.
- **El guion bajo `_` está PROHIBIDO** — reservado para uso interno del sistema.
- El pipe `|` está permitido y es el que ellos sugieren para organizar datos.
- `SRC` y `SCK` son **dos pestañas distintas** del Dashboard de Origen de Ventas: son dos columnas,
  no una. Por eso el estándar usa las dos.

> ⚠️ **Medido en nuestros datos: el `sck` se corta en 255 caracteres.** Ahí viajaban las cookies
> de Facebook, y **4 de las 9 ventas con `fbc` lo tenían truncado**: a Meta le llegaba un click-id
> inválido y no podía atribuir esas compras. El botón se salvaba porque va **primero**; lo que se
> rompía era el final. Explica por qué el `sck` no tiene lugar para más jerarquía.
>
> **Arreglado el 19/08/2026** — ver "El `fbc` ya no viaja por la URL" más abajo.

## El estándar

```
src = canal - origen - pieza          ¿DE DÓNDE vino?     (lo pone el link de origen)
sck = boton                           ¿QUÉ BOTÓN tocó?    (lo pone la página, nadie lo pisa)
```

**Separador: el guion `-`.** Está probado con datos reales (`ad1-fomo`, 17 ventas) y no necesita
codificarse en la URL. Como el guion **separa niveles**, ningún nivel puede llevar guion adentro:
`ad1-fomo` pasa a ser `ad-fomo-a1`.

### Los niveles, y cuántos usar

**Se usan sólo los niveles que hagan falta.** Un anuncio que va derecho al checkout no tiene pieza
intermedia: son dos niveles y se termina. Un mail sí: es la campaña, y adentro un mail concreto.

| Nivel | Qué es | Valores |
|---|---|---|
| 1 · **canal** | siempre | `ad` (Meta pago) · `em` (email) · `wa` · `og` (orgánico) · `pdf` (guía) · `dir` (directo, sin origen) |
| 2 · **origen** | casi siempre | la campaña o el flujo: `fomo`, `lectores`, `comunidad`, `guias`, `recup`, `landing` |
| 3 · **pieza** | sólo si el origen tiene varias | el anuncio (`a1`, `a5`) o el número de mail (`03`) o su nombre (`oferta`) |

```
ad-fomo-a1         anuncio a1 de la campaña fomo
ad-lectores-a5     anuncio a5 de republicadores
em-comunidad-03    mail 3 del semanal de la comunidad
em-guias-oferta    el mail de oferta del embudo de regalos
em-manifiesto      la tanda única (no tiene piezas: dos niveles alcanzan)
wa-recup-1         primer mensaje de recuperación
pdf-regalo4        el link dentro de la guía 4
dir-landing        entró a la landing sin ningún origen
```

### El botón (`sck`)

Los seis botones de la landing, cada uno con su nombre — **de arriba hacia abajo**:

| `sck` | dónde está |
|---|---|
| `dolor` | al final de la sección del problema |
| `bonos` | después de los tres bonos |
| `precio` | en el bloque de precio |
| `cierre` | en el cierre final |
| `pie` | el link de texto del pie |
| `sticky` | la barra fija que aparece al llegar a los regalos |

**El `sck` de la URL ya no pisa al del botón** (`applyAdAttribution` en `index.html`). Esa era la
razón de que las 33 ventas dijeran `b2`: cualquier `?sck=` de un mail lo sobreescribía.

Al hacer clic, la página le anexa las cookies de Facebook: `precio~fbp:...~fbc:...`. El botón queda
primero para que sobreviva al corte de 255.

## El `fbc` ya no viaja por la URL

**El problema.** Un `fbc` cortado no es "un poco menos preciso": es un click-id **inválido**, y Meta
descarta la atribución entera. Da igual que falten tres caracteres o cien. Con el `sck` topeado en
255 y un `fbc` que llega a 231 él solo, no entraba.

**Cómo quedó:**

| | Qué viaja | Cuánto mide |
|---|---|---|
| `sck` de la URL | `<botón>~fbp:<fbp>` | 49 caracteres como máximo |
| `sck` de la URL, si el `fbc` entra entero | `+ ~fbc:<fbc>` | sólo si el total queda ≤ 250 |
| si no entra | nada — lo recupera el webhook | — |

El `fbp` mide 37 caracteres como mucho, así que **entra siempre**. Y es la llave: `api/hotmart.js`
(`fbcDesdeEvents`) busca en la tabla `events` el `fbc` **completo** — el beacon del navegador
(`paginas/track.js`) lo guarda ahí sin límite de largo — y lo usa tanto para el evento que va a Meta
como para la fila que queda guardada.

**Por qué se cruza por `fbp` y no por email:** las filas de `events` son **anónimas**. No tienen
email ni `transaction_id`, así que no hay por dónde cruzarlas con la venta. El `fbp` es la única
llave común. Verificado sobre las 9 ventas con `fbc`: en las 5 que **no** estaban truncadas, el
`fbc` que devuelve esta búsqueda es idéntico al que había llegado por la URL.

Un `fbc` que igual llegue truncado (sck en el tope y sin match en `events`) **se descarta**: mandarle
a Meta un click-id roto es peor que no mandarle ninguno.

## Cómo se genera (para no escribirlos a mano)

```bash
cd ads-agent
node scripts/utiles/src.mjs em comunidad 03        # → em-comunidad-03 + el link listo
node scripts/utiles/src.mjs --revisar em-Comunidad_3   # → dice qué está mal
```

Valida las cuatro cosas que Hotmart rompe en silencio: los 30 caracteres, el guion bajo, las
mayúsculas y los niveles vacíos.

## Reglas

1. **Un `src` nuevo se genera con el script, no se inventa.** Dos personas escribiendo a mano
   producen `Email-Manifiesto` y `em-manifiesto` para lo mismo, y eso ya pasó.
2. **Nunca en mayúsculas.** Hoy conviven `Email-Regalo1` y `ad1-fomo`; los reportes los ordenan como
   si fueran cosas distintas.
3. **El histórico no se pisa.** Los `src` viejos se dejan como están: una venta de julio tiene que
   seguir diciendo lo que decía. La tabla de equivalencias está abajo.
4. **Un `src` nuevo se anota acá el mismo día que se usa.** Si no está en esta tabla, dentro de seis
   meses nadie va a saber qué era.

## Equivalencias con lo viejo

| Antes | Ahora | Nota |
|---|---|---|
| `ad1-fomo` | `ad-fomo-a1` | 17 ventas con el nombre viejo. No se tocan. |
| `ad5-lectores` | `ad-lectores-a5` | |
| `ad1-fomo-coment` | `ad-fomo-a1-coment` | el comentario del anuncio |
| `Landing-page-1` | `dir-landing` | 10 ventas. El nombre viejo decía la página, no el origen. |
| `Email-Regalo1` … `Email-Regalo5` | `em-guias-r1` … `em-guias-r5` | |
| `Email-Oferta` | `em-guias-oferta` | |
| `Email-Manifiesto` | `em-manifiesto` | |
| `Email-Republicadores-R1` | `em-lectores-r1` | |
| `WhatsApp-Regalo3` | `wa-guias-r3` | el canal está cerrado; queda por el histórico |
| `Email-Comunidad-01` | `em-comunidad-01` | el canal nuevo arranca ya con el estándar |
| `Email-Regalo2` | `em-guias-r2` | |
| `Email-Oferta2` | `em-guias-oferta2` | |
| `Email-Republicadores-fix` | `em-lectores-fix` | |
| `WhatsApp-Reenvio` | `wa-reenvio` | el asistente reenvía el link; recibir sigue vivo |
| `PDF-Regalo4` | `pdf-regalo4` | el link dentro de la guía de los 5 pilares |
| `guia-lectores` | `pdf-lectores` | el link dentro de "Que te lean miles" |
| `Landing-tu-medio` | `dir-tumedio` | la landing de republicadores (`/tu-medio`) |
| `LeadGen-1USD` | `dir-leadgen` | landing sin tráfico desde el 03/07: queda por prolijidad |
| `recup-abandono` | `em-recup-abandono` | recuperación de carritos — **sale por email**, no por WhatsApp |
| `recup-rechazo` | `em-recup-rechazo` | ídem: el `_lib/wa.js` que los define alimenta a `recup-email.js` |
| `ad4` / `ad4-perfil` | `ad-lectores-a4` | el anuncio de republicadores |
| `wa-asistente` | `wa-asistente` | ya cumplía: no se toca |

Aplicadas al código el 19/08/2026 (50 reemplazos en 15 archivos). **El histórico no se pisó:** las
filas ya guardadas siguen diciendo lo que decían; sólo cambia lo que se manda de acá en adelante.

## Que no se degrade

`node herramientas/verificar-repo.mjs` recorre todos los `src=` escritos en el código y los pasa por
**el mismo validador** que usa el generador (`ads-agent/scripts/utiles/src.mjs`, que exporta
`revisar()`). No se reimplementa el criterio en dos lados a propósito: dos copias terminan diciendo
cosas distintas, que es exactamente cómo se llegó a tener cinco formas de escribir lo mismo.

Sólo mira el código, no los `.md`: esta tabla nombra los valores viejos para documentarlos, y
marcarlos sería pedirle a la documentación que mienta.
