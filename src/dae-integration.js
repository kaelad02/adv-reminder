import { getAllMessageKeys } from "./messages.js";
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
    this.messageFlags = getAllMessageKeys();

    // add message flags to DAE so it shows them in the AE editor
    Hooks.once("DAE.setupComplete", () => {
      debug("DAE.setupComplete called, adding Advantage Reminder flags to DAE");
      globalThis.DAE.addAutoFields(this.messageFlags);
    });

    // force all message flags to use the Custom change type
    Hooks.on("dae.modifySpecials", (specKey, specials, characterSpec) => {
      debug("dae.modifySpecials called");
      this.messageFlags.forEach((field) => {
        specials[field] = [new StringField(), "custom"];
      });
    });

    // group the message flags in the field browser
    Hooks.on("dae.setFieldData", (fieldData) => {
      debug("dae.setFieldData called");
      fieldData["ARMessage"] = [...this.messageFlags];
    });
  }
}
