let debugMode = false;

/**
 * Cache the debugMode setting so `debug` doesn't read the setting on every call.
 * @param {boolean} value
 */
export function setDebugMode(value) {
  debugMode = !!value;
}

export function debugEnabled() {
  return debugMode;
}

export const debug = (...args) => {
  if (debugMode) log(...args);
};

export const log = (...args) => console.log("adv-reminder |", ...args);

/**
 * Get the targeted actor, only if there is exactly one target. With several targets there is no way to know which
 * one the roll is against, so target-based reminders are skipped.
 * @returns {Actor5e|undefined} the target, if there is exactly one
 */
export function getTarget() {
  const targets = game.user.targets;
  return targets.size === 1 ? targets.first()?.actor : undefined;
}

/**
 * @returns {boolean} true if the user is targeting more than one token
 */
export function hasMultipleTargets() {
  return game.user.targets.size > 1;
}

/**
 * Get the ID of the chat message a roll was made from (e.g. the save or damage button on an activity's card).
 * Same lookup as dnd5e: the message's origin first, then the clicked element. Never use `event.currentTarget`, which
 * is null once the click has been dispatched, e.g. for the second target of a save.
 * @param {Event} [event] the triggering event
 * @param {object} [message] the roll's message configuration
 * @returns {string|undefined}
 */
export function getOriginMessageId(event, message) {
  return message?.data?.system?.origin ?? event?.target?.closest?.("[data-message-id]")?.dataset?.messageId;
}

/**
 * The distance, in the scene's units, at which a target counts as adjacent: one grid space of the scene the distance is
 * measured on, or of the viewed scene if unknown.
 * @param {function} [distanceFn] a function from getDistanceToTargetFn
 * @returns {number}
 */
export function getAdjacentDistance(distanceFn) {
  return distanceFn?.adjacentDistance ?? canvas?.scene?.grid?.distance ?? 5;
}

export function getDistanceToTargetFn(speaker) {
  const scene = game.scenes.get(speaker?.scene);
  const distanceFn = () => {
    const controlledTokenDoc = scene?.tokens.get(speaker.token);
    const targetTokenDoc = getTarget() ? game.user.targets.first().document : undefined;
    if (!controlledTokenDoc || !targetTokenDoc || targetTokenDoc.parent !== scene) return Infinity;
    return measureTokenDistance(controlledTokenDoc, targetTokenDoc);
  };
  // adjacency is one grid space of the scene the tokens are on
  distanceFn.adjacentDistance = scene?.grid?.distance;
  return distanceFn;
}

/**
 * Measure the distance between two tokens on the same scene, in the scene's units.
 * Horizontal distance is between the closest pair of grid spaces (or edge to edge on a gridless scene),
 * vertical distance is the difference in elevation, and the result is the larger of the two.
 * @param {TokenDocument} a
 * @param {TokenDocument} b
 * @returns {number}
 */
export function measureTokenDistance(a, b) {
  const grid = a.parent.grid;
  const horizontal = grid.isGridless ? _edgeDistance(a, b, grid) : _closestSpaceDistance(a, b, grid);
  const vertical = Math.abs((a.elevation ?? 0) - (b.elevation ?? 0));
  return Math.max(horizontal, vertical);
}

function _closestSpaceDistance(a, b, grid) {
  const withOffsets = (token) => _getTokenSpaceCenters(token, grid).map((point) => ({ point, offset: grid.getOffset(point) }));
  const aSpaces = withOffsets(a);
  const bSpaces = withOffsets(b);
  let min = Infinity;
  for (const from of aSpaces) {
    for (const to of bSpaces) {
      min = Math.min(min, _spaceDistance(from, to, grid));
      if (min === 0) return 0;
    }
  }
  return min;
}

function _spaceDistance(from, to, grid) {
  // a diagonal neighbor is adjacent whatever the diagonal rule (Euclidean, alternating, illegal) makes it cost. Not
  // SquareGrid#testAdjacency, which makes diagonals non-adjacent when they are illegal
  if (!grid.isHexagonal) {
    const spaces = Math.max(Math.abs(from.offset.i - to.offset.i), Math.abs(from.offset.j - to.offset.j));
    if (spaces <= 1) return spaces * grid.distance;
  }
  // snap to whole grid spaces, e.g. Euclidean diagonals
  const d = grid.measurePath([from.point, to.point]).distance;
  return Math.round(d / grid.distance) * grid.distance;
}

function _getTokenSpaceCenters({ x, y, width, height }, grid) {
  // create the center point of each grid space the token takes up, spread over the token's own size so a token of a
  // fractional size (e.g. Tiny) isn't measured from the edge of the next space
  const columns = Math.max(1, Math.round(width));
  const rows = Math.max(1, Math.round(height));
  const spaceWidth = (width * grid.sizeX) / columns;
  const spaceHeight = (height * grid.sizeY) / rows;
  const centers = [];
  for (let w = 0; w < columns; w++) {
    for (let h = 0; h < rows; h++) {
      centers.push({ x: x + (w + 0.5) * spaceWidth, y: y + (h + 0.5) * spaceHeight });
    }
  }
  if (!grid.isHexagonal) return centers;

  // hexes don't line up with the token's rectangle: snap each point to the center of the hex it is in. Cheaper than
  // TokenDocument#getOccupiedGridSpaceOffsets, which also tests walls and levels
  const snapped = new Map();
  for (const point of centers) {
    const center = grid.getCenterPoint(grid.getOffset(point));
    snapped.set(`${center.x},${center.y}`, center);
  }
  return [...snapped.values()];
}

function _edgeDistance(a, b, grid) {
  // gap between the two tokens' rectangles, in pixels, converted to scene units
  const gap = (aStart, aSize, bStart, bSize) => Math.max(0, bStart - (aStart + aSize), aStart - (bStart + bSize));
  const dx = gap(a.x, a.width * grid.sizeX, b.x, b.width * grid.sizeX);
  const dy = gap(a.y, a.height * grid.sizeY, b.y, b.height * grid.sizeY);
  return (Math.hypot(dx, dy) / grid.size) * grid.distance;
}

/**
 * The active effect change phases in the order they apply: the core "initial" first, then any phase a system or module
 * registered in CONFIG.ActiveEffect.phases, then the core "final".
 * @returns {string[]}
 */
function getChangePhases() {
  // core lists the registered phases first, which isn't the order they apply in
  const registered = Object.keys(foundry.documents.ActiveEffect.implementation.CHANGE_PHASES)
    .filter((p) => (p !== "initial") && (p !== "final"));
  return ["initial", ...registered, "final"];
}

/**
 * Get a sorted array of active effect changes that apply to the actor. Can optionally filter it by change key.
 * @param {Actor5e} actor the Actor
 * @param {(change: Object) => boolean} filterFn filter on the change
 * @return {Object[]} array of changes, including a link back to the effect
 */
export function getApplicableChanges(actor, filterFn = () => true) {
  // modeled after Actor#applyActiveEffects

  const candidates = [];
  for ( const effect of actor.allApplicableEffects() ) {
    if ( !effect.active ) continue;
    for ( const change of effect.system?.changes ?? [] ) {
      // skip changes the core skips: no key, or ones that apply to the Token instead
      if ( !change.key || change.key.startsWith("token.") ) continue;
      if ( filterFn(change) ) candidates.push({ effect, change });  // added filter step
    }
    // removed adding to this.statuses
  }
  if ( !candidates.length ) return [];

  // only build the roll data if a change needs it, and the replacement data once per effect
  let rollData;
  const dataByEffect = new Map();
  const getReplacementData = (effect) => {
    if ( !dataByEffect.has(effect) ) {
      rollData ??= actor.getRollData?.() ?? {};
      dataByEffect.set(effect, effect.getReplacementData?.(rollData) ?? rollData);
    }
    return dataByEffect.get(effect);
  };
  const phases = getChangePhases();
  const changes = [];
  for ( const { effect, change } of candidates ) {
    // core asks every phase in turn, and modules (e.g. DAE) can move a change to another phase, so a change applies
    // if any phase accepts it. Pass a copy since the system marks the change as applied.
    let phase = change.phase ?? "initial";
    if ( typeof effect.shouldApplyChange === "function" ) {
      const replacementData = getReplacementData(effect);
      phase = phases.find((p) => effect.shouldApplyChange(foundry.utils.deepClone(change), { phase: p, replacementData }));
      if ( !phase ) continue;
    }
    const c = foundry.utils.deepClone(change);
    c.effect = effect;
    c.phase = phase;
    // as core's ActiveEffect#prepareBaseData
    c.priority ??= foundry.documents.ActiveEffect.implementation.CHANGE_TYPES[c.type]?.defaultPriority ?? 0;
    changes.push(c);
  }

  // changes in an earlier phase apply before a later phase, regardless of priority
  const phaseOrder = (phase) => {
    const i = phases.indexOf(phase);
    return i === -1 ? phases.length : i;
  };
  changes.sort((a, b) => (phaseOrder(a.phase) - phaseOrder(b.phase)) || (a.priority - b.priority));
  return changes;
}
