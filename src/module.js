import CoreRollerHooks from "./rollers/core.js";
import MidiRollerHooks from "./rollers/midi.js";
import ReadySetRollHooks from "./rollers/rsr.js";
import SamplePackBuilder from "./sample-pack.js";
import { debug, debugEnabled, log } from "./util.js";

const CIRCLE_INFO = `<i class="fa-solid fa-circle-info"></i> `;

Hooks.once("init", () => {
  log("initializing Advantage Reminder");

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
    if (typeof change.value !== "string") setProperty(actor, change.key, change.value);
    else if (["true", "1"].includes(change.value.trim())) setProperty(actor, change.key, true);
    else if (["false", "0"].includes(change.value.trim())) setProperty(actor, change.key, false);
    else setProperty(actor, change.key, change.value);
  }
}

Hooks.once("setup", () => {
  if (game.settings.get("adv-reminder", "updateStatusEffects")) {
    //updateStatusEffects();
    updateConditionEffects();
    //Hooks.on("preCreateActiveEffect", addExhaustionEffects);
    //Hooks.on("preUpdateActiveEffect", addExhaustionEffects);
  }
});

function updateStatusEffects() {
  debug("updateStatusEffects");

  const effectChanges = {
    blinded: {
      changes: [
        {
          key: "flags.midi-qol.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    dodging: {
      flags: {
        dae: {
          specialDuration: ["turnStart"],
        },
      },
      changes: [
        {
          key: "flags.midi-qol.grants.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.advantage.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    frightened: {
      changes: [
        {
          key: "flags.midi-qol.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.disadvantage.ability.check.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    hidden: {
      changes: [
        {
          key: "flags.midi-qol.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    invisible: {
      changes: [
        {
          key: "flags.midi-qol.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    paralyzed: {
      changes: [
        {
          key: "flags.midi-qol.fail.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.fail.ability.save.str",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.critical.range",
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: "5",
        },
      ],
    },
    petrified: {
      changes: [
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.fail.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.fail.ability.save.str",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    poisoned: {
      changes: [
        {
          key: "flags.midi-qol.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.disadvantage.ability.check.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    prone: {
      changes: [
        {
          key: "flags.midi-qol.grants.advantage.attack.mwak",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.msak",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.disadvantage.attack.rwak",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.disadvantage.attack.rsak",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    restrained: {
      changes: [
        {
          key: "flags.midi-qol.disadvantage.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    stunned: {
      changes: [
        {
          key: "flags.midi-qol.fail.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.fail.ability.save.str",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
      ],
    },
    unconscious: {
      changes: [
        {
          key: "flags.midi-qol.fail.ability.save.dex",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.fail.ability.save.str",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.advantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
        },
        {
          key: "flags.midi-qol.grants.critical.range",
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: "5",
        },
      ],
    },
  };

  Object.entries(effectChanges).forEach(([id, data]) => {
    const effect = CONFIG.statusEffects.find((e) => e.id === id);
    if (effect) foundry.utils.mergeObject(effect, data);
  });
}

/**
 * Add advantage-like condition effects for all status effects.
 * details: when adding to CONFIG.DND5E.conditionEffects, make sure to include an "advReminder"
 * prefix to serve as a namespace to avoid conflicts
 */
function updateConditionEffects() {
  // flags.midi-qol.advantage.attack.all
  CONFIG.DND5E.conditionEffects.advReminderAdvantageAttack = new Set(["hiding", "invisible"]);

  // flags.midi-qol.advantage.ability.save.dex
  CONFIG.DND5E.conditionEffects.advReminderAdvantageDexSave = new Set(["dodging"]); 
  
  // flags.midi-qol.disadvantage.attack.all
  CONFIG.DND5E.conditionEffects.advReminderDisadvantageAttack = new Set(["blinded", "frightened", "poisoned", "prone", "restrained"]);

  // flags.midi-qol.disadvantage.ability.check.all
  CONFIG.DND5E.conditionEffects.advReminderDisadvantageAbility = new Set(["exhaustion-1", "frightened", "poisoned"]);

  // flags.midi-qol.disadvantage.ability.save.all
  CONFIG.DND5E.conditionEffects.advReminderDisadvantageSave = new Set(["exhaustion-3"]);

  // flags.midi-qol.disadvantage.ability.save.dex
  CONFIG.DND5E.conditionEffects.advReminderDisadvantageDexSave = new Set(["restrained"]);

  // flags.midi-qol.fail.ability.save.dex
  CONFIG.DND5E.conditionEffects.advReminderFailDexSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);

  // flags.midi-qol.fail.ability.save.str
  CONFIG.DND5E.conditionEffects.advReminderFailStrSave = new Set(["paralyzed", "petrified", "stunned", "unconscious"]);

  // flags.midi-qol.grants.advantage.attack.all
  CONFIG.DND5E.conditionEffects.advReminderGrantAdvantageAttack = new Set(["blinded", "paralyzed", "petrified", "restrained", "stunned", "unconscious"]);

  // flags.midi-qol.grants.critical.range
  CONFIG.DND5E.conditionEffects.advReminderGrantAdjacentCritical = new Set(["paralyzed", "unconscious"]);

  // flags.midi-qol.grants.disadvantage.attack.all
  CONFIG.DND5E.conditionEffects.advReminderGrantDisadvantageAttack = new Set(["dodging", "exhaustion-3", "hidden", "invisible"]);

  // if adjacent, grant advantage on the attack, else grant disadvantage
  CONFIG.DND5E.conditionEffects.advReminderGrantAdjacentAttack = new Set(["prone"]);
}

function addExhaustionEffects(effect, updates) {
  debug("addExhaustionEffects");

  if (effect.id !== dnd5e.documents.ActiveEffect5e.ID.EXHAUSTION) return;
  const level = foundry.utils.getProperty(updates, "flags.dnd5e.exhaustionLevel");
  if (!level) return;
  // build the changes based on exhaustion level
  const changes = [
    {
      key: "flags.midi-qol.disadvantage.ability.check.all",
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: "1",
    },
    {
      key: "flags.dnd5e.initiativeDisadv",
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: "1",
    },
  ];
  if (level >= 3)
    changes.push(
      {
        key: "flags.midi-qol.disadvantage.attack.all",
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: "1",
      },
      {
        key: "flags.midi-qol.disadvantage.ability.save.all",
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: "1",
      }
    );
  // add changes to the active effect
  effect.updateSource({ changes });
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

  const actionTypes = game.system.id === "sw5e" ? ["mwak", "rwak", "mpak", "rpak"] : ["mwak", "rwak", "msak", "rsak"];
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

// Render dialog hook
Hooks.on("renderDialog", async (dialog, html, data) => {
  debug("renderDialog hook called");

  const message = await prepareMessage(dialog.options);
  if (message) {
    // add message at the end
    const formGroups = html.find("form:first .form-group:last");
    formGroups.after(message);
    // swap "inline-roll" class for "dialog-roll"
    const inlineRolls = html.find("a.inline-roll");
    if (inlineRolls) {
      debug("found inline-roll", inlineRolls);
      inlineRolls.removeClass("inline-roll");
      inlineRolls.addClass("dialog-roll");
    }
    // add onClick for inline rolls
    html.on("click", "a.dialog-roll", (event) => {
      // get the formula from the button
      const button = event.currentTarget;
      const formula = button.dataset.formula;
      debug("adding to input:", formula);
      // add the formula to the bonus input
      const dialogContent = button.closest(".dialog-content");
      const input = dialogContent.querySelector('input[name="bonus"]');
      input.value = !!input.value ? `${input.value} + ${formula}` : formula;
    });
    // reset dialog height
    const position = dialog.position;
    position.height = "auto";
    dialog.setPosition(position);
  }
});

async function prepareMessage(dialogOptions) {
  const opt = dialogOptions["adv-reminder"];
  if (!opt) return;

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
    return enriched;
  }
}
