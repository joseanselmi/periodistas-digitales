// Lee los wav de public/<dir> y escribe src/dur/<key>.json con la duración (seg) de cada escena.
// Uso: node dur-gen.mjs f12 [pad]
import fs from "fs";
import { execSync } from "child_process";

const key = process.argv[2] || "f12";
const pad = Number(process.argv[3] ?? 0.55); // aire al final de cada escena
const dir = `public/${key}`;
const n = fs.readdirSync(dir).filter((f) => f.endsWith(".wav")).length;

const durs = [];
for (let i = 1; i <= n; i++) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${dir}/s${i}.wav"`,
    { encoding: "utf8" }
  ).trim();
  durs.push(Number((Number(out) + pad).toFixed(3)));
}

fs.writeFileSync(`src/dur/${key}.json`, JSON.stringify(durs));
const tot = durs.reduce((a, b) => a + b, 0);
console.log(`${key}: ${n} escenas · ${(tot / 60).toFixed(1)} min con Sabina`);
