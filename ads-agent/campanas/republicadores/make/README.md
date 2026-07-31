# Make — los escenarios de captura de leads

**Un escenario por formulario.** Cada webhook de Facebook Lead Ads queda atado a UN
formulario, así que no hay forma de que uno solo atienda a los dos.

| Formulario | Hook | Escenario | Entrega |
|---|---|---|---|
| `1075862554796241` · Guía Claude | 4236957 | **9474482** `Funnel Leads - Instantaneo (webhook)` | mail de Claude · Brevo lista 5 · funnel `meta-leadgen-guia-claude` |
| `2410525182805247` · ad5-lectores v2 | 4292005 | **9602489** `Funnel Leads - Republicadores (webhook)` | guía "Que te lean miles" · Brevo lista 6 · funnel `meta-leadgen-republicadores` |

Los dos verificados con lead de prueba el 31/07/2026.

**Formularios de la campaña republicadores — cuál es cuál.** Los tres se llaman casi
igual; el sufijo es lo único que los distingue en los desplegables de Meta:

| Id | Nombre en Meta | Estado |
|---|---|---|
| `2410525182805247` | `…Que te lean miles` (sin sufijo) | 🟢 **el que usa el anuncio**, con la pregunta `¿eres_periodista?` |
| `1405521768162136` | `…Que te lean miles (v1)` | ⚪ el original, sin pregunta. 8 leads. Ya no lo escucha nadie |
| `1690124692043382` | `…Que te lean miles v2` | ⚪ creado por API y descartado: Jose armó el suyo desde la interfaz |

⚠️ **El nombre de un formulario tampoco se puede cambiar por API** — mismo comportamiento
que las preguntas: `success: true` y no pasa nada. Para distinguirlos en el desplegable
de la herramienta de prueba hay que mirar el sufijo, o confirmar el id por API.

Cada escenario es un camino recto de cuatro módulos:

```
Facebook Lead Ads (trigger, hook propio del formulario)
  → HTTP  POST api.brevo.com/v3/smtp/email    · el mail con la guía
  → HTTP  POST api.brevo.com/v3/contacts      · lo suma a su lista
  → HTTP  POST /api/lead                      · lo guarda en `leads` con su funnel
```

**Campaña nueva = formulario nuevo = escenario nuevo.** Se **clona** el que ya funciona
y se cambian cuatro cosas: el webhook (formulario nuevo), el contenido del mail, el
`listIds` de Brevo y el `funnel` de `/api/lead`.

---

## 🔴 Las tres cosas que costaron una tarde (31/07/2026)

### 1. El webhook escucha UN formulario, no la página entera

El hook 4236957 tiene `formId` fijo en su configuración. Con eso, **Make descarta los
leads de cualquier otro formulario antes de ejecutar el escenario**: Meta da la entrega
por exitosa y en el historial de ejecuciones de Make no queda absolutamente nada. Un
formulario nuevo **no llega solo** — necesita su propio hook.

En el manifiesto, `formId` es opcional (vaciándolo el webhook escucharía todos los
formularios de la página), pero **eso no es lo que queremos**: un hook por formulario y
un escenario por hook es más simple de leer y no depende de filtros.

⚠️ El campo solo se puede tocar **desde la interfaz de Make**: el hook viene con
`editable: false` y la API responde *Access denied*.

### 2. Los hooks SÍ se pueden crear por API (esto se creyó al revés medio día)

`hooks_create` devuelve `islinked: false` **hasta que el hook se ata a un escenario**;
recién ahí queda enlazado. Durante el 31/07 se leyó ese `false` como "Facebook nunca le
va a mandar nada" y se descartó el camino por API — pero el hook 4291544, creado por API,
fue justamente el que procesó los primeros 5 leads reales de la campaña.

**Se crean así**, sin tocar la interfaz:

```
hooks_create  teamId: 1749729
              typeName: 'facebook-lead-ads-new-event'
              data: { __IMTCONN__: <conexión>, teamId: 1749729,
                      pageId: '439763019230527', formId: '<el del formulario>' }
```

Después se ata poniendo su id en `parameters.__IMTHOOK__` del módulo trigger, y se
confirma releyendo el escenario: `islinked: true`.

⚠️ Lo que **no** se puede es *reapuntar* un hook existente a otro formulario: vienen con
`editable: false` y la API responde *Access denied*. Formulario nuevo = hook nuevo.

### 3. La conexión de Facebook cambia la FORMA de los datos

Esta es la más traicionera. El escenario viejo usa la conexión **7680405**, que devuelve
los campos del formulario como **arrays** — por eso su mapeo dice `{{first(1.data.email)}}`.
Una conexión creada nueva (**14479335**) devuelve los mismos campos como **texto plano**,
y ahí `first()` explota:

```
Failed to map 'jsonStringBodyContent': Function 'first' finished with error!
'test@meta.com' is not a valid array
```

**Regla:** al crear el webhook del formulario nuevo, elegir **la conexión de Facebook que
ya existe**, no crear una. Si por lo que sea hay que usar una nueva, entonces hay que
sacar todos los `first(...)` del mapeo.

### Por qué se clona y no se arma de cero

Se intentó armar el escenario nuevo por API (el 9601453) y nunca llegó a procesar un
lead: el blueprint se ve idéntico pero difiere en detalles invisibles desde afuera.
**Clonar el escenario que funciona copia el mapeo, la estructura y la conexión exactos.**
Es el camino corto, y el único que no depende de adivinar.

### 4. Cada formulario nombra sus campos a su manera

El campo del teléfono se llama `phone_number` en el formulario de la Guía Claude y
**`phone`** en el de ad5-lectores. El mapeo copiado del otro escenario apuntaba al nombre
viejo y el teléfono llegaba vacío **sin dar ningún error** — el escenario se veía verde.

**Antes de clonar un mapeo, preguntarle a Meta cómo se llaman los campos del formulario
nuevo.** No hay que adivinar ni abrir el panel:

```bash
cd ads-agent && node -e "
require('dotenv').config({path:'.env.local'});
fetch('https://graph.facebook.com/v21.0/<FORM_ID>?fields=name,status,questions&access_token='+process.env.META_ACCESS_TOKEN)
  .then(r=>r.json()).then(j=>console.log(JSON.stringify(j,null,2)));
"
```

### 5. Un formulario publicado NO acepta preguntas nuevas (y Meta miente al respecto)

Probado el 31/07/2026 contra el formulario `1405521768162136`, que estaba corriendo:

```bash
POST /v21.0/1405521768162136   questions=[...la pregunta nueva...]
→ { "success": true }
```

**Y al releerlo, seguía con las tres preguntas de antes.** Meta acepta el pedido, responde
`success: true` y lo descarta sin aplicar nada ni devolver error. Un formulario queda
congelado apenas empieza a recibir leads.

**Regla:** para cambiar las preguntas hay que **crear un formulario nuevo** (ver el bloque
de creación por API más abajo) y reapuntar el anuncio. Y **después de cualquier POST a un
formulario, releerlo** — el `success: true` de Meta no prueba nada.

## ⚠️ Otras trampas

- **Los 8 primeros leads de la campaña tienen `es_periodista` en `NULL`** y ese dato no se
  recupera: entraron por el formulario v1, que nunca preguntó. Desde el 31/07 22:46 el
  anuncio usa el formulario con la pregunta.
- **La pregunta del formulario nuevo es más angosta que la del embudo viejo.** Acá dice
  `¿Eres periodista?` y en la Guía Claude dice `¿Eres periodista o trabajas en un medio de
  comunicación?`. **El % de periodistas de las dos campañas no es comparable entre sí** —
  el que trabaja en un medio sin definirse periodista contesta distinto en cada una. Cada
  número sirve para su propia campaña, no para compararlas.
- **Las opciones se escriben "Si" y "No".** `api/lead.js` las lee con `/^(s[ií]|y|t|1)/i`,
  así que "Si" y "Sí" valen las dos; lo que no puede cambiar es que la respuesta
  **empiece** con esa letra. Con cualquier otro texto (p. ej. "Claro") el campo queda
  vacío y se pierde la segmentación.
- **Un lead de prueba NO confirma `es_periodista`.** Meta rellena las respuestas con
  `<test lead: dummy data for …>`, que no empieza con S ni con N, así que el campo queda
  en `NULL` aunque todo esté bien. Lo que sí prueba es **que la clave del mapeo es
  correcta**: si `payload.periodista` llega con cualquier texto, está bien; si llega
  vacío, la clave está mal.

### 🔴 El token NO puede cambiar el formulario de un anuncio

Crear el `adcreative` nuevo —único modo de reapuntar un anuncio a otro formulario, porque
los creativos son inmutables— falla con:

```
error_subcode 1885183
"La publicación con contenido publicitario se creó con una app que se encuentra
 en modo de desarrollo. Debe estar en modo público para crear este anuncio."
```

El token lee todo el anuncio (nombre, estado, creativo, insights) pero **no puede
escribir creativos**. Reapuntar un anuncio a otro formulario **es siempre trabajo manual
de Jose** en el Administrador de anuncios. Planificarlo así desde el principio.

**Orden obligatorio del cambio de formulario**, para no quedar desalineado: el escenario
de Make tiene que escuchar **el mismo formulario al que apunta el anuncio**. Si se cambia
Make antes, los leads que siguen entrando por el formulario viejo no los procesa nadie.
Se cambia el anuncio primero y el hook de Make inmediatamente después.

### Crear un formulario nuevo por API

Sale más confiable que la interfaz porque la `key` de la pregunta —que es lo que lee
`api/lead.js`— se escribe exacta y no depende de cómo Meta la derive del texto:

```js
POST /v21.0/439763019230527/leadgen_forms
  name, locale, allow_organic_lead, follow_up_action_url,
  privacy_policy: {url, link_text}       // ⚠️ objeto; `privacy_policy_url` da error al crear
  questions: [{type:'CUSTOM', key:'¿eres_periodista_o_trabajas_en_un_medio_de_comunicación?',
               label:'¿Eres periodista o trabajas en un medio de comunicación?',
               options:[{key:'si',value:'Si'},{key:'no',value:'No'}]},
              {type:'EMAIL'},{type:'FULL_NAME'},{type:'PHONE'}]
  context_card, thank_you_page
```

**Releer el formulario después de crearlo**: el campo del teléfono puede salir `phone` o
`phone_number` según cómo se creó, y el mapeo de Make tiene que coincidir. Por eso hoy
está escrito como `{{ifempty(1.data.phone_number; 1.data.phone)}}`, que sirve para los dos.
- **El link de descarga del mail va SIEMPRE por `/api/d`**, nunca al PDF directo — si no,
  la apertura no queda registrada. Para esta campaña:
  `/api/d?file=que-te-lean-miles.pdf&src=Email-Republicadores-R1&sck=emailrep1`.
- **El blueprint se reemplaza entero**, no se fusiona: hay que leerlo con `scenarios_get`,
  editarlo y mandarlo completo. Si se manda parcial, se pierde lo que falte.
- Tras cualquier cambio, **releer el escenario** y confirmar `isinvalid: false` e
  `isActive: true`.

## Cómo verificarlo sin esperar un lead real

En Meta → herramienta de prueba de Lead Ads → *Eliminar* y después *Crear cliente
potencial*. Después:

```sql
select email, form_id, funnel, es_periodista, ocurrido_en
from public.leads order by ocurrido_en desc limit 5;
```

Tiene que aparecer con el `funnel` de su campaña.

⚠️ **El veredicto lo da la base, no el historial de Make.** El 31/07 se dio por roto un
escenario que llevaba dos horas funcionando: se lo juzgó por una ejecución manual de
prueba que había corrido *antes* del arreglo. Las ejecuciones posteriores gastaban 4
operaciones (trigger + los 3 HTTP) y los leads estaban entrando bien. **Una ejecución de 2
operaciones significa que se cortó en el módulo 2; una de 4, que llegó hasta el final** —
y ante la duda, se mira `leads`.
