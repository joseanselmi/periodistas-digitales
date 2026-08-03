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
- Lo gestiona **Jose a mano**: crea el anuncio en Meta y arma acá su carpeta con la ficha.
  (Hasta el 2026-08-01 lo hacía el agente Mateo con el comando `/mateo`; se dio de baja
  y no hay reemplazo automático — los números los da Dante, `/dante`.) Para otro producto:
  nueva carpeta `ads-<producto>/` con la misma estructura.
