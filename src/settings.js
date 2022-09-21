import { debug } from "./util.js";

export let showSources;

Hooks.once("init", () => {
  // register settings
  game.settings.registerMenu("adv-reminder", "colorMenu", {
    name: "adv-reminder.ColorMenu.Name",
    hint: "adv-reminder.ColorMenu.Hint",
    label: "adv-reminder.ColorMenu.Label",
    icon: "fas fa-palette",
    type: MessageColorSettings,
    restricted: false
  });
  game.settings.register("adv-reminder", "defaultButtonColor", {
    name: "adv-reminder.DefaultButtonColor.Name",
    hint: "adv-reminder.DefaultButtonColor.Hint",
    scope: "client",
    config: false,
    type: String,
    choices: {
      none: "adv-reminder.DefaultButtonColor.None",
      player: "adv-reminder.DefaultButtonColor.Player",
      green: "adv-reminder.DefaultButtonColor.Green",
      custom: "adv-reminder.DefaultButtonColor.Custom",
    },
    default: "none",
    onChange: (option) =>
      setStyleVariables(
        option,
        game.settings.get("adv-reminder", "customColor")
      ),
  });
  game.settings.register("adv-reminder", "customColor", {
    name: "adv-reminder.CustomColor.Name",
    hint: "adv-reminder.CustomColor.Hint",
    scope: "client",
    config: false,
    type: String,
    default: "#000000",
    onChange: (customColor) =>
      setStyleVariables(
        game.settings.get("adv-reminder", "defaultButtonColor"),
        customColor
      ),
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
});

Hooks.once("ready", () => {
  // initialize the color variables
  setStyleVariables(
    game.settings.get("adv-reminder", "defaultButtonColor"),
    game.settings.get("adv-reminder", "customColor")
  );

  showSources = game.settings.get("adv-reminder", "showSources");
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) =>
  registerPackageDebugFlag("adv-reminder")
);

function setStyleVariables(option, customColor) {
  debug("setStyleVariables called");

  // set four color variables based on the option
  var varColor, varBackground, varButtonBorder, varButtonShadow, varMessageBorder;
  const setColorVars = (color) => {
    varColor = color;
    varBackground = Color.from(color).toRGBA(0.05);
    varButtonBorder = color;
    varButtonShadow = color;
    varMessageBorder = color;
  };
  switch (option) {
    case "none":
      varColor = "#191813";
      varBackground = "rgba(0, 0, 0, 0.05)";
      varButtonBorder = "#c9c7b8";
      varButtonShadow = "#ff0000";
      varMessageBorder = "#7a7971";
      break;
    case "player":
      setColorVars(game.user.color);
      break;
    case "green":
      setColorVars("#008000");
      break;
    case "custom":
      setColorVars(customColor);
      break;
  }

  const root = document.querySelector(":root");
  const setStyle = (varName, value) => root.style.setProperty(varName, value);
  setStyle("--adv-reminder-color", varColor);
  setStyle("--adv-reminder-background-color", varBackground);
  setStyle("--adv-reminder-button-border-color", varButtonBorder);
  setStyle("--adv-reminder-button-shadow-color", varButtonShadow);
  setStyle("--adv-reminder-message-border-color", varMessageBorder);
}

/**
 * An app to change the defaultButtonColor and customColor settings.
 * Includes a test button to show a sample roll dialog to see the color changes.
 */
class MessageColorSettings extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: game.i18n.localize("adv-reminder.ColorMenu.Name"),
      template: "modules/adv-reminder/templates/color-settings.hbs",
      width: 400,
      height: "auto",
      closeOnSubmit: false,
      submitOnChange: true,
    });
  }

  getData() {
    const defaultButtonColor = game.settings.settings.get("adv-reminder.defaultButtonColor");
    const customColor = game.settings.settings.get("adv-reminder.customColor");

    return {
      defaultButtonColor: {
        name: defaultButtonColor.name,
        hint: defaultButtonColor.hint,
        choices: defaultButtonColor.choices,
        value: game.settings.get("adv-reminder", "defaultButtonColor"),
      },
      customColor: {
        name: customColor.name,
        hint: customColor.hint,
        value: game.settings.get("adv-reminder", "customColor"),
      },
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // set listener on select to enable/disable custom color
    html.find('select[name="defaultButtonColor"]').change(this._onChangeSelect.bind(this));
    // Enable or disable the custom color settings based on the current setting
    const defaultButtonColor = game.settings.get("adv-reminder", "defaultButtonColor");
    this._setCustomEnabled(defaultButtonColor);
    // test button
    html.find('button[type="test"]').click(this._onTest.bind(this));
  }

  async _onChangeSelect(event) {
    event.preventDefault();
    this._setCustomEnabled(event.currentTarget.value);
  }

  _setCustomEnabled(value) {
    const section = this.element.find("div.adv-reminder-customColor");
    if (section) {
      const enabled = value === "custom";
      section.css("opacity", enabled ? 1.0 : 0.5);
      section.find("input").prop("disabled", !enabled);
    }
  }

  async _onTest(event) {
    debug("_onTest called");
    event.preventDefault();

    const rollData = {
      parts: ["@mod", "@prof"],
      data: { mod: 3, prof: 2 },
      title: "Sample Roll",
      chatMessage: false,
      dialogOptions: { "adv-reminder": { messages: ["Conditional bonus [[/r +2]]"] } },
    };
    dnd5e.dice.d20Roll(rollData);
  }

  async _updateObject(event, formData) {
    debug("_updateObject called with formData:", formData);
    if (formData.defaultButtonColor)
      await game.settings.set("adv-reminder", "defaultButtonColor", formData.defaultButtonColor);
    if (formData.customColor)
      await game.settings.set("adv-reminder", "customColor", formData.customColor);
  }
}
