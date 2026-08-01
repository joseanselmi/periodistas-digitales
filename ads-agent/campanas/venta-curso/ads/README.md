# Ads — Curso Sistema de Ingresos Diarios

Carpeta de anuncios de **este producto** (curso, $27). Cada anuncio tiene su propia
subcarpeta, nombrada por su **matrícula** (`adN-angulo`), y adentro guarda TODO:

```
ads-curso/
└── ad1-fomo/                ← una carpeta por anuncio (= la matrícula)
    ├── creativo-v1.png      ← el/los creativo(s)
    └── ficha.md             ← la campaña + el conjunto + el anuncio (nombres, settings, copy, URL, hipótesis, revisión)
```

- La **matrícula** (`ad1-fomo`) es la misma en Meta, en la URL (`?src=ad1-fomo`), en el
  campo "Origen" de Hotmart y en `../registro-anuncios.md` → así se identifica todo de un vistazo.
- El **índice/log de todos los anuncios** (con resultados y decisiones) vive en
  `ads-agent/registro-anuncios.md`. Esta carpeta es el detalle por anuncio.
- Lo gestiona **Mateo** (skill `/mateo`, modo "crear anuncio"). Para otro producto: nueva
  carpeta `ads-<producto>/` con la misma estructura.
