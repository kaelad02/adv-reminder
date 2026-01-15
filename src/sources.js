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
  /** @type {string[]} */
  advantageLabels = [];
  /** @type {string[]} */
  disadvantageLabels = [];

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
    // find the active effects that set roll modes
    const rollModeKeys = Object.keys(rollModes);
    const effects = actor.appliedEffects
      .flatMap((effect) =>
        effect.changes
          .filter((change) => rollModeKeys.includes(change.key))
          .map((change) => ({
            name: effect.name,
            value: change.value,
          }))
      )
      .reduce((accum, curr) => {
        if (!accum[curr.value]) accum[curr.value] = [];
        accum[curr.value].push(curr.name);
        return accum;
      }, {});

    this.advantageLabels.push(...(effects["1"] ?? []));
    this.disadvantageLabels.push(...(effects["-1"] ?? []));
  }

  applyFlags(actorFlags, advKeys, disKeys) {
    advKeys.forEach((key) => this.advantageLabels.push(...(actorFlags[key] ?? [])));
    disKeys.forEach((key) => this.disadvantageLabels.push(...(actorFlags[key] ?? [])));
  }

  applyConditions(actor, advConditions, disConditions) {
    if (!actor) return;
    const advLabels = advConditions.flatMap(c => this._getConditionForEffect(actor, c));
    this.advantageLabels.push(...advLabels);
    const disLabels = disConditions.flatMap(c => this._getConditionForEffect(actor, c));
    this.disadvantageLabels.push(...disLabels);
  }

  advantageIf(label) {
    if (label) this.advantageLabels.push(label);
  }

  disadvantageIf(label) {
    if (label) this.disadvantageLabels.push(label);
  }

  /**
   * Update the dialog options with the labels.
   * @param dialog
   */
  update(dialog) {
    debug("advantageLabels", this.advantageLabels, "disadvantageLabels", this.disadvantageLabels);
    if (this.advantageLabels.length)
      foundry.utils.setProperty(dialog, "options.adv-reminder.advantageLabels", this.advantageLabels);
    if (this.disadvantageLabels.length)
      foundry.utils.setProperty(dialog, "options.adv-reminder.disadvantageLabels", this.disadvantageLabels);
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

  update(options) {
    debug("criticalLabels", this.criticalLabels, "normalLabels", this.normalLabels);
    if (this.criticalLabels.length)
      foundry.utils.setProperty(options, "options.adv-reminder.criticalLabels", this.criticalLabels);
    if (this.normalLabels.length)
      foundry.utils.setProperty(options, "options.adv-reminder.normalLabels", this.normalLabels);
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

  _customUpdateOptions(accumulator) {
    // only do this check on 4.3
    if (!foundry.utils.isNewerVersion(game.system.version, "4.2.99")) return;

    // check if the preceding attack roll was a critical hit
    const messageId = this.event?.currentTarget?.dataset?.messageId;
    if (messageId) {
      const lastAttack = dnd5e.registry.messages.get(messageId, "attack").pop();
      const isCritical = lastAttack?.rolls[0]?.isCritical;
      if (isCritical) {
        const value = lastAttack.rolls[0].d20.total;
        accumulator.critical(game.i18n.format("adv-reminder.Source.Nat20", { value }));
      }
    }
  }
}
