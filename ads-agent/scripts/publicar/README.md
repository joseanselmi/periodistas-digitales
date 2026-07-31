# scripts/publicar — ⚠️ salen al mundo

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

**La única carpeta con efectos irreversibles.** Lo que corre acá publica un
anuncio, sube un post o manda un email a la lista real. No se ejecutan "para
probar".

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/publicar/publish.mjs`

- `post-facebook.mjs`
- `post-story.mjs`
- `publish.mjs`
- `send-email.mjs`
- `test-send.mjs`

Regla del proyecto: **ningún agente manda emails nuevos sin aprobación de Jose.**
Para probar el envío está `test-send.mjs`, que apunta a una dirección de prueba.
