// Extrae 1 fotograma del MEDIO de cada escena para auditar el diseño.
// Uso: node stills-gen.mjs f12 out/f12-draft.mp4
import fs from "fs";
import { execSync } from "child_process";

const key = process.argv[2] || "f12";
const mp4 = process.argv[3] || `out/${key}-draft.mp4`;
const durs = JSON.parse(fs.readFileSync(`src/dur/${key}.json`, "utf8"));
const outDir = `out/stills-${key}`;
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let t = 0;
durs.forEach((d, i) => {
  const mid = t + d / 2;
  const n = String(i + 1).padStart(2, "0");
  execSync(
    `ffmpeg -v error -ss ${mid.toFixed(2)} -i "${mp4}" -frames:v 1 -vf scale=960:-1 -y "${outDir}/s${n}.png"`
  );
  t += d;
});
console.log(`${durs.length} fotogramas en ${outDir} · video ${(t / 60).toFixed(1)} min`);
