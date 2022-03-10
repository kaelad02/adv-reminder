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
import { registerSettings, fetchSettings } from "./settings.js";
import { debug, isMinVersion, log } from "./util.js";

let checkArmorStealth;

Hooks.once("init", () => {
  log("initializing Advantage Reminder");
  registerSettings();
  fetchSettings();

  // DAE version 0.8.81 added support for "impose stealth disadvantage"
  checkArmorStealth = !isMinVersion("dae", "0.8.81");
  debug("checkArmorStealth", checkArmorStealth);

  // Attack roll wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Item.documentClass.prototype.rollAttack",
    onRollAttack,
    "WRAPPER"
  );

  // Saving throw wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Actor.documentClass.prototype.rollAbilitySave",
    onRollAbilitySave,
    "MIXED"
  );

  // Ability check wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Actor.documentClass.prototype.rollAbilityTest",
    onRollAbilityTest,
    "WRAPPER"
  );

  // Skill check wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Actor.documentClass.prototype.rollSkill",
    onRollSkill,
    "WRAPPER"
  );

  // Tool check wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Item.documentClass.prototype.rollToolCheck",
    onRollToolCheck,
    "WRAPPER"
  );

  // Death save wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Actor.documentClass.prototype.rollDeathSave",
    onRollDeathSave,
    "WRAPPER"
  );

  // Critical hit wrapper
  libWrapper.register(
    "adv-reminder",
    "CONFIG.Item.documentClass.prototype.rollDamage",
    onRollDamage,
    "WRAPPER"
  );

  // Render dialog hook
  Hooks.on("renderDialog", addMessageHook);
});

// Add message flags to DAE so it shows them in the AE editor. Should do this in
// a setup hook, but this module is loaded before DAE so do it in ready instead.
Hooks.once("ready", () => {
  if (game.modules.get("dae")?.active) {
    const fields = [];
    fields.push("flags.adv-reminder.message.all");
    fields.push("flags.adv-reminder.message.attack.all");
    fields.push("flags.adv-reminder.message.ability.all");
    fields.push("flags.adv-reminder.message.ability.check.all");
    fields.push("flags.adv-reminder.message.ability.save.all");
    fields.push("flags.adv-reminder.message.skill.all");
    fields.push("flags.adv-reminder.message.deathSave");
    fields.push("flags.adv-reminder.message.damage.all");

    ["mwak", "rwak", "msak", "rsak"].forEach((actionType) => {
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
  }
});

async function onRollAttack(wrapped, options = {}) {
  debug("onRollAttack method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this attack roll");
    await new AttackMessage(this.actor, this).addMessage(options);
    debug("checking for adv/dis effects on this attack roll");
    const reminder = new AttackReminder(this.actor, getTarget(), this);
    reminder.updateOptions(options);
  }

  return wrapped(options);
}

async function onRollAbilitySave(wrapped, abilityId, options = {}) {
  debug("onRollAbilitySave method called");

  // check if an effect says to fail this roll
  const failChecker = new AbilitySaveFail(this, abilityId);
  if (await failChecker.fails(options)) return null;

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this saving throw");
    await new AbilitySaveMessage(this, abilityId).addMessage(options);
    debug("checking for adv/dis effects on this saving throw");
    const reminder = new AbilitySaveReminder(this, abilityId);
    reminder.updateOptions(options);
  }

  return wrapped(abilityId, options);
}

async function onRollAbilityTest(wrapped, abilityId, options = {}) {
  debug("onRollAbilityTest method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this ability check");
    await new AbilityCheckMessage(this, abilityId).addMessage(options);
    debug("checking for adv/dis effects on this ability check");
    const reminder = new AbilityCheckReminder(this, abilityId);
    reminder.updateOptions(options);
  }

  return wrapped(abilityId, options);
}

async function onRollSkill(wrapped, skillId, options = {}) {
  debug("onRollSkill method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this skill check");
    await new SkillMessage(this, skillId).addMessage(options);
    debug("checking for adv/dis effects on this skill check");
    const reminder = new SkillReminder(this, skillId, checkArmorStealth);
    reminder.updateOptions(options);
  }

  return wrapped(skillId, options);
}

async function onRollToolCheck(wrapped, options = {}) {
  debug("onRollToolCheck method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this tool check");
    await new AbilityCheckMessage(
      this.actor,
      this.data.data.ability
    ).addMessage(options);
    debug("checking for adv/dis effects on this tool check");
    const reminder = new AbilityCheckReminder(
      this.actor,
      this.data.data.ability
    );
    reminder.updateOptions(options);
  }

  return wrapped(options);
}

async function onRollDeathSave(wrapped, options = {}) {
  debug("onRollDeathSave method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this death save");
    await new DeathSaveMessage(this).addMessage(options);
    debug("checking for adv/dis effects on this death save");
    const reminder = new DeathSaveReminder(this);
    reminder.updateOptions(options);
  }

  return wrapped(options);
}

async function onRollDamage(wrapped, options = {}) {
  debug("onRollDamage method called");

  // check for critical flags unless the user pressed a fast-forward key
  const isFF = isFastForwardingDamage(options);
  if (isFF) {
    debug("fast-forwarding the roll, skip checking for adv/dis");
  } else {
    debug("checking for message effects on this damage roll");
    await new DamageMessage(this.actor, this).addMessage(options);
    debug("checking for critical/normal effects on this damage roll");
    const reminder = new CriticalReminder(this.actor, getTarget(), this);
    reminder.updateOptions(options);
  }

  return wrapped(options);
}

function addMessageHook(dialog, html, data) {
  debug("addMessageHook function called");

  const message = dialog.options["adv-reminder"]?.message;
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
 * Check if the user is holding down a fast-forward key for a damage roll.
 * @param {object} [options] the options
 * @param {Event} [options.event] the triggering event
 * @param {object} [options.options] the nested options
 * @returns {boolean} true if they are fast-forwarding, false otherwise
 */
function isFastForwardingDamage({ event = {}, options = {} }) {
  // special handling for MRE and damage rolls, always process since it will run after this module
  if (game.modules.get("mre-dnd5e")?.active) return false;
  return isFastForwarding({ fastForward: options.fastForward, event });
}

/**
 * Get the first targeted actor, if there are any targets at all.
 * @returns {Actor5e} the first target, if there are any
 */
function getTarget() {
  return [...game.user.targets][0]?.actor;
}
