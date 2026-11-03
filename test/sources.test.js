import { beforeAll, describe, expect, test } from "@jest/globals";
import { CriticalSource } from "../src/sources";
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
