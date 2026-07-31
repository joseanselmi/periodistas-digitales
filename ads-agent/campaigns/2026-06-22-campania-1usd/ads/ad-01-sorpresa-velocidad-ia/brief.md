# AD 1 — Sorpresa / Velocidad con IA

| Campo | Valor |
|---|---|
| Campaña | `2026-06-22-campania-1usd` |
| Objetivo | Lead (capturar email a cambio de un recurso gratis sobre IA + periodismo) |
| Ángulo | Sorpresa + FOMO + velocidad: un colega ya hace en 10 min lo que a otros les toma 3 horas |
| Nivel de consciencia | 1 — Problema-consciente (todavía no sabe que la solución es un prompt bien armado) |
| Status | Creativo final listo. Copy listo. El destino/landing exacto es una decisión aparte — no es parte de este paquete (ver nota abajo). |

## Importante: el ad y la landing/lead-magnet son dos tareas separadas

Este brief documenta el **ad** (creativo + copy). El contenido en pantalla
del teléfono dice "GUÍA PARA PERIODISTAS" porque así viene el creativo base
(`creative-base-sin-overlay.png`, ya existía antes de esta sesión) — pero
eso NO implica que el destino de este ad tenga que ser específicamente
`guia-gratis-claude-periodistas.html` ni el flujo de
`sistemadeingresosdiariosia.com`. Cuál es el lead magnet final, dónde vive,
y cómo se entrega son decisiones de otra tarea. `copy.md` deja el campo
Link como pendiente a propósito — completarlo cuando esa decisión esté
tomada, no antes.

## Por qué este ángulo y no el de ingresos

Arrancamos probando que la pantalla del celular mostrara un dashboard de
ingresos ("$12.480"), pero esa promesa no corresponde a esta oferta — esta
campaña vende una guía **gratis** sobre velocidad/tiempo con IA, no el curso
pago de ingresos (`sistema-ingresos/`, ver memoria
`feedback_diferenciacion_productos`). Mezclar esa promesa acá:
1. No calza con el headline real ("10 minutos vs 3 horas" = tiempo, no plata).
2. Es riesgo de rechazo en Meta por claim de ingresos sin base/disclaimer.

Por eso el creativo final usa la versión original del teléfono con el texto
"GUÍA PARA PERIODISTAS" (lo que de verdad se entrega), con el headline de
sorpresa/tiempo superpuesto.

## Historial de variantes (en `variantes-exploradas/`)

| Archivo | Qué es | Por qué se descartó |
|---|---|---|
| `variante-a-ingresos-flux-gibberish-DESCARTADA.png` | Pantalla con dashboard de ingresos, generada con `flux_kontext` | Texto en pantalla salió ilegible (gibberish) — error de elección de modelo, documentado en la skill `higgsfield-model-picker` |
| `variante-b-ingresos-nanobanana-legible-DESCARTADA-angulo-equivocado.png` | Mismo dashboard de ingresos, regenerado con `nano_banana_2`, texto ya legible ("$12.480 / INGRESOS") | Técnicamente correcta, pero ángulo equivocado para esta oferta (ver arriba) |
| `variante-c-3h-vs-10min-nanobanana.png` | Pantalla con "3 HORAS → 10 MIN", generada con `nano_banana_pro` | Válida y calza con el ángulo, pero el creativo final ya resuelve esto mejor con overlay de diseño completo (`creative-final-1080x1080.png`) — se guarda como alternativa por si se quiere testear el dato en la pantalla en vez de solo en el overlay de texto |

## Asset final

- `creative-final-1080x1080.png` — listo para subir, 1080×1080, headline +
  CTA "Descargá tu guía gratis" ya compuestos en la imagen.
- `creative-base-sin-overlay.png` — foto base sin texto, para rehacer el
  overlay si se necesita una versión sin el texto quemado (ej. para usar el
  headline solo como Primary Text de Meta en vez de overlay).

## Próximos pasos (de este ad, nada más)

1. Decidir el destino/link final (landing propia, formulario nativo de Meta
   Lead Ads, etc.) — tarea separada, no resolverla acá.
2. Con el link decidido, completar `config.json` de la campaña (mismo
   formato que `campaigns/2026-06-21/config.json`) y correr
   `node scripts/publicar/publish.mjs campaigns/2026-06-22-campania-1usd/config.json`.
