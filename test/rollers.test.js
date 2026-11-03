import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import commonTestInit from "./common.js";

let CoreRollerHooks, ReadySetRollHooks, AbilitySaveFail;

beforeAll(async () => {
  commonTestInit();

  // settings.js reads these when it is imported
  class DataModel {}
  globalThis.foundry.abstract = { DataModel };
  globalThis.foundry.data = {
    fields: { BooleanField: class {}, ColorField: class {}, SchemaField: class {}, StringField: class {} },
  };
  globalThis.foundry.applications = {
    api: { ApplicationV2: class {}, HandlebarsApplicationMixin: (cls) => cls },
  };

  // used by the rollers while processing a roll
  globalThis.dnd5e.utils = { areKeysPressed: () => false };
  globalThis.dnd5e.documents = { Trait: { keyLabel: (key) => key } };
  globalThis.CONFIG.DND5E.conditionEffects = {};

  ({ default: CoreRollerHooks } = await import("../src/rollers/core.js"));
  ({ default: ReadySetRollHooks } = await import("../src/rollers/rsr.js"));
  ({ AbilitySaveFail } = await import("../src/fails.js"));
  // don't render the auto-fail chat message
  jest.spyOn(AbilitySaveFail.prototype, "toMessage").mockResolvedValue(undefined);
});

function createRollConfig(actor, extra = {}) {
  return { subject: actor, rolls: [{ options: {} }], ...extra };
}

describe("ReadySetRollHooks tool checks", () => {
  test("a tool check is processed without throwing", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const config = createRollConfig(actor, { ability: "int", tool: "thief" });
    const dialog = { configure: true, options: {} };
    const message = { data: {} };

    expect(() => new ReadySetRollHooks().preRollToolV2(config, dialog, message)).not.toThrow();
    expect(config.rolls[0].options.advantage).toBe(true);
  });
});

describe.each([
  ["CoreRollerHooks", () => new CoreRollerHooks()],
  ["ReadySetRollHooks", () => new ReadySetRollHooks()],
])("%s concentration", (_name, createHooks) => {
  // dnd5e calls the concentration hook first, then the saving throw hook with the same config
  test("a concentration save with fail.all fails", () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.all");
    const config = createRollConfig(actor, { ability: "con" });
    const dialog = { configure: true, options: {} };
    const message = { data: {} };
    const hooks = createHooks();

    const results = [
      hooks.preRollConcentrationV2(config, dialog, message),
      hooks.preRollSavingThrowV2(config, dialog, message),
    ];

    expect(results).toContain(false);
  });
});

describe("CoreRollerHooks saving throw from a chat card", () => {
  // dnd5e rolls the save for each target in turn, so for the second target the click event is no longer dispatching
  // and its currentTarget is null: only the message's origin identifies the activity
  test("a save against a status uses the activity of the originating message", () => {
    const actor = createActorWithRollModes({
      key: "flags.adv-reminder.statuses.poisoned.save.roll.mode",
      type: "add",
      value: "1",
    });
    actor.hasConditionEffect = () => false;
    const activity = { effects: [{ effect: { statuses: ["poisoned"], flags: {} } }] };
    game.messages = new Map([["origin1", { getAssociatedActivity: () => activity }]]);
    const config = createRollConfig(actor, { ability: "con", event: { currentTarget: null, target: null } });
    const dialog = { configure: true, options: {} };
    const message = { data: { system: { origin: "origin1" } } };

    new CoreRollerHooks().preRollSavingThrowV2(config, dialog, message);

    expect(config.rolls[0].options.advantage).toBe(true);
  });
});
