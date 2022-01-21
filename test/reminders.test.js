import { describe, expect, test } from "@jest/globals";
import { AbilityCheckReminder, AbilitySaveReminder } from "../src/reminders";

function createActorWithEffects(...keys) {
  const effects = keys.map(createEffect);
  return { effects };
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
        },
      ],
      disabled: false,
    },
  };
}

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
