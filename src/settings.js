Hooks.once("init", () => {
  // register settings
  game.settings.registerMenu("adv-reminder", "colorMenu", {
    name: "Roll Dialog Style",
    hint: "Colorize the messages and default buttons on roll dialogs",
    label: "Configure Colors",
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
});

Hooks.once("ready", () => {
  // initialize the color variables
  setStyleVariables(
    game.settings.get("adv-reminder", "defaultButtonColor"),
    game.settings.get("adv-reminder", "customColor")
  );
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) =>
  registerPackageDebugFlag("adv-reminder")
);

class MessageColorSettings extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: "Roll Dialog Style",
      template: "modules/adv-reminder/templates/color-settings.hbs",
      width: 400,
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

  async _updateObject(event, formData) {
    await game.settings.set("adv-reminder", "defaultButtonColor", formData.defaultButtonColor);
    await game.settings.set("adv-reminder", "customColor", formData.customColor);
  }
}

function setStyleVariables(option, customColor) {
  // set four color variables based on the option
  var varColor, varBackground, varButtonBorder, varButtonShadow, varMessageBorder;
  const setColorVars = (color) => {
    varColor = color;
    varBackground = hexToRGBAString(colorStringToHex(color), 0.05);
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
