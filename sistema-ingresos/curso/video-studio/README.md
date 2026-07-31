# video-studio — estudio de video del curso (respaldo versionado)

Copia **versionada** del código del estudio de video (Remotion) que produce las clases del
curso. El proyecto **vivo** (con node_modules) está en `C:\Users\Jose Anselmi\remotion-curso\`.
Este `video-studio/` es el respaldo en el repo para que **nunca se pierda** cómo se hace.

**Proceso completo y reglas:** ver la skill
[`.claude/skills/crear-clase-video/SKILL.md`](../../../.claude/skills/crear-clase-video/SKILL.md).
**Verificación de calidad:** agente `.claude/agents/revisor-clase-video.md`.

## Qué hay acá
- `src/lib/kit.tsx` — biblioteca: layouts + animaciones + SFX + motor `ClaseVideo`.
- `src/*.tsx` — las clases (ejemplos reales) + `Root.tsx` + `DemoDinamismo.tsx`.
- `src/dur/*.json` — duración por escena (la calcula el generador de voz).
- `tts-gen.mjs` + `tts-scripts.json` — pipeline de voz ElevenLabs (1 audio por clase + timestamps).
- `build-assets.sh` + `bg.html` — generan `public/bg.png` y `public/sfx/*.wav`.
- `gen-voz-template.ps1` — voz temporal (Windows) para maquetar.

## Cómo reconstruir el proyecto vivo desde cero
```bash
# en un proyecto Remotion nuevo (npx create-video@latest, react 18)
cp -r video-studio/src ./ ; cp video-studio/{package.json,tsconfig.json,tts-*.* ,build-assets.sh,bg.html} ./
bash build-assets.sh .                      # genera public/bg.png + public/sfx
# poner ELEVENLABS_API_KEY en .env, luego por cada clase:
node tts-gen.mjs clase01 <voiceId>          # genera public/clase01.mp3 + src/dur/clase01.json
npx remotion render src/index.ts ClaseBienvenida out/x.mp4 --crf 16
```

> node_modules, out y public/ están gitignorados (se regeneran).
