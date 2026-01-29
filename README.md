# Advantage Reminder for dnd5e

![GitHub release (latest by date and asset)](https://img.shields.io/github/downloads/kaelad02/adv-reminder/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fadv-reminder&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=adv-reminder)
![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/kaelad02/adv-reminder/releases/latest/download/module.json)

Advantage Reminder builds on how the D&D 5e system handles Advantage and Disadvantage on D20 Tests. While you can set Advantage on rolls like Saving Throws, it's not always clear when you should roll with Advantage or why. This module improves that by allowing you to make the default button stand out by styling it, as seen by the green button in the screenshot below. It also can tell you why you should make that roll, as seen by the "Advantage from Rage" message.

Advantage Reminder also lets you set Advantage or Disadvantage on more rolls (e.g. attacks) and in more situations (e.g. saving throw that sets a status) than the base system with Active Effects. And for those use cases that are so situational, you can add your own custom message on a roll.

[Full documentation on the wiki](https://github.com/kaelad02/adv-reminder/wiki)

![Saving Throw screenshot with advantage](docs/screenshot1.png?raw=true)

## Advantage, Disadvantage, and Critical Features

The original purpose of the module was to support Midi-QOL's flags to set Advantage, Disadvantage, and Critical with Active Effects. Since then, the D&D 5e system itself has added support for doing this on some rolls (e.g. Concentration and Ability Checks) with its Advantage Mode field. Advantage Reminder supports both and will correctly merge the system's setting and a Midi-QOL flag. For example, if you used the system to set Advantage on Strength Ability Checks and a Midi-QOL flag to set Disadvantage, you will get a Normal roll and shown both sources in the Messages section.

### D20 Tests

- Supports the system's Advantage Mode fields, including:
    - Show source if set directly on the character sheet or with an Active Effect
    - Show that Advantage/Disadvantage was overridden or suppressed if using the Override, Upgrade, and Downgrade change modes in an Active Effect
- Supports Advantage and Disadvantage rolls with Midi-QOL flags on:
  - Attacks, both on the attacker and target
  - Ability Checks
  - Skill Checks
  - Saving Throws
  - Death Saving Throws
- Supports Saving Throws vs. statuses through custom Active Effect keys (e.g. Dwarven Resilience)
- Combines Advantage and Disadvantage on those rolls that are also another type of roll, for example a Skill Check is also an Ability Check
- If a source is from an Active Effect or Condition, it will be a link that you can hover over to get more information or click on to open

### Damage Rolls

In addition to D20 Tests, Advantage Reminder does add some functionality to damage rolls

- If the preceding attack was a Natural 20, will show that as a Critical source
- Attacks on targets with certain conditions (e.g. Paralyzed) will be Criticals
- Supports Midi-QOL flags on both the attacker and target to make Criticals or suppress it for Normal damage (e.g. Adamantine Armor)

## Messages

In addition to active effects adding advantage or disadvantage, you can also add messages to remind you of conditional bonuses or advantage. For example, if you constantly forget to add `1d4` from the Guidance spell, you can add a message on skill rolls to remember to add that. In addition, you can use the deferred inline roll syntax (e.g. `[[/r 1d4]]`) to make it clickable, adding it to the Situational Bonus field.

![Skill Check screenshot with message](docs/skill-message.png?raw=true)

## Settings
Some of the features are controlled by settings.

- Style the default button by changing the button's color, text color, or make it wider. A client setting so each player can set it themselves.
- Show the sources of Advantage, Disadvantage, or Critical. A client setting so each player can set it themselves.
- Enable conditions to apply Advantage, Disadvantage, or Critical with the system's conditions (e.g. apply disadvantage to attacks when Poisoned). A GM-only setting.

## Fast-Forward Overrides

>[!NOTE]
> This is for D&D 5e system version 5.0 and earlier. Version 5.1 adds the ability to add to Advantage and to override it.

If the player holds down one of the Ctrl/Alt/Shift/Meta keys to fast-forward the die roll (e.g. hold Alt to roll with advantage, skipping the roll dialog) then this module WILL NOT do anything. Holding down one of those keys stops the roll dialog from popping up so it's interpreted as overriding what this module does.

## Module Compatibility

[Dynamic Active Effects](https://foundryvtt.com/packages/dae) This module will work with DAE and has a little integration with it. It adds the message flags to DAE's editor and adds an AR Messages tab to DAE's field browser.

[Midi QOL](https://foundryvtt.com/packages/midi-qol) This module works with Midi QOL, however there is a lot of crossover. Both modules can handle the advantage/disadvantage/critical flags, so you don't need this module for that. If you want the CSS change and messages feature, then it works with the following notes:

- This module will not process the advantage/disadvantage/critical flags if Midi QOL is active, since it will process them already
- Does not show messages if Midi QOL is configured to fast forward rolls since there is no dialog to show them 

[Ready Set Roll for D&D5e](https://foundryvtt.com/packages/ready-set-roll-5e) This module works with Ready Set Roll with the following notes:

- This module will apply advantage/disadvantage on checks even if RSR is configured for quick rolls. This is skipped if you hold down one of the roll modifier keys to manually apply advantage/disadvantage (similar to core behavior). 
- Does not show messages if RSR is configured for quick rolls since there is no dialog to show them
