# CEREBRO — dónde está cada verdad del negocio

**Padre:** [`ads-agent/`](README.md) · Lo lee `/equipo` como paso 0 de cada sesión.

> **Este archivo no guarda datos, guarda direcciones.** Hasta el 2026-08-01 era
> una copia del negocio entero —precio, claves, campañas, calendario, pendientes—
> y quedó congelado el 27 de junio: daba a Leadr como parte de este repo, el ICP
> en 40-55 cuando es 30-55, seis mercados cuando son tres, y pendientes de mayo
> como si fueran de hoy. Todo eso ya tenía dueño en otro lado. Ahora apunta a esos
> dueños, que es lo único que no se pudre.

## La regla

Cada dato tiene **un solo dueño**. Si lo necesitás, andá al dueño. Si lo cambiás,
cambialo ahí. Copiarlo acá es cómo empezó el problema.

| Qué querés saber | Dueño | Cómo se mira |
|---|---|---|
| **Cómo va el negocio hoy** — ventas, leads, embudo, Trello | [`ESTADO.md`](../ESTADO.md) | `node herramientas/estado.mjs` (~40 s). **Se regenera, no se edita.** |
| **Precio, valor percibido, público, mercados, paleta, política de Meta** | [`lib/brand-context.mjs`](lib/brand-context.mjs) | Es el que leen los agentes. Fuente de verdad del copy |
| **Qué campañas gastan plata hoy** | [`campanas/README.md`](campanas/README.md) | Verificado contra Meta. Refrescar: `node scripts/datos/fetch-meta.mjs` |
| **Quién es cada agente y cómo se lo invoca** | [`cerebro/README.md`](cerebro/README.md) | Ahí está la lista completa. Si alguien no figura, no existe |
| **Qué hizo cada agente** | [`state/`](state/README.md) | Un JSON por agente |
| **Qué script hace qué** | [`scripts/README.md`](scripts/README.md) | Y un README por subcarpeta |
| **Historial de anuncios: qué se probó y qué pasó** | [`registro-anuncios.md`](registro-anuncios.md) · [`docs/HISTORICO-ADS.md`](docs/HISTORICO-ADS.md) | El histórico avisa que sus precios son viejos |
| **Cómo se mide todo** | [`../sistema-ingresos/docs/TRACKING.md`](../sistema-ingresos/docs/TRACKING.md) | De punta a punta |
| **Estrategia de orgánico** | [`docs/ESTRATEGIA-ORGANICO.md`](docs/ESTRATEGIA-ORGANICO.md) · [`docs/ORGANICO-MURO.md`](docs/ORGANICO-MURO.md) | |
| **Qué falta hacer** | Trello — tablero [Roadmap](https://trello.com/b/Bgt6wooU/roadmap-periodistas-digitales) | Sale en `ESTADO.md`. **No lleves pendientes a un `.md`**: se olvidan |

## Las claves

Están en `ads-agent/.env` y `ads-agent/.env.local`, **fuera de git**. La lista de
cuáles hacen falta está en [`.env.example`](.env.example) — ahí sin valores.

Acá había prefijos de esas claves y la ruta `leadr/app/.env.local`, que ya no
existe: Leadr se separó a `../Leadr` el 2026-06-27. Se sacaron el 2026-08-01.

## Lo que no cambia

Esto sí vive acá porque son identificadores fijos, no estado:

| | |
|---|---|
| Checkout | Hotmart `P106404871J` |
| Cuenta de Meta Ads | `act_583636631091469` |
| Página de Facebook | `439763019230527` — Periodistas del Futuro IA |
| App de Meta | `167913895328630` — "Periodistas digitales" |
| Dominio del curso | `sistemadeingresosdiariosia.com` → [`../sistema-ingresos/`](../sistema-ingresos/README.md) |
| Dominio de Leadr | `www.leadr.cloud` → **otro repo**, en `../Leadr`. No traer su código acá |
