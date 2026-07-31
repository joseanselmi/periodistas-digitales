---
description: Cierre de sesión de trabajo. Revisa toda la conversación, guarda en memoria lo que no esté documentado, actualiza los checklists y tarjetas de Trello correspondientes, y reporta un resumen corto antes de terminar. Correrlo al final de cualquier sesión de trabajo larga.
---

# /cerrarchat — Cierre de sesión

Jose no es técnico y no se va a acordar de pedirte "guardá esto" cada vez — por eso este comando existe: hacelo vos solo, completo, cada vez que se corre.

## PASO 1 — Revisar toda la conversación

Repasá lo que pasó en esta sesión: qué se construyó, qué decisiones se tomaron (y el *por qué*, no solo el qué), qué problemas se resolvieron, qué quedó pendiente o bloqueado, qué se probó y confirmó funcionando. No te limites a los últimos mensajes — revisá desde el principio de la conversación.

## PASO 2 — Memoria

Para cada decisión, hecho o pendiente importante que **no esté ya guardado** en memoria (revisá los archivos existentes antes de crear uno nuevo, para no duplicar):

- Crear o actualizar el archivo de memoria correspondiente (`project`, `feedback` o `reference` según corresponda — ver las reglas completas del sistema de memoria).
- Si ya existe un archivo sobre el mismo tema, actualizarlo en vez de crear uno nuevo.
- Actualizar `MEMORY.md` (el índice) con cualquier archivo nuevo o cuyo resumen cambió.
- Decisiones técnicas no triviales: además de la memoria, dejarlas en un `.md` del repo si corresponde (ver regla en `feedback_documentar_tecnico_en_repo` — Jose no puede responder preguntas técnicas después, así que la fuente de verdad va en el repo, la memoria apunta ahí).

## PASO 3 — Trello

Aplicar siempre las reglas de `ads-agent/cerebro/trello-manager.md` (leerlo si hace falta refrescar). Para cada tarjeta relacionada con el trabajo de esta sesión:

- Tildar los ítems del checklist que efectivamente se completaron hoy (revisar uno por uno, no asumir).
- Si se hizo trabajo real que no está reflejado en ningún checklist, agregar un checklist nuevo o ítems nuevos — y marcarlos como completos si ya se hicieron.
- Si algo quedó pendiente con una condición o fecha futura, dejarlo como ítem SIN marcar, redactado de forma específica (qué hay que revisar y cuándo) — no genérico.
- Si el estado real de la tarjeta cambió (bloqueada, lista para revisión, terminada), moverla a la lista que corresponda.
- Si se descubrió trabajo nuevo sin tarjeta propia, crear una (con su checklist inicial, label del agente correspondiente).
- Dejar un comentario en la tarjeta principal si hubo una decisión importante que vale la pena que quede visible ahí, no solo en memoria.

## PASO 4 — Reportar a Jose

Un resumen corto (4-8 líneas, no exhaustivo) de qué se guardó y actualizó — qué memorias, qué tarjetas, qué quedó pendiente explícitamente. El objetivo es que Jose pueda confirmar de un vistazo que no falta nada antes de cerrar, no que lea de nuevo todo lo que ya vivió en la conversación.

## IMPORTANTE

- Nunca inventar que algo se completó si no hay evidencia real en la conversación de que se hizo.
- Si algo quedó ambiguo (no está claro si se terminó o no), preguntale a Jose en vez de asumir.
- Ser exhaustivo en la revisión (pasos 1-3), pero conciso en el reporte final (paso 4).
- Este comando complementa guardar cosas en tiempo real durante la sesión — no es la única oportunidad de guardar algo, pero es la red de seguridad final antes de cerrar.
