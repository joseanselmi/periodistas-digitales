# ads-agent/scripts — todos los ejecutables

**Padre:** [`ads-agent/`](../README.md)

Agrupados por **lo que hacen**, no por el tema que tocan. Si dudás dónde va uno
nuevo, la pregunta es "¿qué hace?": trae datos, decide, genera, programa,
publica, exporta.

| Carpeta | Qué hace |
|---|---|
| [`datos/`](datos/README.md) | Lee plataformas externas y baja la información |
| [`agentes/`](agentes/README.md) | Mira esos datos y saca una conclusión |
| [`generar/`](generar/README.md) | Crea las piezas de contenido y los creativos |
| [`programar/`](programar/README.md) | Carga el calendario de orgánico |
| [`publicar/`](publicar/README.md) | ⚠️ Sale al mundo: anuncios, posts, emails |
| [`exportar/`](exportar/README.md) | Pasa a archivo final (PDF, JPG) + linter |
| [`curso/`](curso/README.md) | Transcribe el curso de Hotmart |
| [`utiles/`](utiles/README.md) | Lo que no entra en ninguno |

> **Se corren parados en `ads-agent/`, no acá dentro.** Varios buscan
> `.env.local` o `state/` relativos a esa carpeta:
> `cd ads-agent && node scripts/datos/fetch-meta.mjs`.

Después de mover o renombrar cualquiera de estos archivos, correr
`node herramientas/verificar-repo.mjs` desde la raíz del repo: chequea que los imports y los
anclajes de ruta sigan resolviendo, sin ejecutar nada.
