import { AbilitySaveFail } from "./fails.js";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
} from "./reminders.js";
import { registerSettings, fetchSettings } from "./settings.js";
import { debug, log } from "./util.js";

Hooks.once("init", () => {
  log("initializing Advantage Reminder");
  registerSettings();
  fetchSettings();

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
});

function onRollAttack(wrapped, options) {
  debug("onRollAttack method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this attack roll");
    const reminder = new AttackReminder(this.actor, getTarget(), this);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(options);
}

function onRollAbilitySave(wrapped, abilityId, options) {
  debug("onRollAbilitySave method called");

  // check if an effect says to fail this roll
  const failChecker = new AbilitySaveFail(this, abilityId);
  if (failChecker.failCheck()) {
    return null;
  }

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this saving throw");
    const reminder = new AbilitySaveReminder(this, abilityId);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(abilityId, options);
}

function onRollAbilityTest(wrapped, abilityId, options) {
  debug("onRollAbilityTest method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this ability check");
    const reminder = new AbilityCheckReminder(this, abilityId);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(abilityId, options);
}

function onRollSkill(wrapped, skillId, options) {
  debug("onRollSkill method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this skill check");
    const reminder = new SkillReminder(this, skillId);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(skillId, options);
}

function onRollToolCheck(wrapped, options) {
  debug("onRollToolCheck method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this tool check");
    const reminder = new AbilityCheckReminder(
      this.actor,
      this.data.data.ability
    );
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(options);
}

function onRollDeathSave(wrapped, options) {
  debug("onRollDeathSave method called");

  // check for adv/dis flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for adv/dis effects on this death save");
    const reminder = new DeathSaveReminder(this);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(options);
}

function onRollDamage(wrapped, options) {
  debug("onRollDamage method called");

  // check for critical flags unless the user pressed a fast-forward key
  const isFF = isFastForwarding(options);
  if (isFF) {
    debug("held down a fast-foward key, skip checking for adv/dis");
  } else {
    debug("checking for critical/normal effects on this damage roll");
    const reminder = new CriticalReminder(this.actor, getTarget(), this);
    reminder.updateOptions(options);
    createRenderDialogHook(options);
  }

  return wrapped(options);
}

/**
 * Check if the user is holding down a fast-forward key.
 * @param {Event} event the event
 * @returns {Boolean} true if they are fast-forwarding, false otherwise
 */
function isFastForwarding(options) {
  return !!(options.fastForward || options.event?.shiftKey || options.event?.altKey || options.event?.ctrlKey || options.event?.metaKey);
}

/**
 * Get the first targeted actor, if there are any targets at all.
 * @returns {Actor5e} the first target, if there are any
 */
function getTarget() {
  return [...game.user.targets][0]?.actor;
}

/**
 * Create a renderDialog Hook that unregister itself once done. This hook check that the created dialog id matches the id passed as an argument.
 * @param {Object} options the object created while parsing the effects flags
 */
function createRenderDialogHook(options) {
  const callback = (dialog, html) => {
    if (dialog.options.id !== (options.dialogOptions?.id || options.options?.dialogOptions?.id)) return;
    rollDialogUpdater(dialog, html, options);
    Hooks.off("renderDialog", callback);
  }

  Hooks.on("renderDialog", callback);
}

/**
 * Update the roll window with the custom adv/dis/crits/normalCrits.
 * @param {Dialog} dialog the rendered dialog
 * @param {jQuery} html The HTML content of the dialog
 * @param {Array} [options.customAdvantages] the custom advantages to display
 * @param {Array} [options.customDisadvantages] the custom disadvantages to display
 * @param {Array} [options.customCrits] the custom criticals to display
 * @param {Array} [options.customNormals] the custom "normal" criticals to display
 */
function rollDialogUpdater(dialog, html, { customAdvantages = [], customDisadvantages = [], customCrits = [], customNormals = [] } = {}) {
  if (!customAdvantages.length && !customDisadvantages.length && !customCrits.length && !customNormals.length) return;

  const htmlContent = html.find('.dialog-content');

  let customAdvantagesContent = "";
  let customDisadvantagesContent = "";
  let customCritsContent = "";
  let customNormalsContent = "";

  customAdvantages.forEach((adv) => customAdvantagesContent += `<li><b>${game.i18n.localize("DND5E.Advantage")} :</b> ${adv.value} (${adv.label})</li>`);
  customDisadvantages.forEach((dis) => customDisadvantagesContent += `<li><b>${game.i18n.localize("DND5E.Disadvantage")} :</b> ${dis.value} (${dis.label})</li>`);
  customCrits.forEach((crit) => customCritsContent += `<li><b>${game.i18n.localize("DND5E.CriticalHit")} :</b> ${crit.value} (${crit.label})</li>`);
  customNormals.forEach((norm) => customNormalsContent += `<li><b>${game.i18n.localize("adv-reminder.no-critical")} :</b> ${norm.value} (${norm.label})</li>`);

  htmlContent.append(
    `
      <div class="custom-flags">
        ${[customAdvantagesContent, customDisadvantagesContent, customCritsContent, customNormalsContent].map((content, index) => { if (content) { return `<ul>${content}</ul>` } }).join('')}
      </div>
    `
  );

  dialog.setPosition({ height: 'auto' });
}