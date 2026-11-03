import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getAdjacentDistance, getApplicableChanges, getDistanceToTargetFn, getTarget, measureTokenDistance } from "../src/util.js";
import commonTestInit from "./common.js";

/**
 * A square grid where a diagonal costs the same as a straight move (5e default), 100px per 5ft space.
 */
function squareGrid() {
  return {
    isGridless: false,
    size: 100,
    sizeX: 100,
    sizeY: 100,
    distance: 5,
    measurePath: ([from, to]) => {
      const spaces = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) / 100;
      return { distance: Math.round(spaces) * 5 };
    },
  };
}

function gridlessGrid() {
  return { ...squareGrid(), isGridless: true, measurePath: () => { throw new Error("not used on gridless"); } };
}

function createToken(scene, { x, y, width = 1, height = 1, elevation = 0 }) {
  return { parent: scene, x, y, width, height, elevation };
}

beforeAll(() => {
  commonTestInit();
});

beforeEach(() => {
  setTargets();
});

describe("measureTokenDistance", () => {
  test("adjacent tokens on a square grid are one space apart", () => {
    const scene = { grid: squareGrid() };
    const a = createToken(scene, { x: 0, y: 0 });
    const b = createToken(scene, { x: 100, y: 0 });
    expect(measureTokenDistance(a, b)).toBe(5);
  });

  test("diagonally adjacent tokens are one space apart", () => {
    const scene = { grid: squareGrid() };
    const a = createToken(scene, { x: 0, y: 0 });
    const b = createToken(scene, { x: 100, y: 100 });
    expect(measureTokenDistance(a, b)).toBe(5);
  });

  test("large token measures from its closest space", () => {
    const scene = { grid: squareGrid() };
    const large = createToken(scene, { x: 0, y: 0, width: 2, height: 2 });
    const medium = createToken(scene, { x: 200, y: 100 });
    expect(measureTokenDistance(large, medium)).toBe(5);
  });

  test("elevation difference counts when larger than the horizontal distance", () => {
    const scene = { grid: squareGrid() };
    const a = createToken(scene, { x: 0, y: 0, elevation: 0 });
    const b = createToken(scene, { x: 100, y: 0, elevation: 30 });
    expect(measureTokenDistance(a, b)).toBe(30);
  });

  test("touching tokens on a gridless scene are at distance 0", () => {
    const scene = { grid: gridlessGrid() };
    const a = createToken(scene, { x: 0, y: 0 });
    const b = createToken(scene, { x: 100, y: 0 });
    expect(measureTokenDistance(a, b)).toBe(0);
  });

  test("gridless distance is edge to edge in scene units", () => {
    const scene = { grid: gridlessGrid() };
    const a = createToken(scene, { x: 0, y: 0 });
    const b = createToken(scene, { x: 300, y: 0 });
    expect(measureTokenDistance(a, b)).toBe(10);
  });
});

describe("measureTokenDistance on hexagonal grids", () => {
  test("large tokens measure between the centers of the hexes they cover", () => {
    // a fake hex grid whose space centers are shifted, to tell them apart from the token's own rectangle
    const grid = {
      ...squareGrid(),
      isHexagonal: true,
      getOffset: ({ x, y }) => ({ i: Math.floor(y / 100), j: Math.floor(x / 100) }),
      getCenterPoint: ({ i, j }) => ({ x: j * 100 + 30, y: i * 100 + 30 }),
    };
    const measured = [];
    grid.measurePath = ([from, to]) => {
      measured.push(from, to);
      return { distance: 5 };
    };
    const scene = { grid };

    measureTokenDistance(createToken(scene, { x: 0, y: 0, width: 2, height: 2 }), createToken(scene, { x: 500, y: 0 }));

    expect(measured.every(({ x, y }) => x % 100 === 30 && y % 100 === 30)).toBe(true);
  });
});

describe("getDistanceToTargetFn", () => {
  test("speaker without a scene returns Infinity instead of throwing", () => {
    game.scenes = { get: () => undefined };
    setTargets({});
    const distanceFn = getDistanceToTargetFn({ scene: null, token: null });
    expect(distanceFn()).toBe(Infinity);
  });

  test("no speaker returns Infinity", () => {
    game.scenes = { get: () => undefined };
    expect(getDistanceToTargetFn(undefined)()).toBe(Infinity);
  });

  test("measures from the speaker's token to the single target", () => {
    const scene = { grid: squareGrid() };
    const speakerToken = createToken(scene, { x: 0, y: 0 });
    scene.tokens = { get: (id) => (id === "tokenA" ? speakerToken : undefined) };
    game.scenes = { get: (id) => (id === "sceneA" ? scene : undefined) };
    const targetToken = createToken(scene, { x: 300, y: 0 });
    const targets = new Set([{ actor: {}, document: targetToken }]);
    targets.first = () => targets.values().next().value;
    game.user.targets = targets;

    expect(getDistanceToTargetFn({ scene: "sceneA", token: "tokenA" })()).toBe(15);
  });

  test("target on another scene returns Infinity", () => {
    const scene = { grid: squareGrid() };
    const otherScene = { grid: squareGrid() };
    const speakerToken = createToken(scene, { x: 0, y: 0 });
    scene.tokens = { get: () => speakerToken };
    game.scenes = { get: () => scene };
    const targets = new Set([{ actor: {}, document: createToken(otherScene, { x: 100, y: 0 }) }]);
    targets.first = () => targets.values().next().value;
    game.user.targets = targets;

    expect(getDistanceToTargetFn({ scene: "sceneA", token: "tokenA" })()).toBe(Infinity);
  });
});

describe("getTarget", () => {
  test("no targets returns undefined", () => {
    expect(getTarget()).toBeUndefined();
  });

  test("one target returns its actor", () => {
    const actor = { name: "goblin" };
    setTargets(actor);
    expect(getTarget()).toBe(actor);
  });

  test("several targets returns undefined", () => {
    setTargets({ name: "goblin" }, { name: "orc" });
    expect(getTarget()).toBeUndefined();
  });
});

describe("getApplicableChanges", () => {
  function createActor(...effects) {
    return {
      getRollData: jest.fn(() => ({})),
      allApplicableEffects: function* () {
        yield* effects;
      },
    };
  }

  function createEffect(changes, extra = {}) {
    return { active: true, system: { changes }, ...extra };
  }

  test("skips changes without a key or for the token", () => {
    const actor = createActor(createEffect([
      { key: "", type: "add", value: 1 },
      { key: "token.elevation", type: "add", value: 1 },
      { key: "flags.adv-reminder.message.all", type: "custom", value: "hello" },
    ]));
    const changes = getApplicableChanges(actor);
    expect(changes.map((c) => c.key)).toEqual(["flags.adv-reminder.message.all"]);
  });

  test("skips inactive effects", () => {
    const actor = createActor(createEffect([{ key: "a", type: "add", value: 1 }], { active: false }));
    expect(getApplicableChanges(actor)).toEqual([]);
  });

  test("respects shouldApplyChange", () => {
    const shouldApplyChange = jest.fn((change) => change.key !== "blocked");
    const actor = createActor(createEffect([
      { key: "blocked", type: "add", value: 1, phase: "initial" },
      { key: "allowed", type: "add", value: 1, phase: "initial" },
    ], { shouldApplyChange }));
    const changes = getApplicableChanges(actor);
    expect(changes.map((c) => c.key)).toEqual(["allowed"]);
    expect(shouldApplyChange).toHaveBeenCalledWith(expect.objectContaining({ key: "blocked" }),
      expect.objectContaining({ phase: "initial" }));
  });

  test("accepts a change that another module moved to a later phase", () => {
    // like DAE, which applies some keys in the "final" phase whatever phase the change stores
    const shouldApplyChange = (change, { phase }) => phase === (change.key === "moved" ? "final" : change.phase);
    const actor = createActor(createEffect([
      { key: "moved", type: "add", value: 1, phase: "initial" },
      { key: "stays", type: "override", value: 1, phase: "initial" },
    ], { shouldApplyChange }));
    const changes = getApplicableChanges(actor);
    expect(changes.map((c) => `${c.key}:${c.phase}`)).toEqual(["stays:initial", "moved:final"]);
  });

  test("never mutates the effect's own changes", () => {
    const original = { key: "a", type: "add", value: 1, phase: "initial" };
    const shouldApplyChange = (change) => { change.applied = true; return true; };
    getApplicableChanges(createActor(createEffect([original], { shouldApplyChange })));
    expect(original).not.toHaveProperty("applied");
    expect(original).not.toHaveProperty("effect");
  });

  test("does not build roll data when no change matches the filter", () => {
    const actor = createActor(createEffect([{ key: "a", type: "add", value: 1 }]));
    expect(getApplicableChanges(actor, () => false)).toEqual([]);
    expect(actor.getRollData).not.toHaveBeenCalled();
  });

  test("sorts by phase, then by priority defaulting to the change type", () => {
    const actor = createActor(createEffect([
      { key: "final-add", type: "add", value: 1, phase: "final" },
      { key: "override", type: "override", value: 1, phase: "initial" },
      { key: "add", type: "add", value: 1, phase: "initial" },
      { key: "explicit", type: "override", value: 1, phase: "initial", priority: 1 },
    ]));
    expect(getApplicableChanges(actor).map((c) => c.key)).toEqual(["explicit", "add", "override", "final-add"]);
  });

  test("links each change back to its effect", () => {
    const effect = createEffect([{ key: "a", type: "add", value: 1 }]);
    const [change] = getApplicableChanges(createActor(effect));
    expect(change.effect).toBe(effect);
  });
});

describe("getAdjacentDistance", () => {
  test("one grid space of the speaker's scene, not of the scene being viewed", () => {
    const metricScene = { grid: { ...squareGrid(), distance: 1.5 }, tokens: { get: () => undefined } };
    game.scenes = { get: (id) => (id === "metric" ? metricScene : undefined) };
    globalThis.canvas = { scene: { grid: squareGrid() } };

    const distanceFn = getDistanceToTargetFn({ scene: "metric", token: "tokenA" });

    expect(getAdjacentDistance(distanceFn)).toBe(1.5);
  });

  test("falls back on the viewed scene without a speaker's scene", () => {
    globalThis.canvas = { scene: { grid: { distance: 2 } } };

    expect(getAdjacentDistance(() => 0)).toBe(2);
  });
});
