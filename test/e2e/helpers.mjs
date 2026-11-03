/**
 * Helpers installed in the page as `globalThis.__ar`. Every document they create is named with PREFIX so cleanup can
 * find it, even after a crashed run.
 */
export function installHelpers(page) {
  return page.evaluate(() => {
    const PREFIX = "[adv-audit]";
    const created = { scenes: [] };

    /** Wait for a condition, polling every frame. */
    async function until(fn, timeout = 5000) {
      const start = performance.now();
      while (performance.now() - start < timeout) {
        const value = fn();
        if (value) return value;
        await new Promise((r) => setTimeout(r, 25));
      }
      throw new Error(`timed out waiting for ${fn}`);
    }

    /**
     * Create a character with one active effect per entry of `effects`, each entry a list of changes.
     * @param {string} name
     * @param {object[][]} effects   e.g. [[{ key, type, value }]]
     * @param {object} [data]        extra actor data
     */
    async function actor(name, effects = [], data = {}) {
      const a = await Actor.implementation.create(foundry.utils.mergeObject({
        name: `${PREFIX} ${name}`,
        type: "character",
        system: { abilities: { str: { value: 14 }, dex: { value: 14 }, con: { value: 14 } } },
      }, data));
      if (effects.length) {
        await a.createEmbeddedDocuments("ActiveEffect", effects.map((changes, i) => ({
          name: `${PREFIX} effect ${i + 1}`,
          img: "icons/svg/aura.svg",
          system: { changes: changes.map((c) => ({ type: "custom", ...c })) },
        })));
      }
      return a;
    }

    /** Add a melee weapon with an attack activity to the actor, return the activity. */
    async function weapon(a) {
      const id = foundry.utils.randomID();
      const [item] = await a.createEmbeddedDocuments("Item", [{
        name: `${PREFIX} sword`,
        type: "weapon",
        system: {
          type: { value: "martialM" },
          damage: { base: { number: 1, denomination: 8, types: ["slashing"] } },
          activities: {
            [id]: { _id: id, type: "attack", attack: { ability: "str", type: { value: "melee", classification: "weapon" } }, damage: { includeBase: true } },
          },
        },
      }]);
      return item.system.activities.get(id);
    }

    /**
     * Start a roll that opens a configuration dialog, and resolve once the dialog and the module's async messages have
     * rendered. The roll's promise is kept on the result so the test can await the roll after closing the dialog.
     * @param {() => Promise} roll
     */
    async function dialog(roll) {
      const before = new Set(foundry.applications.instances.keys());
      // what the module sees when the roll starts, to explain failures
      const context = {};
      const hookId = Hooks.once("dnd5e.preRollV2", () => Object.assign(context, {
        targets: game.user.targets.size, sceneId: canvas.scene?.id,
      }));
      const promise = roll();
      const app = await until(() => [...foundry.applications.instances.values()]
        .find((a) => !before.has(a.id) && a.constructor.name.endsWith("RollConfigurationDialog") && a.rendered));
      // the messages are added after an await in the render hook
      await new Promise((r) => setTimeout(r, 300));
      Hooks.off("dnd5e.preRollV2", hookId);
      return { app, promise, context };
    }

    /** Describe a roll dialog: default button, messages and sources text. */
    function describe(app) {
      const el = app.element;
      return {
        default: el.querySelector(".dialog-buttons button[autofocus]")?.dataset.action ?? null,
        messages: [...el.querySelectorAll(".adv-reminder-messages > div")].map((d) => d.textContent.trim().replace(/\s+/g, " ")),
        situational: el.querySelector('input[name="roll.0.situational"]')?.value ?? null,
        inlineRolls: el.querySelectorAll("a.inline-roll").length,
        dialogRolls: el.querySelectorAll("a.dialog-roll").length,
      };
    }

    /** Click a dialog button and wait for the roll. */
    async function submit({ app, promise }, action) {
      app.element.querySelector(`.dialog-buttons button[data-action="${action}"]`).click();
      return promise;
    }

    async function close({ app, promise }) {
      await app.close();
      return promise;
    }

    /** A synthetic click with modifier keys, for the dnd5e keybindings. */
    function click({ shift = false, alt = false, ctrl = false } = {}) {
      return new MouseEvent("click", { shiftKey: shift, altKey: alt, ctrlKey: ctrl });
    }

    /** A square-grid scene with tokens for each actor, viewed (not activated). */
    async function scene(actors, { type = CONST.GRID_TYPES.SQUARE, distance = 5, units = "ft" } = {}) {
      const s = await Scene.implementation.create({
        name: `${PREFIX} scene`, width: 2000, height: 2000, padding: 0,
        grid: { type, size: 100, distance, units },
      });
      created.scenes.push(s.id);
      await s.view();
      await until(() => canvas.ready && canvas.scene?.id === s.id, 20000);
      const docs = await s.createEmbeddedDocuments("Token", await Promise.all(actors.map(async ({ actor: a, x, y, width = 1, height = 1 }) => {
        const t = await a.getTokenDocument({ x, y, width, height, actorLink: true });
        return t.toObject();
      })));
      // the created tokens don't always come back in the order they were asked for
      const tokens = actors.map(({ actor: a }) => docs.find((t) => t.actorId === a.id));
      await until(() => tokens.every((t) => t.object));
      return { scene: s, tokens };
    }

    /** Target exactly these tokens, and wait until the user's targets say so. */
    async function target(...tokens) {
      [...game.user.targets].forEach((t) => t.setTarget(false, { releaseOthers: false }));
      tokens.forEach((t, i) => t.object.setTarget(true, { releaseOthers: i === 0 }));
      const ids = tokens.map((t) => t.id).sort().join();
      await until(() => [...game.user.targets].map((t) => t.id).sort().join() === ids);
    }

    async function cleanup(previousScene) {
      await target();
      for (const app of foundry.applications.instances.values()) {
        if (app.constructor.name.endsWith("RollConfigurationDialog")) await app.close();
      }
      const ours = (c) => c.filter((d) => d.name?.startsWith(PREFIX)).map((d) => d.id);
      if (previousScene && canvas.scene?.id !== previousScene) await game.scenes.get(previousScene)?.view();
      await Scene.implementation.deleteDocuments(ours(game.scenes));
      await Actor.implementation.deleteDocuments(ours(game.actors));
      // the speaker's alias keeps the actor's name after the actor is deleted
      const messages = game.messages.filter((m) => m.speaker?.alias?.startsWith(PREFIX)).map((m) => m.id);
      await ChatMessage.implementation.deleteDocuments(messages);
      return { messages: messages.length };
    }

    globalThis.__ar = { PREFIX, until, actor, weapon, dialog, describe, submit, close, click, scene, target, cleanup };
    return true;
  });
}
