# Trello Manager — reglas permanentes de gestión del tablero

Este documento define cómo se gestiona el tablero "Roadmap Periodistas Digitales" (id `6a35bf86f4bbebc72953200f`). No es un empleado con personalidad como Mateo o Sofía — es el conjunto de reglas que **cualquier sesión de Claude debe aplicar siempre** que toque Trello, sin que Jose tenga que pedirlo cada vez. Jose no es técnico: estas reglas existen para que el tablero quede consistente sin que él tenga que supervisar la estructura.

## Regla 1 — Toda tarjeta activa necesita un checklist con pasos concretos

No alcanza con una descripción de texto libre. Cada tarjeta en "Por hacer", "En progreso" o "Bloqueada" debe tener al menos un checklist que desglose el trabajo en pasos verificables (no "investigar X" genérico — pasos que se puedan tildar uno por uno).

- Si una tarjeta vieja no tiene checklist, agregárselo la primera vez que se la toca (no hace falta auditar todo el tablero de una, se va corrigiendo a medida que se interactúa con cada tarjeta).
- Tildar (`complete`) cada ítem en el momento en que se termina, no todos juntos al final.

## Regla 2 — Columnas del tablero (actualizado 2026-06-24)

Backlog → Por hacer → En progreso → **Bloqueada** → En revisión → Hecho

- **Bloqueada** es nueva (creada 2026-06-24, id `6a3c5152a27ab54c2ae9c398`): para tareas que no se pueden avanzar todavía por una dependencia externa (ej. esperar que se libere un cupo, esperar una respuesta, esperar una fecha). Si se mueve una tarjeta acá, agregar el motivo y la fecha/condición de desbloqueo en la descripción o como primer ítem del checklist.
- Antes de mover algo a "Hecho", confirmar el estado real (ver Regla 3) — no asumir que está terminado porque el checklist dice que sí, si hay forma de verificarlo contra el sistema real.

## Regla 3 — Verificar contra la realidad antes de declarar algo hecho o bloqueado

No confiar ciegamente en lo que dice la tarjeta — puede estar desactualizada. Antes de decir "esto ya está" o "esto está bloqueado", chequear el estado real cuando sea posible (ej. llamar a la API de Meta para contar posts programados, revisar el escenario de Make, correr el script en modo lectura). Esto ya pasó una vez (24/06): la tarjeta de programar julio decía "debería estar libre para el 3/07" pero había que confirmar con la API real cuántos lugares quedaban — se confirmó 28/30 ocupados y se movió a Bloqueada con esa evidencia, no por suposición.

## Regla 4 — Label por agente

Cada tarjeta lleva el label del empleado/agente dueño de la tarea (Ricardo, Dante, Valentina, Mateo, Sofía, Luna, Max, Director, Bruno, Nicolás, Valeria, Miguel, Clara). Si una tarea no es claramente de un empleado (ej. infraestructura de datos cross-producto), usar el que más se acerque por función (ej. Bruno para temas de datos/analytics) en vez de dejarla sin label.

## Regla 5 — Tarjetas nuevas al cerrar una sesión de trabajo

Si en una sesión se construyó algo nuevo o se dejó algo a mitad de camino, crear o actualizar la tarjeta correspondiente ANTES de cerrar — no depender de que la próxima sesión reconstruya el contexto desde la conversación (que puede no estar disponible). Ver también la memoria `feedback_documentar_tecnico_en_repo` — la documentación técnica detallada va en archivos del repo (ej. `ads-agent/docs/ARQUITECTURA-DATOS.md`), Trello es el índice de tareas con su checklist, no el lugar para el detalle técnico completo.

## Regla 6 — Todo PDF generado se pega como link en los comentarios de la tarjeta

Cada vez que se genera o se vuelve a publicar un PDF (guía, regalo, ebook — vía la skill `pdf-creator`), el link público (`https://sistemadeingresosdiariosia.com/<nombre>.pdf` u otro dominio si corresponde) va como comentario en la tarjeta correspondiente, no solo mencionado de paso dentro de un comentario largo sobre otra cosa. Esto pasó desapercibido el 2026-06-26 con la guía `guia-periodico-digital-ig-fb.pdf` — el link estaba en la conversación pero no quedaba fácil de encontrar en la tarjeta.

## Regla 7 — Los comentarios son mini-contexto para la próxima sesión, ni narración ni solo links

Un comentario de Trello cumple una función concreta: que una sesión futura de Claude (que no tiene la conversación original) pueda leer la tarjeta y entender qué se decidió, sin tener que reconstruir todo desde cero. Eso significa que ninguno de estos dos extremos sirve:

- **Demasiado largo** (el error original, 2026-06-26): recapitular toda la conversación, explicar el porqué de cada paso, listar todo con viñetas — eso hace que la tarjeta sea pesada de leer y diluye lo importante.
- **Demasiado corto** (el sobre-corregido, mismo día): comentarios que son solo un link pelado sin decir qué decisión o cambio representa — eso obliga a abrir el archivo para entender de qué se trata.

El punto medio: 2-4 líneas con el hecho o la decisión concreta, y el "por qué" solo si no es obvio — sin desarrollar el razonamiento completo (eso vive en archivos del repo o en memoria, no repetido en cada comentario). Ejemplo bueno: "Oferta revisada: sin precio en el mensaje, invita a la landing en vez de al checkout directo." — dice qué cambió y por qué, en una línea.

- Si el PDF se actualiza (se corrige y se vuelve a deployar), no hace falta repetir el comentario si la URL no cambió — pero si hay un cambio de fondo (ej. se corrigió un bug visual importante), sí conviene un comentario nuevo aclarando "versión corregida" con la misma URL.
- Aplica también a futuros PDFs de otros proyectos (Leadr, cursos, etc.), no solo a esta campaña.

## Cómo interactuar con Trello

- Tools MCP nativas `mcp__trello__*` si están cargadas en la sesión (preferir siempre esto).
- Fallback si no cargaron: `ads-agent/scripts/utiles/trello-task.mjs` (ver `ads-agent/README.md`).
- Board por defecto: `6a35bf86f4bbebc72953200f` ("Roadmap Periodistas Digitales").
