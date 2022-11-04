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
      ? actor.effects
          .filter((effect) => !effect.isSuppressed && !effect.disabled)
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
    const keys = this.messageKeys;
    const messages = this.changes
      .filter((change) => keys.includes(change.key))
      .map((change) => change.value);

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
      setProperty(options, "dialogOptions.adv-reminder.messages", messages);
      setProperty(options, "dialogOptions.adv-reminder.rollData", this.actor.getRollData());
    }
  }
}

export class AttackMessage extends BaseMessage {
  constructor(actor, targetActor, item) {
    super(actor, targetActor);

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
  constructor(actor, targetActor, item) {
    super(actor, targetActor);

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

  /** @override */
  get targetKeys() {
    return [
      "flags.adv-reminder.grants.message.damage.all",
      `flags.adv-reminder.grants.message.damage.${this.actionType}`,
    ];
  }
}
