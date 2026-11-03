import { beforeAll, describe, expect, test } from "@jest/globals";
import commonTestInit from "./common.js";

let ReadySetRollHooks;

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

  ({ default: ReadySetRollHooks } = await import("../src/rollers/rsr.js"));
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
