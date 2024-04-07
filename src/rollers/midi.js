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
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSource,
  ConcentrationSource,
  CriticalSource,
  DeathSaveSource,
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

  preRollAttack(item, config) {
    debug("preRollAttack hook called");

    if (this.isFastForwarding(config)) return;
    const target = getTarget();

    new AttackMessage(item.actor, target, item).addMessage(config);
    if (showSources) new AttackSource(item.actor, target, item).updateOptions(config);
  }

  preRollAbilitySave(actor, config, abilityId) {
    debug("preRollAbilitySave hook called");

    if (this.isFastForwarding(config)) return;

    new AbilitySaveMessage(actor, abilityId).addMessage(config);
    if (showSources) new AbilitySaveSource(actor, abilityId).updateOptions(config);
  }

  preRollConcentration(actor, options) {
    debug("preRollConcentration hook called");

    if (this.isFastForwarding(options)) return;

    new ConcentrationMessage(actor, options.ability).addMessage(options);
    if (showSources) new ConcentrationSource(actor, options.ability).updateOptions(options);
  }

  preRollAbilityTest(actor, config, abilityId) {
    debug("preRollAbilityTest hook called");

    if (this.isFastForwarding(config)) return;

    new AbilityCheckMessage(actor, abilityId).addMessage(config);
    if (showSources) new AbilityCheckSource(actor, abilityId).updateOptions(config);
  }

  preRollSkill(actor, config, skillId) {
    debug("preRollSkill hook called");

    if (this.isFastForwarding(config)) return;

    const ability = config.data.defaultAbility;
    new SkillMessage(actor, ability, skillId).addMessage(config);
    if (showSources) new SkillSource(actor, ability, skillId, true).updateOptions(config);
  }

  preRollToolCheck(actor, config, toolId) {
    debug("preRollToolCheck hook called");

    if (this.isFastForwarding(config)) return;

    const ability = config.data.defaultAbility;
    new AbilityCheckMessage(actor, ability).addMessage(config);
    if (showSources) new AbilityCheckSource(actor, ability).updateOptions(config);
  }

  preRollDeathSave(actor, config) {
    debug("preRollDeathSave hook called");

    if (this.isFastForwarding(config)) return;

    new DeathSaveMessage(actor).addMessage(config);
    if (showSources) new DeathSaveSource(actor).updateOptions(config);
  }

  preRollDamage(item, config) {
    debug("preRollDamage hook called");

    if (this.isFastForwarding(config)) return;
    const target = getTarget();
    // use distance from Midi's Workflow
    const distanceFn = () => {
      const workflow = MidiQOL.Workflow.getWorkflow(item.uuid);
      if (!workflow) return Infinity;
      const firstTarget = workflow.hitTargets.values().next().value;
      return MidiQOL.computeDistance(firstTarget, workflow.token, false);
    }

    new DamageMessage(item.actor, target, item).addMessage(config);
    if (showSources) new CriticalSource(item.actor, target, item, distanceFn).updateOptions(config);
  }
}
