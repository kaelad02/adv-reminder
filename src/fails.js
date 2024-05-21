import { debug } from "./util.js";

class BaseFail {
  constructor(actor) {
    /** @type {Actor5e} */
    this.actor = actor;
  }

  /**
   * Get the midi-qol flags on the actor, flattened.
   * @param {Actor5e} actor
   * @returns {object} the midi-qol flags on the actor, flattened
   */
  _getFlags(actor) {
    const midiFlags = actor?.flags["midi-qol"] || {};
    return flattenObject(midiFlags);
  }

  get failKeys() {
    return ["fail.all"];
  }

  get failCondition() {
    return undefined;
  }

  /**
   * Check for auto-fail flags to see if this roll should fail.
   * @param {object} options the roll options
   * @returns true if the roll should fail, false if it may continue
   */
  fails(options) {
    debug("checking for fail flags for the roll");

    // get the active effect keys that will fail
    const failKeys = this.failKeys;
    debug("failKeys", failKeys);

    const actorFlags = this._getFlags(this.actor);
    const shouldFail =
      failKeys.reduce((accum, curr) => actorFlags[curr] || accum, false) ||
      this.actor.hasConditionEffect(this.failCondition);
    if (shouldFail) {
      const messageData = this.createMessageData(options);
      this.toMessage(messageData);
    }
    return shouldFail;
  }

  async toMessage(messageData) {
    // content that immatates a die roll
    const content = await renderTemplate("modules/adv-reminder/templates/fail-dice-roll.hbs");
    // merge basic data with child's data
    const chatData = foundry.utils.mergeObject(
      {
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content,
      },
      messageData
    );
    // apply the roll mode to adjust message visibility
    ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));

    // create the chat message
    return ChatMessage.create(chatData);
  }
}

export class AbilitySaveFail extends BaseFail {
  constructor(actor, abilityId) {
    super(actor);

    /** @type {string} */
    this.abilityId = abilityId;
  }

  /** @override */
  get failKeys() {
    return super.failKeys.concat([
      "fail.ability.all",
      `fail.ability.save.all`,
      `fail.ability.save.${this.abilityId}`,
    ]);
  }

  /** @override */
  get failCondition() {
    switch (this.abilityId) {
      case "dex": return "advReminderFailDexSave";
      case "str": return "advReminderFailDexSave";
    }
  }

  createMessageData(options = {}) {
    // build title, probably used as chat message flavor
    const label = CONFIG.DND5E.abilities[this.abilityId];
    const title = `${game.i18n.format("DND5E.SavePromptTitle", {
      ability: label,
    })}: ${this.actor.name}`;

    // build chat message data
    const messageData = foundry.utils.mergeObject(options.messageData || {}, {
      speaker: options.speaker || ChatMessage.getSpeaker({ actor: this.actor }),
      "flags.dnd5e.roll": { type: "save", abilityId: this.abilityId },
    });

    // pull flavor from a few places before falling back to title
    messageData.flavor = messageData.flavor || options.flavor || title;

    return messageData;
  }
}
