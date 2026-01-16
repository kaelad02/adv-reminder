import { beforeAll, describe, expect, test } from "@jest/globals";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  SkillReminder,
  DeathSaveReminder,
  CriticalReminder,
} from "../src/reminders";
import commonTestInit from "./common.js";

function createActivity(actionType, ability) {
  return { actionType, ability };
}

beforeAll(() => {
  commonTestInit();
});

describe("AttackReminder no legit active effects", () => {
  test("attack with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags();
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AttackReminder advantage flags", () => {
  test("attack with advantage.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with advantage.attack.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with advantage.attack.mwak flag should be advantage for Melee Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.mwak");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with advantage.attack.mwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.mwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with advantage.attack.cha flag should be advantage for Charisma Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.cha");
    const activity = createActivity("rsak", "cha");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with advantage.attack.cha flag should be normal for Intelligence Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.cha");
    const activity = createActivity("rsak", "int");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with grants.advantage.attack.all flag should be advantage", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.advantage.attack.all");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with grants.advantage.attack.rwak flag should be advantage for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.advantage.attack.rwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with grants.advantage.attack.rwak flag should be advantage for Ranged Spell Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.advantage.attack.rwak");
    const activity = createActivity("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AttackReminder disadvantage flags", () => {
  test("attack with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined;
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.attack.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.mwak flag should be disadvantage for Melee Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.attack.mwak");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.mwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.attack.mwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with disadvantage.attack.cha flag should be disadvantage for Charisma Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.attack.cha");
    const activity = createActivity("rsak", "cha");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.cha flag should be normal for Intelligence Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.attack.cha");
    const activity = createActivity("rsak", "int");
    const options = {};

    const reminder = new AttackReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with grants.disadvantage.attack.all flag should be disadvantage", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.all");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with grants.disadvantage.attack.rwak flag should be disadvantage for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.rwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with grants.disadvantage.attack.rwak flag should be disadvantage for Ranged Spell Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.rwak");
    const activity = createActivity("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AttackReminder both advantage and disadvantage flags", () => {
  test("attack with both advantage and disadvantage has both set to false", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.rsak");
    // simulates Dodge
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.all");
    const activity = createActivity("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("attack with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.mwak");
    // simulates Dodge
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.all");
    const activity = createActivity("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("attack with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.attack.rsak");
    // simulates Dodge
    const target = createActorWithFlags("flags.midi-qol.grants.disadvantage.attack.mwak");
    const activity = createActivity("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilityCheckReminder no legit active effects", () => {
  test("ability check with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilityCheckReminder advantage flags", () => {
  test("ability check with advantage.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("ability check with advantage.ability.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("ability check with advantage.ability.check.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("ability check with advantage.ability.check.str should be advantage for str check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.str");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("ability check with advantage.ability.check.str should be normal for con check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.str");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilityCheckReminder disadvantage flags", () => {
  test("ability check with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.str should be disadvantage for str check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.str");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.str should be normal for con check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.str");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilityCheckReminder both advantage and disadvantage flags", () => {
  test("ability check with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.check.all",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("ability check with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.check.str",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.check.str",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilitySaveReminder no legit active effects", () => {
  test("saving throw with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilitySaveReminder advantage flags", () => {
  test("saving throw with advantage.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("saving throw with advantage.ability.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("saving throw with advantage.ability.save.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.save.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("saving throw with advantage.ability.save.wis should be advantage for wis save", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.save.wis");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("saving throw with advantage.ability.save.wis should be normal for dex save", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.save.wis");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "dex");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilitySaveReminder disadvantage flags", () => {
  test("saving throw with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.save.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.wis should be disadvantage for wis save", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.save.wis");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.wis should be normal for con save", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.save.wis");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("AbilitySaveReminder both advantage and disadvantage flags", () => {
  test("saving throw with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.save.all",
      "flags.midi-qol.disadvantage.ability.save.dex"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "dex");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("saving throw with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.save.str",
      "flags.midi-qol.disadvantage.ability.save.cha"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.save.str",
      "flags.midi-qol.disadvantage.ability.save.cha"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });
});

describe("SkillReminder no legit active effects", () => {
  test("skill check with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("Stealth check with armor that imposes disadvantage but wrong type", () => {
    const actor = createActorWithFlags();
    actor.items = [
      {
        name: "Scale Mail",
        type: "spell",
        system: {
          equipped: true,
          properties: new Set(["stealthDisadvantage"]),
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "dex", "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("Stealth check with armor that imposes disadvantage but not equipped", () => {
    const actor = createActorWithFlags();
    actor.items = [
      {
        name: "Scale Mail",
        type: "equipment",
        system: {
          equipped: false,
          properties: new Set(["stealthDisadvantage"]),
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "dex", "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("SkillReminder advantage flags", () => {
  test("skill check with advantage.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.ability.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.ability.check.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.ability.check.wis should be advantage for prc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.wis");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.ability.check.wis should be normal for arc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.check.wis");
    const options = {};

    const reminder = new SkillReminder(actor, "int", "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.skill.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.skill.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.skill.prc should be advantage for prc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with advantage.skill.prc should be normal for arc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "int", "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("SkillReminder disadvantage flags", () => {
  test("skill check with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.wis should be disadvantage for prc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.wis");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.wis should be normal for arc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.check.wis");
    const options = {};

    const reminder = new SkillReminder(actor, "int", "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with disadvantage.skill.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.skill.all");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.skill.prc should be disadvantage for prc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.skill.prc should be normal for arc check", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "int", "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("Stealth check with armor that imposes disadvantage", () => {
    const actor = createActorWithFlags();
    actor.items = [
      {
        name: "Scale Mail",
        type: "equipment",
        system: {
          equipped: true,
          properties: new Set(["stealthDisadvantage"]),
        },
        link: "@UUID[fake-uuid]{Scale Mail}",
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "dex", "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("Stealth check with armor that imposes disadvantage but checking is off", () => {
    const actor = createActorWithFlags();
    actor.items = [
      {
        name: "Scale Mail",
        type: "equipment",
        system: {
          equipped: true,
          properties: new Set(["stealthDisadvantage"]),
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "dex", "ste", false);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("SkillReminder both advantage and disadvantage flags", () => {
  test("skill check with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.skill.all",
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });

  test("skill check with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.skill.ath",
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.skill.prc",
      "flags.midi-qol.disadvantage.skill.arc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "wis", "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });
});

describe("DeathSaveReminder no legit active effects", () => {
  test("death save with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("DeathSaveReminder advantage flags", () => {
  test("death save with advantage.all flag should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("death save with advantage.ability.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("death save with advantage.ability.save.all should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.ability.save.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });

  test("death save with advantage.deathSave should be advantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.advantage.deathSave");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBe(false);
  });
});

describe("DeathSaveReminder disadvantage flags", () => {
  test("death save with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.ability.save.all should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.ability.save.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.deathSave should be disadvantage", () => {
    const actor = createActorWithFlags("flags.midi-qol.disadvantage.deathSave");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(true);
  });
});

describe("DeathSaveReminder both advantage and disadvantage flags", () => {
  test("death save with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithFlags(
      "flags.midi-qol.advantage.ability.save.all",
      "flags.midi-qol.disadvantage.deathSave"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(false);
    expect(options.disadvantage).toBe(false);
  });
});

describe("CriticalReminder no legit active effects", () => {
  test("damage roll with no active effects should be normal", () => {
    const actor = createActorWithFlags();
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });
});

describe("CriticalReminder critical flags", () => {
  test("damage roll with critical.all flag should be critical", () => {
    const actor = createActorWithFlags("flags.midi-qol.critical.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(true);
  });

  test("damage roll with critical.mwak flag should be critical for Melee Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.critical.mwak");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(true);
  });

  test("damage roll with critical.rsak flag should be normal for Melee Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.critical.rsak");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });

  test("damage roll with grants.critical.all flag should be critical", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.critical.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(true);
  });

  test("damage roll with grants.critical.rwak flag should be critical for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.critical.rwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(true);
  });

  test("damage roll with grants.critical.rwak flag should be normal for Melee Spell Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.grants.critical.rwak");
    const activity = createActivity("msak", "int");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });
});

describe("CriticalReminder no critical flags", () => {
  test("damage roll with noCritical.all flag should be normal", () => {
    const actor = createActorWithFlags("flags.midi-qol.noCritical.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });

  test("damage roll with noCritical.mwak flag should be normal for Melee Weapon Attack", () => {
    const actor = createActorWithFlags("flags.midi-qol.noCritical.mwak");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });

  test("damage roll with fail.critical.all flag should be normal", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.fail.critical.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });

  test("damage roll with fail.critical.rwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithFlags();
    const target = createActorWithFlags("flags.midi-qol.fail.critical.rwak");
    const activity = createActivity("rwak", "dex");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });
});

describe("CriticalReminder both critical and no critical flags", () => {
  test("damage roll with critical on actor and no critical on target should be normal", () => {
    // critical on weapon attacks
    const actor = createActorWithFlags(
      "flags.midi-qol.critical.mwak",
      "flags.midi-qol.critical.rwak"
    );
    // cancel all crits, like Adamantine Armor
    const target = createActorWithFlags("flags.midi-qol.fail.critical.all");
    const activity = createActivity("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, activity);
    reminder.updateOptions(options);

    expect(options.isCritical).toBe(false);
  });
});
