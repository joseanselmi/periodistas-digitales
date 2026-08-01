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
Cada agente (Ricardo, Dante, Valentina, Sofía, Luna, Director, Bruno, Miguel,
Clara) tiene su propia **label** —
así se le "asigna" una tarjeta sin necesitar una cuenta de Trello real.

Cliente: [lib/trello.mjs](lib/trello.mjs) (`createTask`, `getTasksForAgent`, `moveTask`, `completeTask`).
CLI: [scripts/utiles/trello-task.mjs](scripts/utiles/trello-task.mjs):

```bash
node scripts/utiles/trello-task.mjs crear Valentina "Subir carrusel" --list "Por hacer"
node scripts/utiles/trello-task.mjs listar Valentina
node scripts/utiles/trello-task.mjs mover <cardId> "Hecho"
```

Cualquier agente puede importar `lib/trello.mjs` directamente para autoasignarse
o cerrar tareas sin pasar por la CLI.

## Comandos

```bash
# Revisar ads de una campaña (imagen + copy con Claude Vision)
node scripts/agentes/review.mjs campanas/historico/2026-05-08/config.json

# Publicar a Meta
node scripts/publicar/publish.mjs campanas/historico/2026-05-08/config.json

# Traer métricas frescas de Meta
node scripts/datos/fetch-meta.mjs
```

Otros scripts útiles: `scripts/agentes/organic-agent.mjs` (orgánico), `scripts/agentes/email-agent.mjs`
/ `scripts/publicar/send-email.mjs` (email), `scripts/generar/carousel-generator.mjs` + `scripts/exportar/export-slides.mjs`
(carruseles), `scripts/agentes/monitor.mjs` / `scripts/agentes/audit-cmo.mjs` (monitoreo y auditoría),
`scripts/datos/hotmart-sync.mjs` / `scripts/datos/meta-spend-sync.mjs` (syncs de datos).

> **Todos los scripts se corren parados en `ads-agent/`**, no dentro de
> `scripts/`. Varios buscan el `.env.local`, `state/` o `hotmart-transcripts/`
> relativos a esta carpeta.

## Estructura

Cada carpeta tiene su propio `README.md` con el detalle:

```
scripts/     ← todos los ejecutables, agrupados por lo que hacen:
             ├── datos/      ← traen o sincronizan datos (fetch-*, *-sync, scrapers)
             ├── agentes/    ← analizan y deciden (monitor, audit-cmo, clara, radar)
             ├── generar/    ← crean contenido y creativos (gen-*, carousel-generator)
             ├── programar/  ← calendarios de orgánico (schedule-*)
             ├── publicar/   ← ⚠️ salen al mundo (publish, post-*, send-email)
             ├── exportar/   ← exportan a archivo (export-*, lint-pdf-guide)
             ├── curso/      ← transcripciones del curso de Hotmart
             └── utiles/     ← trello-task, comprimir-img-landing
campanas/    ← las campañas, por segmento (la convención del 30/07):
             ├── README.md    ← cómo se nombra una campaña y dónde va cada pieza
             ├── <segmento>/  ← su estrategia y su copy (lo público está en sistema-ingresos)
             ├── <campaña>/ads/ ← los anuncios de esa campaña (ficha + creativo)
             └── historico/   ← las campañas viejas por fecha + el TEMPLATE
datos/       ← ⚙️ lo que ESCRIBEN los scripts (regenerable, no se edita a mano):
             ├── meta-exports/ ← los dumps de la API de Meta (fetch-meta)
             ├── reports/      ← los informes de monitor
             ├── auditorias/   ← las auditorías del CMO
             └── radar/        ← el radar de tendencias (fuentes.json SÍ se edita)

docs/        ← documentación del sistema (ARQUITECTURA-DATOS, SISTEMA-ADS, ...)
cerebro/     ← quién es cada agente y cómo decide
state/       ← qué hizo cada agente. ⚠️ NO se mueve: el Panel de Comando lo lee
             desde GitHub por ruta fija (api/_lib/sync-estados.js)
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

En la raíz quedan solo `README.md`, `CEREBRO.md` (índice del equipo) y
`registro-anuncios.md` — este último no es documentación sino el registro
operativo de los anuncios, y las fichas de `campanas/<campaña>/ads/` lo apuntan por ruta
relativa.

## Flujo

1. Crear `config.json` con los ads de la campaña
2. Correr `node scripts/agentes/review.mjs` — el agente analiza imagen + copy
3. Aplicar mejoras sugeridas en config.json
4. Repetir hasta score >= 8 en todos
5. `node scripts/publicar/publish.mjs` — sube a Meta (implementar)
