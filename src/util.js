import { debugEnabled } from "./settings.js";

export const debug = (...args) => {
  if (debugEnabled) console.log("adv-reminder | ", ...args);
};

export const log = (...args) => console.log("adv-reminder | ", ...args);
