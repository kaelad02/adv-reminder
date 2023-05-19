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
import CoreRollerHooks from "./core.js";

/**
 * Setup the dnd5e.preRoll hooks for use with Ready Set Roll.
 */
export default class ReadySetRollHooks extends CoreRollerHooks {
  preRollAttack(item, config) {
    debug("preRollAttack hook called");

    const target = getTarget();

    if (this._doMessages(config)) {
      new AttackMessage(item.actor, target, item).addMessage(config);
      if (showSources) new AttackSource(item.actor, target, item).updateOptions(config);
    }

    if (this._doReminder(config))
      new AttackReminder(item.actor, target, item).updateOptions(config);
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

    if (this._doMessages(config)) {
      new SkillMessage(actor, skillId).addMessage(config);
      if (showSources) new SkillSource(actor, skillId, true).updateOptions(config);
    }

    if (this._doReminder(config))
      new SkillReminder(actor, skillId, this.checkArmorStealth).updateOptions(config);
  }

  preRollToolCheck(item, config) {
    debug("preRollToolCheck hook called");

    if (this._doMessages(config)) {
      new AbilityCheckMessage(item.actor, item.system.ability).addMessage(config);
      if (showSources)
        new AbilityCheckSource(item.actor, item.system.ability).updateOptions(config);
    }

    if (this._doReminder(config))
      new AbilityCheckReminder(item.actor, item.system.ability).updateOptions(config);
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
      if (showSources) new CriticalSource(item.actor, target, item).updateOptions(config);
    }

    // don't use CriticalReminder because it causes problems with the damage roll
    // TODO https://github.com/MangoFVTT/fvtt-ready-set-roll-5e/issues/184
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
