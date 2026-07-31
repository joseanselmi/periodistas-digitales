// Genera 1 audio por clase con ElevenLabs (with-timestamps) y calcula la duración
// de cada escena para sincronizar la animación.
// Uso: node tts-gen.mjs <claseKey> <voiceId>
import fs from "node:fs";

const [, , claseKey, voiceId] = process.argv;
if (!claseKey || !voiceId) { console.error("uso: node tts-gen.mjs clase01 <voiceId>"); process.exit(1); }

const KEY = (fs.readFileSync(".env", "utf8").match(/ELEVENLABS_API_KEY=(.+)/)?.[1] || "").trim();
const scenes = JSON.parse(fs.readFileSync("tts-scripts.json", "utf8"))[claseKey];
if (!scenes) { console.error("no hay guion para", claseKey); process.exit(1); }

const full = scenes.join(" ");
const offsets = [];
let acc = 0;
for (let i = 0; i < scenes.length; i++) { offsets.push(acc); acc += scenes[i].length + 1; }

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
  method: "POST",
  headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ text: full, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true } }),
});
const j = await res.json();
if (!j.audio_base64) { console.error("ERR:", JSON.stringify(j).slice(0, 300)); process.exit(1); }

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync(`public/${claseKey}.mp3`, Buffer.from(j.audio_base64, "base64"));

const starts = j.alignment.character_start_times_seconds;
const ends = j.alignment.character_end_times_seconds;
const total = ends[ends.length - 1];
const secs = scenes.map((_, i) => {
  const start = starts[offsets[i]] ?? (i === 0 ? 0 : total);
  const next = i < scenes.length - 1 ? (starts[offsets[i + 1]] ?? total) : total;
  return +(next - start).toFixed(4);
});

fs.mkdirSync("src/dur", { recursive: true });
fs.writeFileSync(`src/dur/${claseKey}.json`, JSON.stringify(secs));
console.log(claseKey, "OK · total", total.toFixed(2) + "s ·", scenes.length, "escenas");
console.log("secs:", JSON.stringify(secs));
