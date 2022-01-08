export var debugEnabled;

export const registerSettings = function () {
  game.settings.register("adv-reminder", "debugLogging", {
    name: "Debug logging",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
    onChange: (value) => {
      debugEnabled = value;
    },
  });
};

export const fetchSettings = function () {
  debugEnabled = game.settings.get("adv-reminder", "debugLogging");
};
