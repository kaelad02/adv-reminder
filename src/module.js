import CoreRollerHooks from "./rollers/core.js";
import MidiRollerHooks from "./rollers/midi.js";
import ReadySetRollHooks from "./rollers/rsr.js";
import SamplePackBuilder from "./sample-pack.js";
import { applySettings, ButtonStyle, initSettings } from "./settings.js";
import { debug, debugEnabled, log } from "./util.js";
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
  Localization.localizeDataModel(ButtonStyle);
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

  if (game.settings.get("dnd5e", "rulesVersion") === "legacy")
    ce.advReminderGrantDisadvantageAttack.add("exhaustion-3");
}

Hooks.once("ready", () => {
  // expose SamplePackBuilder
  if (debugEnabled) window.samplePack = new SamplePackBuilder();
});

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

  const message = await prepareMessage(dialog);
  if (message) {
    // add messages right after configuration
    const configFieldset = html.querySelector('fieldset[data-application-part="configuration"]');
    configFieldset.after(message);
    // swap "inline-roll" class for "dialog-roll"
    const inlineRolls = html.querySelectorAll("a.inline-roll");
    inlineRolls.forEach(ir => {
      debug("found inline-roll", ir);
      ir.classList.remove("inline-roll");
      ir.classList.add("dialog-roll");
      // add click listener
      ir.addEventListener("click", (event) => {
        // get the formula from the button
        const button = event.currentTarget;
        const formula = button.dataset.formula;
        debug("adding to input:", formula);
        // add the formula to the bonus input
        const dialogContent = button.closest(".window-content");
        const input = dialogContent.querySelector('.rolls input[name="roll.0.situational"]');
        input.value = !!input.value ? `${input.value} + ${formula}` : formula;
        // rebuild dialog (i.e. show new die icons)
        dialog.rebuild();
      });
    });
  }

  // add custom button styling by adding a class
  const buttonStyle = game.settings.get("adv-reminder", "buttonStyle");
  if (buttonStyle.wide) html.classList.add("adv-reminder-wide");
  if (buttonStyle.color !== "default") html.classList.add("adv-reminder-color");

  // reset position in case the dialog is too tall and the buttons are off the screen
  dialog.setPosition();
});

async function prepareMessage(dialog) {
  const opt = dialog.options["adv-reminder"];
  if (!opt || opt.rendered) return;

  // get the messages and sources
  const messages = opt.messages ?? [];
  const sources = opt.sources ?? [];

  if (messages.length || sources.length) {
    // build message
    const message = await renderTemplate("modules/adv-reminder/templates/roll-dialog-messages.hbs", { messages, sources });
    // enrich message, specifically replacing rolls
    const enriched = await TextEditor.enrichHTML(message, {
      secrets: true,
      documents: true,
      links: false,
      rolls: true,
      rollData: dialog.rolls[0]?.data ?? {},
    });
    debug("messages", messages, "enriched", enriched);
    opt.rendered = true;
    // turn into HTML element
    const t = document.createElement("template");
    t.innerHTML = enriched;
    return t.content.firstElementChild;
  }
}
