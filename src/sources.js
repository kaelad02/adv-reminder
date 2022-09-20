import { AbilityCheckReminder, AbilitySaveReminder, AttackReminder, DeathSaveReminder, SkillReminder } from "./reminders.js";
import { debug } from "./util.js";

const SourceMixin = (superclass) =>
  class extends superclass {
    /**
     * Get Midi QOL's active effect changes plus the label to idenfiy where it came from.
     * @param {Actor5e} actor the actor
     * @returns {Object[]} an array of objects with the active effect's `label` and change's `key`
     */
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
          debug(
            "advantage source results, advantageLabels and disadvantageLabels:",
            advantageLabels,
            disadvantageLabels
          );
          // TODO
          if (advantageLabels.length)
            setProperty(options, "dialogOptions.adv-reminder.advantageLabels", advantageLabels);
          if (disadvantageLabels.length)
            setProperty(
              options,
              "dialogOptions.adv-reminder.disadvantageLabels",
              disadvantageLabels
            );
        },
      };
    }
  };

export class AttackSource extends SourceMixin(AttackReminder) {}

export class AbilitySaveSource extends SourceMixin(AbilitySaveReminder) {}

export class AbilityCheckSource extends SourceMixin(AbilityCheckReminder) {}

export class SkillSource extends SourceMixin(SkillReminder) {}

export class DeathSaveSource extends SourceMixin(DeathSaveReminder) {}
