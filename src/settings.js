import { debug, setDebugMode } from "./util.js";

const { DataModel } = foundry.abstract;
const { BooleanField, ColorField, SchemaField, StringField } = foundry.data.fields;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export let showSources;

const COLORS = {
  default: "adv-reminder.ButtonStyle.COLORS.default.label",
  player: "adv-reminder.ButtonStyle.COLORS.player.label",
  green: "adv-reminder.ButtonStyle.COLORS.green.label",
  custom: "adv-reminder.ButtonStyle.COLORS.custom.label",
};

export class ButtonStyle extends DataModel {
  static defineSchema() {
    return {
      wide: new BooleanField({ required: true, initial: false }),
      color: new StringField({ required: true, initial: "default", choices: COLORS }),
      custom: new SchemaField({
        buttonColor: new ColorField({ required: true, initial: "#000000" }),
        textColor: new ColorField()
      })
    };
  }

  static LOCALIZATION_PREFIXES = ["adv-reminder.ButtonStyle"];
}

export function initSettings() {
  // Roll Dialog Colors
  game.settings.registerMenu("adv-reminder", "buttonStyle", {
    name: "adv-reminder.ButtonStyle.SETTING.name",
    hint: "adv-reminder.ButtonStyle.SETTING.hint",
    label: "adv-reminder.ButtonStyle.SETTING.label",
    icon: "fas fa-palette",
    type: ButtonStyleConfig,
    restricted: false
  });
  game.settings.register("adv-reminder", "buttonStyle", {
    name: "adv-reminder.ButtonStyle.SETTING.name",
    scope: "client",
    config: false,
    type: ButtonStyle,
    default: {}
  });

  game.settings.register("adv-reminder", "showSources", {
    name: "adv-reminder.ShowSources.Name",
    hint: "adv-reminder.ShowSources.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => (showSources = value),
  });

  game.settings.register("adv-reminder", "updateStatusEffects", {
    name: "adv-reminder.UpdateStatusEffects.Name",
    hint: "adv-reminder.UpdateStatusEffects.Hint",
    scope: "world",
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  // Hidden debugMode setting
  game.settings.register("adv-reminder", "debugMode", {
    type: new BooleanField({ required: true, initial: false }),
    scope: "client",
    config: false,
    onChange: setDebugMode,
  });
  setDebugMode(game.settings.get("adv-reminder", "debugMode"));
}

export function applySettings() {
  showSources = game.settings.get("adv-reminder", "showSources");
}

/**
 * Apply the button style setting to a roll dialog. The CSS variables are set on the dialog itself, not the document
 * root, so they also apply when the dialog is in a detached window.
 * @param {HTMLElement} element the roll dialog's element
 */
export function applyButtonStyle(element) {
  const buttonStyle = game.settings.get("adv-reminder", "buttonStyle");
  debug("apply button style", buttonStyle);

  // start clean, the dialog may have been rendered before with another style
  element.classList.remove("adv-reminder-wide", "adv-reminder-color", "adv-reminder-text-color");
  element.style.removeProperty("--adv-reminder-color");
  element.style.removeProperty("--adv-reminder-background-color");

  if (buttonStyle.wide) element.classList.add("adv-reminder-wide");

  let color, background;
  switch (buttonStyle.color) {
    case "player":
      background = game.user.color;
      break;
    case "green":
      background = "#008000";
      break;
    case "custom":
      background = buttonStyle.custom.buttonColor;
      color = buttonStyle.custom.textColor;
      break;
  }
  debug("setStyle with", color, background);

  // only override what is set, the rest keeps the system's style
  if (background) {
    element.classList.add("adv-reminder-color");
    element.style.setProperty("--adv-reminder-background-color", String(background));
  }
  if (color) {
    element.classList.add("adv-reminder-text-color");
    element.style.setProperty("--adv-reminder-color", String(color));
  }
}

/**
 * An app to change the buttonStyle setting.
 * Includes a test button to show a sample roll dialog to see the style changes.
 */
class ButtonStyleConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options={}) {
    super(options);
    // work on a copy, never on the instance cached by the settings
    this.#setting = (options.setting ?? game.settings.get("adv-reminder", "buttonStyle")).clone();
    debug("options", options);
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      contentClasses: ["standard-form"],
      icon: "fas fa-palette",
      title: "adv-reminder.ButtonStyle.SETTING.label"
    },
    position: {
      width: 480,
      height: "auto"
    },
    form: {
      handler: this.#onSubmitForm,
      closeOnSubmit: false,
      submitOnChange: true
    },
    actions: {
      test: this.#test
    },
  };

  static PARTS = {
    form: {
      template: "templates/generic/form-fields.hbs"
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  get setting() {
    return this.#setting;
  }
  #setting;

  async _preparePartContext(partId, context) {
    switch (partId) {
      case "form":
        context.fields = this._getFields();
        break;
      case "footer":
        context.buttons = [
          { type: "button", action: "test", icon: "fas fa-eye", label: "adv-reminder.ButtonStyle.SETTING.test" }
        ];
        break;
    }
    return context;
  }

  _getFields() {
    const setting = this.setting;
    const source = setting._source;
    const fields = setting.schema.fields;

    return [
      // Widen
      { field: fields.wide, value: source.wide },
      // Style
      { field: fields.color, value: source.color },
      // Custom
      {
        fieldset: true,
        legend: fields.custom.label,
        fields: Object.values(fields.custom.fields).map(field => {
          const value = foundry.utils.getProperty(source, `custom.${field.name}`);
          return { field, value };
        })
      }
    ];
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // set initial state of custom section
    this._setCustomEnabled(this.form);
  }

  _setCustomEnabled(form) {
    const color = form.querySelector('select[name="color"]');
    const disabled = color.value !== "custom";

    const fieldset = form.querySelector("fieldset");
    if (disabled) fieldset.style.opacity = 0.5;
    else fieldset.style.removeProperty("opacity");
    fieldset.disabled = disabled;
  }

  static async #onSubmitForm(event, form, formData){
    debug("submitting form", form, formData);

    // update state of custom section
    this._setCustomEnabled(form);
    // save setting changes
    this.setting.updateSource(formData.object);
    await game.settings.set("adv-reminder", "buttonStyle", this.setting.toObject());
  }

  static async #test(event, target) {
    debug("test", event, target);

    const rollConfig = {
      rolls: [{ parts: ["@mod", "@prof"], data: { mod: 3, prof: 2 }, options: {} }],
    };
    const dialogConfig = {
      options: { "adv-reminder": { messages: ["Conditional bonus [[/r +2]]"] } },
    };
    const messageConfig = { create: false };
    await CONFIG.Dice.D20Roll.build(rollConfig, dialogConfig, messageConfig);
  }
}
