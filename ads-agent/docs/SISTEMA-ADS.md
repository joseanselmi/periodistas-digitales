# SISTEMA DE CREACIÓN DE ADS — Meta Ads
**Producto: Sistema de Ingresos Diarios para Periodistas ($10 USD)**
**Última actualización: 2026-05-24**

---

## LA FILOSOFÍA

Cada campaña que publicamos es un experimento con hipótesis clara.
No improvisamos copy ni imágenes. Cada elemento viene del playbook.
Si algo no está en el sistema, primero lo documentamos, después lo corremos.

Regla de oro: **1 variable por test**. Si probamos copy nuevo, usamos creativo probado. Si probamos creativo nuevo, usamos copy probado.

---

## EL PROCESO — 6 PASOS

### Paso 1 — Brief (antes de escribir una sola línea)
Abrir `playbooks/brief-template.md`, copiar a la carpeta de campaña, llenar los campos.
Sin brief completo, no hay campaña.

### Paso 2 — Copy
Ir a `playbooks/copy-bank.md`, elegir el ángulo que corresponde al test.
Si el ángulo no existe: escribir el copy, agregarlo al banco, entonces usarlo.

### Paso 3 — Creativo
Ir a `playbooks/creative-bank.md`, elegir el tipo de imagen.
Generar con `node lib/fal.mjs` o con el prompt en Midjourney/fal.ai.
Revisar con `node lib/image-reviewer.mjs`.

### Paso 4 — Config JSON
Copiar `campaigns/TEMPLATE/config.json`, completar con datos del brief, copy y creativo.
Naming convention: `campaigns/YYYY-MM-DD[-v2]/config.json`

### Paso 5 — Revisión
Correr: `node scripts/agentes/audit-cmo.mjs` sobre el config antes de publicar.
Check: ¿El copy matchea el nivel de consciencia del segmento? ¿El CPA máximo está seteado?

### Paso 6 — Publicar
```bash
node scripts/publicar/publish.mjs campaigns/YYYY-MM-DD/config.json
```
El script publica todos los ad sets como PAUSED. Activar manualmente en Meta.
Registrar en `results/tracking.md` con fecha de inicio y presupuesto.

---

## NAMING CONVENTION

### Campaña (nivel campaña en Meta)
```
[YYYY-MM-DD] — [Producto] — [Versión]
Ejemplo: "2026-05-24 — SID — v3"
```

### Ad Set (nivel ad set en Meta)
```
AD [N] — [ÁNGULO] — [SEGMENTO]
Ejemplo: "AD 1 — FOMO frío — 40-60 intereses"
Ejemplo: "AD 2 — Prueba social — Lookalike 1%"
Ejemplo: "AD 3 — Retargeting — LP 14d"
```

### Ad (nivel anuncio en Meta)
```
[ÁNGULO CORTO] [FORMATO] [FECHA]
Ejemplo: "FOMO IMG-V 24/05"
Ejemplo: "PRUEBA-SOC IMG-C 24/05"
```

**Formatos:** IMG-V (imagen vertical 9:16), IMG-C (cuadrado 1:1), CAR (carrusel), VID (video)

---

## CARPETA DE CAMPAÑA — ESTRUCTURA

```
campaigns/
└── YYYY-MM-DD/
    ├── brief.md          ← Brief completado (copiar template)
    ├── config.json       ← Config para scripts/publicar/publish.mjs
    ├── copies/
    │   ├── ad-1-fomo.txt
    │   ├── ad-2-social.txt
    │   └── ad-3-retargeting.txt
    └── creatives/
        ├── ad-1-prompt.txt
        ├── ad-2-prompt.txt
        └── notas-imagen.md
```

---

## REGLAS DE GESTIÓN

### Cuándo pausar
- 4 días corriendo + $20 gastados + 0 compras → PAUSAR
- CPA > $18 sostenido por 3 días → PAUSAR y revisar
- CTR < 1% a los 2 días → el creativo no engancha → CAMBIAR IMAGEN primero

### Cuándo escalar
- CPA < $12 por 3 días consecutivos → subir budget +30%
- CPA < $8 → escalar agresivo (×2 budget)
- **Oportunidad activa:** Segmento 40-65 tuvo CPA $6.33 — nunca escalado

### Cuándo testear variante nueva
- Ad set activo > 7 días + CPA estable → duplicar + cambiar 1 variable
- Siempre pausar el original antes de escalar el ganador

### Budget base por ad set
| Tipo | Budget diario |
|------|--------------|
| Frío (intereses) | $10/día |
| Lookalike 1% | $10/día |
| Retargeting | $5/día |
| Test nuevo | $7/día mínimo |

---

## HERRAMIENTAS Y COMANDOS

| Acción | Comando |
|--------|---------|
| Publicar campaña | `node scripts/publicar/publish.mjs campaigns/YYYY-MM-DD/config.json` |
| Auditar campaña | `node scripts/agentes/audit-cmo.mjs` |
| Revisar imagen | `node lib/image-reviewer.mjs` |
| Ver métricas | `META_ACCESS_TOKEN=x node scripts/datos/fetch-meta.mjs` |
| Monitor diario | `META_ACCESS_TOKEN=x node scripts/agentes/monitor.mjs` |

---

## SEGMENTOS — LO QUE SABEMOS

| Segmento | CPA histórico | Estado |
|----------|--------------|--------|
| 40-65 SG (todos países) | $6.33 | ⚠️ Nunca escalado — prioridad |
| 35-60 intereses | $10.63 | ✅ Probado y funciona |
| Lookalike 1% compradores | $8.18–$8.45 | ✅ Probado y funciona |
| 25-65 worldwide | Sin filtrar — evitar | |

**Países top:** Ecuador, Puerto Rico, Colombia, México, EEUU hispano, Chile.
**Excluir siempre:** IN, LY, MZ, PK, SG, VE, AU, BR, TW, BD, NI

---

## HISTORIAL DE CAMPAÑAS

| Fecha | Versión | Estado | Resultado |
|-------|---------|--------|-----------|
| 2026-01-26 | v1 (Ventas 26/1) | Finalizada | 20 versiones, $4.364 total, 346 compras |
| 2026-05-08 | v2 | ⏸️ Lista, sin publicar | 3 ad sets listos |
| — | v3 | 🔲 Por crear | — |

---

## PRÓXIMA ACCIÓN

La campaña v2 (`campaigns/2026-05-08-v2/config.json`) está lista.
Antes de lanzarla, completar:
1. ☐ Imágenes generadas y aprobadas para los 3 ad sets
2. ☐ Brief completado en `campaigns/2026-05-08-v2/brief.md`
3. ☐ Testimonios en la landing (sin testimonios, el CPA va a subir)
4. ☐ `node scripts/publicar/publish.mjs campaigns/2026-05-08-v2/config.json`
