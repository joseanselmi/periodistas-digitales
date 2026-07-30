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
- landing **v3** (identificación con el problema antes que el precio, 28/07 23:45 UTC→activa):
  en medición. Deploy `dpl_Brm2YgdtqP8ukLwdJFpJt2dfPLVr`, commit `497ee51`.
  Chequeo ~05/08, veredicto ~12/08.

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
node --env-file=.env.local checkout-trazabilidad.mjs --desde=2026-07-17 [--hasta=2026-07-31]
```

## Regla permanente

Ningún cambio de checkout o landing entra sin: (1) crear su versión, (2) congelar el "antes",
(3) medir el "después", (4) escribir el veredicto. Siempre número contra número.

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
node --env-file=.env.local fetch-clarity.mjs --days=3   # scroll, dead clicks, navegador, país
node --env-file=.env.local fetch-ga4.mjs --days=10      # vistas por página
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
