# 6.0.0

- breaking: makes the minimum Foundry version 14.367 and dnd5e system 6.0.0, verified with Foundry 14.369 and dnd5e 6.0.6
- feature: read Active Effect changes from `effect.system.changes` and use string change types (Active Effects V2)
- feature: support the new `subtract` change type on roll modes
- feature: use chat message visibility modes instead of roll modes for the auto-fail message
- bug fix: Midi flags and message values that Foundry now stores JSON-parsed (e.g. `true`, `1`) no longer throw
- bug fix: distance-based rules (Prone, Paralyzed, Unconscious, `grants.critical.range`) no longer throw in Foundry V14, which removed `canvas.grid.measureDistances`; distance is measured on the token's own scene, edge to edge on gridless scenes, and rolls without a token on the scene no longer throw
- bug fix: "adjacent" now means within one grid space in the scene's units instead of a fixed 5 ft, so metric scenes work
- bug fix: the auto-fail chat message set its `style` in the `type` field, which only worked because dnd5e passes its own `type`; it now uses `style`, and an error is shown if the message can't be created
- bug fix: the button style settings window didn't show the "Widen Default Button" and "Default Button Color" options
- bug fix: messages and roll modes from active effects are found when DAE moves a change to another phase, and checking them no longer marks the effect's changes as applied
- bug fix: the sample pack builder was exposed on `window` in every world because of an always-true check
- security: messages from active effects (including a target's) are cleaned of unsafe HTML before being shown in the roll dialog
- security: messages in the roll dialog no longer reveal secret blocks nor embed other documents, and effect names shown as sources are never turned into inline rolls
- bug fix: effect names with `&` or `<` were shown escaped twice in the sources (e.g. `&amp;`)
- feature: with several targets, target-based reminders are skipped and the roll dialog says so
- feature: active effect changes follow the V14 rules: changes without a key or for the token are ignored, and `ActiveEffect#shouldApplyChange` is respected
- feature: button style colors are set on the roll dialog itself, so they also work in detached windows
- bug fix: with the "player", "green" or custom button style without a text color, the default button text was forced to near-black (unreadable on dark colors and in the dark theme); now only the colors that are set are overridden
- feature: Italian translation
- refactor: the button style settings window uses the standard ApplicationV2 form handling
- refactor: removed code for dnd5e versions before 6.0 and the migration of settings from very old versions
- refactor: the sample pack builder moved to `utils/` and is no longer part of the released module
- docs: rewrote the fast-forward section of the README for dnd5e 6
- deprecated: the Midi `advantage.ability.check/save.*` keys (and their disadvantage counterparts) will be removed in 7.0.0, use `advantage.check/save.*` instead
- bug fix: with Midi-QOL, distance-based sources (Prone, Paralyzed, Unconscious) treated every target as adjacent before the attack roll: the distance was measured to the still-empty hit targets and Midi's -1 for "unknown" counted as adjacent
- bug fix: saves against a status (`flags.adv-reminder.statuses.*`) only worked for the first target of a save card, and the natural 20 source on damage could be missed: the originating message is now read from the roll's message data, as dnd5e does, instead of `event.currentTarget`. With Ready Set Roll, saves now look up the activity too
- bug fix: `flags.midi-qol.grants.critical.range` never made a hit critical nor showed as a source, because only boolean flags were read
- bug fix: Midi `fail` flags (e.g. `fail.all`, `fail.ability.save.con`) were ignored on concentration saves
- bug fix: with Ready Set Roll active, tool checks threw an error and were not processed
- note: the Ready Set Roll integration has not been tested with Foundry V14 and dnd5e 6 yet
- translations: Portuguese (Brazil) is missing the two new strings and falls back to English

# 5.1.2

- feature: address one more v13 deprecation

# 5.1.1

- feature: verified with dnd5e system 5.2.5
- bug fix: [#127](https://github.com/kaelad02/adv-reminder/issues/127) Midi changed the check and save keys, support both until dnd5e 5.2 is no longer supported

# 5.1.0

- feature: makes the minimum Foundry version 13.341 and dnd5e system 5.1.0
- feature: support roll modes on ability checks and saving throws
- feature: combine roll modes (e.g. adv on Str check but dis on Athletics)
- feature: add handling for Tool checks
- feature: remove some `CONFIG.DND5E.conditionEffects` additions that the system now handles
- feature: update "fast forward" optimizations since key presses changed a bit
- feature: change `updateStatusEffects` setting to default true
- feature: let system now handle "disadvantage to Stealth from armor" checks
- feature: support source for skill/tool double proficiency and travel pace
- feature: address new v13 deprecations

# 5.0.3

- feature: remove machine translations

# 5.0.2

- feature: update RSR compatibility with more accurate message, source, and reminder processing, tested with version 3.5.0
- feature: update RSR compatibility with critical hits, if a reminder set `isCritical` the RSR chat message correctly shows it

# 5.0.1

- feature: add some checks to reminders and sources that the Midi flag is actually true, mainly for some edge cases
- feature: support conditional expressions when using Midi for sources (i.e. only show source if it evaluated true)
- feature: rename Roll Dialog Colors setting menu to Button Style and update hint

# 5.0.0

- feature: support advantage roll mode features like overriding (i.e. use the Override change mode) and suppressing (i.e. use the Upgrade/Downgrade change mode)
- feature: update source tracking to only show what's actually affecting the roll: only show override if used, and if advantage is suppressed then show what suppressed it instead of any sources of advantage
- feature: add support for custom roll mode flags for saving throws with status effects (e.g. Dwarven Resilience and Fey Ancestry): `flags.adv-reminder.statuses.[status].save.roll.mode | Add | 1`
- feature: when showing sources, use links to the active effects or items instead of just showing their name
- feature: set verified system version to 5.0.4

# 4.3.5

- feature: revert 4.3.3 change to use flags on the actor instead of reading the active effects

# 4.3.4

- feature: refactor preRollDamageV2 hook to set `isCritical` at the config level, not the individual rolls
- feature: as of system version 4.3.0, the system sets `isCritical` when the attack is a crit, support that

# 4.3.3

- feature: set verified system version to 4.3.9
- feature: update fast-forward check based on the system's implementation in `applyKeybindings`
- feature: improve DAE integration with an AR Messages tab in the field browser and forcing all message flags to use Custom change mode
- feature: refactor messages to use flags on the actor instead of reading the active effects
- feature: refactor messages to use rollData from the roll instead of saving a copy itself

# 4.3.2

- feature: update Midi QOL compatibility since the big activity change, tested with version 12.4.64

# 4.3.1

- bug fix: fix (again) error when using damage enricher

# 4.3.0

- feature: set minimum system version to 4.2.0
- feature: add support for Death Save advantage roll mode
- note: major refactoring to support advantage roll mode everywhere, preparing for future updates

# 4.2.7

- feature: remove machine translations

# 4.2.6

- feature: [#104](https://github.com/kaelad02/adv-reminder/pull/104) improve the button style configuration with separate custom background and text colors
- feature: [#105](https://github.com/kaelad02/adv-reminder/pull/105) add support for Initiative rolls with the system's new `preRollInitiativeDialogV2` hook
- bug fix: [#102](https://github.com/kaelad02/adv-reminder/issues/102) Concentration rolls now include CON saving throw things (adv/dis, messages) and improved source detection
- feature: update sample items with copies from the system version 4.1.0 and remove Enhance Ability and Enlarge/Reduce spells (better w/ advantage AEs, not messages)

# 4.2.5

- bug fix: Advantage not being passed on in a few cases that the system does it (e.g. initiative)
- bug fix: [#99](https://github.com/kaelad02/adv-reminder/issues/99) Sample roll in settings not working

# 4.2.4

- bug fix: [#95](https://github.com/kaelad02/adv-reminder/issues/95) Default button is black when using player color

# 4.2.3

- bug fix: Fix the auto-fail message
- feature: Remove sw5e support

# 4.2.2

- bug fix: [#84](https://github.com/kaelad02/adv-reminder/issues/84) Adding messages could push the roll dialog off the screen

# 4.2.1

- bug fix: set minimim system version to 4.1.0

# 4.2.0

- feature: [#85](https://github.com/kaelad02/adv-reminder/pull/85) Compatibility with the 4.1 system, specifically the new rolls being used everywhere else now
- bug fix: [#92](https://github.com/kaelad02/adv-reminder/pull/92) Fix the V2 dialog styling, including the player setting to customize the colors

# 4.1.1

- feature: [#80](https://github.com/kaelad02/adv-reminder/pull/80) Update Ready-Set-Roll compatibility
- feature: [#86](https://github.com/kaelad02/adv-reminder/pull/86) Small update to pt-BR translation

# 4.1.0

- feature: [#77](https://github.com/kaelad02/adv-reminder/pull/77) System version 4.0 compatibility

# 4.0.2

- bug fix: [#74](https://github.com/kaelad02/adv-reminder/pull/74) Fix pt-BR localization file
- feature: [#75](https://github.com/kaelad02/adv-reminder/pull/75) Use foundryvtt-cli to build compendium packs

# 4.0.1

- bug fix: [#70](https://github.com/kaelad02/adv-reminder/issues/70) Fix error when using a damage or healing enricher

# 4.0.0

- feature: Support the system's new concentration rolls with sources and messages with `flags.adv-reminder.message.ability.concentration` (system already handles advantage/disadvantage)
- feature: Support `flags.midi-qol.grants.critical.range` for conditions like Paralyzed that turn hits into crits if the attacker is adjacent. Does not currently work with Ready Set Roll, will just be ignored.
- feature: Apply conditions directly bases on the `statuses` instead of adding Midi's flags to status effects
- feature: initial compatibility with Foundry v12

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
