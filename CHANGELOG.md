# upcoming

- feature: Support the system's new concentration rolls with sources and messages with `flags.adv-reminder.message.ability.concentration` (system already handles advantage/disadvantage)
- feature: Support `flags.midi-qol.grants.critical.range` for conditions like Paralyzed that turn hits into crits if the attacker is adjacent. Does not currently work with Ready Set Roll, will just be ignored.

# 3.4.1

- feature: [#64](https://github.com/kaelad02/adv-reminder/pull/64) Add pt-BR translation, thanks @Kharmans

# 3.4.0

- feature: Update the system-defined status effects to include advantage/disadvantage flags. Controlled by a setting.

# 3.3.2

- bug fix: [#60](https://github.com/kaelad02/adv-reminder/issues/60) Fix tool checks to show advantage and messages again after the check was moved from the item to the actor
- bug fix: Honor the ability you can pass into the `rollSkill` function, overriding the normal ability used for a skill. Examples would be a macro or using the new enricher to make a Strength (Intimidation) check.

# 3.3.1

- bug fix: [#56](https://github.com/kaelad02/adv-reminder/issues/56) Fully support messages on damage rolls other than attacks
- bug fix: [#58](https://github.com/kaelad02/adv-reminder/issues/58) Fixed integration with Ready Set Roll after the 3.0-compatibility release

# 3.3.0

- bug fix: 3.0.0 compatibility for Messages and Souces from effects on items
- bug fix: 3.0.0 compatibility with new stealthDisadvantage property
- bug fix: use `name` instead of `label` on effect to remove deprecation warning
- feature: now requires dnd5e 3.0.0 and thus, Foundry 11

# 3.2.1

- bug fix: tweak how messages are added to the dialog to remove a conflict with another module that also changes that dialog
- feature: update verified version to Foundry v11

# 3.2.0

- feature: add better support for Ready Set Roll with adv/dis/crit checks
- feature: apply Midi's flags to the actor instead of reading the active effects directly
- bug fix: disadvantage on stealth from armor not working consistently

# 3.1.2

- bug fix: [#45](https://github.com/kaelad02/adv-reminder/issues/45) Disable auto-fail saving throws if Midi is active

# 3.1.1

- feature: [#44](https://github.com/kaelad02/adv-reminder/pull/44) update French language file

# 3.1
- bug fix: [#40](https://github.com/kaelad02/adv-reminder/issues/40) support Inline Roll Commands and other custom enrichers in messages
- feature: add AR Message Sample Items compendium pack
- feature: [#38](https://github.com/kaelad02/adv-reminder/issues/38) add a grant message flag when targeted

# 3.0

- feature: now requires v10, removes warnings about using deprecated functions
- feature: removed dependency on lib-wrapper, switched to new hooks that the dnd5e system introduced
- feature: [#16](https://github.com/kaelad02/adv-reminder/issues/16) do not process the advantage/disadvantage/critical flags if Midi is active
- feature: [#30](https://github.com/kaelad02/adv-reminder/issues/30) show the source of advantage/disadvantage/critical as a message
- feature: move color settings into its own dialog and add a test button to show the changes

# 2.0.1

- feature: style the shadow around the button to match style's color, if set

# 2.0

- feature: add player setting to style the buttons and messages
- feature: initial v10 compatibility (now requires v9 or higher)

# 1.3.2

- feature: add document links to messages

# 1.3.1

- feature: [#24](https://github.com/kaelad02/adv-reminder/pull/24) Add sw5e support

# 1.3

- feature: [#23](https://github.com/kaelad02/adv-reminder/pull/23) Include inline die rolls in messages, click on them to include in situational bonus field

# 1.2

- bug fix: [#22](https://github.com/kaelad02/adv-reminder/issues/22) Error during damage rolls when Midi-QOL auto-rolls damage

# 1.1

- bug fix: damage roll wrapper wasn't checking `options.fastForward`
- feature: add message flags to DAE to show in the active effect editor
- feature: [#19](https://github.com/kaelad02/adv-reminder/pull/19) Change the auto-fail chat message to look like a die roll
- feature: [#15](https://github.com/kaelad02/adv-reminder/pull/15) Let DAE handle "impose stealth disadvantage" if you're using version 0.8.81 or newer

# 1.0

- feature: [#3](https://github.com/kaelad02/adv-reminder/issues/3) Messages that show up on the roll dialogs
- feature: improve MRE compatibility to skip when it fast-forwards rolls

# 0.4

- feature: [#7](https://github.com/kaelad02/adv-reminder/issues/7) support armor that imposes stealth disadvantage

# 0.3

- bug fix: [#2](https://github.com/kaelad02/adv-reminder/issues/2) Active effects from unequipped items weren't being ignored
- documentation: Update readme with module compatibility info

# 0.2

- feature: add Tool checks support
- mark compatible with v9

# 0.1

- Initial release
