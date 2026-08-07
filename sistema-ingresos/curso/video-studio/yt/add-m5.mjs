// Agrega la playlist y las 6 clases de M5 al manifest de YouTube.
// Idempotente: no duplica si ya existen. Apunta a los comprimidos out/M5-comp/.
import fs from "node:fs";
const P = "yt/manifest.json";
const m = JSON.parse(fs.readFileSync(P, "utf8"));

const PLAYLIST = "SID · Módulo 5 — Tu nicho y tu lector";
m.playlists[PLAYLIST] = "Módulo 5 del curso «Sistema de Ingresos Diarios para Periodistas».";

const base = "C:/Users/Jose Anselmi/remotion-curso/out/M5-comp";
const clases = [
  { n: "5.1", t: "La teoría del nicho: por qué enfocarte gana",
    d: "Enfocarte no achica tu público: te vuelve imprescindible para un grupo, y eso es lo que crece. Hablarle a todos es la forma más rápida de que no te encuentre nadie; elegir a alguien concreto hace fácil todo lo que sigue." },
  { n: "5.2", t: "Los 3 filtros de un nicho rentable",
    d: "Un buen nicho vive donde se cruzan tres cosas: lo que te apasiona, lo que la gente busca y lo que alguien está dispuesto a pagar. Cuando faltan una o dos, se nota; el punto donde se cruzan las tres es el que vale." },
  { n: "5.3", t: "Investigar y validar tu nicho con IA",
    d: "Un nicho no se adivina: se valida. Hay señales concretas de demanda real —la gente busca, pregunta, se junta, consume— y la IA ayuda a rastrearlas en una tarde. La IA orienta dónde mirar; la demanda la comprobás vos." },
  { n: "5.4", t: "Tu ángulo único dentro del nicho",
    d: "En un nicho donde ya hay gente, no ganás siendo uno más: ganás con tu ángulo, la vuelta que solo vos le das al mismo tema. El mismo tema tiene muchas puertas de entrada; esta clase te ayuda a encontrar la tuya." },
  { n: "5.5", t: "Tu lector ideal: construí el avatar",
    d: "Un medio no le habla a «todos»: le habla a alguien concreto. Construí el avatar de tu lector —quién es, qué le duele, qué desea, cómo habla— y escribí para esa persona. Cuando le hablás a alguien real, el resto se engancha." },
  { n: "5.6", t: "Tu propuesta editorial y tu línea",
    d: "Cierra el módulo: tu promesa editorial en una línea y los temas que sí y que no vas a tocar. Con el nicho, el ángulo y el lector claros, tu medio ya tiene forma. Lo que sigue es ponerle nombre y marca." },
];

for (const c of clases) {
  const file = `${base}/${c.n}.mp4`;
  if (m.videos.some((v) => v.file === file)) continue;
  m.videos.push({
    file,
    title: `SID · M5 · ${c.n} — ${c.t}`,
    desc: `Clase ${c.n} — Curso «Sistema de Ingresos Diarios para Periodistas». Módulo 5 · Tu nicho y tu lector. ${c.d}`,
    playlist: PLAYLIST,
    done: false,
  });
}

fs.writeFileSync(P, JSON.stringify(m, null, 1));
console.log("Manifest actualizado. Videos totales:", m.videos.length, "· M5 pendientes:", m.videos.filter((v) => v.playlist === PLAYLIST && !v.done).length);
