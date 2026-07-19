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
  `compras` (de la tabla `ventas` en la ventana), `tasa_landing_checkout` (%). `scroll_promedio`
  es diagnóstico de Clarity (solo últimos 3 días, no la ventana completa).
  **Desde 19/07/2026 el sync separa por landing:** cuenta SOLO la landing de venta `/`
  (regex `url` raíz `sistemadeingresosdiariosia.com/`), excluyendo la leadgen y otras páginas.
  Comparador principal: **`tasa_landing_checkout`** y **`compras`**.

`vigente_desde` / `vigente_hasta` son **timestamptz** (fecha+hora). La versión activa tiene
`vigente_hasta = null` y `activa = true`.

### Versiones actuales
- checkout **v1** (con PayPal, 29/06→17/07): completion 26,9%, 89,5% abandonos en USD, 10 por PayPal.
- checkout **v2** (sin PayPal, 17/07→activa): en medición.
- landing **v1** (baseline, 29/06→19/07 11:30 UTC): 883 sesiones, 51 pagos iniciados, 14 compras, tasa 5,78%.
- landing **v2** (barra sticky de compra + hero "reservar cupo" + "Deslizá", 19/07→activa): en medición.

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

## Cambio en curso: PayPal OFF (v2 checkout, 17/07)

**Diagnóstico:** de 26 transacciones que llegaron al checkout (curso, 29/06→17/07), 7 pagaron y
19 abandonaron, con **0 rechazos de tarjeta**. Los que pagaron usaron **moneda local**; 17 de 19
abandonos fueron en **USD**, y **PayPal (siempre USD) fue el mayor bucket: 10 abandonos y 0 ventas**.
**Acción:** apagado PayPal en la config de pagos de Hotmart (único cambio) + logo de PayPal fuera
del banner. NO se prende boleto/efectivo (enfría la compra de impulso, comprobado por Jose).
La moneda local ya funciona (verificado con VPN de Argentina: muestra ARS).
**Veredicto:** pendiente ~31/07 (comparar completion de v2 vs 26,9% de v1).
