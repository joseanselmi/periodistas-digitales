# Identidad visual de portadas (para generar en ChatGPT)

> Objetivo: que TODAS las portadas (por módulo y por clase) se vean **de la misma familia**, variando
> solo el elemento central según el contenido. La forma de lograrlo con ChatGPT: **mantener el BLOQUE
> FIJO idéntico siempre** y cambiar solo lo que está entre [corchetes]. Ideal: generá la primera,
> y para las siguientes decile "misma identidad y estilo, cambiá solo el elemento central por X" (o
> subí la primera como imagen de referencia).

## La identidad (lo que NO cambia)
- Fondo azul muy oscuro casi negro (#07070f).
- Resplandor difuso índigo (#6366f1) → cian (#22d3ee) en una esquina; sutil grilla tecnológica tenue.
- Estética sobria, premium, minimalista, cinematográfica. Mezcla de periodismo digital + IA.
- Un ÚNICO elemento simbólico central, en líneas de neón brillante con glow, flotando.
- Mucho espacio negativo a la izquierda (para poner el título después). **Sin texto en la imagen.**
- 16:9 (1920×1080).

## Lo que SÍ cambia
- **Por módulo:** el color de acento y el ícono/elemento del tema.
- **Por clase:** el elemento central según el concepto de esa clase (mismo color del módulo).

---

## ⭐ PROMPT MAESTRO (copiar y pegar en ChatGPT; cambiar solo lo de [corchetes])

```
Creá una portada para un curso online premium, en formato horizontal 16:9, alta resolución.

ESTILO (mantener siempre igual): fondo azul muy oscuro, casi negro (#07070f). Un resplandor
difuso y elegante que va de índigo (#6366f1) a cian (#22d3ee) en la esquina derecha, con una
sutil grilla tecnológica tenue de fondo. Estética minimalista, sobria, cinematográfica y de alta
gama, que combina periodismo digital con inteligencia artificial. Iluminación cinematográfica,
limpio y con mucho aire.

ELEMENTO CENTRAL: [ELEMENTO], dibujado con líneas de neón brillante en tonos [COLOR], flotando
a la derecha, con un brillo suave (glow). Dejá bastante espacio negativo a la izquierda.

Sin ningún texto ni letras en la imagen.
```

- **[COLOR]** = el acento del módulo (ver tabla).
- **[ELEMENTO]** = el símbolo del módulo o de la clase (ver abajo).

> Nota sobre el TÍTULO: ChatGPT suele deformar el texto, por eso el prompt pide la imagen SIN texto.
> El título ("Módulo 0 · Bienvenida") lo agregás encima en Hotmart/Canva, o lo dejamos sin texto
> (queda limpio y premium igual).

## ⛔ El color por módulo NO se aplica en las portadas (decisión de Jose, 16/08/2026)

**Las portadas del curso son todas de la misma familia azul/violeta, y así se quedan.** El color
por módulo existe **sólo en los videos**. Si esta doc y las portadas reales no coinciden, mandan
las portadas: la doc describía una intención que nunca se cumplió.

**Por qué.** Se midió el tono real del neón de las 38 portadas existentes con
`ads-agent/scripts/curso/portadas-verificar-color.mjs`:

| Módulo | Color pedido | Tono que devolvió ChatGPT |
|---|---|---|
| 0 · Bienvenida | cian (188°) | 209-222° |
| 1 · Fundamentos | índigo (239°) | 212-236° |
| 2 · IA | cian (188°) | 221-224° |
| 5 · Nicho y lector | cian | 202-213° |
| 3 · Verificación | violeta | 252-255° |
| 4 · Nombre y marca | violeta | 254-256° |

**Pedirle cian y pedirle índigo devuelve el mismo azul eléctrico.** Sólo el violeta sale distinto,
porque está lejos del azul. No hay seis colores posibles: hay azul y violeta. Regenerar 17
imágenes para perseguir verde y rosa costaba 2-3 días de cupo del plan gratis para un detalle que
el alumno no ve —mira una clase a la vez, no el listado completo comparando tonos.

> ⚠️ **No "arreglar" esto.** Ni regenerando ni rotando el tono por software (se probó el 16/08 con
> `sharp modulate({hue})`: el núcleo del neón está casi blanco y no se mueve, el fondo sí, y M5
> quedó con fondo magenta y aros celestes — peor que el problema).

## Tabla por MÓDULO — el ELEMENTO, que es lo que sí cambia

El color de la tabla queda como referencia de la intención original y del **motivo de los videos**;
para las portadas, lo único que se varía es el elemento central.

| Módulo | Color del VIDEO | [ELEMENTO] |
|---|---|---|
| 0 · Bienvenida | cian `#22d3ee` | un cohete despegando |
| 1 · Fundamentos | índigo `#6366f1` | una flecha ascendente / gráfico de crecimiento |
| 2 · IA | cian `#22d3ee` | un chip de computadora con conexiones |
| 3 · Verificación | verde `#34d399` | un escudo con una tilde de verificado |
| 4 · Nombre y marca | rosa `#f472b6` | una gota de tinta / paleta de color |
| 5 · Nicho y lector | violeta `#a78bfa` | una diana / un faro que ilumina |
| 6 · Contenido | violeta | una señal de compartir / ondas |
| 7 · Comunidad | violeta | un grupo de nodos conectados |
| 8 · Probar y medir | cian | un tablero con gráficos / un gráfico de líneas |
| Monetización (afiliados/anunciantes/producto) | dorado (#f5b642) | monedas apiladas / un maletín |
| Anuncios (Meta) | cian | un objetivo con una flecha |

## Por CLASE (mismo color del módulo, elemento del concepto)
Ejemplos para Fundamentos (índigo):
- 1.1 El negocio de un medio de nicho → un engranaje/motor o un árbol que crece (el activo).
- (cuando sumemos más) usar el símbolo del concepto de cada clase.

Regla: el color lo manda el módulo; el elemento lo manda el tema puntual. Así se ven todas hermanas.
