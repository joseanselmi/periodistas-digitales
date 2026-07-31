# M4 · El nombre y la marca — estado y cómo terminarlo

> **Estado al 28/07:** M4 está **producido y revisado al 100%**, salvo la **voz final Chris**, que quedó
> bloqueada porque la cuota mensual de ElevenLabs se agotó (quedan ~129 créditos; una clase necesita ~3.200).
> **La cuota resetea alrededor del 19 de cada mes** (Jose se suscribió el 19/07). Cuando resetee —o si Jose
> recarga créditos— la finalización es **casi un solo comando**.

## Qué está hecho
- ✅ ESTRUCTURA-M4.md + 5 guiones (4.1 a 4.5), motivo **rosa #f472b6**.
- ✅ 10 gates pasados (revisor-clase-video + alumno-periodista) y todas las correcciones aplicadas.
- ✅ Heroes rosa en `remotion-curso/src/lib/marca.tsx` (PruebaRecuerdo, Taller, PaletaHero, TipoLogo, HojaMarca).
- ✅ Compositions `ClaseMarca1-5.tsx` + narraciones `f41-f45` (en tts-scripts.json) + registradas en `src/Root.tsx`.
- ✅ Borradores SAPI + duraciones `src/dur/f4X.json` + auditoría visual de stills.
- ⏸️ **Falta SOLO:** voz Chris + subtítulos + render final + subida a YouTube + Hotmart doc + portadas.

## Cómo terminarlo cuando haya cuota (en `remotion-curso/`)
```bash
# 1. Voz Chris de las 5 clases (Voice ID Chris = iP95p4xoKVk53GoZ742B)
for k in f41 f42 f43 f44 f45; do node tts-gen-largo.mjs $k iP95p4xoKVk53GoZ742B; done

# 2. Subtítulos. Con cuota: forced-alignment de ElevenLabs.
#    Si la cuota alcanzó justo para la voz pero no para el alignment, usar el fallback local:
for k in f41 f42 f43 f44 f45; do node caps-gen.mjs $k || node caps-local.mjs $k; done

# 3. Cambiar las 5 compositions de audioDir a narration+caps:
#    en cada src/ClaseMarcaN.tsx:
#      - agregar:  import C from "./dur/f4N.caps.json";
#      - cambiar:  audioDir="f4N"   →   narration="f4N.mp3" caps={C as any}
#    (f41→ClaseMarca1 … f45→ClaseMarca5)

# 4. Render final (UNO a la vez), verificar dur + 0 errores, comprimir a out/M4-comp/
for n in 1 2 3 4 5; do npx remotion render src/index.ts ClaseMarca$n out/M4-final/4.$n.mp4 --concurrency=2 --timeout=120000; done

# 5. Subir a YouTube: crear yt/add-m4.mjs (copiar de yt/add-m5.mjs, playlist
#    "SID · Módulo 4 — El nombre y la marca", 5 entradas 4.1-4.5, files out/M4-comp/4.X.mp4)
node yt/add-m4.mjs && (cd yt && python yt_upload.py && python yt_check.py)
```
Luego: `HOTMART-M4-completo.md` con los 5 embeds + `PORTADAS-MODULO-4.md` (rosa) — mismo molde que M5.

## Orden en Hotmart (importante)
M4 va **DESPUÉS de M5 (nicho)** aunque el número diga lo contrario: el nombre y la marca salen del nicho ya
definido. El puente de cierre de 4.5 apunta a **montar el medio online** (el sitio), que es el módulo siguiente.

## Caso recurrente
La periodista gastronómica de los **bodegones de barrio** + su lectora **Sofía**. En M4 nombra su medio:
genera candidatos, verifica disponibilidad, y aterriza en **«Sobremesa»**, con paleta cálida (vino + dorado +
crema) y una tipografía clásica.
