# scripts/curso — transcripciones del curso de Hotmart

**Padre:** [`ads-agent/scripts/`](../) · **Abuelo:** [`ads-agent/`](../../README.md)

Bajan y transcriben el curso de Luis Mena (la fuente de método para copy, VSL y
oferta). La salida va a `../../../_material/luis-mena/` — fuera del repo.

> Se corren **parados en `ads-agent/`**, no dentro de `scripts/`:
> varios buscan `.env.local` o `state/` relativos a esa
> carpeta. Ejemplo: `cd ads-agent && node scripts/curso/transcribir-curso.mjs`

- `compilar-memoria.mjs`
- `importar-transcripciones.mjs`
- `transcribe_helper.py`
- `transcribir-curso.mjs`
- `hotmart-inspeccionar.mjs` — **mira, no toca.** Ver abajo.
- `portadas-manifiesto.mjs` — qué portada va a qué clase. Ver abajo.

## `hotmart-inspeccionar.mjs` — el paso previo a subir nada

Este no es del curso de Luis Mena: es del **nuestro**, del lado de productor.

Abre Chrome con el mismo perfil persistente que el scraper, y después mandás vos:
navegás hasta la pantalla del editor que interese, apretás ENTER en la terminal, y
fotografía esa pantalla — captura, HTML y un JSON con todos los `input[type=file]`,
botones e imágenes que encuentra, recorriendo también los iframes.

```bash
cd ads-agent && node scripts/curso/hotmart-inspeccionar.mjs
```

**Por qué hace falta.** Para subir las portadas de las clases con un script hay que
saber qué input recibe el archivo y qué botón guarda. Eso no está documentado en
ningún lado y **adivinarlo es la peor opción**: un selector inventado no tira error,
el script corre, dice "listo" y no sube nada — el mismo modo de fallar mudo que
`verificar-repo.mjs` existe para atajar.

Sale a `_material/hotmart-editor/`, fuera del repo.

## `portadas-manifiesto.mjs` — qué portada va a qué clase

```bash
cd ads-agent && node scripts/curso/portadas-manifiesto.mjs
```

Recorre `Contenido del curso/Portadas/` (fuera del repo, en el Escritorio de Jose) y
arma `state/portadas-clases.json`: **34 clases**, cada una con su archivo y su título.

- La fuente de verdad son los archivos en disco, no una lista escrita a mano: si se
  regenera una portada o se suma una clase, la toma sola.
- **Las portadas de MÓDULO quedan afuera a propósito** (son 6, otra pantalla de
  Hotmart, se cargan a mano). El script sube solo portadas de clase.
- Avisa fuerte si algún PNG pesa menos de 200 KB: eso no es una imagen, es el error
  `Invalid signature or expired URL` de ChatGPT guardado con extensión `.png`, que en
  la carpeta se ve idéntico a una portada buena.

Es la mitad del trabajo que **no** depende del editor de Hotmart, así que se puede
revisar antes de tocar nada: es exactamente lo que imprime el `--dry` del que sube.

`transcribe_helper.py` (faster-whisper) **tiene que quedar en esta carpeta**:
`transcribir-curso.mjs` lo busca al lado suyo.

El audio descargado ya no se conserva —eran ~800 MB de intermedios y está
gitignorado—; lo que queda son las transcripciones `.txt`/`.md`. Si hiciera
falta re-transcribir, hay que volver a bajarlo.

## ⚠️ Las transcripciones son locales, no viajan con el repo

El material vive en **`_material/luis-mena/`**, que está en `.gitignore` desde el
2026-08-01. Son transcripciones **literales de un curso pago de un tercero**
(Luis Mena) más capturas de la sesión de Hotmart, y este repositorio es
**público**.

Antes estaba en `ads-agent/hotmart-transcripts/`; se movió y se sacó de git el
2026-08-01 por ese motivo legal. Si algún documento todavía nombra la ruta
vieja, está desactualizado.

Sigue en el disco de Jose y los scripts lo usan igual. Pero **en un clon nuevo
no va a estar**: si hace falta, hay que volver a correr el scraper.

Lo que sí se versiona es lo destilado: el método está en
[`../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md`](../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md),
que es análisis propio, no el material ajeno.
