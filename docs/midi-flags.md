# Midi Flags

Here are the different types of Midi flags that Advantage Reminder supports. All of these should be setup in the effects tab with the Change Mode of `Custom` and the Effect Value of `1`. They're treated like boolean settings with a `1` enabling it and a `0` disabling it.

Some of the terms used in the keys are further explained in [Terms and Abbreviations](terms.md)

## Attack Rolls

| Attribute Key | Description |
|----|----|
| flags.midi-qol.advantage.all | Advantage on all rolls, including attacks |
| flags.midi-qol.advantage.attack.all | Advantage on all attack rolls |
| flags.midi-qol.advantage.attack.mwak/rwak/msak/rsak | Advantage on attacks with a specific Action Type |
| flags.midi-qol.advantage.attack.str/dex/con/int/wis/cha | Advantage on attacks with a specific Ability Modifier |
| flags.midi-qol.disadvantage.all | Disadvantage on all rolls, including attacks |
| flags.midi-qol.disadvantage.attack.all | Disadvantage on all attack rolls |
| flags.midi-qol.disadvantage.attack.mwak/rwak/msak/rsak | Disadvantage on attacks with a specific Action Type |
| flags.midi-qol.disadvantage.attack.str/dex/con/int/wis/cha | Disadvantage on attacks with a specific Ability Modifier |
| flags.midi-qol.grants.advantage.attack.all | Advantage when targeted by any attack roll |
| flags.midi-qol.grants.advantage.attack.mwak/rwak/msak/rsak | Advantage when targeted by attacks with a specific Action Type |
| flags.midi-qol.grants.disadvantage.attack.all | Disadvantage when targeted by any attack roll |
| flags.midi-qol.grants.disadvantage.attack.mwak/rwak/msak/rsak | Disadvantage when targeted by attacks with a specific Action Type |

## Critical Hits

| Attribute Key | Description |
|----|----|
| flags.midi-qol.critical.all | Critical hit on all attacks |
| flags.midi-qol.critical.mwak/rwak/msak/rsak | Critical hit on attacks with a specific Action Type |
| flags.midi-qol.noCritical.all | Normal hit on all attacks |
| flags.midi-qol.noCritical.mwak/rwak/msak/rsak | Normal hit on attacks with a specific Action Type |
| flags.midi-qol.grants.critical.all | Critical hit when targeted by any attack |
| flags.midi-qol.grants.critical.mwak/rwak/msak/rsak | Critical hit when targeted by attacks with a specific Action Type |
| flags.midi-qol.fail.critical.all | Normal hit when targeted by any attack |
| flags.midi-qol.fail.critical.mwak/rwak/msak/rsak | Normal hit when targeted by attacks with a specific Action Type |

## Ability Checks

| Attribute Key | Description |
|----|----|
| flags.midi-qol.advantage.all | Advantage on all rolls, including ability checks |
| flags.midi-qol.advantage.ability.all | Advantage on all ability checks, saves, and skills |
| flags.midi-qol.advantage.ability.check.all | Advantage on all ability checks |
| flags.midi-qol.advantage.ability.check.str/dex/con/int/wis/cha | Advantage on ability checks with a specific Ability Modifier |
| flags.midi-qol.disadvantage.all | Disadvantage on all rolls, including ability checks |
| flags.midi-qol.disadvantage.ability.all | Disadvantage on all ability checks, saves, and skills |
| flags.midi-qol.disadvantage.ability.check.all | Disadvantage on all ability checks |
| flags.midi-qol.disadvantage.ability.check.str/dex/con/int/wis/cha | Disadvantage on ability checks with a specific Ability Modifier |

## Skill Checks

Since all skill checks are also ability checks, this list is in addition to the keys for Ability Checks.

| Attribute Key | Description |
|----|----|
| flags.midi-qol.advantage.skill.all | Advantage on all skill checks |
| flags.midi-qol.advantage.skill.acr/ani/arc/ath/dec/his/ins/itm/inv/med/nat/prc/prf/per/rel/slt/ste/sur | Advantage on specific Skills |
| flags.midi-qol.disadvantage.skill.all | Disadvantage on all skill checks |
| flags.midi-qol.disadvantage.skill.acr/ani/arc/ath/dec/his/ins/itm/inv/med/nat/prc/prf/per/rel/slt/ste/sur | Disadvantage on specific Skills |

## Saving Throws

| Attribute Key | Description |
|----|----|
| flags.midi-qol.advantage.all | Advantage on all rolls, including saving throws |
| flags.midi-qol.advantage.ability.all | Advantage on all ability checks, saves, and skills |
| flags.midi-qol.advantage.ability.save.all | Advantage on all saving throws |
| flags.midi-qol.advantage.ability.save.str/dex/con/int/wis/cha | Advantage on saving throws with a specific Ability Modifier |
| flags.midi-qol.disadvantage.all | Disadvantage on all rolls, including saving throws |
| flags.midi-qol.disadvantage.ability.all | Disadvantage on all ability checks, saves, and skills |
| flags.midi-qol.disadvantage.ability.save.all | Disadvantage on all saving throws |
| flags.midi-qol.disadvantage.ability.save.str/dex/con/int/wis/cha | Disadvantage on saving throws with a specific Ability Modifier |

## Death Saving Throw

| Attribute Key | Description |
|----|----|
| flags.midi-qol.advantage.all | Advantage on all rolls, including death saves |
| flags.midi-qol.advantage.ability.all | Advantage on all ability checks, saves, and skills |
| flags.midi-qol.advantage.ability.save.all | Advantage on all saving throws |
| flags.midi-qol.advantage.deathSave | Advantage on death saving throws |
| flags.midi-qol.disadvantage.all | Disadvantage on all rolls, including death saves |
| flags.midi-qol.disadvantage.ability.all | Disadvantage on all ability checks, saves, and skills |
| flags.midi-qol.disadvantage.ability.save.all | Disadvantage on all saving throws |
| flags.midi-qol.disadvantage.deathSave | Disadvantage on death saving throws |
