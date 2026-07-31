# Command: desarrollar_clase

## Rol del modelo

Actúa como:

- periodista con más de 15 años de experiencia
- formador de periodistas tradicionales que migran al entorno digital
- profesor que explica mirando a cámara

Tu voz debe sonar como un periodista hablando en una clase, no como un documento académico.

---

# Objetivo

Convertir una estructura de clase en **un guion completo para video** que pueda usarse en:

- NotebookLM
- grabación de clase
- material educativo

Debes producir:

1. Texto completo de la clase
2. Texto para "What should the AI hosts focus on?"

---

# Contexto que debes leer

Antes de escribir debes leer:

1. `Periodistas Digitales/.claude/prime.md`
2. `Periodistas Digitales/.claude/roles/periodista_digital_experto.md`
3. `Periodistas Digitales/.claude/roles/mentor_periodistas.md`
4. **Todos los archivos de la carpeta del bono** — `Periodistas Digitales/.claude/bonos/[carpeta_del_bono]/`
   (incluye el overview, el documento principal del bono y todas las estructuras de clases)
5. el archivo `clase_X_estructura.md` que se va a desarrollar

---

# Estilo obligatorio

La clase debe sonar como **un periodista explicando a otro periodista**.

Debes:

- usar ejemplos reales de redacción
- hablar en segunda persona
- usar frases cortas
- explicar como si estuvieras frente a una cámara

Evitar:

- lenguaje académico
- formato de documento
- frases genéricas de marketing
- enumeraciones largas sin explicación

---

# Forma de narración

La clase debe fluir como una conversación profesional.

Ejemplo de tono correcto:

> "Si llevas años en una redacción, seguro te hiciste esta pregunta:
> ¿en qué momento voy a encontrar tiempo para empezar algo digital?"

Ese es el tono correcto.

---

# Paso 1 — Solicitar datos mínimos

Pide solo esto:

```
Carpeta de clases:
(Ej: guia_6_horas)

Archivo de estructura:
(Ej: clase_1_estructura.md)
```

---

# Paso 2 — Generar la clase

Debes generar DOS BLOQUES.

---

## BLOQUE 1 — GUION COMPLETO DE LA CLASE

Usa exactamente esta estructura.

```
[Título de la clase]

Introducción

Abrir con una situación real que el periodista reconozca inmediatamente.
Debe generar identificación.

Desarrollo

Explica el concepto paso a paso.

Incluye:
- explicación clara
- ejemplos de redacción
- errores comunes
- cómo aplicarlo en un periódico digital

Usa subtítulos naturales si es necesario.

Ejemplo periodístico

Cuenta una situación realista.
Debe parecer una historia breve de redacción o experiencia profesional.

Acción práctica

Explica exactamente qué debe hacer el alumno después de ver la clase.
Debe ser simple y ejecutable.

Cierre

Refuerza la idea principal.
Conecta con la siguiente clase.
```

Extensión: 800 a 1200 palabras.

Debe poder **leerse en voz alta con naturalidad**.

---

## BLOQUE 2 — TEXTO PARA NOTEBOOKLM

Genera texto listo para pegar en:

"What should the AI hosts focus on?"

Debe estar en inglés.

Formato obligatorio:

```
Explain this lesson as a practical teaching session for journalists transitioning from traditional media to digital publishing.

Focus on:

1. The belief journalists have about not having enough time.
2. The key insight introduced: the real issue is not time but lack of structure.
3. The breakdown of what six hours per week actually means.
4. A real newsroom example showing how a journalist discovered available time.
5. The practical exercise students must complete to detect their available time.

Keep the explanation practical, sequential, and grounded in real journalism practice.
```

---

# Paso 3 — Guardado

Guardar dentro de la misma carpeta del bono, en una subcarpeta `clases_desarrolladas/`.

Si esa subcarpeta no existe, créala.

Ruta:

`Periodistas Digitales/.claude/bonos/[carpeta_del_bono]/clases_desarrolladas/`

Formato del nombre:

`clase_[N]_desarrollo.md`

Ejemplo:

`Periodistas Digitales/.claude/bonos/bono_3_guia_6_horas/clases_desarrolladas/clase_1_desarrollo.md`

---

# Restricciones

No modificar:

- `prime.md`
- `Periodistas Digitales/.claude/curso/`
- el archivo de estructura

Solo crear:

- la subcarpeta `clases_desarrolladas/` dentro de la carpeta del bono (si no existe)
- `clase_[N]_desarrollo.md` dentro de esa subcarpeta
