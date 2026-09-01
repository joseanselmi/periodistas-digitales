# ChatGPT como estudio de imágenes

> Proveedor único de imágenes del negocio desde el 03/07/2026 (tarjeta Trello #51).
> Reemplaza a **higgsfield** (se da de baja) y a **fal.ai** (no se usa).
> Plan **free** = generación **manual por la web**. No hay API, no hay script que lo llame.

Todo se genera dentro de **un solo proyecto de ChatGPT: “Periodistas digitales”**, y dentro de
ese proyecto **cada chat es una familia visual**. Esa es la clave del sistema: ChatGPT mantiene
la coherencia usando el historial del propio chat como referencia. Si mezclás portadas del curso
con creativos de anuncios en el mismo hilo, se contaminan y las dos familias se ensucian.

---

## 1. Configuración del proyecto (una sola vez)

En ChatGPT → proyecto **Periodistas digitales** → ⚙️ Configuración:

| Campo | Valor | Por qué |
|---|---|---|
| Nombre | `Periodistas digitales` | — |
| Memoria | **Solo para el proyecto** | Que no se filtre a los chats personales ni al revés. |
| Acceso a la biblioteca | Deshabilitado | Es forzado cuando la memoria es “solo del proyecto”. No es un problema. |
| Instrucciones | el bloque de abajo | Es lo que hace que no tengas que repetir la marca en cada pedido. |

### ⭐ Instrucciones del proyecto (copiar y pegar tal cual)

```
Soy Jose Anselmi. Este proyecto es el estudio de imágenes de "Periodistas del Futuro IA":
un curso ($27) y una plataforma (Leadr) para periodistas de LatAm que quieren vivir de su
propio medio digital. Todo lo que se genera acá es material de marca.

MARCA (no cambia nunca)
- Fondo azul muy oscuro, casi negro: #07070f. Nunca fondo blanco ni gris claro.
- Acentos: índigo #6366f1 a cian #22d3ee, en gradiente o en glow.
- Ámbar #f59e0b solo para precio o urgencia. Rojo #ef4444 solo para problema o mito.
- Estética sobria, premium, minimalista y cinematográfica. Periodismo digital + IA.
- Nada de pasteles, neón excesivo, collage recargado ni gente de stock sonriendo a cámara.

TEXTO
- Las imágenes van SIN texto ni letras, salvo que te lo pida explícitamente. El texto se
  monta después por fuera. Si te pido texto, poné poco y grande.

CÓMO TRABAJAR CONMIGO
- Cada chat de este proyecto es una familia visual distinta. Dentro de un chat mantené
  SIEMPRE la misma identidad: cuando te pida otra imagen, cambiá solo el elemento que te
  indico y dejá igual el resto.
- Si el pedido es ambiguo (formato, qué se ve, para qué es), preguntame en una línea antes
  de generar. No inventes.
- Después de generar, pegame el prompt final que usaste, para poder repetirlo.
- Escribime en español rioplatense, corto y al grano.
```

---

## 2. El mapa de chats

Un chat por familia. El nombre del chat va con emoji adelante para encontrarlo de un vistazo.

| Chat | Para qué | Formato | Estado |
|---|---|---|---|
| **Portada SIDP** | Portadas de módulo y de clase del curso en video | 16:9 · 1920×1080 · sin texto | ✅ ya existe |
| 📣 Ads | Creativos de anuncios de Meta (Mateo) | 1:1, 4:5 y 9:16 | ✅ ya existe |
| 📱 Orgánico | Fondos e ilustraciones para carruseles y posteos del muro (Valentina) | 4:5 · 1080×1350 | ➕ crear |
| 🌐 Web | Imágenes de la landing del curso y de Leadr (hero, secciones, avatares) | según la sección | ➕ crear |
| 🎁 Guías y regalos | Tapas de las guías-regalo en PDF | 3:4 vertical, tipo portada de libro | ➕ crear |
| 🔷 Marca | Logos e isotipos de Leadr y del curso | 1:1 · blanco sobre negro plano | ➕ crear |
| 🧪 Laboratorio | Probar prompts, estilos y variantes nuevas. **Nada de acá va a producción sin repetirlo en su chat.** | libre | ➕ crear |

**Regla de oro:** si una imagen no entra en ninguna de esas familias, se abre un chat nuevo
con su propio prompt maestro — no se mete en el más parecido.

### Cómo se abre un chat nuevo

1. Crear el chat **dentro del proyecto** (no suelto).
2. Renombrarlo con el nombre de la tabla.
3. Primer mensaje = el **prompt maestro** de esa familia (sección 3).
4. Cuando ya haya una imagen aprobada, **subirla como referencia** al empezar cada tanda:
   *“Misma identidad y estilo que esta. Cambiá solo …”*. Es lo que más sostiene la familia.

---

## 3. Prompts maestros por chat

### Portadas del curso — chat **"Portada SIDP"**
> El nombre real del chat es `Portada SIDP`. Antes acá decía "🎬 Portadas del curso", que no
> existe: un agente mandado a buscar ese nombre no lo encuentra. Corregido el 14/08/2026.

El prompt maestro completo, la tabla de color por módulo y el elemento por clase están en
[sistema-ingresos/curso/docs/IDENTIDAD-PORTADAS.md](../../sistema-ingresos/curso/docs/IDENTIDAD-PORTADAS.md).
Se guardan en `Escritorio\Contenido del curso\Portadas\Módulo X - Nombre\`.

### 📣 Ads
```
Creá un creativo para un anuncio de Facebook/Instagram, formato [1:1 | 4:5 | 9:16],
alta resolución.

ESTILO (mantener siempre igual): fondo azul muy oscuro casi negro (#07070f), con un
resplandor difuso índigo (#6366f1) a cian (#22d3ee). Estética sobria, premium y
cinematográfica, de periodismo digital + IA. Iluminación cinematográfica, mucho aire.

ESCENA: [ESCENA]. Composición pensada para que el tercio [superior | inferior] quede
libre: ahí va el texto después.

Sin ningún texto ni letras en la imagen.
```
- **[ESCENA]** = lo concreto del ad: un periodista frente a una pantalla, un muro de
  publicaciones apagándose, un celular con una notificación, etc.
- El gancho y el bloque de texto con gradiente **no se generan acá**: se montan después
  (ver la memoria de ganchos y placas). ChatGPT deforma el texto.

### 📱 Orgánico
Las placas del muro se generan por **HTML/CSS** (`ads-agent/scripts/generar/`), no acá.
Este chat es solo para **fondos e ilustraciones sueltas** que después se montan en esas placas:
```
Creá una ilustración de fondo, formato 4:5 (1080×1350), alta resolución.

ESTILO: fondo azul muy oscuro casi negro (#07070f), glow índigo (#6366f1) a cian (#22d3ee)
en una esquina, sutil grilla tecnológica tenue. Sobrio, premium, minimalista, mucho espacio
negativo en el centro para poder poner texto encima.

ELEMENTO: [ELEMENTO], en líneas de neón con glow suave.

Sin ningún texto ni letras.
```

### 🌐 Web
Fotos e imágenes de las páginas (landing del curso, Leadr). Acá **sí** puede haber personas,
pero con la regla de la marca: nadie sonriendo a cámara, luz cinematográfica, fondo oscuro.
Antes de generar una foto de persona real (ej. el instructor), revisar la memoria de imágenes
de la landing: hubo un bug con esa foto.

#### La imagen de la sección "El problema" — la que promete plata (28/08/2026 · v2 el 01/09/2026)

**Qué cambia.** La imagen que estaba (credencial de prensa gastada + celular con un feed ajeno)
contaba el problema. Jose la quiere del otro lado: **la solución, con la plata a la vista**, porque
esa sección es la primera imagen que ve el que llega y hoy no promete nada.

**Cómo se muestra la plata sin que parezca una estafa.** Nada de fajos de billetes ni de autos:
Meta rechaza anuncios con promesas de ingresos exageradas y la landing está enlazada desde los
anuncios. Lo que sí funciona es **una notificación de cobro**, con la cifra que ya está respaldada
por un testimonio real y verificado — los **300 USD** que cobró Carlos por su primera publicidad
local. Lo que promete la imagen tiene un nombre y un caso detrás.

**El prompt completo — con el mensaje que lo acompaña, los rescates para cuando algo sale mal y qué
hacer al recibir la imagen — está listo para copiar y pegar en
`Escritorio/BOCETO-LANDING/PROMPT-CHATGPT.txt`.** (La v1 quedó respaldada al lado, como
`PROMPT-CHATGPT-v1-28ago.txt.bak`.)

La escena en una línea: **celular con un feed de Instagram apagado → flecha de luz índigo-cian →
tablet encendida con el periódico propio**, y flotando sobre ella la notificación del pago. Se lee
de izquierda a derecha como un antes y después. El resumen del prompt:

> 🔴 **v2, 01/09/2026 — el lado izquierdo no decía nada, y era culpa del prompt.**
> La imagen salió linda y Jose la aprobó, pero al mirarla contra el texto de su propia sección
> ("Instagram y Facebook son los nuevos medios masivos") faltaba lo único que la hacía tener
> sentido: el celular mostraba **una calle gris**. La flecha promete "de acá pasás a allá y
> cobrás", con el "acá" vacío.
>
> El pedido de abajo lo causó, textual: *"una publicación con foto de una calle de ciudad en
> blanco y negro"*. ChatGPT hizo bien lo que le pedimos.
>
> **Lo que lo arregla:** el celular pasa de UNA publicación a la **grilla de perfil de un medio**
> — tres columnas apretadas, fotos de noticia, placas con bloque de titular, algún icono de
> video. Y lo que hace que se pueda pedir sin romper el texto: **una grilla se reconoce por su
> FORMA, no por leer los titulares**, así que van desenfocados y el único texto legible sigue
> siendo `+ USD 300`.
>
> **Regla que sale de acá:** antes de mandar un prompt de imagen de sección, leer **el párrafo
> que va al lado de la imagen** y preguntar si la escena lo cuenta. Una imagen de sección que se
> ve bien sola puede no decir nada al lado de su texto.
>
> ⛔ **La grilla se INVENTA.** Jose pasó como referencia el perfil real de La Nación: no se copia
> — marca, caras de personas públicas y tilde de verificado ajenos dentro de un anuncio pagado.
>
> ⛔ **Las cifras del panel de ingresos van desenfocadas.** Jose también pasó la captura de
> Hotmart (5.442 US$ / 606 transacciones): eso son **las ventas del curso de Jose**, no lo que
> gana un periodista con su periódico. Ponerla como "así cobrás" es una promesa de ingresos sin
> respaldo, que es justo lo que Meta rechaza. El panel aporta la **pinta** de real (curva verde,
> bloques de métricas); el único número legible es el 300, que tiene el testimonio de Carlos
> detrás.
>
> El resumen de abajo es la v1 y quedó **desactualizado**: el `.txt` manda.
>
> ⚠️ **EL `.webp` DE LA LANDING NO ES IGUAL AL ORIGINAL. Lleva un parche a mano (01/09/2026).**
> ChatGPT le puso al titular de la tablet letras inventadas: *"Rapme mepós adecinos pareb /
> Mecanics a de Pocincion"*. Medido al tamaño real al que se muestra la imagen, eso **en celular
> no se lee** (el titular ocupa 104×25 px) pero **en escritorio sí, entero** (310×76 px) — y
> escritorio es el 25,7% del tráfico, además del que más engancha.
>
> Se resolvió tapándolo, no regenerando: **dos barras grises de maqueta** del mismo color que las
> que ya tienen las tarjetas de abajo, `rgb(107,107,107)`, sobre un relleno del color exacto de
> la banda, `rgb(2,8,14)`. Inclinadas **3°** (los grados que tiene la pantalla de la tablet) y con
> un desenfoque leve para igualar la nitidez del render. Un titular en gris se lee como "es una
> maqueta"; uno con letras inventadas se lee como error.
>
> 🔴 **Consecuencia: si alguien regenera el `.webp` desde `img/originales/`, vuelve el galimatías
> y nada avisa.** El original se conserva tal como lo devolvió ChatGPT, que es para lo que está
> esa carpeta. El parche hay que rehacerlo. Coordenadas sobre la imagen de 1672×941: relleno en
> (770, 496) de 486×88; barra 1 en (789, 507) de 440×24; barra 2 en (783, 546) de 352×24; todo
> rotado 3° alrededor de (1000, 537).
>
> **La regla general:** pedirle a ChatGPT texto legible dentro de una imagen es pelear con la
> herramienta. Conviene pedirle la pieza **sin texto** y resolver el texto aparte — encima, o
> como maqueta gris.

```
Fotografía de producto de estudio, realista. NO ilustración, NO render 3D plano,
NO diseño gráfico. Formato horizontal 16:9, alta resolución.

A LA IZQUIERDA: un celular vertical, más chico, con una app tipo Instagram —
historias en círculos, una publicación con foto de calle en blanco y negro.
Todo gris, desaturado, con menos brillo que la tablet.

EN EL CENTRO: una flecha horizontal hecha de LUZ con volumen, de índigo
(#6366f1) a cian (#22d3ee), con resplandor real sobre la superficie. No un
icono plano pegado encima.

A LA DERECHA: una tablet horizontal, más grande y más brillante, con un
periódico digital propio — cabecera en serif DESENFOCADA, foto grande de una
ciudad en color, dos líneas de titular, tres tarjetas de notas abajo.

FLOTANDO sobre su esquina superior derecha, una notificación de pago en vidrio
oscuro con borde verde. EL ÚNICO TEXTO LEGIBLE DE LA IMAGEN, en dos líneas:
    + USD 300
    Pago recibido

LUZ: fondo azul muy oscuro casi negro (#07070f), glow índigo a cian detrás de
la tablet, luz lateral suave, reflejos en los bordes. Sobrio y premium.

PROHIBIDO: personas, manos, billetes, monedas, símbolos de dólar, gráficos de
barras, confeti, texto suelto, logos reales.
```

**Adjuntar el boceto de composición** (`Escritorio/BOCETO-LANDING/5-boceto-flecha.png`, armado el 28/08
con HTML + puppeteer) y decirle: *"Respetá esta composición: qué objeto va dónde y de qué tamaño.
Lo que quiero distinto es que sea una fotografía real, no un diseño plano."* Una referencia de
composición ahorra la ronda de prueba y error, que en el plan gratuito cuesta el cupo del día.

**Cómo pasar las referencias.** Adjuntar la imagen del celular, la portada de Hotmart y una captura
del feed de Instagram, y aclarar en la misma línea:

> *"Estas tres son referencia de **paleta y de clima**, no de composición. Quiero fotografía real,
> con la escena que te describo abajo."*

⚠️ **El texto es lo que más falla.** GPT Image deforma las letras cuando le pedís varias frases;
por eso el prompt pide **dos líneas y nada más**. Al recibirla, lo primero que hay que mirar es si
la cifra se lee bien. Si sale rota, se pide de nuevo con la cifra sola (`+ USD 300`), sin la
segunda línea.

### 🎁 Guías y regalos
```
Creá la tapa de una guía en PDF, formato vertical 3:4, alta resolución.

ESTILO: fondo azul muy oscuro casi negro (#07070f), glow índigo (#6366f1) a cian (#22d3ee),
estética premium y sobria de periodismo digital + IA. Aire arriba y abajo.

ELEMENTO CENTRAL: [ELEMENTO] en líneas de neón con glow.

Sin ningún texto ni letras: el título se monta después.
```

### 🔷 Marca

> 🔴 **Tres rondas para entender qué falla.** La v1 salió como el pictograma de un baño
> (cabeza redonda sobre cuerpo cuadrado). La v2 lo arregló inclinándolo. La v3 le puso el
> color de marca. Y aun así Jose dijo "hacé algo más pro" — con razón.
>
> Lo que fallaba no era el dibujo: era la **idea**. Un micrófono con un cubo con una letra
> adentro son **tres piezas diciendo lo mismo**, y eso se ve como un ícono de banco de
> imágenes. Un logo se lee como profesional cuando **una sola forma dice dos cosas**.
>
> **Regla que sale de acá:** si tres vueltas de prompt no lo arreglan, el problema no es el
> prompt. Contar las piezas: si cada una explica lo mismo por separado, sobran.

> 🔴 **El primer intento salió como el pictograma de un baño.** El prompt pedía "cabeza
> redonda arriba, cubo grande abajo, mango corto": eso es, exactamente, cómo se dibuja una
> persona. Las 4 variantes salieron iguales y todas mal.
>
> Lo que lo arregla no es pedir "que parezca más un micrófono", es **romper la silueta
> humana**: inclinarlo, agrandar la esfera hasta que desborde el cubo, y **sacar el espacio
> entre la esfera y el cubo** — ese hueco es el cuello, y es lo que dispara la lectura.
>
> **Regla que sale de acá:** cuando un logo se lee como otra cosa, nombrarle a ChatGPT la
> lectura equivocada (`⛔ ERROR A EVITAR`). Sin eso repite la misma silueta con otro adorno.

> ⚠️ **Esta familia contradice a propósito las instrucciones del proyecto.** El resto de las
> imágenes son cinematográficas, con fondo #07070f y glow. Un logo no puede ser nada de eso:
> tiene que ser plano y recortable. El prompt lo dice en la primera línea porque, si no,
> ChatGPT obedece la instrucción del proyecto y devuelve una ilustración con resplandor que
> **no sirve como logo**.

> 🔴 **Pedirlo en blanco y negro fue un error.** La idea era recortar la silueta y aplicarle
> el color exacto por código, porque ChatGPT no respeta un hex. Pero eso deja a Jose juzgando
> un logo a medio hacer: mirando cuatro micrófonos en blanco y negro no se puede decidir nada.
>
> **Se pide CON los colores de marca.** Que el cian no salga clavado en #22d3ee da igual en
> esta etapa: primero se decide la forma, y el color se ajusta después sobre la elegida.
> Optimizar el archivo final antes de tener la forma aprobada es resolver el problema que
> todavía no toca.

> ⚠️ **Las letras las deforma.** Si la `L` sale torcida en las 4 variantes, se le pide el
> mismo logo **con el cubo vacío** y la letra se monta después con la tipografía real.

```
Rehacé el logo de Leadr. Los anteriores son un dibujo de un micrófono: se
entienden, pero parecen un ícono de banco de imágenes, no una identidad.

Quiero nivel de estudio de identidad corporativa: geométrico, construido, una
sola idea y ninguna pieza de más.

LA IDEA
El micrófono ES la letra L. Una sola forma con dos lecturas:
- Un trazo grueso en ángulo recto que dibuja una L: una barra vertical, y un pie
  horizontal que sale hacia la derecha desde abajo.
- En el extremo de arriba de la barra vertical, un círculo sólido de poco más del
  doble del ancho del trazo: la cabeza del micrófono.
Nada más. Sin cubo, sin rejilla, sin ondas, sin mano, sin base.
Se lee "L" y se lee "micrófono", y son exactamente la misma forma.

CONSTRUCCIÓN
- Hecho con regla y compás sobre una grilla: círculo perfecto, ángulos de
  exactamente 90 grados, un único grosor de trazo en toda la pieza, un único
  radio para todas las esquinas.
- Las puntas del trazo cortadas rectas, no redondeadas.
- Estilo de identidad corporativa suiza: minimalismo geométrico, precisión,
  espacio negativo generoso.

COLOR
- Fondo azul muy oscuro casi negro #07070f, todo el lienzo.
- La forma en un degradado suave de índigo #6366f1 abajo a cian #22d3ee arriba.
- Sin contornos, sin brillos, sin sombras, sin 3D, sin texturas.

TAMAÑO
Se tiene que reconocer a 16 píxeles. Trazo grueso, cero detalle chico.
Centrado, cuadrado, con mucho aire alrededor. Sin ningún texto.

Generá 4 variantes cambiando solo tres cosas: el grosor del trazo, el tamaño del
círculo respecto del trazo, y el largo del pie de la L.
```

**Conceptos de reserva**, por si el micrófono no convence. Se piden en el mismo chat
cambiando solo el bloque `QUÉ SE VE`:

| Concepto | Qué se ve | Qué dice |
|---|---|---|
| **La libreta** | Libreta de reportero con espiral arriba; la primera línea escrita, gruesa y llena; las de abajo, cortas | El *lead* es el primer párrafo — el nombre de la marca, dibujado |
| **La comilla** | Una comilla de apertura tipográfica que, girada, también es una L | La cita: la materia prima del oficio |

⚠️ **El nombre no dice periodismo por sí solo.** "Leadr" solo se entiende si ya sabés que el
*lead* es la entrada de una noticia — y eso lo sabe un periodista, no alguien que recién llega.
Por eso el dibujo tiene que poner el oficio, no la letra: un logo que sea solo una L no lo dice.

---

---

## 4. El flujo, de punta a punta

1. **Abrir el chat de la familia** que corresponde (nunca uno nuevo suelto, nunca el que no es).
2. Si arranca una tanda: subir 1 imagen ya aprobada como referencia.
3. Pedir la imagen cambiando **solo** lo que está entre [corchetes] del prompt maestro.
4. Revisar: ¿fondo #07070f? ¿acento índigo/cian? ¿sin texto deformado? ¿espacio libre donde
   va a ir el título? Si no, se corrige en el mismo chat — no se abre otro.
5. **Descargar el PNG** y guardarlo en la carpeta canónica de esa familia con nombre descriptivo
   (`modulo-3-clase-2.png`, no `imagen (4).png`).
6. Si es para un anuncio, queda registrada en la ficha del ad
   ([ads-agent/registro-anuncios.md](../registro-anuncios.md)).

> ⚠️ **Descargar EN EL MOMENTO, nunca al día siguiente.** Las imágenes de ChatGPT se sirven por
> una URL firmada que **caduca**. Si volvés a un chat viejo y le das a descargar, Chrome guarda
> igual un archivo `.png`… de 45 bytes, con `{"detail":"Invalid signature or expired URL"}`
> adentro. En la carpeta se ve como una portada normal: **el único síntoma es el tamaño**. Si un
> PNG pesa menos de ~100 KB, no es una imagen. Recuperarlo: recargar la página (F5) para que el
> chat pida URLs nuevas, y recién ahí descargar. Pasó el 15/08/2026 con 10 archivos.

**Límite del plan free:** hay un tope diario de generaciones. Si es una tanda grande (todas las
portadas de un módulo), conviene hacerla de una sentada en el mismo chat y no de a una por día:
si el chat se enfría y se pierde el hilo de referencias, la familia se corre.

---

## 5. Lo que ya NO se usa

- **higgsfield** — dado de baja como proveedor. Sus 4 skills y los 2 repos clonados en `_material/` se **eliminaron** el 2026-08-01 (6 MB). Lo que seguía
  instalados pero **no se rutea generación de imágenes por ahí sin avisar**.
- **fal.ai** — no se usa ($0). Su cliente `lib/fal.mjs` se **eliminó** el 2026-08-01, junto con `generate-campaign-images.mjs`, que dependía por completo de él.
- **API de OpenAI Images** (pago) — opción futura para automatizar cuando haya volumen.
  Hoy fuera de alcance: todo es manual por la web.
