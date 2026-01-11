export default function commonTestInit() {
  // common setup functions

  globalThis.createActorWithFlags = (...keys) => {
    const actor = {
      flags: {},
      hasConditionEffect: () => false,
      system: {},
    };
    keys.forEach((k) => foundry.utils.setProperty(actor, k, true));
    return actor;
  };

  globalThis.CONFIG = {};
  globalThis.CONFIG.DND5E = {};
  globalThis.CONFIG.DND5E.conditionEffects = {};

  // for reminders
  globalThis.dnd5e = {
    dataModels: {
      fields: {
        AdvantageModeField: {
          getCounts: () => ({
            override: null,
            advantages: { count: 0, suppressed: false },
            disadvantages: { count: 0, suppressed: false }
          })
        }
      }
    }
  };

  // copied from Foundry

  function filter(test) {
    const filtered = new Set();
    let i = 0;
    for ( const v of this ) {
      if ( test(v, i, this) ) filtered.add(v);
      i++;
    }
    return filtered;
  }
  function toObject() {
    return Array.from(this);
  }
  Object.defineProperties(Set.prototype, {
    filter: {value: filter},
    toObject: {value: toObject}
  });

  globalThis.foundry = {};
  globalThis.foundry.utils = {};

  globalThis.foundry.utils.setProperty = (object, key, value) => {
    // split the key into parts, removing the last one
    const parts = key.split(".");
    const lastProp = parts.pop();
    // recursively create objects out the key parts
    const lastObj = parts.reduce((obj, prop) => {
      if (!obj.hasOwnProperty(prop)) obj[prop] = {};
      return obj[prop];
    }, object);
    // set the value using the last key part
    lastObj[lastProp] = value;
  };

  globalThis.foundry.utils.getProperty = (object, key) => {
    if (!key) return undefined;
    if (key in object) return object[key];
    let target = object;
    for (let p of key.split(".")) {
      foundry.utils.getType(target);
      if (!(typeof target === "object")) return undefined;
      if (p in target) target = target[p];
      else return undefined;
    }
    return target;
  };

  globalThis.foundry.utils.flattenObject = (obj, _d = 0) => {
    const flat = {};
    if (_d > 100) {
      throw new Error("Maximum depth exceeded");
    }
    for (let [k, v] of Object.entries(obj)) {
      let t = foundry.utils.getType(v);
      if (t === "Object") {
        if (foundry.utils.isEmpty(v)) flat[k] = v;
        let inner = foundry.utils.flattenObject(v, _d + 1);
        for (let [ik, iv] of Object.entries(inner)) {
          flat[`${k}.${ik}`] = iv;
        }
      } else flat[k] = v;
    }
    return flat;
  };

  globalThis.foundry.utils.getType = (variable) => {
    // Primitive types, handled with simple typeof check
    const typeOf = typeof variable;
    if (typeOf !== "object") return typeOf;

    // Special cases of object
    if (variable === null) return "null";
    if (!variable.constructor) return "Object"; // Object with the null prototype.
    if (variable.constructor.name === "Object") return "Object"; // simple objects

    // Match prototype instances
    const prototypes = [
      [Array, "Array"],
      [Set, "Set"],
      [Map, "Map"],
      [Promise, "Promise"],
      [Error, "Error"],
      //[Color, "number"],
    ];
    if ("HTMLElement" in globalThis) prototypes.push([globalThis.HTMLElement, "HTMLElement"]);
    for (const [cls, type] of prototypes) {
      if (variable instanceof cls) return type;
    }

    // Unknown Object type
    return "Object";
  };

  globalThis.foundry.utils.isEmpty = (value) => {
    const t = foundry.utils.getType(value);
    switch (t) {
      case "undefined":
        return true;
      case "Array":
        return !value.length;
      case "Object":
        return foundry.utils.getType(value) === "Object" && !Object.keys(value).length;
      case "Set":
      case "Map":
        return !value.size;
      default:
        return false;
    }
  };
}
