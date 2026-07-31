# Módulo 2 · Tu equipo de IA 🤖 — plan y estructura

> **Motivo visual del módulo: cyan (#22d3ee).** TEORÍA (Claude). Es el diferencial del curso:
> el periodista no compite con la IA, la **dirige**. Tono: vos + español neutro · solo positivo ·
> vocación primero · dato = nuestro (números ilustrativos).
>
> **Roadmap — qué tiene el alumno acá:** viene de M0 (bienvenida) y M1 (la teoría del negocio:
> activo, audiencia propia, nicho, máquina de tráfico, caminos de ingreso). **Todavía NO tiene**
> nicho definido (eso es M5), ni marca (M4), ni el periódico montado (M6). Así que los ejemplos
> de IA son **de trabajo periodístico en general**, sin asumir un nicho concreto. Herramientas que
> se nombran: **Claude, ChatGPT, Gemini** (IA de consumo, gratuitas para empezar). **Nunca** se mezcla
> el stack de Jose (Brevo, GA4, Make, Meta Ads, Hotmart, etc.) — eso no es contenido del curso.
>
> **Regla de oro del módulo:** el alumno sale sabiendo *dirigir* la IA como dirige a un redactor,
> no "apretar un botón mágico". El criterio periodístico sigue siendo suyo; la IA son las manos.

---

## Las 5 clases de teoría (+ 1 tutorial de Jose)

Cada clase con **estructura distinta** (no se repite el esqueleto) y **hero visual propio**:

| # | Clase | Estructura | Hero visual | Idea central |
|---|---|---|---|---|
| **2.1** | Qué es la IA y cómo "piensa" | **Desmitificación** (derribo del mito → cómo es de verdad) | La máquina que predice la palabra que sigue (texto que se autocompleta con probabilidades) | La IA no piensa: **predice** la continuación más probable de lo que le diste. Por eso lo que le das decide lo que te devuelve. |
| **2.2** | La anatomía de un buen prompt | **Disección** (un prompt pobre → lo abrimos → lo reconstruimos pieza por pieza) | El prompt desarmado en 4 piezas que se ensamblan: **rol + contexto + tarea + formato** | Un buen prompt no es "pedir bien": es dar las 4 piezas que la IA necesita para predecir lo que vos querés. |
| **2.3** | Hablarle a la IA como a tu redactor | **Caso / diálogo** (una conversación real que mejora por iteración) | El chat que va y viene, refinando en cada vuelta | No es un buscador de una sola respuesta: es un colaborador. El valor está en la **segunda, tercera y cuarta** instrucción. |
| **2.4** | Los roles de IA de tu redacción | **Recorrido / galería** (un paseo por los escritorios) | La redacción con puestos: el que resume, el que titula, el que verifica, el que adapta a formatos, el corrector | No es "una IA que hace todo": son **varios roles** que vos asignás y dirigís, cada uno con su encargo. |
| **2.5** | Construí tu biblioteca de prompts | **Construcción / sistema** (armás algo que queda y se reusa) | La estantería de fichas de prompt que crece y se ordena | Dejá de reescribir desde cero: guardá tus mejores prompts como **plantillas** y tu equipo de IA se vuelve tuyo. |
| 🎥 2.6 | Crear cuentas + tu primer prompt | Tutorial de pantalla | — (lo graba Jose) | El paso a paso: abrir Claude/ChatGPT/Gemini y correr el primer prompt real. |

**No repite M1:** M1 usó editorial-directo, conceptual, boca, caso-primero, dos-caminos, cronología, auditoría.
M2 abre esqueletos nuevos: desmitificación, disección, diálogo iterativo, recorrido de galería, construcción.

**Puentes:** 2.1 abre el "cómo piensa" → 2.2 usa eso para el prompt → 2.3 lo lleva a la conversación →
2.4 reparte en roles → 2.5 lo sistematiza en biblioteca → 2.6 (Jose) lo pone en práctica en pantalla.

## Producción
Guion por clase → 2 gates (revisor-clase-video + alumno-periodista) → Jose aprueba → borrador SAPI →
auditoría visual → voz Chris + subtítulos → auditoría → mostrar a Jose → oficializar (borra borrador).
Componentes hero nuevos en `remotion-curso/src/lib/` (uno por clase, motivo cyan).
