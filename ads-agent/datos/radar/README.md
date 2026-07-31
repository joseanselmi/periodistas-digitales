# ads-agent/radar — salida del radar de tendencias

**Padre:** [`ads-agent/`](../../README.md)

Lo que escribe [`../scripts/agentes/radar-tendencias.mjs`](../../scripts/agentes/README.md):
qué se está hablando hoy en las fuentes que seguimos, para pescar temas de
contenido antes de que se enfríen.

- `fuentes.json` — **lo único que se edita a mano**: qué cuentas y feeds se leen.
- `ultimo-argentina.md` — el informe más reciente (el que se lee).
- `argentina-<fecha>.md` — el histórico, un archivo por corrida.
- `vistos-<tema>.json` — memoria de lo ya reportado, para no repetir.

```bash
cd ads-agent
node scripts/agentes/radar-tendencias.mjs
```

Los `argentina-*.md` viejos se pueden borrar sin consecuencia: son historial.
