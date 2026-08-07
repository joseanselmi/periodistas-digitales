// Fallback SIN ElevenLabs: genera subtítulos (mismo formato que caps-gen.mjs)
// distribuyendo las palabras dentro de la ventana de tiempo de CADA escena,
// proporcional al largo de cada palabra. Usa la duración real por escena
// (src/dur/<key>.json, ya seteada por tts-gen-largo) + el texto por escena
// (tts-scripts.json). Se usa cuando la cuota de forced-alignment se agotó.
// Uso: node caps-local.mjs f54
import fs from "node:fs";

const [, , key] = process.argv;
const scenes = JSON.parse(fs.readFileSync("tts-scripts.json", "utf8"))[key];
const durs = JSON.parse(fs.readFileSync(`src/dur/${key}.json`, "utf8"));
if (scenes.length !== durs.length) {
  console.error(`ERR: escenas=${scenes.length} != durs=${durs.length}`); process.exit(1);
}

// 1) tiempos POR PALABRA, escena por escena
const words = [];
let cum = 0;
for (let i = 0; i < scenes.length; i++) {
  const dur = durs[i];
  const ws = scenes[i].split(/\s+/).filter(Boolean);
  const weights = ws.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 1); // +1 mínimo
  const tot = weights.reduce((a, b) => a + b, 0) || 1;
  let t = cum;
  for (let j = 0; j < ws.length; j++) {
    const slice = (weights[j] / tot) * dur;
    words.push({ text: ws[j], start: +t.toFixed(3), end: +(t + slice).toFixed(3) });
    t += slice;
  }
  cum += dur;
}

// 2) misma segmentación por frases que caps-gen.mjs
const lines = [];
let line = null;
const flush = () => { if (line) { lines.push(line); line = null; } };
for (const w of words) {
  const txt = (w.text || "").trim();
  if (!txt) continue;
  if (!line) line = { s: w.start, e: w.end, t: "", w: [] };
  line.t = line.t ? line.t + " " + txt : txt;
  line.w.push({ s: w.start, e: w.end, t: txt });
  line.e = w.end;
  const wc = line.t.split(" ").length;
  const strong = /[.?!:…]$/.test(txt);
  const soft = /[,;]$/.test(txt);
  if (strong) flush();
  else if (soft && wc >= 4) flush();
  else if (wc >= 10) flush();
}
flush();

fs.writeFileSync(`src/dur/${key}.caps.json`, JSON.stringify(lines));
console.log(key, "OK (local) ·", lines.length, "líneas de subtítulo");
