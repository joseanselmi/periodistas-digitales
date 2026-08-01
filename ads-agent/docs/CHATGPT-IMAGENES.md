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
| 🎬 Portadas del curso | Portadas de módulo y de clase del curso en video | 16:9 · 1920×1080 · sin texto | ✅ ya existe |
| 📣 Ads | Creativos de anuncios de Meta (Mateo) | 1:1, 4:5 y 9:16 | ✅ ya existe |
| 📱 Orgánico | Fondos e ilustraciones para carruseles y posteos del muro (Valentina) | 4:5 · 1080×1350 | ➕ crear |
| 🌐 Web | Imágenes de la landing del curso y de Leadr (hero, secciones, avatares) | según la sección | ➕ crear |
| 🎁 Guías y regalos | Tapas de las guías-regalo en PDF | 3:4 vertical, tipo portada de libro | ➕ crear |
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

### 🎬 Portadas del curso
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

### 🎁 Guías y regalos
```
Creá la tapa de una guía en PDF, formato vertical 3:4, alta resolución.

ESTILO: fondo azul muy oscuro casi negro (#07070f), glow índigo (#6366f1) a cian (#22d3ee),
estética premium y sobria de periodismo digital + IA. Aire arriba y abajo.

ELEMENTO CENTRAL: [ELEMENTO] en líneas de neón con glow.

Sin ningún texto ni letras: el título se monta después.
```

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
