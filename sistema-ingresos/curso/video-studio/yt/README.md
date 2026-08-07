# yt/ — el canal de YouTube del curso

Las clases se suben al canal **Tufuturoconia** como **"No listado"** y se embeben en Hotmart Club
(así no se paga el reproductor de Hotmart). Estos scripts hablan con la API de YouTube usando
`token.json` (OAuth ya autorizado) — **hay que correrlos parados en esta carpeta**, porque buscan
`token.json` y `client_secret.json` relativos al directorio actual.

```bash
cd C:\Users\Jose Anselmi\remotion-curso\yt
python yt_check.py
```

## Los scripts

| Script | Qué hace |
|---|---|
| `yt_auth.py` | Genera `token.json` la primera vez (o cuando caduca el permiso). |
| `yt_upload.py` | Sube la versión **oficial** de una clase: título, descripción, playlist, manifest. |
| `yt_borrador.py` | Sube un **borrador** (voz provisoria) para que Jose lo revise. Queda fuera de la playlist y del manifest a propósito. |
| `yt_oficializar.py` | Convierte un video ya subido en oficial: corrige título/descripción, lo mete en la playlist, lo anota en `manifest.json` y con `--borrar <id>` elimina el borrador viejo. |
| `yt_borrar.py` | Borra videos por id: `python yt_borrar.py <id> [<id> ...]`. Avisa si un id ya no existe, así que es seguro re-correr la misma lista. |
| `yt_check.py` | Lista las playlists "SID" con sus videos. Chequeo rápido de que una clase quedó donde va. |
| `yt_limpiar_playlist.py` | Saca de una playlist los ítems que ya no apuntan a ningún video. |
| `manifest.json` | El registro de qué clase es qué video. Lo escriben `yt_upload.py` / `yt_oficializar.py`. |

## Antes de borrar un video — leer esto

**El borrado de YouTube es irreversible: no hay papelera.** Y el repo NO es fuente de verdad sobre
qué se está usando: el 2026-07-31 ninguno de los 19 videos del curso viejo estaba referenciado en
el repo, y sin embargo seguían embebidos en Hotmart con vistas de alumnos.

Antes de pasarle un id a `yt_borrar.py`:

1. **Mirar las vistas y las playlists del video.** Si tiene vistas, un alumno lo miró: es contenido
   entregado, no un descarte. La API de YouTube da las dos cosas
   (`videos().list(part="statistics")` y recorrer `playlistItems` de cada playlist).
2. **Preguntar si Hotmart todavía lo embebe.** Un video huérfano en el canal es inofensivo; uno
   embebido que se borra deja el reproductor vacío para todos los alumnos que ya compraron.
3. **Si el módulo nuevo que lo reemplaza todavía no está publicado, no se borra.** Por eso las 4
   clases de "🎓 Módulo 4" siguen en pie: el M4 nuevo está esperando cuota de ElevenLabs.

## Estado del canal al 2026-07-31

59 videos. 28 son el curso actual (`SID · Mx · y.z`). Quedan en pie a propósito las 4 clases viejas
de Módulo 4 y los videos de order bumps / bonos. Se borraron las 15 clases del curso viejo de los
Módulos 1, 2 y 3, ya reemplazadas por las clases SID publicadas.
