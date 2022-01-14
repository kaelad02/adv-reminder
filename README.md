# Advantage Reminder for dnd5e

This module uses the active effect keys defined by Midi QOL to set the default of certain die rolls to advantage/disadvantage/critical. This is useful if you want to be reminded of advantage on Strength saving throws while Raging, for example, but you do not want to use Midi QOL. Midi QOL is great at automating combat with its workflow, however not every game group wants that level of automation. This module provides a good compromise by changing the default to remind you to roll with advantage, disadvantage, or a critical hit.

It also makes some small CSS changes (bold text) in order to make the advantage, disadvantage, and critical hit buttons more obvious when they should be clicked.

Supports active effects on the following rolls:

* Attack rolls
* Ability checks
* Saving throws, including auto-fail (e.g. Stunned)
* Skill checks
* Tool checks
* Death saves
* Damage rolls

### Auto-Fail Rolls

There are active effect keys for automatically failing ability checks, saving throws, skill checks, and casting spells. Only keys relavent to saving throws are supported. The choice to only fail saving throws was made because those are the only auto-fail rolls that the base rules support. However, if there is a use case for adding support for other checks, they can be added.

### Fast-Forward Overrides

If the player holds down one of the Ctrl/Alt/Shift/Meta to fast-forward the die roll (e.g. hold Alt to roll with disadvantage, skipping the roll dialog) then this module WILL NOT do anything. Holding down one of those keys stops the roll dialog from popping up so it's interpreted as overriding what this module does.

## Required Modules

[libWrapper](https://foundryvtt.com/packages/lib-wrapper) - A library that makes it easy to wrap core Foundry VTT code. It's used to check the active effects before one of the supported rolls happens to pass along the advantage, disadvantage, or critical option.

## Suggested Modules

[Dynamic Active Effects](https://foundryvtt.com/packages/dae) A module that improves the Active Effects system used by dnd5e.

[Combat Utility Belt](https://foundryvtt.com/packages/combat-utility-belt) - A module that provides status effects for dnd5e. They also include the active effect keys that Midi QOL defined that this module uses.

[DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) - same as Combat Utility Belt

## Incompatible Modules

[Midi QOL](https://foundryvtt.com/packages/midi-qol) It hopefully goes without saying, but since this module replicates some of the functionality that Midi QOL does, you should pick one or the other.
