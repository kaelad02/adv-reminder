# Message Flags

Here are the different type of Message flags that Advantage Reminder uses. All of these should be setup in the effects tab with the Change Mode of `Custom` and the Effect Value with the message you want. The message may include HTML formatting, deferred inline rolls, and document links.

# Attack Rolls

Messages on attack rolls can either come from an effect on the attacker or target.

## Attacker

These apply when they are the one making the attack roll.

```
flags.adv-reminder.message.attack.all
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

### Message on All Attack Rolls

| Attribute Key                           | Change Mode | Effect Value                  |
| --------------------------------------- | ----------- | ----------------------------- |
| `flags.adv-reminder.message.attack.all` | Custom      | `Advantage when in dim light` |

### Message on Ranged Attack Rolls (both spell and weapon)

| Attribute Key                            | Change Mode | Effect Value                          |
| ---------------------------------------- | ----------- | ------------------------------------- |
| `flags.adv-reminder.message.attack.rsak` | Custom      | `Disadvantage when adjacent to enemy` |
| `flags.adv-reminder.message.attack.rwak` | Custom      | `Disadvantage when adjacent to enemy` |

## Target of Attack

These apply when they are the target of an attack. In other words, you are granting the attacker advantage or disadvantage.

```
flags.adv-reminder.grants.message.attack.all
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

### Message When Targeted by Melee Attack Rolls (both spell and weapon)

| Attribute Key                                   | Change Mode | Effect Value                                 |
| ----------------------------------------------- | ----------- | -------------------------------------------- |
| `flags.adv-reminder.grants.message.attack.msak` | Custom      | `Disadvantage if you can smell their stench` |
| `flags.adv-reminder.grants.message.attack.mwak` | Custom      | `Disadvantage if you can smell their stench` |

# Damage Rolls

Messages on damage rolls can either come from an effect on the attacker or target.

## Attacker

These apply when they are the one making the damage roll.

```
flags.adv-reminder.message.damage.all
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

### Message on All Damage Rolls

| Attribute Key                           | Change Mode | Effect Value                                             |
| --------------------------------------- | ----------- | -------------------------------------------------------- |
| `flags.adv-reminder.message.damage.all` | Custom      | `[[/r 1d4]] bonus damage if you attacked with Advantage` |

### Message on Weapon Damage Rolls (both melee and ranged)

| Attribute Key                            | Change Mode | Effect Value                                            |
| ---------------------------------------- | ----------- | ------------------------------------------------------- |
| `flags.adv-reminder.message.damage.mwak` | Custom      | `[[/r @scale.rogue.sneak-attack]]{Sneak Attack} damage` |

## Target of Attack

These apply when they are the target of an attack. In other words, you are showing a message when someone rolls damage against you.

```
flags.adv-reminder.grants.message.damage.all
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

### Message When Rolling All Damage Against

| Attribute Key                                  | Change Mode | Effect Value                         |
| ---------------------------------------------- | ----------- | ------------------------------------ |
| `flags.adv-reminder.grants.message.damage.all` | Custom      | `Critical roll if doing fire damage` |

# Ability Checks

```
flags.adv-reminder.message.ability.check.all
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

### Message on All Ability Checks

| Attribute Key                                  | Change Mode | Effect Value                      |
| ---------------------------------------------- | ----------- | --------------------------------- |
| `flags.adv-reminder.message.ability.check.all` | Custom      | `Advantage in certain situations` |

### Message on Charisma Ability Checks

| Attribute Key                                  | Change Mode | Effect Value                              |
| ---------------------------------------------- | ----------- | ----------------------------------------- |
| `flags.adv-reminder.message.ability.check.cha` | Custom      | `Advantage when interacting with Dwarves` |

| Attribute Key | Description |
|----|----|
| flags.adv-reminder.message.ability.check.all | Message on all ability checks |
| flags.adv-reminder.message.ability.check.str/dex/con/int/wis/cha | Message on ability checks with a specific Ability Modifier |

# Skill Checks

> [!NOTE]
> Since all skill checks are also ability checks, messages on Ability Checks can also apply to Skill Checks.

```
flags.adv-reminder.message.skill.all
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

### Message on Deception Skill Checks

| Attribute Key                          | Change Mode | Effect Value                             |
| -------------------------------------- | ----------- | ---------------------------------------- |
| `flags.adv-reminder.message.skill.dec` | Custom      | `Imposter: Advantage to avoid detection` |

# Saving Throws

```
flags.adv-reminder.message.ability.save.all
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

### Message on Constitution Saving Throws

| Attribute Key                                 | Change Mode | Effect Value               |
| --------------------------------------------- | ----------- | -------------------------- |
| `flags.adv-reminder.message.ability.save.con` | Custom      | `Advantage against poison` |

# Death Saving Throw

> [!NOTE]
> Since a death saving throw is a saving throw, messages on All Saving Throws will also apply to Death Saving Throws.

```
flags.adv-reminder.message.deathSave
```

### Message on Death Saving Throws

| Attribute Key                          | Change Mode | Effect Value                            |
| -------------------------------------- | ----------- | --------------------------------------- |
| `flags.adv-reminder.message.deathSave` | Custom      | `[[/r 1d4]] bonus when in bright light` |

# Shared Flags

While not commonly used, these apply to multiple types of rolls with just one flag.

```
flags.adv-reminder.message.all
flags.adv-reminder.message.ability.all
```

### Message on All Rolls

| Attribute Key                    | Change Mode | Effect Value                            |
| -------------------------------- | ----------- | --------------------------------------- |
| `flags.adv-reminder.message.all` | Custom      | `Advantage if within 10 feet of leader` |

### Message on All Ability Checks, Saves, and Skill Rolls

| Attribute Key                            | Change Mode | Effect Value                            |
| ---------------------------------------- | ----------- | --------------------------------------- |
| `flags.adv-reminder.message.ability.all` | Custom      | `Advantage if within 10 feet of leader` |
