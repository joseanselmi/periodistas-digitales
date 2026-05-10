# CEREBRO — Todo lo que sé sobre este ecosistema

Documento de referencia para el agente. Se actualiza con cada sesión.

---

## El negocio

**Producto activo:** Sistema de Ingresos Diarios para Periodistas
**Precio:** $17 USD (valor percibido $227)
**Checkout:** Hotmart `https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2`
**Diferencial único:** Incluye 1 mes de Leadr ($97 valor) — nadie más puede dar este bono
**Historial:** $4.364 gastados → 346 compras → CPA promedio $10.19

**Dos productos en cuenta:**
1. Curso IA para Periodistas ($11.99, campañas 2024-2025) — pausado
2. Sistema de Ingresos Diarios / Periódicos Digitales ($17, campañas 2026) — activo

---

## El ecosistema técnico

### Dominios (ambos en Vercel, deploy automático con git push)
| Dominio | Qué es | Carpeta |
|---------|--------|---------|
| `sistemadeingresosdiariosia.com` | Landing de ventas | `sistema-ingresos/` |
| `leadr.cloud` | Plataforma Leadr | `leadr/app/` |

### Variables de entorno (en `leadr/app/.env.local` y Vercel)
- `ANTHROPIC_API_KEY` — Claude API
- `FAL_API_KEY` — Generación de imágenes Flux
- `META_CAPI_TOKEN` — Meta Conversions API
- `META_PIXEL_ID` — 1086780383211630
- `HOTMART_WEBHOOK_TOKEN` — Webhook compras
- `NEXT_PUBLIC_SUPABASE_URL` — proyecto ovwlsnnhiuoxoazyrhvt

### Meta Ads
- **Ad Account:** act_583636631091469 (Periodistas del futuro IA CP)
- **Página Facebook:** 439763019230527
- **Token:** regenerar en developers.facebook.com/tools/explorer → app "Periodistas digitales" → permisos: ads_read + ads_management

---

## Los agentes (ads-agent/)

| Script | Qué hace | Cómo correr |
|--------|---------|-------------|
| `fetch-meta.mjs` | Baja todos los datos de Meta | `node fetch-meta.mjs` |
| `monitor.mjs` | Métricas diarias + alertas | `node monitor.mjs` |
| `publish.mjs` | Publica ads en Meta (PAUSED) | `node publish.mjs campaigns/X/config.json` |
| `reviewer.mjs` | Analiza imagen + copy con Claude Vision | via `review.mjs` |
| `audit-cmo.mjs` | Auditoría completa del ecosistema | `node audit-cmo.mjs` |
| `email-agent.mjs` | Genera 5 emails post-compra | `node email-agent.mjs` |
| `organic-agent.mjs` | Genera 7 días posts Facebook + imágenes | `node organic-agent.mjs --days=7 --images` |
| `carousel-generator.mjs` | Genera carruseles HTML 1080x1080 | `node carousel-generator.mjs` |

### Librería compartida (lib/)
- `brand-context.mjs` — contexto de marca, benchmarks, audiencia
- `fal.mjs` — generación y descarga de imágenes con Flux
- `reviewer.mjs` — revisión de ads con Claude Vision
- `image-reviewer.mjs` — revisor universal de imágenes (LATAM, sin texto, score ≥7)

---

## Meta Ads — Lo que aprendimos

### Top performers históricos
| Ad Set | Gasto | Compras | CPA | CTR |
|--------|-------|---------|-----|-----|
| 8.0 P1 | $1.095 | 103 | $10.63 | 2.99% |
| AD 3 P2 12/2 | $456 | 54 | $8.45 | 4.58% |
| 2.0 11.99 usd CP | $393 | 48 | $8.18 | 3.50% |
| 2.0 SG 40+65 | $38 | 6 | **$6.33** | 3.54% | ← mejor CPA, nunca escalado

### Copy ganador (8.0 P1)
Hook: *"¿Tus colegas están usando IA y vos todavía no sabés por dónde empezar?"*
Título: "+3.700 alumnos satisfechos" | CTA: LEARN_MORE

### Segmento sin escalar (OPORTUNIDAD)
**40-65 años** → CPA $6.33 con solo $38 de gasto. Nunca fue escalado. Testear con $25/día.

### Campaña v2 lista para publicar
Config: `campaigns/2026-05-08-v2/config.json`
- AD 1: FOMO frío (35-60, intereses)
- AD 2: Prueba social María (lookalike compradores)
- AD 3: Retargeting (visitó LP, no compró)
Comando: `node publish.mjs campaigns/2026-05-08-v2/config.json`

---

## Contenido orgánico — Facebook

### Reglas fijas
- **Solo Facebook** — no usa Instagram
- **1 post por día**, yo genero los 7 cada lunes
- Sin reels, sin videos, sin fotos de IA solas

### Calendario semanal
| Día | Formato | Tipo |
|-----|---------|------|
| Lunes | Carrusel | Educativo / prompt IA |
| Martes | Texto | Problema consciente |
| Miércoles | Carrusel | Mito vs. Verdad |
| Jueves | Texto | Prueba social / dato |
| Viernes | Carrusel | Monetización / venta suave |
| Sábado | Texto | Inspiracional / reflexión |
| Domingo | Carrusel | Tema libre / novedad IA |

### Diseño aprobado por Jose
- ✅ Estilo 01 (educativo con prompt) — dark, gradiente violeta-cyan
- ✅ Estilo 03 (problema consciente) — dark, acento rojo
- ❌ Estilo 02 (mito-verdad) — no gustó, no repetir ese tono

### Qué aprendimos sobre el contenido
- Fotos de IA = genéricas = no paran el scroll
- Carruseles de texto con datos duros = SÍ funcionan
- Una foto real de Jose vale más que 10 imágenes generadas
- Cuando haya testimonios reales de alumnos → contenido #1

---

## Landing (sistemadeingresosdiariosia.com)

### Estado actual
- ✅ Headline fuerte: "Tu conocimiento periodístico es un negocio. Solo falta el sistema."
- ✅ Contador de urgencia 72h evergreen (localStorage)
- ✅ 3 placeholders de testimonios (esperando capturas WhatsApp de Jose)
- ❌ Sin testimonios reales con cara y resultado concreto — el problema más crítico
- ❌ Mismatch ad→landing: ads hablan de IA para aprender, landing habla de ingresos

### Fixes pendientes
1. Jose sube 3 capturas WhatsApp a `sistema-ingresos/img/testimonio-1/2/3.jpg`
2. Cambiar headline para mencionar IA explícitamente
3. Crear LP alternativa para ads con ángulo IA

---

## Pendientes — loops abiertos

| # | Qué | Acción requerida |
|---|-----|-----------------|
| 1 | Emails post-compra sin envío | Jose carga los 5 emails en Hotmart → Email marketing |
| 2 | Testimonios landing vacíos | Jose sube 3 capturas WhatsApp |
| 3 | Campaña v2 sin publicar | `node publish.mjs` + Jose activa en Meta |
| 4 | Monitor sin schedule | Configurar tarea programada diaria |
| 5 | Contenido orgánico sin programar | Jose programa posts en Business Suite |
| 6 | Segmento 40-65 sin escalar | Testear $25/día con copy ganador |
| 7 | Integrar image-reviewer en publish.mjs | Próxima sesión |

---

## El ICP (cliente ideal)

Periodista latinoamericana/o de **40-55 años**. 10+ años en medios. Siente el piso moverse — ve colegas más jóvenes usando IA que ella/él no domina. No fue despedido/a todavía, pero la señal ya llegó. Trabaja en Colombia, México, Ecuador o Chile. Usa Facebook más que Instagram. $17 USD no es barrera.

**Mercados top reales:** Ecuador, Puerto Rico, Colombia, México, EEUU hispano, Chile.
