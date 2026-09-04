import { test, expect } from "@playwright/test";

/**
 * Smoke coverage for the surfaces that need no credentials.
 * Anything touching the database, Razorpay, Blob or Resend is out of scope —
 * see BLOCKERS.md B-01..B-05.
 *
 * Routes behind clerkMiddleware (/order/*, /dashboard/*, /admin/*) cannot be
 * driven by a browser while the Clerk publishable key is the placeholder: a
 * pk_test_ key makes Clerk run its dev-browser handshake, which redirects to
 * the Clerk frontend domain and dies with ERR_NAME_NOT_RESOLVED. Set
 * E2E_CLERK=1 once real keys are in place to enable those tests (B-02).
 */
const clerkConfigured = process.env.E2E_CLERK === "1";

test.describe("public pages", () => {
  test("home renders the pitch, tiers and categories", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /A website for the business you actually run/,
      }),
    ).toBeVisible();

    // the primary free-trial tile leads the grid
    await expect(
      page.getByRole("heading", { name: "Make it yourself" }),
    ).toBeVisible();
    await expect(page.getByText("Free to start", { exact: true })).toBeVisible();

    // the commissioned tiers are present but secondary
    await expect(page.getByText("Or we build it for you", { exact: true })).toBeVisible();
    await expect(page.getByText(/₹[\d,]+/).first()).toBeVisible();
  });

  test("hero has exactly one primary call to action", async ({ page }) => {
    await page.goto("/");
    // DESIGN.md: one headline, one subhead, one CTA — no competing second CTA.
    const heroCta = page
      .locator("section")
      .first()
      .getByRole("link", { name: /Try it/ });
    await expect(heroCta).toHaveCount(1);
    await expect(heroCta).toHaveAttribute("href", "/order/new");
  });

  test("pricing lists tiers, delivery speed and add-ons", async ({ page }) => {
    await page.goto("/pricing");

    await expect(
      page.getByRole("heading", { name: /Start free/ }),
    ).toBeVisible();
    await expect(page.getByText("Delivery speed", { exact: true })).toBeVisible();
    await expect(page.getByText("Add-ons", { exact: true })).toBeVisible();
    await expect(page.getByText("Extra customization")).toBeVisible();
    await expect(page.getByText("Security hardening")).toBeVisible();
  });

  test("portfolio shows its empty state", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(
      page.getByRole("heading", { name: "Recent projects" }),
    ).toBeVisible();
    await expect(page.getByText("Sample coming soon")).toHaveCount(4);
  });

  test("nav moves between public pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL(/\/pricing$/);
    await page.getByRole("link", { name: "Work" }).first().click();
    await expect(page).toHaveURL(/\/portfolio$/);
  });
});

test.describe("the Mark", () => {
  test("appears once, and opens the transparency panel", async ({ page }) => {
    await page.goto("/");
    const mark = page.getByRole("button", { expanded: false }).first();
    await expect(mark).toBeVisible({ timeout: 6000 });

    await mark.click();
    await expect(
      page.getByRole("heading", { name: "Who's actually behind this" }),
    ).toBeVisible();
    await expect(page.getByText("Things we will never do")).toBeVisible();

    // closes on Escape rather than trapping the visitor
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Who's actually behind this" }),
    ).toHaveCount(0);
  });
});

test.describe("order form", () => {
  // /order/new sits behind clerkMiddleware. See the note at the top of this
  // file and BLOCKERS.md B-02 / B-14.
  test.skip(
    !clerkConfigured,
    "needs real Clerk keys — run with E2E_CLERK=1 once they are set",
  );

  test("walks category -> tier -> add-ons and keeps a running total", async ({
    page,
  }) => {
    await page.goto("/order/new");

    // The form hydrates from sessionStorage before it renders.
    await expect(page.getByText("Step 1 of 5")).toBeVisible();

    const cont = page.getByRole("button", { name: "Continue" });
    await expect(cont).toBeDisabled(); // nothing picked yet

    await page.getByRole("button", { name: /Restaurant ordering/ }).click();
    await expect(cont).toBeEnabled();
    await cont.click();

    await expect(page.getByText("Step 2 of 5")).toBeVisible();
    await expect(cont).toBeDisabled(); // no tier picked yet
    await page.getByRole("button", { name: /Tier 2/ }).click();
    await cont.click();

    await expect(page.getByText("Step 3 of 5")).toBeVisible();
    const total = page.getByText(/Running total:/);
    await expect(total).toBeVisible();
    const standard = await total.textContent();

    // Choosing rush must increase the total.
    await page.getByRole("button", { name: /Rush/ }).click();
    await expect(total).not.toHaveText(standard ?? "");
  });

  test("remembers the draft across a reload", async ({ page }) => {
    await page.goto("/order/new");
    await expect(page.getByText("Step 1 of 5")).toBeVisible();
    await page.getByRole("button", { name: /Portfolio/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 2 of 5")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Step 2 of 5")).toBeVisible();
  });
});

test.describe("responsive", () => {
  test("public pages do not scroll sideways at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    // /order/new is excluded: it needs Clerk (see the note at the top).
    for (const path of ["/", "/pricing", "/portfolio"]) {
      await page.goto(path);
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows, `${path} overflows horizontally at 375px`).toBe(false);
    }
  });
});

test.describe("SEO surfaces", () => {
  test("robots.txt disallows the private areas and points at the sitemap", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    for (const path of ["/dashboard", "/admin", "/api"]) {
      expect(body).toContain(path);
    }
    expect(body.toLowerCase()).toContain("sitemap:");
  });

  test("sitemap lists the public pages only", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/pricing");
    expect(body).toContain("/portfolio");
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/dashboard");
  });

  test("home carries Organization structured data", async ({ page }) => {
    await page.goto("/");
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const parsed = JSON.parse(ld ?? "{}") as {
      "@graph": { "@type": string }[];
    };
    const types = parsed["@graph"].map((n) => n["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("Service");
  });
});
