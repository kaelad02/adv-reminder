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
    const shouldFail = failKeys.reduce((accum, curr) => actorFlags[curr] || accum, false);
    if (shouldFail) {
      const messageData = foundry.utils.expandObject(options.messageData);
      messageData.flavor = messageData.flavor || options.flavor;
      const rollMode = options.rollMode || game.settings.get("core", "rollMode");
      this.toMessage(messageData, rollMode);
    }
    return shouldFail;
  }

  async toMessage(messageData, rollMode) {
    // content that immatates a die roll
    const content = await renderTemplate("modules/adv-reminder/templates/fail-dice-roll.hbs");
    // merge basic data with child's data
    messageData = foundry.utils.mergeObject(
      {
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content,
      },
      messageData
    );
    // Create the message
    const cls = getDocumentClass("ChatMessage");
    const msg = new cls(messageData);
    msg.applyRollMode(rollMode);
    return cls.create(msg.toObject());
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
}
