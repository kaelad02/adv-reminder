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
import { debug, getTarget } from "../util.js";
import CoreRollerHooks from "./core.js";

/**
 * Setup the dnd5e.preRoll hooks for use with Midi-QOL.
 */
export default class MidiRollerHooks extends CoreRollerHooks {
  shouldApplyMidiActiveEffect() {
    return false;
  }

  preRollAttackV2(config, dialog, message) {
    debug("preRollAttackV2 hook called", config, dialog, message);

    if (this.isFastForwarding(config, dialog)) return;
    const target = getTarget();
    // use distance from Midi's Workflow
    const distanceFn = () => {
      const workflow = config.workflow;
      if (!workflow) return Infinity;
      const firstTarget = workflow.hitTargets.values().next().value;
      return MidiQOL.computeDistance(firstTarget, workflow.token);
    }
    const activity = config.subject;

    new AttackMessage(activity.actor, target, activity).addMessage(dialog);
    if (showSources) new AttackSource(activity.actor, target, activity, distanceFn).updateOptions(dialog);
  }

  preRollSavingThrowV2(config, dialog, message) {
    debug("preRollSavingThrowV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const abilityId = config.ability;
    new AbilitySaveMessage(actor, abilityId).addMessage(dialog);
    if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(dialog);
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
  }

  preRollDamageV2(config, dialog, message) {
    debug("preRollDamageV2 hook called", config, dialog, message);

    if (this.isFastForwarding(config, dialog)) return;
    const target = getTarget();
    // use distance from Midi's Workflow
    const distanceFn = () => {
      const workflow = config.workflow;
      if (!workflow) return Infinity;
      const firstTarget = workflow.hitTargets.values().next().value;
      return MidiQOL.computeDistance(firstTarget, workflow.token);
    }
    const activity = config.subject;

    // damage/healing enricher doesn't have an activity, skip
    if (!activity) return;

    new DamageMessage(activity.actor, target, activity).addMessage(dialog);
    if (showSources) {
      const source = new CriticalSource(activity.actor, target, activity, distanceFn);
      // use Midi's workflow to check for a critical hit, not the standard check w/ the event
      source._customUpdateOptions = function(accumulator) {
        const criticalHit = config.workflow?.attackRoll?.isCritical;
        if (criticalHit) accumulator.critical(game.i18n.localize("DND5E.CriticalHit"));
      };
      source.updateOptions(dialog);
    }
  }
}
