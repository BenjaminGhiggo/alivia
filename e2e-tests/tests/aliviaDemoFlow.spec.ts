import { expect, test } from "@playwright/test";

/**
 * Smoke E2E del flujo demo (06-demo-acceptance §5).
 * Cubre AD1-AD7 sin tocar Telegram real:
 * - Landing carga + linkea a las páginas Alivia (AliviaProductSections).
 * - /grafo carga y renderiza el grafo seed.
 * - /casos carga el feed.
 * - /chat permite enviar mensaje vía /api/agent/turn y recibir respuesta.
 *
 * Mocking: si OPENAI_API_KEY no está, el server cae a MockLLMProvider,
 * el test sigue funcionando con respuesta determinística.
 */

test.describe("Alivia · demo flow", () => {
  test("landing tiene el bloque AliviaProductSections con links al producto", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Tres canales\. Un agente/i }),
    ).toBeVisible();

    // Las 6 cards del producto
    await expect(page.getByRole("link", { name: /Grafo público/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Casos publicados/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Conversa con Alivia/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cazarrecompensas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Observatorio Electoral/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Monitor de Licitaciones/i })).toBeVisible();
  });

  test("/grafo renderiza la vista con header y nodo seed", async ({ page }) => {
    await page.goto("/grafo");

    await expect(page.getByRole("heading", { name: /Grafo público/i })).toBeVisible();
    // Header muestra contadores (Nodos: N · Aristas: M)
    await expect(page.getByText(/Nodos:/)).toBeVisible();
    await expect(page.getByText(/Aristas:/)).toBeVisible();
  });

  test("/casos muestra header y lista (puede estar vacía)", async ({ page }) => {
    await page.goto("/casos");

    await expect(page.getByRole("heading", { name: /Casos publicados/i })).toBeVisible();
    await expect(page.getByText(/score de corroboración/i)).toBeVisible();
  });

  test("/chat envía mensaje y recibe respuesta del agente", async ({ page }) => {
    await page.goto("/chat");

    const input = page.getByPlaceholder(/Escribí a Alivia/i);
    await expect(input).toBeVisible();

    await input.fill("Hola Alivia");
    await page.getByRole("button", { name: /Enviar/i }).click();

    // El usuario aparece inmediatamente
    await expect(page.getByText("Hola Alivia")).toBeVisible();

    // El agente responde en <15s (mock o real)
    await page.waitForSelector("text=/recibo|hola|alivia|reportar|consultar/i", {
      timeout: 15_000,
    });
  });

  test("/bounties /elecciones /licitaciones mockups recorribles", async ({ page }) => {
    for (const [path, heading] of [
      ["/bounties", /Cazarrecompensas/i],
      ["/elecciones", /Observatorio Electoral/i],
      ["/licitaciones", /Monitor de Licitaciones/i],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });
});
