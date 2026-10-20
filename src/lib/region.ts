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
  const startX = 0.35;
  const startY = 0.12;
  const stepY = 0.16;
  const amplitude = 0.14;

  depts.forEach((_, i) => {
    const x = startX + Math.sin(i * 0.75) * amplitude;
    const y = startY + i * stepY;
    points.push({ x, y });
  });

  let d = "";
  points.forEach((p, i) => {
    if (i === 0) {
      d += `M ${p.x * 1000} ${p.y * 1000} `;
    } else {
      const prev = points[i - 1]!;
      const cp1x = prev.x + (p.x - prev.x) * 0.45;
      const cp1y = prev.y + (p.y - prev.y) * 0.35;
      const cp2x = p.x - (p.x - prev.x) * 0.45;
      const cp2y = p.y - (p.y - prev.y) * 0.35;
      d += `C ${cp1x * 1000} ${cp1y * 1000}, ${cp2x * 1000} ${cp2y * 1000}, ${p.x * 1000} ${p.y * 1000} `;
    }
  });

  const maxY = Math.max(...points.map((p) => p.y), startY) + 0.12;
  const viewBoxHeight = Math.round(maxY * 1000);
  return { d, points, viewBox: `0 0 1000 ${viewBoxHeight}`, maxY };
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
