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

/**
 * Setup the dnd5e.preRoll hooks for use with Faster Rolling by Default DnD5e.
 */
export default class FasterHooks extends CoreRollerHooks {

  preRollSkill(actor, config, skillId) {
    debug("preRollSkill hook called");

    if (this._doMessages(config)) {
      new SkillMessage(actor, skillId).addMessage(config);
      if (showSources) new SkillSource(actor, skillId, true).updateOptions(config);
    }

    if (this._doReminder(config))
      new SkillReminder(actor, skillId, this.checkArmorStealth).updateOptions(config);
  }

  _doMessages({ fastForward = false, event }) {
    // disregard fastForward if there is an event to use instead
    if (event) {
      if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
        debug("not showing the dialog, skip messages");
        return false;
      }
      return true;
    }

    if (fastForward) debug("fast-forwarding the roll, skip messages");
    return !fastForward;
  }

  _doReminder({event = {}}) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      debug("held down a key for advantage or disadvantage, skip reminder checks");
      return false;
    }
    return true;
  }

}
