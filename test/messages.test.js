import { describe, expect, test } from "@jest/globals";
import { AttackMessage } from "../src/messages";

// fake verion of Hooks.once
globalThis.Hooks = {};
globalThis.Hooks.once = () => {};

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
  test("attack with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBeNull();
  });

  test("attack with a suppressed active effect should not add a message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBeNull();
  });

  test("attack with a disabled active effect should not add a message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBeNull();
  });
});

describe("AttackMessage message flags", () => {
  test("attack with message.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBe("message.all message");
  });

  test("attack with message.attack.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.all",
      "message.attack.all message",
    ]);
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBe("message.attack.all message");
  });

  test("attack with message.attack.mwak flag should add the message for Melee Weapon Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("mwak", "str");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBe("message.attack.mwak message");
  });

  test("attack with message.attack.mwak flag should not add the message for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("rwak", "dex");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBeNull();
  });

  test("attack with message.attack.cha flag should add the message for Charisma Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha message",
    ]);
    const item = createItem("rsak", "cha");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBe("message.attack.cha message");
  });

  test("attack with message.attack.cha flag should not add the message for Intelligence Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha",
    ]);
    const item = createItem("rsak", "int");

    const message = new AttackMessage(actor, item).addMessage();

    expect(message).toBeNull();
  });
});
