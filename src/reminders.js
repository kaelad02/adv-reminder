import { debug } from "./util.js";

/**
 * @typedef AdvantageModeData
 * @property {number|null} override               Whether the mode has been entirely overridden.
 * @property {AdvantageModeCounts} advantages     The advantage counts.
 * @property {AdvantageModeCounts} disadvantages  The disadvantage counts.
 */

/**
 * @typedef AdvantageModeCounts
 * @property {number} count          The number of applications of this mode.
 * @property {boolean} suppressed  Whether this mode is suppressed.
 */

/**
 * @typedef CriticalModeData
 * @property {AdvantageModeCounts} critical  The critical counts.
 */

export class AdvantageAccumulator {
  /**
   * @param {AdvantageModeData} counts
   */
  constructor(counts) {
    this.counts = counts;
  }

  /**
   * Apply labels from active effects that use the Midi flags.
   * @param {Object.<string, boolean>} actorFlags
   * @param {string[]} advKeys
   * @param {string[]} disKeys
   */
  applyFlags(actorFlags, advKeys, disKeys) {
    this.counts.advantages.count += advKeys.filter(key => actorFlags[key]).length;
    this.counts.disadvantages.count += disKeys.filter(key => actorFlags[key]).length;
  }

  /**
   * Apply labels from conditions the actor has.
   * @param {Actor5e} actor
   * @param {string[]} advConditions
   * @param {string[]} disConditions
   */
  applyConditions(actor, advConditions, disConditions) {
    if (!actor) return;
    this.counts.advantages.count += advConditions.flatMap(c => this._getConditionForEffect(actor, c)).length;
    this.counts.disadvantages.count += disConditions.flatMap(c => this._getConditionForEffect(actor, c)).length;
  }

  /**
   * Modeled after Actor5e#hasConditionEffect, check to see if the actor is under the effect of
   * this property from some status or due to its level of exhaustion. But instead of a true/false,
   * it returns the ID of the condition.
   * @param {Actor5e} actor
   * @param {string} key
   * @returns {string[]}
   */
  _getConditionForEffect(actor, key) {
    const props = CONFIG.DND5E.conditionEffects[key] ?? new Set();
    const level = actor.system.attributes?.exhaustion ?? null;
    const imms = actor.system.traits?.ci?.value ?? new Set();
    const statuses = actor.statuses;
    return props
      .filter(k => {
        const l = Number(k.split("-").pop());
        return (statuses.has(k) && !imms.has(k))
          || (!imms.has("exhaustion") && (level !== null) && Number.isInteger(l) && (level >= l));
      })
      .toObject();
  }

  /**
   * Set advantage if the label exists.
   * @param {string} label
   */
  advantage(label) {
    if (label) this.counts.advantages.count++;
  }

  /**
   * Set disadvantage if the label exists.
   * @param {string} label
   */
  disadvantage(label) {
    if (label) this.counts.disadvantages.count++;
  }

  /**
   * Update the options with the advantage and disadvantage properties
   * @param {Object} options
   */
  update(options) {
    const mode = dnd5e.dataModels.fields.AdvantageModeField.resolveMode({}, {}, this.counts);
    debug("updating options with roll mode", mode);
    options.advantage = (mode === 1);
    options.disadvantage = (mode === -1);
  }
}

class BaseReminder {
  constructor(actor) {
    /** @type {Actor5e} */
    this.actor = actor;
    /** @type {object} */
    this.actorFlags = this._getFlags(actor);
  }

  /**
   * Get the midi-qol flags on the actor, flattened.
   * @param {Actor5e} actor
   * @returns {object} the midi-qol flags on the actor, flattened
   */
  _getFlags(actor) {
    const midiFlags = actor?.flags["midi-qol"] || {};
    return foundry.utils.flattenObject(midiFlags);
  }

  static AccumulatorClass = AdvantageAccumulator;

  static UpdateMessage = "checking for adv/dis effects for the roll";

  updateOptions(options) {
    debug(this.constructor.UpdateMessage);

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);
    const advConditions = this.advantageConditions;
    const disConditions = this.disadvantageConditions;
    debug("advConditions", advConditions, "disConditions", disConditions);

    // get the underlying adv/dis counts to initialize the accumulator
    const counts = this._rollModeCounts(this.rollModes, options);

    // find matching keys, status effects, and update options
    const accumulator = new this.constructor.AccumulatorClass(counts);
    accumulator.applyFlags(this.actorFlags, advKeys, disKeys);
    accumulator.applyConditions(this.actor, advConditions, disConditions);
    this._customUpdateOptions(accumulator);
    accumulator.update(options);
  }

  _rollModeCounts(rollModes, options) {
    if (foundry.utils.isEmpty(rollModes)) {
      const counts = {
        override: null,
        advantages: { count: 0, suppressed: false },
        disadvantages: { count: 0, suppressed: false }
      };
      if (options.advantage) counts.advantages.count++;
      if (options.disadvantage) counts.disadvantages.count++;
      return counts;
    }

    // TODO handle more than one in 5.1 using combineFields

    const path = Object.keys(rollModes)[0];
    const counts = dnd5e.dataModels.fields.AdvantageModeField.getCounts(this.actor, { key: path });
    debug("Roll Mode counts actor", path, counts);
    return foundry.utils.deepClone(counts);
  }

  _customUpdateOptions(accumulator) {}
}

export class AttackReminder extends BaseReminder {
  constructor(actor, targetActor, activity, distanceFn) {
    super(actor);

    /** @type {Actor5e} */
    this.targetActor = targetActor;
    /** @type {object} */
    this.targetFlags = this._getFlags(targetActor);
    /** @type {string} */
    this.actionType = activity.actionType;
    /** @type {string} */
    this.abilityId = activity.ability;
    /** @type {function} */
    this.distanceFn = distanceFn;
  }

  get advantageKeys() {
    return [
      "advantage.all",
      "advantage.attack.all",
      `advantage.attack.${this.actionType}`,
      `advantage.attack.${this.abilityId}`,
    ];
  }

  get disadvantageKeys() {
    return [
      "disadvantage.all",
      "disadvantage.attack.all",
      `disadvantage.attack.${this.actionType}`,
      `disadvantage.attack.${this.abilityId}`,
    ];
  }

  get advantageConditions() {
    return ["advReminderAdvantageAttack"];
  }

  get disadvantageConditions() {
    const conditions = ["advReminderDisadvantageAttack"];
    if (this.abilityId === "str" || this.abilityId === "dex" || this.abilityId === "con")
      conditions.push("advReminderDisadvantagePhysicalRolls");
    return conditions;
  }

  _customUpdateOptions(accumulator) {
    // process target flags
    const grantsAdvKeys = [
      "grants.advantage.attack.all",
      `grants.advantage.attack.${this.actionType}`,
    ];
    const grantsDisKeys = [
      "grants.disadvantage.attack.all",
      `grants.disadvantage.attack.${this.actionType}`,
    ];
    accumulator.applyFlags(this.targetFlags, grantsAdvKeys, grantsDisKeys);

    // process target's conditions
    const grantsAdvConditions = ["advReminderGrantAdvantageAttack"];
    const grantsDisConditions = ["advReminderGrantDisadvantageAttack"];
    accumulator.applyConditions(this.targetActor, grantsAdvConditions, grantsDisConditions);

    // process distance-based status effects
    if (this.targetActor) {
      const grantAdjacentAttack = accumulator._getConditionForEffect(this.targetActor, "advReminderGrantAdjacentAttack");
      if (grantAdjacentAttack.length) {
        const distance = this.distanceFn();
        const accumFn = distance <= 5 ? accumulator.advantage.bind(accumulator) : accumulator.disadvantage.bind(accumulator);
        grantAdjacentAttack.forEach(accumFn);
      }
    }
  }
}

class AbilityBaseReminder extends BaseReminder {
  constructor(actor, abilityId) {
    super(actor);

    /** @type {string} */
    this.abilityId = abilityId;
  }

  get advantageKeys() {
    return ["advantage.all", "advantage.ability.all"];
  }

  get disadvantageKeys() {
    return ["disadvantage.all", "disadvantage.ability.all"];
  }

  get advantageConditions() {
    return [];
  }

  get disadvantageConditions() {
    if (this.abilityId === "str" || this.abilityId === "dex" || this.abilityId === "con")
      return ["advReminderDisadvantagePhysicalRolls"];
    return [];
  }
}

export class AbilityCheckReminder extends AbilityBaseReminder {
  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "advantage.ability.check.all",
      `advantage.ability.check.${this.abilityId}`,
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "disadvantage.ability.check.all",
      `disadvantage.ability.check.${this.abilityId}`,
    ]);
  }

  get disadvantageConditions() {
    const conditions = super.disadvantageConditions;
    conditions.push("advReminderDisadvantageAbility");
    return conditions;
  }
}

export class AbilitySaveReminder extends AbilityBaseReminder {
  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat([
      "advantage.ability.save.all",
      `advantage.ability.save.${this.abilityId}`,
    ]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "disadvantage.ability.save.all",
      `disadvantage.ability.save.${this.abilityId}`,
    ]);
  }

  /** @override */
  get advantageConditions() {
    const conditions = [];
    if (this.abilityId === "dex") conditions.push("advReminderAdvantageDexSave");
    return conditions;
  }

  get disadvantageConditions() {
    const conditions = super.disadvantageConditions;
    conditions.push("advReminderDisadvantageSave");
    if (this.abilityId === "dex") conditions.push("advReminderDisadvantageDexSave");
    return conditions;
  }
}

export class ConcentrationReminder extends AbilitySaveReminder {
  get rollModes() {
    return {
      "system.attributes.concentration.roll.mode": ["DND5E.Concentration"]
    };
  }
}

export class SkillReminder extends AbilityCheckReminder {
  constructor(actor, abilityId, skillId, checkArmorStealth = true) {
    super(actor, abilityId);

    /** @type {string} */
    this.skillId = skillId;
    /** @type {Item5e[]} */
    this.items = actor.items;
    /** @type {boolean} */
    this.checkArmorStealth = checkArmorStealth;
  }

  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat(["advantage.skill.all", `advantage.skill.${this.skillId}`]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "disadvantage.skill.all",
      `disadvantage.skill.${this.skillId}`,
    ]);
  }

  _customUpdateOptions(accumulator) {
    super._customUpdateOptions(accumulator);

    // Check if the actor is wearing armor that imposes stealth disadvantage
    if (this.checkArmorStealth && this.skillId === "ste") {
      const item = this.items.find(
        (item) => item.type === "equipment" && item.system.equipped && item.system.properties.has("stealthDisadvantage")
      );
      debug("equipped item that imposes stealth disadvantage", item?.name);
      accumulator.disadvantage(item?.name);
    }
  }
}

export class InitiativeReminder extends AbilityCheckReminder {
  get advantageConditions() {
    return super.advantageConditions.concat("advReminderAdvantageInitiative");
  }

  get disadvantageConditions() {
    return super.disadvantageConditions.concat("advReminderDisadvantageInitiative");
  }
}

export class DeathSaveReminder extends AbilityBaseReminder {
  constructor(actor) {
    super(actor, null);
  }

  /** @override */
  get advantageKeys() {
    return super.advantageKeys.concat(["advantage.ability.save.all", "advantage.deathSave"]);
  }

  /** @override */
  get disadvantageKeys() {
    return super.disadvantageKeys.concat([
      "disadvantage.ability.save.all",
      "disadvantage.deathSave",
    ]);
  }

  get rollModes() {
    return {
      "system.attributes.death.roll.mode": ["DND5E.DeathSave"]
    };
  }
}

export class CriticalAccumulator extends AdvantageAccumulator {
  /**
   * @param {CriticalModeData} counts
   */
  constructor(counts) {
    super();
    this.counts = counts;
  }

  applyFlags(actorFlags, critKeys, normalKeys) {
    this.counts.critical.count += critKeys.filter(key => actorFlags[key]).length;
    this.counts.critical.suppressed ||= normalKeys.some(key => actorFlags[key]);
  }

  critical(label) {
    if (label) this.counts.critical.count++;
  }

  update(options) {
    // a normal hit overrides a crit
    const critical = this.counts.critical.suppressed ? false : (this.counts.critical.count > 0);
    debug("updating isCritical", critical);
    options.isCritical = critical;
  }
}

export class CriticalReminder extends BaseReminder {
  constructor(actor, targetActor, activity, distanceFn) {
    super(actor);

    /** @type {Actor5e} */
    this.targetActor = targetActor;
    /** @type {object} */
    this.targetFlags = this._getFlags(targetActor);
    /** @type {string} */
    this.actionType = activity.actionType;
    /** @type {function} */
    this.distanceFn = distanceFn;

    // get the Range directly from the actor's flags
    if (targetActor) {
      const grantsCriticalRange =
        foundry.utils.getProperty(targetActor, "flags.midi-qol.grants.critical.range") || -Infinity;
      this._adjustRange(distanceFn, grantsCriticalRange);
    }
  }

  _adjustRange(distanceFn, grantsCriticalRange) {
    // adjust the Range flag to look like a boolean like the rest
    if ("grants.critical.range" in this.targetFlags) {
      const distance = distanceFn();
      this.targetFlags["grants.critical.range"] = distance <= grantsCriticalRange;
    }
  }

  static AccumulatorClass = CriticalAccumulator;

  static UpdateMessage = "checking for critical/normal effects for the roll";

  updateOptions(options) {
    debug(this.constructor.UpdateMessage);

    // build the active effect keys applicable for this roll
    const critKeys = ["critical.all", `critical.${this.actionType}`];
    const normalKeys = ["noCritical.all", `noCritical.${this.actionType}`];
    const grantsCritKeys = [
      "grants.critical.all",
      `grants.critical.${this.actionType}`,
      "grants.critical.range",
    ];
    const grantsNormalKeys = ["fail.critical.all", `fail.critical.${this.actionType}`];

    // initialize the critical counts
    const counts = this._initCounts(options.isCritical);

    // find matching keys and update options
    const accumulator = new this.constructor.AccumulatorClass(counts);
    accumulator.applyFlags(this.actorFlags, critKeys, normalKeys);
    accumulator.applyFlags(this.targetFlags, grantsCritKeys, grantsNormalKeys);
    // handle distance-based status effects
    if (this.targetActor) {
      const grantAdjacentCritical = accumulator._getConditionForEffect(this.targetActor, "advReminderGrantAdjacentCritical");
      if (grantAdjacentCritical.length) {
        const distance = this.distanceFn();
        if (distance <= 5) grantAdjacentCritical.forEach(accumulator.critical.bind(accumulator));
      }
    }
    this._customUpdateOptions(accumulator);
    accumulator.update(options);
  }

  /**
   * @returns {CriticalModeData}
   */
  _initCounts(isCritical) {
    const counts = {
      critical: { count: 0, suppressed: false }
    };
    if (isCritical) counts.critical.count++;
    return counts;
  }
}
