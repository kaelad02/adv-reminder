import { debug } from "./util.js";

class BaseFail {
  constructor(actor) {
    /** @type {Actor5e} */
    this.actor = actor;
  }

  get failKeys() {
    return ["flags.midi-qol.fail.all"];
  }

  get rollString() {
    "The roll";
  }

  failCheck() {
    const effectData = this._getFailEffectData();
    if (effectData) {
      this._failRollMessage(effectData);
      return true;
    }
    return false;
  }

  _getFailEffectData() {
    // get the active effect keys that will fail
    const failKeys = this.failKeys;
    debug("failKeys", failKeys);

    // search for the fail keys and return the effect data
    return this.actor.effects
      .filter((effect) => !effect.isSuppressed && !effect.data.disabled)
      .flatMap((effect) => effect.data.changes)
      .filter((change) => failKeys.includes(change.key))
      .map((change) => change.document?.data)
      .shift();
  }

  async _failRollMessage(effectData) {
    // generate chat message content
    const templateData = {
      effectData,
      rollString: this.rollString,
    };
    const html = await renderTemplate(
      "modules/adv-reminder/templates/fail-chat-card.html",
      templateData
    );

    const speaker = ChatMessage.getSpeaker({
      actor: this.actor,
      token: this.actor.token,
    });
    const chatData = {
      user: game.user.data._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker,
    };

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
      "flags.midi-qol.fail.ability.all",
      `flags.midi-qol.fail.ability.save.all`,
      `flags.midi-qol.fail.ability.save.${this.abilityId}`,
    ]);
  }

  /** @override */
  get rollString() {
    return game.i18n.format("DND5E.SavePromptTitle", {
      ability: CONFIG.DND5E.abilities[this.abilityId],
    });
  }
}
