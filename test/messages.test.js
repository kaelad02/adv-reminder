import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  DamageMessage,
  DeathSaveMessage,
  SkillMessage,
} from "../src/messages";

// fakes
globalThis.renderTemplate = () => "";
globalThis.setProperty = (object, key, value) => {
  // split the key into parts, removing the last one
  const parts = key.split(".");
  const lastProp = parts.pop();
  // recursively create objects out the key parts
  const lastObj = parts.reduce((obj, prop) => {
    if (!obj.hasOwnProperty(prop)) obj[prop] = {};
    return obj[prop];
  }, object);
  // set the value using the last key part
  lastObj[lastProp] = value;
};

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
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("attack with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("attack with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });
});

describe("AttackMessage message flags", () => {
  test("attack with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("attack with message.attack.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.all",
      "message.attack.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.attack.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("attack with message.attack.mwak flag should add the message for Melee Weapon Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.attack.mwak message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("attack with message.attack.mwak flag should not add the message for Ranged Weapon Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("attack with message.attack.cha flag should add the message for Charisma Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha message",
    ]);
    const item = createItem("rsak", "cha");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.attack.cha message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("attack with message.attack.cha flag should not add the message for Intelligence Attack", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha",
    ]);
    const item = createItem("rsak", "int");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("attack with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.attack.all", "first"],
      ["flags.adv-reminder.message.attack.mwak", "second"]
    );
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new AttackMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });
});

describe("AbilityCheckMessage no legit active effects", () => {
  test("ability check with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("ability check with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("ability check with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });
});

describe("AbilityCheckMessage message flags", () => {
  test("ability check with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("ability check with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("ability check with message.ability.check.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.check.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("ability check with message.ability.check.int flag should add the message for Intelligence Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int message",
    ]);
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.check.int message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("ability check with message.ability.check.int flag should not add the message for Dexterity Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int",
    ]);
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "dex").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("ability check with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.all", "first"],
      ["flags.adv-reminder.message.ability.check.dex", "second"]
    );
    const options = {};

    const messages = await new AbilityCheckMessage(actor, "dex").addMessage(
      options
    );

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });
});

describe("AbilitySaveMessage no legit active effects", () => {
  test("saving throw with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("saving throw with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("saving throw with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });
});

describe("AbilitySaveMessage message flags", () => {
  test("saving throw with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("saving throw with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("saving throw with message.ability.save.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.all",
      "message.ability.save.all message",
    ]);
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.save.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("saving throw with message.ability.save.int flag should add the message for Intelligence Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int message",
    ]);
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "int").addMessage(
      options
    );

    expect(messages).toStrictEqual(["message.ability.save.int message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("saving throw with message.ability.save.int flag should not add the message for Dexterity Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int",
    ]);
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "dex").addMessage(
      options
    );

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("saving throw with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.save.all", "first"],
      ["flags.adv-reminder.message.ability.save.dex", "second"]
    );
    const options = {};

    const messages = await new AbilitySaveMessage(actor, "dex").addMessage(
      options
    );

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });
});

describe("SkillMessage no legit active effects", () => {
  test("skill check with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const options = {};

    const messages = await new SkillMessage(actor, "ath").addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("skill check with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const options = {};

    const messages = await new SkillMessage(actor, "ath").addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("skill check with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const options = {};

    const messages = await new SkillMessage(actor, "ath").addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });
});

describe("SkillMessage message flags", () => {
  test("skill check with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.ability.check.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.ability.check.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.ability.check.wis flag should add the message for Perception Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.ability.check.int message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.ability.check.wis flag should not add the message for Acrobatics Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "acr").addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("skill check with message.skill.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.all",
      "message.skill.all message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.skill.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.skill.prc flag should add the message for Perception Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "prc").addMessage(options);

    expect(messages).toStrictEqual(["message.skill.prc message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("skill check with message.skill.prc flag should not add the message for Nature Check", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);
    const options = {};

    const messages = await new SkillMessage(actor, "nat").addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("skill check with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.dex", "first"],
      ["flags.adv-reminder.message.skill.ste", "second"]
    );
    const options = {};

    const messages = await new SkillMessage(actor, "ste").addMessage(options);

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });
});

describe("DeathSaveMessage no legit active effects", () => {
  test("death save with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("death save with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });

  test("death save with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.dialogOptions).toBeUndefined();
  });
});

describe("DeathSaveMessage message flags", () => {
  test("death save with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("death save with message.ability.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual(["message.ability.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("death save with message.ability.save.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.all",
      "message.ability.save.all message",
    ]);
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual(["message.ability.save.all message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("death save with message.deathSave flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.deathSave",
      "message.deathSave message",
    ]);
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual(["message.deathSave message"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("death save with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.save.all", "first"],
      ["flags.adv-reminder.message.deathSave", "second"]
    );
    const options = {};

    const messages = await new DeathSaveMessage(actor).addMessage(options);

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.dialogOptions["adv-reminder"].message).toBe("");
  });
});

describe("DamageMessage no legit active effects", () => {
  test("damage with no active effects should not add a message", async () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.options?.dialogOptions).toBeUndefined();
  });

  test("damage with a suppressed active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].isSuppressed = true;
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.options?.dialogOptions).toBeUndefined();
  });

  test("damage with a disabled active effect should not add a message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "some message",
    ]);
    actor.effects[0].data.disabled = true;
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.options?.dialogOptions).toBeUndefined();
  });
});

describe("DamageMessage message flags", () => {
  test("damage with message.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.all",
      "message.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.all message"]);
    expect(options.options?.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("damage with message.damage.all flag should add the message", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.all",
      "message.damage.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.damage.all message"]);
    expect(options.options?.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("damage with message.damage.mwak flag should add the message for Melee Weapon damage", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["message.damage.mwak message"]);
    expect(options.options?.dialogOptions["adv-reminder"].message).toBe("");
  });

  test("damage with message.damage.mwak flag should not add the message for Ranged Weapon damage", async () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual([]);
    expect(options.options?.dialogOptions).toBeUndefined();
  });

  test("damage with two messages should add both messages", async () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.damage.all", "first"],
      ["flags.adv-reminder.message.damage.mwak", "second"]
    );
    const item = createItem("mwak", "str");
    const options = {};

    const messages = await new DamageMessage(actor, item).addMessage(options);

    expect(messages).toStrictEqual(["first", "second"]);
    expect(options.options?.dialogOptions["adv-reminder"].message).toBe("");
  });
});
