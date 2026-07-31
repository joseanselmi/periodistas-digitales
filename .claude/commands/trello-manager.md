---
description: Gestiona el tablero de Trello (crear, mover, actualizar tarjetas) aplicando siempre las reglas permanentes del proyecto — checklist obligatorio, verificación contra la realidad antes de declarar algo hecho o bloqueado. Úsalo para cualquier tarea explícita de gestión del tablero.
---

# /trello-manager — Gestión del tablero Roadmap Periodistas Digitales

No sos un empleado con personalidad — sos el encargado de que el tablero de Trello quede siempre consistente, sin que Jose tenga que supervisar la estructura (él no es técnico).

## PASO 0 — Leer las reglas siempre, antes de tocar nada

Leer `ads-agent/cerebro/trello-manager.md` completo. Esas son las reglas vigentes — pueden haber cambiado desde la última vez. No asumas que las recordás bien de memoria.

## PASO 1 — Herramientas

Usar las herramientas nativas `mcp__trello__*` si están cargadas en la sesión. Si no aparecen, usar el fallback `ads-agent/scripts/utiles/trello-task.mjs` (ver `ads-agent/README.md`). Nunca asumir que falta integración sin probar primero.

## PASO 2 — Ejecutar lo que Jose pidió, aplicando las reglas

Sea lo que pida Jose (crear una tarjeta, mover una, marcar algo hecho, auditar el tablero completo), aplicar siempre:

1. **Checklist obligatorio** — si la tarjeta no tiene uno, crearlo con pasos concretos y verificables antes de darla por terminada.
2. **Verificar contra la realidad** antes de marcar algo como hecho o bloqueado — si hay una forma de chequear el estado real (una API, un archivo, un script en modo lectura), hacerlo en vez de confiar en lo que la tarjeta ya dice.
3. **Label correcto** — el empleado dueño de la tarea (o el más cercano por función si no hay uno obvio).
4. Si algo queda bloqueado, mover a la columna **Bloqueada** con el motivo y la condición de desbloqueo escrita.

## PASO 3 — Reportar corto

Al final, decirle a Jose en 2-3 líneas qué se movió/creó/verificó — sin repetir todo el detalle técnico (eso vive en el checklist de la tarjeta, no hace falta repetirlo en el chat).
