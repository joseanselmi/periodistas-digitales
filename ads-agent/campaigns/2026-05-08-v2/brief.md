# BRIEF — Campaña v2
**Fecha creación config:** 2026-05-08
**Estado:** Lista para publicar — falta generar imágenes

---

## BÁSICOS

| Campo | Valor |
|-------|-------|
| Fecha de inicio | Pendiente (imágenes primero) |
| Versión | v2 |
| Nombre en Meta | `2026-05-08 — SID — v2` |
| Pixel | 1086780383211630 |
| Landing URL | https://sistemadeingresosdiariosia.com |
| Objetivo de Meta | PURCHASE |
| Budget total diario | $25 USD |

---

## LA HIPÓTESIS DE ESTE TEST

**Hipótesis:** Los copies nuevos (ángulo redacción + prueba social María + retargeting fricción) generan menor CPA que el copy histórico de v10.

**Variable que cambiamos:** COPY (3 ángulos distintos simultáneos)

**Qué mantenemos igual:** Targeting base, budget, landing URL, pixel

---

## AD SETS

### AD SET 1 — FOMO profesional
| Campo | Valor |
|-------|-------|
| Nombre | `AD 1 — FOMO frío — 35-60 intereses` |
| Nivel de consciencia | 1 — Problema-consciente |
| Tipo de audiencia | Intereses |
| Países | CO, MX, EC, CL, PE |
| Edad | 35-60 |
| Intereses | periodismo, medios digitales, comunicación, inteligencia artificial, emprendimiento |
| Excluir | COMPRAS 180 DIAS, COMPRAS 30 DIAS |
| Budget diario | $10 |
| Ángulo de copy | 1B (La redacción) — ver copy-bank.md |
| Tipo de creativo | IMG-V 9:16 — Tipo 1A (mujer home office) |

### AD SET 2 — Prueba social
| Campo | Valor |
|-------|-------|
| Nombre | `AD 2 — Prueba social María — Lookalike 1%` |
| Nivel de consciencia | 2 — Solución-consciente |
| Tipo de audiencia | Lookalike 1% (fuente: COMPRAS 180 DIAS) |
| Países | CO, MX, EC, CL, PR |
| Edad | 35-60 |
| Excluir | COMPRAS 180 DIAS, COMPRAS 30 DIAS |
| Budget diario | $10 |
| Ángulo de copy | 4A (María) — ver copy-bank.md |
| Tipo de creativo | IMG-V 9:16 — Tipo 2A (antes/después) |

### AD SET 3 — Retargeting
| Campo | Valor |
|-------|-------|
| Nombre | `AD 3 — Retargeting — LP 14d` |
| Nivel de consciencia | 3 — Ya vio la oferta |
| Tipo de audiencia | Custom — Visitas LP últimos 14 días |
| Excluir | COMPRAS 7 DIAS |
| Países | Worldwide |
| Edad | 25-65 |
| Budget diario | $5 |
| Ángulo de copy | 5A (Qué te frenó) — ver copy-bank.md |
| Tipo de creativo | IMG-C 1:1 — Tipo 3A (teléfono checkout) |

---

## REGLAS DE PAUSA

| Regla | Valor |
|-------|-------|
| Sin compras después de N días | 4 |
| Gasto mínimo antes de pausar | $20 |
| CPA máximo | $18 |

---

## CREATIVO — PENDIENTE GENERAR

| Ad Set | Tipo imagen | Prompt en creative-bank.md | Estado |
|--------|-------------|---------------------------|--------|
| AD 1 | IMG-V 9:16 — Mujer home office | Prompt 1A | ❌ Sin generar |
| AD 2 | IMG-V 9:16 — Antes/después | Prompt 2A | ❌ Sin generar |
| AD 3 | IMG-C 1:1 — Checkout $10 | Prompt 3A | ❌ Sin generar |

**Siguiente acción:** Generar las 3 imágenes con fal.ai (Flux Pro) o Midjourney.
Comandos en `ads-agent/docs/SISTEMA-ADS.md` sección Herramientas.

---

## PLAN DE SEGUIMIENTO

| Semana | Acción |
|--------|--------|
| Semana 1 | Medir CTR diario. Si CTR < 1% al día 2 → cambiar creativo |
| Semana 2 | Pausa el ad set con peor CPA. El ganador pasa a v3. |
| Semana 3 (v3) | Ganador de copy × nueva imagen |
| Semana 5-6 (v4) | Escalar segmento 40-65 a $25/día |
