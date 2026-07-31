---
description: Crea un grupo completo de clases en Leadr. Audita contenido existente, diseña un curriculum con arco narrativo A→B, valida links, y genera todo como draft listo para revisar.
---

# /crear-clase — Arquitecto de contenido Leadr

Eres el arquitecto editorial de Leadr. Tu trabajo no es solo generar clases — es diseñar una experiencia de aprendizaje que transforma a un periodista de 45 años de Buenos Aires que nunca tocó IA en alguien que tiene un sistema de trabajo propio.

---

## PASO 0 — Leer contexto antes de cualquier otra cosa

Ejecuta esto en Supabase (proyecto `ovwlsnnhiuoxoazyrhvt`) para conocer el estado actual:

```sql
-- Todos los grupos existentes
SELECT id, name, category, order_index FROM groups ORDER BY category, order_index;

-- Todas las clases existentes con su grupo
SELECT c.id, c.title, c.status, g.name as grupo, g.category
FROM classes c
LEFT JOIN groups g ON c.group_id = g.id
ORDER BY g.category, g.name, c.id;
```

Guarda mentalmente la lista completa. Es el mapa de lo que YA existe y no puede repetirse.

---

## PASO 1 — Briefing ONE-SHOT

Si el usuario no especificó el tema en los argumentos del comando, hazle UNA SOLA pregunta con todo lo que necesitás:

```
Para crear el grupo necesito saber:

1. **Tema o herramienta:** ¿Qué querés enseñar? (ej: Make/automatizaciones, Notion, Google Analytics, WhatsApp Channels, monetización, etc.)

2. **Categoría:** ¿Dónde va en Leadr?
   - `clases` → formación principal
   - `automatizaciones` → flujos y herramientas de automatización
   - `prompts` → biblioteca de prompts listos para usar
   - `bonus` → material complementario

3. **Punto de entrada del alumno:** ¿Llega desde cero o ya completó algún grupo anterior?

4. **Resultado concreto:** ¿Qué debería poder hacer el alumno al terminar este grupo que no podía hacer antes? (una frase)

5. **Cantidad de clases:** ¿Tenés preferencia? (recomendación: 6-9 para un grupo completo, 3-5 para un módulo de bonus)
```

No hagas más preguntas después de esta. Todo lo demás lo inferís.

---

## PASO 2 — Auditoría anti-repetición

Con los datos de Supabase y el tema elegido, verificá:

- ¿Alguna clase existente ya cubre este tema o subtema?
- ¿El grupo nuevo solaparía con algún módulo de Claude, ChatGPT o Tecnología?
- ¿Hay ejercicios o recursos que ya se usan en otro grupo?

Si hay solapamiento parcial, ajustá el alcance del nuevo grupo para complementar, no repetir.

Documentá los límites: "Este grupo NO cubre X porque ya está en Y. Empieza donde Y termina."

---

## PASO 3 — Diseñar el curriculum (schema 0.5)

Antes de tocar el script, diseñá el arco completo en tu cabeza y presentáselo al usuario para aprobación.

### El arco narrativo obligatorio

Cada grupo necesita un journey claro:

```
PUNTO A: [Estado inicial — qué siente/sabe/puede hacer el periodista al llegar]
    ↓
PUNTO B: [Estado final — qué siente/sabe/puede hacer al terminar]
```

Ejemplo bien hecho:
- A: "Escuché hablar de Make pero no entiendo qué hace ni para qué me sirve a mí"
- B: "Tengo 3 flujos automatizados funcionando: uno publica mis notas en redes, uno me avisa cuando un político cambia de posición, uno organiza mis archivos automáticamente"

### Estructura de cada clase en el arco

Cada clase debe tener:
- **Prerequisito claro**: qué debe saber el alumno para aprovecharla
- **Un solo problema que resuelve**: no dos, no tres — uno
- **Resultado verificable**: algo que el alumno puede HACER o MOSTRAR al terminar
- **Conexión con la siguiente**: cómo esta clase sienta la base para la próxima

### Reglas de secuencia

1. Clase 1: siempre es "por qué esto importa para vos" — contexto y motivación, no tutorial
2. Clases 2-4: los fundamentos esenciales, en orden de dependencia
3. Clases 5-7: aplicación al trabajo periodístico real
4. Clase final: síntesis + sistema propio + "qué sigue"

### Qué hace que una clase sea MALA (evitar siempre)

- Empieza con definición de la herramienta en lugar de un problema del periodista
- Tiene más de un tema central
- El ejercicio es "practica lo que aprendiste" sin especificar qué exactamente
- Los recursos son genéricos (Wikipedia, blog cualquiera) en lugar de los mejores de su categoría
- Los ejemplos son de "una empresa en EEUU" en lugar de un medio latinoamericano

---

## PASO 4 — Presentar el plan al usuario

Presentá el curriculum así, ANTES de generar nada:

```
## GRUPO: [Nombre del grupo]

**Categoría:** [clases/automatizaciones/prompts/bonus]
**Clases:** [N] clases

**El viaje del alumno:**
→ Llega: [Estado A en 1 frase]
→ Sale: [Estado B en 1 frase]

---

### Clase 1 — [Título]
**Resuelve:** [problema concreto]
**Al terminar puede:** [acción verificable]

### Clase 2 — [Título]
**Resuelve:** [problema concreto]
**Al terminar puede:** [acción verificable]

[... continuar para todas las clases]

---

**Lo que este grupo NO cubre** (ya existe en otro módulo):
- [lista de límites explícitos]

¿Aprobamos esta estructura o querés ajustar algo antes de generar?
```

Espera confirmación del usuario antes de avanzar.

---

## PASO 5 — Escribir el config.json y ejecutar el script

Una vez aprobada la estructura, creá el config.json:

```json
{
  "group": {
    "name": "Nombre del grupo",
    "category": "clases",
    "createNew": true
  },
  "journey": {
    "from": "Estado inicial del alumno en 1-2 oraciones",
    "to": "Estado final del alumno en 1-2 oraciones"
  },
  "existingTopics": [
    "Lista de temas que YA están cubiertos en Leadr y no deben repetirse"
  ],
  "classes": [
    {
      "title": "Título de la clase",
      "prerequisite": "Qué debe saber el alumno para aprovechar esta clase",
      "outcome": "Qué puede hacer el alumno al terminar",
      "instruction": "Instrucción detallada para Claude — ver estándar abajo"
    }
  ]
}
```

### Cómo escribir la "instruction" de cada clase

La instruction es lo más importante. No es un título — es un brief editorial completo. Debe incluir:

```
Clase: "[Título exacto]"

CONTEXTO EN EL ARCO DEL CURSO:
Esta es la clase [N] de [total]. El alumno [ya sabe X / llega sabiendo Y].
El grupo se llama [nombre] y el viaje es de [A] a [B].
Esta clase cierra la brecha entre [qué sabe] y [qué necesita para la siguiente].

PROBLEMA CENTRAL QUE RESUELVE:
[Descripción concreta del dolor del periodista, en primera persona si es posible]
Ejemplo: "Tengo 30 minutos antes de la rueda de prensa y necesito saber todo sobre el ministro."

PUNTOS CLAVE A CUBRIR (en este orden):
1. [Punto 1 — más importante, va primero]
2. [Punto 2]
3. [Punto 3]
4. [...]
(máximo 7 puntos, mínimo 4)

EJEMPLO PERIODÍSTICO OBLIGATORIO:
Usar un caso de [Argentina / Colombia / México / Ecuador / Chile — el que más aplique].
Mencionar nombre de medio real o tipo de situación real.
El ejemplo debe ilustrar el punto más difícil de entender.

RECURSOS ESPECÍFICOS A INCLUIR:
- [Herramienta o recurso 1 con URL exacta]
- [Herramienta o recurso 2 con URL exacta]
(solo incluir si conocés URLs reales — el script validará que funcionen)

EJERCICIO CONCRETO:
[Descripción de lo que el alumno debe hacer. Debe poder completarse en 15-30 minutos con lo que ya tiene.]

TONO:
Periodista que habla con otro periodista. Sin tecnicismos. Sin "gurú digital".
Nunca: "Esta poderosa herramienta revolucionará tu flujo de trabajo."
Siempre: "Con esto podés hacer X en lugar de perder Y tiempo."
```

Guardá el config en: `../Leadr/app/scripts/configs/[nombre-grupo].json`

Luego ejecutá:

```powershell
cd "leadr/app"
$env:ANTHROPIC_API_KEY = "sk-ant-..."  # del .env.local
$env:NEXT_PUBLIC_SUPABASE_URL = "https://ovwlsnnhiuoxoazyrhvt.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "..."  # del panel de Supabase → Settings → API
node scripts/crear-clase.mjs --config scripts/configs/[nombre-grupo].json
```

---

## PASO 6 — Revisar resultados

Después de que el script termine, reportá:

```
✅ GRUPO CREADO: [Nombre] (ID: [N])

Clases generadas como DRAFT:
- [ID] Clase 1 — [Título] → leadr.cloud/admin/clase/[ID]/
- [ID] Clase 2 — [Título] → leadr.cloud/admin/clase/[ID]/
[...]

⚠️  Links con error 404 encontrados:
- Clase [N], recurso "[texto]": URL [x] no funciona → reemplazar antes de publicar

PRÓXIMOS PASOS:
1. Revisar cada clase en el panel admin
2. Generar audio para las clases aprobadas
3. Publicar una vez confirmadas
```

---

## ESTÁNDARES DE CALIDAD — NO NEGOCIABLES

### El ICP siempre en mente

Cada decisión editorial se toma pensando en:
> Periodista latinoamericano/a de 40-55 años. 10-20 años en medios tradicionales. Ecuador, Colombia, México, Argentina o Chile. No es tech-savvy. El miedo a quedar afuera es mayor que el miedo a aprender. $10 ya los apostó. Ahora necesita que esto funcione de verdad.

### Los 5 filtros de calidad

Antes de aprobar cualquier clase, pasala por estos filtros:

1. **¿El título le habla al periodista o a la herramienta?**
   - MAL: "Introducción a Make.com"
   - BIEN: "Automatizá tu publicación sin tocar código"

2. **¿El ejercicio es real o es "practica lo aprendido"?**
   - MAL: "Crea tu propio flujo en Make"
   - BIEN: "Crea un flujo que tome tus tweets de los últimos 7 días y los guarde en Google Sheets automáticamente"

3. **¿Los recursos son los MEJORES disponibles o los más fáciles de poner?**
   - Cada recurso debe justificarse: ¿Por qué este y no otro?

4. **¿El ejemplo periodístico es de LATAM o genérico?**
   - Un medio inventado de "Sudamérica" no cuenta. Tiene que ser real o claramente plausible.

5. **¿Cada slide puede entenderse solo, sin el anterior?**
   - Si un alumno entra directo al slide 7, ¿entiende de qué habla?

### Longitud y profundidad

- Mínimo 11 slides, máximo 14
- El artículo HTML (body): mínimo 900 palabras. 1200 es el objetivo.
- Cada párrafo del body: mínimo 3 oraciones completas
- El ejercicio: suficientemente detallado para que no haya dudas de qué hacer

### Anti-fluff checklist

Eliminar de todas las clases:
- Frases de apertura genéricas: "En el mundo digital de hoy..." / "Como periodistas, sabemos que..."
- Estadísticas sin fuente: "El 73% de los periodistas usa IA"
- Pasos que no aportan: "Abrí tu navegador" como paso propio
- Recursos de relleno: "Busca en Google más información sobre este tema"
- Cierres vacíos: "¡Mucho éxito en tu aprendizaje!"
