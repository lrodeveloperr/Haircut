# Interface options (5 November 2026)

**Decided and built: Option A, Bottom Dock, changed by the owner as below.** The rest of this page is the original
proposal, kept for its reasoning; where the two differ, this section wins. Mockups: `docs/ui-options/`. They recreate
each kit's style over a real game frame; they do not contain the kits' actual art. `built-*.png` show the real build.

## The owner's final choice

- The dock has three items, in this order: **Modes, Shop, Collection**. Modes is first because this is a game.
- There is no separate Rewards item. Rewards are bonus items inside Shop, so there is one place for them.
- Home shows the player's current barbershop, whole and unzoomed, with no customer. This replaces the "live customer"
  in the proposal below.
- Every icon comes from one consistent set, in gameplay too. The coin is premium, not flat, because players buy coins.
- The level badge is not a medal, because a medal looked too much like the coin.

## What the game's flow asks for

A session is: open → start a haircut → satisfying cut → result → next customer, with shopping and collecting between
customers. So the interface should get out of the way of the haircut, keep "next customer" one tap away, and show one
reason to come back. Evidence is general design guidance, not measured data for this game: sources support a short
path to the first fun moment and small top-level navigation, while the link from layout to retention is mostly
unproven blog claims. Only an A/B test on this game can prove it.

## Redundancy in today's Home

12 tap targets and 9 words, across four rows.

| Today | Problem | Fix in every option |
| --- | --- | --- |
| Level badge and rank chip | Two progress badges | One badge |
| Rank chip opens Portfolio | Hidden route | A named Collection destination |
| Styles block, Portfolio styles, Regulars album, Portfolio regulars | Same content twice | One Collection |
| Goals sheet, Portfolio goals, Gift block | Three reward places | One Rewards |
| Salon, Wardrobe (and its shop) | Two stores | One Shop with two tabs |
| Five role dots, replace button in a Home strip | Detail before play | Move into Career |
| Goals sheet opening over Home | Blocks the first screen | Show a dot instead |

## Three kits (licenses checked on their own pages)

| Kit | License | Price | Files | Style |
| --- | --- | --- | --- | --- |
| Kenney UI Pack 2.0 | CC0 | Free | Not stated on page | Clean, flat |
| pzuh Free Game GUI | CC0 per the author's comment | Free | SVG, AI, EPS, PNG | Bright, cute |
| mmkhlv Game Interface kit | Commercial use allowed, no resale; no named license | Free | EPS, PNG | Glossy jelly |

Rejected: LayerLab GUI Casual Fantasy ($24.99), Game UI Essentials (no license stated, $1 minimum), Simple Vector UI
Pack ($4.90 full version), Casual Game UI Pack (full pack paid). Icons for any option: Tabler or Phosphor (MIT);
confirm in the repo's LICENSE file before shipping.

## Options

| | A Bottom Dock | B One Button | C Jelly Cards |
| --- | --- | --- | --- |
| Kit | Kenney | pzuh | mmkhlv |
| Home tap targets | 8 | 4 | 8 |
| Home words to translate | 6 | 2 | 7 |
| Taps to any destination | 1 | 2 | 1 |
| Customer visible | Full screen | Full screen | No |
| Locked menu contract | Meets it | **Breaks it:** Quick Play and Career are not both one tap | Meets it |
| Build effort | Medium | Small | Small |

**Recommendation: A.** Every destination is one tap and always visible; the live customer sells the game; both play
buttons sit in thumb reach; it replaces 9 scattered words with 6 fixed ones. B needs a change to the locked contract.
C is the safest visually but keeps the menu between the player and the customer.

Sources: [Kenney UI Pack](https://www.kenney.nl/assets/ui-pack), [pzuh Free Game GUI](https://pzuh.itch.io/free-game-gui),
[mmkhlv kit](https://mmkhlv.itch.io/game-interface-ui-kit), [Roblox onboarding](https://create.roblox.com/docs/en-us/production/game-design/onboarding-techniques),
[Smashing: thumb zone](https://shop.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users),
[Adrian Crook: onboarding](https://adriancrook.com/?p=8055).
