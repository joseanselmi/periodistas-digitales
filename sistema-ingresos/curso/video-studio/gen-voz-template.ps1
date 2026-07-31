# Voz TEMPORAL (Windows SAPI) para maquetar el timing de una clase.
# Reemplazar por ElevenLabs (voz diseñada) en la versión final.
# Genera public/<CLASE>/sN.wav, uno por escena, y no cambia la duración final:
# medir cada wav con ffprobe y usar ese valor como `sec` en la escena.
Add-Type -AssemblyName System.Speech
$CLASE = "clase1"                                   # <-- carpeta destino en public/
$dir = Join-Path (Get-Location) "public\$CLASE"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# Un elemento por escena (texto SIN tildes para el motor SAPI):
$seg = @(
  "Texto de la escena uno.",
  "Texto de la escena dos."
)

for ($i = 0; $i -lt $seg.Count; $i++) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  # Voz en espaniol si esta instalada (ej. Sabina es-MX); si no, la default:
  try { $s.SelectVoice("Microsoft Sabina Desktop") } catch {}
  $s.Rate = -1
  $out = Join-Path $dir ("s" + ($i + 1) + ".wav")
  $s.SetOutputToWaveFile($out)
  $s.Speak($seg[$i])
  $s.Dispose()
  $d = & ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $out
  Write-Output ("s{0}.wav = {1} seg" -f ($i + 1), $d)
}
