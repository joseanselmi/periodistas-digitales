# Ads Agent — Sistema de Ingresos Diarios

Agente que genera, revisa y publica anuncios de Meta Ads.

## Variables de entorno necesarias

```
ANTHROPIC_API_KEY=...
FAL_API_KEY=...
TRELLO_API_KEY=...
TRELLO_TOKEN=...
```

## Trello — tareas por agente

Tablero: [Roadmap Periodistas Digitales](https://trello.com/b/Bgt6wooU/roadmap-periodistas-digitales)
(workspace `periodistasdigitales`, board id `6a35bf86f4bbebc72953200f`).

Columnas: Backlog → Por hacer → En progreso → En revisión → Hecho.
Cada uno de los 13 agentes (Ricardo, Dante, Valentina, Mateo, Sofía, Luna, Max,
Director, Bruno, Nicolás, Valeria, Miguel, Clara) tiene su propia **label** —
así se le "asigna" una tarjeta sin necesitar una cuenta de Trello real.

Cliente: [lib/trello.mjs](lib/trello.mjs) (`createTask`, `getTasksForAgent`, `moveTask`, `completeTask`).
CLI: [trello-task.mjs](trello-task.mjs):

```bash
node trello-task.mjs crear Mateo "Subir creativo nuevo" --list "Por hacer"
node trello-task.mjs listar Mateo
node trello-task.mjs mover <cardId> "Hecho"
```

Cualquier agente puede importar `lib/trello.mjs` directamente para autoasignarse
o cerrar tareas sin pasar por la CLI.

## Comandos

```bash
# Revisar ads de una campaña (imagen + copy con Claude Vision)
node review.mjs campaigns/2026-05-08/config.json

# Publicar a Meta
node publish.mjs campaigns/2026-05-08/config.json

# Traer métricas frescas de Meta
node fetch-meta.mjs
```

Otros scripts útiles en la raíz: `organic-agent.mjs` (orgánico), `email-agent.mjs`
/ `send-email.mjs` (email), `carousel-generator.mjs` + `export-slides.mjs`
(carruseles), `monitor.mjs` / `audit-cmo.mjs` (monitoreo y auditoría),
`hotmart-sync.mjs` / `meta-spend-sync.mjs` (syncs de datos).

## Estructura

Cada carpeta tiene su propio `README.md` con el detalle:

```
cerebro/     ← personalidad/reglas de cada agente (mateo.md, sofia.md, ...)
state/       ← estado persistente de cada agente (<agente>-state.json)
campaigns/   ← campañas de Meta Ads por fecha (config + exports + auditorías)
carousels/   ← carruseles para redes, por semana (HTML + imágenes + captions)
organic/     ← posts orgánicos diarios (calendario + texto + imagen)
emails/      ← secuencias de email + logs de envío
lib/         ← módulos compartidos:
             ├── brand-context.mjs   ← identidad de marca, audiencia, precio
             ├── brand-palette.mjs   ← paleta oficial de color
             ├── fal.mjs             ← generación de imágenes (Flux)
             ├── reviewer.mjs        ← revisión de ad (imagen + copy) con Claude Vision
             ├── image-reviewer.mjs  ← revisor universal de imágenes generadas
             └── trello.mjs          ← cliente del tablero por agente
```

## Flujo

1. Crear `config.json` con los ads de la campaña
2. Correr `node review.mjs` — el agente analiza imagen + copy
3. Aplicar mejoras sugeridas en config.json
4. Repetir hasta score >= 8 en todos
5. `node publish.mjs` — sube a Meta (implementar)
