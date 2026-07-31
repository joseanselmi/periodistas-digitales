# BRIEF — Campaña v3 (10 ads)

## BÁSICOS

| Campo | Valor |
|-------|-------|
| Fecha de inicio | 2026-06-21 |
| Versión | v3 |
| Nombre en Meta | `2026-06-21 — SID — v3` |
| Pixel | 1086780383211630 |
| Landing URL | https://sistemadeingresosdiariosia.com |
| Objetivo de Meta | PURCHASE |
| Budget total diario | $86 USD (suma de los 10 ad sets) |

## LA HIPÓTESIS DE ESTE TEST

**Hipótesis:** Replicar la fórmula ganadora histórica (FOMO + ángulo "IA + periodismo", CPA $10.63) en el producto actual ($10 USD) debería sostener un CPA similar o mejor, porque el ángulo ya está validado a escala. Los 3 ángulos exploratorios (testimonio narrativo, antes/después visual, mecanismo en pasos) buscan abrir una línea nueva si la fórmula vieja empieza a fatigarse.

**Variable que cambiamos:** ÁNGULO DE COPY + SEGMENTO (7 iteran sobre lo probado, 3 exploran terreno nuevo)

**Qué mantenemos igual:** Producto, precio ($10 USD), bono Leadr, garantía 7 días, estética de marca (paleta indigo/cyan, fondo oscuro #07070f), idioma "tú".

## RESUMEN DE LOS 10 ADS

| # | Nombre | Nivel consciencia | Fuente del ángulo |
|---|--------|---|---|
| 4 | FOMO colegas + IA | 1 | Réplica directa de "8.0 P1" (ganador histórico, 103 compras) |
| 5 | Prueba social + value stack | 2 | Réplica de "AD 3 P2" (54 compras, CPA $8.45) |
| 6 | Segmento 40-65 | 2 | Réplica de "2.0 SG 40+65" (mejor CPA histórico, $6.33) |
| 7 | Testimonio narrativo | 2 | **Exploratorio** — sin precedente histórico |
| 8 | Antes/después visual sin texto | 1 | **Exploratorio** — el creativo carga el mensaje, no el copy |
| 9 | Urgencia de precio | 3 | Variante de "IMG 1.0 LP1" (CTR 7.64%, el más alto del historial) |
| 10 | Mecanismo en 4 pasos | 2 | **Exploratorio** — apunta a audiencia racional/escéptica |
| 11 | Pregunta directa corta | 1 | Variante breve, inspirada en CTR alto de copies cortos ("AD 4 P2", 5.61%) |
| 12 | Retargeting + garantía | 3 | Variante de retargeting con foco en remoción de riesgo |
| 13 | Lookalike + identidad profesional | 2 | Ángulo de identidad ("sigues siendo periodista") |

## IMÁGENES GENERADAS

### AD 4 — FOMO colegas + IA
![ad-4](./images/ad-4-fomo-colegas-ia.jpg)

### AD 5 — Prueba social + value stack
![ad-5](./images/ad-5-prueba-social-bono.jpg)

### AD 6 — Segmento 40-65
![ad-6](./images/ad-6-segmento-40-65.jpg)

### AD 7 — Testimonio narrativo
![ad-7](./images/ad-7-testimonio-narrativo.jpg)

### AD 8 — Antes/después visual sin texto
![ad-8](./images/ad-8-antes-despues-visual.jpg)

### AD 9 — Urgencia de precio
![ad-9](./images/ad-9-urgencia-precio.jpg)

### AD 10 — Mecanismo en 4 pasos
![ad-10](./images/ad-10-mecanismo-bullets.jpg)

### AD 11 — Pregunta directa corta
![ad-11](./images/ad-11-pregunta-directa-ia.jpg)

### AD 12 — Retargeting + garantía
![ad-12](./images/ad-12-retargeting-garantia.jpg)

### AD 13 — Lookalike + identidad profesional
![ad-13](./images/ad-13-lookalike-identidad.jpg)

## REGLAS DE PAUSA

- Sin conversión en 4 días y $20 gastados → pausar y revisar.
- CPA > $18 en escala → pausar.
- Benchmark real de cuenta: CPA target $10.50, CTR mínimo aceptable 1.5%.

## PLAN DE TESTING

1. **Semana 1:** correr los 10 en paralelo, budgets bajos, sin pausar antes de $20 gastados por ad.
2. **Semana 2:** pausar los que no lleguen a CTR 1.5% o CPA > $18. Duplicar budget en los 2-3 ganadores.
3. **Semana 3:** sobre el copy ganador, testear una imagen distinta (mismo método que v2).
4. **Semana 4:** comparar el mejor "iteración" vs. el mejor "exploratorio" — si gana un exploratorio, abre la próxima tanda de ángulos.

**Pendiente antes de publicar:** generar las 10 imágenes con los prompts de `config.json` (ver `lib/fal.mjs` / `lib/image-reviewer.mjs`) y correr `node scripts/publicar/publish.mjs campanas/historico/2026-06-21/config.json` en modo PAUSED para revisión manual antes de activar.
