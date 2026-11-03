# End-to-end audit

`npm run test:e2e` drives a real Foundry world with Playwright and checks what the Jest tests can't, because they mock
Foundry: the roll dialogs dnd5e actually renders, the default button it picks, the chat messages, the canvas distances
and the keybindings copied from the system. It is not run in CI, since it needs a licensed Foundry.

## Setup

1. Install the dependencies and Playwright's Chromium: `npm ci` then `npx playwright install chromium`.
2. Link or copy this folder to `<Foundry data>/Data/modules/adv-reminder`.
3. Launch a dnd5e world with Advantage Reminder enabled, and a Gamemaster user. For example, with a Node install:
   `node <Foundry>/resources/app/main.js --world=<world id> --port=30000`.
4. Run `npm run test:e2e`.

Environment variables:

| Variable | Default | Use |
|---|---|---|
| `FOUNDRY_URL` | `http://localhost:30000` | the running world |
| `FOUNDRY_USER` | the first user named Gamemaster | the user to log in as, must be a GM |
| `FOUNDRY_PASSWORD` | empty | that user's password |
| `E2E_VERBOSE` | unset | print the details of passing checks too |

## What it changes in the world

Every actor, scene and chat message it creates is named with `[adv-audit]` and deleted at the end, or at the start of
the next run if one crashed. It views a temporary scene for the distance checks, then views the original scene again;
it never activates a scene nor changes a setting.

The checks are written for the core roller. With Midi-QOL enabled the module only adds messages and sources, Midi sets
advantage, criticals and auto-fails itself and fast-forwards saves by default, so most checks fail by design; checking
the Midi roller needs rolls made through Midi's workflow, which this audit doesn't do yet.

Re-run it after every dnd5e update; the keybindings check fails as soon as the system changes the logic the module
copied.
