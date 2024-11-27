import { AbilitySaveFail } from "../fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessageV2,
  ConcentrationMessage,
  DamageMessageV2,
  DeathSaveMessage,
  SkillMessage,
} from "../messages.js";
import {
  AttackReminderV2,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminderV2,
  DeathSaveReminder,
  SkillReminder,
} from "../reminders.js";
import {
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSourceV2,
  ConcentrationSource,
  CriticalSourceV2,
  DeathSaveSource,
  SkillSource,
} from "../sources.js";
import { showSources } from "../settings.js";
import { debug, getDistanceToTargetFn, getTarget } from "../util.js";

/**
 * Setup the dnd5e.preRoll hooks for use with the core roller.
 */
export default class CoreRollerHooks {
  /**
   * If true, check armor for stealth checks.
   * @type {boolean}
   */
  checkArmorStealth;

  /**
   * Initialize the hooks.
   */
  init() {
    // DAE version 0.8.81 added support for "impose stealth disadvantage"
    this.checkArmorStealth = !game.modules.get("dae")?.active;
    debug("checkArmorStealth", this.checkArmorStealth);

    // register all the dnd5e.pre hooks
    Hooks.on("dnd5e.preRollAttackV2", this.preRollAttackV2.bind(this));
    Hooks.on("dnd5e.preRollSkillV2", this.preRollSkillV2.bind(this));
    Hooks.on("dnd5e.preRollAbilityCheckV2", this.preRollAbilityCheckV2.bind(this));  
    Hooks.on("dnd5e.preRollSavingThrowV2", this.preRollSavingThrowV2.bind(this));
    //Hooks.on("dnd5e.preRollToolV2", this.preRollToolV2.bind(this));
    Hooks.on("dnd5e.preRollDeathSaveV2", this.preRollDeathSaveV2.bind(this));
    Hooks.on("dnd5e.preRollConcentrationV2", this.preRollConcentrationV2.bind(this));
    Hooks.on("dnd5e.preRollDamageV2", this.preRollDamageV2.bind(this));
  }

  /**
   * Returns a boolean to tell whether or not to handle Midi's flags
   * @returns true to register a hook to handle Midi's flags, false otherwise
   */
  shouldApplyMidiActiveEffect() {
    return true;
  }

  preRollAttackV2(config, dialog, message) {
    debug("preRollAttackV2 hook called", config, dialog, message);

    if (this.isFastForwarding(config, dialog)) return;
    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);
    const activity = config.subject;

    new AttackMessageV2(activity.actor, target, activity).addMessage(dialog);
    if (showSources) new AttackSourceV2(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    new AttackReminderV2(activity.actor, target, activity, distanceFn).updateOptions(config.rolls[0].options);
  }
  
  preRollSavingThrowV2(config, dialog, message) {
    debug("preRollAbilitySave hook called");

    const failChecker = new AbilitySaveFail(config.subject, config.ability);
    if (failChecker.fails(config)) return false;

    if (this.isFastForwarding(config, dialog)) return;

    new AbilitySaveMessage(config.subject, config.ability).addMessage(dialog);
    if (showSources) new AbilitySaveSource(config.subject, config.ability).updateOptions(dialog);
    new AbilitySaveReminder(config.subject, config.ability).updateOptions(dialog);
  }
  
  preRollConcentrationV2(config, dialog, message) {
    debug("preRollConcentration hook called");

    if (this.isFastForwarding(config, dialog)) return;

    new ConcentrationMessage(config.subject, config.ability).addMessage(dialog);
    if (showSources) new ConcentrationSource(config.subject, config.ability).updateOptions(dialog);
    // don't need a reminder, the system will set advantage/disadvantage
  }

  preRollAbilityCheckV2(config, dialog, message) {
    debug("preRollAbilityTest hook called");

    if (this.isFastForwarding(config, dialog)) return;
   
    new AbilityCheckMessage(config.subject, config.ability).addMessage(dialog);
    if (showSources) new AbilityCheckSource(config.subject, config.ability).updateOptions(dialog);
    new AbilityCheckReminder(config.subject, config.ability).updateOptions(dialog); 
  }

  preRollSkillV2(config, dialog, message) {
    debug("preRollSkillV2 hook called");
    
    if (this.isFastForwarding(config, dialog)) return;

    new SkillMessage(config.subject, config.ability, config.skill).addMessage(dialog);
    if (showSources) new SkillSource(config.subject, config.ability, config.skill, true).updateOptions(dialog);
    new SkillReminder(config.subject, config.ability, config.skill, this.checkArmorStealth).updateOptions(dialog);
  }

  /**preRollToolV2(config, dialog, message)  {//toDo: Missing Message for tools
    debug("preRollToolCheck hook called");

    if (this.isFastForwarding(config, dialog)) return;

    new AbilityCheckMessage(config.subject, config.ability).addMessage(dialog);
    if (showSources) new AbilityCheckSource(config.subject, config.ability).updateOptions(dialog);
    new AbilityCheckReminder(config.subject, config.ability).updateOptions(dialog);
  }*/

  preRollDeathSaveV2(config, dialog, message)  {
    debug("preRollDeathSave hook called");

    if (this.isFastForwarding(config, dialog)) return;

    new DeathSaveMessage(config.subject).addMessage(dialog);
    if (showSources) new DeathSaveSource(config.subject).updateOptions(dialog);
    new DeathSaveReminder(config.subject).updateOptions(dialog);
  }

  preRollDamageV2(config, dialog, message) {
    debug("preRollDamageV2 hook called", config, dialog, message);

    if (this.isFastForwarding(config, dialog)) return;
    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);
    const activity = config.subject;

    new DamageMessageV2(activity.actor, target, activity).addMessage(dialog);
    if (showSources) new CriticalSourceV2(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    const reminder = new CriticalReminderV2(activity.actor, target, activity, distanceFn);
    config.rolls.forEach(roll => reminder.updateOptions(roll.options, "isCritical"));
  }

  /**
   * Check if we should fast-forward the roll by checking the fastForward flag
   * and if one of the modifier keys was pressed.
   * @param {object} options
   * @param {boolean} [options.fastForward] a specific fastForward flag
   * @param {Event} [options.event] the triggering event
   * @param {object} dialog
   * @param {boolean} [dialog.configure] whether or not to show the dialog
   * @returns {boolean} true if they are fast-forwarding, false otherwise
   */
  isFastForwarding({ fastForward = false, event = {} }, { configure = true } = {}) {
    const isFF = !!(
      fastForward ||
      !configure ||
      dnd5e.utils.areKeysPressed(event, "skipDialogNormal") ||
      dnd5e.utils.areKeysPressed(event, "skipDialogAdvantage") ||
      dnd5e.utils.areKeysPressed(event, "skipDialogDisadvantage")
    );
    if (isFF) debug("fast-forwarding the roll, stop processing");
    return isFF;
  }
}
