import { describe, expect, jest, test } from "@jest/globals";
import { AbilitySaveFail } from "../src/fails";

function createActorWithEffects(...keys) {
  const effects = keys.map(createEffect);
  return { effects };
}

function createEffect(key) {
  const effect = {
    isSuppressed: false,
    data: {
      changes: [
        {
          key,
          value: "1",
          mode: 0,
          priority: "0",
        },
      ],
      disabled: false,
    },
  };
  // link the change back to the effect
  effect.data.changes[0].document = effect;
  return effect;
}

function mockFailChecker(failChecker) {
  return [
    jest.spyOn(failChecker, "createMessageData").mockImplementation(() => {}),
    jest.spyOn(failChecker, "toMessage").mockImplementation(() => {}),
  ];
}

describe("AbilitySaveFail no legit active effects", () => {
  test("saving throw with no active effects should not fail", async () => {
    const actor = createActorWithEffects();

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });

  test("saving throw with a suppressed active effect should not fail", async () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.fail.ability.save.all"
    );
    actor.effects[0].isSuppressed = true;

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });

  test("saving throw with a disabled active effect should not fail", async () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.fail.ability.save.all"
    );
    actor.effects[0].data.disabled = true;

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe("AbilitySaveFail fail flags", () => {
  test("saving throw with fail.all flag should fail", async () => {
    const actor = createActorWithEffects("flags.midi-qol.fail.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.all flag should fail", async () => {
    const actor = createActorWithEffects("flags.midi-qol.fail.ability.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.all flag should fail", async () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.fail.ability.save.all"
    );

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should fail a Dexterity save", async () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.fail.ability.save.dex"
    );

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should not fail a Constitution save", async () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.fail.ability.save.dex"
    );

    const failChecker = new AbilitySaveFail(actor, "con");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});
