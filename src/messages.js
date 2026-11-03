import { debug, getApplicableChanges, hasMultipleTargets } from "./util.js";

/**
 * Messages come from active effects that any owner can edit, including a target's, and are rendered as HTML in the
 * roll dialog. Strip anything unsafe before they are enriched.
 * @param {unknown[]} messages
 * @returns {string[]}
 */
export function sanitizeMessages(messages) {
  return messages.map((message) => foundry.utils.cleanHTML(String(message)));
}

/**
 * Render the messages and sources shown in a roll dialog.
 * Messages may come from a target's effects, so they never reveal secrets nor embed other documents. Source labels hold
 * links to effects whose names are written by users: only resolve the links (which show the name as text), never inline
 * rolls, and clean the result.
 * @param {object} options
 * @param {unknown[]} [options.messages]
 * @param {{icon: string, prefix: string, labels: string}[]} [options.sources]
 * @param {object} rollData data for the inline rolls in the messages
 * @returns {Promise<string|undefined>} the HTML, or undefined if there is nothing to show
 */
export async function renderDialogMessages({ messages = [], sources = [] }, rollData) {
  if (!messages.length && !sources.length) return;

  const TextEditor = foundry.applications.ux.TextEditor.implementation;
  const enrich = (content, rolls) => TextEditor.enrichHTML(content, {
    secrets: false,
    embeds: false,
    links: false,
    documents: true,
    rolls,
    rollData,
  });

  const enrichedMessages = await Promise.all(sanitizeMessages(messages).map((message) => enrich(message, true)));
  const enrichedSources = await Promise.all(sources.map(async (source) => ({
    ...source,
    labels: foundry.utils.cleanHTML(await enrich(source.labels, false)),
  })));
  return foundry.applications.handlebars.renderTemplate("modules/adv-reminder/templates/roll-dialog-messages.hbs", {
    messages: enrichedMessages,
    sources: enrichedSources,
  });
}

class BaseMessage {
  constructor(actor, targetActor) {
    /** @type {Actor5e} */
    this.actor = actor;
    /** @type {Actor5e} */
    this.targetActor = targetActor;
  }

  get messageKeys() {
    return ["flags.adv-reminder.message.all"];
  }

  get targetKeys() {
    return undefined;
  }

  addMessage(options) {
    debug("checking for message effects");

    // get any existing messages
    const messages = foundry.utils.getProperty(options, "options.adv-reminder.messages") ?? [];

    // get messages from the actor and merge
    const keys = this.messageKeys;
    const actorMessages = getApplicableChanges(this.actor, (change) => keys.includes(change.key))
      .map((change) => String(change.value));
    messages.push(...actorMessages);

    // get messages from the target and merge
    const targetKeys = this.targetKeys;
    if (targetKeys && this.targetActor) {
      const targetMessages = getApplicableChanges(this.targetActor, (change) => targetKeys.includes(change.key))
        .map((change) => String(change.value));
      messages.push(...targetMessages);
    }

    // target-based reminders only work with a single target, let the user know they were skipped
    if (targetKeys && hasMultipleTargets()) messages.push(game.i18n.localize("adv-reminder.MultipleTargets"));

    if (messages.length > 0) {
      debug("messages found:", messages);
      foundry.utils.setProperty(options, "options.adv-reminder.messages", messages);
    }
  }
}

export class AttackMessage extends BaseMessage {
  constructor(actor, targetActor, activity) {
    super(actor, targetActor);

    /** @type {string} */
    this.actionType = activity.actionType;
    /** @type {string} */
    this.abilityId = activity.ability;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.attack.all",
      `flags.adv-reminder.message.attack.${this.actionType}`,
      `flags.adv-reminder.message.attack.${this.abilityId}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "flags.adv-reminder.grants.message.attack.all",
      `flags.adv-reminder.grants.message.attack.${this.actionType}`,
      `flags.adv-reminder.grants.message.attack.${this.abilityId}`,
    ];
  }
}

class AbilityBaseMessage extends BaseMessage {
  constructor(actor, abilityId) {
    super(actor);

    /** @type {string} */
    this.abilityId = abilityId;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("flags.adv-reminder.message.ability.all");
  }
}

export class AbilityCheckMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.check.all",
      `flags.adv-reminder.message.ability.check.${this.abilityId}`
    );
  }
}

export class AbilitySaveMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.save.all",
      `flags.adv-reminder.message.ability.save.${this.abilityId}`
    );
  }
}

export class ConcentrationMessage extends AbilitySaveMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("flags.adv-reminder.message.ability.concentration");
  }
}

export class SkillMessage extends AbilityCheckMessage {
  constructor(actor, abilityId, skillId) {
    super(actor, abilityId);

    /** @type {string} */
    this.skillId = skillId;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.skill.all",
      `flags.adv-reminder.message.skill.${this.skillId}`
    );
  }
}

export class ToolMessage extends AbilityCheckMessage {
  constructor(actor, abilityId, toolId) {
    super(actor, abilityId);

    /** @type {string} */
    this.toolId = toolId;
  }

  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.tool.all",
      `flags.adv-reminder.message.tool.${this.toolId}`
    );
  }
}

export class InitiativeMessage extends AbilityBaseMessage {
  /** @override */
  get messageKeys() {
    return super.messageKeys.concat("flags.adv-reminder.message.initiative");
  }
}

export class DeathSaveMessage extends AbilityBaseMessage {
  constructor(actor) {
    super(actor, null);
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.ability.save.all",
      "flags.adv-reminder.message.deathSave"
    );
  }
}

export class DamageMessage extends BaseMessage {
  constructor(actor, targetActor, activity) {
    super(actor, targetActor);

    /** @type {string} */
    this.actionType = activity.actionType;
  }

  /** @override */
  get messageKeys() {
    return super.messageKeys.concat(
      "flags.adv-reminder.message.damage.all",
      `flags.adv-reminder.message.damage.${this.actionType}`
    );
  }

  /** @override */
  get targetKeys() {
    return [
      "flags.adv-reminder.grants.message.damage.all",
      `flags.adv-reminder.grants.message.damage.${this.actionType}`,
    ];
  }
}
