import { debug } from "./util.js";

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
    name: "adv-reminder.ColorMenu.Name",
    hint: "adv-reminder.ColorMenu.Hint",
    label: "adv-reminder.ColorMenu.Label",
    icon: "fas fa-palette",
    type: ButtonStyleConfig,
    restricted: false
  });
  game.settings.register("adv-reminder", "buttonStyle", {
    name: "Button Style",
    scope: "client",
    config: false,
    type: ButtonStyle,
    default: {},
    onChange: updateStyle
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
    default: false,
  });

  // Hidden debugMode setting
  game.settings.register("adv-reminder", "debugMode", {
    type: new BooleanField({ required: true, initial: false }),
    scope: "client",
    config: false,
  });

  migrateSettings();
}

/**
 * Migrate the old settings to the new settings.
 */
function migrateSettings() {
  debug("migrateSettings called");

  // functions to read old settings
  const storage = game.settings.storage.get("client");
  const get = (key) => {
    const item = storage.getItem(`adv-reminder.${key}`);
    return item ? new Setting({ key: `adv-reminder.${key}`, value: item }) : undefined;
  };
  const remove = (key) => storage.removeItem(`adv-reminder.${key}`);

  const changes = {};

  const defaultButtonColor = get("defaultButtonColor");
  if (defaultButtonColor)
    changes["color"] = defaultButtonColor.value === "none" ? "default" : defaultButtonColor.value;

  const customColor = get("customColor");
  if (customColor)
    changes["custom.buttonColor"] = customColor.value;

  if (!foundry.utils.isEmpty(changes)) {
    const buttonStyle = game.settings.get("adv-reminder", "buttonStyle");
    debug("migrating buttonStyle setting", buttonStyle, changes);
    buttonStyle.updateSource(changes);
    game.settings.set("adv-reminder", "buttonStyle", buttonStyle);
    remove("defaultButtonColor");
    remove("customColor");
  }
}

export function applySettings() {
  // initialize the color variables
  updateStyle(game.settings.get("adv-reminder", "buttonStyle"));

  showSources = game.settings.get("adv-reminder", "showSources");
}

function updateStyle(buttonStyle) {
  debug("update style called", buttonStyle);

  let color, background;
  switch (buttonStyle.color) {
    case "default":
      break;
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

  const root = document.querySelector(":root");
  const setStyle = (property, value) => root.style.setProperty(property, value);
  setStyle("--adv-reminder-color", color ?? "inherit");
  setStyle("--adv-reminder-background-color", background ?? "inherit");
}

/**
 * An app to change the buttonStyle setting.
 * Includes a test button to show a sample roll dialog to see the style changes.
 */
class ButtonStyleConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options={}) {
    super(options);
    this.#setting = options.setting ?? game.settings.get("adv-reminder", "buttonStyle");
    debug("options", options);
  }

  static DEFAULT_OPTIONS = {
    //tag: "form",
    window: {
      contentClasses: ["standard-form"],
      contentTag: "form",
      icon: "fas fa-palette",
      title: "adv-reminder.ColorMenu.Label"
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
          { type: "button", action: "test", icon: "fas fa-eye", label: "adv-reminder.ColorMenu.Test" }
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
      {
        outer: { field: fields.wide, value: source.wide }
      },
      // Style
      {
        outer: { field: fields.color, value: source.color }
      },
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

  /**
   * Workaround for "tag: form" not working correctly, use a "contentTag: form" instead but register listeners here.
   * TODO remove in v13
   */
  _attachFrameListeners() {
    super._attachFrameListeners();

    const form = this.element.querySelector(".window-content");
    form.addEventListener("submit", this._onSubmitForm.bind(this, this.options.form));
    form.addEventListener("change", this._onChangeForm.bind(this, this.options.form));
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // set initial state of custom section
    // TODO in v13, use this.form instead
    const form = this.element.querySelector(".window-content");
    this._setCustomEnabled(form);
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
    game.settings.set("adv-reminder", "buttonStyle", this.setting);
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
    CONFIG.Dice.D20Roll.build(rollConfig, dialogConfig, messageConfig);
  }
}
