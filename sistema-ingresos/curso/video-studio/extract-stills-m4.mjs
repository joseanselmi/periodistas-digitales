// Extrae 1 still por escena (punto medio) de las 5 clases M4, para auditoría visual.
import { execSync } from "node:child_process";
import fs from "node:fs";

const clases = [
  { comp: "ClaseMarca1", key: "f41", dir: "m1" },
  { comp: "ClaseMarca2", key: "f42", dir: "m2" },
  { comp: "ClaseMarca3", key: "f43", dir: "m3" },
  { comp: "ClaseMarca4", key: "f44", dir: "m4" },
  { comp: "ClaseMarca5", key: "f45", dir: "m5" },
];
const fps = 30;

for (const c of clases) {
  const D = JSON.parse(fs.readFileSync(`./src/dur/${c.key}.json`, "utf8"));
  const outdir = `out/auditM4/${c.dir}`;
  fs.mkdirSync(outdir, { recursive: true });
  let acc = 0;
  const mids = D.map((sec) => { const f = acc + Math.round((sec * fps) / 2); acc += Math.round(sec * fps); return f; });
  console.log(`=== ${c.comp} (${D.length} escenas) ===`);
  for (let i = 0; i < mids.length; i++) {
    const out = `${outdir}/s${String(i + 1).padStart(2, "0")}.png`;
    execSync(`npx remotion still src/index.ts ${c.comp} ${out} --frame=${mids[i]}`, { stdio: "ignore" });
  }
  console.log(`  ${c.comp} OK · ${mids.length} stills`);
}
console.log("LISTO stills M4");
