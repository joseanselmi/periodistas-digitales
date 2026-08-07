# scripts/publicar — ⚠️ salen al mundo

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

**La única carpeta con efectos irreversibles.** Lo que corre acá publica un
anuncio, sube un post o manda un email a la lista real. No se ejecutan "para
probar".

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/publicar/publish.mjs`

- `post-facebook.mjs` — sube un posteo a la fanpage.
- `post-story.mjs` — publica la story del día (no se pueden programar: salen al
  instante). Es idempotente por día.
- `publish.mjs` — crea los anuncios en Meta a partir de un `config.json`. Quedan
  en pausa: los activa Jose a mano.
- `send-email.mjs` — las campañas de email por Brevo.
- `test-send.mjs` — ⚠️ manda **un email de verdad** a la dirección que le pases,
  no a una casilla de prueba fija. El cuerpo del mail está escrito a mano adentro
  y es el del mes gratis de Leadr de mayo de 2026: sirve para comprobar que el
  envío por Brevo funciona, no para previsualizar una campaña de hoy. El segundo
  argumento (la campaña) se lee pero no se usa.

Regla del proyecto: **ningún agente manda emails nuevos sin aprobación de Jose.**

## Limpieza del 07/08/2026

No se borró nada de esta carpeta. `test-send.mjs` parecía de un solo uso porque
el mail que manda es de mayo, pero es la única forma que hay de probar el envío
por Brevo, así que se dejó con la advertencia escrita arriba del archivo.
