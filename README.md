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

[Messages](docs/messages.md) has more information about the messages feature, including the active effect keys. There is also a compendium pack, AR Message Sample Items, that contains samples.

## Other Modules

Notes about other modules.

### Suggested Modules

[Dynamic Active Effects](https://foundryvtt.com/packages/dae) A module that improves the Active Effects system used by dnd5e.

[Combat Utility Belt](https://foundryvtt.com/packages/combat-utility-belt) - A module that provides status effects for dnd5e. They also include the active effect keys that Midi QOL defined that this module uses.

[DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) - same as Combat Utility Belt

### Compatibility Notes

[Midi QOL](https://foundryvtt.com/packages/midi-qol) This module works with Midi QOL, however there is a lot of crossover. Both modules can handle the advantage/disadvantage/critical flags, so you don't need this module for that. If you want the CSS change and messages feature, then it works with the following notes:

- This module will not process the advantage/disadvantage/critical flags if Midi QOL is active, since it will process them already
- Does not show messages if Midi QOL is configured to fast forward rolls

[Faster Rolling by Default DnD5e](https://foundryvtt.com/packages/faster-rolling-by-default-5e) This moodule works with Faster Rolling by Default. If the dialog is shown, it will show any messages and have the default button set correctly.

[Roll Groups](https://foundryvtt.com/packages/rollgroups) This module works with Roll Groups.

[Ready Set Roll for D&D5e](https://foundryvtt.com/packages/ready-set-roll-5e) This module works with Ready Set Roll but does nothing when quick rolls are enabled. Since quick rolls fast forward, skipping the dialog, this module does nothing. However, if you have quick rolls disabled for certain rolls then it will work, processing advantage/disadvantage/critical defaults and showing messages.
