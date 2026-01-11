import { debug } from "./util.js";

class BaseMessage {
  constructor(actor, targetActor) {
    /** @type {Actor5e} */
    this.actor = actor;
    /** @type {object} */
    this.actorFlags = this._getFlags(actor);
    /** @type {object} */
    this.targetFlags = this._getFlags(targetActor);
  }

  _getFlags(actor) {
    const flags = actor?.flags["adv-reminder"] || {};
    return foundry.utils.flattenObject(flags);
  }

  get messageKeys() {
    return ["message.all"];
  }

  get targetKeys() {
    return undefined;
  }

  addMessage(options) {
    debug("checking for message effects");

    // get any existing messages
    const messages = foundry.utils.getProperty(options, "options.adv-reminder.messages") ?? [];

    // get messages from the actor and merge
    const keys = this.messageKeys;
    const actorMessages = Object.entries(this.actorFlags)
      .filter(([key, messages]) => keys.includes(key))
      .flatMap(([key, messages]) => messages);
    messages.push(...actorMessages);

    // get messages from the target and merge
    const targetKeys = this.targetKeys;
    if (targetKeys) {
      const targetMessages = Object.entries(this.targetFlags)
        .filter(([key, messages]) => keys.includes(key))
        .flatMap(([key, messages]) => messages);
      messages.push(...targetMessages);
    }

    if (messages.length > 0) {
      debug("messages found:", messages);
      foundry.utils.setProperty(options, "options.adv-reminder.messages", messages);
    }
  }
}

export class AttackMessage extends BaseMessage {
  constructor(actor, targetActor, activity) {
    super(actor, targetActor);

    /** @type {string} */
    this.actionType = activity.actionType;
    /** @type {string} */
    this.abilityId = activity.ability;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.attack.all",
      `message.attack.${this.actionType}`,
      `message.attack.${this.abilityId}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "grants.message.attack.all",
      `grants.message.attack.${this.actionType}`,
      `grants.message.attack.${this.abilityId}`,
    ];
  }
}

class AbilityBaseMessage extends BaseMessage {
  constructor(actor, abilityId) {
    super(actor);

    /** @type {string} */
    this.abilityId = abilityId;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("message.ability.all");
  }
}

export class AbilityCheckMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.ability.check.all",
      `message.ability.check.${this.abilityId}`
    );
  }
}

export class AbilitySaveMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.ability.save.all",
      `message.ability.save.${this.abilityId}`
    );
  }
}

export class ConcentrationMessage extends AbilitySaveMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("message.ability.concentration");
  }
}

export class SkillMessage extends AbilityCheckMessage {
  constructor(actor, abilityId, skillId) {
    super(actor, abilityId);

    /** @type {string} */
    this.skillId = skillId;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.skill.all",
      `message.skill.${this.skillId}`
    );
  }
}

export class InitiativeMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("message.initiative");
  }
}

export class DeathSaveMessage extends AbilityBaseMessage {
  constructor(actor) {
    super(actor, null);
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.ability.save.all",
      "message.deathSave"
    );
  }
}

export class DamageMessage extends BaseMessage {
  constructor(actor, targetActor, activity) {
    super(actor, targetActor);

    /** @type {string} */
    this.actionType = activity.actionType;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "message.damage.all",
      `message.damage.${this.actionType}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "grants.message.damage.all",
      `grants.message.damage.${this.actionType}`,
    ];
  }
}
