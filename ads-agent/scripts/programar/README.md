# scripts/programar — calendarios de orgánico

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Arman y cargan el calendario de publicaciones. Varios son **de una sola vez**:
llevan el mes en el nombre porque se escribieron para ese período concreto.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local`, `state/` o `hotmart-transcripts/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/programar/schedule-week.mjs`

- `schedule-agosto.mjs`
- `schedule-jun-jul-resto.mjs`
- `schedule-jun-jul.mjs`
- `schedule-mes.mjs`
- `schedule-muro.mjs`
- `schedule-week.mjs`

⚠️ Tope de Meta: **29 publicaciones programadas** a la vez, exactas. Las reglas
del arco de contenido están en [`../../docs/ESTRATEGIA-ORGANICO.md`](../../docs/ESTRATEGIA-ORGANICO.md).
