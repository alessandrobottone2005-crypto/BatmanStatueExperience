import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// Vercel injects its collaboration toolbar into previews. Isolate application
// behavior from that platform UI; unknown application POSTs still fail the test.
test.beforeEach(async ({ page }) => {
  await page.route("https://vercel.live/**", (route) => route.abort());
});
async function start(page: Page) {
  await page.goto("/");
  const skip = page.getByRole("button", { name: "Salta intro" });
  if (await skip.count()) await skip.click();
  await page.getByRole("button", { name: "Accetta la sfida" }).click();
  await page.getByRole("button", { name: "Inizia la missione" }).click();
  await expect(
    page
      .locator(".keyboard-clues")
      .getByRole("button", { name: "Apri indizio 1" }),
  ).toBeEnabled();
}
async function answer(page: Page, id: number, response: string) {
  const clue = page
    .locator(".keyboard-clues")
    .getByRole("button", { name: `Apri indizio ${id}` });
  await expect(clue).toBeEnabled();
  await clue.focus();
  await clue.press("Enter");
  await page.getByRole("button", { name: response, exact: true }).click();
}
async function fill(page: Page) {
  const data = {
    fullName: "Mario Demo",
    email: "mario@example.com",
    phone: "3330000000",
    address: "Via Gotham",
    civico: "87",
    cap: "00100",
    city: "Roma",
    provincia: "RM",
    cardOwner: "Mario Demo",
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/30",
    cardCvv: "123",
  };
  for (const [key, value] of Object.entries(data))
    await page.locator(`[name="${key}"]`).fill(value);
}
test("intro skip is final and no media is downloaded before entry", async ({
  page,
}) => {
  const media: string[] = [];
  page.on("request", (r) => {
    if (/\.(mp4|wav)(\?|$)/.test(r.url())) media.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Salta intro" }).click();
  await page.waitForTimeout(5000);
  await expect(
    page.getByRole("button", { name: "Accetta la sfida" }),
  ).toBeVisible();
  expect(media).toEqual([]);
  await page.screenshot({
    path: test.info().outputPath("intro.png"),
    animations: "disabled",
  });
});
test("keyboard mission completes, awards bonus and speedrun, then statue and checkout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  await page.waitForTimeout(1200);
  await answer(page, 1, "Batsegnale");
  await answer(page, 2, "Joker");
  await expect(page.getByText("Bonus esplorazione: +60 secondi")).toBeVisible();
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 3, "Batman");
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 4, "Batmobile");
  await answer(page, 5, "Reattore");
  await expect(
    page.getByRole("heading", { name: "Gotham è salva." }),
  ).toBeVisible();
  await expect(page.getByText(/Premio demo del 15% sbloccato/)).toBeVisible();
  await page.getByRole("button", { name: "Scopri la statua" }).click();
  await expect(page.getByRole("button", { name: "Vista 1" })).toBeVisible();
  await page.getByRole("button", { name: "Esplora il checkout demo" }).click();
  await expect(page.locator("#promo")).toHaveValue("SPEEDRUN15");
});
test("checkout validates, arrows do not navigate, cancel stops confirmation", async ({
  page,
}) => {
  await page.goto("/#checkout");
  await page.getByRole("button", { name: /Completa simulazione/ }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await fill(page);
  await page.locator("[name=cardNumber]").fill("1               ");
  await page.getByRole("button", { name: /Completa simulazione/ }).click();
  await expect(
    page.getByText("Inserisci da 13 a 19 cifre fittizie, senza lettere."),
  ).toBeVisible();
  await page.locator("[name=cardNumber]").fill("4242 4242 4242 4242");
  await page.locator("[name=email]").press("ArrowRight");
  await expect(page).toHaveURL(/#checkout$/);
  await page.getByRole("button", { name: /Completa simulazione/ }).click();
  await page
    .getByRole("button", { name: "Annulla e torna alla statua" })
    .click();
  await page.waitForTimeout(4500);
  await expect(page).toHaveURL(/#statua$/);
  await expect(
    page.getByRole("heading", { name: /Simulazione completata/ }),
  ).toHaveCount(0);
});
test("valid demo purchase creates a consistent local confirmation only", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/#checkout");
  await fill(page);
  await page.locator("#promo").fill("SPEEDRUN15");
  await page.getByRole("button", { name: "Applica", exact: true }).click();
  await expect(page.getByText(/premio non sbloccato/)).toBeVisible();
  await page.getByRole("button", { name: "Aumenta quantità" }).click();
  await page.getByRole("button", { name: /Completa simulazione/ }).click();
  await expect(
    page.getByRole("heading", { name: "Simulazione completata." }),
  ).toBeVisible();
  await expect(page.getByText(/1\.?460,00/)).toBeVisible();
  expect(posts).toEqual([]);
  await page.reload();
  await expect(page).toHaveURL(/#statua$/);
});
test("statue paints before scroll and handles missing frames", async ({
  page,
}) => {
  await page.route("**/000[2-9].webp", (r) => r.abort());
  await page.goto("/#statua");
  await expect(
    page.getByText("Preparazione del primo fotogramma…"),
  ).toHaveCount(0);
  const painted = await page
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) => {
      const data = c
        .getContext("2d")!
        .getImageData(0, 0, c.width, c.height).data;
      return data.some((v, i) => i % 4 === 3 && v > 0);
    });
  expect(painted).toBe(true);
  await page.screenshot({ path: test.info().outputPath("statue-initial.png") });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
  await expect(page.locator("canvas")).toBeVisible();
});
test("mobile and tablet show only notice, including landscape and direct links", async ({
  browser,
}) => {
  for (const [width, height] of [
    [390, 844],
    [844, 390],
    [1024, 1366],
    [1366, 1024],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q === "(pointer: coarse)"
          ? ({
              ...original(q),
              matches: true,
              addEventListener() {},
              removeEventListener() {},
            } as MediaQueryList)
          : original(q);
    });
    const media: string[] = [];
    page.on("request", (r) => {
      if (/\.(mp4|wav|webp)(\?|$)/.test(r.url())) media.push(r.url());
    });
    await page.goto("/#checkout");
    await expect(
      page.getByRole("heading", { name: "Gotham ti aspetta. Da desktop." }),
    ).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
    expect(media).toEqual([]);
    await context.close();
  }
});
test("accessibility of intro, checkout, gallery and confirmation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/#checkout", "/#statua"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.goto("/#checkout");
  await fill(page);
  await page.getByRole("button", { name: /Completa simulazione/ }).click();
  await expect(
    page.getByRole("heading", { name: "Simulazione completata." }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("WebGL failure offers a recoverable exit", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Accetta la sfida" }).click();
  await page.getByRole("button", { name: "Inizia la missione" }).click();
  await expect(
    page.getByText("La Batcaverna non è disponibile."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Scopri la statua" }).click();
  await expect(page).toHaveURL(/#statua$/);
});

test("hint, pause and timeout use active mission time; failure exit stays clear", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await start(page);
  await expect(page.locator(".mission-hud")).toContainText("03:00");
  await page.clock.fastForward(61000);
  await expect(page.getByText(/Un indizio ti aspetta/)).toBeVisible();
  await page.getByRole("button", { name: "Metti in pausa esperienza" }).click();
  const frozen = await page.locator(".mission-hud > span").first().innerText();
  await page.clock.fastForward(30000);
  await expect(page.locator(".mission-hud > span").first()).toHaveText(frozen);
  await page.getByRole("button", { name: "Riprendi", exact: true }).click();
  await page.clock.fastForward(121000);
  await expect(
    page.getByRole("heading", { name: "Il tempo è scaduto." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Scopri la statua" }).click();
  await expect(page.getByRole("button", { name: "Vista 1" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Il tempo è scaduto." }),
  ).toHaveCount(0);
  await page.clock.fastForward(10000);
  await expect(page).toHaveURL(/#statua$/);
});
test("wrong answer, modal focus, escape and refresh preserve the intended flow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  const clue = page
    .locator(".keyboard-clues")
    .getByRole("button", { name: "Apri indizio 1" });
  await expect(clue).toBeEnabled();
  await clue.focus();
  await clue.press("Enter");
  await page.getByRole("button", { name: "Arkham", exact: true }).click();
  await expect(page.getByText("Risposta errata. Riprova.")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Esperienza in pausa" }),
  ).toHaveCount(0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-phase]")).toHaveAttribute(
    "data-phase",
    "batcomputer",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Accetta la sfida" }),
  ).toBeVisible();
});
test("video errors use static panoramas and offer a transition exit", async ({
  page,
}) => {
  await page.route("**/*.mp4", (r) => r.abort());
  await start(page);
  await answer(page, 1, "Batsegnale");
  await answer(page, 2, "Joker");
  await expect(
    page.getByText("Il filmato non è disponibile. Puoi continuare."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 3, "Batman");
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 4, "Batmobile");
  await answer(page, 5, "Reattore");
  await expect(
    page.getByRole("heading", { name: "Gotham è salva." }),
  ).toBeVisible();
});

test("mouse exploration can find all five cards in the panoramas", async ({
  page,
}) => {
  test.setTimeout(120000);
  await start(page);
  const responses = ["Batsegnale", "Joker", "Batman", "Batmobile", "Reattore"];
  for (let id = 1; id <= 5; id++) {
    const card = page
      .locator(".clue-card")
      .filter({ has: page.locator("span", { hasText: `INDIZIO ${id}` }) });
    await expect(card).toBeEnabled();
    const viewport = page.viewportSize()!;
    let point: { x: number; y: number } | null = null;
    for (let scan = 0; scan < 120 && !point; scan++) {
      point = await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const x = r.x + r.width / 2,
          y = r.y + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return x > 40 &&
          x < innerWidth - 40 &&
          y > 120 &&
          y < innerHeight - 130 &&
          hit &&
          el.contains(hit)
          ? { x, y }
          : null;
      });
      if (!point) {
        await page.mouse.move(viewport.width - 5, viewport.height / 2);
        await page.waitForTimeout(100);
      }
    }
    expect(point, `indizio ${id} visibile dopo la rotazione`).not.toBeNull();
    await page.mouse.move(point!.x, point!.y);
    // A projected 3D control has no document scroll position. Use real pointer
    // input at its visible hit-tested center, without DOM scrollIntoView.
    await page.waitForTimeout(100);
    const hit = await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const x = r.x + r.width / 2,
        y = r.y + r.height / 2;
      const top = document.elementFromPoint(x, y);
      return top && el.contains(top) ? { x, y } : null;
    });
    expect(hit, `indizio ${id} sotto il puntatore`).not.toBeNull();
    await page.mouse.click(hit!.x, hit!.y);
    await page
      .getByRole("button", { name: responses[id - 1], exact: true })
      .click();
    if (id === 2 || id === 3) {
      const next = page.getByRole("button", {
        name: "Accedi alla prossima area",
      });
      await expect(next).toBeVisible();
      await next.click();
    }
  }
  await expect(
    page.getByRole("heading", { name: "Gotham è salva." }),
  ).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("victory.png") });
});
test("desktop low heights and zoom equivalent keep controls reachable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 600 },
    { width: 720, height: 450 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: "Accetta la sfida" }).click();
    const startButton = page.getByRole("button", {
      name: "Inizia la missione",
    });
    await startButton.scrollIntoViewIfNeeded();
    await expect(startButton).toBeInViewport();
    await page.goto("/#checkout");
    await page
      .getByRole("button", { name: /Completa simulazione/ })
      .scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: test.info().outputPath("checkout-zoom-equivalent.png"),
    fullPage: true,
  });
});
test("clipboard denial provides an honest manual alternative", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  await answer(page, 1, "Batsegnale");
  await answer(page, 2, "Joker");
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 3, "Batman");
  await page.getByRole("button", { name: "Accedi alla prossima area" }).click();
  await answer(page, 4, "Batmobile");
  await answer(page, 5, "Reattore");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    }),
  );
  await page
    .getByRole("button", { name: "Copia e condividi il risultato" })
    .click();
  await expect(page.getByLabel("Risultato da copiare")).toBeVisible();
  await expect(page.getByText("Risultato copiato.")).toHaveCount(0);
});

test("intro pause preserves remaining briefing time", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.fastForward(2500);
  await page.getByRole("button", { name: "Metti in pausa esperienza" }).click();
  await page.clock.fastForward(20000);
  await expect(page.locator(".intro-message")).toContainText("Batman…");
  await page.getByRole("button", { name: "Riprendi", exact: true }).click();
  await page.clock.fastForward(1600);
  await expect(page.locator(".intro-message")).toContainText(
    "Trova i miei cinque indizi.",
  );
  await page.clock.fastForward(4000);
  await expect(page.locator(".intro-message")).toContainText("Tre minuti.");
  await expect(page.getByRole("button", { name: "Salta intro" })).toBeVisible();
  await page.clock.fastForward(4000);
  await expect(
    page.getByRole("button", { name: "Accetta la sfida" }),
  ).toBeVisible();
});
test("mute reaches existing music and prevents riddle beeps", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const target = window as unknown as {
      __beeps: number;
      __music: HTMLAudioElement[];
    };
    target.__beeps = 0;
    target.__music = [];
    const OriginalContext = window.AudioContext;
    window.AudioContext = class extends OriginalContext {
      createOscillator() {
        target.__beeps++;
        return super.createOscillator();
      }
    };
    const OriginalAudio = window.Audio;
    window.Audio = class extends OriginalAudio {
      constructor(src?: string) {
        super(src);
        target.__music.push(this);
      }
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  const clue = page
    .locator(".keyboard-clues")
    .getByRole("button", { name: "Apri indizio 1" });
  await clue.focus();
  await clue.press("Enter");
  await page.getByRole("button", { name: "Arkham", exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __beeps: number }).__beeps,
    ),
  ).toBe(1);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Silenzia audio" }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { __music: HTMLAudioElement[] }).__music.every(
        (audio) => audio.muted,
      ),
    ),
  ).toBe(true);
  await clue.focus();
  await clue.press("Enter");
  await page.getByRole("button", { name: "Arkham", exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __beeps: number }).__beeps,
    ),
  ).toBe(1);
});

test("showreel caps concurrent frame requests and reports complete media failure", async ({
  page,
}) => {
  let active = 0,
    maximum = 0;
  await page.route("**/assets/showreel/*.webp", async (route) => {
    active++;
    maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 30));
    try {
      await route.fulfill({ response: await route.fetch() });
    } finally {
      active--;
    }
  });
  await page.goto("/#statua");
  await expect(
    page.getByText("Preparazione del primo fotogramma…"),
  ).toHaveCount(0);
  for (const position of [1500, 3500, 5000]) {
    await page.evaluate((y) => scrollTo(0, y), position);
    await page.waitForTimeout(150);
  }
  expect(maximum).toBeLessThanOrEqual(6);
  expect(maximum).toBeGreaterThan(0);
  await page.unroute("**/assets/showreel/*.webp");
  await page.route("**/assets/showreel/**", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByText(
      "Sequenza non disponibile. Puoi riprovare o proseguire con la demo.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Riprova", exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.getByText(
      "Immagine non disponibile. Puoi riprovare o proseguire con la demo.",
    ),
  ).toBeVisible();
});
