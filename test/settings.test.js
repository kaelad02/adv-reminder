import { beforeAll, describe, expect, test } from "@jest/globals";
import commonTestInit from "./common.js";

let applyButtonStyle;

beforeAll(async () => {
  commonTestInit();

  // settings.js reads these when it is imported
  globalThis.foundry.abstract = { DataModel: class {} };
  globalThis.foundry.data = {
    fields: { BooleanField: class {}, ColorField: class {}, SchemaField: class {}, StringField: class {} },
  };
  globalThis.foundry.applications = {
    api: { ApplicationV2: class {}, HandlebarsApplicationMixin: (cls) => cls },
  };

  ({ applyButtonStyle } = await import("../src/settings.js"));
});

function createElement() {
  const classes = new Set();
  const style = new Map();
  return {
    classList: { add: (c) => classes.add(c), remove: (...cs) => cs.forEach((c) => classes.delete(c)) },
    style: { setProperty: (k, v) => style.set(k, v), removeProperty: (k) => style.delete(k) },
    classes,
    styles: style,
  };
}

function setButtonStyle(buttonStyle) {
  game.settings = { get: () => buttonStyle };
  game.user.color = "#123456";
}

describe("applyButtonStyle", () => {
  test("a background color without a text color keeps the system's text color", () => {
    setButtonStyle({ wide: false, color: "player", custom: {} });
    const element = createElement();

    applyButtonStyle(element);

    expect(element.styles.get("--adv-reminder-background-color")).toBe("#123456");
    expect(element.styles.has("--adv-reminder-color")).toBe(false);
    expect(element.classes.has("adv-reminder-color")).toBe(true);
    expect(element.classes.has("adv-reminder-text-color")).toBe(false);
  });

  test("a custom text color is applied", () => {
    setButtonStyle({ wide: false, color: "custom", custom: { buttonColor: "#000000", textColor: "#ffffff" } });
    const element = createElement();

    applyButtonStyle(element);

    expect(element.styles.get("--adv-reminder-color")).toBe("#ffffff");
    expect(element.classes.has("adv-reminder-text-color")).toBe(true);
  });

  test("the default style removes what a previous style applied", () => {
    const element = createElement();
    setButtonStyle({ wide: true, color: "custom", custom: { buttonColor: "#000000", textColor: "#ffffff" } });
    applyButtonStyle(element);

    setButtonStyle({ wide: false, color: "default", custom: {} });
    applyButtonStyle(element);

    expect([...element.classes]).toEqual([]);
    expect([...element.styles.keys()]).toEqual([]);
  });
});
