# Advantage Reminder for dnd5e

![GitHub release (latest by date and asset)](https://img.shields.io/github/downloads/kaelad02/adv-reminder/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fadv-reminder&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=adv-reminder)
![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/kaelad02/adv-reminder/releases/latest/download/module.json)

Want to use active effects to give your barbarian advantage on strength ability checks and saving throws when Raging? Don't want to install Midi QOL to do it? Then this module might be for you.

![Saving Throw screenshot with advantage](docs/screenshot1.png?raw=true)

The basic die roller the D&D 5e system uses provides a pop-up dialog to give the player a chance to add situational bonuses or make d20 rolls with advantage/disadvantage or damage rolls as critical hits. It does not change the default button to remind you when to roll with advantage, disadvantage, or a critical hit. This module uses the active effect keys defined by Midi QOL to change the default button. This is useful if you want to be reminded to roll with advantage on a Strength saving throw while Raging, for example, but you do not want to use Midi QOL. Midi QOL is great at automating combat with its workflow, however not every game group wants that level of automation. If all you want is a reminder but remain in control of the die rolls, then this module is for you.

In addition to the active effects, this module supports armor that imposes stealth disadvantage when equipped. It also makes some small CSS changes (bold text) in order to make the advantage, disadvantage, and critical hit buttons more obvious when they should be clicked.

[Midi Flags](docs/midi-flags.md) lists the supported Midi active effect flags.

## Auto-Fail Rolls

There are active effect keys for automatically failing ability checks, saving throws, skill checks, and casting spells. Only keys relavent to saving throws are supported. The choice to only fail saving throws was made because those are the only auto-fail rolls that the base rules support. However, if there is a use case for adding support for other checks, they can be added.

## Fast-Forward Overrides

If the player holds down one of the Ctrl/Alt/Shift/Meta keys to fast-forward the die roll (e.g. hold Alt to roll with advantage, skipping the roll dialog) then this module WILL NOT do anything. Holding down one of those keys stops the roll dialog from popping up so it's interpreted as overriding what this module does.

## Messages

In addition to active effects adding advantage or disadvantage, you can also add messages to remind you of conditional bonuses or advantage. For example, features like Dwarven Resilience give advantage on saving throws against poison don't work with the advantage flags since there isn't a way to limit it to poison. Now you can add a message to the dialog right above the buttons to remind you about Dwarven Resilience.

![Saving Throw screenshot with message](docs/poison-message.png?raw=true)

[Messages](docs/messages.md) has more information about the messages feature, including the active effect keys.

## Other Modules

Notes about other modules.

### Suggested Modules

[Dynamic Active Effects](https://foundryvtt.com/packages/dae) A module that improves the Active Effects system used by dnd5e.

[Combat Utility Belt](https://foundryvtt.com/packages/combat-utility-belt) - A module that provides status effects for dnd5e. They also include the active effect keys that Midi QOL defined that this module uses.

[DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) - same as Combat Utility Belt

### Compatibility Notes

[Better Rolls for 5e](https://foundryvtt.com/packages/betterrolls5e) This module works with Better Rolls, making rolls with advantage and disadvantage with the following known issues.

- Active effects for critical hits do not work.
- The "d20 Mode" Better Rolls setting of "Single Roll Upgradeable" does not give the hint in the pop-up asking what kind of roll to perform. It will still apply the active effects though possibly leading to some confusion, especially since advantage and disadvantage will not cancel each other out like they should.
- Does not show messages, even if "d20 Mode" is set to "Query for (Dis)Advantage"

[Midi QOL](https://foundryvtt.com/packages/midi-qol) This module works with Midi QOL, however there is a lot of crossover. Both modules will handle the advantage/disadvantage/critical flags, so you don't need this module for that. If you want the CSS change and messages feature, then it works with these known issues:

- Midi QOL will ignore any advantage/disadvantage/critical settings that Advantage Reminder finds and passes along. It will perform the check for those flags itself. It is wasted work but shouldn't cause a noticable performance hit.
- Does not show messages if Midi QOL is configured to fast forward rolls

[Minimal Rolling Enhancements for D&D5e](https://foundryvtt.com/packages/mre-dnd5e) This module works with MRE, making rolls with advantage/disadvantage and showing messages if you hold the "Roll Dialog Modifier Key" (an MRE setting).

[Dynamic effects using Active Effects](https://foundryvtt.com/packages/dae) If you're using the message feature to add inline roll formulas, you need to use DAE version 0.10.01 or newer. Earlier versions would evaluate the deferred die roll in the active effect's value, making the button not work.
