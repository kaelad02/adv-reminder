import { describe, expect, test } from "@jest/globals";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  SkillReminder,
  DeathSaveReminder,
  CriticalReminder,
} from "../src/reminders";

function createActorWithEffects(...keys) {
  const effects = keys.map(createEffect);
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

function createEffect(key) {
  return {
    isSuppressed: false,
    data: {
      changes: [
        {
          key,
          value: "1",
          mode: 0,
          priority: "0",
          document: {
            data: {
              label: `label.${key}`
            }
          }
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

describe("AttackReminder no legit active effects", () => {
  test("attack with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects();
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].isSuppressed = true;
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].data.disabled = true;
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AttackReminder advantage flags", () => {
  test("attack with advantage.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with advantage.attack.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.attack.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with advantage.attack.mwak flag should be advantage for Melee Weapon Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.attack.mwak"
    );
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with advantage.attack.mwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.attack.mwak"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with advantage.attack.cha flag should be advantage for Charisma Attack", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.attack.cha");
    const item = createItem("rsak", "cha");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with advantage.attack.cha flag should be normal for Intelligence Attack", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.attack.cha");
    const item = createItem("rsak", "int");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with grants.advantage.attack.all flag should be advantage", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.advantage.attack.all"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with grants.advantage.attack.rwak flag should be advantage for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.advantage.attack.rwak"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with grants.advantage.attack.rwak flag should be advantage for Ranged Spell Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.advantage.attack.rwak"
    );
    const item = createItem("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AttackReminder disadvantage flags", () => {
  test("attack with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.disadvantage.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined;
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.all flag should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.attack.all"
    );
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.mwak flag should be disadvantage for Melee Weapon Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.attack.mwak"
    );
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.mwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.attack.mwak"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with disadvantage.attack.cha flag should be disadvantage for Charisma Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.attack.cha"
    );
    const item = createItem("rsak", "cha");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with disadvantage.attack.cha flag should be normal for Intelligence Attack", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.attack.cha"
    );
    const item = createItem("rsak", "int");
    const options = {};

    const reminder = new AttackReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with grants.disadvantage.attack.all flag should be disadvantage", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.all"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with grants.disadvantage.attack.rwak flag should be disadvantage for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.rwak"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with grants.disadvantage.attack.rwak flag should be disadvantage for Ranged Spell Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.rwak"
    );
    const item = createItem("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AttackReminder both advantage and disadvantage flags", () => {
  test("attack with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.attack.rsak"
    );
    // simulates Dodge
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.all"
    );
    const item = createItem("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("attack with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.attack.mwak"
    );
    // simulates Dodge
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.all"
    );
    const item = createItem("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("attack with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.attack.rsak"
    );
    // simulates Dodge
    const target = createActorWithEffects(
      "flags.midi-qol.grants.disadvantage.attack.mwak"
    );
    const item = createItem("rsak", "wis");
    const options = {};

    const reminder = new AttackReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilityCheckReminder no legit active effects", () => {
  test("ability check with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].isSuppressed = true;
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].data.disabled = true;
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilityCheckReminder advantage flags", () => {
  test("ability check with advantage.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with advantage.ability.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.all"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with advantage.ability.check.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.all"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with advantage.ability.check.str should be advantage for str check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.str"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with advantage.ability.check.str should be normal for con check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.str"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilityCheckReminder disadvantage flags", () => {
  test("ability check with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.all"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.all"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.str should be disadvantage for str check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.str"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with disadvantage.ability.check.str should be normal for con check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.str"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilityCheckReminder both advantage and disadvantage flags", () => {
  test("ability check with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.all",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("ability check with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.str",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("ability check with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.str",
      "flags.midi-qol.disadvantage.ability.check.cha"
    );
    const options = {};

    const reminder = new AbilityCheckReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilitySaveReminder no legit active effects", () => {
  test("saving throw with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].isSuppressed = true;
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].data.disabled = true;
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilitySaveReminder advantage flags", () => {
  test("saving throw with advantage.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with advantage.ability.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.all"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with advantage.ability.save.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.all"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with advantage.ability.save.wis should be advantage for wis save", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.wis"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with advantage.ability.save.wis should be normal for dex save", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.wis"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "dex");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilitySaveReminder disadvantage flags", () => {
  test("saving throw with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.all"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.save.all"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.wis should be disadvantage for wis save", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.save.wis"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "wis");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with disadvantage.ability.save.wis should be normal for con save", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.save.wis"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "con");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("AbilitySaveReminder both advantage and disadvantage flags", () => {
  test("saving throw with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.all",
      "flags.midi-qol.disadvantage.ability.save.dex"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "dex");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("saving throw with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.str",
      "flags.midi-qol.disadvantage.ability.save.cha"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "cha");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("saving throw with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.str",
      "flags.midi-qol.disadvantage.ability.save.cha"
    );
    const options = {};

    const reminder = new AbilitySaveReminder(actor, "str");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("SkillReminder no legit active effects", () => {
  test("skill check with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].isSuppressed = true;
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].data.disabled = true;
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("Stealth check with armor that imposes disadvantage but wrong type", () => {
    const actor = createActorWithEffects();
    actor.items = [
      {
        type: "spell",
        data: {
          data: {
            equipped: true,
            stealth: true,
          },
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("Stealth check with armor that imposes disadvantage but not equipped", () => {
    const actor = createActorWithEffects();
    actor.items = [
      {
        type: "equipment",
        data: {
          data: {
            equipped: false,
            stealth: true,
          },
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("SkillReminder advantage flags", () => {
  test("skill check with advantage.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.ability.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.all"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.ability.check.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.all"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.ability.check.wis should be advantage for prc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.wis"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.ability.check.wis should be normal for arc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.check.wis"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.skill.all should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.skill.all");
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.skill.prc should be advantage for prc check", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with advantage.skill.prc should be normal for arc check", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.skill.prc");
    const options = {};

    const reminder = new SkillReminder(actor, "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("SkillReminder disadvantage flags", () => {
  test("skill check with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.all"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.all"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.wis should be disadvantage for prc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.wis"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.ability.check.wis should be normal for arc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.check.wis"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with disadvantage.skill.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.skill.all"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.skill.prc should be disadvantage for prc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with disadvantage.skill.prc should be normal for arc check", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "arc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("Stealth check with armor that imposes disadvantage", () => {
    const actor = createActorWithEffects();
    actor.items = [
      {
        type: "equipment",
        data: {
          data: {
            equipped: true,
            stealth: true,
          },
        },
      },
    ];
    const options = {};

    const reminder = new SkillReminder(actor, "ste");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });
});

describe("SkillReminder both advantage and disadvantage flags", () => {
  test("skill check with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.skill.all",
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("skill check with wrong advantage and same disadvantage should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.skill.ath",
      "flags.midi-qol.disadvantage.skill.prc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("skill check with same advantage and wrong disadvantage should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.skill.prc",
      "flags.midi-qol.disadvantage.skill.arc"
    );
    const options = {};

    const reminder = new SkillReminder(actor, "prc");
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("DeathSaveReminder no legit active effects", () => {
  test("death save with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("death save with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].isSuppressed = true;
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("death save with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    actor.effects[0].data.disabled = true;
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("DeathSaveReminder advantage flags", () => {
  test("death save with advantage.all flag should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("death save with advantage.ability.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.all"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("death save with advantage.ability.save.all should be advantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.all"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });

  test("death save with advantage.deathSave should be advantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.advantage.deathSave");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBe(true);
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("DeathSaveReminder disadvantage flags", () => {
  test("death save with disadvantage.all flag should be disadvantage", () => {
    const actor = createActorWithEffects("flags.midi-qol.disadvantage.all");
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.ability.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.all"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.ability.save.all should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.ability.save.all"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });

  test("death save with disadvantage.deathSave should be disadvantage", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.disadvantage.deathSave"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBe(true);
  });
});

describe("DeathSaveReminder both advantage and disadvantage flags", () => {
  test("death save with both advantage and disadvantage should be normal", () => {
    const actor = createActorWithEffects(
      "flags.midi-qol.advantage.ability.save.all",
      "flags.midi-qol.disadvantage.deathSave"
    );
    const options = {};

    const reminder = new DeathSaveReminder(actor);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("CriticalReminder no legit active effects", () => {
  test("damage roll with no active effects should be normal", () => {
    const actor = createActorWithEffects();
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("damage roll with a suppressed active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.critical.all");
    const item = createItem("mwak", "str");
    actor.effects[0].isSuppressed = true;
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });

  test("damage roll with a disabled active effect should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.critical.all");
    const item = createItem("mwak", "str");
    actor.effects[0].data.disabled = true;
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.advantage).toBeUndefined();
    expect(options.disadvantage).toBeUndefined();
  });
});

describe("CriticalReminder critical flags", () => {
  test("damage roll with critical.all flag should be critical", () => {
    const actor = createActorWithEffects("flags.midi-qol.critical.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(true);
  });

  test("damage roll with critical.mwak flag should be critical for Melee Weapon Attack", () => {
    const actor = createActorWithEffects("flags.midi-qol.critical.mwak");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(true);
  });

  test("damage roll with critical.rsak flag should be normal for Melee Weapon Attack", () => {
    const actor = createActorWithEffects("flags.midi-qol.critical.rsak");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });

  test("damage roll with grants.critical.all flag should be critical", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects("flags.midi-qol.grants.critical.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(true);
  });

  test("damage roll with grants.critical.rwak flag should be critical for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.critical.rwak"
    );
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(true);
  });

  test("damage roll with grants.critical.rwak flag should be normal for Melee Spell Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects(
      "flags.midi-qol.grants.critical.rwak"
    );
    const item = createItem("msak", "int");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });
});

describe("CriticalReminder no critical flags", () => {
  test("damage roll with noCritical.all flag should be normal", () => {
    const actor = createActorWithEffects("flags.midi-qol.noCritical.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });

  test("damage roll with noCritical.mwak flag should be normal for Melee Weapon Attack", () => {
    const actor = createActorWithEffects("flags.midi-qol.noCritical.mwak");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, null, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });

  test("damage roll with fail.critical.all flag should be normal", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects("flags.midi-qol.fail.critical.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });

  test("damage roll with fail.critical.rwak flag should be normal for Ranged Weapon Attack", () => {
    const actor = createActorWithEffects();
    const target = createActorWithEffects("flags.midi-qol.fail.critical.rwak");
    const item = createItem("rwak", "dex");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });
});

describe("CriticalReminder both critical and no critical flags", () => {
  test("damage roll with critical on actor and no critical on target should be normal", () => {
    // critical on weapon attacks
    const actor = createActorWithEffects(
      "flags.midi-qol.critical.mwak",
      "flags.midi-qol.critical.rwak"
    );
    // cancel all crits, like Adamantine Armor
    const target = createActorWithEffects("flags.midi-qol.fail.critical.all");
    const item = createItem("mwak", "str");
    const options = {};

    const reminder = new CriticalReminder(actor, target, item);
    reminder.updateOptions(options);

    expect(options.critical).toBe(false);
  });
});
