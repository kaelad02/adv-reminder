import { chromium } from "playwright";

/**
 * Connect to a running Foundry world as a GM and wait for it to be ready.
 * Configure with FOUNDRY_URL (default http://localhost:30000), FOUNDRY_USER (default: the first Gamemaster) and
 * FOUNDRY_PASSWORD (default: empty).
 * @returns {Promise<{browser: import("playwright").Browser, page: import("playwright").Page, logs: object[]}>}
 */
export async function connect() {
  const url = process.env.FOUNDRY_URL ?? "http://localhost:30000";
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const logs = [];
  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => logs.push({ type: "pageerror", text: String(err?.stack ?? err) }));

  await page.goto(`${url}/join`);
  await page.waitForSelector('select[name="userId"] option[value]:not([value=""])', { state: "attached", timeout: 60000 });
  const userId = await page.$$eval('select[name="userId"] option', (options, wanted) => {
    const users = options.filter((o) => o.value);
    const user = wanted ? users.find((o) => o.textContent.trim() === wanted) : users.find((o) => /gamemaster/i.test(o.textContent));
    return (user ?? users[0])?.value;
  }, process.env.FOUNDRY_USER);
  if (!userId) throw new Error("no user to log in with on the join page");
  await page.selectOption('select[name="userId"]', userId);
  await page.fill('input[name="password"]', process.env.FOUNDRY_PASSWORD ?? "");
  await page.click('button[name="join"]');
  await page.waitForURL(/\/game/, { timeout: 60000 });
  await page.waitForFunction(() => globalThis.game?.ready === true, null, { timeout: 120000 });
  if (!(await page.evaluate(() => game.user.isGM))) throw new Error("the e2e tests need a Gamemaster user");
  return { browser, page, logs };
}

/**
 * A tiny test runner: each check runs in the page, records pass/fail, and never stops the others.
 */
export class Suite {
  results = [];

  constructor(page) {
    this.page = page;
  }

  async check(name, fn, arg) {
    try {
      const detail = await this.page.evaluate(fn, arg);
      const ok = detail?.ok ?? true;
      this.results.push({ name, ok, detail });
    } catch (err) {
      this.results.push({ name, ok: false, detail: String(err?.message ?? err).split("\n")[0] });
    }
  }

  report() {
    for (const { name, ok, detail } of this.results) {
      console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
      if (!ok || process.env.E2E_VERBOSE) console.log("      ", JSON.stringify(detail));
    }
    const failed = this.results.filter((r) => !r.ok).length;
    console.log(`\n${this.results.length - failed}/${this.results.length} passed`);
    return failed;
  }
}
