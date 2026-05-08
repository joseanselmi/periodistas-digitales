# Fase 3 — Vista de clase

**Estado:** Completada
**Fecha:** 2026-04-20

---

## Que se hizo

Creacion de la vista individual de clase con video embed, slides embed, boton de marcar como vista, y proteccion por plan.

---

## Archivos creados

### app/clase/[id]/page.tsx (Server Component)
Carga desde Supabase:
- Perfil del usuario (plan)
- La clase por ID (solo published)
- Si el usuario ya la marco como vista

Protecciones:
- Sin sesion → redirect a `/login`
- Clase no encontrada → `notFound()` (404)
- Clase pro + usuario basic → redirect a `/dashboard`

### app/clase/[id]/clase-client.tsx (Client Component)
UI de la vista de clase:
- Navbar con boton volver y breadcrumb del grupo
- Titulo, descripcion y badge de plan
- Video embed de YouTube si tiene `video_url`
- Slides embed (iframe) si tiene `slides_url` y no tiene video
- Placeholder si no tiene ninguno
- Boton "Marcar como vista" que llama a Supabase y persiste en `user_progress`
- Toast de confirmacion al marcar
- Seccion de recursos (placeholder por ahora)

---

## Logica del video embed

```tsx
// Si tiene video YouTube
<iframe src={`https://www.youtube.com/embed/${clase.video_url}`} />

// Si tiene slides HTML en Storage
<iframe src={clase.slides_url} />

// Si no tiene nada
<div>Contenido proximamente</div>
```

---

## Logica de marcar como vista

```ts
await supabase.from('user_progress').upsert({
  user_id: user.id,
  class_id: clase.id
})
```

Usa `upsert` para que sea idempotente — si ya existe la fila no da error.
El boton queda deshabilitado y con estilo verde tras marcar.

---

## Tests ejecutados

| Test | Resultado |
|---|---|
| GET /clase/1 sin sesion | 307 redirect a /login |
| Type check archivos | Sin errores |
| Clase pro + usuario basic | 307 redirect a /dashboard |
| Clase no existente | 404 |
| Marcar como vista | Persiste en user_progress |

---

## Notas

- `video_url` almacena solo el ID del video de YouTube (ej: `dQw4w9WgXcQ`), no la URL completa
- `slides_url` almacena la URL publica del archivo HTML en Supabase Storage
- El campo `audio_urls` (JSONB) se usa en la Fase 6 para el modo v2 con ElevenLabs
