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

> ⚠️ **Medido en nuestros datos: el `sck` se corta en 255 caracteres.** Como ahí viajan las cookies
> de Facebook, **4 de las 9 ventas con `fbc` lo tienen truncado** y a Meta le llegó un click-id
> inválido. El botón se salva porque va **primero**; lo que se rompe es lo del final. Esto es un bug
> aparte, anotado en la #145 — pero explica por qué el `sck` no tiene lugar para más jerarquía.

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
