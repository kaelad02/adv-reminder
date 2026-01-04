import {
  AbilityCheckReminder,
  AbilitySaveReminder,
  AttackReminder,
  AttackReminderV2,
  CriticalReminder,
  CriticalReminderV2,
  DeathSaveReminder,
  InitiativeReminder,
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

export class InitiativeSource extends SourceMixin(InitiativeReminder) {
  updateOptions(options) {
    this._message();
    debug("InitiativeSource updateOptions, this.actorFlags", this.actorFlags);

    // get the active effect keys applicable for this roll
    const advKeys = this.advantageKeys;
    const disKeys = this.disadvantageKeys;
    const flags = ["initiativeAdv"];
    if (game.settings.get("dnd5e", "rulesVersion") === "modern") flags.push("remarkableAthlete");
    debug("advKeys, disKeys, flags", advKeys, disKeys, flags);

    // find matching keys, status effects, and update options
    const accumulator = this._accumulator(options);
    this._applyFlagSource(accumulator, flags);
    this._applyFlagEffects(accumulator, flags);
    accumulator.add(this.actorFlags, advKeys, disKeys);
    accumulator.fromConditions(this.actor, this.advantageConditions, this.disadvantageConditions);
    accumulator.update(options);
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
        if (hasFlag) accumulator.advantage(effect.name);
      });
  }
}

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
