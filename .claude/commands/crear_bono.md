# Command: crear_bono

## Objetivo
Crear un bono nuevo para el curso, usando todo el contexto del proyecto, y guardar el resultado en un archivo .md dentro de una carpeta de bonos.

---

## Contexto obligatorio a leer (e1) `Periodistas Digitales/.claude/prime.md`
2) `Periodistas Digitales/.claude/roles/periodista_digital_experto.md`
3) `Periodistas Digitales/.claude/roles/arquitecto_cursos.md`
4) `Periodistas Digitales/.claude/roles/mentor_periodistas.md`
5) TODO el contenido de `Periodistas Digitales/.claude/curso/` (overview + módulos + clase final)n este orden)


Reglas:
- Si falta algún archivo, continuar igual con lo disponible.
- No inventar "qué hay" en archivos que no existan.

---

## Instrucciones de comportamiento (NO NEGOCIABLES)
- Piensa y escribe como: periodista con +15 años + referente en digitalización + mentor de periodistas tradicionales.
- Tono: claro, adulto, profesional, cero "gurú".
- No uses jerga agresiva de marketing.
- Todo debe ser aplicable para periodistas 35–60+ con baja/mediana habilidad digital.
- Paso a paso, simple, sin tecnicismos innecesarios.

---

## Salida requerida (estructura)
Debes crear (si no existe) esta carpeta:
`Periodistas Digitales/.claude/bonos/`

Luego, dentro de esa carpeta, crea **una subcarpeta con el nombre del bono**:
`Periodistas Digitales/.claude/bonos/bono_<N>_<slug>/`

Y dentro de esa subcarpeta, el archivo Markdown:

**Nombre del archivo:**
- Usa este formato: `bono_<N>_<slug>.md`
- Ejemplo: `bonos/bono_2_ia_master_periodistica/bono_2_ia_master_periodistica.md`

**Dentro del archivo, incluye exactamente esta estructura:**

# [NOMBRE DEL BONO]
## Propósito del bono
(qué problema elimina / qué acelera)

## Para quién es
(qué perfil del periodista lo aprovecha más)

## Qué incluye (entregables exactos)
- (lista detallada de entregables)

## Cómo se usa (paso a paso)
1.
2.
3.

## Resultado esperado
(qué logra el alumno con este bono)

## Cómo conecta con el curso principal
(qué módulo potencia y por qué)

## Índice del bono
(estructura interna: capítulos / secciones / plantillas)

## Entregables listos para copiar y pegar
(Incluir aquí plantillas, prompts, checklists, formatos, ejemplos)

---

## Inputs que te daré yo
Te voy a dar:
- N del bono (ej: 2)
- Nombre del bono
- "Promesa" del bono (1 frase)
- Si es guía / prompts / plantillas / checklist / etc.
- Color del bono (ej: azul, verde, naranja — para identidad visual)
- (Opcional) precio de referencia (ej: valor $27)

---

## Restricciones
- No modificar `prime.md`
- No modificar nada dentro de `Periodistas Digitales/.claude/curso/`
- No reescribir ni editar el contenido del curso
- Solo crear carpeta `Periodistas Digitales/.claude/bonos/` y el archivo del bono

---

## Ahora ejecuta
Pídeme los 5 inputs mínimos:
1) N del bono
2) Nombre exacto del bono
3) Promesa en 1 frase
4) Tipo de bono (guía / prompts / plantillas / checklist / toolkit)
