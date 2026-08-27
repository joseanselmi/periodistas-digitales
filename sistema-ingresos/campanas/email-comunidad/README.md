# `email-comunidad` — el semanal a los activos

Un mail por semana, **para siempre**, a quien sigue leyendo. No es un embudo con principio y fin:
es el canal propio. No se paga, no se apaga cuando se pausa un anuncio, y **mejora envío a envío en
vez de gastarse** — que es exactamente lo contrario de lo que hace el presupuesto de Meta.

✅ **Dos envíos hechos.** #1 el 22/08 (774 activos) · #2 el 26/08 (1.341, toda la base). **El link arriba cuadruplicó el clic**; la cadencia quedó en semanal a activos + mensual a todos.

## Las seis preguntas

| | |
|---|---|
| **¿Quiénes?** | Los **activos**, recalculados antes de cada envío. **750** el 20/08 (435 activos + 315 nuevos) de 1.316 leads; el 19/08 eran 724. **El número se mueve solo: no lo copies, consultalo.** |
| **¿Día 0?** | No hay. Canal permanente: cada envío es su propio día 0. |
| **¿Qué piezas y cuándo?** | **Martes 15:00 España.** Tres semanas al mes a los ACTIVOS (~605); **una vez al mes, a TODOS** (~1.384) — ese envío hace de reactivación. Ver la cadencia abajo. |
| **¿Quién NO?** | **Compradores (doble red: la vista los saca + la lista 7 de Brevo como exclusión)** · marcó spam · rebota siempre · dados de baja. **Los dormidos quedan afuera del semanal, pero entran en el mensual.** |
| **¿Tope y condiciones?** | 1 por semana. ~3.200 mails/mes (605×3 + 1.384) sobre 9.975 créditos. |
| **¿Qué motor la ejecuta?** | **Ninguno, a propósito.** Campaña de Brevo programada a mano, una por semana. |

La regla completa de quién es "activo", con sus números y por qué cada corte está donde está, vive
en la ficha del flujo: [docs/FLUJOS.md § 9](../../docs/FLUJOS.md). Acá va cómo se opera.

## ⚠️ Lo primero: la lista NO es la audiencia

La lista **#8 de Brevo** es el vehículo. Quién recibe lo decide la vista
`v_email_comunidad_audiencia` **en el momento**, y este script deja la lista igual a eso:

```bash
cd ads-agent
node scripts/datos/sincronizar-audiencia-comunidad.mjs              # mira y reporta (NO escribe)
node scripts/datos/sincronizar-audiencia-comunidad.mjs --aplicar    # escribe la lista
```

El default **no escribe**: hay que pedir `--aplicar`. Es al revés que `wa-funnel.js`, donde el
default envía — y eso ya costó una tanda de 1.800 mails.

> 🔑 **Hoy el script sólo corre con `--audiencia <archivo.json>`.** La `SUPABASE_SERVICE_ROLE_KEY`
> de `periodistas-marketing` está marcada "Sensitive" en Vercel y el pull la trae **vacía**, así
> que localmente no existe. Se destraba pegándola a mano una vez en `sistema-ingresos/.env.local`;
> mientras tanto, la audiencia se exporta con el MCP de Supabase:
> `select json_agg(t) from (select email, nombre, estado, motivo from v_email_comunidad_audiencia) t;`

## Los ángulos — la rotación

Cada envío declara **de qué habla** (`angulo`), **cómo lo dice** (`tono`) y **a dónde manda**
(`destino`). Eso es lo único que después permite decir "esto funciona": los mails no se comparan de
a uno, se comparan por ángulo acumulado.

| Ángulo | De qué habla | Cuidado |
|---|---|---|
| `comunidad` | Qué está pasando entre los que ya entraron. Preguntas reales que llegaron. | Tiene que haber pasado de verdad. |
| `alumno` | El avance concreto de alguien del curso. | ⛔ **Sólo casos reales.** Hay 21 compradores: si no hay un caso, no se usa este ángulo esa semana. **Nunca inventar un testimonio.** |
| `oficio` | Lo que un periodista con años sabe hacer y un recién llegado no. | Es el ángulo más fuerte de la marca. |
| `advertencia` | Lo que está cambiando y deja gente afuera. | El asunto puede alarmar; **el cuerpo tiene que sostenerlo**. Ver abajo. |
| `herramienta` | Algo útil y usable hoy, sin pedir nada a cambio. | Es el que compra permiso para los otros cuatro. |

**Destino**, alternado a propósito para poder compararlo: `landing` (la mayoría) · `checkout`
(directo, para quien ya conoce la oferta) · `leadr` (cuando lo que se ofrece es la plataforma).

## Reglas de copy — las que ya están decididas

1. **Cada mail da algo antes de pedir algo.** Sin excepción.
2. **El asunto de alarma se paga con el cuerpo.** "Urgente", "hay que cortar con esto", "el
   periodismo ya no es el mismo" funcionan **una o dos veces**; si adentro no hay nada que
   justifique la alarma, la próxima no te abren. Y la base ya viene de **6,1% de apertura**.
3. **Voseo.** Es el trato de toda la marca (387 usos contra 0).
4. **Sólo positivo, desde la vocación.** El lector es un periodista con experiencia, no alguien a
   quien hay que rescatar.
5. **Sin auto-bombo.** Si una frase se puede borrar sin perder información, era auto-bombo.
6. **Un CTA por mail**, con su `src` numerado.

## Los envíos

### 1 · "¿Te acordás por qué elegiste esto?" — ✅ ENVIADO el 22/08/2026

| | |
|---|---|
| **Archivo** | [comunidad-01.html](comunidad-01.html) |
| **Campaña Brevo** | **#5** — cargada en `funnel_steps.brevo_camp_id` |
| **Salió a** | **774 personas** (792 de la regla, menos 18 dados de baja) |
| **Ángulo / tono / destino** | `oficio` · `reflexivo` · `landing` (`?src=em-comunidad-01`) |
| **Remitente** | `Periodistas Digitales <jose@sistemadeingresosdiariosia.com>` |
| **Firma** | Jose Fianculli, creador del Sistema de Ingresos Diarios |

### 2 · "¿Cuántas veces te dijeron que eso no se publica?" — ✅ ENVIADO el 26/08/2026 15:00

| | |
|---|---|
| **Archivo** | [comunidad-02.html](comunidad-02.html) · campaña Brevo **#6** |
| **Salió a** | **1.341 entregados** de 1.362 (464 activos + 141 nuevos + **779 dormidos**) |
| **Resultado** | activos: **12,7% apertura · 10,5% clic** · dormidos: 2,1% y 25 rebotes · **0 ventas** |
| **Lista** | **9** — "Comunidad - TODA la base", no la 8 |
| **Ángulo / tono / destino** | `oficio` · `reflexivo` · `landing` (`?src=em-comunidad-02`) |

**Dos cosas se prueban a la vez, y por eso hubo que preparar antes de mandar:**

1. **El link va ARRIBA.** Todo lo demás igual que el envío 1 — estilo carta, destino landing,
   precio, firma, largo, tipo de asunto. El envío 1 abrió **12,4%** pero convirtió apenas **3,2% de
   apertura a clic** (el manifiesto hizo 10,2%; el mail de oferta, 16,2%).
2. **Va a toda la base**, decisión de Jose el 25/08. Los 779 dormidos hacía tres o más mails que no
   abrían nada.

### ⚠️ Por qué se usó la lista 9 y no la 8

La **lista 8 significa "activos"** y `sincronizar-audiencia-comunidad.mjs` la reescribe desde la
vista en cada corrida. Meterle los dormidos la corrompe, y la próxima sincronización los sacaría
igual. La 9 es de este envío; la 8 sigue siendo lo que dice ser.

### 🧊 La foto de destinatarios — sin esto, el envío no se puede leer

`v_email_comunidad_audiencia` se recalcula al consultarla: es lo que la hace útil y lo que **borra
su propio pasado**. Si 40 dormidos abren este mail, pasan a "activo" y mañana ya no habría forma de
saber que estaban dormidos cuando les llegó.

Por eso, **antes** de enviar, se congeló quién era quién en `email_comunidad_destinatarios`
(envío 2: 779 dormidos, 464 activos, 141 nuevos).

Con esa tabla, después del envío se pueden contestar dos preguntas que si no se pierden:

```sql
-- ¿Funcionó el link arriba? Se compara SÓLO el grupo activo contra el envío 1.
select d.estado_al_enviar,
       count(*) recibieron,
       count(c.abierto_en) aperturas,
       count(c.clic_en) clics,
       round(100.0*count(c.abierto_en)/count(*),1) pct_apertura,
       round(100.0*count(c.clic_en)/nullif(count(c.abierto_en),0),1) pct_clic_sobre_apertura
from email_comunidad_destinatarios d
left join comunicaciones_email c
       on lower(c.email) = d.email and c.campana = 'comunidad-02'
where d.envio = 2
group by 1 order by 2 desc;
```

⚠️ **El % de apertura GLOBAL de este envío no es comparable con el del envío 1**: el 1 fue sólo a
activos y éste mezcla activos con dormidos, que por definición no abren. Comparar los totales va a
dar "empeoró" cuando lo único que cambió fue a quién se le mandó. **Se compara activos contra
activos.**

## 🔁 La cadencia — semanal a los activos, mensual a todos

Decidida el 27/08/2026 con los números de los dos primeros envíos.

| | A quién | Cuántos | Para qué |
|---|---|---|---|
| **Semanal** (3 de cada 4 martes) | activos + nuevos | ~605 | el canal propiamente dicho |
| **Mensual** (1 martes al mes) | **todos, dormidos incluidos** | ~1.384 | darle una puerta de vuelta a los dormidos |

**Por qué el mensual existe.** La regla saca del semanal a quien acumula 3 mails sin abrir — pero un
dormido sólo vuelve a activo **si abre algo**, y si nunca le llega nada, no tiene qué abrir. Sin el
mensual, la lista se achica hasta el núcleo duro y nadie vuelve jamás.

**Por qué es mensual y no semanal.** Medido en el envío 2, que fue a toda la base:

| Grupo | Apertura | Rebotes |
|---|---|---|
| activos | **12,7%** | 2 |
| dormidos | **2,1%** | **25** |

Los dormidos abren seis veces menos y **generaron 25 de los 34 rebotes**. Cada rebote le avisa al
proveedor de correo que estamos escribiendo a direcciones muertas, y eso se paga en la bandeja de
todos los demás — incluidos los mails de acceso de los compradores. Una vez al mes es tolerable;
todas las semanas, no.

**Lo que rinde el mensual, medido:** de los 779 dormidos, **16 volvieron a activo** (2%) y 1 quedó
excluido por rebotar. ~190 personas recuperadas al año, y la lista se limpia sola de paso.

⚠️ **El mensual reemplaza al semanal de esa semana**, no se suma. Y conviene que sea el mail más
fuerte del mes: es el único tiro que tienen los dormidos.

## 📊 Lo que ya se aprendió, envío por envío

| | Envío 1 (22/08) | Envío 2 (26/08) |
|---|---|---|
| A quién | 766 activos | 1.341 (toda la base) |
| Apertura **de los activos** | 14,9% | 12,7% |
| **Clic sobre apertura (activos)** | **2,6%** | **10,5%** |
| Ventas | 0 | 0 |

**El link arriba funcionó: el clic sobre apertura se cuadruplicó** y quedó al nivel del manifiesto
(10,2%), que era el mejor de los mails que venden. La apertura no se resintió. **Queda como
estándar: el botón va arriba y repetido, no sólo al final.**

⚠️ Son 6 clics contra 3 — la dirección es clara pero el volumen no alcanza para llamarlo probado.
Si el envío 3 repite el patrón, ahí sí.

⛔ **Y el número global de apertura del envío 2 (5,7%) no se compara con nada**: mezcla activos con
dormidos. Comparar totales entre un envío a activos y uno a toda la base dice "empeoró" cuando lo
único que cambió fue a quién se le mandó. **Siempre por `email_comunidad_destinatarios`.**

## ⭐ El estándar de redacción — así se escriben todos

Jose aprobó este mail y pidió que **todos los siguientes sean así**. Es la fórmula de
[Isra Bravo](https://onpremarketing.com/copywriting-para-ganar-el-metodo-de-isra-bravo/): una carta
de una persona a otra, no un newsletter.

1. **~300 palabras.** Ni una más. Éste tiene 279.
2. **Asunto que no se pueda contestar sin abrir.** *"¿Te acordás por qué elegiste esto?"* no dice
   nada del producto, no promete plata y no parece un mail de venta — que es exactamente por qué se
   abre. Los asuntos con precio y con "última oportunidad" este público los tiene entrenados.
3. **Primera frase que da vuelta la expectativa**: *"Nadie se mete a periodista por la plata"*.
4. **La herida concreta**, no el problema abstracto: la nota que le bajaron, el editor, escribir lo
   que conviene.
5. **Un enemigo con cara**: los que informan hoy sin chequear nada, ocupando su lugar.
6. **El curso aparece recién ahí**, como respuesta a eso — nunca como oferta que llega de la nada.
7. **Lo práctico en un solo párrafo**: 24 horas, 30 minutos, sin dejar el trabajo, primer anunciante.
8. **Firma de persona + PD.** La PD es lo segundo más leído después del asunto y es donde va el
   remate: *"el periodismo no se murió. Lo dejaron sin lugar. Vos podés hacerte uno."*

**Sin bloques de precio grandes, sin listas de bonos, sin diseño de folleto.** Texto y un botón.

⛔ **Lo que se descartó.** Se escribieron y probaron otras cuatro versiones —"Lo estamos logrando",
"A mis 51 años…", la del chequeo de la IA, la de "tu propio medio"— y **ninguna quedó**. Se borraron
a propósito: el único registrado es éste. Guardar los descartes invita a reciclarlos.

## El plan de las próximas semanas — que ninguno se parezca al anterior

Lo que se rota no es sólo el tema: también **el tono y la forma**. Un canal que manda siempre el
mismo mail con otro título deja de abrirse aunque cada mail, por separado, esté bien.

| # | Ángulo | Tono | Forma | Destino |
|---|---|---|---|---|
| 1 | `oficio` | urgente | advertencia + checklist de 3 pasos | landing |
| 2 | `comunidad` | cálido | balance + pregunta abierta | landing |
| 3 | `herramienta` | directo | una sola cosa usable, sin vueltas | leadr |
| 4 | `alumno` | cálido | **una** historia real, contada entera | checkout |
| 5 | `advertencia` | urgente | qué está cambiando y a quién deja afuera | landing |
| 6 | `oficio` | reflexivo | carta corta, sin listas ni bullets | landing |

**Las tres reglas de la rotación:**

1. **El mismo tono no va dos semanas seguidas.** El `urgente` es el que más rinde la primera vez y
   el que más rápido se quema.
2. **El mismo ángulo no vuelve antes de tres envíos.**
3. **La forma cambia aunque el ángulo se repita.** El 1 y el 6 son los dos `oficio` y no se parecen
   en nada: uno es una advertencia con checklist, el otro una carta corta de un solo hilo.

⛔ El envío 4 (`alumno`) **sólo sale si para entonces hay una historia real**. Si no llegó ninguna,
se corre de lugar y entra otro ángulo. No se inventa un caso para llenar el casillero.

✅ **20/08: varios alumnos se ofrecieron a contar su experiencia.** Qué contestarles —las preguntas
guía, el pedido de permiso y qué hacer cuando lleguen— está en
[pedir-testimonios.md](pedir-testimonios.md). Se les dan **preguntas, no un texto para repetir**:
si a cinco personas les dictás las mismas frases, los cinco testimonios se parecen y este público
lo nota.

## Antes de crear la campaña: mandarse una prueba

```bash
cd ads-agent
node scripts/publicar/enviar-prueba.mjs ../sistema-ingresos/campanas/email-comunidad/comunidad-01.html jose@... "El asunto"
```

Va por la API transaccional, no como campaña: **no toca listas ni ensucia las métricas** de nada.
Dos cosas que se ven raras en la prueba y son normales — en la campaña real no pasan:

- el pie muestra `{{ unsubscribe }}` literal, porque ese tag lo resuelve el motor de campañas;
- el mail no aparece en `comunicaciones_email`, porque no lleva etiqueta de campaña.

## Checklist de cada envío

1. `node scripts/datos/sincronizar-audiencia-comunidad.mjs` → mirar cuántos entran y cuántos salen.
2. Correrlo con `--aplicar`. Verificar que Brevo diga el mismo número que la regla.
3. Crear la campaña en Brevo sobre la **lista 8**, con el asunto elegido, y **poniendo la lista 7
   ("Compradores — EXCLUIR") como lista de exclusión**. Es la segunda red: la vista ya saca a los
   compradores, pero entre la sincronización y el envío pasan horas y quien compre en el medio
   recibiría una oferta de lo que acaba de pagar.
4. **Cargar la fila en `funnel_steps`** — este paso es el que se olvida y deja el panel en cero:

```sql
insert into funnel_steps (funnel_id, orden, slug, nombre, tipo, estado,
                          brevo_tag, brevo_camp_id, contenido_asunto, angulo, tono, destino, url)
select id, 1, 'comunidad-01', 'Envío 1 — el chequeo de 30 segundos', 'email', 'activo',
       'comunidad-01', <ID DE LA CAMPAÑA DE BREVO>,
       'Urgente, periodista: revisá esto antes de publicar',
       'oficio', 'urgente', 'landing',
       'https://sistemadeingresosdiariosia.com/?src=em-comunidad-01'
from funnels where slug = 'email-comunidad';
```

5. Programar el envío (día y hora fijos, **hora de España**).
6. **A las 48 h**, verificar contra la fuente — no contra el plan:

```sql
select * from v_email_comunidad_envios order by envio;
select * from v_email_comunidad_angulos order by pct_clic_sobre_apertura desc;
```

7. Si el envío aparece con **0 entregados**, el problema es el `brevo_camp_id`, no el mail:
   sin él los eventos quedan sin atribuir y "nadie lo abrió" y "no llegó el dato" se escriben igual.

## Qué NO hacer

- ⛔ **No congelar la lista 8 a mano.** Se reescribe desde la vista o no se toca.
- ⛔ **No sumarle un cron todavía.** La decisión del 13/08 congela motores nuevos, y automatizar
  antes de saber qué ángulo funciona es automatizar una incógnita.
- ⛔ **No juzgar un envío por sus ventas.** A ~700 destinatarios, 0 y 1 venta son el mismo número.
- ⛔ **No mandarle a los ~550 dormidos "ya que estamos".** Es lo que hunde la entregabilidad del
  dominio por el que salen los mails de acceso de los compradores.
