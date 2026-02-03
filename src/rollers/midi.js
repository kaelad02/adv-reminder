import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  ConcentrationMessage,
  DamageMessage,
  DeathSaveMessage,
  InitiativeMessage,
  SkillMessage,
  ToolMessage,
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
  ToolSource,
} from "../sources.js";
import { showSources } from "../settings.js";
import { debug, getTarget } from "../util.js";
import CoreRollerHooks from "./core.js";

/**
 * A mixin to change how flags on the Actor are processed.
 * For Midi's purposes, look at `flags.midi.evaluated` in addition to `flags.midi-qol`. Have to look at both because
 * `flags.midi.evaluated` doesn't always have the normal adv/dis flags in it (i.e. when using `Custom | 1`).
 * At least we don't have to evaluate the conditional expressions ourselves.
 */
const EvaluatedMixin = (superclass) => class extends superclass {
  _getFlags(actor) {
    if (!actor) return {};

    // flags.midi.evaluated is not reliable in version 12.4.64 (last v12 version) so use 13.0.8 as the minimum version
    //if (!isMinVersion("midi-qol", "13.0.7")) return super._getFlags(actor);

    // start with the normal flags and swap the Array for Set
    const flags = super._getFlags(actor);
    for (const key of Object.keys(flags)) {
      flags[key] = new Set(flags[key]);
    }

    // process flags.midi.evaluated
    const process = (obj, path) => {
      if (!obj) return;  // no object, stop processing
      if (obj.effects && obj.value) {
        // found an evaluated flag, add to result
        if (!flags[path]) flags[path] = new Set();
        for (const name of obj.effects) {
          const effect = actor.appliedEffects.find(e => e.name === name);
          if (effect) flags[path].add(effect.link);
          else flags[path].add(name);
        }
      } else {
        // go deeper, recursion call
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          process(value, newPath);
        }
      }
    };
    process(actor.flags?.midi?.evaluated);

    // turn the Set back into an Array
    for (const key of Object.keys(flags)) {
      flags[key] = flags[key].toObject();
    }
    return flags;
  }
}

class MidiAbilityCheckSource extends EvaluatedMixin(AbilityCheckSource) {}
class MidiAbilitySaveSource extends EvaluatedMixin(AbilitySaveSource) {}
class MidiAttackSource extends EvaluatedMixin(AttackSource) {}
class MidiConcentrationSource extends EvaluatedMixin(ConcentrationSource) {}
class MidiCriticalSource extends EvaluatedMixin(CriticalSource) {}
class MidiDeathSaveSource extends EvaluatedMixin(DeathSaveSource) {}
class MidiInitiativeSource extends EvaluatedMixin(InitiativeSource) {}
class MidiSkillSource extends EvaluatedMixin(SkillSource) {}

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
    if (showSources) new MidiAttackSource(activity.actor, target, activity, distanceFn).updateOptions(dialog);
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
    if (showSources) new MidiAbilitySaveSource(actor, abilityId).updateOptions(dialog);
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
    if (showSources) new MidiConcentrationSource(actor, abilityId).updateOptions(dialog);
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
    if (showSources) new MidiAbilityCheckSource(actor, abilityId).updateOptions(dialog);
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
    if (showSources) new MidiSkillSource(actor, ability, skillId).updateOptions(dialog);
  }

  preRollToolV2(config, dialog, message) {
    debug("preRollToolV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    const ability = config.ability;
    const toolId = config.tool;
    new ToolMessage(actor, ability, toolId).addMessage(dialog);
    if (showSources) new ToolSource(actor, ability, toolId).updateOptions(dialog);
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
    if (showSources) new MidiInitiativeSource(actor, abilityId).updateOptions(dialog);
  }

  preRollDeathSaveV2(config, dialog, message) {
    debug("preRollDeathSaveV2 hook called");

    // check if we've already processed this roll
    if (config[CoreRollerHooks.PROCESSED_PROP]) return;
    config[CoreRollerHooks.PROCESSED_PROP] = true;

    if (this.isFastForwarding(config, dialog)) return;

    const actor = config.subject;
    new DeathSaveMessage(actor).addMessage(dialog);
    if (showSources) new MidiDeathSaveSource(actor).updateOptions(dialog);
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
      const source = new MidiCriticalSource(activity.actor, target, activity, distanceFn);
      // use Midi's workflow to check for a critical hit, not the standard check w/ the event
      source._applyNat20 = function(counts) {
        const criticalHit = config.workflow?.attackRoll?.isCritical;
        if (criticalHit) {
          const value = config.workflow.attackRoll.d20.total;
          counts.critical.labels.push(game.i18n.format("adv-reminder.Source.Critical.nat20", { value }));
        }
      };
      source.updateOptions(dialog);
    }
  }
}
