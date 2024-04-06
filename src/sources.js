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

export class ConcentrationSource extends SourceMixin(Object) {
  constructor(actor, abilityId) {
    super();
    
    /** @type {object} */
    this.conc = actor.system.attributes?.concentration;
    /** @type {string} */
    this.abilityId = abilityId;
  }

  updateOptions(options) {
    this._message();

    const modes = CONFIG.Dice.D20Roll.ADV_MODE;
    const source = () =>
      game.i18n.localize("DND5E.Concentration") + " " + game.i18n.localize("DND5E.AdvantageMode");

    // check Concentration's roll mode to look for advantage/disadvantage
    const accumulator = this._accumulator();
    if (this.conc.roll.mode === modes.ADVANTAGE) accumulator.advantage(source());
    else if (this.conc.roll.mode === modes.DISADVANTAGE) accumulator.disadvantage(source());
    accumulator.update(options);
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
