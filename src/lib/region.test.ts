import { describe, it, expect } from "vitest";
import {
  computeRegionPath,
  getRegionDepts,
  isRegionUnlocked,
  regionProgress,
  type Region,
} from "./region";
import { DEPARTMENTS } from "@/data/departments";

const allRegions: Region[] = ["Costa", "Sierra", "Selva"];

describe("getRegionDepts", () => {
  it("returns only departments of the requested region", () => {
    for (const region of allRegions) {
      const depts = getRegionDepts(region);
      expect(depts.length).toBeGreaterThan(0);
      depts.forEach((d) => expect(d.region).toBe(region));
    }
  });

  it("returns all 24 departments across all regions", () => {
    const total = allRegions.reduce((sum, r) => sum + getRegionDepts(r).length, 0);
    expect(total).toBe(DEPARTMENTS.length);
  });
});

describe("computeRegionPath", () => {
  it("generates a path with one point per department", () => {
    const costa = getRegionDepts("Costa");
    const result = computeRegionPath(costa);
    expect(result.points.length).toBe(costa.length);
    expect(result.d).toContain("M");
    expect(result.d).toContain("C");
    expect(result.viewBox).toContain("0 0 200");
  });

  it("points are vertically ordered", () => {
    const depts = getRegionDepts("Sierra");
    const { points } = computeRegionPath(depts);
    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.y).toBeGreaterThan(points[i - 1]!.y);
    }
  });

  it("has horizontal oscillation (sine wave)", () => {
    const depts = getRegionDepts("Selva");
    const { points } = computeRegionPath(depts);
    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    expect(maxX - minX).toBeGreaterThan(0);
  });
});

describe("isRegionUnlocked", () => {
  const mockCrowns = (id: string) => {
    const crowns: Record<string, number> = {
      tumbes: 1,
      piura: 0,
      lambayeque: 0,
      ancash: 0,
    };
    return crowns[id] ?? 0;
  };

  it("first department of a region is always unlocked", () => {
    const depts = getRegionDepts("Costa");
    expect(isRegionUnlocked(0, depts, mockCrowns)).toBe(true);
  });

  it("second department is locked if previous has 0 crowns", () => {
    const depts = getRegionDepts("Costa");
    // tumbes has 1, piura has 0
    expect(isRegionUnlocked(1, depts, mockCrowns)).toBe(true); // tumbes >= 1
    // If we simulate piura having 0, the next would be locked
    const crownsZero = (_id: string) => 0;
    expect(isRegionUnlocked(1, depts, crownsZero)).toBe(false);
  });

  it("department is unlocked when previous has >= 1 crown", () => {
    const depts = getRegionDepts("Costa");
    const crownsOne = (_id: string) => 1;
    expect(isRegionUnlocked(1, depts, crownsOne)).toBe(true);
    expect(isRegionUnlocked(2, depts, crownsOne)).toBe(true);
  });
});

describe("regionProgress", () => {
  const mockCrownsAll = (id: string) => {
    const c: Record<string, number> = {};
    DEPARTMENTS.forEach((d) => (c[d.id] = 4));
    return c[id] ?? 0;
  };

  const mockCrownsNone = (_id: string) => 0;

  it("reports 100% when all departments have 4 crowns", () => {
    for (const region of allRegions) {
      const prog = regionProgress(region, mockCrownsAll);
      expect(prog.pct).toBe(100);
      expect(prog.started).toBe(true);
    }
  });

  it("reports 0% when no department has crowns", () => {
    for (const region of allRegions) {
      const prog = regionProgress(region, mockCrownsNone);
      expect(prog.pct).toBe(0);
      expect(prog.started).toBe(false);
    }
  });

  it("progress is independent between regions", () => {
    const costa = regionProgress("Costa", mockCrownsAll);
    const selva = regionProgress("Selva", mockCrownsNone);
    expect(costa.pct).toBe(100);
    expect(selva.pct).toBe(0);
  });
});
