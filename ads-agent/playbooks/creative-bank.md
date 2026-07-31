# BANCO DE CREATIVOS — Sistema de Ingresos Diarios
**Formatos:** IMG-V (9:16 vertical, Stories/Reels) · IMG-C (1:1 cuadrado, Feed) · CAR (carrusel)
**Estilo aprobado:** Fotorrealismo cinematográfico. Dark editorial. Sin texto en imagen. Sin stock smiles.

---

## REGLAS DE IMAGEN (no negociables)

1. **Sin texto superpuesto en la imagen.** El copy va en el campo de texto del ad.
2. **Cara visible, expresión real.** Ni sonrisa forzada ni cara seria performativa. Orgullo y concentración.
3. **Resultado visible en pantalla.** El monitor o laptop SIEMPRE muestra un periódico digital en español.
4. **Periodista latinoamericano/a.** Rasgos LATAM, 40-55 años. No europeo, no anglosajón.
5. **Ambiente hogareño o cafetería urbana.** No oficina corporativa. No coworking genérico.
6. **Paleta oscura.** Fondo oscuro con luz cálida (lámpara) contrastando luz fría (pantalla).
7. **Sin billetes, sin gráficos de dinero, sin cohetes.** Mostrar el medio digital, no el dinero.

---

## TIPO 1 — PERIODISTA EN CASA / RESULTADO VISIBLE
**Usar para:** Ángulo FOMO, Ángulo Directo
**Formato preferido:** IMG-V (9:16) para Stories y Reels

### Prompt 1A — Mujer, home office, noche
```
Cinematic dark editorial. Latin American journalist woman in her 40s, confident expression, sitting at a modern home desk at night. On her ultrawide monitor: a sleek Spanish-language digital newspaper she created, with articles, analytics showing reader growth. Warm lamp light contrasts with blue screen glow. Press badge on desk, notebook, coffee. No cash, no charts, no stock smile. She looks proud and focused. Ultra realistic, photojournalism + tech brand aesthetic. 9:16 vertical format. No text overlay.
```
**Notas:** Persona real, cara visible, resultado visible en pantalla. Resultado debe verse en el monitor.

### Prompt 1B — Hombre, café, laptop (nuevo)
```
Cinematic dark editorial. Latin American male journalist in his late 40s, sitting at a quiet urban café late at night. Open laptop on table showing a professional Spanish-language digital news site he built. Reading glasses on, coffee cup nearby, notepad. Warm café light, bokeh background. Expression: focused, quietly proud. No stock smile. No text on image. Ultra realistic, journalism aesthetic. 9:16 vertical format.
```

### Prompt 1C — Mujer, teléfono, notificaciones (para mobile-first)
```
Cinematic close-up. Latin American woman journalist in her 40s, at home at night, looking at her phone screen. The phone shows a push notification: "Tu periódico digital: 8.000 lectores". Soft smile, genuine. Dark background, warm lamp light. Cozy home environment. No text overlay on image. Ultra realistic, intimate mood. 9:16 vertical format.
```

---

## TIPO 2 — ANTES / DESPUÉS
**Usar para:** Ángulo Prueba Social
**Formato preferido:** IMG-V (9:16)

### Prompt 2A — Split composición (probado en v2)
```
Split composition, dark background. Left: stressed Latin American journalist woman in her 40s in a traditional newsroom, tired expression, fluorescent lights. Right: same woman transformed, confident, working from a beautiful home office at night, laptop showing her own digital newspaper in Spanish, warm light, relaxed smile. Visual contrast: before/after without text. Ultra realistic, cinematic grade, 9:16 vertical. No text overlay.
```
**Notas:** Misma persona, mismo estilo de ropa en ambos lados para coherencia visual.

### Prompt 2B — Timeline vertical (nuevo)
```
Vertical triptych editorial. Dark cinematic style. Latin American female journalist, same person across 3 frames top to bottom. Top: stressed, traditional newsroom, 2022. Middle: studying at home, laptop with online course, determined. Bottom: confident, home office, laptop showing her digital media site in Spanish, warm light. No captions, no text. Ultra realistic, documentary style. 9:16 vertical.
```

---

## TIPO 3 — MOMENTO DE DECISIÓN / RETARGETING
**Usar para:** Ángulo Retargeting
**Formato preferido:** IMG-C (1:1) para Feed

### Prompt 3A — Teléfono + checkout (probado en v2)
```
Dark editorial, close-up of a Latin American professional in their 40s looking at a phone screen at night. The phone screen glows showing a checkout page with '$10 USD' visible. Expression is thoughtful, almost decided. Warm backlight, dramatic shadows. No text overlays on image. Ultra realistic, intimate and personal mood. 1:1 square format for feed.
```

### Prompt 3B — Laptop abierta, mano en trackpad (nuevo)
```
Cinematic dark shot. Hands of a Latin American person in their 40s on a laptop keyboard. The screen shows a website checkout in Spanish with "$10 USD" visible and a "Comprar ahora" button. Warm desk lamp light from the side. Coffee cup nearby. No face needed — hands and screen only. Intimate, decisive mood. 1:1 square format. No text overlay.
```

---

## TIPO 4 — ABSTRACTO / EDITORIAL (para campañas de awareness)
**Usar para:** Campañas de branding, boost de posts orgánicos
**Formato preferido:** IMG-C (1:1) o IMG-V (9:16)

### Prompt 4A — Periódico digital flotando
```
Dark minimalist editorial. A sleek Spanish-language digital newspaper floating in dark space, glowing softly. Professional layout with news articles, clean typography. Surrounded by subtle data visualizations: reader count rising, engagement graphs. No specific brand logo. Futuristic but warm. Dark background, indigo and cyan accent lights. Ultra realistic render. 1:1 square.
```

### Prompt 4B — Mapa de LATAM + conexiones
```
Dark cinematic wide shot. Map of Latin America glowing with connected points between major cities — Bogotá, CDMX, Quito, Santiago, Miami. Each point pulses like a media node. On top, the silhouette of a journalist typing. Abstract but meaningful. Indigo and cyan palette, dark background. No text overlay. 16:9 landscape or 9:16 vertical.
```

---

## PROCESO DE GENERACIÓN

1. Copiar el prompt del banco
2. Generar en el chat **📣 Ads** del proyecto de ChatGPT — ver
   [`../docs/CHATGPT-IMAGENES.md`](../docs/CHATGPT-IMAGENES.md). (fal.ai/Midjourney/higgsfield
   quedaron fuera el 03/07/2026.)
3. Revisar contra las 7 reglas de imagen antes de aprobar
4. Si la imagen tiene texto en ella → rechazar, regenerar
5. Si la persona tiene rasgos europeos o anglosajones → rechazar, regenerar
6. Guardar en `campaigns/YYYY-MM-DD/creatives/` con nombre descriptivo

### Comando de revisión automática
```bash
node lib/image-reviewer.mjs ruta/a/imagen.jpg
```
Devuelve score de 0-10 y notas de mejora.

---

## COMBINACIONES PROBADAS (histórico)

| Copy | Imagen | CTR | CPA | Resultado |
|------|--------|-----|-----|-----------|
| 1A (FOMO colegas) | Tipo 1 (home office) | 2.99% | $10.63 | ✅ GANADOR — 103 compras |
| 4A (María) | Tipo 2 (antes/después) | 4.58% | $8.45 | ✅ Sólido |
| 5A (qué te frenó) | Tipo 3 (checkout) | — | — | ✅ Retargeting estándar |
| Directo | Tipo 1 variante | 8.3% | ∞ (0 compras) | ❌ CTR alto pero LP desconectada |

**Lección clave:** CTR alto no garantiza compras. Si CTR > 5% y CPA > $18, el problema está en la landing, no en el ad.

---

## PRÓXIMOS CREATIVOS A GENERAR

| Prioridad | Tipo | Prompt | Para qué ad |
|-----------|------|--------|-------------|
| 1 | 1A (mujer home office) | Prompt 1A | AD 1 — FOMO v2 |
| 2 | 2A (antes/después) | Prompt 2A | AD 2 — Prueba social v2 |
| 3 | 3A (checkout) | Prompt 3A | AD 3 — Retargeting v2 |
| 4 | 1B (hombre café) | Prompt 1B | Test género protagonista |
