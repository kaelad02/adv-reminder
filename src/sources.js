import {
  AbilityCheckReminder,
  AbilitySaveReminder,
  AdvantageAccumulator,
  AttackReminder,
  ConcentrationReminder,
  CriticalAccumulator,
  CriticalReminder,
  DeathSaveReminder,
  InitiativeReminder,
  SkillReminder,
} from "./reminders.js";
import { debug } from "./util.js";

/**
 * @typedef LabelModeData
 * @property {LabelModeOverride|null} override  Information about the source if overridden.
 * @property {LabelModeCounts} advantages       The advantage sources.
 * @property {LabelModeCounts} disadvantages    The disadvantage sources.
 */

/**
 * @typedef LabelModeOverride
 * @property {string} label    The source that overrides this mode.
 * @property {number} mode     The value of the override.
 */

/**
 * @typedef LabelModeCounts
 * @property {string[]} labels      The sources that applied this mode.
 * @property {string[]} suppressed  The sources that suppressed this mode.
 */

/**
 * A mixin to share a function override between the two label accumulators.
 */
const LabelMixin = (superClass) => class extends superClass {
  _getConditionForEffect(actor, key) {
    const props = super._getConditionForEffect(actor, key);
    return props
      // remove the number after exhaustion
      .map((k) => k.split("-").shift())
      .flatMap((k) => {
        // look for active effects with this status in it, get their names
        const activeEffectNames = actor.appliedEffects
          .filter((e) => e.statuses.some((s) => s === k))
          .map((e) => e.name);
        if (activeEffectNames.length) return activeEffectNames;
        // fallback to the status effect's name (mostly for exhaustion)
        return CONFIG.statusEffects.filter((s) => s.id === k).map((s) => s.name);
      });
  }
}

class LabelAccumulator extends LabelMixin(AdvantageAccumulator) {
  /**
   * @param {LabelModeData} counts
   */
  constructor(counts) {
    super();
    this.counts = counts;
  }

  /**
   * Apply labels from directly setting roll modes on the actor.
   * @param actor
   * @param rollModes
   */
  applyRollModes(actor, rollModes) {
    const source = actor._source;
    Object.entries(rollModes).forEach(([key, labels]) => {
      const mode = foundry.utils.getProperty(source, key);
      if (mode === 1) {
        const label = this._rollModeLabel(...labels, "DND5E.AdvantageMode");
        this.advantageLabels.push(label);
      } else if (mode === -1) {
        const label = this._rollModeLabel(...labels, "DND5E.AdvantageMode");
        this.disadvantageLabels.push(label);
      }
    });
  }

  _rollModeLabel(...labels) {
    return labels
      .map(l => game.i18n.localize(l))
      .join(" ");
  }

  /**
   * Apply labels from active effects setting roll modes.
   * @param actor
   * @param rollModes
   */
  applyRollModeEffects(actor, rollModes) {
    // copied parts from Actor#applyActiveEffects, DataField#applyChange, and AdvantageModeField

    const rollModeKeys = Object.keys(rollModes);

    // Organize non-disabled effects by their application priority
    const changes = [];
    for ( const effect of actor.allApplicableEffects() ) {
      if ( !effect.active ) continue;
      changes.push(...effect.changes
        .filter(change => rollModeKeys.includes(change.key))
        .map(change => {
          const c = foundry.utils.deepClone(change);
          c.effect = effect;
          c.priority = c.priority ?? (c.mode * 10);
          return c;
        }));
    }
    changes.sort((a, b) => a.priority - b.priority);

    // Apply the roll mode changes
    for ( let change of changes ) {
      const delta = Number(change.value);
      switch ( change.mode ) {
        case CONST.ACTIVE_EFFECT_MODES.ADD:
          this._applyChangeAdd(delta, change);
          break;
        case CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
          this._applyChangeOverride(delta, change);
          break;
        case CONST.ACTIVE_EFFECT_MODES.UPGRADE:
          this._applyChangeUpgrade(delta, change);
          break;
        case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
          this._applyChangeDowngrade(delta, change);
          break;
      }
    }
  }

  _applyChangeAdd(delta, change) {
    // Add a source of advantage or disadvantage.
    if (delta === 1) this.counts.advantages.labels.push(change.effect.name);
    else if (delta === -1) this.counts.disadvantages.labels.push(change.effect.name);
  }

  _applyChangeOverride(delta, change) {
    // Force a given roll mode.
    if (delta === -1 || delta === 0 || delta === 1)
      this.counts.override = {label: change.effect.name, mode: delta};
  }

  _applyChangeUpgrade(delta, change) {
    // Upgrade the roll so that it can no longer be penalised by disadvantage.
    if (delta !== 1 && delta !== 0) return;
    this.counts.disadvantages.suppressed.push(change.effect.name);
    if (delta === 1) this.counts.advantages.labels.push(change.effect.name);
  }

  _applyChangeDowngrade(delta, change) {
    // Downgrade the roll so that it can no longer benefit from advantage.
    if (delta !== -1 && delta !== 0) return;
    this.counts.advantages.suppressed.push(change.effect.name);
    if (delta === -1) this.counts.disadvantages.labels.push(change.effect.name);
  }

  applyFlags(actorFlags, advKeys, disKeys) {
    advKeys.forEach((key) => this.counts.advantages.labels.push(...(actorFlags[key] ?? [])));
    disKeys.forEach((key) => this.counts.disadvantages.labels.push(...(actorFlags[key] ?? [])));
  }

  applyConditions(actor, advConditions, disConditions) {
    if (!actor) return;
    const advLabels = advConditions.flatMap(c => this._getConditionForEffect(actor, c));
    this.counts.advantages.labels.push(...advLabels);
    const disLabels = disConditions.flatMap(c => this._getConditionForEffect(actor, c));
    this.counts.disadvantages.labels.push(...disLabels);
  }

  advantageIf(label) {
    if (label) this.counts.advantages.labels.push(label);
  }

  disadvantageIf(label) {
    if (label) this.counts.disadvantages.labels.push(label);
  }

  /**
   * Update the dialog options with the labels.
   * @param dialog
   */
  update(dialog) {
    debug("counts for source labels", this.counts);
    // too much logic on what to pass which would just be duplicated in renderRollConfigurationDialog hook anyway
    // pass it all and have the hook decide what to show
    foundry.utils.setProperty(dialog, "options.adv-reminder.advSources", this.counts);
  }
}

const SourceMixin = (superclass) =>
  class extends superclass {
    _getFlags(actor) {
      if (!actor) return {};

      const asArray = actor.appliedEffects
        .flatMap((effect) =>
          // make an object with the effect's label and change's key
          effect.changes.map((change) => ({
            name: effect.name,
            key: change.key,
          }))
        )
        .filter((change) => change.key.startsWith("flags.midi-qol."));
      asArray.forEach((change) => (change.key = change.key.substring(15)));
      return asArray.reduce((accum, curr) => {
        if (!accum[curr.key]) accum[curr.key] = [];
        accum[curr.key].push(curr.name);
        return accum;
      }, {});
    }

    static AccumulatorClass = LabelAccumulator;

    static UpdateMessage = "checking for adv/dis effects to display their source";

    _rollModeCounts(rollModes) {
      return {
        override: null, // if overridden, should be { label: "foo", mode: 1 }
        advantages: { labels: [], suppressed: [] },
        disadvantages: { labels: [], suppressed: [] }
      };
    }

    _customUpdateOptions(accumulator) {
      super._customUpdateOptions(accumulator);

      // apply roll modes if they exist
      const rollModes = this.rollModes;
      debug("rollModes", rollModes);
      if (!foundry.utils.isEmpty(rollModes)) {
        accumulator.applyRollModes(this.actor, rollModes);
        accumulator.applyRollModeEffects(this.actor, rollModes);
      }
    }
  };

export class AttackSource extends SourceMixin(AttackReminder) {}

export class AbilitySaveSource extends SourceMixin(AbilitySaveReminder) {}

export class ConcentrationSource extends SourceMixin(ConcentrationReminder) {}

export class AbilityCheckSource extends SourceMixin(AbilityCheckReminder) {}

export class SkillSource extends SourceMixin(SkillReminder) {}

export class InitiativeSource extends SourceMixin(InitiativeReminder) {
  _customUpdateOptions(accumulator) {
    super._customUpdateOptions(accumulator);

    // Handle system-defined flags (i.e. Special Traits) that give advantage to initiative
    const flags = ["initiativeAdv"];
    if (game.settings.get("dnd5e", "rulesVersion") === "modern") flags.push("remarkableAthlete");
    this._applyFlagSource(accumulator, flags);
    this._applyFlagEffects(accumulator, flags);
  }

  /**
   * Check _source to see if some initiative advantage flags are set directly on the actor.
   */
  _applyFlagSource(accumulator, flags) {
    flags
      .filter(flag => foundry.utils.getProperty(this.actor._source, `flags.dnd5e.${flag}`))
      .forEach(flag => accumulator.advantageIf(CONFIG.DND5E.characterFlags[flag]?.name));
  }

  /**
   * Check active effects for any initiative advantage flags.
   */
  _applyFlagEffects(accumulator, flags) {
    const flagKeys = flags.map(flag => `flags.dnd5e.${flag}`);
    this.actor.appliedEffects
      .forEach((effect) => {
        const hasFlag = effect.changes
          .map(change => change.key)
          .some(key => flagKeys.includes(key));
        if (hasFlag) accumulator.advantageIf(effect.name);
      });
  }
}

export class DeathSaveSource extends SourceMixin(DeathSaveReminder) {}

class CriticalLabelAccumulator extends LabelMixin(CriticalAccumulator) {
  /** @type {string[]} */
  criticalLabels = [];
  /** @type {string[]} */
  normalLabels = [];

  applyFlags(actorFlags, critKeys, normalKeys) {
    critKeys.forEach(key => {
      if (actorFlags[key]) this.criticalLabels.push(...actorFlags[key]);
    });
    normalKeys.forEach(key => {
      if(actorFlags[key]) this.normalLabels.push(...actorFlags[key]);
    });
  }

  critical(label) {
    if (label) this.criticalLabels.push(label);
  }

  update(options, labelPrefix) {
    debug("criticalLabels", this.criticalLabels, "normalLabels", this.normalLabels);
    if (this.criticalLabels.length)
      foundry.utils.setProperty(options, `${labelPrefix}.adv-reminder.criticalLabels`, this.criticalLabels);
    if (this.normalLabels.length)
      foundry.utils.setProperty(options, `${labelPrefix}.adv-reminder.normalLabels`, this.normalLabels);
  }
}

export class CriticalSource extends SourceMixin(CriticalReminder) {
  static AccumulatorClass = CriticalLabelAccumulator;

  static UpdateMessage = "checking for crit/normal effects to display their source";

  _adjustRange(distanceFn, grantsCriticalRange) {
    // check if the range applies, remove flag if not
    if ("grants.critical.range" in this.targetFlags) {
      const distance = distanceFn();
      if (distance > grantsCriticalRange) delete this.targetFlags["grants.critical.range"];
    }
  }

  updateOptions(options) {
    super.updateOptions(options, "options");
  }
}
