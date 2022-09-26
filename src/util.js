export function debugEnabled() {
  return game.modules.get("_dev-mode")?.api?.getPackageDebugValue("adv-reminder");
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
