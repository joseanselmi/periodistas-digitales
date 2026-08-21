# `email-comunidad` — el semanal a los activos

Un mail por semana, **para siempre**, a quien sigue leyendo. No es un embudo con principio y fin:
es el canal propio. No se paga, no se apaga cuando se pausa un anuncio, y **mejora envío a envío en
vez de gastarse** — que es exactamente lo contrario de lo que hace el presupuesto de Meta.

🟡 **Estado al 20/08/2026: envío 1 escrito y aprobado el asunto. Todavía no salió.**

## Las seis preguntas

| | |
|---|---|
| **¿Quiénes?** | Los **activos**, recalculados antes de cada envío. **750** el 20/08 (435 activos + 315 nuevos) de 1.316 leads; el 19/08 eran 724. **El número se mueve solo: no lo copies, consultalo.** |
| **¿Día 0?** | No hay. Canal permanente: cada envío es su propio día 0. |
| **¿Qué piezas y cuándo?** | Una por semana, **día y hora fijos**. Se anotan de a una, a medida que salen. |
| **¿Quién NO?** | **Compradores (doble red: la vista los saca + la lista 7 de Brevo como exclusión)** · marcó spam · rebota siempre · **dormidos** · dados de baja. |
| **¿Tope y condiciones?** | 1 por semana. ~2.900 mails/mes sobre un plan de ~10.000 con el embudo usando ~7.500. |
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

### 1 · "Urgente, periodista: revisá esto antes de publicar" — 🟡 escrito, sin mandar

| | |
|---|---|
| **Archivo** | [comunidad-01.html](comunidad-01.html) — pegar tal cual en Brevo (editor HTML) |
| **Asunto** | **Urgente, periodista: revisá esto antes de publicar** |
| **Ángulo** | `oficio` — lo que un periodista con años tiene y un recién llegado no |
| **Tono** | `urgente` — lo eligió Jose el 20/08 |
| **Destino** | `landing` · `/?src=em-comunidad-01` |
| **Qué da** | el chequeo de 30 segundos: las 3 preguntas para que una IA no te publique un dato inventado |
| **Cuándo** | martes 15:00 España (10:00 ART · 08:00 CDMX) |
| **Remitente** | **`Equipo de Periodistas Digitales <jose@sistemadeingresosdiariosia.com>`** — decidido el 21/08. El nombre cambia libremente; la DIRECCIÓN no se toca, porque es la verificada en Brevo y de ella cuelga la reputación del dominio. |

**Cómo se paga la urgencia del asunto.** La regla es que un asunto de alarma se sostiene con el
cuerpo o entrena a la gente a no abrir. Acá la urgencia es real y concreta: **si publicás un dato
que la IA inventó, el que queda pegado sos vos**, con tu firma y tu credibilidad. El mail abre con
esa consecuencia y a los dos párrafos entrega el chequeo que la evita. No hay alarma sin contenido.

Alternativas: *"Urgente: no publiques eso todavía"* · *"Periodista: la IA te va a hacer publicar un
dato falso"*.

**El CTA no lleva `sck`.** El `src` dice de dónde vino; el botón lo pone la landing. Ver
[NOMENCLATURA-SRC.md](../../docs/NOMENCLATURA-SRC.md).

⚠️ **El tono `urgente` arranca gastado.** Es el que más rinde la primera vez y el que más rápido se
quema. Si el envío 2 y el 3 también abren con alarma, la apertura del 4 lo va a mostrar — por eso
el tono se declara en `funnel_steps` y se compara acumulado, no de a un mail.

### 2 · "A mis 51 años pensé que no iba a poder" — 🟡 escrito, sin mandar

| | |
|---|---|
| **Archivo** | [comunidad-02.html](comunidad-02.html) |
| **Asunto** | **«A mis 51 años pensé que no iba a poder»** — la frase del propio alumno |
| **Ángulo** | `comunidad` · **Tono** `calido` (a propósito distinto del 1, que fue `urgente`) |
| **Destino** | `landing` · `/?src=em-comunidad-02` |
| **Qué hace** | el testimonio real, la oferta y el botón. Nada más. |

El testimonio va **como texto, no como imagen**: Gmail y Outlook bloquean imágenes por defecto, y
justo lo que más convence se vería como un rectángulo vacío.

Firmado «un colega, 51 años» hasta que confirme si puede ir su nombre.

## ✂️ Cortos y de venta (decidido el 21/08)

Los dos primeros envíos estaban escritos como canal de contenido: largos, con la oferta al final y
casi de costado. **Jose los quiere cortos, precisos y que se entienda que hay un curso para
comprar.** Reescritos así:

- **menos de 200 palabras** cada uno (antes pasaban las 400);
- la oferta **en un bloque visible**: US$ 27, pago único, 3 bonos, garantía de 7 días;
- **un solo botón**, que dice a dónde va;
- lo que se da (el chequeo, el testimonio) queda arriba y en tres líneas, no en cinco párrafos.

⚠️ **Lo que hay que vigilar.** Un canal semanal que siempre vende cansa más rápido que uno que a
veces sólo da algo — y la base ya viene de 6,1% de apertura. La señal a mirar no son las ventas del
primer envío sino **las bajas y la apertura del tercero**: si la apertura cae envío a envío, el
canal se está gastando y hay que meter uno que no venda nada.

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
