import { debug } from "./util.js";

export default class SamplePackBuilder {
  constructor() {
    this.pack = game.packs.get("adv-reminder.sample-items");
  }

  /**
   * Build the sample pack by copying from the SRD and updating it.
   */
  async build() {
    const packData = await this._getPackData();
    for (const [sourcePackName, inputs] of Object.entries(packData)) {
      debug("start copying items from", sourcePackName);

      // get the source pack and its index
      const sourcePack = game.packs.get(sourcePackName);
      const index = await sourcePack.getIndex();

      for (const sampleInput of inputs) {
        debug("start copying item named", sampleInput.name);

        // copy the item from the source pack to the sample pack
        const indexEntry = index.getName(sampleInput.name);
        let item = await game.items.importFromCompendium(
          sourcePack,
          indexEntry._id,
          {},
          { temporary: true }
        );
        item = await this.pack.importDocument(item);
        debug("imported item", item);

        // add or update an active effect on the item
        if (item.effects.size) {
          // only updates changes
          const original = item.effects.contents[0];
          const update = {
            _id: original.id,
            changes: [...original.changes, ...sampleInput.data.changes],
          };
          debug("update active effect", update);
          await item.updateEmbeddedDocuments("ActiveEffect", [update]);
        } else {
          const effect = this._buildActiveEffect(item, sampleInput.data);
          debug("create active effect", effect);
          await item.createEmbeddedDocuments("ActiveEffect", [effect]);
        }
        debug("created effect, done copying", item.name);
      }

      debug("done copying from", sourcePackName);
    }
  }

  async _getPackData() {
    let data = {};
    try {
      const res = await fetch("modules/adv-reminder/src/sample-pack-data.json");
      data = await res.json();
    } catch (err) {
      console.warn(`Failed to retrieve token map data: ${err.message}`);
    }
    return data;
  }

  _buildActiveEffect(item, data) {
    const template = {
      disabled: false,
      duration: {
        startTime: 0,
        seconds: null,
        rounds: null,
        turns: null,
        startRound: 1,
        startTurn: 0,
        type: "none",
        duration: null,
        remaining: null,
        label: "None",
      },
      icon: item.img,
      isSuppressed: false,
      label: item.name,
      origin: item.uuid,
      tint: null,
      transfer: true,
    };
    return foundry.utils.mergeObject(template, data);
  }

  /**
   * Clear the contents of the sample pack.
   */
  async clear() {
    const deleteIds = this.pack.index.map((i) => i._id);
    return Item.deleteDocuments(deleteIds, { pack: this.pack.metadata.id });
  }
}
