import {
  AbilityCheckReminder,
  AbilitySaveReminder,
  AttackReminder,
  AttackReminderV2,
  CriticalReminder,
  CriticalReminderV2,
  DeathSaveReminder,
  SkillReminder,
} from "./reminders.js";
import { debug } from "./util.js";

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

    _message() {
      debug("checking for adv/dis effects to display their source");
    }

    _getConditionForEffect(actor, key) {
      const props = super._getConditionForEffect(actor, key);
      return (
        props
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
          })
      );
    }

    _accumulator() {
      const advantageLabels = [];
      const disadvantageLabels = [];

      return {
        add: (changes, advKeys, disKeys) => {
          advKeys.forEach((key) => {
            if (changes[key]) advantageLabels.push(...changes[key]);
          });
          disKeys.forEach((key) => {
            if (changes[key]) disadvantageLabels.push(...changes[key]);
          });
        },
        fromConditions: (actor, advConditions, disConditions) => {
          if (!actor) return;
          advantageLabels.push(...advConditions.flatMap(c => this._getConditionForEffect(actor, c)));
          disadvantageLabels.push(...disConditions.flatMap(c => this._getConditionForEffect(actor, c)));
        },
        advantage: (label) => {
          if (label) advantageLabels.push(label);
        },
        disadvantage: (label) => {
          if (label) disadvantageLabels.push(label);
        },
        update: (options) => {
          debug("advantageLabels", advantageLabels, "disadvantageLabels", disadvantageLabels);
          const merge = (newLabels, key) => {
            if (newLabels.length) {
              const labels = foundry.utils.getProperty(options, key);
              if (labels) newLabels.push(...labels);
              foundry.utils.setProperty(options, key, newLabels);
            }
          };
          merge(advantageLabels, "options.adv-reminder.advantageLabels");
          merge(disadvantageLabels, "options.adv-reminder.disadvantageLabels");
        },
      };
    }
  };

export class AttackSource extends SourceMixin(AttackReminder) {}

export class AttackSourceV2 extends SourceMixin(AttackReminderV2) {
}

export class AbilitySaveSource extends SourceMixin(AbilitySaveReminder) {}

export class ConcentrationSource extends SourceMixin(AbilitySaveReminder) {
  updateOptions(options) {
    this._message();

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    debug("advKeys", advKeys, "disKeys", disKeys);
    const rollModes = {
      "system.attributes.concentration.roll.mode": ["DND5E.Concentration"]
    };

    const accumulator = this._accumulator();
    // check Concentration's roll mode to look for advantage/disadvantage
    this._applyRollModes(accumulator, rollModes);
    this._applyRollModeEffects(accumulator, rollModes);
    // normal checks
    accumulator.add(this.actorFlags, advKeys, disKeys);
    accumulator.fromConditions(this.actor, this.advantageConditions, this.disadvantageConditions);
    accumulator.update(options);
  }

  _applyRollModes(accumulator, rollModes) {
    const source = this.actor._source;
    Object.entries(rollModes).forEach(([key, labels]) => {
      const mode = foundry.utils.getProperty(source, key);
      if (mode === 1) {
        const label = this._rollModeLabel(...labels, "DND5E.AdvantageMode");
        accumulator.advantage(label);
      } else if (mode === -1) {
        const label = this._rollModeLabel(...labels, "DND5E.AdvantageMode");
        accumulator.disadvantage(label);
      }
    });
  }

  _rollModeLabel(...labels) {
    return labels
      .map(l => game.i18n.localize(l))
      .join(" ");
  }

  _applyRollModeEffects(accumulator, rollModes) {
    // find the active effects that set roll modes
    const rollModeKeys = Object.keys(rollModes);
    const effects = this.actor.appliedEffects
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

    if (effects["1"]) effects["1"].forEach(label => accumulator.advantage(label));
    if (effects["-1"]) effects["-1"].forEach(label => accumulator.disadvantage(label));
  }
}

export class AbilityCheckSource extends SourceMixin(AbilityCheckReminder) {}

export class SkillSource extends SourceMixin(SkillReminder) {}

export class DeathSaveSource extends SourceMixin(DeathSaveReminder) {}

export class CriticalSource extends SourceMixin(CriticalReminder) {
  _adjustRange(distanceFn, grantsCriticalRange) {
    // check if the range applies, remove flag if not
    if ("grants.critical.range" in this.targetFlags) {
      const distance = distanceFn();
      if (distance > grantsCriticalRange) delete this.targetFlags["grants.critical.range"];
    }
  }

  _accumulator() {
    const criticalLabels = [];
    const normalLabels = [];

    return {
      add: (changes, critKeys, normalKeys) => {
        critKeys.forEach(key => {
          if (changes[key]) criticalLabels.push(...changes[key]);
        });
        normalKeys.forEach(key => {
          if(changes[key]) normalLabels.push(...changes[key]);
        });
      },
      critical: (label) => {
        if (label) criticalLabels.push(label);
      },
      update: (options) => {
        debug("criticalLabels", criticalLabels, "normalLabels", normalLabels);
        const merge = (newLabels, key) => {
          if (newLabels.length) {
            const labels = foundry.utils.getProperty(options, key);
            if (labels) newLabels.push(...labels);
            foundry.utils.setProperty(options, key, newLabels);
          }
        };
        merge(criticalLabels, "dialogOptions.adv-reminder.criticalLabels");
        merge(normalLabels, "dialogOptions.adv-reminder.normalLabels");
      },
    };
  }
}

export class CriticalSourceV2 extends SourceMixin(CriticalReminderV2) {
  _adjustRange(distanceFn, grantsCriticalRange) {
    // check if the range applies, remove flag if not
    if ("grants.critical.range" in this.targetFlags) {
      const distance = distanceFn();
      if (distance > grantsCriticalRange) delete this.targetFlags["grants.critical.range"];
    }
  }

  _accumulator() {
    const criticalLabels = [];
    const normalLabels = [];

    return {
      add: (changes, critKeys, normalKeys) => {
        critKeys.forEach(key => {
          if (changes[key]) criticalLabels.push(...changes[key]);
        });
        normalKeys.forEach(key => {
          if(changes[key]) normalLabels.push(...changes[key]);
        });
      },
      critical: (label) => {
        if (label) criticalLabels.push(label);
      },
      update: (options) => {
        debug("criticalLabels", criticalLabels, "normalLabels", normalLabels);
        const merge = (newLabels, key) => {
          if (newLabels.length) {
            const labels = foundry.utils.getProperty(options, key);
            if (labels) newLabels.push(...labels);
            foundry.utils.setProperty(options, key, newLabels);
          }
        };
        merge(criticalLabels, "options.adv-reminder.criticalLabels");
        merge(normalLabels, "options.adv-reminder.normalLabels");
      },
    };
  }
}
