// Genera subtítulos sincronizados (líneas con tiempos) desde el audio ya generado,
// usando forced-alignment de ElevenLabs (no regenera audio, no gasta caracteres de TTS).
// Uso: node caps-gen.mjs clase01
import fs from "node:fs";

const [, , claseKey] = process.argv;
const KEY = (fs.readFileSync(".env", "utf8").match(/ELEVENLABS_API_KEY=(.+)/)?.[1] || "").trim();
const scenes = JSON.parse(fs.readFileSync("tts-scripts.json", "utf8"))[claseKey];
const full = scenes.join(" ");
const buf = fs.readFileSync(`public/${claseKey}.mp3`);

const form = new FormData();
form.append("file", new Blob([buf], { type: "audio/mpeg" }), `${claseKey}.mp3`);
form.append("text", full);

const res = await fetch("https://api.elevenlabs.io/v1/forced-alignment", {
  method: "POST",
  headers: { "xi-api-key": KEY },
  body: form,
});
const j = await res.json();
if (!j.words) { console.error("ERR:", JSON.stringify(j).slice(0, 300)); process.exit(1); }

const lines = [];
let line = null;
for (const w of j.words) {
  const txt = (w.text || "").trim();
  if (!txt) continue;
  if (!line) line = { s: w.start, e: w.end, t: "" };
  line.t = line.t ? line.t + " " + txt : txt;
  line.e = w.end;
  const wc = line.t.split(" ").length;
  const endsSent = /[.?!:]$/.test(txt);
  if (wc >= 7 || (endsSent && wc >= 3)) { lines.push(line); line = null; }
}
if (line) lines.push(line);

fs.mkdirSync("src/dur", { recursive: true });
fs.writeFileSync(`src/dur/${claseKey}.caps.json`, JSON.stringify(lines));
console.log(claseKey, "OK ·", lines.length, "líneas de subtítulo");
