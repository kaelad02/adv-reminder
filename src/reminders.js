import { debug } from "./util.js";

class BaseReminder {
  constructor(actor) {
    /** @type {string[]} */
    this.actorKeys = this._getActiveEffectKeys(actor);
  }

  /**
   * Get Midi QOL's active effect keys from an actor.
   * @param {Actor5e} actor the actor
   * @returns {string[]} an array of Midi QOL's active effects keys
   */
  _getActiveEffectKeys(actor) {
    return actor
      ? actor.effects
          .filter((effect) => !effect.isSuppressed && !effect.data.disabled)
          .flatMap((effect) => effect.data.changes)
          .map((change) => change.key)
          .filter((key) => key.startsWith("flags.midi-qol."))
      : [];
  }

  /**
   * An accumulator that looks for matching keys and tracks advantage/disadvantage.
   */
  _accumulator() {
    let advantage;
    let disadvantage;

    return {
      add: (actorKeys, advKeys, disKeys) => {
        actorKeys.forEach((key) => {
          if (advKeys.includes(key)) advantage = true;
          if (disKeys.includes(key)) disadvantage = true;
        });
      },
      disadvantage: (value) => {
        if (value) disadvantage = true;
      },
      update: (options) => {
        debug(
          `updating options with {advantage: ${advantage}, disadvantage: ${disadvantage}}`
        );
        // only set if adv or dis, the die roller doesn't handle when both are true correctly
        if (advantage && !disadvantage) options.advantage = true;
        else if (!advantage && disadvantage) options.disadvantage = true;
      },
    };
  }
}

export class AttackReminder extends BaseReminder {
  constructor(actor, targetActor, item) {
    super(actor);

    /** @type {string[]} */
    this.targetKeys = this._getActiveEffectKeys(targetActor);
    /** @type {string} */
    this.actionType = item.data.data.actionType;
    /** @type {string} */
    this.abilityId = item.abilityMod;
  }

  updateOptions(options) {
    // quick return if there are no active effects
    if (this.actorKeys.length == 0 && this.targetKeys.length == 0) return;

    // build the active effect keys applicable for this roll
    const advKeys = [
      "flags.midi-qol.advantage.all",
      "flags.midi-qol.advantage.attack.all",
      `flags.midi-qol.advantage.attack.${this.actionType}`,
      `flags.midi-qol.advantage.attack.${this.abilityId}`,
    ];
    const disKeys = [
      "flags.midi-qol.disadvantage.all",
      "flags.midi-qol.disadvantage.attack.all",
      `flags.midi-qol.disadvantage.attack.${this.actionType}`,
      `flags.midi-qol.disadvantage.attack.${this.abilityId}`,
    ];
    const grantsAdvKeys = [
      "flags.midi-qol.grants.advantage.attack.all",
      `flags.midi-qol.grants.advantage.attack.${this.actionType}`,
    ];
    const grantsDisKeys = [
      "flags.midi-qol.grants.disadvantage.attack.all",
      `flags.midi-qol.grants.disadvantage.attack.${this.actionType}`,
    ];

    // find matching keys and update options
    const accumulator = this._accumulator();
    accumulator.add(this.actorKeys, advKeys, disKeys);
    accumulator.add(this.targetKeys, grantsAdvKeys, grantsDisKeys);
    accumulator.update(options);
  }
}

class AbilityBaseReminder extends BaseReminder {
  constructor(actor, abilityId) {
    super(actor);

    /** @type {string} */
    this.abilityId = abilityId;
  }

  get advantageKeys() {
    return [
      "flags.midi-qol.advantage.all",
      "flags.midi-qol.advantage.ability.all",
    ];
  }

  get disadvantageKeys() {
    return [
      "flags.midi-qol.disadvantage.all",
      "flags.midi-qol.disadvantage.ability.all",
    ];
  }

  updateOptions(options) {
    // quick return if there are no active effects
    if (this.actorKeys.length == 0) return;

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);

    // find matching keys and update options
    const accumulator = this._accumulator();
    accumulator.add(this.actorKeys, advKeys, disKeys);
    accumulator.update(options);
  }
}

export class AbilityCheckReminder extends AbilityBaseReminder {
  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "flags.midi-qol.advantage.ability.check.all",
      `flags.midi-qol.advantage.ability.check.${this.abilityId}`,
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "flags.midi-qol.disadvantage.ability.check.all",
      `flags.midi-qol.disadvantage.ability.check.${this.abilityId}`,
    ]);
  }
}

export class AbilitySaveReminder extends AbilityBaseReminder {
  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "flags.midi-qol.advantage.ability.save.all",
      `flags.midi-qol.advantage.ability.save.${this.abilityId}`,
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "flags.midi-qol.disadvantage.ability.save.all",
      `flags.midi-qol.disadvantage.ability.save.${this.abilityId}`,
    ]);
  }
}

export class SkillReminder extends AbilityCheckReminder {
  constructor(actor, skillId, checkArmorStealth = true) {
    super(actor, actor.data.data.skills[skillId].ability);

    /** @type {string} */
    this.skillId = skillId;
    /** @type {Item5e[]} */
    this.items = actor.items;
    /** @type {boolean} */
    this.checkArmorStealth = checkArmorStealth;
  }

  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "flags.midi-qol.advantage.skill.all",
      `flags.midi-qol.advantage.skill.${this.skillId}`,
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "flags.midi-qol.disadvantage.skill.all",
      `flags.midi-qol.disadvantage.skill.${this.skillId}`,
    ]);
  }

  /** @override */
  updateOptions(options) {
    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);

    // find matching keys and update options
    const accumulator = this._accumulator();
    if (this.checkArmorStealth) {
      accumulator.disadvantage(this._armorStealthDisadvantage());
    }
    accumulator.add(this.actorKeys, advKeys, disKeys);
    accumulator.update(options);
  }

  /**
   * Check if the actor is wearing armor that imposes stealth disadvantage.
   * @returns true if they are wearing armor that imposes stealth disadvantage, false otherwise
   */
  _armorStealthDisadvantage() {
    if (this.skillId === "ste") {
      const item = this.items.find(
        (item) =>
          item.type === "equipment" &&
          item.data?.data?.equipped &&
          item.data?.data?.stealth
      );
      debug("equiped item that imposes stealth disadvantage", item?.name);
      return !!item;
    }
    return false;
  }
}

export class DeathSaveReminder extends AbilityBaseReminder {
  constructor(actor) {
    super(actor, null);
  }

  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "flags.midi-qol.advantage.ability.save.all",
      "flags.midi-qol.advantage.deathSave",
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "flags.midi-qol.disadvantage.ability.save.all",
      "flags.midi-qol.disadvantage.deathSave",
    ]);
  }
}

export class CriticalReminder extends BaseReminder {
  constructor(actor, targetActor, item) {
    super(actor);

    /** @type {string[]} */
    this.targetKeys = this._getActiveEffectKeys(targetActor);
    /** @type {string} */
    this.actionType = item.data.data.actionType;
  }

  updateOptions(options) {
    // quick return if there are no active effects
    if (this.actorKeys.length == 0 && this.targetKeys.length == 0) return;

    // build the active effect keys applicable for this roll
    const critKeys = [
      "flags.midi-qol.critical.all",
      `flags.midi-qol.critical.${this.actionType}`,
    ];
    const normalKeys = [
      "flags.midi-qol.noCritical.all",
      `flags.midi-qol.noCritical.${this.actionType}`,
    ];
    const grantsCritKeys = [
      "flags.midi-qol.grants.critical.all",
      `flags.midi-qol.grants.critical.${this.actionType}`,
    ];
    const grantsNormalKeys = [
      "flags.midi-qol.fail.critical.all",
      `flags.midi-qol.fail.critical.${this.actionType}`,
    ];

    // find matching keys and update options
    const accumulator = this._accumulator();
    accumulator.add(this.actorKeys, critKeys, normalKeys);
    accumulator.add(this.targetKeys, grantsCritKeys, grantsNormalKeys);
    accumulator.update(options);
  }

  /** @override */
  _accumulator() {
    let crit;
    let normal;

    return {
      add: (actorKeys, critKeys, normalKeys) => {
        actorKeys.forEach((key) => {
          if (critKeys.includes(key)) crit = true;
          if (normalKeys.includes(key)) normal = true;
        });
      },
      update: (options) => {
        // a normal hit overrides a crit
        const critical = normal ? false : !!crit;
        debug(`updating critical: ${critical}`);
        options.critical = critical;
      },
    };
  }
}
