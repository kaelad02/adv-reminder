import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  DamageMessage,
  DeathSaveMessage,
  SkillMessage,
} from "../src/messages";
import commonTestInit from "./common.js";

function createActorWithEffects(...keyValuePairs) {
  const appliedEffects = keyValuePairs.map(createEffect);
  return {
    appliedEffects,
    getRollData: () => ({}),
  };
}

function createEffect([key, value]) {
  return {
    changes: [
      {
        key,
        value,
        mode: 0,
        priority: "0",
      },
    ]
  };
}

function createItem(actionType, abilityMod) {
  return {
    abilityMod,
    system: {
      actionType,
    },
  };
}

beforeAll(() => {
  commonTestInit();
});

describe("AttackMessage no legit active effects", () => {
  test("attack with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("AttackMessage message flags", () => {
  test("attack with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("attack with message.attack.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.all",
      "message.attack.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.all message",
    ]);
  });

  test("attack with message.attack.mwak flag should add the message for Melee Weapon Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.mwak message",
    ]);
  });

  test("attack with message.attack.mwak flag should not add the message for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("attack with message.attack.cha flag should add the message for Charisma Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha message",
    ]);
    const item = createItem("rsak", "cha");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.cha message",
    ]);
  });

  test("attack with message.attack.cha flag should not add the message for Intelligence Attack", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.attack.cha",
      "message.attack.cha",
    ]);
    const item = createItem("rsak", "int");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("attack with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.attack.all", "first"],
      ["flags.adv-reminder.message.attack.mwak", "second"]
    );
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("AttackMessage from target", () => {
  test("attack with message.attack.all flag should add the message", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.all",
      "message.attack.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.all message",
    ]);
  });

  test("attack with message.attack.mwak flag should add the message for Melee Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.mwak message",
    ]);
  });

  test("attack with message.attack.mwak flag should not add the message for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.mwak",
      "message.attack.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("attack with message.attack.cha flag should add the message for Charisma Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.cha",
      "message.attack.cha message",
    ]);
    const item = createItem("rsak", "cha");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.attack.cha message",
    ]);
  });

  test("attack with message.attack.cha flag should not add the message for Intelligence Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.cha",
      "message.attack.cha",
    ]);
    const item = createItem("rsak", "int");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("attack with two messages should add both messages", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.attack.all", "first"]);
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.attack.mwak",
      "second",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new AttackMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("AbilityCheckMessage no legit active effects", () => {
  test("ability check with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const options = {};

    new AbilityCheckMessage(actor, "int").addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("AbilityCheckMessage message flags", () => {
  test("ability check with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const options = {};

    new AbilityCheckMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("ability check with message.ability.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    new AbilityCheckMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.all message",
    ]);
  });

  test("ability check with message.ability.check.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);
    const options = {};

    new AbilityCheckMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.check.all message",
    ]);
  });

  test("ability check with message.ability.check.int flag should add the message for Intelligence Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int message",
    ]);
    const options = {};

    new AbilityCheckMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.check.int message",
    ]);
  });

  test("ability check with message.ability.check.int flag should not add the message for Dexterity Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.int",
      "message.ability.check.int",
    ]);
    const options = {};

    new AbilityCheckMessage(actor, "dex").addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("ability check with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.all", "first"],
      ["flags.adv-reminder.message.ability.check.dex", "second"]
    );
    const options = {};

    new AbilityCheckMessage(actor, "dex").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("AbilitySaveMessage no legit active effects", () => {
  test("saving throw with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const options = {};

    new AbilitySaveMessage(actor, "int").addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("AbilitySaveMessage message flags", () => {
  test("saving throw with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const options = {};

    new AbilitySaveMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("saving throw with message.ability.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    new AbilitySaveMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.all message",
    ]);
  });

  test("saving throw with message.ability.save.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.all",
      "message.ability.save.all message",
    ]);
    const options = {};

    new AbilitySaveMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.save.all message",
    ]);
  });

  test("saving throw with message.ability.save.int flag should add the message for Intelligence Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int message",
    ]);
    const options = {};

    new AbilitySaveMessage(actor, "int").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.save.int message",
    ]);
  });

  test("saving throw with message.ability.save.int flag should not add the message for Dexterity Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.int",
      "message.ability.save.int",
    ]);
    const options = {};

    new AbilitySaveMessage(actor, "dex").addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("saving throw with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.save.all", "first"],
      ["flags.adv-reminder.message.ability.save.dex", "second"]
    );
    const options = {};

    new AbilitySaveMessage(actor, "dex").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("SkillMessage no legit active effects", () => {
  test("skill check with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const options = {};

    new SkillMessage(actor, "str", "ath").addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("SkillMessage message flags", () => {
  test("skill check with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("skill check with message.ability.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.all message",
    ]);
  });

  test("skill check with message.ability.check.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.all",
      "message.ability.check.all message",
    ]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.check.all message",
    ]);
  });

  test("skill check with message.ability.check.wis flag should add the message for Perception Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int message",
    ]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.check.int message",
    ]);
  });

  test("skill check with message.ability.check.wis flag should not add the message for Acrobatics Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.check.wis",
      "message.ability.check.int",
    ]);
    const options = {};

    new SkillMessage(actor, "dex", "acr").addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("skill check with message.skill.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.all",
      "message.skill.all message",
    ]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.skill.all message",
    ]);
  });

  test("skill check with message.skill.prc flag should add the message for Perception Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);
    const options = {};

    new SkillMessage(actor, "wis", "prc").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.skill.prc message",
    ]);
  });

  test("skill check with message.skill.prc flag should not add the message for Nature Check", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.skill.prc",
      "message.skill.prc message",
    ]);
    const options = {};

    new SkillMessage(actor, "int", "nat").addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("skill check with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.check.dex", "first"],
      ["flags.adv-reminder.message.skill.ste", "second"]
    );
    const options = {};

    new SkillMessage(actor, "dex", "ste").addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("DeathSaveMessage no legit active effects", () => {
  test("death save with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("DeathSaveMessage message flags", () => {
  test("death save with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("death save with message.ability.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.all",
      "message.ability.all message",
    ]);
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.all message",
    ]);
  });

  test("death save with message.ability.save.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.ability.save.all",
      "message.ability.save.all message",
    ]);
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.ability.save.all message",
    ]);
  });

  test("death save with message.deathSave flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.deathSave",
      "message.deathSave message",
    ]);
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.deathSave message",
    ]);
  });

  test("death save with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.ability.save.all", "first"],
      ["flags.adv-reminder.message.deathSave", "second"]
    );
    const options = {};

    new DeathSaveMessage(actor).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("DamageMessage no legit active effects", () => {
  test("damage with no active effects should not add a message", () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });
});

describe("DamageMessage message flags", () => {
  test("damage with message.all flag should add the message", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.all", "message.all message"]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["message.all message"]);
  });

  test("damage with message.damage.all flag should add the message", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.all",
      "message.damage.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.damage.all message",
    ]);
  });

  test("damage with message.damage.mwak flag should add the message for Melee Weapon damage", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.damage.mwak message",
    ]);
  });

  test("damage with message.damage.mwak flag should not add the message for Ranged Weapon damage", () => {
    const actor = createActorWithEffects([
      "flags.adv-reminder.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("damage with two messages should add both messages", () => {
    const actor = createActorWithEffects(
      ["flags.adv-reminder.message.damage.all", "first"],
      ["flags.adv-reminder.message.damage.mwak", "second"]
    );
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, undefined, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});

describe("DamageMessage from target", () => {
  test("damage with message.damage.all flag should add the message", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.damage.all",
      "message.damage.all message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.damage.all message",
    ]);
  });

  test("damage with message.damage.mwak flag should add the message for Melee Weapon damage", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual([
      "message.damage.mwak message",
    ]);
  });

  test("damage with message.damage.mwak flag should not add the message for Ranged Weapon damage", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.damage.mwak",
      "message.damage.mwak message",
    ]);
    const item = createItem("rwak", "dex");
    const options = {};

    new DamageMessage(actor, target, item).addMessage(options);

    expect(options.options).toBeUndefined();
  });

  test("damage with two messages should add both messages", () => {
    const actor = createActorWithEffects(["flags.adv-reminder.message.damage.all", "first"]);
    const target = createActorWithEffects([
      "flags.adv-reminder.grants.message.damage.mwak",
      "second",
    ]);
    const item = createItem("mwak", "str");
    const options = {};

    new DamageMessage(actor, target, item).addMessage(options);

    expect(options.options["adv-reminder"].messages).toStrictEqual(["first", "second"]);
  });
});
