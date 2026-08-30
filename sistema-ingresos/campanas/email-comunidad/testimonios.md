# Testimonios recibidos

**Cómo se guarda cada uno:** primero el **original tal cual llegó**, sin tocar. Después la versión
publicable, corrigiendo **sólo ortografía y puntuación**. No se mejora la redacción: lo que suena a
persona es lo que convence, y un testimonio pulido se lee como un aviso.

Cada uno anota su **eje** (ver [pedir-testimonios.md](pedir-testimonios.md)) para que no se
parezcan entre sí, y su **permiso**: sin nombre es sin nombre, también dentro de seis meses.

---

---

## 0 · Inventario de fuentes — dónde hay material y dónde no (28/08/2026)

Se revisaron **todas** las fuentes donde podía haber un testimonio sin usar. El resultado corto:
**no hay material nuevo esperando en ningún lado automatizado.** Los dos testimonios que existen
—Carlos y Jorge— llegaron por el WhatsApp personal de Jose y se cargaron a mano. Ese sigue siendo
el único canal que produjo algo.

| Fuente | Qué se revisó | Testimonios utilizables |
|---|---|---|
| **Inbox de WhatsApp** (tabla `conversaciones_wa`) | 151 mensajes entrantes, del 03/07 al 07/08 | **0.** Son consultas de pago, formularios de Lead Ads y curiosos. **Ninguno es de un comprador.** ⚠️ La tabla no tiene un solo entrante después del **07/08**: desde entonces nadie escribió al número |
| **Comentarios de Facebook** | 590 comentarios de 274 posts (206 orgánicos + 70 anuncios), de dic-2024 a hoy. 76 son posteriores al 01/06/2026 | **0.** Pedidos de información, correos sueltos, opiniones sobre la IA y trolls. Ni uno de alguien contando un resultado |
| **Gmail de Jose** | Los 23 correos de compradores, uno por uno, últimos 120 días | **0.** Ningún comprador escribió a esa casilla |
| **Casilla `jose@sistemadeingresosdiariosia.com`** | Es el remitente de los 3 envíos de la comunidad y **no tiene `reply-to`**: quien contesta, contesta ahí | **NO SE PUDO REVISAR** — ver abajo |
| **Recibido a mano por WhatsApp** | — | **2:** Carlos Méndez (eje A, con cifra) y Jorge Palacios (eje B) |

### 🔴 La casilla del dominio no la lee nadie

El dominio **sí tiene buzón** (`mx1.hostinger.com` / `mx2.hostinger.com`), pero **no está conectado
a Gmail** y no aparece ninguna respuesta reenviada. Los envíos de la comunidad salen desde
`jose@sistemadeingresosdiariosia.com` sin `reply-to`, y uno de ellos pide literalmente *"contame en
qué andás vos"*. Entre los tres envíos van **más de 2.000 mails pidiendo respuesta**.

**Lo que hay que hacer (es de Jose, hace falta el panel de Hostinger):** entrar al webmail y mirar
qué hay. Y dejar el reenvío puesto a Gmail, para que la próxima respuesta no dependa de que alguien
se acuerde de entrar. **Es la única fuente del inventario que puede tener material sin leer.**

### ⚠️ Contar comentarios con el token equivocado da CERO y parece sano

El primer barrido usó `META_ACCESS_TOKEN` (el de la cuenta de anuncios) y devolvió **0 comentarios
en los 70 anuncios**, sin error, con `total_count: 0` en cada uno. Repetido con `FB_PAGE_TOKEN`
aparecieron **cientos** — el mismo anuncio pasó de 0 a 24. Un token sin permiso sobre la página no
falla: contesta cero.

> **La regla:** cualquier script que cuente comentarios usa **`FB_PAGE_TOKEN`**. Un cero de
> comentarios se verifica con el otro token antes de creerlo. Esto vale para el conteo de
> interacción de los anuncios, no sólo para buscar testimonios.

Segundo límite del mismo camino: los comentarios llegan **sin autor** (`from` en blanco) salvo los
de la propia página. Se puede leer lo que dicen, no quién lo dijo — así que un comentario no se
puede convertir en un contacto.

### 💡 Lo que sí apareció, y no es un testimonio

En los comentarios de `ad5-lectores` hay **al menos 8 personas que dejaron su correo escrito a mano**
pidiendo la guía (más varios "Info", "Me interesa", "Información"). Nadie los capturó: no son leads,
no están en Brevo, no recibieron nada. Y por lo del autor en blanco, tampoco se les puede contestar
por privado desde un script. Es un agujero de captación, no de testimonios — **va a su propia
tarjeta**, no a ésta.

## 2 · Jorge Palacios — Eje B (la resistencia) — recibido el 20/08/2026

> ✅ **CERRADO Y PUBLICABLE** desde el 27/08/2026. Jorge confirmó por WhatsApp las tres cosas
> que faltaban: que lo escribió él, que autoriza publicarlo, y la palabra que estaba cortada.

| | |
|---|---|
| **Nombre** | ✅ **Jorge Palacios** — autoriza nombre propio o «un colega, 51 años», a elección |
| **Foto** | ✅ publicada en la captura |
| **Permiso** | ✅ confirmado por escrito el 27/08/2026 («publicalo tranquilo») |
| **Edad que menciona** | 51 |
| **Eje** | B — la resistencia inicial, el momento del clic, cómo es su semana |
| **Cifras** | ninguna, a propósito: aporta lo que el otro testimonio no |
| **Dónde va** | landing (sección testimonios) + envío del ángulo `alumno` |

### Título (elegido por Jose, es la frase del propio alumno)

> **"Cualquier persona que no sepa ni prender la PC puede lograr resultados"**

### Versión publicable

> Cuando empecé pensaba que había que dedicarle horas por día a un periódico digital para que no
> perdiera mi esencia y lo hiciera todo la IA. Por eso lo venía pateando meses, hasta que bajó el
> precio del curso y conseguí una oferta que dije: "son 27 USD, no pierdo nada probando".
>
> El momento en que me di cuenta de que estaba totalmente errado fue en la segunda clase del
> módulo 1. Ahí entendí que a los periodistas el sistema nos atrapó y nos cortó las alas: estamos
> obligados a seguir el cardumen como peces, y lo único que eso nos garantiza es frustración —
> más todavía en esta época moderna de la IA.
>
> Ahora mi semana es distinta: tengo un trabajo que amo y me da mi sueldo, y tengo
> un proyecto que me mantiene vivo todos los días, que me mantiene feliz y con voz propia.
>
> Lo que más fácil me resultó fue lo que más pensé que me costaría: cambiar el chip. A mis 51 años
> es muy difícil que cambie de opinión sobre algo por mi cuenta, jajaja.
>
> Gracias por el apoyo paso a paso y las clases tan bien explicadas. Cualquier persona que no sepa
> ni prender la PC puede lograr resultados.

### ✅ La palabra cortada: era «amo»

El original decía *"tengo un trabajo que **ao** y me da mi sueldo"*, y podía ser **amo** u **odio** —
que cambia el sentido entero: en un caso el proyecto convive con algo que le gusta, en el otro es la
salida de algo que no soporta. **Se le preguntó y contestó: era «amo».** Su frase exacta:
*"tengo un trabajo que amo y me da mi sueldo"*. Ya está aplicada arriba.

**La regla que queda:** una palabra ilegible no se adivina ni se elige por la que suena mejor. Se
pregunta. Costó un WhatsApp y evitó publicar lo contrario de lo que el alumno quiso decir.

### Original, tal cual llegó

```
Cuando empecé pensaba que había que dedicarle horas por dia a un periódico digital para que no
pierda mi esencia y lo haga todo la IA Por eso lo venía pateando meses. hatsa que bajo el preico
y del curso y cosnegui una oferta que dije "son 27usd no pierdo nada probando"

El momento en que me di cuenta de que estaba totalmente errado fue a la segunda clase del modulo
1. Ahí entendí que como periodistas el sistema nos atrapò y nos corto las alas, estámos obligados
a egui el cardumen como peces, y lo único que nos garantiza es frustración y mas en esta época
moderna de la IA.

Ahora mi semana es distinta: tengo un trabajo que ao y me da mi sueldo y tengo un proyecto que me
mantiene vivo todos los días, me mantiene feliz y con voz propia.

Lo que más fácil me resultó fue lo que mas pensé que me costaría, cambair el chip, a mis 51 años
es muy dificl que cambie de opinión sobre algo por mi cuenta jajaja.

Gracis por el apoyo paso a paso y las clases tan bien explciadas, cualquier persona que no sepa ni
prendee la pc puede lograr resultados.
```

### Qué se cambió y qué no

**Sólo** ortografía, tildes y puntuación. Además:

- *"como periodistas el sistema nos atrapó"* → *"a los periodistas el sistema nos atrapó"*, que es
  lo que quiso decir (concordancia).
- Se partió en frases el párrafo del cardumen, que venía todo de corrido.

**No se tocó:** el "jajaja", el "cambiar el chip", el cardumen, la mención al precio ni el orden de
las ideas. Nada de eso se mejora sin que deje de sonar a él.

---

## 1 · Carlos Méndez — Eje A (el resultado) — confirmado el 27/08/2026

> ✅ **CERRADO Y PUBLICABLE.** Es el único testimonio con una **cifra de ingresos**, así que
> es el más valioso que tiene el negocio: la landing no tenía ni una prueba de plata.

| | |
|---|---|
| **Nombre** | ✅ **Carlos Méndez** — autoriza nombre propio o «un periodista de 54 años» |
| **Foto** | ✅ publicada en la captura |
| **Permiso** | ✅ confirmado por escrito el 27/08/2026 («publicalo sin drama») |
| **Edad que menciona** | 54 · 15 años en el periodismo |
| **Eje** | A — el resultado: del primer anunciante a la plata cobrada |
| **Cifra** | ✅ **300 USD** por un mes de publicaciones (una por semana) — confirmada aparte |
| **Dónde va** | landing (cierra la sección, antes de los bonos) + envío del ángulo `alumno` |

### Título (su propia frase)

> **"Después de 15 años en el periodismo, finalmente encontré mi libertad"**

### Versión publicable

> Antes de esto yo estaba frustrado con el periodismo. Llevaba 15 años en el medio dándolo todo, y
> lo que más me trababa era que siempre dependía de que un superior auditara lo que quería publicar.
>
> Lo que me destrabó fue entender que puedo ser libre y publicar en mi periódico digital lo que yo
> quiera. Empecé mi periódico digital en 24 hs y dejé de darle vueltas.
>
> Hoy, 30 días después, no solo publico lo que quiero sino que logré hacer mi primera publicidad
> local, cobrándole **300 USD** por un mes de publicaciones (una por semana).
>
> Las plantillas hacen el trabajo por sí solas, así que estoy súper agradecido. A mis 54 años no es
> tan fácil la tecnología.

### El detalle del anunciante (preguntado aparte el 27/08/2026)

Esto NO está en el testimonio original: salió de preguntarle por el caso concreto. Sirve para el
curso y para los anuncios, porque es el paso a paso de cómo se consigue el primer anunciante.

- **Quién pagó:** Farmacia Central Chacarita.
- **Qué le publicó:** la primera fue una nota promocionando la farmacia, sus productos y una oferta
  que tenían ese mes.
- **Cómo lo consiguió:** **los contactó él**. Se acercó personalmente a la farmacia, habló con la
  encargada y le mostró el periódico digital y **las estadísticas de visitas** que tenía. Le gustó
  la idea y le dio una oportunidad.
- **Qué pasó después:** otros comercios le empezaron a escribir interesados. El boca a boca fue clave.

> ⭐ **Lo que hay que sacarle jugo:** la palanca no fue el tamaño de la audiencia, fueron **las
> estadísticas mostradas en persona**. Eso es enseñable y entra derecho en el módulo de
> monetización y en un ángulo de anuncio.

### Cómo se verificó

Las tres preguntas numeradas (¿lo escribiste vos? ¿autorizás? ¿confirmás la cifra?) **no alcanzan**:
se pueden contestar espejando la lista sin haber escrito nada. Lo que cerró el caso fue una
**pregunta abierta sobre su propio caso** — qué comercio y qué le publicó — que sólo el autor puede
contestar, más dos repreguntas de Jose que no estaban en ningún guion.

> **La regla que queda para todo testimonio:** confirmar autoría con **una pregunta abierta sobre el
> contenido**, nunca con un checklist de sí/no. Y pedir el permiso por escrito en el mismo hilo.

⚠️ **Nota de proceso:** el primer intento salió con el texto equivocado (se le mandó a Carlos el
mensaje escrito para Jorge). Esa respuesta no cuenta: la confirmación válida es la del hilo con el
mensaje correcto más la pregunta abierta.

---


---
