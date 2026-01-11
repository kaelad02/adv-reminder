import { debug } from "./util.js";

const { StringField } = foundry.data.fields;

export default class DaeIntegration {
  /** @type {string[]} */
  messageFlags = [];

  /**
   * Initialize the integration, call during `init` hook.
   */
  init() {
    debug("initializing integration with DAE");

    // initialize the flags
    this._initFlags();

    // add message flags to DAE so it shows them in the AE editor
    Hooks.once("DAE.setupComplete", () => {
      debug("DAE.setupComplete called, adding Advantage Reminder flags to DAE");
      globalThis.DAE.addAutoFields(this.messageFlags);
    });

    // force all message flags to use the Custom change mode
    Hooks.on("dae.modifySpecials", (specKey, specials, characterSpec) => {
      debug("dae.modifySpecials called");
      this.messageFlags.forEach((field) => {
        specials[field] = [new StringField(), 0];
      });
    });

    // group the message flags in the field browser
    Hooks.on("dae.setFieldData", (fieldData) => {
      debug("dae.setFieldData called");
      const messages = [...this.messageFlags];
      fieldData["ARMessage"] = messages;
    });
  }

  _initFlags() {
    this.messageFlags.push("flags.adv-reminder.message.all");
    this.messageFlags.push("flags.adv-reminder.message.attack.all");
    this.messageFlags.push("flags.adv-reminder.message.ability.all");
    this.messageFlags.push("flags.adv-reminder.message.ability.check.all");
    this.messageFlags.push("flags.adv-reminder.message.ability.save.all");
    this.messageFlags.push("flags.adv-reminder.message.skill.all");
    this.messageFlags.push("flags.adv-reminder.message.deathSave");
    this.messageFlags.push("flags.adv-reminder.message.damage.all");

    const actionTypes = ["mwak", "rwak", "msak", "rsak"];
    actionTypes.forEach((actionType) => this.messageFlags.push(`flags.adv-reminder.message.attack.${actionType}`));

    Object.keys(CONFIG.DND5E.itemActionTypes).forEach((actionType) =>
      this.messageFlags.push(`flags.adv-reminder.message.damage.${actionType}`)
    );

    Object.keys(CONFIG.DND5E.abilities).forEach((abilityId) => {
      this.messageFlags.push(`flags.adv-reminder.message.attack.${abilityId}`);
      this.messageFlags.push(`flags.adv-reminder.message.ability.check.${abilityId}`);
      this.messageFlags.push(`flags.adv-reminder.message.ability.save.${abilityId}`);
    });

    Object.keys(CONFIG.DND5E.skills).forEach((skillId) => this.messageFlags.push(`flags.adv-reminder.message.skill.${skillId}`));
  }
}
