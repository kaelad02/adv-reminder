import { beforeAll, describe, expect, test } from "@jest/globals";
import commonTestInit from "./common.js";

let DaeIntegration;
let hooks;

beforeAll(async () => {
  commonTestInit();

  globalThis.foundry.data = { fields: { StringField: class {} } };
  globalThis.CONFIG.DND5E.itemActionTypes = { mwak: "", rwak: "", msak: "", rsak: "", save: "", heal: "" };
  globalThis.CONFIG.DND5E.skills = { prc: {}, ste: {} };
  globalThis.CONFIG.DND5E.tools = { thief: {} };
  hooks = {};
  globalThis.Hooks = {
    on: (name, fn) => (hooks[name] = fn),
    once: (name, fn) => (hooks[name] = fn),
  };

  ({ default: DaeIntegration } = await import("../src/dae-integration.js"));
});

describe("DaeIntegration", () => {
  test("lists every message key the roll messages read", () => {
    const dae = new DaeIntegration();
    dae.init();

    expect(dae.messageFlags).toEqual(expect.arrayContaining([
      "flags.adv-reminder.message.all",
      "flags.adv-reminder.message.tool.thief",
      "flags.adv-reminder.message.ability.concentration",
      "flags.adv-reminder.message.initiative",
      "flags.adv-reminder.message.skill.ste",
      "flags.adv-reminder.message.attack.dex",
      "flags.adv-reminder.message.damage.heal",
      "flags.adv-reminder.grants.message.attack.mwak",
      "flags.adv-reminder.grants.message.damage.all",
    ]));
    // only attacks have attack messages
    expect(dae.messageFlags).not.toContain("flags.adv-reminder.message.attack.save");
    expect(new Set(dae.messageFlags).size).toBe(dae.messageFlags.length);
  });

  test("forces the message keys to the custom change type", () => {
    const dae = new DaeIntegration();
    dae.init();
    const specials = {};

    hooks["dae.modifySpecials"]("character", specials, {});

    expect(specials["flags.adv-reminder.message.all"][1]).toBe("custom");
  });
});
