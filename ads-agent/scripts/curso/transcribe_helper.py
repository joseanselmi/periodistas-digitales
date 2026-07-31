import sys
from faster_whisper import WhisperModel

audio_file = sys.argv[1]
output_file = sys.argv[2]

# tiny: 10x más rápido que small, suficiente para español claro
# int8: reduce memoria y acelera en CPU
# cpu_threads=16: usa todos los núcleos
model = WhisperModel("tiny", device="cpu", compute_type="int8", cpu_threads=16)
segments, info = model.transcribe(
    audio_file,
    language="es",
    beam_size=1,       # más rápido que beam_size=5
    vad_filter=True,   # salta silencios
    vad_parameters={"min_silence_duration_ms": 500}
)

text = " ".join(s.text.strip() for s in segments)
with open(output_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"OK: {len(text)} chars")
