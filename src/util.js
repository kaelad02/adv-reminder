export function debugEnabled() {
  return game.settings.get("adv-reminder", "debugMode");
}

export const debug = (...args) => {
  try {
    if (debugEnabled()) log(...args);
  } catch (e) {}
};

export const log = (...args) => console.log("adv-reminder |", ...args);

/**
 * Check if a module is active and at least a minimum version.
 * @param {string} name the module name
 * @param {string} version the minimum version
 * @returns true if the module is active and at least the minimum version, false otherwise
 */
export function isMinVersion(name, version) {
  const module = game.modules.get(name);
  return module?.active && isNewerVersion(module.version, version);
}

/**
 * Get the first targeted actor, if there are any targets at all.
 * @returns {Actor5e} the first target, if there are any
 */
export function getTarget() {
  return [...game.user.targets][0]?.actor;
}

export function getDistanceToTargetFn(speaker) {
  return () => {
    const controlledTokenDoc = game.scenes.get(speaker.scene).tokens.get(speaker.token);
    const targetTokenDoc = game.user.targets.first()?.document;
    if (!controlledTokenDoc || !targetTokenDoc) return Infinity;

    // make rays from each controlled grid space to targeted grid space
    const controlledSpaces = _getAllTokenGridSpaces(controlledTokenDoc);
    const targetSpaces = _getAllTokenGridSpaces(targetTokenDoc);
    const rays = controlledSpaces.flatMap((c) => targetSpaces.map((t) => ({ ray: new Ray(c, t) })));

    // measure the horizontal distance: shortest distance between the two tokens' squares
    const dist = canvas.scene.grid.distance;
    const distances = canvas.grid
      .measureDistances(rays, { gridSpaces: true })
      .map((d) => Math.round(d / dist) * dist);
    const horizDistance = Math.min(distances);

    // compute vertical distance: diff in elevation
    const verticalDistance = Math.abs(controlledTokenDoc.elevation - targetTokenDoc.elevation);
    return Math.max(horizDistance, verticalDistance);
  };
}

function _getAllTokenGridSpaces({ width, height, x, y }) {
  // if the token is in a single space, just return that
  if (width <= 1 && height <= 1) return [{ x, y }];
  // create a position for each grid square it takes up
  const grid = canvas.grid.size;
  const centers = [];
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      centers.push({
        x: x + w * grid,
        y: y + h * grid,
      });
    }
  }
  return centers;
}
