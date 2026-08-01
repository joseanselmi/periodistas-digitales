# MATRIZ DE TESTS — Sistema de Ingresos Diarios
**Regla:** 1 variable por test. Siempre.
**Ciclo de vida de un test:** mínimo 4 días, máximo 14 días por ronda.

---

## JERARQUÍA DE QUÉ TESTEAR PRIMERO

```
COPY > CREATIVO > SEGMENTO > LANDING > PRECIO
```

Probar copy nuevo antes que imagen nueva.
Probar imagen nueva antes que segmento nuevo.
El precio solo cuando todo lo demás está estable.

---

## RONDA ACTUAL — v2 (lista para publicar)

**Objetivo:** Validar los 3 ángulos con los mejores formatos conocidos.
**Variable que se testa:** Ángulo de copy (3 simultáneos).
**Creativo:** Mismo tipo en todos (imagen vertical, persona real).

| Ad Set | Copy | Creativo | Segmento | Budget/día |
|--------|------|----------|----------|------------|
| AD 1 | 1B (redacción) | Tipo 1A | Intereses fríos 35-60 | $10 |
| AD 2 | 4A (María) | Tipo 2A | Lookalike 1% compradores | $10 |
| AD 3 | 5A (qué te frenó) | Tipo 3A | Retargeting LP 14d | $5 |

**Ganador:** El que tenga menor CPA al día 7.
**Siguiente paso:** Ganador de copy × imagen nueva (Ronda v3).

---

## RONDA v3 (próxima — diseñar cuando v2 tenga 7 días de data)

**Objetivo:** Escalar el copy ganador con imagen nueva.
**Variable que se testa:** Creativo (misma imagen tipo vs. nueva variante).

| Ad Set | Copy | Creativo | Segmento | Budget/día |
|--------|------|----------|----------|------------|
| AD 1 | Ganador v2 | Tipo 1A (probado) | Intereses fríos 40-55 | $15 |
| AD 2 | Ganador v2 | Tipo 1B (nuevo — hombre café) | Intereses fríos 40-55 | $15 |
| AD 3 | 5A retargeting | Tipo 3A | Retargeting LP 14d | $5 |

**Ganador:** La imagen con menor CPA.
**Siguiente paso:** Escalar el ganador de copy+imagen al segmento nunca escalado.

---

## RONDA v4 — EL SEGMENTO OPORTUNIDAD (prioritario)

**Objetivo:** Escalar el segmento 40-65 que tuvo CPA $6.33 — nunca escalado.
**Variable que se testa:** Segmento (rango de edad expandido vs. estándar).

| Ad Set | Copy | Creativo | Segmento | Budget/día |
|--------|------|----------|----------|------------|
| AD 1 | Ganador v3 | Ganador v3 | 40-65 worldwide | $25 |
| AD 2 | Ganador v3 | Ganador v3 | 35-60 intereses (control) | $15 |
| AD 3 | 5A retargeting | Tipo 3A | Retargeting LP 14d | $5 |

**Hipótesis:** El segmento 40-65 tiene CPA $6.33 en escala pequeña. Si aguanta < $10 con $25/día, tenemos el segmento ganador.
**Umbral de éxito:** CPA < $12 con $25/día por 5 días.

---

## RONDA v5 — TEST DE LANDING

**Objetivo:** Validar si los testimonios en la LP mejoran el CPA.
**Variable que se testa:** URL de landing (LP con testimonios vs. LP actual).
**Precondición:** Testimonios cargados en `sistema-ingresos/img/`.

| Ad Set | Copy | Creativo | Landing | Budget/día |
|--------|------|----------|---------|------------|
| AD 1 | Ganador | Ganador | LP actual | $15 |
| AD 2 | Ganador | Ganador | LP + testimonios | $15 |

**Hipótesis:** Los testimonios vacíos son el problema de conversión más grande. Llenar los 3 slots puede bajar el CPA -30%.

---

## TESTS COPY PENDIENTES (cuando haya creativo estable)

| Test | Copy A | Copy B | Hipótesis |
|------|--------|--------|-----------|
| Género protagonista | 4A (María) | 4B (Carlos) | ¿Importa el género del caso de éxito? |
| Hook señal vs. colegas | 1A (colegas) | 1C (señal) | Hook más sofisticado para periodistas experimentados |
| Precio en párrafo 1 | 3A (directo) | 3B (almuerzo) | ¿Nombrar $10 al inicio baja o sube CPA? |
| Retargeting garantía | 5A (fricción) | 5B (riesgo cero) | ¿El ángulo de garantía convierte más que el de fricción? |

---

## CALENDARIO DE TESTS SUGERIDO

```
Semana 1-2 (v2):    Publicar → medir copy ganador
Semana 3-4 (v3):    Creativo nuevo vs. probado
Semana 5-6 (v4):    Segmento 40-65 a $25/día
Semana 7-8 (v5):    Landing con testimonios vs. actual
Semana 9+ :         Escalar el combo ganador agresivamente
```

---

## REGISTRO DE RESULTADOS

Actualizar `results/tracking.md` al final de cada ronda.

**Qué registrar:**
- Fecha inicio / fin
- Copy y creativo testeados
- CTR, CPA, compras por ad set
- Decisión: pausar / escalar / continuar
- Aprendizaje principal (1 línea)
