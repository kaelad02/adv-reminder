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
    _getFlags(actor) {
      if (!actor) return {};

      const asArray = actor.effects
        .filter((effect) => !effect.isSuppressed && !effect.disabled)
        .flatMap((effect) =>
          // make an object with the effect's label and change's key
          effect.changes.map((change) => ({
            label: effect.label,
            key: change.key,
          }))
        )
        .filter((change) => change.key.startsWith("flags.midi-qol."));
      asArray.forEach((change) => (change.key = change.key.substring(15)));
      return asArray.reduce((accum, curr) => {
        if (!accum[curr.key]) accum[curr.key] = [];
        accum[curr.key].push(curr.label);
        return accum;
      }, {});
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
        critKeys.forEach(key => {
          if (changes[key]) criticalLabels.push(...changes[key]);
        });
        normalKeys.forEach(key => {
          if(changes[key]) normalLabels.push(...changes[key]);
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
