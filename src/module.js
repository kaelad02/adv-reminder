import { AttackSource } from "./adv-source.js";
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

  // Use hooks introduced in dnd5e v2.0 to adjust rolls
  Hooks.on("dnd5e.preRollAttack", preRollAttack);
  Hooks.on("dnd5e.preRollAbilitySave", preRollAbilitySave);
  Hooks.on("dnd5e.preRollAbilityTest", preRollAbilityTest);
  Hooks.on("dnd5e.preRollSkill", preRollSkill);
  Hooks.on("dnd5e.preRollToolCheck", preRollToolCheck);
  Hooks.on("dnd5e.preRollDeathSave", preRollDeathSave);
  Hooks.on("dnd5e.preRollDamage", preRollDamage);

  // Render dialog hook
  Hooks.on("renderDialog", addMessageHook);
});

// Add message flags to DAE so it shows them in the AE editor
Hooks.once("DAE.setupComplete", () => {
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

function preRollAttack(item, config) {
  debug("preRollAttack method called");

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this attack roll");
  new AttackMessage(item.actor, item).addMessage(config);
  debug("getting the source of advantage on this attack roll");
  new AttackSource(item.actor, getTarget(), item).updateOptions(config);
  debug("checking for adv/dis effects on this attack roll");
  new AttackReminder(item.actor, getTarget(), item).updateOptions(config);
}

function preRollAbilitySave(actor, config, abilityId) {
  debug("preRollAbilitySave method called");

  // check if an effect says to fail this roll
  const failChecker = new AbilitySaveFail(actor, abilityId);
  if (failChecker.fails(config)) return false;

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this saving throw");
  new AbilitySaveMessage(actor, abilityId).addMessage(config);
  debug("checking for adv/dis effects on this saving throw");
  new AbilitySaveReminder(actor, abilityId).updateOptions(config);
}

function preRollAbilityTest(actor, config, abilityId) {
  debug("preRollAbilityTest method called");

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this ability check");
  new AbilityCheckMessage(actor, abilityId).addMessage(config);
  debug("checking for adv/dis effects on this ability check");
  new AbilityCheckReminder(actor, abilityId).updateOptions(config);
}

function preRollSkill(actor, config, skillId) {
  debug("preRollSkill method called");

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this skill check");
  new SkillMessage(actor, skillId).addMessage(config);
  debug("checking for adv/dis effects on this skill check");
  new SkillReminder(actor, skillId, checkArmorStealth).updateOptions(config);
}

function preRollToolCheck(item, config) {
  debug("preRollToolCheck method called");

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this tool check");
  new AbilityCheckMessage(item.actor, item.system.ability).addMessage(config);
  debug("checking for adv/dis effects on this tool check");
  new AbilityCheckReminder(item.actor, item.system.ability).updateOptions(config);
}

function preRollDeathSave(actor, config) {
  debug("preRollDeathSave method called");

  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this death save");
  new DeathSaveMessage(actor).addMessage(config);
  debug("checking for adv/dis effects on this death save");
  new DeathSaveReminder(actor).updateOptions(config);
}

function preRollDamage(item, config) {
  debug("preRollDamage method called");

  // check for critical flags unless the user pressed a fast-forward key
  if (isFastForwarding(config)) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
    return;
  }

  debug("checking for message effects on this damage roll");
  new DamageMessage(item.actor, item).addMessage(config);
  debug("checking for critical/normal effects on this damage roll");
  new CriticalReminder(item.actor, getTarget(), item).updateOptions(config);
}

async function addMessageHook(dialog, html, data) {
  debug("addMessageHook function called");

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
}

async function prepareMessage(dialogOptions) {
  const messages = dialogOptions["adv-reminder"]?.messages ?? [];
  const rollData = dialogOptions["adv-reminder"]?.rollData ?? {};
  const advantageLabels = dialogOptions["adv-reminder"]?.advantageLabels ?? [];
  const disadvantageLabels = dialogOptions["adv-reminder"]?.disadvantageLabels ?? [];

  // merge the messages with the advantage/disadvantage from hints
  const combined = [...messages];
  if (advantageLabels.length)
    combined.push(`Advantage from ${advantageLabels.join(", ")}`);
  if (disadvantageLabels.length)
    combined.push(`Disadvantage from ${disadvantageLabels.join(", ")}`);

  if (combined) {
    // build message
    const message = await renderTemplate(
      "modules/adv-reminder/templates/roll-dialog-messages.hbs",
      { messages: combined }
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
    debug("combined", combined, "enriched", enriched);
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
  return !!(
    fastForward ||
    event?.shiftKey ||
    event?.altKey ||
    event?.ctrlKey ||
    event?.metaKey
  );
}

/**
 * Get the first targeted actor, if there are any targets at all.
 * @returns {Actor5e} the first target, if there are any
 */
function getTarget() {
  return [...game.user.targets][0]?.actor;
}
