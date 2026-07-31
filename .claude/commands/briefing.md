---
description: Briefing del día con datos EN VIVO. Corre estado.mjs, lee ESTADO.md y dice en qué estamos, qué está roto y cuál es la próxima acción concreta. Invocar al sentarse a trabajar.
---

# /briefing — dónde estamos hoy

## PASO 1 — Traer el estado real (no saltear)

```bash
node herramientas/estado.mjs
```

Tarda ~40 s y reescribe `ESTADO.md` con datos en vivo de Trello, Supabase, Brevo
y la cola del embudo. Después leer `ESTADO.md` entero.

Si alguna sección quedó como "no disponible" por falta de
`SUPABASE_SERVICE_ROLE_KEY`, traer esos números con el MCP de Supabase (proyecto
`periodistas-marketing`, `wxyimqkjlwfncvzozpjy`). Un hueco no es un cero.

## PASO 2 — El briefing

Cinco bloques, sin relleno:

```
📊 CÓMO VENIMOS
→ Ventas 7d (neto de Jose) y contra los 7 previos. Una línea.

🔴 QUÉ ESTÁ ROTO
→ Sólo lo del semáforo en rojo, con el número que lo prueba.
→ Si no hay nada roto, decirlo y seguir.

🚧 QUÉ QUEDÓ A MEDIAS
→ Tarjetas con checklist empezado y sin terminar (están en ESTADO.md,
   con el ítem exacto que falta). Máximo 3, las de mayor impacto.

⏳ ESPERANDO A JOSE
→ Los ítems "(JOSE)" abiertos. Si no hay, no inventar.

⚡ LA PRÓXIMA ACCIÓN
→ UNA sola, ejecutable hoy, con el ítem de checklist y la tarjeta a la que
   pertenece. Nada de "revisar" o "analizar" genérico.
```

## REGLAS

- Ningún número sin fuente fresca. Si no se pudo leer, se dice "no pude leer X",
  nunca se estima.
- Antes de proponer algo o de preguntarle algo a Jose, mirar los checklists de
  ESTADO.md: si ya está decidido en una tarjeta, se ejecuta, no se pregunta.
- "Sin tarea" es una respuesta válida. Inventar trabajo es peor que no tenerlo.
- Lo que se decida o se avance en la sesión vuelve a su tarjeta de Trello (ver
  `ads-agent/cerebro/trello-manager.md`).
