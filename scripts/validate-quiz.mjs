/**
 * Validador del banco de preguntas de src/data/departments.ts.
 * Uso: node scripts/validate-quiz.mjs [mínimo]
 *
 * Comprueba por departamento:
 *  - número mínimo de preguntas (por defecto 10)
 *  - exactamente 4 opciones por pregunta
 *  - índice de respuesta dentro de rango
 *  - 4 opciones únicas dentro de cada pregunta
 *  - sin preguntas duplicadas dentro del departamento
 *  - trazabilidad: la respuesta correcta debe poder rastrearse a los datos
 *    del propio departamento (capital, lugares, platos, fiestas, personaje,
 *    región, historia o facts). Los casos sin rastro se listan como avisos
 *    para revisión manual, no como errores.
 * Imprime un resumen y sale con error si algo falla.
 */
import { readFileSync } from "node:fs";

const MIN = Number(process.argv[2] ?? 10);
const text = readFileSync("src/data/departments.ts", "utf8");
const section = text.slice(text.indexOf("export const DEPARTMENTS"));
const ids = [...section.matchAll(/id: "([a-z]+)", name:/g)].map((m) => m[1]);

const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const normAlpha = (s) => norm(s).replace(/[^a-z0-9]/g, "");

const tokens = (s) =>
  new Set(
    norm(s)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4)
  );

function blockOf(id) {
  const start = section.indexOf(`id: "${id}"`);
  let end = section.length;
  for (const other of ids) {
    if (other === id) continue;
    const i = section.indexOf(`id: "${other}"`);
    if (i > start && i < end) end = i;
  }
  return section.slice(start, end);
}

const listOf = (s) => [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

let errors = 0;
let warnings = 0;
const counts = [];
for (const id of ids) {
  const block = blockOf(id);
  const qm = /quiz: \[(.*?)\],\s*\r?\n\s*steps:/s.exec(block);
  if (!qm) {
    console.error(`✗ ${id}: no se encontró el quiz`);
    errors++;
    continue;
  }
  const questions = [...qm[1].matchAll(/\{ q: "((?:[^"\\]|\\.)*)", o: \[(.*?)\], a: (\d+) \}/g)];

  // corpus de trazabilidad del departamento
  const fields = [
    block.match(/capital: "((?:[^"\\]|\\.)*)"/)?.[1] ?? "",
    block.match(/region: "([^"]+)"/)?.[1] ?? "",
    ...listOf(block.match(/places: \[(.*?)\]/)?.[1] ?? ""),
    ...listOf(block.match(/food: \[(.*?)\]/)?.[1] ?? ""),
    ...listOf(block.match(/fiestas: \[(.*?)\]/)?.[1] ?? ""),
    block.match(/person: \{ name: "((?:[^"\\]|\\.)*)"/)?.[1] ?? "",
    block.match(/history: "((?:[^"\\]|\\.)*)"/)?.[1] ?? "",
    ...[...block.matchAll(/\{ t: "((?:[^"\\]|\\.)*)", d: "((?:[^"\\]|\\.)*)" \}/g)]
      .flatMap((m) => [m[1], m[2]]),
  ].filter(Boolean);
  const corpusAlpha = fields.map(normAlpha);
  const corpusTokens = new Set(fields.flatMap((f) => [...tokens(f)]));

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

    // trazabilidad de la respuesta correcta
    const correct = opts[a];
    const ca = normAlpha(correct);
    const ct = tokens(correct);
    const traceable =
      corpusAlpha.some((f) => f.length > 2 && (f.includes(ca) || ca.includes(f))) ||
      [...ct].filter((t) => corpusTokens.has(t)).length >= 2 ||
      [...ct].some((t) => t.length >= 6 && corpusTokens.has(t));
    if (!traceable) {
      console.warn(`⚠ ${tag}: respuesta "${correct}" no trazable a los datos del departamento — revisar`);
      warnings++;
    }
  }
  if (questions.length < MIN) {
    console.error(`✗ ${id}: ${questions.length} preguntas (mínimo ${MIN})`);
    errors++;
  }
}

console.log("\nDepartamento: preguntas");
for (const [id, n] of counts) console.log(`${id}: ${n}`);
console.log(`\nTotal departamentos: ${counts.length} | Errores: ${errors} | Avisos de trazabilidad: ${warnings}`);
process.exit(errors === 0 ? 0 : 1);
