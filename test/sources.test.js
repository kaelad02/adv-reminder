import { beforeAll, describe, expect, test } from "@jest/globals";
import { AbilitySaveSource, CriticalSource } from "../src/sources";
import commonTestInit from "./common.js";

beforeAll(() => {
  commonTestInit();
});

function createActorWithEffects(...effects) {
  const actor = createActorWithFlags();
  actor.allApplicableEffects = function* () {
    yield* effects;
  };
  actor.appliedEffects = effects;
  return actor;
}

function createEffect(link, ...changes) {
  return { active: true, link, statuses: [], system: { changes } };
}

describe("CriticalSource grants.critical.range", () => {
  function createTargetWithRange(range) {
    const effect = createEffect("@UUID[Effect.range]", {
      key: "flags.midi-qol.grants.critical.range",
      type: "override",
      value: String(range),
    });
    const target = createActorWithEffects(effect);
    foundry.utils.setProperty(target, "flags.midi-qol.grants.critical.range", range);
    return target;
  }

  test("within range, the effect is shown as a source of the critical", () => {
    const actor = createActorWithEffects();
    const target = createTargetWithRange(5);
    const dialog = {};

    new CriticalSource(actor, target, { actionType: "mwak" }, () => 5).updateOptions(dialog);

    expect(dialog.options["adv-reminder"].critSources.critical.labels).toEqual(["@UUID[Effect.range]"]);
  });

  test("out of range, the effect is not shown", () => {
    const actor = createActorWithEffects();
    const target = createTargetWithRange(5);
    const dialog = {};

    new CriticalSource(actor, target, { actionType: "mwak" }, () => 10).updateOptions(dialog);

    expect(dialog.options["adv-reminder"].critSources.critical.labels).toEqual([]);
  });
});

describe("CriticalSource natural 20", () => {
  test("a critical attack in the originating message is shown as a source", () => {
    const attack = { rolls: [{ isCritical: true, d20: { total: 20 } }] };
    dnd5e.registry = { messages: { get: (id, type) => (id === "attack1" && type === "attack" ? [attack] : []) } };
    const actor = createActorWithEffects();
    const dialog = {};

    new CriticalSource(actor, null, { actionType: "mwak" }, () => 5, "attack1").updateOptions(dialog);

    expect(dialog.options["adv-reminder"].critSources.critical.labels).toEqual(["adv-reminder.Source.Critical.nat20"]);
  });
});

describe("AbilitySaveSource subtract", () => {
  test("subtracting from another effect removes the advantage source", () => {
    const key = "flags.adv-reminder.statuses.poisoned.save.roll.mode";
    const actor = createActorWithEffects(
      createEffect("@UUID[Effect.A]", { key, type: "add", value: 1 }),
      createEffect("@UUID[Effect.B]", { key, type: "subtract", value: 1 }),
    );
    const dialog = {};

    new AbilitySaveSource(actor, "con", { effects: [{ effect: { statuses: ["poisoned"] } }] }).updateOptions(dialog);

    expect(dialog.options["adv-reminder"].advSources.advantages.labels).toEqual([]);
  });

  test("subtracting before the add it cancels removes the advantage source", () => {
    const key = "flags.adv-reminder.statuses.poisoned.save.roll.mode";
    const actor = createActorWithEffects(
      createEffect("@UUID[Effect.B]", { key, type: "subtract", value: 1 }),
      createEffect("@UUID[Effect.A]", { key, type: "add", value: 1 }),
    );
    const dialog = {};

    new AbilitySaveSource(actor, "con", { effects: [{ effect: { statuses: ["poisoned"] } }] }).updateOptions(dialog);

    expect(dialog.options["adv-reminder"].advSources.advantages.labels).toEqual([]);
  });
});
