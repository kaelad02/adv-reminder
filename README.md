# Advantage Reminder for dnd5e

Want to use active effects to give your barbarian advantage on strength ability checks and saving throws when Raging? Don't want to install Midi QOL to do it? Then this module might be for you.

![Saving Throw screenshot with advantage](screenshot1.png?raw=true)

The basic die roller the D&D 5e system uses provides a pop-up dialog to give the player a chance to add situational bonuses or make d20 rolls with advantage/disadvantage or damage rolls as critical hits. It does not change the default button to remind you when to roll with advantage, disadvantage, or a critical hit. This module uses the active effect keys defined by Midi QOL to change the default button. This is useful if you want to be reminded to roll with advantage on a Strength saving throw while Raging, for example, but you do not want to use Midi QOL. Midi QOL is great at automating combat with its workflow, however not every game group wants that level of automation. If all you want is a reminder but remain in control of the die rolls, then this module is for you.

In addition to the active effects, this module supports armor that imposes stealth disadvantage when equipped. It also makes some small CSS changes (bold text) in order to make the advantage, disadvantage, and critical hit buttons more obvious when they should be clicked.

Supports active effects on the following rolls:

* Attack rolls
* Ability checks
* Saving throws, including auto-fail (e.g. Stunned)
* Skill checks
* Tool checks
* Death saves
* Damage rolls

## Auto-Fail Rolls

There are active effect keys for automatically failing ability checks, saving throws, skill checks, and casting spells. Only keys relavent to saving throws are supported. The choice to only fail saving throws was made because those are the only auto-fail rolls that the base rules support. However, if there is a use case for adding support for other checks, they can be added.

## Fast-Forward Overrides

If the player holds down one of the Ctrl/Alt/Shift/Meta keys to fast-forward the die roll (e.g. hold Alt to roll with advantage, skipping the roll dialog) then this module WILL NOT do anything. Holding down one of those keys stops the roll dialog from popping up so it's interpreted as overriding what this module does.

## Other Modules

Notes about other modules.

### Required Modules

[libWrapper](https://foundryvtt.com/packages/lib-wrapper) - A library that makes it easy to wrap core Foundry VTT code. It's used to check the active effects before one of the supported rolls happens to pass along the advantage, disadvantage, or critical option.

### Suggested Modules

[Dynamic Active Effects](https://foundryvtt.com/packages/dae) A module that improves the Active Effects system used by dnd5e.

[Combat Utility Belt](https://foundryvtt.com/packages/combat-utility-belt) - A module that provides status effects for dnd5e. They also include the active effect keys that Midi QOL defined that this module uses.

[DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) - same as Combat Utility Belt

### Compatibility Notes

[Better Rolls for 5e](https://foundryvtt.com/packages/betterrolls5e) This module works with Better Rolls, making rolls with advantage and disadvantage with some caviats.

* Active effects for critical hits do not work.
* The "d20 Mode" Better Rolls setting of "Single Roll Upgradeable" does not give the hint in the pop-up asking what kind of roll to perform. It will still apply the active effects though possibly leading to some confusion, especially since advantage and disadvantage will not cancel each other out like they should.

[Midi QOL](https://foundryvtt.com/packages/midi-qol) This module is compatible with Midi QOL. However, if you've enabled Midi QOL's workflow then it is not necessary to use this module as well since Midi QOL will already do this for you.
