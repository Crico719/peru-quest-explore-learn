/**
 * Validador del banco de preguntas de src/data/departments.ts.
 * Uso: node scripts/validate-quiz.mjs
 *
 * Comprueba por departamento:
 *  - número mínimo de preguntas (MIN, por defecto 10)
 *  - exactamente 4 opciones por pregunta
 *  - índice de respuesta dentro de rango
 *  - 4 opciones únicas dentro de cada pregunta
 *  - sin preguntas duplicadas dentro del departamento
 * Imprime un resumen y sale con error si algo falla.
 */
import { readFileSync } from "node:fs";

const MIN = Number(process.argv[2] ?? 10);
const text = readFileSync("src/data/departments.ts", "utf8");
const section = text.slice(text.indexOf("export const DEPARTMENTS"));
const ids = [...section.matchAll(/id: "([a-z]+)", name:/g)].map((m) => m[1]);

let errors = 0;
const counts = [];
for (const id of ids) {
  const start = section.indexOf(`id: "${id}"`);
  let end = section.length;
  for (const other of ids) {
    if (other === id) continue;
    const i = section.indexOf(`id: "${other}"`);
    if (i > start && i < end) end = i;
  }
  const block = section.slice(start, end);
  const qm = /quiz: \[(.*?)\],\s*\r?\n\s*steps:/s.exec(block);
  if (!qm) {
    console.error(`✗ ${id}: no se encontró el quiz`);
    errors++;
    continue;
  }
  const questions = [...qm[1].matchAll(/\{ q: "((?:[^"\\]|\\.)*)", o: \[(.*?)\], a: (\d+) \}/g)];
  counts.push([id, questions.length]);
  const seen = new Set();
  for (const q of questions) {
    const opts = [...q[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
    const a = Number(q[3]);
    const tag = `${id}: "${q[1].slice(0, 40)}…"`;
    if (opts.length !== 4) { console.error(`✗ ${tag}: ${opts.length} opciones (esperadas 4)`); errors++; }
    if (a < 0 || a >= opts.length) { console.error(`✗ ${tag}: índice de respuesta ${a} fuera de rango`); errors++; }
    if (new Set(opts).size !== opts.length) { console.error(`✗ ${tag}: opciones duplicadas`); errors++; }
    if (seen.has(q[1])) { console.error(`✗ ${tag}: pregunta duplicada en el departamento`); errors++; }
    seen.add(q[1]);
  }
  if (questions.length < MIN) {
    console.error(`✗ ${id}: ${questions.length} preguntas (mínimo ${MIN})`);
    errors++;
  }
}

console.log("\nDepartamento: preguntas");
for (const [id, n] of counts) console.log(`${id}: ${n}`);
console.log(`\nTotal departamentos: ${counts.length} | Errores: ${errors}`);
process.exit(errors === 0 ? 0 : 1);
