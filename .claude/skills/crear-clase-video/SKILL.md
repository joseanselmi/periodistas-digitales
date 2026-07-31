---
name: crear-clase-video
description: Crear una clase del curso "Sistema de Ingresos Diarios para Periodistas" como VIDEO animado (motion graphics premium con voz), con la misma calidad e identidad de siempre. Usar cuando se quiera producir, rehacer o continuar una clase/módulo en video del curso. Cubre TODO el proceso — guion, voz (ElevenLabs), animación (Remotion + kit), sonido, render y verificación con agente. Persistente: si se cierra el chat, esta skill permite reproducir la misma calidad.
---

# Crear una clase en video (curso Periodistas Digitales)

Proceso maestro para producir clases en video con **la misma calidad, identidad y tono**
de siempre. Todo lo aprendido está acá y en los docs enlazados.

## 0. Contexto y decisiones ya tomadas (leer SIEMPRE)
- **Modelo del curso:** máquina de tráfico (armás un medio de nicho, traés tráfico, lo
  monetizás por varios caminos). Diferenciales: **IA-nativo**, **anunciantes**, **fórmulas con certeza**.
  → [PLAN-CURRICULUM-DEFINITIVO.md](../../../sistema-ingresos/curso/docs/PLAN-CURRICULUM-DEFINITIVO.md)
- **Alumno:** periodista con experiencia. **Tono:** estilo **Luis Mena "mezcla"**
  (cercano, analogías, "mirá", cierre con tarea+puente), sobrio, en **vos**.
  → [ESTILO-LUIS-MENA.md](../../../sistema-ingresos/curso/docs/ESTILO-LUIS-MENA.md)
- **Reglas de copy (OBLIGATORIAS):**
  1. **Solo en positivo** — nunca encarar/recalcar lo negativo, ni para negarlo.
  2. **Dato = nuestro** — todo dato/porcentaje se dice como propio ("por lo que vemos en
     nuestros alumnos…"), NUNCA citar fuentes externas.
  3. **Coherencia y NO repetición** — cada clase tiene propósito único, respeta la
     cronología, referencia a las otras ("en la clase anterior…", "en la próxima…") pero
     no repite contenido. Los puentes de cierre apuntan a la clase que REALMENTE sigue.
- **Estilo visual:** marca oscura (#07070f) + glow indigo #6366f1 / cyan #22d3ee,
  glassmorphism, tipografía system. **Solo gráficos + voz** (sin cara). Cada clase combina
  3-5 recursos DISTINTOS y es MÁS innovadora que la anterior (no repetir layouts entre
  clases seguidas). Motivos por módulo: IA cyan · Monetización dorado · Contenido violeta.
  → [CATALOGO-ANIMACIONES.md](../../../sistema-ingresos/curso/docs/CATALOGO-ANIMACIONES.md) (~120 recursos + reglas)
- **Firma de cierre:** cada clase termina con `ProgressMap` (línea de tiempo del recorrido,
  "ACÁ ESTÁS" + "PRÓXIMA"). Avanza por módulo.

## 1. El estudio
- **Proyecto vivo:** `C:\Users\Jose Anselmi\remotion-curso\` (fuera de OneDrive; tiene node_modules).
- **Fuente versionada (respaldo en repo):** `sistema-ingresos/video-studio/` (kit, generadores, ejemplos).
- **Kit reutilizable:** `src/lib/kit.tsx` — layouts + animaciones + SFX + motor `ClaseVideo`.
  Layouts: `Statement, Chips, Cards3, Equals, TwoUp, TaskCard, Stat` (count-up), `Quote,
  Timeline, Checklist, Split` (mockup), `JourneyMap` (mapa con cámara), `Terminal` (escribe
  prompt), `ProgressMap` (cierre firma).
- **Assets:** `public/bg.png` (fondo horneado) + `public/sfx/*.wav` (whoosh, tick, ding, pop,
  rise). Regenerar con `bash build-assets.sh .` si faltan.

## 2. Pipeline por clase (paso a paso)
1. **Guion por escenas** — 1 idea por escena, tono Luis, vos, positivo, coherente con las
   otras clases. Guardar en `sistema-ingresos/curso/modulo_X/clase_Y.md`.
2. **Voz (ElevenLabs)** — **1 audio por clase** (no por escena). Agregar el array de textos
   de escenas en `tts-scripts.json` bajo la key `claseXX`, y correr:
   `node tts-gen.mjs claseXX <voiceId>` → genera `public/claseXX.mp3` + `src/dur/claseXX.json`
   (duración por escena vía timestamps). Voz: ver §4.
2b. **Subtítulos** — `node caps-gen.mjs claseXX` usa **forced-alignment** del mp3 ya
   generado (NO regenera audio, NO gasta caracteres) → `src/dur/claseXX.caps.json` (líneas
   con tiempos). El componente `Caption` los muestra sincronizados; pasar `caps={CAPS}` a
   `ClaseVideo`. Todos los videos llevan subtítulos.
3. **Composición** — crear/editar `src/ClaseXxx.tsx`: array `SceneDef[]` (cada escena elige
   un layout del kit + su texto), mapear `sec` desde el JSON de duraciones
   (`SCENES.map((s,i)=>({...s, sec: (D as number[])[i]}))`) y renderizar
   `<ClaseVideo scenes={SCENES_D} narration="claseXX.mp3" />`. Registrar en `src/Root.tsx`.
4. **Validar** — antes del render largo: `npx remotion still src/index.ts ClaseXxx out/x.png --frame=N`
   de 2-3 escenas nuevas (revisar layout/overflow).
5. **Verificar (agente)** — correr el agente **revisor-clase-video** (ver §3).
6. **Render** — `npx remotion render src/index.ts ClaseXxx out/x.mp4 --codec h264 --crf 16`.
   Copiar el mp4 al Escritorio y abrirlo para que Jose lo vea.

## 3. Verificación con agente (corrobora la calidad)
Antes de dar una clase por buena, lanzar el subagente **revisor-clase-video** (definido en
`.claude/agents/revisor-clase-video.md`). Chequea: tono Luis/vos, solo-positivo, dato=nuestro,
coherencia + no-repetición vs. clases anteriores, puentes de cierre correctos, y estilo de
marca. Devuelve APROBADO o lista de correcciones. No publicar hasta que apruebe.

## 4. Voz (ElevenLabs)
- **API key:** en `remotion-curso\.env` → `ELEVENLABS_API_KEY=...` (fuera de repos; nunca en el chat).
- **Modelo:** `eleven_multilingual_v2`. Settings: stability 0.4 · similarity 0.8 · style 0.3 · speaker_boost on.
- **Voz PROVISORIA:** "Chris" (premade) `iP95p4xoKVk53GoZ742B` — la que menos suena a IA en el plan free.
- **Voz FINAL (objetivo):** hombre argentino ~50, grave, con autoridad. Requiere **plan
  Creator (~$22/mes)** → ahí se puede usar "Abel Lz" (`452WrNT9o8dphaYW5YGU`, latinoamericana)
  o **diseñar** la voz (Voice Design) + licencia comercial. Free NO permite voces de
  biblioteca ni diseño por API.
- Textos finales listos para generar: [GUION-ELEVENLABS.md](../../../sistema-ingresos/curso/modulo_0_bienvenida/GUION-ELEVENLABS.md).

## 5. Estado actual
Módulo 0: 0.1 Bienvenida ✅ · 0.2 De periodista a emprendedor ✅ · 0.3 Cómo aprovechar el
curso ✅ (las 3 con voz Chris provisoria). Falta 0.4 (tutorial, con grabación de pantalla).
Próximo: Módulo 1 (Fundamentos). Hosting: mitad Hotmart, mitad YouTube no listado embebido.

## Checklist final por clase
- [ ] Guion tono Luis/vos/positivo, dato=nuestro, coherente y sin repetir.
- [ ] 1 audio ElevenLabs + duraciones por escena.
- [ ] 3-5 layouts distintos, más innovador que la anterior, cierre con ProgressMap.
- [ ] Stills validados · Agente revisor APROBADO · Render + abierto para Jose.
