import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  SkillMessage,
} from "../src/messages";

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

describe("AbilityCheckMessage no legit active effects", () => {
  test("ability check with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("ability check with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("ability check with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });
});

describe("AbilityCheckMessage message flags", () => {
  test("ability check with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("ability check with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("ability check with message.ability.check.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.check.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("ability check with message.ability.check.int flag should add the message for Intelligence Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int message",
    ]);

    const messages = await new AbilityCheckMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.check.int message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("ability check with message.ability.check.int flag should not add the message for Dexterity Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int",
    ]);

    const messages = await new AbilityCheckMessage(actor, "dex").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("ability check with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.all", "first"],
      ["flags.adv-reminder.message.ability.check.dex", "second"]
    );

    const messages = await new AbilityCheckMessage(actor, "dex").addMessage();

    expect(messages).toStrictEqual(["first", "second"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });
});

describe("AbilitySaveMessage no legit active effects", () => {
  test("saving throw with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("saving throw with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("saving throw with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });
});

describe("AbilitySaveMessage message flags", () => {
  test("saving throw with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("saving throw with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("saving throw with message.ability.save.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.all",
      "message.ability.save.all message",
    ]);

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.save.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("saving throw with message.ability.save.int flag should add the message for Intelligence Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int message",
    ]);

    const messages = await new AbilitySaveMessage(actor, "int").addMessage();

    expect(messages).toStrictEqual(["message.ability.save.int message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("saving throw with message.ability.save.int flag should not add the message for Dexterity Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int",
    ]);

    const messages = await new AbilitySaveMessage(actor, "dex").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("saving throw with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.save.all", "first"],
      ["flags.adv-reminder.message.ability.save.dex", "second"]
    );

    const messages = await new AbilitySaveMessage(actor, "dex").addMessage();

    expect(messages).toStrictEqual(["first", "second"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });
});

describe("SkillMessage no legit active effects", () => {
  test("skill check with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();

    const messages = await new SkillMessage(actor, "ath").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("skill check with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;

    const messages = await new SkillMessage(actor, "ath").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("skill check with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;

    const messages = await new SkillMessage(actor, "ath").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });
});

describe("SkillMessage message flags", () => {
  test("skill check with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.ability.check.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.ability.check.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.ability.check.wis flag should add the message for Perception Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.ability.check.int message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.ability.check.wis flag should not add the message for Acrobatics Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int",
    ]);

    const messages = await new SkillMessage(actor, "acr").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("skill check with message.skill.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.all",
      "message.skill.all message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.skill.all message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.skill.prc flag should add the message for Perception Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);

    const messages = await new SkillMessage(actor, "prc").addMessage();

    expect(messages).toStrictEqual(["message.skill.prc message"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });

  test("skill check with message.skill.prc flag should not add the message for Nature Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);

    const messages = await new SkillMessage(actor, "nat").addMessage();

    expect(messages).toStrictEqual([]);
    expect(onceMock).not.toBeCalled();
  });

  test("skill check with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.dex", "first"],
      ["flags.adv-reminder.message.skill.ste", "second"]
    );

    const messages = await new SkillMessage(actor, "ste").addMessage();

    expect(messages).toStrictEqual(["first", "second"]);
    expect(onceMock).toBeCalledWith("renderDialog", expect.anything());
  });
});
