# Tracking del curso — Meta Pixel + Conversions API

Documento de referencia del tracking de **Sistema de Ingresos Diarios** (curso,
no Leadr). Objetivo: medir las compras lo más preciso posible para que las
campañas de Meta Ads optimicen bien y no malgasten presupuesto.

Última actualización: 2026-06-29.

## El embudo y por qué se mide así

```
Anuncio Meta ──► Landing (sistemadeingresosdiariosia.com) ──► Checkout (pay.hotmart.com) ──► Webhook (api/hotmart.js) ──► Meta CAPI
     │                    │                                          │                              │
     │            Pixel del navegador                         Hotmart cobra              Purchase server-side
     │         (PageView, ViewContent,                     (otra web, sin pixel)        (la conversión real)
     │            InitiateCheckout)
```

Punto clave: **la compra NO ocurre en nuestra web, ocurre en Hotmart** (otra
empresa, otro dominio). Por eso el `Purchase` no se puede medir con el pixel del
navegador — se mide del lado del servidor, cuando Hotmart nos avisa por webhook.
Eso también explica por qué el checkout de Hotmart "no tiene pixel" (es correcto)
y por qué un bloqueador de anuncios del visitante **no** afecta la medición de la
compra (va por servidor).

## Pixel

- **Pixel / dataset:** `1086780383211630` ("Periodistas del Futuro 2.0").
- **Compartido** con `www.leadr.cloud` y otros sitios. Por eso el `Purchase` del
  curso se etiqueta con `content_ids: ['curso-sistema-ingresos']` → permite crear
  una **conversión personalizada** que optimice solo compras del curso (ver abajo).

## Qué se envía en cada evento

| Evento | Origen | Datos |
|--------|--------|-------|
| PageView | navegador (`index.html`) | estándar |
| ViewContent | navegador | `content_ids`, `content_name`, `content_type`, `value` 27, `currency` USD |
| InitiateCheckout | navegador, al clickear el botón de compra | `content_ids`, `content_type`, `value`, `currency` |
| **Purchase** | **servidor (`api/hotmart.js`)** | PII hasheada + fbp/fbc + content_ids + value/currency real + event_id |

### Event Match Quality del Purchase

Para subir el match quality (antes ~3/10 con solo email), el webhook ahora manda
todo lo que Hotmart provee, **hasheado en SHA-256** (minúsculas, sin espacios):

- `em` email · `ph` teléfono (solo dígitos) · `fn`/`ln` nombre y apellido ·
  `ct` ciudad · `zp` código postal · `country` país.
- `fbp` y `fbc` **en crudo** (no se hashean).

### Cómo llegan fbp/fbc al servidor (el truco del embudo)

`fbc`/`fbp` son la cookie de Facebook: viven en el **navegador del visitante en la
landing**, pero el `Purchase` lo dispara **Hotmart** (que no las tiene). Para
cruzarlas:

1. En la landing, al clickear el botón de compra, se leen las cookies `_fbp` y
   `_fbc` y se **empaquetan dentro del parámetro `sck`** del link de Hotmart:
   `sck=b2~fbp:<...>~fbc:<...>` (el `~` no aparece nunca dentro de fbp/fbc).
2. Hotmart devuelve ese `sck` en el webhook (`data.purchase.tracking.source_sck`).
3. El webhook lo desempaqueta (`parseSck`) y los manda a Meta.

> ⚠️ **Riesgo conocido — largo de `sck`:** fbp+fbc empaquetados pueden superar el
> límite de caracteres de `sck` de Hotmart y truncarse. Si pasa, se pierde fbc en
> esa compra (degradación elegante: el match igual usa la PII). **Verificar con la
> compra de prueba** mirando el `raw payload` en los logs de Vercel: si
> `source_sck` llega cortado, mover fbp/fbc a un store propio (KV/Supabase) con un
> `ref` corto en `sck`. Ver "Pendiente / fase 2".

### UTMs reales (bug arreglado)

Los links de Hotmart en la landing tenían `utm_campaign={{campaign.name}}` etc.
**hardcodeados**. Esos macros `{{...}}` los reemplaza Meta solo en la URL del
anuncio (anuncio → landing), **no** en un link dentro de la landing → llegaban
literales a Hotmart. Ahora el handler de click reenvía las UTMs **reales** con las
que llegó la visita (de `window.location.search`) y, si no vino ninguna, borra los
placeholders.

## Pasos manuales (Meta / Hotmart) — los hace Jose, guiado

1. **Conversión personalizada en Meta** (para no mezclar con compras de Leadr):
   Events Manager → Conversiones personalizadas → Crear → origen = el pixel
   `…211630`, evento `Purchase`, regla: `content_ids` **contiene**
   `curso-sistema-ingresos`. Usar ESA conversión como evento de optimización en la
   campaña del curso.
2. **(Opcional) Validar sin compra real:** setear `META_TEST_EVENT_CODE` en Vercel
   con el código de "Probar eventos" (ej. `TEST11332`), gatillar el webhook (compra
   real o test de Hotmart), ver el Purchase en "Probar eventos", y **borrar la env
   var después** (si queda, los eventos reales se marcan como de prueba).
3. **Variables en Vercel** (proyecto `sistema-ingresos-landing`): confirmar
   `META_PIXEL_ID=1086780383211630` y `META_CAPI_TOKEN` cargados (ya funcionan,
   el Purchase llegaba). `META_TEST_EVENT_CODE` solo temporal.

## Re-test (después de deployar)

1. **Navegador:** Pixel Helper en la landing → PageView + ViewContent activos; al
   clickear el botón verde, InitiateCheckout. (En `sistemadeingresosdiariosia.com`,
   no en el checkout de Hotmart.)
2. **Compra de prueba end-to-end** ($27, reembolsable en Hotmart):
   - Confirmar en Events Manager que entra **Purchase** y que el **match quality
     sube** respecto al 3/10 anterior.
   - En los logs de Vercel, revisar el `raw payload` para confirmar los nombres
     reales de los campos de Hotmart (teléfono, dirección, `source_sck`) y que
     `fbp`/`fbc` llegaron completos.
   - Confirmar que el **bono de Leadr** se otorgó (`leadr_bono: true`).

## Pendiente / fase 2

- Si `sck` trunca fbp/fbc: store propio (Vercel KV o la tabla `events` de
  `ads-agent/ARQUITECTURA-DATOS.md`) con un `ref` corto + IP/User-Agent reales del
  comprador (capturados en un endpoint redirector `/api/checkout` en vez del link
  directo) → empuja el match quality al máximo.
- Ajustar `country` a ISO-2 si Hotmart manda el nombre completo del país.
