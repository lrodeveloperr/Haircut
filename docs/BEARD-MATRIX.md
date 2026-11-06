# Beard matrix

Status: built 6 November 2026 on the owner's direction. The game is cutting hair, the clipper with guards 0-4 is the only
tool, and a customer's order can cover the hair, the beard, or both.

## Rules

- Guard 0 shaves a beard to the skin. Every beard a customer can arrive with can be removed completely, checked by
  `android/tests/beards-browser.cjs` on the real head from every camera angle.
- A stroke along the chin or jaw also clears the hair under it, because no camera angle touches that skin.
- A style is a grooming choice and never depends on a customer's group. A group changes density, curl and patchiness, so
  the same style looks different on different men. A sparse grower rarely asks for a full cheek line.
- Beards mode gives 35 styles an even turn (all but the two lightest stubbles). In Orders, about half of bearded customers also ask for a beard.
- An order for both is as good as its weaker half: stars are the lower of the hair and the beard.

## Arrivals (37 styles, plus clean)

| Family | Styles |
|---|---|
| Stubble | shadow (`stubble1`), `stubble`, heavy (`stubble5`) |
| Short full | `corporate`, `boxed`, `rounded`, `patchy` |
| Full | `full`, `shenandoah`, `verdi`, `ducktail` |
| Big | `long`, `garibaldi`, `bandholz`, `longclipped`, `frenchfork`, `wild` |
| Chin and jaw | `chinstrap`, `chincurtain`, `neckbeard`, `hollywood`, `balbo`, `anchor` |
| Goatee family | `goatee`, `vandyke`, `extended`, `circle`, `soulpatch`, `wispy` |
| Cheeks | `mutton`, `friendly`, `sideburns` |
| Moustaches | `moustache`, `pencil`, `walrus`, `handlebar`, `horseshoe` |

## Requests (20)

`corporate`, `boxed`, `rounded`, `hollywood`, `chincurtain`, `extended`, `goatee`, `vandyke`, `chinstrap`, `balbo`,
`anchor`, `circle`, `stubble5`, `stubble1`, `soulpatch`, `moustache`, `mutton`, `friendly`, `sideburns`, `clean`.

A request is offered only when it really changes the beard the customer has: the target can never be longer than the
start. Lengths come from the guards: 0 (skin), 3, 6, 10 and 13 mm.

## How groups differ

| Trait | Source |
|---|---|
| Density and patchiness | Each group's growth (`patchy` in `phenotypes.js`) plus individual variation |
| Curl | The customer's own hair type, 1A to 4C |
| Colour and greying | The customer's hair colour and age |
| Cheek and neck line | Individual, from the seed |
