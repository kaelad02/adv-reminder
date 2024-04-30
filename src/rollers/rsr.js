import { AbilitySaveFail } from "../fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  ConcentrationMessage,
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
  ConcentrationSource,
  CriticalSource,
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

      // register another hook for CriticalReminder
      Hooks.on("dnd5e.useItem", this.useItem.bind(this));  
    });
  }

  preRollAttack(item, config) {
    debug("preRollAttack hook called");

    const target = getTarget();
    const distanceFn = getDistanceToTargetFn(config.messageData.speaker);

    if (this._doMessages(config)) {
      new AttackMessage(item.actor, target, item).addMessage(config);
      if (showSources) new AttackSource(item.actor, target, item, distanceFn).updateOptions(config);
    }

    if (this._doReminder(config))
      new AttackReminder(item.actor, target, item, distanceFn).updateOptions(config);
  }

  preRollAbilitySave(actor, config, abilityId) {
    debug("preRollAbilitySave hook called");

    const failChecker = new AbilitySaveFail(actor, abilityId);
    if (failChecker.fails(config)) return false;

    if (this._doMessages(config)) {
      new AbilitySaveMessage(actor, abilityId).addMessage(config);
      if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(config);
    }

    if (this._doReminder(config)) new AbilitySaveReminder(actor, abilityId).updateOptions(config);
  }

  preRollConcentration(actor, options) {
    debug("preRollConcentration hook called");

    if (this._doMessages(options)) {
      new ConcentrationMessage(actor, options.ability).addMessage(options);
      if (showSources) new ConcentrationSource(actor, options.ability).updateOptions(options);
    }
    // don't need a reminder, the system will set advantage/disadvantage
  }

  preRollAbilityTest(actor, config, abilityId) {
    debug("preRollAbilityTest hook called");

    if (this._doMessages(config)) {
      new AbilityCheckMessage(actor, abilityId).addMessage(config);
      if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(config);
    }

    if (this._doReminder(config)) new AbilityCheckReminder(actor, abilityId).updateOptions(config);
  }

  preRollSkill(actor, config, skillId) {
    debug("preRollSkill hook called");

    const ability = config.data.defaultAbility;
    if (this._doMessages(config)) {
      new SkillMessage(actor, ability, skillId).addMessage(config);
      if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(config);
    }

    if (this._doReminder(config))
      new SkillReminder(actor, ability, skillId, this.checkArmorStealth).updateOptions(config);
  }

  preRollToolCheck(actor, config, toolId) {
    debug("preRollToolCheck hook called");

    const ability = config.data.defaultAbility;
    if (this._doMessages(config)) {
      new AbilityCheckMessage(actor, ability).addMessage(config);
      if (showSources)
        new AbilityCheckSource(actor, ability).updateOptions(config);
    }

    if (this._doReminder(config))
      new AbilityCheckReminder(actor, ability).updateOptions(config);
  }

  preRollDeathSave(actor, config) {
    debug("preRollDeathSave hook called");

    if (this._doMessages(config)) {
      new DeathSaveMessage(actor).addMessage(config);
      if (showSources) new DeathSaveSource(actor).updateOptions(config);
    }

    if (this._doReminder(config)) new DeathSaveReminder(actor).updateOptions(config);
  }

  preRollDamage(item, config) {
    debug("preRollDamage hook called");

    const target = getTarget();

    if (this._doMessages(config)) {
      new DamageMessage(item.actor, target, item).addMessage(config);
      if (showSources) new CriticalSource(item.actor, target, item, distanceFn).updateOptions(config);
    }
    // don't use CriticalReminder here, it's done in another hook
  }

  useItem(item, config, options) {
    debug("useItem hook called");

    // check for critical hits but set the "isCrit" property instead of the default "critical"
    const target = getTarget();
    new CriticalReminder(item.actor, target, item, distanceFn).updateOptions(config, "isCrit");
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
