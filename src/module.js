import CoreRollerHooks from "./rollers/core.js";
import MidiRollerHooks from "./rollers/midi.js";
import ReadySetRollHooks from "./rollers/rsr.js";
import { applyButtonStyle, applySettings, ButtonStyle, initSettings } from "./settings.js";
import { renderDialogMessages } from "./messages.js";
import { debug, log } from "./util.js";
import DaeIntegration from "./dae-integration.js";

Hooks.once("init", () => {
  log("initializing Advantage Reminder");

  initSettings();

  // initialize the roller hooks helper class
  let rollerHooks;
  if (game.modules.get("midi-qol")?.active) rollerHooks = new MidiRollerHooks();
  else if (game.modules.get("ready-set-roll-5e")?.active) rollerHooks = new ReadySetRollHooks();
  else rollerHooks = new CoreRollerHooks();
  rollerHooks.init();

  // register hook to apply Midi's flags
  if (rollerHooks.shouldApplyMidiActiveEffect()) Hooks.on("applyActiveEffect", applyMidiCustom);

  // initialize DAE integration
  new DaeIntegration().init();
});

// Apply Midi-QOL's custom active effects
function applyMidiCustom(actor, change) {
  const supportedKeys = [
    "flags.midi-qol.advantage.",
    "flags.midi-qol.disadvantage.",
    "flags.midi-qol.grants.",
    "flags.midi-qol.critical.",
    "flags.midi-qol.noCritical.",
    "flags.midi-qol.fail.",
  ];
  if (supportedKeys.some((k) => change.key.startsWith(k))) {
    // update the actor
    if (typeof change.value !== "string") foundry.utils.setProperty(actor, change.key, change.value);
    else if (["true", "1"].includes(change.value.trim())) foundry.utils.setProperty(actor, change.key, true);
    else if (["false", "0"].includes(change.value.trim())) foundry.utils.setProperty(actor, change.key, false);
    else foundry.utils.setProperty(actor, change.key, change.value);
  }
}

Hooks.once("i18nInit", () => {
  foundry.helpers.Localization.localizeDataModel(ButtonStyle);
});

Hooks.once("setup", () => {
  applySettings();
  if (game.settings.get("adv-reminder", "updateStatusEffects")) updateConditionEffects();
});

/**
 * Add advantage-like condition effects for all status effects.
 * details: when adding to CONFIG.DND5E.conditionEffects, make sure to include an "advReminder"
 * prefix to serve as a namespace to avoid conflicts
 */
function updateConditionEffects() {
  const ce = CONFIG.DND5E.conditionEffects;
  ce.advReminderAdvantageAttack = new Set(["hiding", "invisible"]);
  ce.advReminderAdvantageDexSave = new Set(["dodging"]); 
  ce.advReminderDisadvantageAttack = new Set(["blinded", "frightened", "poisoned", "prone", "restrained"]);
  ce.advReminderDisadvantagePhysicalRolls = new Set(["heavilyEncumbered"]);
  ce.advReminderFailDexSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);
  ce.advReminderFailStrSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);
  ce.advReminderGrantAdvantageAttack = new Set(["blinded", "paralyzed", "petrified", "restrained", "stunned", "unconscious"]);
  ce.advReminderGrantAdjacentCritical = new Set(["paralyzed", "unconscious"]);
  ce.advReminderGrantDisadvantageAttack = new Set(["dodging", "hidden", "invisible"]);
  // if adjacent, grant advantage on the attack, else grant disadvantage
  ce.advReminderGrantAdjacentAttack = new Set(["prone"]);
  // the system doesn't add Frightened, probably because it requires light of sight, but I did, so add it back
  (ce.abilityCheckDisadvantage ??= new Set()).add("frightened");

  if (game.settings.get("dnd5e", "rulesVersion") === "legacy")
    ce.advReminderDisadvantageAttack.add("exhaustion-3");
}

/**
 * Process the d20 roll sources of advantage/normal/disadvantage
 */
Hooks.on("renderD20RollConfigurationDialog", (dialog, html) => {
  debug("renderD20RollConfigurationDialog hook called");

  const opt = dialog.options["adv-reminder"];
  if (opt?.sources || !opt?.advSources) return;
  const advSources = opt.advSources;

  opt.sources = [];
  const addSources = (icon, prefix, labels) => {
    if (labels?.length) opt.sources.push({ icon, prefix, labels: labels.join(", ") });
  };

  if (advSources.override) {
    let icon, prefix;
    switch (advSources.override.mode) {
      case 1:
        icon = "fas fa-angles-up";
        prefix = "adv-reminder.Source.Advantage.override";
        break;
      case 0:
        icon = "fas fa-minus";
        prefix = "adv-reminder.Source.Normal.override";
        break;
      case -1:
        icon = "fas fa-angles-down";
        prefix = "adv-reminder.Source.Disadvantage.override";
        break;
    }
    addSources(icon, prefix, [advSources.override.label]);
  } else {
    if (advSources.advantages?.suppressed?.length)
      addSources("fas fa-circle-xmark", "adv-reminder.Source.Advantage.suppressed", advSources.advantages.suppressed);
    else
      addSources("fas fa-angle-up", "adv-reminder.Source.Advantage.prefix", advSources.advantages?.labels);

    if (advSources.disadvantages?.suppressed?.length)
      addSources("fas fa-circle-xmark", "adv-reminder.Source.Disadvantage.suppressed", advSources.disadvantages.suppressed);
    else
      addSources("fas fa-angle-down", "adv-reminder.Source.Disadvantage.prefix", advSources.disadvantages?.labels);
  }
});

/**
 * Process the damage roll sources of crits
 */
Hooks.on("renderDamageRollConfigurationDialog", (dialog, html) => {
  debug("renderDamageRollConfigurationDialog hook called");

  const opt = dialog.options["adv-reminder"];
  if (opt?.sources || !opt?.critSources) return;
  const critSources = opt.critSources;

  opt.sources = [];
  const addSources = (icon, prefix, labels) => {
    if (labels?.length) opt.sources.push({ icon, prefix, labels: labels.join(", ") });
  };

  if (critSources.critical?.suppressed?.length)
    addSources("fas fa-circle-xmark", "adv-reminder.Source.Critical.suppressed", critSources.critical.suppressed);
  else
    addSources("fas fa-bomb", "adv-reminder.Source.Critical.prefix", critSources.critical.labels);
});

// New roll dialog hook, as of dnd5e v4.0
Hooks.on("renderRollConfigurationDialog", async (dialog, html) => {
  debug("renderRollConfigurationDialog hook called");

  // add custom button styling
  applyButtonStyle(html);

  const opt = dialog.options["adv-reminder"];
  if (!opt) return;

  // render the messages once per dialog, but add them on each render that lost them: a part that is rendered again
  // while the messages are prepared would drop them
  opt.messagesHTML ??= renderDialogMessages(opt, dialog.rolls[0]?.data ?? {});
  const content = await opt.messagesHTML;
  if (!content || !dialog.rendered || html.querySelector(".adv-reminder-messages")) return;
  debug("messages", opt.messages, "sources", opt.sources, "html", content);

  const message = createMessageElement(dialog, content);
  // add messages right after configuration
  const configFieldset = html.querySelector('fieldset[data-application-part="configuration"]');
  if (configFieldset) configFieldset.after(message);
  else html.querySelector(".window-content")?.prepend(message);

  // reset position in case the dialog is too tall and the buttons are off the screen
  dialog.setPosition();
});

/**
 * Turn the messages into an element, with their inline rolls adding to the roll's situational bonus.
 * @param {RollConfigurationDialog} dialog
 * @param {string} content the rendered messages
 * @returns {HTMLElement}
 */
function createMessageElement(dialog, content) {
  const t = document.createElement("template");
  t.innerHTML = content;
  const message = t.content.firstElementChild;

  // swap "inline-roll" class for "dialog-roll"
  message.querySelectorAll("a.inline-roll").forEach((ir) => {
    debug("found inline-roll", ir);
    ir.classList.remove("inline-roll");
    ir.classList.add("dialog-roll");
    ir.addEventListener("click", (event) => {
      event.preventDefault();
      // get the formula from the button
      const formula = event.currentTarget.dataset.formula;
      debug("adding to input:", formula);
      // add the formula to the bonus input
      const input = dialog.element.querySelector('.rolls input[name="roll.0.situational"]');
      if (!input) return;
      input.value = input.value ? `${input.value} + ${formula}` : formula;
      // rebuild dialog (i.e. show new die icons)
      dialog.rebuild();
    });
  });
  return message;
}
