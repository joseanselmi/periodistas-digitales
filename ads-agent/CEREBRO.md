# CEREBRO — Ecosistema completo Periodistas del Futuro IA
**Última actualización: 10 mayo 2026**

---

## EL NEGOCIO

**Producto activo:** Sistema de Ingresos Diarios para Periodistas
**Precio:** $17 USD (valor percibido $227)
**Checkout:** Hotmart `https://pay.hotmart.com/H99593850B`
**Diferencial único:** Incluye 1 mes de Leadr ($97) — nadie más puede dar este bono
**Historial Meta Ads:** $4.364 gastados → 346 compras → CPA promedio $10.19

---

## INFRAESTRUCTURA TÉCNICA

### Dominios (Vercel, deploy automático con git push)
| Dominio | Carpeta | Qué es |
|---------|---------|--------|
| `sistemadeingresosdiariosia.com` | `sistema-ingresos/` | Landing de ventas HTML |
| `leadr.cloud` | `leadr/app/` | Plataforma Next.js |

### Variables de entorno — `leadr/app/.env.local`
```
ANTHROPIC_API_KEY=sk-ant-api03-bmBNCX...
FAL_API_KEY=0bfe28dd-31e3-...
META_PIXEL_ID=1086780383211630
META_CAPI_TOKEN=EAASob...
FB_PAGE_TOKEN=EAAX3KwDW0p8BReZ...  ← PERMANENTE, no vence
FB_PAGE_ID=439763019230527
NEXT_PUBLIC_SUPABASE_URL=https://ovwlsnnhiuoxoazyrhvt.supabase.co
HOTMART_WEBHOOK_TOKEN=...
ELEVENLABS_API_KEY=...
```

### Meta Ads
- **Ad Account:** act_583636631091469
- **Página FB:** 439763019230527 (Periodistas del Futuro IA)
- **Token FB:** Sistema user "Claude publisher" — permanente
- **App Meta:** "Periodistas digitales" (ID: 167913895328630)

---

## TODOS LOS AGENTES

### Scripts principales
| Script | Qué hace | Cómo correr |
|--------|---------|-------------|
| `fetch-meta.mjs` | Baja campañas + métricas Meta | `META_ACCESS_TOKEN=x META_AD_ACCOUNT_ID=act_x node fetch-meta.mjs` |
| `monitor.mjs` | Métricas diarias + alertas | Mismas vars |
| `publish.mjs` | Publica ads en Meta (PAUSED) | `node publish.mjs campaigns/X/config.json` |
| `audit-cmo.mjs` | Auditoría CMO del ecosistema | `ANTHROPIC_API_KEY=x node audit-cmo.mjs` |
| `email-agent.mjs` | 5 emails post-compra | `ANTHROPIC_API_KEY=x node email-agent.mjs` |
| `organic-agent.mjs` | Posts + imágenes revisadas por IA | `ANTHROPIC_API_KEY=x FAL_API_KEY=x node organic-agent.mjs --days=7 --images` |
| `carousel-generator.mjs` | Carruseles HTML 1080x1080 | `ANTHROPIC_API_KEY=x node carousel-generator.mjs` |
| `export-slides.mjs` | JPG por carpeta para subir | `node export-slides.mjs carousels/semana-X` |
| `post-facebook.mjs` | Publica/programa en FB | `FB_PAGE_TOKEN=x node post-facebook.mjs <carpeta> [--schedule "YYYY-MM-DD HH:MM"]` |
| `schedule-week.mjs` | Programa semana completa | `FB_PAGE_TOKEN=x FB_PAGE_ID=x node schedule-week.mjs` |
| `add-nav.mjs` | Navegación slideshow a carruseles | `node add-nav.mjs` |

### Librerías (lib/)
| Archivo | Exporta |
|---------|---------|
| `brand-context.mjs` | BRAND — producto, audiencia, paleta, benchmarks |
| `brand-palette.mjs` | PALETTE — colores exactos + paletteCSS() |
| `fal.mjs` | generateImage(), downloadImage() |
| `reviewer.mjs` | reviewAd(), printReview() |
| `image-reviewer.mjs` | reviewImage(), generateAndReview(), LATAM_IMAGE_PREFIX |

---

## PALETA DE MARCA (aprobada por Jose, mayo 2026)

| Token | Valor |
|-------|-------|
| Fondo | `#07070f` |
| Indigo (principal) | `#6366f1` |
| Cyan (secundario) | `#22d3ee` |
| Gradiente | `linear-gradient(135deg, #6366f1, #22d3ee)` |
| Amber (urgencia) | `#f59e0b` |
| Green (éxito) | `#22c55e` |
| Red (problema) | `#ef4444` |
| Texto | `#f1f5f9` / `#94a3b8` / `#64748b` |
| Tipografía | Inter + JetBrains Mono |

---

## META ADS — LO QUE SABEMOS

### Top performers históricos (por CPA)
| Ad Set | Gasto | Compras | CPA | CTR |
|--------|-------|---------|-----|-----|
| 8.0 P1 | $1.095 | 103 | $10.63 | 2.99% |
| 2.0 11.99 usd CP | $393 | 48 | $8.18 | 3.50% |
| AD 3 P2 12/2 | $456 | 54 | $8.45 | 4.58% |
| **2.0 SG 40+65** | $38 | 6 | **$6.33** | 3.54% | ← nunca escalado, oportunidad

### Copy ganador (8.0 P1)
*"¿Tus colegas están usando IA y vos todavía no sabés por dónde empezar?"*
Título: "+3.700 alumnos satisfechos" | CTA: LEARN_MORE

### Campaña v2 (lista, no publicada)
Config: `campaigns/2026-05-08-v2/config.json`
- AD 1: FOMO frío 35-60 (intereses)
- AD 2: Prueba social María (lookalike compradores)
- AD 3: Retargeting visitantes LP

---

## CONTENIDO ORGÁNICO FACEBOOK

### Estrategia
- Archivo completo: `ESTRATEGIA-ORGANICO.md`
- 1 post/día, yo programo todo, Jose no toca nada
- 5 posts fríos + 1 tibio + 1 caliente por semana
- Boost $1/día × 7 días al mejor post orgánico cada semana

### Semana 1 — "El periodismo cambió" (10-18 mayo) ✅ PROGRAMADA
Todos los posts están en Facebook con sus IDs. Ver `organic_strategy.md` en memoria.

### Arco 4 semanas
- S1 (10-18 mayo): "El periodismo cambió" ✅
- S2 (19-25 mayo): "La IA es tu herramienta" 🔲
- S3 (26 mayo-1 jun): "Otros ya lo están haciendo" 🔲
- S4 (2-8 jun): "Es tu momento" — semana de conversión 🔲

### Estructura de archivos estándar
```
carousels/semana-DD-MM/para-subir/
├── 0-SABADO-10/
│   └── pie-de-foto.txt
├── 1-LUNES/
│   ├── slide-01.jpg ... slide-05.jpg
│   └── pie-de-foto.txt
└── ...
```

---

## LANDING (sistemadeingresosdiariosia.com)

### Estado actual
- ✅ Headline: "Tu conocimiento periodístico es un negocio. Solo falta el sistema."
- ✅ Contador urgencia 72h evergreen (localStorage)
- ✅ 3 slots de testimonios (placeholders — esperando capturas WhatsApp)
- ❌ Sin testimonios reales — el problema más crítico de conversión

---

## PENDIENTES — LOOPS ABIERTOS

| # | Qué | Cómo cerrar |
|---|-----|------------|
| 1 | Emails sin envío | Cargar en Hotmart → Email marketing |
| 2 | Testimonios landing vacíos | Jose sube capturas → `sistema-ingresos/img/` |
| 3 | Campaña Meta v2 sin publicar | `node publish.mjs campaigns/2026-05-08-v2/config.json` |
| 4 | Monitor sin schedule | Windows Task Scheduler o Make.com |
| 5 | Segmento 40-65 sin escalar | Testear $25/día — mejor CPA histórico $6.33 |
| 6 | image-reviewer en publish.mjs | Integrar antes del próximo lanzamiento de ads |
| 7 | Semana 2 orgánico | Crear el domingo 18/05 |
| 8 | Boost semana 1 | Elegir post ganador el domingo 18/05 |

---

## EL ICP (cliente ideal)

Periodista latinoamericana/o de **40-55 años**. 10+ años en medios. Siente el piso moverse. No fue despedido/a todavía pero la señal llegó. Colombia, México, Ecuador o Chile. Usa Facebook más que Instagram. $17 USD no es barrera — es una prueba de que esto es serio sin ser una apuesta.

**Mercados top reales:** Ecuador, Puerto Rico, Colombia, México, EEUU hispano, Chile.
