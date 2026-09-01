# Encuesta de voz del cliente — las palabras para los anuncios

Formulario de 5 preguntas abiertas cuyo único objetivo es **capturar el vocabulario
literal** de la gente, para escribir anuncios con sus palabras y no con las nuestras.
No es una encuesta de satisfacción y no mide nada: es materia prima de copy.

Dos versiones, **las mismas 5 preguntas**, distinto momento y distinto premio:

| | A quién | Dónde | Premio | Volumen esperado |
|---|---|---|---|---|
| **Compradores** | los que pagaron | `/gracias`, paso 4 | canal privado de Telegram | ~5/mes |
| **No compradores** | los ~919 leads | envío único de Brevo | (a definir) | por definir |

> ⚠️ La versión de compradores rinde poco **por diseño del negocio, no por diseño del
> formulario**: 23 compradores únicos desde el 04/06/2026, 11 en los últimos 30 días.
> Es infraestructura que no vence — el día que haya volumen ya está puesta y juntando.
> La que puede mover la aguja este mes es la de los no compradores.

---

## Las dos reglas que gobiernan cada pregunta

### 1. Tiene que ser RESPONDIBLE — memoria, no reflexión

**El test (de Jose, 01/09/2026): si el que la escribió no la puede contestar en diez
segundos sin pedir aclaración, la pregunta está rota.** No se parchea con ejemplos: se
reescribe o se tira.

Una pregunta buena se contesta con algo que **ya está en la cabeza** de la persona — un
recuerdo, un hecho, algo que dice todos los días. Una pregunta mala obliga a construir
la respuesta desde cero.

| ❌ Pide reflexión | ✅ Pide memoria |
|---|---|
| ¿En qué momento de tu carrera estás hoy? | ¿Qué te dice la gente cuando les cuentas que eres periodista? |
| Lo que necesito es que alguien me diga ______ | Si pudieras hacerle UNA sola pregunta a alguien que ya vive de esto, ¿cuál sería? |
| ¿Qué esperas poder hacer que hoy no puedes? | ¿Qué tendría que pasar para que en un mes digas "valió la pena"? |

La columna izquierda fue el primer borrador entero (01/09) y Jose lo rechazó completo.
El patrón del arreglo: **cambiar la abstracción por una escena concreta.**

### 2. No puede contener NUESTRO vocabulario

Si la pregunta dice "monetizar" o "sistema de ingresos", la respuesta devuelve esas
palabras y el ejercicio no sirvió de nada.

**Corolario que atrapa:** por eso tampoco se ponen ejemplos en el texto de ayuda. Un
ejemplo hace la pregunta más respondible, sí, pero la mitad de la gente elige una de
nuestras frases en vez de escribir la suya — que es exactamente lo que veníamos a buscar.
Si una pregunta necesita ejemplos para entenderse, el problema es la pregunta.

**Una pregunta bien escrita no lleva texto de ayuda.** Las 5 de abajo no lo llevan.

---

## El formulario

> ✅ **CREADO el 01/09/2026.** URL del formulario (la que usa `gracias.html`):
> https://docs.google.com/forms/d/e/1FAIpQLSfZwROPlrh1wQPobv4FLJIJqN_7sAqXCFvUBhXCsKdVV1E-dA/viewform
>
> Verificado contra el formulario en vivo: las 5 preguntas están exactas y en orden, las
> dos primeras obligatorias. **La nº 1 quedó como "Respuesta corta" y no "Párrafo"** — se
> deja así a propósito: pide una línea de bio y Google no corta el texto igual.
>
> ⚠ Lo que NO se puede verificar desde afuera: el mensaje de confirmación y el ajuste del
> correo. Solo se ven enviando una respuesta de prueba.

**Título:** Antes de entrar al canal privado

**Descripción:**

> Soy José. Leo personalmente todas las respuestas — no las lee un robot ni un equipo.
>
> Son 5 preguntas abiertas. Las dos primeras son obligatorias; las otras tres, si tienes
> dos minutos, me ayudan muchísimo.
>
> **Escribe como hablas.** No busco respuestas prolijas, busco las tuyas.
>
> Al terminar te doy el enlace del canal privado de Telegram.

> 🚀 **Para no tipearlo a mano:** [`encuesta-voz-cliente.gs`](encuesta-voz-cliente.gs)
> lo construye entero (preguntas, ajustes, mensaje de confirmación y hoja de
> respuestas). Se pega en script.google.com y se ejecuta una vez. Las instrucciones
> están en el encabezado del propio archivo.

### Las 5 preguntas (todas tipo "Párrafo")

| # | Pregunta | Oblig. | Materia prima que devuelve |
|---|---|---|---|
| 1 | ¿A qué te dedicas hoy? *(escríbelo como lo pondrías en tu bio de Instagram)* | ✅ | Cómo se nombran a sí mismos → targeting y gancho |
| 2 | ¿Qué te dice la gente cuando les cuentas que eres periodista? | ✅ | El dolor con carga emocional, en boca de un tercero |
| 3 | 🔥 Si pudieras hacerle UNA sola pregunta a un periodista que hoy ya vive de esto, ¿cuál sería? | ❌ | Lo que la promesa tiene que prometer. **Cada respuesta es un titular candidato** |
| 4 | ¿Hubo algo que casi te hace no comprar? | ❌ | La objeción literal → lo que el anuncio debe responder **antes** |
| 5 | Si le tuvieras que explicar a un colega por WhatsApp qué es esto que acabas de comprar, ¿qué le escribirías? | ❌ | **El producto descrito con las palabras de ellos** — copy servido |

**Por qué esas cinco y en ese orden.** Son cinco materias primas distintas que no se
pisan: quién soy → qué me duele → qué necesito saber → qué me frenó → qué es esto.
Arranca por la más fácil (nombrarse a sí mismo) y sigue por un recuerdo, para que cuando
llegue la primera que pide algo de esfuerzo ya estén en modo responder.

La nº 4 va cuarta y no quinta a propósito: la última de una lista es la que más se
abandona, y la objeción es demasiado valiosa para arriesgarla ahí.

### Suplentes (pasaron el filtro, no entraron por espacio)

- Completa: **"Compré esto porque estoy cansado de ______"** — buena, pero apunta al
  mismo lugar que la nº 2 y la nº 2 se contesta más fácil.
- Completa: **"Antes de comprar pensé: ojalá esto no sea ______"** — el miedo, sin
  obligar a confesarlo de frente.
- **¿Qué tendría que pasar para que dentro de un mes digas "valió la pena"?** — la vara
  real, concreta.
- **¿Qué fue lo que te terminó de convencer?** — el argumento que cerró la venta.
- **Si mañana pudieras dejar de hacer una sola cosa de tu trabajo, ¿cuál sería?**
- **¿Se lo contaste a alguien antes de comprar? ¿Qué te dijo?** — objeciones del entorno
  (ojo: la mitad va a contestar que no).
- **Cuando pagaste, ¿qué te imaginaste que ibas a encontrar adentro?**

### Descartadas por el filtro (01/09) — no volver a proponerlas

| Pregunta | Por qué se cayó |
|---|---|
| ¿Cómo llegaste hasta acá? ¿Te acuerdas qué viste? | La gente no se acuerda del anuncio, y **ese dato ya está en `ventas.src`** |
| ¿Qué esperas poder hacer con esto que hoy no puedes? | Sin ancla, y pisa a "¿qué tendría que pasar para que digas valió la pena?", que es mejor |
| ¿Cuánto tiempo llevas en el periodismo? | Se contesta rápido pero devuelve un número: **cero vocabulario** |
| Lo que necesito es que alguien me diga ______ | Sin ancla — ni Jose sabía qué responder. Reemplazada por la nº 3 |

### Lo que NO se pregunta

País, rol y cómo nos encontró: ya están en Hotmart y en `ventas.src`. Preguntar dos veces
el mismo dato es cómo terminan contradiciéndose entre sí.

### Mensaje de confirmación (acá vive el gate)

> Gracias, de verdad. Las leo todas.
>
> Este es el canal privado: https://t.me/+ywAiiHyHe7wyYjRk
>
> Nos vemos adentro. — José

### Ajustes del formulario

- Recopilar direcciones de correo: **NO**. Anónimo a propósito: para robar una frase no
  hace falta saber quién la dijo, y sin el nombre puesto la nº 4 se contesta con mucha
  más honestidad. Además evita prellenar el email, que hoy no viaja en la URL de
  `/gracias`.
- Limitar a 1 respuesta: **NO** — exigiría login de Google y perdería respuestas.
- Barra de progreso y mezclar preguntas: **NO**. El orden importa (ver arriba).
- Respuestas → hoja de cálculo en el Drive de Jose. Se leen con el conector de Drive.
- **Trato NEUTRO, no voseo.** Los compradores que pasan por `/gracias` son de MX, PE, CO,
  AR, ES, HN y DO — solo una minoría es argentina. Coincide con la regla del 27/08/2026
  de que lo nuevo va en neutro.

---

## Cómo se plantea: REGALO, no peaje (01/09/2026)

Decisión de Jose. En `/gracias` el paso 3 **no** dice "contestá para entrar": dice que el
canal es un **regalo por contestar**. Es el mismo intercambio, pero leído como que se gana
algo en vez de que se paga un peaje.

Y se aclara que es un **canal de información**: publicamos nosotros, ellos solo leen, no
tienen que escribir nada. Dos motivos:

1. **Es la verdad.** El texto anterior decía "sumate a la comunidad", que promete
   conversación y acompañamiento que hoy no existen.
2. **Baja la barrera.** Al que no quiere exponerse delante de colegas, "solo leés" le saca
   el miedo de encima. Un canal que pide participar espanta a una parte.

⚠ Si alguna vez el canal pasa a ser de ida y vuelta, este texto miente y hay que cambiarlo.

## Cómo se aplica el gate

Google Forms lo resuelve **sin una línea de código**: el enlace de Telegram vive en el
mensaje de confirmación posterior al envío. Para que funcione hay que sacar el botón
directo del canal de `/gracias` — si queda, el formulario es opcional y nadie lo llena.

Cambio en [gracias.html](../paginas/gracias.html), paso 3: el botón deja de apuntar a
`TELEGRAM_INVITE` y apunta a la URL del formulario. La constante `TELEGRAM_INVITE` se
conserva documentada acá porque es el destino final del recorrido.

⚠️ **Costo real a vigilar:** el paso 3 es hoy el único enganche social del post-compra, y
esta gente entra una vez y no vuelve (en Leadr, 69 de 108 entraron solo el día del alta).
Si tras un mes las respuestas no compensan, se revierte quitando el formulario del medio.

## Estado

- [x] Jose crea el formulario en Google Forms y pasa la URL — 01/09/2026
- [x] Cambio en `gracias.html` (botón del paso 3 → formulario) — 01/09/2026, sin deployar todavía
- [ ] Deploy con `node herramientas/deploy.mjs sistema-ingresos`
- [ ] Verificar en vivo: enviar una respuesta de prueba y ver que aparece el link
- [ ] Versión para los ~919 no compradores (envío único de Brevo, Jose aprueba el copy)
