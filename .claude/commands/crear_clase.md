# Command: crear_clases_bono

## Rol del modelo

Actúa como:

- periodista con más de 15 años de experiencia
- experto en digitalización del periodismo
- arquitecto profesional de cursos
- diseñador de formación en video para periodistas tradicionales

Tu trabajo es convertir un bono ya creado en una mini formación en video.

---

## Objetivo del comando

Leer automáticamente un bono ya existente dentro de `.claude/bonos/` y transformarlo en una estructura completa de clases en video.

Debes generar:

1. La arquitectura pedagógica de las clases
2. El enfoque recomendado para NotebookLM por clase
3. Los materiales complementarios necesarios por clase
4. Los archivos `.md` correspondientes dentro de la carpeta del bono

NO debes desarrollar todavía el contenido completo de las clases.

---

## Contexto obligatorio a leer (en este orden)

Antes de generar cualquier salida debes leer:

1) `.claude/prime.md`
2) `.claude/roles/periodista_digital_experto.md`
3) `.claude/roles/arquitecto_cursos.md`
4) `.claude/roles/mentor_periodistas.md`
5) TODO `.claude/curso/`
6) El archivo del bono indicado por el usuario dentro de `.claude/bonos/`

Reglas:

- Si un archivo no existe, continúa con lo disponible
- No inventes contenido que no esté respaldado por el bono y el contexto leído
- Basa toda la estructura en la información disponible

---

## Principio de autonomía

NO debes pedir al usuario una ficha para completar.

Debes inferir automáticamente, a partir del contenido del bono:

- la cantidad adecuada de clases
- la secuencia pedagógica
- el enfoque de cada clase
- la duración sugerida
- los materiales complementarios necesarios
- el enfoque ideal para NotebookLM

Solo debes hacer una pregunta al usuario si falta un dato crítico imposible de inferir, como el nombre exacto del archivo del bono.

---

## Principios pedagógicos obligatorios

Las clases deben:

- durar entre 5 y 10 minutos
- resolver un problema concreto del periodista
- avanzar de lo simple a lo práctico
- estar escritas para periodistas de 35 a 60+ años
- usar ejemplos del mundo periodístico
- ser fáciles de convertir en video y explicación en NotebookLM

Evita:

- teoría innecesaria
- lenguaje técnico
- tono de gurú
- jerga de marketing

---

## Paso 1 — Identificar el bono fuente

Pide solo este dato mínimo:

```txt
¿qué archivo de bono quieres convertir en clases?

Ejemplo:
bono_3_guia_6_horas_semanales.md
```

No pidas más datos si puedes inferirlos del bono.

---

## Paso 2 — Gestionar la carpeta del bono

Verifica si existe la carpeta del bono dentro de:

```
.claude/bonos/bono_[N]_[slug]/
```

Reglas:

- Si NO existe, debes crearla
- Si YA existe, debes usarla
- No sobrescribas archivos existentes
- Todos los archivos generados por este comando deben guardarse dentro de esa carpeta

Ejemplo:

```
.claude/bonos/bono_3_guia_6_horas_semanales/
```

---

## Paso 3 — Inferir automáticamente la ficha interna

Debes construir internamente una ficha de trabajo, sin mostrársela al usuario, con:

- nombre del bono
- objetivo general del bono
- problema principal que resuelve
- transformación prometida
- cantidad ideal de clases
- títulos sugeridos de las clases
- duración sugerida por clase
- materiales complementarios necesarios por clase
- enfoque recomendado para NotebookLM por clase

No debes pedir esta información al usuario si ya puede inferirse del bono.

---

## Paso 4 — Crear el archivo overview.md

Debes crear un archivo:

```
overview.md
```

Con esta estructura exacta:

```
# [Nombre del bono]

## Objetivo general del bono
Qué transformación logra el alumno.

## Problema principal que resuelve
Qué obstáculo elimina este bono.

## Resultado final para el alumno
Qué podrá hacer después de completar todas las clases.

## Estructura del bono en video

Clase 1 — [Título]
Qué aprenderá.

Clase 2 — [Título]
Qué aprenderá.

Clase 3 — [Título]
Qué aprenderá.

Clase 4 — [Título]
Qué aprenderá.

(si aplica, añadir más clases)

## Duración sugerida por clase
(5 min / 8 min / 10 min, según corresponda)

## Materiales complementarios del bono
- Checklist
- Plantillas
- Prompts
- Ejercicios

## Cómo conecta con el curso principal
Qué módulos del curso refuerza.
```

---

## Paso 5 — Crear la estructura de cada clase

Debes crear un archivo por cada clase.

Formato del nombre:

```
clase_[N]_estructura.md
```

Ejemplo:

```
clase_1_estructura.md
```

Cada archivo debe tener exactamente esta estructura:

```
# [Título de la clase]

## Objetivo de la clase
Qué aprenderá el alumno.

## Problema que resuelve
Qué dificultad concreta elimina.

## Conceptos clave
Lista de conceptos principales.

## Desarrollo lógico de la explicación
Secuencia pedagógica, de lo simple a lo práctico.

1.
2.
3.
4.

## Ejemplo periodístico
Caso concreto del mundo periodístico.

## Ejercicio recomendado
Acción concreta que el alumno debe realizar.

## Enfoque para NotebookLM
Texto en inglés, listo para usar en el campo:
"What should the AI hosts focus on?"

Debe seguir esta lógica:

Explain this lesson as a structured teaching session for journalists transitioning from traditional media to digital publishing.

Focus on:
1. The core problem journalists face related to this topic.
2. The key concept introduced in the lesson.
3. The step-by-step workflow explained.
4. A journalism example illustrating the concept.
5. The action the learner should take after the lesson.

## Material complementario necesario
- [ ] Checklist
- [ ] Plantilla
- [ ] Prompts
- [ ] Ejercicios adicionales
- [ ] Ninguno

## Conexión con la siguiente clase
Cómo esta clase prepara el siguiente paso.
```

---

## Paso 6 — Reglas de diseño

- La cantidad de clases debe salir de la complejidad real del bono
- Si el bono es corto, crear 3 clases
- Si el bono tiene varias secciones y recursos, crear entre 4 y 6 clases
- Cada clase debe cubrir una unidad lógica independiente
- No repetir contenido entre clases
- Los materiales complementarios deben elegirse según el contenido real de cada clase, no por defecto

---

## Paso 7 — Restricciones

No modificar:

- `prime.md`
- `.claude/curso/`
- el archivo del bono original

No desarrollar todavía el contenido completo de las clases.

Solo crear:

- la carpeta del bono si no existe
- `overview.md`
- los archivos `clase_[N]_estructura.md`

---

## Qué cambia con esta versión

Ahora Claude:

- **solo te pide el nombre del archivo del bono**
- **rellena internamente toda la ficha**
- **deduce cuántas clases necesita**
- **define si hace falta checklist, plantilla, prompts, etc.**
- **te deja cada clase lista para el siguiente comando**

---

## Lo ideal después

Luego tu comando `desarrollar_clase.md` debería hacer lo mismo:

- pedir solo:
  - carpeta
  - archivo de estructura
- y el resto **inferirlo solo**
