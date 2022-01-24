import { debug } from "./util.js";

class BaseMessage {
  constructor(actor) {
    /** @type {EffectChangeData[]} */
    this.changes = actor.effects
      .filter((effect) => !effect.isSuppressed && !effect.data.disabled)
      .flatMap((effect) => effect.data.changes);
  }

  get messageKeys() {
    return ["flags.adv-reminder.message.all"];
  }

  async addMessage() {
    const keys = this.messageKeys;
    const messages = this.changes
      .filter((change) => keys.includes(change.key))
      .map((change) => change.value);

    if (messages.length > 0) {
      const message = await renderTemplate(
        "modules/adv-reminder/templates/roll-dialog-messages.hbs",
        { messages }
      );
      debug("adding hook to renderDialog w/ ", message);
      Hooks.once("renderDialog", (dialog, html, data) => {
        debug("called once hook for renderDialog");
        // add message at the end
        const formGroups = html.find(".form-group:last");
        formGroups.after(message);
        // reset dialog height
        const position = dialog.position;
        position.height = "auto";
        dialog.setPosition(position);
      });
    }

    return messages;
  }
}

export class AttackMessage extends BaseMessage {
  constructor(actor, item) {
    super(actor);

    /** @type {string} */
    this.actionType = item.data.data.actionType;
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
    super(actor, actor.data.data.skills[skillId].ability);

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
    this.actionType = item.data.data.actionType;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.damage.all",
      `flags.adv-reminder.message.damage.${this.actionType}`
    );
  }
}
