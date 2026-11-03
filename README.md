# Advantage Reminder for dnd5e

![GitHub release (latest by date and asset)](https://img.shields.io/github/downloads/kaelad02/adv-reminder/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fadv-reminder&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=adv-reminder)
![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/kaelad02/adv-reminder/releases/latest/download/module.json)

The D&D 5e system lets you set Advantage or Disadvantage on some D20 Tests, but it doesn't always make it obvious when a roll should have it, or why. Advantage Reminder fills that gap:

- it highlights the default button of the roll dialog (the green button in the screenshot below), so you see at a glance how you should roll;
- it lists the sources behind that choice, such as "Advantage from Rage";
- it lets Active Effects set Advantage, Disadvantage and Criticals on more rolls (attacks, for example) and in more situations (a saving throw against a status) than the system does on its own;
- it shows your own reminder messages in the roll dialog, for the bonuses that are too situational to automate.

[Full documentation on the wiki](https://github.com/kaelad02/adv-reminder/wiki)

![Saving Throw screenshot with advantage](docs/screenshot1.png?raw=true)

## Requirements

| | Minimum | Verified |
| --- | --- | --- |
| Foundry VTT | 14.367 | 14.369 |
| D&D 5e system | 6.0.0 | 6.0.6 |

Version 6.0.0 drops support for older Foundry and dnd5e versions. If you are still on Foundry V13, stay on the 5.x releases.

## Installation

In Foundry, open **Add-on Modules → Install Module** and paste this manifest URL:

```text
https://github.com/kaelad02/adv-reminder/releases/latest/download/module.json
```

## Advantage, Disadvantage and Criticals

The module started as a way to use Midi-QOL's flags for Advantage, Disadvantage and Critical in Active Effects. The system has since added its own Advantage Mode field on some rolls (Ability Checks, Saving Throws, Concentration and others). Advantage Reminder reads both and merges them: if the system gives Advantage on Strength checks and a Midi-QOL flag gives Disadvantage, you get a normal roll, and both sources are listed in the dialog.

### D20 Tests

- Supports the system's Advantage Mode fields:
  - shows the source, whether it was set on the character sheet or by an Active Effect;
  - shows when Advantage or Disadvantage was overridden or suppressed by the `override`, `upgrade`, `downgrade` and `subtract` change types.
- Supports Midi-QOL Advantage and Disadvantage flags on:
  - attacks, on both the attacker and the target;
  - ability checks, skill checks and tool checks;
  - saving throws and death saving throws.
- Supports saving throws against statuses with a custom Active Effect key, for features like Dwarven Resilience:
  `flags.adv-reminder.statuses.[status].save.roll.mode`
- Combines rolls that belong to more than one type: a skill check is also an ability check, so Advantage on one and Disadvantage on the other cancel out.
- Sources that come from an Active Effect or a condition are links: hover over them for details, click to open them.

### Damage Rolls

- If the attack was a natural 20, the Critical source is shown.
- Attacks against targets with certain conditions (Paralyzed, Unconscious) are Criticals when the attacker is adjacent.
- Midi-QOL flags on the attacker or the target can force a Critical or prevent it (Adamantine Armor, for example).

### Auto-fail

Midi-QOL `fail` flags, and conditions that make a roll fail automatically, cancel the roll and post a chat message in its place.

### Targets and distance

- Target-based reminders are applied only when exactly one token is targeted. With several targets they are skipped and the roll dialog says so.
- Distance is measured on the token's own scene, edge to edge on gridless scenes. "Adjacent" means within one grid space in the scene's units, so metric scenes work too.

## Messages

Besides Advantage and Disadvantage, Active Effects can add messages to the roll dialog to remind you of conditional bonuses. If you keep forgetting the `1d4` from Guidance, add a message to skill checks. Use the deferred inline roll syntax (`[[/r 1d4]]`) to make it clickable: clicking it adds the roll to the Situational Bonus field.

Messages are cleaned of unsafe HTML before they are shown, including the ones that come from a target's effects.

The **AR Message Sample Items** compendium contains ready-made examples. See [docs/messages.md](docs/messages.md) and [docs/message-flags.md](docs/message-flags.md) for the full list of keys.

![Skill Check screenshot with message](docs/skill-message.png?raw=true)

## Settings

- **Button Style** (client): color, text color and width of the default button. Each player sets their own.
- **Show Sources of Adv/Dis/Crit** (client): lists the sources of Advantage, Disadvantage and Critical in the dialog.
- **Enable Condition Effects** (world, GM only): makes the system's conditions apply Advantage, Disadvantage or Critical (for example Disadvantage on attacks while Poisoned).

## Fast-Forward

Holding one of the system's fast-forward keys skips the roll dialog, so messages and sources are not shown. What happens to the reminders depends on how many keys you hold:

- **One key** (Shift for normal, Alt for Advantage, Ctrl/Meta for Disadvantage): the reminders still apply and the system combines them with the key. Holding Alt while the module adds Disadvantage gives a normal roll.
- **Two keys** force the result and the module applies no reminders: Shift+Alt forces Advantage, Shift+Ctrl forces Disadvantage, Alt+Ctrl forces a normal roll.

## Module Compatibility

**[Dynamic Active Effects](https://foundryvtt.com/packages/dae)**: works with DAE. The message flags appear in DAE's editor and an AR Messages tab is added to its field browser. Reminders are found even when DAE moves a change to another application phase.

**[Midi-QOL](https://foundryvtt.com/packages/midi-qol)**: works with Midi-QOL, but the two overlap. Midi-QOL already handles the Advantage, Disadvantage and Critical flags, so with Midi-QOL active this module leaves them to it and only adds the button style and the messages. Messages are not shown when Midi-QOL fast-forwards rolls, because there is no dialog.

**[Ready Set Roll for D&D5e](https://foundryvtt.com/packages/ready-set-roll-5e)**: supported, but not yet tested with Foundry V14 and dnd5e 6.

- Advantage and Disadvantage are applied to checks even when RSR is set to quick rolls, unless you hold a roll modifier key to choose manually (as in the core system).
- Messages are not shown with quick rolls, because there is no dialog.

## Upgrading from 5.x

- Foundry 14.367 and dnd5e 6.0.0 are now the minimum versions.
- The Midi-QOL keys `advantage.ability.check.*` and `advantage.ability.save.*` (and their `disadvantage` counterparts) are deprecated and will be removed in 7.0.0. Use `advantage.check.*` and `advantage.save.*` instead.
- Settings from very old versions are no longer migrated.

See the [CHANGELOG](CHANGELOG.md) for the full list of changes.

## Languages

English, French, Italian and Portuguese (Brazil). The Portuguese translation is missing the strings added in 6.0.0 and shows them in English.

## Development

- `npm test` runs the unit tests.
- `npm run build` packs `packs/_source` into the compendium; `npm run unpack` does the reverse.
- The "AR Message Sample Items" compendium is rebuilt with `utils/sample-pack-builder.mjs`, a development tool that is not part of the released module. The comment at the top of that file explains how to run it.
