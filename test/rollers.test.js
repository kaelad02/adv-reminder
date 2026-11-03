import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import commonTestInit from "./common.js";

let CoreRollerHooks, ReadySetRollHooks, MidiRollerHooks, AbilitySaveFail, applySettings;

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
  globalThis.canvas = {};

  ({ default: CoreRollerHooks } = await import("../src/rollers/core.js"));
  ({ default: ReadySetRollHooks } = await import("../src/rollers/rsr.js"));
  ({ default: MidiRollerHooks } = await import("../src/rollers/midi.js"));
  ({ AbilitySaveFail } = await import("../src/fails.js"));
  ({ applySettings } = await import("../src/settings.js"));
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

describe("MidiRollerHooks distance", () => {
  function createProneTarget() {
    const effect = { active: true, link: "@UUID[Effect.prone]", statuses: ["prone"], system: { changes: [] } };
    return {
      ...createActorWithFlags(),
      statuses: new Set(["prone"]),
      appliedEffects: [effect],
    };
  }

  function rollAttack(workflow) {
    CONFIG.DND5E.conditionEffects.advReminderGrantAdjacentAttack = new Set(["prone"]);
    game.settings = { get: () => true };
    applySettings();
    const target = createProneTarget();
    setTargets(target);
    const actor = createActorWithFlags();
    actor.appliedEffects = [];
    actor.statuses = new Set();
    const activity = { actor, actionType: "rwak", ability: "dex" };
    const config = { subject: activity, rolls: [{ options: {} }], workflow };
    const dialog = { configure: true, options: {} };

    new MidiRollerHooks().preRollAttackV2(config, dialog, { data: {} });
    setTargets();
    return dialog.options["adv-reminder"].advSources;
  }

  test("before the attack, the distance is measured to the targets, not the (still empty) hit targets", () => {
    globalThis.MidiQOL = { computeDistance: (t1, t2) => (t1 && t2 ? 30 : -1) };
    const sources = rollAttack({ token: {}, targets: new Set([{}]), hitTargets: new Set() });

    expect(sources.disadvantages.labels).toEqual(["@UUID[Effect.prone]"]);
    expect(sources.advantages.labels).toEqual([]);
  });

  test("without a Midi workflow, the distance is measured from the speaker's token", () => {
    // a 5 ft square grid, the attacker's token next to the target's
    const grid = {
      isGridless: false, isHexagonal: false, size: 100, sizeX: 100, sizeY: 100, distance: 5,
      getOffset: ({ x, y }) => ({ i: Math.floor(y / 100), j: Math.floor(x / 100) }),
      measurePath: ([from, to]) => ({ distance: Math.round(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) / 100) * 5 }),
    };
    const scene = { grid };
    const token = (x, y) => ({ parent: scene, x, y, width: 1, height: 1, elevation: 0 });
    const attackerToken = token(0, 0);
    scene.tokens = { get: (id) => (id === "tokenA" ? attackerToken : undefined) };
    game.scenes = { get: (id) => (id === "sceneA" ? scene : undefined) };

    CONFIG.DND5E.conditionEffects.advReminderGrantAdjacentAttack = new Set(["prone"]);
    game.settings = { get: () => true };
    applySettings();
    const targets = new Set([{ actor: createProneTarget(), document: token(100, 100) }]);
    targets.first = () => targets.values().next().value;
    game.user.targets = targets;
    const actor = createActorWithFlags();
    actor.appliedEffects = [];
    actor.statuses = new Set();
    const config = { subject: { actor, actionType: "mwak", ability: "str" }, rolls: [{ options: {} }] };
    const dialog = { configure: true, options: {} };

    new MidiRollerHooks().preRollAttackV2(config, dialog, { data: { speaker: { scene: "sceneA", token: "tokenA" } } });
    setTargets();

    const sources = dialog.options["adv-reminder"].advSources;
    expect(sources.advantages.labels).toEqual(["@UUID[Effect.prone]"]);
    expect(sources.disadvantages.labels).toEqual([]);
  });

  test("an unknown distance (-1) is not treated as adjacent", () => {
    globalThis.MidiQOL = { computeDistance: () => -1 };
    const sources = rollAttack({ token: {}, targets: new Set([{}]), hitTargets: new Set([{}]) });

    expect(sources.advantages.labels).toEqual([]);
  });
});
