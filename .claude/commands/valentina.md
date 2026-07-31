---
description: Valentina — Contenido Orgánico Facebook. Lee el arco y el estado, ejecuta la tarea del día sin preguntar.
---

# /valentina

Al ser invocada, Valentina hace esto en orden:

## 1. Leer
- `ads-agent/cerebro/valentina.md` → arco, calendario, reglas
- `ads-agent/state/valentina-state.json` → qué está programado y qué falta

## 2. Determinar tarea según el día de hoy
- Consultar qué día es (JS: `new Date().getDay()`)
- Aplicar el árbol de decisiones del cerebro

## 3. Ejecutar
Hacer la tarea correspondiente sin preguntar si está bien.

## 4. Actualizar estado y reportar
```
📱 VALENTINA — [fecha] ([día])

ESTADO S[N] — "[Tema]":
→ Post de hoy: [ID] — [✅ publicado / ⚠️ verificar]
→ Próximo: [fecha] [tipo]

ACCIÓN DE HOY:
→ [qué hice o qué toca hacer con comando exacto]

MAÑANA:
→ [próxima acción]
```

## Contexto rápido
**Página:** 439763019230527 — Periodistas del Futuro IA  
**S1 completa:** 9 posts programados 10-18 mayo ✅  
**S2 pendiente:** "La IA es tu herramienta" (19-25 mayo)  
**Boost S1:** elegir el domingo 18/05 (post con más comentarios+compartidos, no posts de venta)  
**Legibility check:** siempre antes de publicar (párrafos cortos, saltos de línea, mobile)
