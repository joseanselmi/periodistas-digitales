#!/bin/bash
# Genera los assets de marca en public/: bg.png (fondo horneado 2x) + sfx/*.wav
# Uso:  bash build-assets.sh /ruta/al/proyecto   (default: directorio actual)
set -e
PROJ="${1:-.}"
DIR="$(cd "$(dirname "$0")" && pwd)"   # carpeta de este script (assets del skill)
mkdir -p "$PROJ/public/sfx"

# --- FONDO: rasterizar bg.html a 2x (3840x2160) para nitidez y anti-titileo ---
CHROME="$(command -v chrome || command -v google-chrome || echo '/c/Program Files/Google/Chrome/Application/chrome.exe')"
BGHTML="$(cygpath -w "$DIR/bg.html" 2>/dev/null || echo "$DIR/bg.html")"
BGOUT="$(cygpath -w "$PROJ/public/bg.png" 2>/dev/null || echo "$PROJ/public/bg.png")"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1920,1080 --virtual-time-budget=200 --run-all-compositor-stages-before-draw \
  --screenshot="$BGOUT" "file:///$BGHTML" 2>/dev/null || \
  echo "AVISO: no se pudo rasterizar bg.png (Chrome). Genera public/bg.png a mano desde bg.html."

# --- SONIDOS (ffmpeg) ---
S="$PROJ/public/sfx"
ffmpeg -y -f lavfi -i "sine=frequency=523:duration=0.13" -af "afade=t=in:d=0.005,afade=t=out:st=0.03:d=0.1,volume=0.5" "$S/pop.wav" -loglevel error
ffmpeg -y -f lavfi -i "sine=frequency=1100:duration=0.06" -af "afade=t=out:st=0.01:d=0.05,volume=0.45" "$S/tick.wav" -loglevel error
ffmpeg -y -f lavfi -i "sine=frequency=987:duration=0.55" -af "afade=t=out:st=0.05:d=0.5,volume=0.42" "$S/ding.wav" -loglevel error
ffmpeg -y -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.6" -af "highpass=f=250,lowpass=f=2600,afade=t=in:d=0.18,afade=t=out:st=0.22:d=0.23,volume=0.5" "$S/whoosh.wav" -loglevel error
ffmpeg -y -f lavfi -i "aevalsrc=exprs=0.3*sin(2*PI*t*(280+360*t)):s=44100:d=1.1" -af "afade=t=in:d=0.05,afade=t=out:st=0.9:d=0.2,volume=0.4" "$S/rise.wav" -loglevel error

echo "OK -> $PROJ/public/bg.png + $PROJ/public/sfx/{pop,tick,ding,whoosh,rise}.wav"
