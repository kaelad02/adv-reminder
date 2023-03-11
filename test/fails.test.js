import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { AbilitySaveFail } from "../src/fails";
import commonTestInit from "./common.js";

function mockFailChecker(failChecker) {
  return [
    jest.spyOn(failChecker, "createMessageData").mockImplementation(() => {}),
    jest.spyOn(failChecker, "toMessage").mockImplementation(() => {}),
  ];
}

beforeAll(() => {
  commonTestInit();
});

describe("AbilitySaveFail no legit active effects", () => {
  test("saving throw with no active effects should not fail", async () => {
    const actor = createActorWithFlags();

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe("AbilitySaveFail fail flags", () => {
  test("saving throw with fail.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should fail a Dexterity save", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.dex");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should not fail a Constitution save", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.dex");

    const failChecker = new AbilitySaveFail(actor, "con");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails()).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});
