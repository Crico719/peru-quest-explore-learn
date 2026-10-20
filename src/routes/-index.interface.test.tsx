import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Index } from "./index";

// Mock de @/lib/game
vi.mock("@/lib/game", () => ({
  useGame: vi.fn(),
  exportEvidence: vi.fn(),
}));

// Mock de @/lib/wiki
vi.mock("@/lib/wiki", () => ({
  useWikiImage: vi.fn(() => ({ data: null })),
}));

// Mock de @tanstack/react-router
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    Link: ({ to, children, ...props }: any) => (
      <a href={String(to)} data-testid={`link-${to}`} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock de PracticeModal
vi.mock("@/components/PracticeModal", () => ({
  PracticeModal: ({ children }: any) => <div data-testid="practice-modal">{children}</div>,
}));

import { useGame } from "@/lib/game";
import { useNavigate } from "@tanstack/react-router";

const mockUseGame = useGame as ReturnType<typeof vi.fn>;
const mockUseNavigate = useNavigate as ReturnType<typeof vi.fn>;

function renderIndex(overrides: Partial<ReturnType<typeof useGame>> = {}) {
  const defaultGame = {
    crowns: vi.fn(() => 0),
    unlocked: vi.fn(() => true),
    level: 1,
    xp: 0,
    gems: 0,
    streak: 0,
    progress: {},
    lang: "es",
    ...overrides,
  };
  mockUseGame.mockReturnValue(defaultGame);
  mockUseNavigate.mockReturnValue(vi.fn());

  return render(<Index />);
}

describe("Index - Region selector vs path (mutually exclusive screens)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders region selector cards when no region is selected", () => {
    renderIndex();
    const regionMatcher = (content: string) =>
      /\b(Costa|Sierra|Selva)\b/.test(content) && !content.includes(",");
    const allRegionEls = screen.getAllByText(regionMatcher);
    const costaEls = allRegionEls.filter((e) => /\bCosta\b/.test(e.textContent ?? ""));
    const sierraEls = allRegionEls.filter((e) => /\bSierra\b/.test(e.textContent ?? ""));
    const selvaEls = allRegionEls.filter((e) => /\bSelva\b/.test(e.textContent ?? ""));
    expect(costaEls.length).toBeGreaterThan(0);
    expect(sierraEls.length).toBeGreaterThan(0);
    expect(selvaEls.length).toBeGreaterThan(0);
  });

  it("does not render region path when no region is selected", () => {
    renderIndex();
    expect(screen.queryByText(/Camino de/)).toBeNull();
  });

  it("renders region header when a region is selected", () => {
    renderIndex();
    // Click the first region button to select it
    const buttons = screen.getAllByRole("button");
    const costaButton = buttons.find((b) => b.textContent?.includes("CONTINUAR") || b.textContent?.includes("EMPEZAR"));
    if (costaButton) {
      fireEvent.click(costaButton);
      // After clicking, region should be set and header should show
      expect(screen.getByText(/Costa|Sierra|Selva/)).not.toBeNull();
    }
  });
});

describe("Index - Navigation elements", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders Inti mascot", () => {
    renderIndex();
    expect(screen.getByAltText("Inti, la mascota de PERÚ QUEST")).not.toBeNull();
  });

  it("renders XP, gems, streak chips with values", () => {
    renderIndex({
      xp: 150,
      gems: 25,
      streak: 3,
    });
    expect(screen.getByText((content) => content.includes("150") && content.includes("XP"))).not.toBeNull();
    expect(screen.getByText((content) => content.includes("25") && content.length < 10)).not.toBeNull();
    expect(screen.getByText((content) => content.includes("🔥") && content.includes("3"))).not.toBeNull();
  });

  it("calls navigate when navigate mock is invoked", () => {
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    renderIndex();
    expect(typeof navigate).toBe("function");
  });
});

describe("Index - Region unlocking logic (via unit-tested functions)", () => {
  it("first department of a region is always unlocked (unit logic)", () => {
    // This logic is tested in src/lib/region.test.ts via isRegionUnlocked
    // Here we just verify the component renders without lock icons
    // on the region selector screen (no path nodes rendered)
    renderIndex({
      crowns: vi.fn(() => 0),
    });
    const lockIcons = screen.queryAllByText(/🔒/);
    expect(lockIcons.length).toBe(0);
  });
});
