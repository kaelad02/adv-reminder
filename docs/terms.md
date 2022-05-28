# Terms and Abbreviations

There are some common terms used in the flags used by this module. They're derived from the data in the D&D 5E system itself. The following is a list of those terms and where they're found.

## Action Types

Found in `CONFIG.DND5E.itemActionTypes`:
- `mwak` is Melee Weapon Attack
- `rwak` is Ranged Weapon Attack
- `msak` is Melee Spell Attack
- `rsak` is Ranged Spell Attack

## Ability Modifiers

Found in `CONFIG.DND5E.abilities`:
- `str` is Strength
- `dex` is Dexterity
- `con` is Constitution
- `int` is Intelligence
- `wis` is Wisdom
- `cha` is Charisma

## Skills

Found in `CONFIG.DND5E.skills`:
- `acr` is Acrobatics
- `ani` is Animal Handling
- `arc` is Arcana
- `ath` is Athletics
- `dec` is Deception
- `his` is History
- `ins` is Insight
- `inv` is Investigation
- `itm` is Intimidation
- `med` is Medicine
- `nat` is Nature
- `per` is Persuasion
- `prc` is Perception
- `prf` is Performance
- `rel` is Religion
- `slt` is Sleight of Hand
- `ste` is Stealth
- `sur` is Survival

## Grants

Keys that include `grants` in them will grant someone targeting them with an attack something. For example, attacks against a creature that should be made with advantage are done with `flags.midi-qol.grants.advantage.attack.all`.
