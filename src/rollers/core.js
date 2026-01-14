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
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
  InitiativeReminder,
  ConcentrationReminder,
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

/**
 * Setup the dnd5e.preRoll hooks for use with the core roller.
 */
export default class CoreRollerHooks {
  /**
   * Property name to indicate we've already processed this roll.
   */
  static PROCESSED_PROP = "adv-reminder-processed";

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
    Hooks.on("dnd5e.preRollSavingThrowV2", this.preRollSavingThrowV2.bind(this));
    Hooks.on("dnd5e.preRollConcentrationV2", this.preRollConcentrationV2.bind(this));
    Hooks.on("dnd5e.preRollAbilityCheckV2", this.preRollAbilityCheckV2.bind(this));
    Hooks.on("dnd5e.preRollSkillV2", this.preRollSkillV2.bind(this));
    Hooks.on("dnd5e.preRollInitiativeDialogV2", this.preRollInitiativeDialogV2.bind(this));
    Hooks.on("dnd5e.preRollDeathSaveV2", this.preRollDeathSaveV2.bind(this));
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

    new AttackMessage(activity.actor, target, activity).addMessage(dialog);
    if (showSources) new AttackSource(activity.actor, target, activity, distanceFn).updateOptions(dialog);
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

    if (this.isFastForwarding(config, dialog)) return;

    new AbilitySaveMessage(actor, abilityId).addMessage(dialog);
    if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(dialog);
    new AbilitySaveReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollConcentrationV2(config, dialog, message) {
    debug("preRollConcentrationV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const abilityId = config.ability;
    new ConcentrationMessage(actor, abilityId).addMessage(dialog);
    if (showSources) new ConcentrationSource(actor, abilityId).updateOptions(dialog);
    new ConcentrationReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollAbilityCheckV2(config, dialog, message) {
    debug("preRollAbilityCheckV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const abilityId = config.ability;
    new AbilityCheckMessage(actor, abilityId).addMessage(dialog);
    if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(dialog);
    new AbilityCheckReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollSkillV2(config, dialog, message) {
    debug("preRollSkillV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const ability = config.ability;
    const skillId = config.skill;
    new SkillMessage(actor, ability, skillId).addMessage(dialog);
    if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(dialog);
    new SkillReminder(actor, ability, skillId, this.checkArmorStealth).updateOptions(config.rolls[0].options);
  }

  preRollInitiativeDialogV2(config, dialog, message) {
    debug("preRollInitiativeDialogV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const abilityId = actor.system.attributes?.init?.ability || CONFIG.DND5E.defaultAbilities.initiative;
    new InitiativeMessage(actor, abilityId).addMessage(dialog);
    if (showSources) new InitiativeSource(actor, abilityId).updateOptions(dialog);
    new InitiativeReminder(actor, abilityId).updateOptions(config.rolls[0].options);
  }

  preRollDeathSaveV2(config, dialog, message) {
    debug("preRollDeathSaveV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    new DeathSaveMessage(actor).addMessage(dialog);
    if (showSources) new DeathSaveSource(actor).updateOptions(dialog);
    new DeathSaveReminder(actor).updateOptions(config.rolls[0].options);
  }

  preRollDamageV2(config, dialog, message) {
    debug("preRollDamageV2 hook called", config, dialog, message);

    if (this.isFastForwarding(config, dialog)) return;
    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(message.data.speaker);
    const activity = config.subject;

    // damage/healing enricher doesn't have an activity, skip
    if (!activity) return;

    new DamageMessage(activity.actor, target, activity).addMessage(dialog);
    if (showSources) new CriticalSource(activity.actor, target, activity, distanceFn).updateOptions(dialog);
    const reminder = new CriticalReminder(activity.actor, target, activity, distanceFn);
    config.rolls.forEach(roll => reminder.updateOptions(roll.options));
    
    // workaround for https://github.com/foundryvtt/dnd5e/issues/5455
    if (config.rolls[0].options?.isCritical) {
      dialog.options.defaultButton = "critical";
    }
  }

  /**
   * Check if the roll is being fast-forwarded. Copied from the system's D20Roll#applyKeybindings function.
   * @param {Event} event the triggering event
   * @param {boolean} configure whether or not to show the dialog
   * @returns {boolean} true if they are fast-forwarding, false otherwise
   */
  isFastForwarding({ event }, { configure } = {}) {
    debug("before checking FF, configure:", configure);
    const keys = {
      normal: dnd5e.utils.areKeysPressed(event, "skipDialogNormal"),
      advantage: dnd5e.utils.areKeysPressed(event, "skipDialogAdvantage"),
      disadvantage: dnd5e.utils.areKeysPressed(event, "skipDialogDisadvantage")
    };
    configure ??= !Object.values(keys).some(k => k);
    if (!configure) debug("fast-forwarding the roll, stop processing");
    return !configure;
  }
}
