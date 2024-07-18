# Midi Flags

This document covers the different types of Midi flags that Advantage Reminder supports for things like advantage, disadvantage, and critical rolls.

# Basic Usage

When creating an active effect with these Midi flags, it is recommended to use the `Custom` Change Mode and a `1` for the Effect Value. These flags are treated like boolean settings with a `1` enabling it and a `0` disabling it.

In general, flags that start with `flags.midi-qol.advantage` will give advantage on a roll and `flags.midi-qol.disadvantage` will give disadvantage. Flags will use these to start with and then further specify what kind or rolls they apply to.

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
| ----------------------------- | ----------- | ------------ |
| `flags.midi-qol.critical.all` | Custom      | `1`          |

### Critical Hit on All Weapon Damage Rolls (both melee and ranged)

| Attribute Key                  | Change Mode | Effect Value |
| ------------------------------ | ----------- | ------------ |
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
| ------------------------------------ | ----------- | ------------ |
| `flags.midi-qol.grants.critical.all` | Custom      | `1`          |

### Cancel Critical Hit Against All Damage Rolls

| Attribute Key                      | Change Mode | Effect Value |
| ---------------------------------- | ----------- | ------------ |
| `flags.midi-qol.fail.critical.all` | Custom      | `1`          |

# Ability Checks

```
flags.midi-qol.advantage.ability.check.all
                                       [ability]
flags.midi-qol.disadvantage.ability.check.all
                                          [ability]
```

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

### Advantage on Strength Ability Checks

| Attribute Key                                | Change Mode | Effect Value |
| -------------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.ability.check.str` | Custom      | `1`          |

### Disadvantage on All Ability Checks

| Attribute Key                                   | Change Mode | Effect Value |
| ----------------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.disadvantage.ability.check.all` | Custom      | `1`          |

# Skill Checks

Note: Since all skill checks are also ability checks, advantage/disadvantage on an Ability Check can also apply to Skill Checks.

```
flags.midi-qol.advantage.skill.all
                               [skill]
flags.midi-qol.disadvantage.skill.all
                                  [skill]
```

> <details>
> <summary>Skill Abbreviations</summary>
>
> | Skill           | Abbreviation |
> | --------------- | ------------ |
> | Acrobatics      | `acr`        |
> | Animal Handling | `ani`        |
> | Arcana          | `arc`        |
> | Athletics       | `ath`        |
> | Deception       | `dec`        |
> | History         | `his`        |
> | Insight         | `ins`        |
> | Investigation   | `inv`        |
> | Intimidation    | `itm`        |
> | Medicine        | `med`        |
> | Nature          | `nat`        |
> | Persuasion      | `per`        |
> | Perception      | `prc`        |
> | Performance     | `prf`        |
> | Religion        | `rel`        |
> | Sleight of Hand | `slt`        |
> | Stealth         | `ste`        |
> | Survival        | `sur`        |
>
> Source: `CONFIG.DND5E.skills`
> </details>

### Advantage on Animal Handling Checks

| Attribute Key                        | Change Mode | Effect Value |
| ------------------------------------ | ----------- | ------------ |
| `flags.midi-qol.advantage.skill.ani` | Custom      | `1`          |

### Disadvantage on Stealth Checks

| Attribute Key                           | Change Mode | Effect Value |
| --------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.disadvantage.skill.ste` | Custom      | `1`          |

# Saving Throws

```
flags.midi-qol.advantage.ability.save.all
                                      [ability]
flags.midi-qol.disadvantage.ability.save.all
                                         [ability]
```

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

### Advantage on All Saving Throws

| Attribute Key                               | Change Mode | Effect Value |
| ------------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.ability.save.all` | Custom      | `1`          |

### Disadvantage on Dexterity Saving Throws

| Attribute Key                                  | Change Mode | Effect Value |
| ---------------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.disadvantage.ability.save.dex` | Custom      | `1`          |

# Death Saving Throw

Note: Since a death saving throw is a saving throw, advantage/disadvantage on All Saving Throws will also apply to Death Saving Throws.

```
flags.midi-qol.advantage.deathSave
flags.midi-qol.disadvantage.deathSave
```

### Advantage on Death Saving Throws

| Attribute Key                        | Change Mode | Effect Value |
| ------------------------------------ | ----------- | ------------ |
| `flags.midi-qol.advantage.deathSave` | Custom      | `1`          |

### Disadvantage on Death Saving Throws

| Attribute Key                           | Change Mode | Effect Value |
| --------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.disadvantage.deathSave` | Custom      | `1`          |

# Shared Flags

While not commonly used, these apply to multiple types of rolls with just one flag.

```
flags.midi-qol.advantage.all
flags.midi-qol.advantage.ability.all
flags.midi-qol.disadvantage.all
flags.midi-qol.disadvantage.ability.all
```

### Advantage on All d20 Rolls

| Attribute Key                  | Change Mode | Effect Value |
| ------------------------------ | ----------- | ------------ |
| `flags.midi-qol.advantage.all` | Custom      | `1`          |

### Advantage on All Ability Checks, Saves, and Skill Rolls

| Attribute Key                          | Change Mode | Effect Value |
| -------------------------------------- | ----------- | ------------ |
| `flags.midi-qol.advantage.ability.all` | Custom      | `1`          |
