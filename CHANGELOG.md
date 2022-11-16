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
