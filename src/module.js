import { AbilitySaveFail } from "./fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  DamageMessage,
  DeathSaveMessage,
  SkillMessage,
} from "./messages.js";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
} from "./reminders.js";
import { debug, log } from "./util.js";

let checkArmorStealth;

Hooks.once("init", () => {
  log("initializing Advantage Reminder");

  // DAE version 0.8.81 added support for "impose stealth disadvantage"
  checkArmorStealth = !game.modules.get("dae")?.active;
  debug("checkArmorStealth", checkArmorStealth);
});

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

  const actionTypes =
    game.system.id === "sw5e" ? ["mwak", "rwak", "mpak", "rpak"] : ["mwak", "rwak", "msak", "rsak"];
  actionTypes.forEach((actionType) => {
    fields.push(`flags.adv-reminder.message.attack.${actionType}`);
    fields.push(`flags.adv-reminder.message.damage.${actionType}`);
  });

  Object.keys(CONFIG.DND5E.abilities).forEach((abilityId) => {
    fields.push(`flags.adv-reminder.message.attack.${abilityId}`);
    fields.push(`flags.adv-reminder.message.ability.check.${abilityId}`);
    fields.push(`flags.adv-reminder.message.ability.save.${abilityId}`);
  });

  Object.keys(CONFIG.DND5E.skills).forEach((skillId) =>
    fields.push(`flags.adv-reminder.message.skill.${skillId}`)
  );

  window.DAE.addAutoFields(fields);
});

// Attack rolls
Hooks.on("dnd5e.preRollAttack", (item, config) => {
  debug("preRollAttack hook called");

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this attack roll");
  new AttackMessage(item.actor, item).addMessage(config);
  debug("checking for adv/dis effects on this attack roll");
  new AttackReminder(item.actor, getTarget(), item).updateOptions(config);
});

// Saving throws
Hooks.on("dnd5e.preRollAbilitySave", (actor, config, abilityId) => {
  debug("preRollAbilitySave hook called");

  // check if an effect says to fail this roll
  const failChecker = new AbilitySaveFail(actor, abilityId);
  if (failChecker.fails(config)) return false;

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this saving throw");
  new AbilitySaveMessage(actor, abilityId).addMessage(config);
  debug("checking for adv/dis effects on this saving throw");
  new AbilitySaveReminder(actor, abilityId).updateOptions(config);
});

// Ability checks
Hooks.on("dnd5e.preRollAbilityTest", (actor, config, abilityId) => {
  debug("preRollAbilityTest hook called");

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this ability check");
  new AbilityCheckMessage(actor, abilityId).addMessage(config);
  debug("checking for adv/dis effects on this ability check");
  new AbilityCheckReminder(actor, abilityId).updateOptions(config);
});

// Skill checks
Hooks.on("dnd5e.preRollSkill", (actor, config, skillId) => {
  debug("preRollSkill hook called");

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this skill check");
  new SkillMessage(actor, skillId).addMessage(config);
  debug("checking for adv/dis effects on this skill check");
  new SkillReminder(actor, skillId, checkArmorStealth).updateOptions(config);
});

// Tool checks
Hooks.on("dnd5e.preRollToolCheck", (item, config) => {
  debug("preRollToolCheck hook called");

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this tool check");
  new AbilityCheckMessage(item.actor, item.system.ability).addMessage(config);
  debug("checking for adv/dis effects on this tool check");
  new AbilityCheckReminder(item.actor, item.system.ability).updateOptions(config);
});

// Death saves
Hooks.on("dnd5e.preRollDeathSave", (actor, config) => {
  debug("preRollDeathSave hook called");

  if (isFastForwarding(config)) return;

  debug("checking for message effects on this death save");
  new DeathSaveMessage(actor).addMessage(config);
  debug("checking for adv/dis effects on this death save");
  new DeathSaveReminder(actor).updateOptions(config);
});

// Damage rolls
Hooks.on("dnd5e.preRollDamage", (item, config) => {
  debug("preRollDamage hook called");

  // check for critical flags unless the user pressed a fast-forward key
  if (isFastForwarding(config)) return;

  debug("checking for message effects on this damage roll");
  new DamageMessage(item.actor, item).addMessage(config);
  debug("checking for critical/normal effects on this damage roll");
  new CriticalReminder(item.actor, getTarget(), item).updateOptions(config);
});

// Render dialog hook
Hooks.on("renderDialog", async (dialog, html, data) => {
  debug("renderDialog hook called");

  const message = await prepareMessage(dialog.options);
  if (message) {
    // add message at the end
    const formGroups = html.find(".form-group:last");
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
  const messages = dialogOptions["adv-reminder"]?.messages ?? [];
  const rollData = dialogOptions["adv-reminder"]?.rollData ?? {};

  if (messages.length) {
    // build message
    const message = await renderTemplate(
      "modules/adv-reminder/templates/roll-dialog-messages.hbs",
      { messages }
    );
    // enrich message, specifically replacing rolls
    const enriched = TextEditor.enrichHTML(message, {
      secrets: true,
      documents: true,
      links: false,
      rolls: true,
      rollData,
      async: false,
    });
    debug("messages", messages, "enriched", enriched);
    return enriched;
  }
}

/**
 * Check if we should fast-forward the roll by checking the fastForward flag
 * and if one of the modifier keys was pressed.
 * @param {object} options
 * @param {boolean} [options.fastForward] a specific fastForward flag
 * @param {Event} [options.event] the triggering event
 * @returns {boolean} true if they are fast-forwarding, false otherwise
 */
function isFastForwarding({ fastForward = false, event = {} }) {
  const isFF = !!(
    fastForward ||
    event?.shiftKey ||
    event?.altKey ||
    event?.ctrlKey ||
    event?.metaKey
  );
  if (isFF) debug("fast-forwarding the roll, stop processing");
  return isFF;
}

/**
 * Get the first targeted actor, if there are any targets at all.
 * @returns {Actor5e} the first target, if there are any
 */
function getTarget() {
  return [...game.user.targets][0]?.actor;
}
