import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { AbilitySaveFail } from "../src/fails";
import commonTestInit from "./common.js";

function mockFailChecker(failChecker) {
  return [
    jest.spyOn(failChecker, "toMessage").mockResolvedValue(undefined),
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

    expect(await failChecker.fails({})).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe("AbilitySaveFail fail flags", () => {
  test("saving throw with fail.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails({})).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails({})).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.all flag should fail", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.all");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails({})).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should fail a Dexterity save", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.dex");

    const failChecker = new AbilitySaveFail(actor, "dex");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails({})).toBe(true);
    spies.forEach((spy) => expect(spy).toHaveBeenCalled());
  });

  test("saving throw with fail.ability.save.dex flag should not fail a Constitution save", async () => {
    const actor = createActorWithFlags("flags.midi-qol.fail.ability.save.dex");

    const failChecker = new AbilitySaveFail(actor, "con");
    const spies = mockFailChecker(failChecker);

    expect(await failChecker.fails({})).toBe(false);
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });
});

describe("AbilitySaveFail chat message", () => {
  function mockChatMessage() {
    globalThis.foundry.applications = { handlebars: { renderTemplate: jest.fn(async () => "<div>fail</div>") } };
    globalThis.foundry.utils.mergeObject ??= (original, other) => ({ ...original, ...other });
    globalThis.CONST.CHAT_MESSAGE_STYLES = { OTHER: 0 };
    globalThis.game.settings = { get: jest.fn(() => "public") };
    globalThis.ChatMessage = {
      applyMode: jest.fn(),
      create: jest.fn(async (data) => data),
    };
  }

  test("message uses style, not the document type, and the author", async () => {
    mockChatMessage();
    game.user.id = "user1";
    const failChecker = new AbilitySaveFail(createActorWithFlags(), "dex");

    const chatData = await failChecker.toMessage({ speaker: { alias: "Bob" } }, "gm");

    expect(chatData.style).toBe(0);
    expect(chatData).not.toHaveProperty("type");
    expect(chatData.author).toBe("user1");
    expect(chatData.speaker).toEqual({ alias: "Bob" });
    expect(ChatMessage.applyMode).toHaveBeenCalledWith(chatData, "gm");
  });

  test("message falls back to the core message mode setting", async () => {
    mockChatMessage();
    const failChecker = new AbilitySaveFail(createActorWithFlags(), "dex");

    const chatData = await failChecker.toMessage({}, undefined);

    expect(game.settings.get).toHaveBeenCalledWith("core", "messageMode");
    expect(ChatMessage.applyMode).toHaveBeenCalledWith(chatData, "public");
  });

  test("roll still fails and the user is notified if the message can't be created", async () => {
    globalThis.ui = { notifications: { error: jest.fn() } };
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const failChecker = new AbilitySaveFail(createActorWithFlags("flags.midi-qol.fail.all"), "dex");
    jest.spyOn(failChecker, "toMessage").mockRejectedValue(new Error("invalid"));

    expect(failChecker.fails({})).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(ui.notifications.error).toHaveBeenCalledWith("adv-reminder.AutoFailMessageError", { localize: true });
    consoleError.mockRestore();
  });
});
