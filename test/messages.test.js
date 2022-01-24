import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { AttackMessage } from "../src/messages";

// fake version of renderTemplate
globalThis.renderTemplate = () => {};

// mock Hooks.once to check if it was called
globalThis.Hooks = {};
let onceMock;
beforeEach(() => {
  onceMock = jest.fn(() => {});
  globalThis.Hooks.once = onceMock;
});

function createActorWithEffects(...keyValuePairs) {
  const effects = keyValuePairs.map(createEffect);
  return {
    data: {
      data: {
        skills: {
          acr: {
            ability: "dex",
          },
          ani: {
            ability: "wis",
          },
          arc: {
            ability: "int",
          },
          ath: {
            ability: "str",
          },
          dec: {
            ability: "cha",
          },
          his: {
            ability: "int",
          },
          ins: {
            ability: "wis",
          },
          itm: {
            ability: "cha",
          },
          inv: {
            ability: "int",
          },
          med: {
            ability: "wis",
          },
          nat: {
            ability: "int",
          },
          prc: {
            ability: "wis",
          },
          prf: {
            ability: "cha",
          },
          per: {
            ability: "cha",
          },
          rel: {
            ability: "int",
          },
          slt: {
            ability: "dex",
          },
          ste: {
            ability: "dex",
          },
          sur: {
            ability: "wis",
          },
        },
      },
    },
    effects,
  };
}

function createEffect([key, value]) {
  return {
    isSuppressed: false,
    data: {
      changes: [
        {
          key,
          value,
          mode: 0,
          priority: "0",
        },
      ],
      disabled: false,
    },
  };
}

function createItem(actionType, abilityMod) {
  return {
    abilityMod,
    data: {
      data: {
        actionType,
      },
    },
  };
}

describe("AttackMessage no legit active effects", () => {
  test("attack with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("attack with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("attack with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });
});

describe("AttackMessage message flags", () => {
  test("attack with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual(["message.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("attack with message.attack.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.all",
      "message.attack.all message",
    ]);
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual(["message.attack.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("attack with message.attack.mwak flag should add the message for Melee Weapon Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual(["message.attack.mwak message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("attack with message.attack.mwak flag should not add the message for Ranged Weapon Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("rwak", "dex");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("attack with message.attack.cha flag should add the message for Charisma Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha message",
    ]);
    const item = createItem("rsak", "cha");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual(["message.attack.cha message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("attack with message.attack.cha flag should not add the message for Intelligence Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha",
    ]);
    const item = createItem("rsak", "int");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("attack with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.attack.all", "first"],
      ["flags.adv-reminder.message.attack.mwak", "second"]
    );
    const item = createItem("mwak", "str");

    const messages = await new AttackMessage(actor, item).addMessage();

    expect(messages).toStrictEqual(["first", "second"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });
});
