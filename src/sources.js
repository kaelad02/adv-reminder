import {
  AbilityCheckReminder,
  AbilitySaveReminder,
  AttackReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
} from "./reminders.js";
import { debug } from "./util.js";

const SourceMixin = (superclass) =>
  class extends superclass {
    _getActiveEffectKeys(actor) {
      return actor
        ? actor.effects
            .filter((effect) => !effect.isSuppressed && !effect.disabled)
            .flatMap((effect) =>
              // make an object with the effect's label and change's key
              effect.changes.map((change) => ({
                label: effect.label,
                key: change.key,
              }))
            )
            .filter((change) => change.key.startsWith("flags.midi-qol."))
        : [];
    }

    _accumulator() {
      const advantageLabels = [];
      const disadvantageLabels = [];

      return {
        add: (changes, advKeys, disKeys) => {
          changes.forEach((change) => {
            if (advKeys.includes(change.key)) advantageLabels.push(change.label);
            if (disKeys.includes(change.key)) disadvantageLabels.push(change.label);
          });
        },
        disadvantage: (label) => {
          if (label) disadvantageLabels.push(label);
        },
        update: (options) => {
          debug("advantageLabels", advantageLabels, "disadvantageLabels", disadvantageLabels);
          const merge = (newLabels, key) => {
            if (newLabels.length) {
              const labels = getProperty(options, key);
              if (labels) newLabels.push(...labels);
              setProperty(options, key, newLabels);
            }
          };
          merge(advantageLabels, "dialogOptions.adv-reminder.advantageLabels");
          merge(disadvantageLabels, "dialogOptions.adv-reminder.disadvantageLabels");
        },
      };
    }
  };

export class AttackSource extends SourceMixin(AttackReminder) {}

export class AbilitySaveSource extends SourceMixin(AbilitySaveReminder) {}

export class AbilityCheckSource extends SourceMixin(AbilityCheckReminder) {}

export class SkillSource extends SourceMixin(SkillReminder) {}

export class DeathSaveSource extends SourceMixin(DeathSaveReminder) {}

export class CriticalSource extends SourceMixin(CriticalReminder) {
  _accumulator() {
    const criticalLabels = [];
    const normalLabels = [];

    return {
      add: (changes, critKeys, normalKeys) => {
        changes.forEach((change) => {
          if (critKeys.includes(change.key)) criticalLabels.push(change.label);
          if (normalKeys.includes(change.key)) normalLabels.push(change.label);
        });
      },
      update: (options) => {
        debug("criticalLabels", criticalLabels, "normalLabels", normalLabels);
        const merge = (newLabels, key) => {
          if (newLabels.length) {
            const labels = getProperty(options, key);
            if (labels) newLabels.push(...labels);
            setProperty(options, key, newLabels);
          }
        };
        merge(criticalLabels, "dialogOptions.adv-reminder.criticalLabels");
        merge(normalLabels, "dialogOptions.adv-reminder.normalLabels");
      },
    };
  }
}
