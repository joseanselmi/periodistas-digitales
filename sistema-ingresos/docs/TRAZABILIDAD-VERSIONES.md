# Trazabilidad por versiones — checkout y landing

Sistema para que **todo cambio en el checkout o la landing sea medible y comparable**.
Cada cambio crea una nueva "versión"; las métricas se atribuyen a la versión que estaba
activa en ese momento (por fecha+hora). Se compara por **%** (justo entre ventanas de
distinto largo), no por conteos crudos.

## Tablas (Supabase `periodistas-marketing`)

- **`checkout_versiones`** — 1 fila por versión del checkout. Métricas (curso solo, sin order
  bumps) de la Sales History API de Hotmart sobre la ventana `[vigente_desde, vigente_hasta]`:
  `llegaron`, `pagaron`, `abandonaron`, `completion` (%), `abandonos_usd` / `abandonos_usd_pct`,
  `abandonos_paypal`, `ventas_por_semana`.
  Comparador principal: **`completion`** y **`abandonos_usd_pct`**.
- **`landing_versiones`** — 1 fila por versión de la landing. Métricas de la tabla `events`
  (first-party): `sesiones`, `checkout_clicks` (= pagos iniciados, clic al checkout),
  `tasa_landing_checkout` (%). `scroll_promedio` es diagnóstico de Clarity (solo últimos 3 días,
  no la ventana completa).
  **Desde 19/07/2026 el sync separa por landing:** cuenta SOLO la landing de venta `/`
  (regex `url` raíz `sistemadeingresosdiariosia.com/`), excluyendo la leadgen y otras páginas.
  **Desde 28/07/2026 mide el curso y los extras por separado** (así se ve si una versión trae
  compradores que además suman al carrito):
  | columna | qué es |
  |---|---|
  | `compras` | ventas del curso principal en la ventana |
  | `bumps` | order bumps + upsells vendidos |
  | `attach_pct` | bumps por cada 100 compras (calculada) |
  | `neto_curso_usd` | comisión de Jose por el curso solo |
  | `neto_total_usd` | comisión por curso + bumps/upsells |
  | `neto_por_comprador` | neto total ÷ compras — **cuánto vale un comprador de esta versión** (calculada) |

  La clasificación sale de la tabla **`products` por `tipo`** (`curso_principal`, `order_bump`,
  `upsell`), **nunca por nombre de producto** — así no se rompe al agregar productos nuevos.
  Los `cross_sell` (recomendador de Hotmart: "Máquina de Dinero", "Sala VIP IA", y productos de
  nicho ajeno) quedan **afuera**: no los genera la landing, no le suman mérito a la versión.
  Cuando salga el upsell de $37 se carga en `products` con `tipo = 'upsell'` y entra solo.

  **Comparador principal (orden importa, ver "El clic no es veredicto" abajo):
  (1) `scroll_promedio`, (2) `compras` por día y `neto_por_comprador`, (3) `checkout_clicks`
  SOLO como control.**

`vigente_desde` / `vigente_hasta` son **timestamptz** (fecha+hora). La versión activa tiene
`vigente_hasta = null` y `activa = true`.

### Versiones actuales
- checkout **v1** (con PayPal, 29/06→17/07): completion 26,9%, 89,5% abandonos en USD, 10 por PayPal.
- checkout **v2** (sin PayPal, 17/07→28/07 23:32 UTC): **NO GANÓ.** 4 llegaron / 4 pagaron / 0 abandonaron.
  El completion 100% es un espejismo: lo que se desplomó fue el **volumen que llega** (1,44/día en v1 →
  0,33/día en v2), con tráfico y presupuesto planos y más clics desde la landing. Ventas/semana 2,72 → 2,33.
  Efecto colateral: sin carritos abandonados (`clientes_potenciales` ~0 desde 16/07) la recuperación se
  quedó sin combustible.
- checkout **v3** (PayPal reactivado, 28/07 23:32 UTC→activa): en medición. **Comparar contra v1**, no
  contra v2 (v2 casi no tuvo volumen). Chequeo ~05/08, veredicto ~12/08.
- landing **v1** (baseline, 29/06→19/07 11:30 UTC): 883 sesiones, 51 pagos iniciados, tasa 5,78%,
  8 compras del curso, 3 bumps (attach 37,5%), $26,94 por comprador.
- landing **v2** (barra sticky + hero "reservar cupo" + "Deslizá", 19/07→28/07 23:45 UTC): **NO GANÓ.**
  513 sesiones, 48 clics (**9,36%**, +59% vs v1) y **ventas planas** (0,39 → 0,42/día), 0 bumps,
  $23,84 por comprador. Ver "El clic no es veredicto".
- landing **v3** (identificación con el problema antes que el precio, 29/07 08:14→20/08 08:30 UTC):
  **NO CONCLUYENTE POR MUESTRA** — no es lo mismo que "perdió". 22,4 días, 1.065 sesiones,
  100 clics (9,39%), **8 compras, 5 bumps, $29,16 por comprador**.
  Ventas/día 0,39 (v1) / 0,42 (v2) / **0,36 (v3)**: la diferencia son 1-2 ventas en tres
  semanas, o sea ruido. Donde v3 **sí** se despega es en la plata por comprador — el más alto
  de las tres — y en el attach de bumps (**62,5%** contra 37,5% en v1 y 0% en v2). Lectura:
  no trajo más compradores, trajo compradores que agregan al carrito. El clic al checkout
  quedó igual que v2 (9,36% → 9,39%), confirmando que ese número solo sirve de control.
  Deploy `dpl_Brm2YgdtqP8ukLwdJFpJt2dfPLVr`, commit `497ee51`.
- landing **v4** (una sola sección antes del precio, 20/08 08:30 UTC→activa): **en medición.**
  Las dos secciones consecutivas que contaban lo mismo se fusionaron en una: los 3 pasos de
  "EL MECANISMO ÚNICO" eran los módulos 01, 02 y 04 de "LO QUE RECIBES" escritos distinto.
  **De la sección vieja no se perdió nada**: la imagen del stack y el nombre del mecanismo
  bajaron al encabezado de los módulos, y la caja "¿Por qué funciona para periodistas?"
  (credibilidad y criterio) quedó antes del botón. Los 6 botones de checkout **idénticos byte
  a byte**. Medido con Chrome headless sobre la página real, **móvil 412px**:
  scroll hasta el precio **12.636 → 11.538px (-1.098px, ~1,2 pantallas)**, alto total -7,3%,
  HTML 82.073 → 79.354 bytes. Escritorio: -668px hasta el precio.
  **Veredicto ~29/08 por COMPORTAMIENTO en Clarity** (scroll y tiempo hasta el precio), no por
  ventas: v3 acaba de demostrar que 8 compras en 22 días no alcanzan para declarar ganadora.
  Deploy `dpl_AkTWLMynqUJKPF2DqURLDAphkt4H`, commit `456d52c`. Tarjeta #147.

### El clic no es veredicto (aprendizaje de landing v2, 28/07/2026)

La v2 sumó un segundo camino al checkout (barra sticky) y el botón del hero apuntaba a `#bonos`:
un **atajo del titular directo a los bonos y el precio**. Resultado: los clics al checkout subieron
de 5,90% a 9,36% (+59%) y **las ventas no se movieron** (0,39 → 0,42/día, presupuesto de ads igual).
**31 de los 49 clics llegaron con `#bonos` en la URL** — o sea, sin pasar por el problema, el
mecanismo, los módulos ni el instructor. Además esos compradores no agregaron un solo bump
(attach 37,5% en v1 → 0% en v2; con 4 compradores es sugerente, no concluyente).

**Regla que queda:** más gente viendo el checkout ≠ mejor landing. Primero tienen que entender el
problema e identificarse. El veredicto de una versión se escribe con **scroll → ventas/día y neto
por comprador**; el clic al checkout solo sirve de control (si sube y las ventas no, es ruido).
La v3 corrige el atajo: el botón del hero lleva a `#problema` y el H1 le habla al periodista
("Sabés hacer periodismo. Nadie te enseñó a vivir de él online") en vez de describir el producto.

### Antes de analizar una versión: verificar qué está EN VIVO

`vercel --prod` deploya el **working tree**, no el último commit. El 28/07 apareció una reescritura
completa de `index.html` sin commitear que **no** estaba deployada — si se la hubiera dado por viva,
todo el análisis de v2 habría sido falso. Chequeo de 10 segundos antes de sacar conclusiones:

```bash
curl -s https://sistemadeingresosdiariosia.com/ | grep -o '<h1>.*</h1>'
```

## Actualización diaria automática

- Lógica: `api/_lib/versiones-sync.js` → `runVersionesSync()`. Mide la versión **activa** del
  checkout contra Hotmart y actualiza su fila; la landing la actualiza la función SQL
  `sync_landing_versiones()` (cuenta `events`).
- **No tiene endpoint ni cron propio** (Vercel Hobby topa en 12 funciones serverless y 2 crons,
  ambos al límite). Se cuelga del cron de `api/recuperacion.js` (15:00 UTC diario), best-effort,
  junto a hotmart-sync / meta-sync / sync-estados.

## Medición manual (para veredictos)

Script solo-lectura, mide el checkout del curso por rango:

```bash
cd ads-agent
node --env-file=.env.local scripts/datos/checkout-trazabilidad.mjs --desde=2026-07-17 [--hasta=2026-07-31]
```

## Regla permanente

Ningún cambio de checkout o landing entra sin: (1) crear su versión, (2) congelar el "antes",
(3) medir el "después", (4) escribir el veredicto. Siempre número contra número.

### ⚠️ Un ARREGLO no lleva veredicto — se verifica y se cierra (Jose, 20/08/2026)

**El veredicto es para cambios de CRITERIO, no para correcciones de defectos.** La diferencia
es una sola pregunta: **¿existe un resultado que nos haría volver atrás?**

- **Sí existe → es una apuesta, lleva veredicto.** "¿Este titular convence más?" — si el
  número dice que no, se vuelve al anterior. Ahí medir tiene sentido.
- **No existe → es un arreglo, se verifica.** La landing v4 sacó dos secciones consecutivas
  que contaban lo mismo. **Ningún número volvería aceptable el duplicado**, así que no hay
  nada que decidir: la tarjeta #147 tenía un paso de "veredicto a los 7-10 días" que la
  bloqueaba nueve días para una respuesta que no iba a cambiar nada.

**La versión se crea igual**, aunque no lleve veredicto: marca el corte en el tiempo y sin
ella las métricas de la versión siguiente se atribuyen mal. Lo que cambia es el paso 4: en
vez de un veredicto va **la verificación de que la corrección quedó bien** (en vivo, contra la
fuente, sin restos huérfanos).

Forzar un veredicto donde no corresponde no es sólo perder tiempo: **invita a leer como
resultado un número que se movió por otra causa** — justo el caso de abajo.

### ⛔ `checkout_clicks` y `clics_checkout` NO son la misma métrica (01/09/2026)

Dos nombres casi iguales para dos cosas distintas, en la misma pantalla:

| dónde | qué cuenta | v3 | v4 |
|---|---|---|---|
| `landing_versiones.checkout_clicks` (la foto) | **sesiones que clickearon** | 100 | 40 |
| `v_landing_panel.clics_checkout` (el vivo) | **clics totales** | 109 | 48 |

Una persona que clickea tres veces es **1** en la columna y **3** en la vista. La columna la
venían llenando así v1 (51), v2 (48) y v3 (100); el 31/08 se le escribió a v4 el total (48) y
quedó comparando contra v3 una mejora que no existía: **12,34% contra 9,39%, cuando con el mismo
criterio es 10,28% contra 9,52%** — de casi 3 puntos a menos de uno, que es ruido.

**Antes de comparar dos versiones, verificar que las dos columnas se hayan llenado con el mismo
criterio.** No alcanza con que el número sea plausible: los dos lo eran.

⚠️ La columna de la foto sigue el criterio de v1-v3 (**sesiones**) y no se toca. Si alguna vez se
unifica con la vista, hay que reescribir también los veredictos de v2 y v3, que están redactados
con esos números.

### ⛔ Un cambio que entra SIN versión no se pierde: contamina la versión abierta (31/08/2026)

El 28/08 entraron los testimonios nuevos y **nadie creó la versión**. La v4 seguía abierta desde
el 20/08, así que durante tres días estuvo midiendo **dos landings distintas sumadas**, y su
número se movía por una causa que su propia ficha no nombraba.

El daño no es "faltó documentar". Es que **el número existía y se leía bien**: v4 marcaba 573
sesiones y 58 clics, cifras perfectamente creíbles que no eran de ninguna landing en particular.

**Cómo se recorta una versión contaminada** (hecho el 31/08 para v4 → v5):

1. `landing_versiones.vigente_hasta` de la vieja = el momento del cambio. **La resta la hace
   sola `v_landing_panel`**, que calcula todo entre `vigente_desde` y `vigente_hasta`; no hay
   que restar a mano en ningún lado.
2. Congelar en la fila de la vieja los valores ya recortados (son la foto; la vista es el vivo).
3. **El día del cambio queda AFUERA de las dos versiones.** Ese día sirvió las dos landings y no
   se puede atribuir. Un hueco declarado es peor que nada, pero mucho mejor que un número que
   miente. Escribirlo en la `nota` de las dos, o el hueco se lee como datos perdidos.

⚠️ **Y hace falta la fecha del DEPLOY, no la del commit.** No son lo mismo y la del deploy no
está en el repo: los logs de Vercel duran 1 hora y sin token de la API no hay dónde mirarla.
Cuando no se puede confirmar, el corte va al **día siguiente completo** (el conservador) y el
supuesto se escribe en la `nota`.

### ⛔ Meta reporta el MISMO evento bajo varios nombres — sumarlos multiplica (31/08/2026)

`meta_insights_diario` venía con **pagos iniciados al doble y compras al triple**, todos los días
desde el 29/06. 95 filas, 468 pagos iniciados donde había 234, y 63 compras donde había 21.

La causa: `sumAction()` en
[meta-embudo-diario-por-anuncio.mjs](../../ads-agent/scripts/datos/meta-embudo-diario-por-anuncio.mjs)
recibía varios `action_type` y los **sumaba**. Pero Meta devuelve el mismo evento repetido bajo
un nombre específico del píxel y varios agregados que ya lo contienen. Medido contra la API el
31/08 sobre `ad1-fomo` del 27/08:

```
initiate_checkout                              5
offsite_conversion.fb_pixel_initiate_checkout  5   ← los MISMOS 5
purchase                                       1
offsite_conversion.fb_pixel_purchase           1   ← la MISMA 1
onsite_web_purchase                            1   ← la MISMA 1
```

**La huella se veía sin abrir el código: 31 días seguidos de `pagos_iniciados` sin un solo número
impar** (probabilidad ~1 en mil millones). Una columna de enteros que nunca es impar está
multiplicada, y eso se puede chequear con una consulta de una línea:

```sql
select count(*) filter (where pagos_iniciados % 2 = 1) from meta_insights_diario;  -- 0 = sospechoso
```

**Regla que queda: una métrica, UN `action_type`.** Si algún día hacen falta compras que no pasen
por el píxel, va una **columna nueva**, nunca otro sumando en la misma. Es el mismo principio de
un solo dueño por dato.

**Consecuencia de haberlo creído:** durante dos meses el embudo de Meta dijo que la landing
convertía la mitad de bien de lo que convertía (el doble de pagos iniciados para las mismas
compras), y que había 3 ventas donde había 1. Corregido en la tabla y en el script el 31/08.

### ⛔ El scroll de Clarity es un PORCENTAJE DE LA ALTURA: acortar la página lo sube solo

`clarity_diario.scroll_promedio` sale de `ScrollDepth.averageScrollDepth`, que es el porcentaje
de la **altura de la página** al que se llegó. Entonces **cualquier cambio que acorte la
página sube ese número sin que nadie lea una línea más.**

La v4 acortó la página un 7,3% → el scroll % sube ~2,3 puntos por pura aritmética.

**Para comparar dos versiones de distinta altura hay que usar el scroll ABSOLUTO:**

```
scroll_absoluto_px = scroll_promedio_% x altura_de_la_pagina_px
v3: 29,26% x 15.117px = 4.423px    (movil 412px)
v4: empata en 31,55% — recien por encima de eso hay mejora real
```

**Y antes de leer cualquier diferencia, mirar el ruido.** El scroll diario de v3 fue de 17,47%
a 41,67% (desvío **6,12** sobre 13 días continuos). Con 9 días el promedio se mueve **±2,04
solo por azar**, y hace falta un salto de **~6-8 puntos** para distinguir algo. Un efecto
esperado del tamaño del ruido no se puede medir con esta muestra: eso se escribe como **"no
concluyente"**, que es una respuesta válida y distinta de "perdió".

⚠️ **`landing_versiones.scroll_promedio` se llenaba con una foto de 3 días** de la API de
Clarity (lo único que devuelve), no con el promedio de la ventana — por eso v3 decía 31,78%
cuando su promedio real era 29,26%. Desde que existe `clarity_diario` (07/08/2026) cada
versión se cierra con el promedio de **su** ventana. Corregido el 20/08.

## Cómo se ven las sesiones (Clarity + GA4, medido 28/07/2026)

Contexto obligatorio para leer cualquier veredicto de landing: **82% del tráfico entra por el
navegador in-app de Facebook/Instagram** y **84% es móvil** — webview lento, sin cookies
compartidas, autofill roto, y ahí adentro se abre el checkout de Hotmart. Scroll promedio 31,8%,
79 s activos, 1,19 páginas por sesión, rebote 76%, dead clicks 11,8% (sospechoso: el hero 3D de
Spline parece interactivo y no lo es). Escritorio engancha el doble que móvil (39% vs 21% de
sesiones con engagement) pero es solo el 21% del tráfico. Instagram rinde la mitad que Facebook
(18% vs 27%). Estados Unidos = 12% del tráfico sin ventas.

⚠️ **Las sesiones de GA4 no son comparables antes/después del 19/07** (GA4 pasó de 26 a 52
sesiones/día mientras `events` y Meta quedaron planos: capturaba mal, no es que subió el tráfico).
Para todo antes/después usar `events`. GA4 sirve para el corte por dispositivo, origen y país.

```bash
cd ads-agent
node --env-file=.env.local scripts/datos/fetch-clarity.mjs --days=3   # scroll, dead clicks, navegador, país
node --env-file=.env.local scripts/datos/fetch-ga4.mjs --days=10      # vistas por página
```

## Cambio ya cerrado: PayPal OFF (v2 checkout, 17/07)

**Diagnóstico:** de 26 transacciones que llegaron al checkout (curso, 29/06→17/07), 7 pagaron y
19 abandonaron, con **0 rechazos de tarjeta**. Los que pagaron usaron **moneda local**; 17 de 19
abandonos fueron en **USD**, y **PayPal (siempre USD) fue el mayor bucket: 10 abandonos y 0 ventas**.
**Acción:** apagado PayPal en la config de pagos de Hotmart (único cambio) + logo de PayPal fuera
del banner. NO se prende boleto/efectivo (enfría la compra de impulso, comprobado por Jose).
La moneda local ya funciona (verificado con VPN de Argentina: muestra ARS).
**Veredicto (28/07):** **perdió.** En 12 días llegaron 4 y pagaron 4 — el completion "100%" tapa que
el volumen que llega al checkout se cayó a un cuarto (1,44 → 0,33/día) y que las ventas/semana
bajaron (2,72 → 2,33). Hipótesis: los que abandonaban eran justamente los de PayPal; sacarlo no
hizo comprar a nadie más, solo borró los abandonos — y con ellos el combustible de la recuperación
de carritos. **Acción:** Jose reactivó PayPal el 28/07 → nace checkout v3.
**Pendiente chico:** confirmar en la config de pagos de Hotmart si BILLET/efectivo quedó prendido
(entre los 4 pagos de v2 apareció 1 `BILLET [MXN]`, y se creía apagado).
