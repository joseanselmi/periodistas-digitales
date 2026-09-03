# scripts/programar — calendarios de orgánico

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Arman y cargan el calendario de publicaciones en Facebook: dejan los posteos
agendados, no los publican en el momento.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node --env-file=.env.local scripts/programar/schedule-muro.mjs`

- `schedule-septiembre.mjs` — el arco "IA aplicada al periodista de a pie"
  (04→30/09). **Es el que se usa hoy y el modelo a copiar.** Además de leer la
  cola y saltear lo ya programado, tiene dos cosas propias:
  - **La lista de días no está escrita adentro.** Sale de
    [`../../contenido/carousels/ia-sept/CONTENIDO.mjs`](../../contenido/carousels/ia-sept/README.md),
    que es el mismo archivo que consume el generador. Un solo dueño del dato: no
    puede pasar que el calendario programe un día que el generador no escribió.
  - **Saltea los días marcados `NECESITA_DATO`** y los lista al final. Son los
    posteos de prueba social sin hecho verificado: quedan como huecos visibles en
    la cola, no como texto inventado.
  - `--dry` hace el ensayo completo sin subir nada.
- `schedule-muro.mjs` — la serie "el periodista del muro" (16 al 31 de agosto).
  Ya corrió y quedó como referencia; tiene el mes escrito adentro.

Los dos son **idempotentes**: leen primero la cola de Facebook y saltean las
fechas ya programadas, así se pueden re-correr para meter los que rebotan por el
tope de Meta.

⚠️ Tope de Meta: **29 publicaciones programadas** a la vez, exactas. Las reglas
del arco de contenido están en [`../../docs/ESTRATEGIA-ORGANICO.md`](../../docs/ESTRATEGIA-ORGANICO.md).

## Qué se borró (07/08/2026) y por qué no hay que revivirlo

Cuatro calendarios de un solo uso: cada uno tenía el mes escrito a mano adentro,
ya se corrió en su momento y nadie más los nombraba. Además ninguno era
idempotente: volver a correrlos duplicaría los posteos, y los de fecha pasada
publicarían todo de golpe en la fanpage en vez de agendarlo.

- `schedule-mes.mjs` — 19/05 al 08/06 de 2026.
- `schedule-jun-jul.mjs` — 22/06 al 31/07 de 2026.
- `schedule-jun-jul-resto.mjs` — los 9 de julio que habían quedado afuera por el
  tope de la cola.
- `schedule-agosto.mjs` — 01 al 15/08 de 2026. Se verificó contra Facebook: esas
  quince fechas ya estaban publicadas o en la cola.
- `schedule-week.mjs` — **el peor de todos, y el que más costaba ver.** Tenía el
  10 al 18 de mayo escrito adentro, pero a diferencia de los otros **el cerebro
  de Valentina lo daba como rutina de los domingos** y `contenido/README.md` lo
  repetía. O sea: la rutina normal de trabajo, seguida al pie de la letra,
  hubiera subido 9 posteos de mayo de golpe a la fanpage. Sus dos referencias se
  reapuntaron a `schedule-muro.mjs`.

Si hace falta programar un mes nuevo, se parte de `schedule-muro.mjs` y se le
cambia la lista, que ya trae la lectura de la cola.

**La regla que dejan estos cinco:** un script que publica al mundo se escribe
*idempotente* —que lea el estado real antes de actuar y saltee lo hecho— o no se
escribe. El que no lo es, no se puede correr dos veces, y entonces tampoco se
puede confiar en él la primera.
