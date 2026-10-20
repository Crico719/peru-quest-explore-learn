import { DEPARTMENTS, type Department } from "@/data/departments";

export type Region = "Costa" | "Sierra" | "Selva";

export const PATH_STROKE = "var(--border)";
export const NODE_SIZE = 44;
export const NODE_RADIUS = NODE_SIZE / 2;

export function getRegionDepts(region: Region): Department[] {
  return DEPARTMENTS.filter((d) => d.region === region);
}

export function computeRegionPath(depts: Department[]) {
  const points: { x: number; y: number }[] = [];
  const startX = 70;
  const startY = 70;
  const stepY = 115;
  const amplitude = 42;

  depts.forEach((_, i) => {
    const x = startX + Math.sin(i * 0.75) * amplitude;
    const y = startY + i * stepY;
    points.push({ x, y });
  });

  let d = "";
  points.forEach((p, i) => {
    if (i === 0) {
      d += `M ${p.x} ${p.y} `;
    } else {
      const prev = points[i - 1]!;
      const cp1x = prev.x + (p.x - prev.x) * 0.45;
      const cp1y = prev.y + (p.y - prev.y) * 0.35;
      const cp2x = p.x - (p.x - prev.x) * 0.45;
      const cp2y = p.y - (p.y - prev.y) * 0.35;
      d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y} `;
    }
  });

  const maxY = points.reduce((m, p) => Math.max(m, p.y), startY) + NODE_RADIUS + 30;
  return { d, points, viewBox: `0 0 200 ${maxY}` };
}

export function isRegionUnlocked(
  idx: number,
  regionDepts: Department[],
  crownsOf: (deptId: string) => number,
): boolean {
  if (idx === 0) return true;
  const prev = regionDepts[idx - 1]!;
  return crownsOf(prev.id) >= 1;
}

export function regionProgress(region: Region, crownsOf: (deptId: string) => number) {
  const depts = getRegionDepts(region);
  const crowns = depts.reduce((n, d) => n + crownsOf(d.id), 0);
  const max = depts.length * 4;
  const pct = Math.round((crowns / max) * 100);
  return { depts, crowns, max, pct, started: crowns > 0 };
}
