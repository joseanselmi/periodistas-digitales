# Fase 5 — Generación de clases con Claude

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Flujo completo de generacion de clases con IA: Claude genera el contenido, se convierte a HTML con brand identity, se sube a Supabase Storage y se crea la clase como borrador.

---

## Supabase Storage

Dos buckets creados:
- `slides` — archivos HTML de presentaciones (max 5MB, publico)
- `audio` — archivos MP3 para modo v2 (max 50MB, publico)

Politicas RLS:
- Lectura publica para ambos buckets
- Escritura solo para admins (`is_admin = true`)

---

## Archivos creados

### lib/slides-html.ts
Helper que convierte un array de slides JSON a un archivo HTML standalone.

Tipos de slide disponibles:
- `title` — slide de portada con heading y subheading
- `content` — titulo + parrafo de desarrollo
- `bullets` — titulo + lista de puntos
- `quote` — cita con autor
- `resources` — lista numerada de recursos

Cada HTML generado incluye:
- Navegacion prev/next con teclado
- Barra de progreso por slide
- Brand identity aplicada via CSS inline (colores desde BrandConfig)
- Responsive con aspect-ratio 16:9

### app/api/generate-class/route.ts
API Route protegida (solo admins). Flujo:

1. Valida sesion y rol is_admin
2. Llama a Claude claude-opus-4-7 con system prompt estructurado
3. Extrae JSON del response (maneja markdown accidental con regex)
4. Genera HTML con `generateSlidesHTML()` y brand colors opcionales
5. Sube HTML a Supabase Storage en `slides/classes/{timestamp}/index.html`
6. Crea registro en `classes` con status `draft` y `slides_url` = URL publica

Request body:
```json
{
  "instruction": "Texto de instruccion para Claude",
  "groupId": 1,
  "plan": "basic",
  "brandColors": {
    "primary": "#22D3EE",
    "secondary": "#7C3AED",
    "bg": "#020617",
    "surface": "#0F172A",
    "text": "#F8FAFC"
  }
}
```

Response:
```json
{
  "class": { "id": 8, "title": "...", "status": "draft", ... },
  "slidesUrl": "https://...supabase.co/storage/v1/object/public/slides/..."
}
```

### app/admin/generar-clase/page.tsx + generar-clase-client.tsx
UI de generacion con 3 pasos:

**Paso 1 — Formulario:**
- Textarea para la instruccion (prompt libre)
- Select de grupo y plan
- Color pickers para brand identity (primary, secondary, bg) con preview live

**Paso 2 — Pipeline animado:**
- 4 pasos con iconos: Claude → HTML → Storage → DB
- Spinner en el paso activo, checkmark verde en completados
- Progreso simulado mientras la API responde (~15-30 seg)

**Paso 3 — Resultado:**
- Preview de slides embebido en iframe
- Botones: Editar y publicar / Ir al admin / Generar otra

### app/admin/admin-client.tsx (modificado)
Agregados dos botones en navbar:
- "Generar con IA" (violeta) → /admin/generar-clase
- "+ Manual" (cyan) → /admin/nueva-clase

---

## System prompt de Claude

```
Eres un experto en educación digital y periodismo. Generas clases en formato de presentación.
Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.
...
Genera entre 6 y 10 slides. Siempre empieza con type:title y termina con type:resources.
```

---

## Configurar ANTHROPIC_API_KEY

Agregar en `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Y en Vercel para produccion:
```bash
vercel env add ANTHROPIC_API_KEY production
```

---

## Tests ejecutados

| Test | Resultado |
|---|---|
| POST /api/generate-class sin auth | 401 No autorizado |
| POST /api/generate-class sin instruccion | 400 Instruccion requerida |
| Type check archivos nuevos | Sin errores |
| HTML generado con brand colors | OK |
| Slides con navegacion prev/next | OK |

---

## Notas

- El modelo usado es `claude-opus-4-7` para mejor calidad de contenido
- El JSON de Claude se extrae con regex por si viene con markdown accidental
- Los slides HTML son completamente standalone (no necesitan CDN ni JS externo)
- El `timestamp` en el path de Storage evita colisiones entre clases
- Fase 6 (ElevenLabs audio) reutiliza el mismo flujo agregando generacion de MP3 por slide
