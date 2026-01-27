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
  ToolReminder,
} from "./reminders.js";
import { debug, getApplicableChanges } from "./util.js";

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
 * @typedef CriticalLabelModeData
 * @property {LabelModeCounts} critical  The critical sources.
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
          .map((e) => e.link);
        if (activeEffectNames.length) return activeEffectNames;
        // fallback to the status effect's name (mostly for exhaustion)
        return `&Reference[${k} apply=false]`;
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
    const localize = (l) => {
      const first = (typeof l === "string") ? game.i18n.localize(l) : game.i18n.format(l.stringId, l.data);
      return `${first} ${game.i18n.localize("DND5E.AdvantageMode")}`;
    };

    Object.entries(rollModes).forEach(([key, label]) => {
      const mode = foundry.utils.getProperty(source, key);
      if (mode === 1) {
        label = localize(label);
        this.counts.advantages.labels.push(label);
      } else if (mode === -1) {
        label = localize(label);
        this.counts.disadvantages.labels.push(label);
      }
    });
  }

  _applyChangeAdd(delta, change) {
    // Add a source of advantage or disadvantage.
    if (delta === 1) this.counts.advantages.labels.push(change.effect.link);
    else if (delta === -1) this.counts.disadvantages.labels.push(change.effect.link);
  }

  _applyChangeOverride(delta, change) {
    // Force a given roll mode.
    if (delta === -1 || delta === 0 || delta === 1)
      this.counts.override = {label: change.effect.link, mode: delta};
  }

  _applyChangeUpgrade(delta, change) {
    // Upgrade the roll so that it can no longer be penalised by disadvantage.
    if (delta !== 1 && delta !== 0) return;
    this.counts.disadvantages.suppressed.push(change.effect.link);
    if (delta === 1) this.counts.advantages.labels.push(change.effect.link);
  }

  _applyChangeDowngrade(delta, change) {
    // Downgrade the roll so that it can no longer benefit from advantage.
    if (delta !== -1 && delta !== 0) return;
    this.counts.advantages.suppressed.push(change.effect.link);
    if (delta === -1) this.counts.disadvantages.labels.push(change.effect.link);
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

  advantage(label) {
    if (label) this.counts.advantages.labels.push(label);
  }

  disadvantage(label) {
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

      // the Midi flag has to be true and the flag on the actor must be true (i.e. not overwritten by another change to false)
      const filterFn = (change) => change.key.startsWith("flags.midi-qol.") &&
        ["true", "1"].includes(change.value.trim()) && foundry.utils.getProperty(actor, change.key) === true;
      return getApplicableChanges(actor, filterFn)
        .map((change) => {
          change.key = change.key.substring(15);
          return change;
        })
        .reduce((accum, change) => {
          if (!accum[change.key]) accum[change.key] = [];
          accum[change.key].push(change.effect.link)
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
        accumulator.applyRollModeEffects(this.actor, Object.keys(rollModes));
      }
    }
  };

export class AttackSource extends SourceMixin(AttackReminder) {}

export class AbilitySaveSource extends SourceMixin(AbilitySaveReminder) {}

export class ConcentrationSource extends SourceMixin(ConcentrationReminder) {}

export class AbilityCheckSource extends SourceMixin(AbilityCheckReminder) {}

export class SkillSource extends SourceMixin(SkillReminder) {}

export class ToolSource extends SourceMixin(ToolReminder) {}

export class InitiativeSource extends SourceMixin(InitiativeReminder) {
  _customUpdateOptions(accumulator) {
    super._customUpdateOptions(accumulator);

    // Handle system-defined flag (i.e. Special Traits) that gives advantage to initiative
    if (game.settings.get("dnd5e", "rulesVersion") === "modern") {
      const flags = ["remarkableAthlete"];
      this._applyFlagSource(accumulator, flags);
      this._applyFlagEffects(accumulator, flags);
    }
  }

  /**
   * Check _source to see if some initiative advantage flags are set directly on the actor.
   */
  _applyFlagSource(accumulator, flags) {
    flags
      .filter(flag => foundry.utils.getProperty(this.actor._source, `flags.dnd5e.${flag}`))
      .forEach(flag => accumulator.advantage(CONFIG.DND5E.characterFlags[flag]?.name));
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
        if (hasFlag) accumulator.advantage(effect.link);
      });
  }
}

export class DeathSaveSource extends SourceMixin(DeathSaveReminder) {}

class CriticalLabelAccumulator extends LabelMixin(CriticalAccumulator) {
  /**
   * @param {CriticalLabelModeData} counts
   */
  constructor(counts) {
    super();
    this.counts = counts;
  }

  applyFlags(actorFlags, critKeys, normalKeys) {
    critKeys.forEach(key => {
      if (actorFlags[key]) this.counts.critical.labels.push(...actorFlags[key]);
    });
    normalKeys.forEach(key => {
      if(actorFlags[key]) this.counts.critical.suppressed.push(...actorFlags[key]);
    });
  }

  critical(label) {
    if (label) this.counts.critical.labels.push(label);
  }

  update(dialog) {
    debug("counts for source labels", this.counts);
    // too much logic on what to pass which would just be duplicated in renderRollConfigurationDialog hook anyway
    // pass it all and have the hook decide what to show
    foundry.utils.setProperty(dialog, "options.adv-reminder.critSources", this.counts);
  }
}

export class CriticalSource extends SourceMixin(CriticalReminder) {
  constructor(actor, targetActor, activity, distanceFn, event) {
    super(actor, targetActor, activity, distanceFn);

    /** @type {Event} */
    this.event = event;
  }

  static AccumulatorClass = CriticalLabelAccumulator;

  static UpdateMessage = "checking for crit/normal effects to display their source";

  _adjustRange(distanceFn, grantsCriticalRange) {
    // check if the range applies, remove flag if not
    if ("grants.critical.range" in this.targetFlags) {
      const distance = distanceFn();
      if (distance > grantsCriticalRange) delete this.targetFlags["grants.critical.range"];
    }
  }

  /**
   * @returns {CriticalLabelModeData}
   */
  _initCounts(isCritical) {
    const counts = {
      critical: { labels: [], suppressed: [] }
    };
    this._applyNat20(counts);
    return counts;
  }

  _applyNat20(counts) {
    // only do this check on 4.3
    if (!foundry.utils.isNewerVersion(game.system.version, "4.2.99")) return;

    // check if the preceding attack roll was a critical hit
    const messageId = this.event?.currentTarget?.dataset?.messageId;
    if (messageId) {
      const lastAttack = dnd5e.registry.messages.get(messageId, "attack").pop();
      const isCritical = lastAttack?.rolls[0]?.isCritical;
      if (isCritical) {
        const value = lastAttack.rolls[0].d20.total;
        counts.critical.labels.push(game.i18n.format("adv-reminder.Source.Critical.nat20", { value }));
      }
    }
  }
}
