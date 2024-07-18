# Midi Flags

This document covers the different types of Midi flags that Advantage Reminder supports for things like advantage, disadvantage, and critical roles.

# Basic Usage

When creating an active effect with these Midi flags, it is recommended to use the `Custom` Change Mode and a `1` for the Effect Value. These flags are treated like boolean settings with a `1` enabling it and a `0` disabling it.

In general, flags that start with `flags.midi-qol.advantage` will give advantage on a roll and `flags.midi-qol.disadvantage` will give disadvantage. Flags will use these to start with and then further specify what kind or rolls they apply to.

# Common Flags

```
flags.midi-qol.advantage.all
flags.midi-qol.disadvantage.all
```

Not often used, but useful if you need an effect that applies to all d20 rolls.

# Attack Rolls

Advantage and disadvantage on attack rolls can either come from an effect on the attacker or target.

## Attacker

These apply when they are the one making the attack roll.

```
flags.midi-qol.advantage.attack.all
                                [type]
                                [ability]
flags.midi-qol.disadvantage.attack.all
                                   [type]
                                   [ability]
```

> <details>
> <summary>Action Types</summary>
>
> | Action Type          | Value  |
> | -------------------- | -----  |
> | Melee Spell Attack   | `msak` |
> | Melee Weapon Attack  | `mwak` |
> | Ranged Spell Attack  | `rsak` |
> | Ranged Weapon Attack | `rwak` |
>
> Source: `CONFIG.DND5E.itemActionTypes`
> </details>

> <details>
> <summary>Ability Abbreviations</summary>
>
> | Ability      | Abbreviation |
> | ------------ | ------------ |
> | Strength     | `str`        |
> | Dexterity    | `dex`        |
> | Constitution | `con`        |
> | Wisdom       | `wis`        |
> | Intelligence | `int`        |
> | Charisma     | `cha`        |
>
> Source: `CONFIG.DND5E.abilities`
> </details>

### Advantage on All Attack Rolls

| Attribute Key                         | Change Mode | Effect Value |
| ------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.attack.all` | Custom      | `1`          |

### Advantage on Melee Weapon Attack Rolls

| Attribute Key                          | Change Mode | Effect Value |
| -------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.attack.mwak` | Custom      | `1`          |

### Advantage on Attack Rolls using Strength

| Attribute Key                         | Change Mode | Effect Value |
| ------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.attack.str` | Custom      | `1`          |

## Target of Attack

These apply when they are the target of an attack. In other words, you are granting the attacker advantage or disadvantage.

```
flags.midi-qol.grants.advantage.attack.all
                                       [type]
flags.midi-qol.grants.disadvantage.attack.all
                                          [type]
```

> <details>
> <summary>Action Types</summary>
>
> | Action Type          | Value  |
> | -------------------- | -----  |
> | Melee Spell Attack   | `msak` |
> | Melee Weapon Attack  | `mwak` |
> | Ranged Spell Attack  | `rsak` |
> | Ranged Weapon Attack | `rwak` |
>
> Source: `CONFIG.DND5E.itemActionTypes`
> </details>

### Grant Advantage to All Melee Attack Rolls (both spell and weapon)

| Attribute Key                                 | Change Mode | Effect Value |
| --------------------------------------------  | ----------- | ------------ |
| `flags.midi-qol.grants.advantage.attack.msak` | Custom      | `1`          |
| `flags.midi-qol.grants.advantage.attack.mwak` | Custom      | `1`          |

### Grant Disadvantage to All Attack Rolls

| Attribute Key                                   | Change Mode | Effect Value |
| ----------------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.grants.disadvantage.attack.all` | Custom      | `1`          |

# Critical Hits

Critical hits can either come from an effect on the attacker or target.

## Attacker

These apply when they are the one making the attack roll.

```
flags.midi-qol.critical.all
                        [type]
flags.midi-qol.noCritical.all
                          [type]
```

> <details>
> <summary>Action Types</summary>
>
> | Action Type          | Value  |
> | -------------------- | -----  |
> | Melee Spell Attack   | `msak` |
> | Melee Weapon Attack  | `mwak` |
> | Ranged Spell Attack  | `rsak` |
> | Ranged Weapon Attack | `rwak` |
>
> Source: `CONFIG.DND5E.itemActionTypes`
> </details>

### Critical Hit on All Damage Rolls

| Attribute Key                 | Change Mode | Effect Value |
| ------------------------------| ----------- | ------------ |
| `flags.midi-qol.critical.all` | Custom      | `1`          |

### Critical Hit on All Weapon Damage Rolls (both melee and ranged)

| Attribute Key                  | Change Mode | Effect Value |
| -------------------------------| ----------- | ------------ |
| `flags.midi-qol.critical.mwak` | Custom      | `1`          |
| `flags.midi-qol.critical.rwak` | Custom      | `1`          |

## Target of Attack

These apply when they are the target of an attack. In other words, you are granting the attacker a critical hit or canceling it.

```
flags.midi-qol.grants.critical.all
                               [type]
flags.midi-qol.fail.critical.all
                             [type]
```

> <details>
> <summary>Action Types</summary>
>
> | Action Type          | Value  |
> | -------------------- | -----  |
> | Melee Spell Attack   | `msak` |
> | Melee Weapon Attack  | `mwak` |
> | Ranged Spell Attack  | `rsak` |
> | Ranged Weapon Attack | `rwak` |
>
> Source: `CONFIG.DND5E.itemActionTypes`
> </details>

### Grant Critical Hit on All Damage Rolls

| Attribute Key                        | Change Mode | Effect Value |
| -------------------------------------| ----------- | ------------ |
| `flags.midi-qol.grants.critical.all` | Custom      | `1`          |

### Cancel Critical Hit Against All Damage Rolls

| Attribute Key                      | Change Mode | Effect Value |
| -----------------------------------| ----------- | ------------ |
| `flags.midi-qol.fail.critical.all` | Custom      | `1`          |

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
