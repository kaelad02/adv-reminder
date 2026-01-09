import { AbilitySaveFail } from "../fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  ConcentrationMessage,
  DamageMessage,
  DeathSaveMessage,
  InitiativeMessage,
  SkillMessage,
} from "../messages.js";
import {
  AttackReminderV2,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminderV2,
  DeathSaveReminder,
  SkillReminder,
  InitiativeReminder,
} from "../reminders.js";
import {
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSourceV2,
  ConcentrationSource,
  CriticalSourceV2,
  DeathSaveSource,
  InitiativeSource,
  SkillSource,
} from "../sources.js";
import { showSources } from "../settings.js";
import { debug, getDistanceToTargetFn, getTarget } from "../util.js";
import CoreRollerHooks from "./core.js";

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
      new AttackMessage(activity.actor, target, activity).addMessage(dialog);
      if (showSources) new AttackSourceV2(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    }

    if (this._doReminder(config))
      new AttackReminderV2(activity.actor, target, activity, distanceFn).updateOptions(config.rolls[0].options);
  }

  preRollSavingThrowV2(config, dialog, message) {
    debug("preRollSavingThrowV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = config.ability;
    const failChecker = new AbilitySaveFail(actor, abilityId);
    if (failChecker.fails(message)) return false;

    if (this._doMessages(config)) {
      new AbilitySaveMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(config)) new AbilitySaveReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollConcentrationV2(config, dialog, message) {
    debug("preRollConcentrationV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this._doMessages(config)) {
      const actor = config.subject;
      new ConcentrationMessage(actor, config.ability).addMessage(dialog);
      if (showSources) new ConcentrationSource(actor, config.ability).updateOptions(dialog);
    }
    // don't need a reminder, the system will set advantage/disadvantage
  }

  preRollAbilityCheckV2(config, dialog, message) {
    debug("preRollAbilityCheckV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = config.ability;
    if (this._doMessages(config)) {
      new AbilityCheckMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(config)) new AbilityCheckReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollSkillV2(config, dialog, message) {
    debug("preRollSkillV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const ability = config.ability;
    const skillId = config.skill;
    if (this._doMessages(config)) {
      new SkillMessage(actor, ability, skillId).addMessage(dialog);
      if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(dialog);
    }

    if (this._doReminder(config))
      new SkillReminder(actor, ability, skillId, this.checkArmorStealth).updateOptions(config.rolls[0].options);
  }

  preRollInitiativeDialogV2(config, dialog, message) {
    debug("preRollInitiativeDialogV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = actor.system.attributes?.init?.ability || CONFIG.DND5E.defaultAbilities.initiative;
    if (this._doMessages(config)) {
      new InitiativeMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new InitiativeSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(config))
      new InitiativeReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollDeathSaveV2(config, dialog, message) {
    debug("preRollDeathSaveV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    if (this._doMessages(config)) {
      new DeathSaveMessage(actor).addMessage(dialog);
      if (showSources) new DeathSaveSource(actor).updateOptions(dialog);
    }

    if (this._doReminder(config)) new DeathSaveReminder(actor).updateOptions(config.rolls[0].options);
  }

  preRollDamageV2(config, dialog, message) {
    debug("preRollDamageV2 hook called");

    const activity = config.subject;

    // damage/healing enricher doesn't have an activity, skip
    if (!activity) return;

    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);

    if (this._doMessages(config)) {
      new DamageMessage(activity.actor, target, activity).addMessage(dialog);
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
