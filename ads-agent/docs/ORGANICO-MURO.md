# Orgánico FB — serie "el periodista del muro"

> ⏹️ **Esta serie terminó el 31/08/2026.** Corrió completa del 16 al 31 de agosto y
> cerró en "qué mira un negocio antes de pagarte". Lo que sigue en la fanpage es el
> arco de septiembre, *"IA aplicada al periodista de a pie"*, que hereda las reglas
> de abajo (neutro, sin enlaces, sin cifras) y vive en
> [`../contenido/carousels/ia-sept/README.md`](../contenido/carousels/ia-sept/README.md).
> Este documento se conserva porque **las reglas del embudo siguen valiendo** y
> porque explica de dónde salió el público.

Contenido orgánico para el **segundo público** del negocio: el periodista que
**ya publica** noticias de otros en su perfil personal de Facebook. Mismo lector
que el anuncio `ad4-perfil`, la landing `/muro` y la guía imán.

Vive en el calendario de la página a partir del **16/08/2026**. Antes de esa fecha
sigue corriendo la serie del público general (arco "De la idea al primer ingreso",
en voseo, generada por `scripts/generar/gen-agosto.mjs`).

Tarjetas: [#107](https://trello.com/c/DOhEmqkI) (esta serie) ·
[#106](https://trello.com/c/vFd9rZQ3) (el embudo completo) ·
[#74](https://trello.com/c/ksKJ4IEf) (programación de agosto).

---

## ⚠️ Reglas del embudo — no son las del orgánico general

Decididas con Jose el 30/07/2026. Si se escribe contenido nuevo para este público,
se aplican todas:

1. **Español neutro** (tú / puedes / dime), igual que la guía y `/muro`. El resto de
   la página va en voseo. El motivo es continuidad: el que hace clic en el anuncio
   tiene que encontrar la misma voz en la landing y en la guía.
2. **Sin cifras de audiencia** en ningún lado. En cuanto aparece un número el lector
   se compara y la mitad se autoexcluye — al que tiene pocos seguidores lo deja
   afuera y al que tiene muchos lo pone a la defensiva.
3. **Sin enlace en el posteo.** El valor entra completo en la publicación. Facebook
   muestra menos lo que saca gente de la plataforma, y además así el posteo se basta
   solo. El viernes de venta remite a "el enlace está en la biografía", que no es un
   enlace en el texto.
4. **Se nombra el problema, no se resuelve el pago.** La serie dice que el perfil
   personal da la audiencia equivocada, pero **no enseña a mudarla**: eso es el
   Módulo 5, o sea lo que se cobra.

Racional completo del público y de la guía:
`ads-agent/campanas/republicadores/EMBUDO-GUIAS.md`.

## Ganchos

Directos, concretos y algo incómodos. Dos tiempos: afirmación y remate que
sorprende. El remate nombra una **persona concreta** o una **consecuencia
concreta**, nunca una abstracción y nunca una cifra.

```
"Publicaste la nota del año. La vio tu tía."
"Tocas 'compartir' y le haces prensa gratis a un medio que no te paga."
"Publicas y guardas el teléfono. Ahí se murió la nota."
```

## Diseño

Mismo kit indigo-cyan, con dos agregados propios de esta serie:

- **`.hl` — bloque marcado.** La frase de remate de cada portada va sobre fondo
  sólido con el gradiente de marca y texto oscuro. Es lo único con fondo claro en
  todo el kit, así que es lo primero que se ve en un feed de placas grises.
- **`.slide.cover`.** Portada con fondo más cargado y tipografía a 104px.
  Las placas interiores quedan sobrias **a propósito**: si gritan todas, no grita
  ninguna.
- **`.vs` — antes/después.** Dos filas, roja y verde, para las comparaciones
  (titular de diario vs titular de muro, primera línea mala vs buena).

## Archivos y flujo

```bash
cd ads-agent

# 1. Contenido del feed: 10 carruseles HTML + 16 captions
node scripts/generar/gen-muro-agosto.mjs

# 2. Slides 1080×1080 (Chromium). Una carpeta por día en para-subir/
node scripts/exportar/export-slides-auto.mjs carousels/muro-s1   # y muro-s2, muro-s3

# 3. Programar. Idempotente: lee la cola y saltea lo ya programado
node --env-file=.env.local scripts/programar/schedule-muro.mjs
```

| Carpeta | Días |
|---|---|
| `carousels/muro-s1` | Dom 16 → Sáb 22 |
| `carousels/muro-s2` | Dom 23 → Sáb 29 |
| `carousels/muro-s3` | Dom 30 → Lun 31 |
| `carousels/muro-stories` | Los 16, en vertical |

## ⚠️ Tope de Meta: 29 posts programados

**Medido, no estimado.** Al llegar a 29 en cola, el siguiente rebota con
`(#100) The specified scheduled publish time is invalid` — que es cómo Meta reporta
la cola llena, **no** un problema de fecha. La cola se libera sola a un lugar por
día.

Por eso `scripts/programar/schedule-muro.mjs` es idempotente: lee la cola primero y saltea las fechas
ya programadas, así se puede re-correr sin duplicar. Al 30/07 el **29, 30 y 31/08**
quedaron fuera por esto.

**Estado al 01/08** (verificado por API): 28 en cola, `01→28/08` sin huecos, con la
serie del muro completa del 16 al 28. Ya hay un lugar libre y se libera uno más por
día, así que el 29/30/31 entran re-corriendo el script. Si nadie lo corre, la serie
cierra el viernes 28 con el posteo de venta.

Verificar lugares libres:

```bash
node --env-file=.env.local -e 'const t=process.env.FB_PAGE_TOKEN,id=process.env.FB_PAGE_ID||"439763019230527";fetch(`https://graph.facebook.com/v21.0/${id}/scheduled_posts?fields=id&limit=100&access_token=${t}`).then(r=>r.json()).then(d=>console.log("en cola:",(d.data||[]).length))'
```

## 📱 Stories — no se pueden programar

Las stories de página se publican **al instante** y duran 24 h.

```
POST /{page-id}/photos?published=false   → devuelve photo_id
POST /{page-id}/photo_stories            → con ese photo_id
```

`scheduled_publish_time` **no da error pero tampoco hay evidencia de que programe
nada** — asumir que no se puede. Consecuencia: cada story necesita un disparo
diario.

```bash
node scripts/generar/gen-muro-stories.mjs                              # 16 HTML verticales
node scripts/exportar/export-stories.mjs                                # → JPG 1080×1920
node --env-file=.env.local scripts/publicar/post-story.mjs --dry-run    # dice cuál publicaría
node --env-file=.env.local scripts/publicar/post-story.mjs              # publica la de hoy
node --env-file=.env.local scripts/publicar/post-story.mjs 2026-08-17   # una fecha puntual
```

`scripts/publicar/post-story.mjs` es idempotente: deja constancia en
`state/stories-publicadas.json` y no repite una fecha ya publicada, así que un cron
que corra dos veces no duplica.

**Quién lo lleva (01/08):** el frente de stories **salió del alcance de la tarjeta
[#107](https://trello.com/c/DOhEmqkI)** — lo trabaja otro chat/flujo. Lo que le queda
por resolver: (1) quién dispara `post-story.mjs` cada mañana (cron de Vercel como el
Panel de Comando, Make, o a mano) — sin eso las stories no salen; (2) aplicarle a los
16 creativos el bloque marcado de las portadas nuevas, que hoy tienen el diseño
anterior.
