import { AbilitySaveFail } from "../fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  DamageMessage,
  DeathSaveMessage,
  SkillMessage,
} from "../messages.js";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
} from "../reminders.js";
import {
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSource,
  CriticalSource,
  DeathSaveSource,
  SkillSource,
} from "../sources.js";
import { showSources } from "../settings.js";
import { debug, getTarget } from "../util.js";

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
    Hooks.on("dnd5e.preRollAttack", this.preRollAttack.bind(this));
    Hooks.on("dnd5e.preRollAbilitySave", this.preRollAbilitySave.bind(this));
    Hooks.on("dnd5e.preRollAbilityTest", this.preRollAbilityTest.bind(this));
    Hooks.on("dnd5e.preRollSkill", this.preRollSkill.bind(this));
    Hooks.on("dnd5e.preRollToolCheck", this.preRollToolCheck.bind(this));
    Hooks.on("dnd5e.preRollDeathSave", this.preRollDeathSave.bind(this));
    Hooks.on("dnd5e.preRollDamage", this.preRollDamage.bind(this));
  }

  /**
   * Returns a boolean to tell whether or not to handle Midi's flags
   * @returns true to register a hook to handle Midi's flags, false otherwise
   */
  shouldApplyMidiActiveEffect() {
    return true;
  }

  preRollAttack(item, config) {
    debug("preRollAttack hook called");

    if (this.isFastForwarding(config)) return;
    const target = getTarget();

    new AttackMessage(item.actor, target, item).addMessage(config);
    if (showSources) new AttackSource(item.actor, target, item).updateOptions(config);
    new AttackReminder(item.actor, target, item).updateOptions(config);
  }

  preRollAbilitySave(actor, config, abilityId) {
    debug("preRollAbilitySave hook called");

    const failChecker = new AbilitySaveFail(actor, abilityId);
    if (failChecker.fails(config)) return false;

    if (this.isFastForwarding(config)) return;

    new AbilitySaveMessage(actor, abilityId).addMessage(config);
    if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(config);
    new AbilitySaveReminder(actor, abilityId).updateOptions(config);
  }

  preRollAbilityTest(actor, config, abilityId) {
    debug("preRollAbilityTest hook called");

    if (this.isFastForwarding(config)) return;

    new AbilityCheckMessage(actor, abilityId).addMessage(config);
    if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(config);
    new AbilityCheckReminder(actor, abilityId).updateOptions(config);
  }

  preRollSkill(actor, config, skillId) {
    debug("preRollSkill hook called");

    if (this.isFastForwarding(config)) return;

    const ability = config.data.defaultAbility;
    new SkillMessage(actor, ability, skillId).addMessage(config);
    if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(config);
    new SkillReminder(actor, ability, skillId, this.checkArmorStealth).updateOptions(config);
  }

  preRollToolCheck(actor, config, toolId) {
    debug("preRollToolCheck hook called");

    if (this.isFastForwarding(config)) return;

    const ability = config.data.defaultAbility;
    new AbilityCheckMessage(actor, ability).addMessage(config);
    if (showSources) new AbilityCheckSource(actor, ability).updateOptions(config);
    new AbilityCheckReminder(actor, ability).updateOptions(config);
  }

  preRollDeathSave(actor, config) {
    debug("preRollDeathSave hook called");

    if (this.isFastForwarding(config)) return;

    new DeathSaveMessage(actor).addMessage(config);
    if (showSources) new DeathSaveSource(actor).updateOptions(config);
    new DeathSaveReminder(actor).updateOptions(config);
  }

  preRollDamage(item, config) {
    debug("preRollDamage hook called");

    if (this.isFastForwarding(config)) return;
    const target = getTarget();

    new DamageMessage(item.actor, target, item).addMessage(config);
    if (showSources) new CriticalSource(item.actor, target, item).updateOptions(config);
    new CriticalReminder(item.actor, target, item).updateOptions(config);
  }

  /**
   * Check if we should fast-forward the roll by checking the fastForward flag
   * and if one of the modifier keys was pressed.
   * @param {object} options
   * @param {boolean} [options.fastForward] a specific fastForward flag
   * @param {Event} [options.event] the triggering event
   * @returns {boolean} true if they are fast-forwarding, false otherwise
   */
  isFastForwarding({ fastForward = false, event = {} }) {
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
}
