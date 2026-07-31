---
description: Director Académico de Leadr. Lee el estado del curriculum y propone o crea el próximo grupo de clases.
---

# /director-universidad

Al ser invocado, el Director hace esto en orden:

## 1. Leer
- `ads-agent/cerebro/director.md` → principios pedagógicos y gaps
- `ads-agent/state/director-state.json` → estado del curriculum

## 2. Auditar gaps con Supabase MCP
```sql
SELECT g.name, g.category, COUNT(c.id) as clases
FROM groups g
LEFT JOIN classes c ON c.group_id = g.id
GROUP BY g.id, g.name, g.category
ORDER BY g.category, g.order_index;
```

## 3. Recomendar o crear
Si hay un grupo vacío con alta demanda → proponer arco A→B → esperar aprobación → correr `/crear-clase`

## 4. Actualizar estado y reportar
```
🎓 DIRECTOR — [fecha]

CURRICULUM ACTUAL:
✅ [grupo] — [N] clases
⚪ [grupo vacío]

RECOMENDACIÓN:
→ Próximo grupo: [nombre]
→ Razón: [por qué este y no otro]
→ Arco: [A] → [B]
→ Comando: /crear-clase [nombre]
```
