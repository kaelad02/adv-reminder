import { AbilitySaveFail } from "../fails.js";
import {
  AbilityCheckMessage,
  AbilitySaveMessage,
  AttackMessage,
  DamageMessage,
  DeathSaveMessage,
  SkillMessage,
} from "../messages.js";
import {
  AttackReminder,
  AbilityCheckReminder,
  AbilitySaveReminder,
  CriticalReminder,
  DeathSaveReminder,
  SkillReminder,
} from "../reminders.js";
import {
  AbilityCheckSource,
  AbilitySaveSource,
  AttackSource,
  CriticalSource,
  DeathSaveSource,
  SkillSource,
} from "../sources.js";
import { showSources } from "../settings.js";
import { debug, getTarget } from "../util.js";
import CoreRollerHooks from "./core.js";

export default class ReadySetRollHooks extends CoreRollerHooks {
  preRollAttack(item, config) {
    debug("preRollAttack hook called");

    if (this.isFastForwarding(config)) return;
    const target = getTarget();

    debug("checking for message effects on this attack roll");
    new AttackMessage(item.actor, target, item).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new AttackSource(item.actor, target, item).updateOptions(config);
    }

    debug("checking for adv/dis effects on this attack roll");
    new AttackReminder(item.actor, target, item).updateOptions(config);
  }

  preRollAbilitySave(actor, config, abilityId) {
    debug("preRollAbilitySave hook called");

    // check if an effect says to fail this roll
    const failChecker = new AbilitySaveFail(actor, abilityId);
    if (failChecker.fails(config)) return false;

    if (this.isFastForwarding(config)) return;

    debug("checking for message effects on this saving throw");
    new AbilitySaveMessage(actor, abilityId).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new AbilitySaveSource(actor, abilityId).updateOptions(config);
    }

    debug("checking for adv/dis effects on this saving throw");
    new AbilitySaveReminder(actor, abilityId).updateOptions(config);
  }

  preRollAbilityTest(actor, config, abilityId) {
    debug("preRollAbilityTest hook called");

    if (this.isFastForwarding(config)) return;

    debug("checking for message effects on this ability check");
    new AbilityCheckMessage(actor, abilityId).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new AbilityCheckSource(actor, abilityId).updateOptions(config);
    }

    debug("checking for adv/dis effects on this ability check");
    new AbilityCheckReminder(actor, abilityId).updateOptions(config);
  }

  preRollSkill(actor, config, skillId) {
    debug("preRollSkill hook called");

    if (this.isFastForwarding(config)) return;

    debug("checking for message effects on this skill check");
    new SkillMessage(actor, skillId).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new SkillSource(actor, skillId, true).updateOptions(config);
    }

    debug("checking for adv/dis effects on this skill check");
    new SkillReminder(actor, skillId, this.checkArmorStealth).updateOptions(config);
  }

  preRollToolCheck(item, config) {
    debug("preRollToolCheck hook called");

    if (this.isFastForwarding(config)) return;

    debug("checking for message effects on this tool check");
    new AbilityCheckMessage(item.actor, item.system.ability).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new AbilityCheckSource(item.actor, item.system.ability).updateOptions(config);
    }

    debug("checking for adv/dis effects on this tool check");
    new AbilityCheckReminder(item.actor, item.system.ability).updateOptions(config);
  }

  preRollDeathSave(actor, config) {
    debug("preRollDeathSave hook called");

    if (this.isFastForwarding(config)) return;

    debug("checking for message effects on this death save");
    new DeathSaveMessage(actor).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new DeathSaveSource(actor).updateOptions(config);
    }

    debug("checking for adv/dis effects on this death save");
    new DeathSaveReminder(actor).updateOptions(config);
  }

  preRollDamage(item, config) {
    debug("preRollDamage hook called");

    // check for critical flags unless the user pressed a fast-forward key
    if (this.isFastForwarding(config)) return;
    const target = getTarget();

    debug("checking for message effects on this damage roll");
    new DamageMessage(item.actor, target, item).addMessage(config);
    if (showSources) {
      debug("checking for adv/dis effects to display their source");
      new CriticalSource(item.actor, target, item).updateOptions(config);
    }

    debug("checking for critical/normal effects on this damage roll");
    new CriticalReminder(item.actor, target, item).updateOptions(config);
  }
}
