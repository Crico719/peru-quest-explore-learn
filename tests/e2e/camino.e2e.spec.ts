import { test, expect } from "@playwright/test";

test.describe("Camino interactivo — móvil 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("muestra selector de 3 regiones y no renderiza camino completo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Costa/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sierra/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Selva/ })).toBeVisible();
    await expect(page.locator("svg")).not.toBeVisible();
  });

  test("los botones de región son clickeables", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button:has-text(\"COMENZAR\")").first();
    await expect(btn).toBeVisible();
    await btn.click();
  });

  test("no hay desbordamiento horizontal en móvil", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    const width = await body.evaluate((el) => el.scrollWidth);
    expect(width).toBeLessThanOrEqual(400);
  });

  test("mascota Inti visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByAltText("Inti, la mascota de PERÚ QUEST")).toBeVisible();
  });
});

test.describe("Camino interactivo — escritorio 1280×800", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("muestra selector de 3 regiones", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Costa/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sierra/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Selva/ })).toBeVisible();
  });

  test("los botones de región son clickeables", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator("button:has-text(\"COMENZAR\")");
    await expect(buttons).toHaveCount(3);
    await buttons.first().click();
  });

  test("no hay desbordamiento horizontal en escritorio", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    const width = await body.evaluate((el) => el.scrollWidth);
    expect(width).toBeLessThanOrEqual(1280);
  });

  test("nodos accesibles con teclado (Tab)", async ({ page }) => {
    await page.goto("/");
    await page.locator("button:has-text(\"COMENZAR\")").first().click();
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});
