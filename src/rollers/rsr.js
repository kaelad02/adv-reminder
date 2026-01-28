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
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  ConcentrationReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
  InitiativeReminder,
} from "../reminders.js";
import {
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSource,
  ConcentrationSource,
  CriticalSource,
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

    if (this._doMessages(dialog)) {
      new AttackMessage(activity.actor, target, activity).addMessage(dialog);
      if (showSources) new AttackSource(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    }

    if (this._doReminder(message))
      new AttackReminder(activity.actor, target, activity, distanceFn).updateOptions(config.rolls[0].options);
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

    if (this._doMessages(dialog)) {
      new AbilitySaveMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(message)) new AbilitySaveReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollConcentrationV2(config, dialog, message) {
    debug("preRollConcentrationV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = config.ability;
    if (this._doMessages(dialog)) {
      new ConcentrationMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new ConcentrationSource(actor, abilityId).updateOptions(dialog);
    }
    if (this._doReminder(message)) new ConcentrationReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollAbilityCheckV2(config, dialog, message) {
    debug("preRollAbilityCheckV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = config.ability;
    if (this._doMessages(dialog)) {
      new AbilityCheckMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(message)) new AbilityCheckReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollSkillV2(config, dialog, message) {
    debug("preRollSkillV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const ability = config.ability;
    const skillId = config.skill;
    if (this._doMessages(dialog)) {
      new SkillMessage(actor, ability, skillId).addMessage(dialog);
      if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(dialog);
    }

    if (this._doReminder(message))
      new SkillReminder(actor, ability, skillId, this.checkArmorStealth).updateOptions(config.rolls[0].options);
  }

  preRollInitiativeDialogV2(config, dialog, message) {
    debug("preRollInitiativeDialogV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    const abilityId = actor.system.attributes?.init?.ability || CONFIG.DND5E.defaultAbilities.initiative;
    if (this._doMessages(dialog)) {
      new InitiativeMessage(actor, abilityId).addMessage(dialog);
      if (showSources) new InitiativeSource(actor, abilityId).updateOptions(dialog);
    }

    if (this._doReminder(message))
      new InitiativeReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollDeathSaveV2(config, dialog, message) {
    debug("preRollDeathSaveV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    const actor = config.subject;
    if (this._doMessages(dialog)) {
      new DeathSaveMessage(actor).addMessage(dialog);
      if (showSources) new DeathSaveSource(actor).updateOptions(dialog);
    }

    if (this._doReminder(message)) new DeathSaveReminder(actor).updateOptions(config.rolls[0].options);
  }

  preRollDamageV2(config, dialog, message) {
    debug("preRollDamageV2 hook called");

    const activity = config.subject;

    // damage/healing enricher doesn't have an activity, skip
    if (!activity) return;

    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);

    if (this._doMessages(dialog)) {
      new DamageMessage(activity.actor, target, activity).addMessage(dialog);
      if (showSources) new CriticalSource(activity.actor, target, activity, distanceFn, config.event).updateOptions(dialog);
      new CriticalReminder(activity.actor, target, activity, distanceFn).updateOptions(config);

      // workaround for https://github.com/foundryvtt/dnd5e/issues/5455
      dialog.options.defaultButton = config.isCritical ? "critical" : "normal";
    }
  }

  _doMessages(dialog) {
    // RSR will already set dialog.configure, just return it
    if (!dialog.configure) debug("fast-forwarding the roll, skip messages");
    return dialog.configure;
  }

  _doReminder(message) {
    // RSR saves the adv/dis key presses in the message
    const rsrFlags = message.data?.flags?.rsr5e;
    if (rsrFlags?.advantage) debug("advantage already set, skip reminder checks");
    if (rsrFlags?.disadvantage) debug("disadvantage already set, skip reminder checks");
    return !(rsrFlags?.advantage || rsrFlags?.disadvantage);
  }
}
