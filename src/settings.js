Hooks.once("init", () => {
  // register settings
  game.settings.register("adv-reminder", "defaultButtonColor", {
    name: "adv-reminder.DefaultButtonColor.Name",
    hint: "adv-reminder.DefaultButtonColor.Hint",
    scope: "client",
    config: true,
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
    config: true,
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

/**
 * Customize the settings dialog to handle the custom color (hide/show and color picker)
 */
Hooks.on("renderSettingsConfig", (app, html, data) => {
  // Create color picker
  const settingId = "adv-reminder.customColor";
  const customColor = game.settings.get("adv-reminder", "customColor");
  const colorPickerElement = document.createElement("input");
  colorPickerElement.setAttribute("type", "color");
  colorPickerElement.setAttribute("data-edit", settingId);
  colorPickerElement.value = customColor;

  // Add color picker
  const stringInputElement = html[0].querySelector(
    `input[name="${settingId}"]`
  );
  stringInputElement.classList.add("color");
  stringInputElement.after(colorPickerElement);

  // Enable/disable customColor inputs
  const disableCustomColor = (optionValue) => {
    const input1 = document.querySelector(`input[name="${settingId}"]`);
    const input2 = document.querySelector(`input[data-edit="${settingId}"]`);

    if (optionValue === "custom") {
      input1.removeAttribute("disabled");
      input2.removeAttribute("disabled");
    } else {
      input1.setAttribute("disabled", true);
      input2.setAttribute("disabled", true);
    }
  };
  disableCustomColor(game.settings.get("adv-reminder", "defaultButtonColor"));

  // Add click listener to enable/disable customColor inputs
  const optionElement = html[0].querySelector(
    `select[name="adv-reminder.defaultButtonColor"]`
  );
  optionElement.addEventListener("click", (event) =>
    disableCustomColor(event.target.value)
  );
});
