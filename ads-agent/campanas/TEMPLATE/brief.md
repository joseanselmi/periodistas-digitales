# BRIEF — Campaña [VERSIÓN]
**Copiar este archivo a `campanas/<segmento>/brief.md` para cada campaña nueva** —
el nombre de la carpeta sale de la convención del [README de `campanas/`](../README.md).

---

## BÁSICOS

| Campo | Valor |
|-------|-------|
| Fecha de inicio | YYYY-MM-DD |
| Versión | v? |
| Nombre en Meta | `YYYY-MM-DD — SID — v?` |
| Pixel | 1086780383211630 |
| Landing URL | https://sistemadeingresosdiariosia.com |
| Objetivo de Meta | PURCHASE |
| Budget total diario | $____ USD |

---

## FICHA DEL FLUJO — qué mails recibe esta gente

**Obligatoria, aunque la campaña no mande ni un mail** (si no manda, se escribe "ninguna" y por
qué). Es el estándar desde el 2026-08-10 y hay que **registrarla también en
[`sistema-ingresos/docs/FLUJOS.md`](../../../sistema-ingresos/docs/FLUJOS.md)**, que es el
inventario único de todos los flujos. `node herramientas/verificar-repo.mjs` falla si una campaña
no aparece ahí.

| Pregunta | Respuesta |
|---|---|
| **¿Quiénes?** | De dónde salen las personas (lista de Brevo #?, tabla, formulario) y cuántas |
| **¿Día 0?** | Desde qué momento se cuentan los días |
| **¿Qué piezas y cuándo?** | La secuencia: día 0 → …. Poner quién manda cada una (Make / Brevo / código) |
| **¿Quién NO?** | A quién saltear: ya compró · se dio de baja · ya recibió algo hoy |
| **¿Tope y condiciones?** | Cuántos por día, y si algo retiene un envío (ej. no ofertar a quien nunca abrió) |
| **¿Qué motor la ejecuta?** | El archivo concreto. **Si la respuesta es "ninguno", la campaña captura y se detiene** |

> **Por qué esta ficha existe.** El 10/08/2026 se escribió el inventario y aparecieron dos huecos
> que llevaban semanas: `republicadores` capturaba leads y no les mandaba nada después de la guía
> —196 personas, con el anuncio activo y gastando— y el post-compra no existía. No se veían
> mirando el código: cada pieza por separado funcionaba y devolvía 200. **Lo que faltaba era el
> paso siguiente, que no estaba en ningún lado y por eso no fallaba.** La última fila es la que
> más atrapa: una campaña sin motor entrega su regalo y ahí termina.

---

## LA HIPÓTESIS DE ESTE TEST

**Hipótesis:** ___________________________________________

**Variable que cambiamos:** COPY / CREATIVO / SEGMENTO / LANDING
_(solo una)_

**Qué mantenemos igual:** ___________________________________________

---

## AD SETS

### AD SET 1
| Campo | Valor |
|-------|-------|
| Nombre | `AD 1 — [ÁNGULO] — [SEGMENTO]` |
| Nivel de consciencia | 1 / 2 / 3 |
| Tipo de audiencia | Intereses / Lookalike / Retargeting |
| Países | |
| Edad | - |
| Intereses | |
| Audiencia personalizada | |
| Excluir | COMPRAS 180 DIAS / COMPRAS 30 DIAS |
| Budget diario | $____ |
| Ángulo de copy | (ver copy-bank.md — Copy X) |
| Tipo de creativo | IMG-V / IMG-C / CAR |
| Prompt de imagen | (ver creative-bank.md — Tipo X) |

### AD SET 2
| Campo | Valor |
|-------|-------|
| Nombre | |
| Nivel de consciencia | |
| Tipo de audiencia | |
| Países | |
| Edad | |
| Budget diario | $____ |
| Ángulo de copy | |
| Tipo de creativo | |

### AD SET 3 — Retargeting (siempre incluir)
| Campo | Valor |
|-------|-------|
| Nombre | `AD 3 — Retargeting — LP 14d` |
| Tipo de audiencia | Custom — Visitas LP 14 días |
| Excluir | COMPRAS 7 DIAS |
| Budget diario | $5 |
| Copy | 5A o 5B (ver copy-bank.md) |
| Tipo de creativo | IMG-C 1:1 — Tipo 3 (ver creative-bank.md) |

---

## CREATIVO — ESTADO

| Ad Set | Tipo imagen | Prompt | Estado |
|--------|-------------|--------|--------|
| AD 1 | | | ❌ / ✅ |
| AD 2 | | | ❌ / ✅ |
| AD 3 | | | ❌ / ✅ |

---

## REGLAS DE PAUSA

| Regla | Valor |
|-------|-------|
| Sin compras después de N días | 4 |
| Gasto mínimo antes de pausar | $20 |
| CPA máximo | $18 |

---

## PLAN DE SEGUIMIENTO

| Semana | Acción |
|--------|--------|
| Semana 1 | Medir CTR + vistas de la landing. Si el CTR baja de 1% en 2 días → cambiar creativo |
| Semana 2 | Pausar el peor. Cruzar el copy ganador con una imagen nueva |
| Semana 3 | Escalar el ganador si el CPA baja de $12 |
| Semana 4 | Anotar el resultado en [`../../registro-anuncios.md`](../../registro-anuncios.md) |

> ⚠️ Un anuncio nuevo es un **test**: no se toca hasta ~$70 de gasto. Antes de eso
> los números no dicen nada. Diagnosticar por escalón —impresiones → clic →
> landing → checkout— en vez de mirar solo el CPA.

---

## NOTAS ADICIONALES

_________________
