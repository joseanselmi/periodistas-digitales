# Fase 6 — Audio con ElevenLabs

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Generacion de narración de audio por slide usando ElevenLabs TTS. Los MP3 se suben a Supabase Storage y se embeben en el HTML de slides para autoplay al cambiar de slide.

---

## Cambios en base de datos

```sql
ALTER TABLE classes 
ADD COLUMN slides_json jsonb,   -- guarda el array de slides para poder re-generar audio
ADD COLUMN audio_urls jsonb;    -- array de URLs de MP3 por slide
```

---

## Archivos creados/modificados

### lib/slides-html.ts (modificado)
Nueva firma: `generateSlidesHTML(slides, brand?, audioUrls?)`

Si se pasan `audioUrls`:
- Cada slide activa su MP3 al mostrarse via `new Audio(url).play()`
- Indicador visual en top-right: "Reproduciendo" con icono de audio
- El audio anterior se detiene al cambiar de slide

### app/api/generate-audio/route.ts (nuevo)
API protegida (solo admins). Flujo:

1. Valida sesion y rol is_admin
2. Verifica que ELEVENLABS_API_KEY existe
3. Obtiene la clase y su `slides_json` de DB
4. Por cada slide: extrae texto de narración (campo `notes` o fallback del contenido)
5. Llama ElevenLabs en paralelo para todos los slides
6. Sube MP3s a Supabase Storage: `audio/classes/{classId}/slide-{i}.mp3` (upsert)
7. Re-genera HTML con audioUrls embebidos
8. Sube nuevo HTML a `slides/classes/{classId}-audio-{timestamp}/index.html`
9. Actualiza clase: `audio_urls = [...]`, `slides_url = newUrl`

Request body:
```json
{ "classId": 8, "brandColors": { ... } }
```

Response:
```json
{ "audioUrls": ["https://...mp3", ...], "slidesUrl": "https://...html" }
```

### app/api/generate-class/route.ts (modificado)
Ahora guarda `slides_json: classData.slides` al crear la clase, necesario para la generacion de audio posterior.

### app/admin/clase-form.tsx (modificado)
En modo edicion, si la clase tiene `slides_json`, aparece un panel al final:
- Boton "Generar audio con ElevenLabs" (violeta)
- Estado: spinner durante generacion, badge verde "Audio generado" al completar
- En caso de error: mensaje en rojo
- Al completar, actualiza `slides_url` en el form con la nueva URL (HTML con audio)

---

## Configuracion

```
ELEVENLABS_API_KEY=<key desde elevenlabs.io>
```

Voice ID usado: `21m00Tcm4TlvDq8ikWAM` (Rachel — soporta eleven_multilingual_v2)
Model: `eleven_multilingual_v2` (soporta español nativo)

---

## Texto de narración por tipo de slide

| Tipo | Texto usado |
|------|-------------|
| title | heading + subheading |
| content | title + subheading |
| bullets | title + bullets unidos |
| quote | quote + author |
| resources | title + items unidos |
| Cualquier tipo con `notes` | `notes` tiene prioridad |

---

## Tests ejecutados

| Test | Resultado |
|---|---|
| POST /api/generate-audio sin auth | 401 No autorizado |
| POST /api/generate-audio sin ELEVENLABS_API_KEY | 500 key no configurada |
| POST /api/generate-audio sin slides_json | 400 slides_json requerido |
| Type check archivos nuevos | Sin errores |
| HTML con audio generado | autoplay al cambiar slide |

---

## Notas

- Los MP3 se suben con `upsert: true` para que regenerar audio sobreescriba los anteriores en la misma ruta
- El HTML nuevo va a un path diferente (con timestamp) para evitar que el browser cachee el viejo
- Las clases generadas ANTES de Fase 6 no tienen `slides_json` — el panel de audio no aparece para esas clases
- Fase 7: QA completo + deploy a Vercel
