import CoreRollerHooks from "./rollers/core.js";
import MidiRollerHooks from "./rollers/midi.js";
import ReadySetRollHooks from "./rollers/rsr.js";
import SamplePackBuilder from "./sample-pack.js";
import { applySettings, ButtonStyle, initSettings } from "./settings.js";
import { debug, debugEnabled, log } from "./util.js";

const CIRCLE_INFO = `<i class="fa-solid fa-circle-info"></i> `;

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
  ce.advReminderDisadvantageAbility = new Set(["frightened", "poisoned"]);
  ce.advReminderDisadvantageSave = new Set();
  ce.advReminderDisadvantageDexSave = new Set(["restrained"]);
  ce.advReminderDisadvantagePhysicalRolls = new Set(["heavilyEncumbered"]);
  ce.advReminderFailDexSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);
  ce.advReminderFailStrSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);
  ce.advReminderGrantAdvantageAttack = new Set(["blinded", "paralyzed", "petrified", "restrained", "stunned", "unconscious"]);
  ce.advReminderGrantAdjacentCritical = new Set(["paralyzed", "unconscious"]);
  ce.advReminderGrantDisadvantageAttack = new Set(["dodging", "hidden", "invisible"]);
  // if adjacent, grant advantage on the attack, else grant disadvantage
  ce.advReminderGrantAdjacentAttack = new Set(["prone"]);

  if (game.settings.get("dnd5e", "rulesVersion") === "legacy") {
    ce.advReminderDisadvantageAbility.add("exhaustion-1");
    ce.advReminderDisadvantageSave.add("exhaustion-3");
    ce.advReminderGrantDisadvantageAttack.add("exhaustion-3");
  }
}

// Add message flags to DAE so it shows them in the AE editor
Hooks.once("DAE.setupComplete", () => {
  debug("adding Advantage Reminder flags to DAE");

  const fields = [];
  fields.push("flags.adv-reminder.message.all");
  fields.push("flags.adv-reminder.message.attack.all");
  fields.push("flags.adv-reminder.message.ability.all");
  fields.push("flags.adv-reminder.message.ability.check.all");
  fields.push("flags.adv-reminder.message.ability.save.all");
  fields.push("flags.adv-reminder.message.skill.all");
  fields.push("flags.adv-reminder.message.deathSave");
  fields.push("flags.adv-reminder.message.damage.all");

  const actionTypes = ["mwak", "rwak", "msak", "rsak"];
  actionTypes.forEach((actionType) => fields.push(`flags.adv-reminder.message.attack.${actionType}`));

  Object.keys(CONFIG.DND5E.itemActionTypes).forEach((actionType) =>
    fields.push(`flags.adv-reminder.message.damage.${actionType}`)
  );

  Object.keys(CONFIG.DND5E.abilities).forEach((abilityId) => {
    fields.push(`flags.adv-reminder.message.attack.${abilityId}`);
    fields.push(`flags.adv-reminder.message.ability.check.${abilityId}`);
    fields.push(`flags.adv-reminder.message.ability.save.${abilityId}`);
  });

  Object.keys(CONFIG.DND5E.skills).forEach((skillId) => fields.push(`flags.adv-reminder.message.skill.${skillId}`));

  window.DAE.addAutoFields(fields);
});

Hooks.once("ready", () => {
  // expose SamplePackBuilder
  if (debugEnabled) window.samplePack = new SamplePackBuilder();
});

// New roll dialog hook, as of dnd5e v4.0
Hooks.on("renderRollConfigurationDialog", async (dialog, html) => {
  debug("renderRollConfigurationDialog hook called");

  const message = await prepareMessage(dialog.options);
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
  const defaultButtonColor = game.settings.get("adv-reminder", "defaultButtonColor");
  if (defaultButtonColor !== "none") {
    const button = html.querySelector(".dialog-buttons button[autofocus]");
    button.classList.add("adv-reminder-custom");
  }

  // reset position in case the dialog is too tall and the buttons are off the screen
  dialog.setPosition();
});

async function prepareMessage(dialogOptions) {
  const opt = dialogOptions["adv-reminder"];
  if (!opt) return;
  if (opt.rendered) return;

  // merge the messages with the advantage/disadvantage from sources
  const messages = [...(opt.messages ?? [])];
  const addLabels = (labels, stringId) => {
    if (labels) {
      const sources = labels.join(", ");
      messages.push(CIRCLE_INFO + game.i18n.format(stringId, { sources }));
    }
  };
  addLabels(opt.advantageLabels, "adv-reminder.Source.Adv");
  addLabels(opt.disadvantageLabels, "adv-reminder.Source.Dis");
  addLabels(opt.criticalLabels, "adv-reminder.Source.Crit");
  addLabels(opt.normalLabels, "adv-reminder.Source.Norm");

  if (messages.length) {
    // build message
    const message = await renderTemplate("modules/adv-reminder/templates/roll-dialog-messages.hbs", { messages });
    // enrich message, specifically replacing rolls
    const enriched = await TextEditor.enrichHTML(message, {
      secrets: true,
      documents: true,
      links: false,
      rolls: true,
      rollData: opt.rollData ?? {},
      async: true,
    });
    debug("messages", messages, "enriched", enriched);
    opt.rendered = true;
    // turn into HTML element
    const t = document.createElement("template");
    t.innerHTML = enriched;
    return t.content.firstElementChild;
  }
}
