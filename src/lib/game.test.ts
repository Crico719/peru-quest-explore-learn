import { describe, it, expect } from "vitest";
import { crownsOf, type DeptProgress } from "./game";

describe("crownsOf", () => {
  it("returns 0 for undefined/null/empty progress", () => {
    expect(crownsOf(undefined)).toBe(0);
    expect(crownsOf(null!)).toBe(0);
    expect(crownsOf({})).toBe(0);
  });

  it("returns 1 for a single completed activity", () => {
    expect(crownsOf({ quiz: 2 })).toBe(1);
    expect(crownsOf({ quiz: 4 })).toBe(1);
    expect(crownsOf({ quiz: 1 })).toBe(0);
    expect(crownsOf({ memory: true })).toBe(1);
    expect(crownsOf({ tap: true })).toBe(1);
    expect(crownsOf({ order: true })).toBe(1);
  });

  it("returns 4 when all activities completed", () => {
    expect(crownsOf({ quiz: 2, memory: true, tap: true, order: true })).toBe(4);
  });

  it("returns 2 for two completed activities", () => {
    expect(crownsOf({ quiz: 2, memory: true })).toBe(2);
  });
});

describe("DeptProgress type", () => {
  it("type-checks a valid progress object", () => {
    const p: DeptProgress = { quiz: 3, memory: true, tap: false, order: true };
    expect(crownsOf(p)).toBe(3);
  });
});
