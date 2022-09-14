import { debug } from "./util.js";

class BaseMessage {
  constructor(actor) {
    /** @type {Actor5e} */
    this.actor = actor;
    /** @type {EffectChangeData[]} */
    this.changes = actor.effects
      .filter((effect) => !effect.isSuppressed && !effect.disabled)
      .flatMap((effect) => effect.changes)
      .sort((a, b) => a.priority - b.priority);
  }

  get messageKeys() {
    return ["flags.adv-reminder.message.all"];
  }

  addMessage(options) {
    const keys = this.messageKeys;
    const messages = this.changes
      .filter((change) => keys.includes(change.key))
      .map((change) => change.value);

    if (messages.length > 0) {
      setProperty(options, "dialogOptions.adv-reminder.messages", messages);
      setProperty(options, "dialogOptions.adv-reminder.rollData", this.actor.getRollData());
    }

    return messages;
  }
}

export class AttackMessage extends BaseMessage {
  constructor(actor, item) {
    super(actor);

    /** @type {string} */
    this.actionType = item.system.actionType;
    /** @type {string} */
    this.abilityId = item.abilityMod;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.attack.all",
      `flags.adv-reminder.message.attack.${this.actionType}`,
      `flags.adv-reminder.message.attack.${this.abilityId}`
    );
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

export class SkillMessage extends AbilityCheckMessage {
  constructor(actor, skillId) {
    super(actor, actor.system.skills[skillId].ability);

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
  constructor(actor, item) {
    super(actor);

    /** @type {string} */
    this.actionType = item.system.actionType;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.damage.all",
      `flags.adv-reminder.message.damage.${this.actionType}`
    );
  }

  async addMessage(options) {
    // Damage options has a nested options variable, add that and pass it to super
    options.options = options.options || {};
    return super.addMessage(options.options);
  }
}
