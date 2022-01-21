import { debug } from "./util.js";

class BaseReminder {
  constructor(actor) {
    /** @type {string[]} */
    this.actorChanges = this._getActiveEffectChanges(actor);
  }

  /**
   * Get Midi QOL's active effect keys, values and labels from an actor.
   * @param {Actor5e} actor the actor
   * @returns {string[]} an array of objects Midi QOL's active effects keys, values and labels
   */
  _getActiveEffectChanges(actor) {
    return actor
      ? actor.effects
        .filter((effect) => !effect.isSuppressed && !effect.data.disabled)
        .flatMap((effect) => effect.data.changes)
        .map((change) => ({ key: change.key, value: change.value.trim(), label: change.document.data.label }))
        .filter((change) => /^(custom\.)?flags\.midi-qol\..+/.test(change.key))
      : [];
  }

  /**
   * An accumulator that looks for matching keys and tracks (custom) advantage/disadvantage.
   */
  _accumulator() {
    let advantage;
    let disadvantage;
    let customAdvantages = [];
    let customDisadvantages = [];

    return {
      add: (actorChanges, advKeys, disKeys) => {
        actorChanges.forEach((change) => {
          if (advKeys.includes(change.key)) advantage = true;
          if (disKeys.includes(change.key)) disadvantage = true;
          if (advKeys.find((advKey) => `custom.${advKey}` === change.key) && change.value && !customAdvantages.find((adv) => adv.value === change.value)) customAdvantages.push({ value: change.value, label: change.label });
          if (disKeys.find((disKey) => `custom.${disKey}` === change.key) && change.value && !customDisadvantages.find((dis) => dis.value === change.value)) customDisadvantages.push({ value: change.value, label: change.label });
        });
      },
      disadvantage: (value) => {
        if (value) disadvantage = true;
      },
      update: (options) => {
        debug(
          `updating options with {advantage: ${advantage}, disadvantage: ${disadvantage}, customAdvantages: ${customAdvantages}, customDisadvantages: ${customDisadvantages}}`
        );
        // only set if adv or dis, the die roller doesn't handle when both are true correctly
        if (advantage && !disadvantage) options.advantage = true;
        else if (!advantage && disadvantage) options.disadvantage = true;

        // add custom adv and dis arrays even if empty
        options.customAdvantages = customAdvantages;
        options.customDisadvantages = customDisadvantages;
      },
    };
  }
}

export class AttackReminder extends BaseReminder {
  constructor(actor, targetActor, item) {
    super(actor);

    /** @type {string[]} */
    this.targetChanges = this._getActiveEffectChanges(targetActor);
    /** @type {string} */
    this.actionType = item.data.data.actionType;
    /** @type {string} */
    this.abilityId = item.abilityMod;
  }

  updateOptions(options) {
    // quick return if there are no active effects
    if (this.actorChanges.length == 0 && this.targetChanges.length == 0) return;

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
    accumulator.add(this.actorChanges, advKeys, disKeys);
    accumulator.add(this.targetChanges, grantsAdvKeys, grantsDisKeys);
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
    if (this.actorChanges.length == 0) return;

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);

    // find matching keys and update options
    const accumulator = this._accumulator();
    accumulator.add(this.actorChanges, advKeys, disKeys);
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
  constructor(actor, skillId) {
    super(actor, actor.data.data.skills[skillId].ability);

    /** @type {string} */
    this.skillId = skillId;
    /** @type {Item5e[]} */
    this.items = actor.items;
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
    accumulator.disadvantage(this._armorStealthDisadvantage());
    accumulator.add(this.actorChanges, advKeys, disKeys);
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
    this.targetChanges = this._getActiveEffectChanges(targetActor);
    /** @type {string} */
    this.actionType = item.data.data.actionType;
  }

  updateOptions(options) {
    // quick return if there are no active effects
    if (this.actorChanges.length == 0 && this.targetChanges.length == 0) return;

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
    accumulator.add(this.actorChanges, critKeys, normalKeys);
    accumulator.add(this.targetChanges, grantsCritKeys, grantsNormalKeys);
    accumulator.update(options);
  }

  /** @override */
  _accumulator() {
    let crit;
    let normal;
    let customCrits = [];
    let customNormals = [];

    return {
      add: (actorChanges, critKeys, normalKeys) => {
        actorChanges.forEach((change) => {
          if (critKeys.includes(change.key)) crit = true;
          if (normalKeys.includes(change.key)) normal = true;
          if (critKeys.find((critKey) => `custom.${critKey}` === change.key) && change.value && !customCrits.find((crit) => crit.value === change.value)) customCrits.push({ value: change.value, label: change.label });
          if (normalKeys.find((normalKey) => `custom.${normalKey}` === change.key) && change.value && !customNormals.find((norm) => norm.value === change.value)) customNormals.push({ value: change.value, label: change.label });
        });
      },
      update: (options) => {
        // a normal hit overrides a crit
        const critical = normal ? false : !!crit;
        options.critical = critical;

        debug(`updating critical: ${critical}, customCrits: ${customCrits}, customNormals: ${customNormals}`);

        // add custom crits and normals arrays even if empty
        options.customCrits = customCrits;
        options.customNormals = customNormals;
      },
    };
  }
}
