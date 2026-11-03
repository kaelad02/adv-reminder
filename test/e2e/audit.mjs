/**
 * End-to-end audit of Advantage Reminder in a running Foundry world. See test/e2e/README.md.
 * Usage: npm run test:e2e   (E2E_VERBOSE=1 to print the details of passing checks too)
 */
import { connect, Suite } from "./foundry.mjs";
import { installHelpers } from "./helpers.mjs";

const { browser, page, logs } = await connect();
const suite = new Suite(page);
let exitCode = 1;
let previousScene;
try {
  await installHelpers(page);
  previousScene = await page.evaluate(() => canvas.scene?.id);
  await page.evaluate(() => __ar.cleanup());
  const midi = await page.evaluate(() => !!game.modules.get("midi-qol")?.active);
  console.log(`Foundry ${await page.evaluate(() => game.version)}, dnd5e ${await page.evaluate(() => game.system.version)}, roller: ${midi ? "midi-qol" : "core"}\n`);

  await suite.check("the module is active and its condition effects are registered", () => {
    const ce = CONFIG.DND5E.conditionEffects;
    return { ok: !!game.modules.get("adv-reminder")?.active && ce.advReminderGrantAdjacentAttack?.has("prone"), version: game.modules.get("adv-reminder").version };
  });

  await suite.check("save: message, source and advantage from a Midi flag", async () => {
    const a = await __ar.actor("save", [
      [{ key: "flags.adv-reminder.message.ability.save.dex", value: "Bonus [[/r 1d4]]" }],
      [{ key: "flags.midi-qol.advantage.ability.save.dex", value: "1" }],
    ]);
    const d = await __ar.dialog(() => a.rollSavingThrow({ ability: "dex" }));
    const state = __ar.describe(d.app);
    await __ar.close(d);
    return { ok: state.default === "advantage" && state.messages.some((m) => m.startsWith("Bonus")) && state.messages.some((m) => m.includes("effect 2")), state };
  });

  await suite.check("save: clicking the message's roll adds it to the bonus and keeps the messages", async () => {
    const a = await __ar.actor("inline", [[{ key: "flags.adv-reminder.message.ability.save.dex", value: "Bonus [[/r 1d4]]" }]]);
    const d = await __ar.dialog(() => a.rollSavingThrow({ ability: "dex" }));
    const before = __ar.describe(d.app);
    const link = d.app.element.querySelector("a.dialog-roll");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link?.dispatchEvent(event);
    await new Promise((r) => setTimeout(r, 600));
    const after = __ar.describe(d.app);
    await __ar.close(d);
    return {
      ok: !!link && event.defaultPrevented && before.inlineRolls === 0 && /1d4/.test(after.situational ?? "")
        && after.messages.length === before.messages.length,
      defaultPrevented: event.defaultPrevented, before, after,
    };
  });

  await suite.check("save: a dialog rendered twice in a row shows the messages once", async () => {
    const a = await __ar.actor("rerender", [[{ key: "flags.adv-reminder.message.ability.save.dex", value: "Once" }]]);
    // re-render as soon as the first render is done, while the module is still preparing its messages
    Hooks.once("renderRollConfigurationDialog", (app) => app.render());
    const d = await __ar.dialog(() => a.rollSavingThrow({ ability: "dex" }));
    await new Promise((r) => setTimeout(r, 300));
    const count = d.app.element.querySelectorAll(".adv-reminder-messages").length;
    const state = __ar.describe(d.app);
    await __ar.close(d);
    return { ok: count === 1, count, state };
  });

  await suite.check("save: auto-fail from a true Midi flag creates the fail message", async () => {
    const a = await __ar.actor("fail", [[{ key: "flags.midi-qol.fail.ability.save.str", value: "1" }]]);
    const count = game.messages.size;
    const rolls = await a.rollSavingThrow({ ability: "str" });
    await __ar.until(() => game.messages.size > count, 3000).catch(() => null);
    const last = game.messages.contents.at(-1);
    return { ok: !rolls?.length && game.messages.size === count + 1 && last.content.includes("fumble"), rolls: rolls?.length ?? null };
  });

  await suite.check("save: a conditional (string) Midi fail flag does not auto-fail with the core roller", async () => {
    if (game.modules.get("midi-qol")?.active) return { ok: true, skipped: "Midi evaluates its own conditions" };
    const a = await __ar.actor("fail-cond", [[{ key: "flags.midi-qol.fail.ability.save.str", value: "@abilities.str.value < 0" }]]);
    const count = game.messages.size;
    let d;
    try {
      d = await __ar.dialog(() => a.rollSavingThrow({ ability: "str" }));
    } catch {
      return { ok: false, autoFailed: game.messages.size > count };
    }
    await __ar.close(d);
    return { ok: true };
  });

  await suite.check("check: a Midi advantage flag with the Override change type still gives advantage", async () => {
    const a = await __ar.actor("override", [[{ key: "flags.midi-qol.advantage.ability.check.all", type: "override", value: "1" }]]);
    const flag = foundry.utils.getProperty(a, "flags.midi-qol.advantage.ability.check.all");
    const d = await __ar.dialog(() => a.rollAbilityCheck({ ability: "str" }));
    const state = __ar.describe(d.app);
    await __ar.close(d);
    return { ok: state.default === "advantage", flag, flagType: typeof flag, state };
  });

  await suite.check("keybindings: the module's copy agrees with D20Roll.applyKeybindings", async () => {
    const { default: CoreRollerHooks } = await import("/modules/adv-reminder/src/rollers/core.js");
    const hooks = new CoreRollerHooks();
    const D20Roll = CONFIG.Dice.D20Roll;
    const mismatches = [];
    for (const shift of [false, true]) for (const alt of [false, true]) for (const ctrl of [false, true]) {
      const event = __ar.click({ shift, alt, ctrl });
      const mine = hooks.applyKeybindings({ event }, {});
      const system = (options) => {
        const config = { event, rolls: [{ options: { ...options } }] };
        const dialog = {};
        D20Roll.applyKeybindings(config, dialog, {});
        return { configure: dialog.configure, mode: config.rolls[0].options.advantageMode };
      };
      const adv = system({ advantage: true });
      const dis = system({ disadvantage: true });
      // the system ignores the roll's own advantage exactly when the keys force a mode: reminders are then pointless
      const forced = adv.mode === dis.mode;
      if (mine.messages !== adv.configure || mine.reminder === forced) mismatches.push({ shift, alt, ctrl, mine, adv, dis });
    }
    return { ok: !mismatches.length, mismatches };
  });

  // the system picks the default button from config.isCritical since dnd5e 6 (it needed a workaround for dnd5e#5455)
  const damageCheck = () => async ({ flagKey, isCritical, fastForward }) => {
    const a = await __ar.actor(`damage ${flagKey}`, [[{ key: flagKey, value: "1" }]]);
    const activity = await __ar.weapon(a);
    {
      const config = { isCritical, event: fastForward ? __ar.click({ shift: true }) : undefined };
      if (fastForward) {
        const rolls = await activity.rollDamage(config, {}, { create: false });
        return { isCritical: rolls?.[0]?.isCritical ?? null };
      }
      const d = await __ar.dialog(() => activity.rollDamage(config, {}, { create: false }));
      const state = __ar.describe(d.app);
      const rolls = await __ar.submit(d, state.default);
      return { default: state.default, isCritical: rolls?.[0]?.isCritical ?? null, messages: state.messages };
    }
  };
  const damage = async (name, flagKey, opts, expected) => {
    await suite.check(name, async (arg) => {
      const fn = eval(`(${arg.fn})`);
      const result = await fn(arg);
      return { ok: result.isCritical === arg.expected && (!("default" in result) || result.default === (arg.expected ? "critical" : "normal")), ...result };
    }, { fn: damageCheck().toString(), flagKey, ...opts, expected });
  };
  await damage("damage: critical.all makes the dialog's default a critical hit", "flags.midi-qol.critical.all", { isCritical: false }, true);
  await damage("damage: noCritical.all beats a critical attack in the dialog", "flags.midi-qol.noCritical.all", { isCritical: true }, false);
  await damage("damage: noCritical.all beats a critical attack when fast-forwarded", "flags.midi-qol.noCritical.all", { isCritical: true, fastForward: true }, false);
  await damage("damage: critical.all makes a fast-forwarded roll critical", "flags.midi-qol.critical.all", { isCritical: false, fastForward: true }, true);

  await suite.check("attack: prone target gives advantage when adjacent, disadvantage at range (square grid)", async () => {
    const attacker = await __ar.actor("attacker");
    const prone = await __ar.actor("prone");
    await prone.toggleStatusEffect("prone", { active: true });
    const activity = await __ar.weapon(attacker);
    const { tokens } = await __ar.scene([{ actor: attacker, x: 0, y: 0 }, { actor: prone, x: 100, y: 100 }]);
    const result = {};
    for (const [label, x, y] of [["diagonal", 100, 100], ["far", 600, 0]]) {
      await tokens[1].update({ x, y });
      await __ar.until(() => tokens[1].object.document.x === x);
      await __ar.target(tokens[1]);
      const d = await __ar.dialog(() => activity.rollAttack({}, {}, { create: false }));
      result[label] = { ...__ar.describe(d.app), context: d.context };
      await __ar.close(d);
    }
    await __ar.target();
    return { ok: result.diagonal.default === "advantage" && result.far.default === "disadvantage", result };
  });

  await suite.check("attack: several targets, one with a target message, shows the notice", async () => {
    const attacker = await __ar.actor("attacker 2");
    const t1 = await __ar.actor("target msg", [[{ key: "flags.adv-reminder.grants.message.attack.all", value: "Target message" }]]);
    const t2 = await __ar.actor("target plain");
    const activity = await __ar.weapon(attacker);
    const { tokens } = await __ar.scene([{ actor: attacker, x: 0, y: 0 }, { actor: t1, x: 100, y: 0 }, { actor: t2, x: 200, y: 0 }]);
    await __ar.target(tokens[1], tokens[2]);
    const d = await __ar.dialog(() => activity.rollAttack({}, {}, { create: false }));
    const state = { ...__ar.describe(d.app), context: d.context };
    await __ar.close(d);
    await __ar.target();
    return { ok: state.messages.length === 1 && !state.messages.includes("Target message"), state };
  });

  await suite.check("performance: save message + sources + reminder with 50 effects under 5 ms", async () => {
    const keys = ["flags.midi-qol.advantage.all", "flags.adv-reminder.message.all", "system.attributes.hp.bonuses.level", "flags.midi-qol.disadvantage.skill.ste", "flags.adv-reminder.message.ability.save.dex"];
    const effects = Array.from({ length: 50 }, (_, i) => [{ key: keys[i % keys.length], value: keys[i % keys.length].includes("message") ? `msg ${i}` : "1" }]);
    const a = await __ar.actor("perf", effects);
    const [{ AbilitySaveMessage }, { AbilitySaveSource }, { AbilitySaveReminder }] = await Promise.all([
      import("/modules/adv-reminder/src/messages.js"), import("/modules/adv-reminder/src/sources.js"), import("/modules/adv-reminder/src/reminders.js"),
    ]);
    const run = () => {
      new AbilitySaveMessage(a, "dex").addMessage({});
      new AbilitySaveSource(a, "dex").updateOptions({});
      new AbilitySaveReminder(a, "dex").updateOptions({});
    };
    for (let i = 0; i < 20; i++) run();
    const n = 200;
    const start = performance.now();
    for (let i = 0; i < n; i++) run();
    const ms = (performance.now() - start) / n;
    return { ok: ms < 5, msPerDialog: Number(ms.toFixed(3)) };
  });

  await suite.check("settings: the button style window renders and its test button opens a dialog with the message", async () => {
    const menu = game.settings.menus.get("adv-reminder.buttonStyle");
    const app = new menu.type();
    await app.render({ force: true });
    const fields = [...app.element.querySelectorAll("[name]")].map((e) => e.name);
    const d = await __ar.dialog(async () => app.element.querySelector('[data-action="test"]').click());
    const state = __ar.describe(d.app);
    await d.app.close();
    await app.close();
    return { ok: fields.includes("wide") && fields.includes("color") && state.messages.some((m) => m.startsWith("Conditional bonus")), fields, state };
  });

  exitCode = suite.report() ? 1 : 0;
} finally {
  try {
    console.log("\ncleanup:", JSON.stringify(await page.evaluate((s) => __ar.cleanup(s), previousScene)));
  } catch (err) {
    console.log("cleanup failed:", err.message);
  }
  const ours = logs.filter((l) => ["error", "warning", "pageerror"].includes(l.type) && /adv-reminder|deprecat/i.test(l.text));
  if (ours.length) {
    console.log("\nconsole errors/warnings mentioning adv-reminder or deprecations:");
    for (const l of ours) console.log(`  ${l.type}: ${l.text.slice(0, 400)}`);
  }
  await browser.close();
}
process.exit(exitCode);
