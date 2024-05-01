import { debug, isEmpty } from "./util.js";

class BaseReminder {
  constructor(actor) {
    /** @type {Actor5e*} */
    this.actor = actor;
    /** @type {object} */
    this.actorFlags = this._getFlags(actor);
  }

  /**
   * Get the midi-qol flags on the actor, flattened.
   * @param {Actor5e*} actor
   * @returns {object} the midi-qol flags on the actor, flattened
   */
  _getFlags(actor) {
    const midiFlags = actor?.flags["midi-qol"] || {};
    return flattenObject(midiFlags);
  }

  _message() {
    debug("checking for adv/dis effects for the roll");
  }

  /**
   * Modeled after Actor5e#hasConditionEffect, check to see if the actor is under the effect of
   * this property from some status or due to its level of exhaustion. But instead of a true/false,
   * it returns the ID of the condition.
   * @param {Actor5e} actor the actor
   * @param {string} key the effect key
   * @returns {Set} a set of the condition IDs the actor has for the effect
   */
  _getConditionForEffect(actor, key) {
    const props = CONFIG.DND5E.conditionEffects[key] ?? new Set();
    const level = actor.system.attributes?.exhaustion ?? null;
    const imms = actor.system.traits?.ci?.value ?? new Set();
    const statuses = actor.statuses;
    return props.filter(k => {
      const l = Number(k.split("-").pop());
      return (statuses.has(k) && !imms.has(k))
        || (!imms.has("exhaustion") && (level !== null) && Number.isInteger(l) && (level >= l));
    }).toObject();
  }

  /**
   * An accumulator that looks for matching keys and tracks advantage/disadvantage.
   * @param {Object} options
   * @param {boolean} options.advantage initial value for advantage
   * @param {boolean} options.disadvantage initial value for disadvantage
   */
  _accumulator({advantage, disadvantage} = {}) {
    return {
      advantage,
      disadvantage,
      add: (actorFlags, advKeys, disKeys) => {
        advantage = advKeys.reduce((accum, curr) => accum || actorFlags[curr], advantage);
        disadvantage = disKeys.reduce((accum, curr) => accum || actorFlags[curr], disadvantage);
      },
      fromConditions: (actor, advConditions, disConditions) => {
        if (!actor) return;
        if (advConditions.flatMap(c => this._getConditionForEffect(actor, c)).length) advantage = true;
        if (disConditions.flatMap(c => this._getConditionForEffect(actor, c)).length) disadvantage = true;
      },
      advantage: (label) => {
        if (label) advantage = true;
      },
      disadvantage: (label) => {
        if (label) disadvantage = true;
      },
      update: (options) => {
        debug(`updating options with {advantage: ${advantage}, disadvantage: ${disadvantage}}`);
        // only set if adv or dis, the die roller doesn't handle when both are true correctly
        if (advantage && !disadvantage) {
          options.advantage = true;
          if (options.disadvantage) options.disadvantage = false;
        } else if (!advantage && disadvantage) {
          if (options.advantage) options.advantage = false;
          options.disadvantage = true;
        } else {
          if (options.advantage) options.advantage = false;
          if (options.disadvantage) options.disadvantage = false;
        }
      },
    };
  }
}

export class AttackReminder extends BaseReminder {
  constructor(actor, targetActor, item, distanceFn) {
    super(actor);

    /** @type {Actor5e*} */
    this.targetActor = targetActor;
    /** @type {object} */
    this.targetFlags = this._getFlags(targetActor);
    /** @type {string} */
    this.actionType = item.system.actionType;
    /** @type {string} */
    this.abilityId = item.abilityMod;
    /** @type {function} */
    this.distanceFn = distanceFn;
  }

  updateOptions(options) {
    this._message();

    // quick return if there are no flags
    //if (isEmpty(this.actorFlags) && isEmpty(this.targetFlags)) return;

    // build the active effect keys applicable for this roll
    const advKeys = [
      "advantage.all",
      "advantage.attack.all",
      `advantage.attack.${this.actionType}`,
      `advantage.attack.${this.abilityId}`,
    ];
    const disKeys = [
      "disadvantage.all",
      "disadvantage.attack.all",
      `disadvantage.attack.${this.actionType}`,
      `disadvantage.attack.${this.abilityId}`,
    ];
    const grantsAdvKeys = [
      "grants.advantage.attack.all",
      `grants.advantage.attack.${this.actionType}`,
    ];
    const grantsDisKeys = [
      "grants.disadvantage.attack.all",
      `grants.disadvantage.attack.${this.actionType}`,
    ];
    // build the condition effect keys for this roll
    const advConditions = ["advReminderAdvantageAttack"];
    const disConditions = ["advReminderDisadvantageAttack"];
    const grantsAdvConditions = ["advReminderGrantAdvantageAttack"];
    const grantsDisConditions = ["advReminderGrantDisadvantageAttack"];    

    // find matching keys
    const accumulator = this._accumulator();
    accumulator.add(this.actorFlags, advKeys, disKeys);
    accumulator.add(this.targetFlags, grantsAdvKeys, grantsDisKeys);
    // handle status effects
    accumulator.fromConditions(this.actor, advConditions, disConditions);
    accumulator.fromConditions(this.targetActor, grantsAdvConditions, grantsDisConditions);
    // handle distance-based status effects
    if (this.targetActor) {
      const grantAdjacentAttack = this._getConditionForEffect(this.targetActor, "advReminderGrantAdjacentAttack");
      if (grantAdjacentAttack.length) {
        const distance = this.distanceFn();
        const accumFn = distance <= 5 ? accumulator.advantage : accumulator.disadvantage;
        grantAdjacentAttack.forEach(accumFn);
      }
    }
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
    return ["advantage.all", "advantage.ability.all"];
  }

  get disadvantageKeys() {
    return ["disadvantage.all", "disadvantage.ability.all"];
  }

  get advantageConditions() {
    return [];
  }

  get disadvantageConditions() {
    return [];
  }

  updateOptions(options) {
    this._message();

    // quick return if there are no flags
    //if (isEmpty(this.actorFlags)) return;

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);

    // find matching keys, status effects, and update options
    const accumulator = options.isConcentration ? this._accumulator(options) : this._accumulator();
    accumulator.add(this.actorFlags, advKeys, disKeys);
    accumulator.fromConditions(this.actor, this.advantageConditions, this.disadvantageConditions);
    accumulator.update(options);
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
    return ["advReminderDisadvantageAbility"];
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
    const conditions = ["advReminderDisadvantageSave"];
    if (this.abilityId === "dex") conditions.push("advReminderDisadvantageDexSave");
    return conditions;
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

  /** @override */
  updateOptions(options) {
    this._message();

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);

    // find matching keys and update options
    const accumulator = this._accumulator();
    if (this.checkArmorStealth) {
      accumulator.disadvantage(this._armorStealthDisadvantage());
    }
    accumulator.add(this.actorFlags, advKeys, disKeys);
    accumulator.fromConditions(this.actor, this.advantageConditions, this.disadvantageConditions);
    accumulator.update(options);
  }

  /**
   * Check if the actor is wearing armor that imposes stealth disadvantage.
   * @returns true if they are wearing armor that imposes stealth disadvantage, false otherwise
   */
  _armorStealthDisadvantage() {
    if (this.skillId === "ste") {
      const item = this.items.find(
        (item) => item.type === "equipment" && item.system.equipped && item.system.properties.has("stealthDisadvantage")
      );
      debug("equiped item that imposes stealth disadvantage", item?.name);
      return item?.name;
    }
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
}

export class CriticalReminder extends BaseReminder {
  constructor(actor, targetActor, item, distanceFn) {
    super(actor);

    /** @type {Actor5e*} */
    this.targetActor = targetActor;
    /** @type {object} */
    this.targetFlags = this._getFlags(targetActor);
    /** @type {string} */
    this.actionType = item.system.actionType;
    /** @type {function} */
    this.distanceFn = distanceFn;

    // get the Range directly from the actor's flags
    if (targetActor) {
      const grantsCriticalRange =
        getProperty(targetActor, "flags.midi-qol.grants.critical.range") || -Infinity;
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

  updateOptions(options, critProp = "critical") {
    this._message();

    // quick return if there are no flags
    //if (isEmpty(this.actorFlags) && isEmpty(this.targetFlags)) return;

    // build the active effect keys applicable for this roll
    const critKeys = ["critical.all", `critical.${this.actionType}`];
    const normalKeys = ["noCritical.all", `noCritical.${this.actionType}`];
    const grantsCritKeys = [
      "grants.critical.all",
      `grants.critical.${this.actionType}`,
      "grants.critical.range",
    ];
    const grantsNormalKeys = ["fail.critical.all", `fail.critical.${this.actionType}`];

    // find matching keys and update options
    const accumulator = this._accumulator();
    accumulator.add(this.actorFlags, critKeys, normalKeys);
    accumulator.add(this.targetFlags, grantsCritKeys, grantsNormalKeys);
    // handle distance-based status effects
    if (this.targetActor) {
      const grantAdjacentCritical = this._getConditionForEffect(this.targetActor, "advReminderGrantAdjacentCritical");
      if (grantAdjacentCritical.length) {
        const distance = this.distanceFn();
        if (distance <= 5) grantAdjacentCritical.forEach(accumulator.critical);
      }
    }
    accumulator.update(options, critProp);
  }

  /** @override */
  _accumulator() {
    let crit;
    let normal;

    return {
      add: (actorFlags, critKeys, normalKeys) => {
        crit = critKeys.reduce((accum, curr) => accum || actorFlags[curr], crit);
        normal = normalKeys.reduce((accum, curr) => accum || actorFlags[curr], normal);
      },
      critical: (label) => {
        if (label) crit = true;
      },
      update: (options, critProp) => {
        // a normal hit overrides a crit
        const critical = normal ? false : !!crit;
        debug(`updating ${critProp}: ${critical}`);
        options[critProp] = critical;
      },
    };
  }
}
