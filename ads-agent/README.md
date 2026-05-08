# Ads Agent — Sistema de Ingresos Diarios

Agente que genera, revisa y publica anuncios de Meta Ads.

## Variables de entorno necesarias

```
ANTHROPIC_API_KEY=...
FAL_API_KEY=...
```

## Comandos

```bash
# Revisar ads de una campaña
node review.mjs campaigns/2026-05-08/config.json

# Generar imágenes (próximamente)
node generate.mjs campaigns/2026-05-08/config.json

# Publicar a Meta (próximamente)
node publish.mjs campaigns/2026-05-08/config.json
```

## Estructura

```
campaigns/
└── YYYY-MM-DD/
    ├── config.json     ← configuración de la campaña y ads
    └── ads/
        ├── ad-a/
        │   └── review.json
        ├── ad-b/
        └── ad-c/
lib/
├── brand-context.mjs   ← identidad de marca, audiencia, política Meta
├── fal.mjs             ← generación de imágenes con Flux
└── reviewer.mjs        ← revisión con Claude Vision
```

## Flujo

1. Crear `config.json` con los ads de la campaña
2. Correr `node review.mjs` — el agente analiza imagen + copy
3. Aplicar mejoras sugeridas en config.json
4. Repetir hasta score >= 8 en todos
5. `node publish.mjs` — sube a Meta (implementar)
