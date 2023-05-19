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

// the core behavior, no other roller modules
// meant for setting up and defining the "dnd5e.pre???" hooks

export default class CoreRollerHooks {
  /**
   * If true, check armor for stealth checks.
   * @type {boolean}
   */
  checkArmorStealth;

  // setup everything specific to the roller
  init() {
    // DAE version 0.8.81 added support for "impose stealth disadvantage"
    this.checkArmorStealth = !game.modules.get("dae")?.active;
    debug("checkArmorStealth", this.checkArmorStealth);

    // register all the dnd5e.pre hooks
    Hooks.on("dnd5e.preRollAttack", this.preRollAttack.bind(this));
    Hooks.on("dnd5e.preRollAbilitySave", this.preRollAbilitySave.bind(this));
    Hooks.on("dnd5e.preRollAbilityTest", this.preRollAbilityTest.bind(this));
    Hooks.on("dnd5e.preRollSkill", this.preRollSkill.bind(this));
    Hooks.on("dnd5e.preRollToolCheck", this.preRollToolCheck.bind(this));
    Hooks.on("dnd5e.preRollDeathSave", this.preRollDeathSave.bind(this));
    Hooks.on("dnd5e.preRollDamage", this.preRollDamage.bind(this));
  }

  // applying Midi flags should be done outside this class,
  // but we'll ask whether to do it or not here
  shouldApplyMidiActiveEffect() {
    return true;
  }

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

  /**
   * Check if we should fast-forward the roll by checking the fastForward flag
   * and if one of the modifier keys was pressed.
   * @param {object} options
   * @param {boolean} [options.fastForward] a specific fastForward flag
   * @param {Event} [options.event] the triggering event
   * @returns {boolean} true if they are fast-forwarding, false otherwise
   */
  isFastForwarding({ fastForward = false, event = {} }) {
    const isFF = !!(
      fastForward ||
      event?.shiftKey ||
      event?.altKey ||
      event?.ctrlKey ||
      event?.metaKey
    );
    if (isFF) debug("fast-forwarding the roll, stop processing");
    return isFF;
  }
}
