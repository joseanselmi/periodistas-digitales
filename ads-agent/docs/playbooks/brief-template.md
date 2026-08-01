# BRIEF DE CAMPAÑA
**Copiar este archivo a `campanas/historico/YYYY-MM-DD/brief.md` y completar todos los campos.**

---

## BÁSICOS

| Campo | Valor |
|-------|-------|
| Fecha de inicio | YYYY-MM-DD |
| Versión | v? |
| Nombre en Meta | `YYYY-MM-DD — SID — v?` |
| Pixel | 1086780383211630 |
| Landing URL | https://sistemadeingresosdiariosia.com |
| Objetivo de Meta | PURCHASE / LEAD |
| Budget total diario | $____ USD |

---

## LA HIPÓTESIS DE ESTE TEST

> ¿Qué estamos probando en esta campaña que NO probamos antes?

**Ejemplo:** "Nunca escalamos el segmento 40-65. Creemos que con $25/día puede sostener CPA < $8."

**Hipótesis:** ___________________________________________

**Variable que cambiamos:** COPY / CREATIVO / SEGMENTO / LANDING / PRECIO
(solo una por campaña)

**Qué mantenemos igual:** ___________________________________________

---

## AD SETS

### AD SET 1
| Campo | Valor |
|-------|-------|
| Nombre | `AD 1 — [ÁNGULO] — [SEGMENTO]` |
| Nivel de consciencia | 1-Problema / 2-Solución / 3-Producto |
| Tipo de audiencia | Intereses / Lookalike / Retargeting |
| Países | |
| Edad | - |
| Intereses | |
| Audiencia personalizada | |
| Excluir | COMPRAS 180 DIAS / COMPRAS 30 DIAS |
| Budget diario | $____ |
| Optimización | OFFSITE_CONVERSIONS |
| Ángulo de copy | (ver copy-bank.md) |
| Tipo de creativo | IMG-V / IMG-C / CAR |

### AD SET 2
| Campo | Valor |
|-------|-------|
| Nombre | `AD 2 — [ÁNGULO] — [SEGMENTO]` |
| Nivel de consciencia | |
| Tipo de audiencia | |
| Países | |
| Edad | - |
| Audiencia personalizada | |
| Excluir | |
| Budget diario | $____ |
| Ángulo de copy | |
| Tipo de creativo | |

### AD SET 3 (Retargeting — siempre)
| Campo | Valor |
|-------|-------|
| Nombre | `AD 3 — Retargeting — LP 14d` |
| Nivel de consciencia | 3 — Ya vio la oferta |
| Tipo de audiencia | Custom — Visitas LP 14 días |
| Excluir | COMPRAS 7 DIAS |
| Budget diario | $5 |
| Copy | (usar copy de retargeting del banco) |
| Tipo de creativo | IMG-C (cuadrado — feed) |

---

## REGLAS DE PAUSA (copiar al config.json)

| Regla | Valor |
|-------|-------|
| Sin compras después de N días | 4 |
| Gasto mínimo antes de pausar | $20 |
| CPA máximo | $18 |

---

## CREATIVO — RESUMEN

| Ad Set | Tipo imagen | Persona | Resultado visible en pantalla |
|--------|-------------|---------|-------------------------------|
| AD 1 | IMG-V 9:16 | Mujer 40s, casa | Sí |
| AD 2 | IMG-V 9:16 | Antes/después | Sí |
| AD 3 | IMG-C 1:1 | Checkout $10 | Sí |

---

## PLAN DE SEGUIMIENTO

| Semana | Acción |
|--------|--------|
| Semana 1 | Medir CTR + LP views. Si CTR < 1% en 2 días → cambiar creativo |
| Semana 2 | Pausa el peor. Ganador de copy × nueva imagen |
| Semana 3 | Escalar ganador si CPA < $12 |
| Semana 4 | Documentar resultados en `results/tracking.md` |

---

## NOTAS ADICIONALES

_________________
