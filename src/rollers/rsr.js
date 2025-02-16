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
import CoreRollerHooks from "./core.js";

// disable the grants.critical.range flag since RSR can't have it's critical flag changed anyways,
// only set by the attack roll
const distanceFn = () => Infinity;

/**
 * Setup the dnd5e.preRoll hooks for use with Ready Set Roll.
 */
export default class ReadySetRollHooks extends CoreRollerHooks {
  init() {
    // delay registering these dnd5e hooks so they run after RSR's hooks
    Hooks.once("setup", () => {
      super.init(); 
    });
  }

  preRollAttackV2(config, dialog, message) {

    debug("preRollAttackV2 hook called");


    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);
    const activity = config.subject;

    if (this._doMessages(config)) {

      new AttackMessageV2(activity.actor, target, activity).addMessage(dialog);

      if (showSources) new AttackSourceV2(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    }

    if (this._doReminder(config))
      new AttackReminderV2(activity.actor, target, activity, distanceFn).updateOptions(config.rolls[0].options);
  }

  preRollSavingThrowV2(config, dialog, message){
    debug("preRollSavingThrowV2 hook called");

    const failChecker = new AbilitySaveFail(config.subject, config.ability);
    if (failChecker.fails(config)) return false;

    if (this._doMessages(config)) {
      new AbilitySaveMessage(config.subject, config.ability).addMessage(dialog);
      if (showSources) new AbilitySaveSource(config.subject, config.ability).updateOptions(dialog);
    }

    if (this._doReminder(config)) new AbilitySaveReminder(config.subject, config.ability).updateOptions(config.rolls[0].options);
  }

  preRollConcentrationV2(config, dialog, message) {
    debug("preRollConcentrationV2 hook called");

    if (this._doMessages(options)) {
      new ConcentrationMessage(config.subject, config.ability).addMessage(dialog);
    if (showSources) new ConcentrationSource(config.subject, config.ability).updateOptions(dialog);
    }
    // don't need a reminder, the system will set advantage/disadvantage
  }

  preRollAbilityCheckV2(config, dialog, message)  {
    debug("preRollAbilityCheckV2 hook called");

    if (this._doMessages(config)) {
      new AbilityCheckMessage(config.subject, config.ability).addMessage(dialog);
      if (showSources) new AbilityCheckSource(config.subject, config.ability).updateOptions(dialog);
    }

    if (this._doReminder(config)) new AbilityCheckReminder(config.subject, config.ability).updateOptions(config.rolls[0].options); 
  }

  preRollSkillV2(config, dialog, message) {
    debug("preRollSkillV2 hook called");
    
    if (this._doMessages(config)) {
      new SkillMessage(config.subject, config.ability, config.skill).addMessage(dialog);
    if (showSources) new SkillSource(config.subject, config.ability, config.skill, true).updateOptions(dialog);
    }

    if (this._doReminder(config))
      new SkillReminder(config.subject, config.ability, config.skill, this.checkArmorStealth).updateOptions(config.rolls[0].options);
  }

  // preRollToolCheck(actor, config, toolId) {
  //   debug("preRollToolCheck hook called");

  //   const ability = config.data.defaultAbility;
  //   if (this._doMessages(config)) {
  //     new AbilityCheckMessage(actor, ability).addMessage(config);
  //     if (showSources)
  //       new AbilityCheckSource(actor, ability).updateOptions(config);
  //   }

  //   if (this._doReminder(config))
  //     new AbilityCheckReminder(actor, ability).updateOptions(config);
  // }

  preRollDeathSaveV2(config, dialog, message) {
    debug("preRollDeathSaveV2 hook called");

    if (this._doMessages(config)) {
      new DeathSaveMessage(config.subject).addMessage(dialog);
    if (showSources) new DeathSaveSource(config.subject).updateOptions(dialog);
    }

    if (this._doReminder(config)) new DeathSaveReminder(config.subject).updateOptions(config.rolls[0].options);
  }

  preRollDamageV2(config, dialog, message) {

    debug("preRollDamageV2 hook called");

    // damage/healing enricher doesn't have an item, skip
    if (!config.subject) return;

    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);
    const activity = config.subject;

    if (this._doMessages(config)) {

      new DamageMessageV2(activity.actor, target, activity).addMessage(dialog);
      if (showSources) new CriticalSourceV2(activity.actor, target, activity, distanceFn).updateOptions(dialog);
      const reminder = new CriticalReminderV2(activity.actor, target, activity, distanceFn);
      config.rolls.forEach(roll => reminder.updateOptions(roll.options, "isCritical"));
    }
  }

  _doMessages({ fastForward = false }) {
    if (fastForward) debug("fast-forwarding the roll, skip messages");
    return !fastForward;
  }

  _doReminder({ advantage = false, disadvantage = false }) {
    if (advantage) debug("advantage already set, skip reminder checks");
    if (disadvantage) debug("disadvantage already set, skip reminder checks");
    return !(advantage || disadvantage);
  }
}
