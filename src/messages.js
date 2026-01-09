import { debug } from "./util.js";

class BaseMessage {
  constructor(actor, targetActor) {
    /** @type {Actor5e} */
    this.actor = actor;
    /** @type {EffectChangeData[]} */
    this.changes = this._getActiveEffectKeys(actor);
    /** @type {EffectChangeData[]} */
    this.targetChanges = this._getActiveEffectKeys(targetActor);
  }

  _getActiveEffectKeys(actor) {
    return actor
      ? actor.appliedEffects
          .flatMap((effect) => effect.changes)
          .sort((a, b) => a.priority - b.priority)
      : [];
  }

  get messageKeys() {
    return ["flags.adv-reminder.message.all"];
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
    const actorMessages = this.changes
      .filter((change) => keys.includes(change.key))
      .map((change) => change.value);
    messages.push(...actorMessages);

    // get messages from the target and merge
    const targetKeys = this.targetKeys;
    if (targetKeys) {
      const targetMessages = this.targetChanges
        .filter((change) => targetKeys.includes(change.key))
        .map((change) => change.value);
      messages.push(...targetMessages);
    }

    if (messages.length > 0) {
      debug("messages found:", messages);
      foundry.utils.setProperty(options, "options.adv-reminder.messages", messages);
      foundry.utils.setProperty(options, "options.adv-reminder.rollData", this.actor.getRollData());
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
      "flags.adv-reminder.message.attack.all",
      `flags.adv-reminder.message.attack.${this.actionType}`,
      `flags.adv-reminder.message.attack.${this.abilityId}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "flags.adv-reminder.grants.message.attack.all",
      `flags.adv-reminder.grants.message.attack.${this.actionType}`,
      `flags.adv-reminder.grants.message.attack.${this.abilityId}`,
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
    return super.messageKeys.concat("flags.adv-reminder.message.ability.all");
  }
}

export class AbilityCheckMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.check.all",
      `flags.adv-reminder.message.ability.check.${this.abilityId}`
    );
  }
}

export class AbilitySaveMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.save.all",
      `flags.adv-reminder.message.ability.save.${this.abilityId}`
    );
  }
}

export class ConcentrationMessage extends AbilitySaveMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("flags.adv-reminder.message.ability.concentration");
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
      "flags.adv-reminder.message.skill.all",
      `flags.adv-reminder.message.skill.${this.skillId}`
    );
  }
}

export class InitiativeMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("flags.adv-reminder.message.initiative");
  }
}

export class DeathSaveMessage extends AbilityBaseMessage {
  constructor(actor) {
    super(actor, null);
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.save.all",
      "flags.adv-reminder.message.deathSave"
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
      "flags.adv-reminder.message.damage.all",
      `flags.adv-reminder.message.damage.${this.actionType}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "flags.adv-reminder.grants.message.damage.all",
      `flags.adv-reminder.grants.message.damage.${this.actionType}`,
    ];
  }
}
