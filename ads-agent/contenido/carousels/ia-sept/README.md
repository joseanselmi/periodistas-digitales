# ia-sept — el texto de septiembre 2026

**Padre:** [`ads-agent/contenido/carousels/`](../README.md)

Acá vive **`CONTENIDO.mjs`**, que es el único dueño del texto del mes: los 27 pies
de foto y las 27 stories del arco *"IA aplicada al periodista de a pie"* (04→30/09).

No hay imágenes en esta carpeta. Las placas y los JPG salen del generador y se
guardan en otro lado:

| Qué | Dónde queda |
|---|---|
| Pies de foto | `../ia-s0` … `../ia-s4` → `para-subir/N-DIA/pie-de-foto.txt` |
| Carruseles (HTML y placas) | `../ia-s0` … `../ia-s4` |
| Stories verticales | [`../muro-stories/`](../muro-stories/README.md) ⚠️ ver su README |

## Por qué el texto vive separado de las placas

Porque tiene dos lectores. Jose lo revisa y aprueba antes de que salga; el
generador lo consume para escribir archivos. Si el mismo texto estuviera copiado
en las dos partes, alguna de las dos se iba a quedar vieja sin avisar — que es
exactamente el problema que este repo ya tuvo con el sync de Hotmart duplicado.

**Un pie de foto se corrige acá y sólo acá**, y después se vuelve a correr:

```bash
cd ads-agent
node scripts/generar/gen-septiembre-ia.mjs
```

## El generador se niega a escribir si el texto rompe una regla

Antes de tocar un archivo chequea las 8 reglas del arco (neutro, sin enlaces, sin
cifras de audiencia, precio sólo los viernes de venta, cierre con pregunta, etc.).
Si algo falla, no escribe **nada** y lista los fallos.

> ⚠️ El detector de voseo usa lookarounds Unicode y no `\b`. En JavaScript `\b` es
> ASCII: después de una vocal acentuada **no hay borde de palabra**, así que un
> patrón como `/\bbuscá\b/` nunca cierra y el chequeo da verde con el voseo
> delante. Pasó al escribir este mes.

## Los tres jueves están vacíos a propósito

`10`, `17` y `24` de septiembre son días de prueba social y están marcados con
`NECESITA_DATO: true`. El generador los saltea y el programador no los sube.

**No se llenan inventando un testimonio.** Cada uno dice adentro qué hecho real le
falta. Mientras no aparezca, la fanpage tiene tres huecos, que es mejor que tres
posteos con un colega que no existe.
