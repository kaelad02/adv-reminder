# Messages

The messages feature allows you to use active effects to include helpful messages on any of the roll dialogs. It was designed to include reminders for conditional bonuses or advantage/disadvantage that the normal active effect keys aren't designed to handle. For example, you could use it to remind you to add +2 damage when throwing a weapon or roll a saving throw vs. poison with advantage.

![Saving Throw screenshot with message](poison-message.png?raw=true)

There is an item compendium pack, AR Message Sample Items, that comes with some SRD features and spells that include messages.

## Creating a Message

You create an message by first defining an active effect. In some cases, this could be an active effect on a feature or spell since it may only apply after using that feature or casting that spell. In other cases, they might always apply so creating them as passive effects directly on the actor would be best.

Once you've created the active effect, you'll want to add an effect with a key that matches when you want the message to appear. You can see a complete list in [Message Flags](message-flags.md). Set the Change Mode of the effect to `Custom`, then put your message in the Effect Value. You can include HTML formatting if you'd like, but I recommend you keep it simple.

![creating message example](creating-message.png?raw=true)

## Situational Bonuses

Instead of just a text reminder to add to the Situational Bonus field on a dialog, you can create a button that will add something to that field when clicked. You can do this using the deferred inline roll syntax in your message. For example, if you wanted a reminder to add your Sneak Attack damage, you can use the roll formula to make it easy to add the damage. You can even create rolls with labels by adding text after the roll surrounded by curly braces. You can see the two examples below.

| Effect Value | Screenshot |
|----|----|
| `[[/r 2d6]] Sneak Attack` | ![sneak attack 1 screenshot](sneak-message1.png?raw=true) |
| `[[/r 2d6]]{Sneak Attack}` | ![sneak attack 2 screenshot](sneak-message2.png?raw=true) |

## Document Links, a.k.a. Run Macros

The module can also show document links in the dialogs. If you include a document link, following the [Dynamic Document Links](https://foundryvtt.com/article/journal/#links) syntax, the module will turn that into a link when presenting it in a dialog. This was primarly added in order to put links to macros to run them, but they will work for any document type. If you're not sure how to create a link, drag the macro/item/etc. you want to link to into the chat window and it will create the link to it for you.

![document link example](document-link1.png?raw=true)
