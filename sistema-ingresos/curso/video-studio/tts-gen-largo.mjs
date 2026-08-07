// Igual que tts-gen.mjs pero para clases LARGAS: la API corta en 10.000 caracteres,
// así que parte el guion en tramos, genera cada uno y los une en un solo mp3.
// Las duraciones por escena se calculan con el offset acumulado de cada tramo.
// Uso: node tts-gen-largo.mjs <claseKey> <voiceId>
import fs from "node:fs";
import { execSync } from "node:child_process";

const [, , claseKey, voiceId] = process.argv;
if (!claseKey || !voiceId) { console.error("uso: node tts-gen-largo.mjs f12 <voiceId>"); process.exit(1); }

const LIMITE = 9000; // margen bajo los 10.000 de la API
const KEY = (fs.readFileSync(".env", "utf8").match(/ELEVENLABS_API_KEY=(.+)/)?.[1] || "").trim();
const scenes = JSON.parse(fs.readFileSync("tts-scripts.json", "utf8"))[claseKey];
if (!scenes) { console.error("no hay guion para", claseKey); process.exit(1); }

// 1) partir en tramos que no superen el límite, sin cortar escenas por la mitad
const tramos = [];
let actual = [];
let largo = 0;
for (const s of scenes) {
  if (largo + s.length + 1 > LIMITE && actual.length) { tramos.push(actual); actual = []; largo = 0; }
  actual.push(s); largo += s.length + 1;
}
if (actual.length) tramos.push(actual);
console.log(`${scenes.length} escenas → ${tramos.length} tramos (${tramos.map((t) => t.length).join(" + ")})`);

fs.mkdirSync("public", { recursive: true });
fs.mkdirSync("out/tts", { recursive: true });

const secs = [];
let offsetTiempo = 0;
const parciales = [];

for (let ti = 0; ti < tramos.length; ti++) {
  const tramo = tramos[ti];
  const full = tramo.join(" ");
  const offsets = [];
  let acc = 0;
  for (const s of tramo) { offsets.push(acc); acc += s.length + 1; }

  process.stdout.write(`  tramo ${ti + 1}/${tramos.length} (${full.length} car)… `);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: full,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
    }),
  });
  const j = await res.json();
  if (!j.audio_base64) { console.error("\nERR:", JSON.stringify(j).slice(0, 300)); process.exit(1); }

  const parcial = `out/tts/${claseKey}-${ti}.mp3`;
  fs.writeFileSync(parcial, Buffer.from(j.audio_base64, "base64"));
  parciales.push(parcial);

  const starts = j.alignment.character_start_times_seconds;
  const ends = j.alignment.character_end_times_seconds;
  const total = ends[ends.length - 1];
  for (let i = 0; i < tramo.length; i++) {
    const start = starts[offsets[i]] ?? (i === 0 ? 0 : total);
    const next = i < tramo.length - 1 ? (starts[offsets[i + 1]] ?? total) : total;
    secs.push(+(next - start).toFixed(4));
  }
  offsetTiempo += total;
  console.log(`ok (${total.toFixed(1)}s)`);
}

// 2) unir los tramos en un solo mp3
const lista = "out/tts/lista.txt";
fs.writeFileSync(lista, parciales.map((p) => `file '${p.split("/").pop()}'`).join("\n"));
execSync(`ffmpeg -v error -f concat -safe 0 -i "${lista}" -c copy -y "public/${claseKey}.mp3"`, { cwd: "." });

fs.mkdirSync("src/dur", { recursive: true });
fs.writeFileSync(`src/dur/${claseKey}.json`, JSON.stringify(secs));
const tot = secs.reduce((a, b) => a + b, 0);
console.log(`${claseKey} OK · ${scenes.length} escenas · ${(tot / 60).toFixed(1)} min · public/${claseKey}.mp3`);
