# Customer variety expansion — proposal (Android)

Status: **proposal, awaiting owner approval.** Nothing here is implemented yet. Written 4 November 2026.
Builds on the 36 head shapes and 240 face bases (branch `feature/head-shapes-36`). Adult men only (18+).

## Ground rules

- **No new hair model.** Hair textures are new settings for the existing strand shader. Hairstyles are new starting length maps.
- **Hard limit on hair length.** The engine grows hair to at most 25 mm, and walk-ins arrive with at most 16 mm. Afros, high-tops, locs, twists, cornrows, 360 waves, long hair and man buns are therefore out of scope.
- **No text in the game.** Nothing below adds any.
- **Saves stay compatible.** Every new trait is derived from the customer's seed or stored in an optional field. Existing saved customers load unchanged.
- **Size.** Everything is tables and shader settings, under 30 KB in total, with no new image or model assets.

## How sure the numbers are

Each figure in the research report is tagged:

- **[S]** comes from a source we found (study, survey or classification).
- **[E]** is a synthesised estimate.

The research report (sources included) is summarised per trait below. Hairstyle shares and the per-group texture, eye and skin weights are mostly [E]. They should be tuned from playtests in Brazil, India and Indonesia.

## 1. Phenotypes: 4 races → 12 groups

The 12 head-shape groups become the customer's heritage:

| # | Group |
|---|---|
| 1 | North European |
| 2 | Mediterranean |
| 3 | Middle Eastern / North African |
| 4 | West African |
| 5 | East African |
| 6 | East Asian |
| 7 | Southeast Asian |
| 8 | South Asian |
| 9 | Latino / Mestizo |
| 10 | Indigenous American |
| 11 | Pacific Islander |
| 12 | Mixed |

Each group gets its own weights for every trait below:

- skin tone and undertone,
- hair texture and colour,
- eye colour,
- beard density and style,
- balding rate,
- greying onset,
- brow thickness and unibrow rate.

Each group also keeps its own head shapes and face bases. The four old race ids stay valid, and old saves map onto their nearest groups.

| Group | Skin (Monk 1–10) | Main textures | Main hair colours | Eyes | Beard | Balding |
|---|---|---|---|---|---|---|
| North European | 1–4 | 1A–2B | brown, blond, red 5% | blue 50% | full | ×1.0 |
| Mediterranean | 3–6 | 1B–2C | dark brown, black | brown, hazel 18% | dense | ×1.0 |
| MENA | 4–7 | 1B–3A | black, dark brown | brown, hazel 12% | dense; moustache ×2 at 40+ | ×0.95 |
| West African | 7–10 | 4A–4C | black | dark brown | close-trimmed common | ×0.6 |
| East African | 6–10 | 3C–4B | black | dark brown | close-trimmed common | ×0.6 |
| East Asian | 2–5 | 1A–1B (coarse) | black (blue sheen) | dark brown | sparse; clean-shaven ×1.6 | ×0.5, more crown/diffuse |
| Southeast Asian | 4–7 | 1A–2B | black | dark brown | sparse | ×0.5 |
| South Asian | 5–9 | 1B–2C | black, very dark brown | brown | dense | ×0.9 |
| Latino | 3–8 | 1A–3B (some 3C–4C) | black, dark brown | brown, some hazel/green | moustache ×1.5 at 40+ | ×0.85 |
| Indigenous American | 4–7 | 1A–1B (coarse) | black | dark brown | sparse | ×0.45 |
| Pacific Islander | 5–9 | 2B–3C | black | dark brown | medium | ×0.75 |
| Mixed | 2–9 | wide | wide | wide | medium | ×0.8 |

**Spawn weights** start near player traffic: Brazil, US, Türkiye, Indonesia and India. They can be tuned.

## 2. Age: 3 bands → 7

The bands are 18–24, 25–34, 35–44, 45–54, 55–64, 65–74 and 75+. Spawn weights follow barbershop data [E]: 20 / 26 / 20 / 15 / 10 / 6 / 3%.

The saved `age` field (young / middle / old) stays for progression and levels. The 7 bands are derived from the exact age and drive the appearance tables:

- **Wrinkles:** Glogau class I–IV by band. Darker skin wrinkles about 10 years later; uneven pigment is used instead.
- **Greying:** onset differs by group: about 34 for European groups, 36 for MENA, South Asian and Latino, 38 for East and Southeast Asian, and 44 for African, Indigenous American and Pacific Islander (SD 6). Coverage then rises 3–4 points a year.
- **Beard and brow grey:** beard grey is scalp grey ±15 points, and brows lag behind both. Grey tints are salt-and-pepper, silver, white, and yellowed grey for 75+.
- **Arcus (grey ring at the edge of the iris):** 5% at 35–44, 25% at 45–54, 55% at 55–64, 80% at 65+.
- **Brows:** long wiry hairs from 45, and the outer third thins after 60.
- **Hairline:** juvenile under 25, maturing (1–1.5 cm back) from 25.

## 3. Hair texture: 4 looks → 12 (1A–4C)

Each type gets its own strand settings for wave shape, curl diameter, shrinkage, frizz, stand-up, sheen and coarseness. The beard gets matching settings.

| Type | Look |
|---|---|
| 1A | pin-straight, very glossy |
| 1B | straight with body |
| 1C | coarse straight, slight bend |
| 2A | loose flat S |
| 2B | defined S, some frizz |
| 2C | deep waves from the root |
| 3A | loose 3–4 cm loops |
| 3B | springy ringlets about 2 cm |
| 3C | corkscrews 0.5–1 cm |
| 4A | defined O-coils |
| 4B | Z-zigzag, matte |
| 4C | tight peppercorn coils, matte, high shrinkage |

Per-group weights follow the research table; for example West African is 4A 15 / 4B 38 / 4C 45, and East Asian is 1A 55 / 1B 30 / 1C 8. Strand coarseness has three levels: East Asian, MENA and Indigenous American are coarse. The saved `hair.type` (already "1a" to "4c") selects the preset, so old saves gain the finer look automatically.

## 4. Hair colour: 12 presets → 10 natural colours + 4 grey tints

| Colour | Hex |
|---|---|
| Black (blue-black for East Asian) | #15120F |
| Dark brown | #3A2A1F |
| Medium brown | #5B3E2B |
| Light brown | #86643F |
| Dark blond | #A4855A |
| Blond | #C8A878 |
| Light blond | #E2CFA1 |
| Strawberry blond | #C48A5A |
| Auburn | #7A3A22 |
| Red | #A9532B |

The grey tints are salt-and-pepper, silver, white and yellowed grey. Each colour also gets a small per-customer warm or cool shift, so no two browns are identical. The group weights follow the research table.

This needs one small engine patch: the hair tint table inside `game.js`'s `setAppearance` must read a longer list.

## 5. Baldness and hairline

| Trait | Now | Proposed |
|---|---|---|
| Stages | Norwood 1–7 + 3-vertex + "A" variants | plus a mature hairline and temple-only recession (IIa) |
| Age curve | 3 bands | 7 bands. White men reaching Norwood III+: 16% at 18–29, 30% in their 30s, 53% in their 40s, 80% at 70+ [S]. Then each group's multiplier |
| Hairline shape | one | linear 46% / M-shape 43% / round 11% [S] |
| Widow's peak | none | about 30% overall (Japan 33%, India 46%, Nigeria 15%) [S] |
| Diffuse / crown-led | by race | East and Southeast Asian get a +50% weight on crown and diffuse patterns [S] |
| Alopecia areata | 1–3% | 0.2–0.5% (point prevalence is 0.1–0.2% [S]; slightly raised so players see it) |

## 6. Facial hair

**Age weights (clean / stubble / beard / moustache-led / goatee family) [E]:**

| Age | Clean | Stubble | Beard | Moustache-led | Goatee family |
|---|---|---|---|---|---|
| 18–24 | 40 | 30 | 18 | 4 | 8 |
| 25–44 | 30 | 25 | 33 | 5 | 7 |
| 45–64 | 42 | 15 | 25 | 10 | 8 |
| 65+ | 55 | 8 | 20 | 12 | 5 |

The group multipliers come from section 1.

- **New styles:** stubble at 1 / 3 / 5 mm, Balbo, anchor, circle beard, soul patch, handlebar (straight, since curled tips are beyond the beard model), ducktail and garibaldi. These join the 14 existing styles for 22 in total.
- **Beard density:** a 0–1 value per group, with East Asian, Southeast Asian and Indigenous American low and patchy on the cheeks.

## 7. Eyebrows (new)

- **Shape:** straight 40%, soft angled 35%, arched 15%, rising 10%. East Asian brows lean straight.
- **Thickness:** 3 levels by group; thick for 45% of MENA and South Asian men, 20% of North European and 15% of East Asian.
- **Unibrow (moderate):** MENA and South Asian 10–15%, Mediterranean 7%, North European 4%, Latino 5%, African 3%, East Asian 1–2%.
- **With age:** bushier from 45; outer tail thins after 60.
- **Colour:** one shade darker than the scalp for blond and red men.

This needs a change to the brow mask in `customers/glsl.js` (customer code, not the engine).

## 8. Eyes: 7 colours → 8

The 8 colours are dark brown, brown, amber / light brown, hazel, green, grey, blue and light blue, with group weights from the research table; for example North European is blue 50%, and MENA is brown 70% and hazel 12%. Arcus follows the age table in section 2.

## 9. Skin

- **Tones:** the existing 10 tones are re-mapped to the Monk Skin Tone scale (10 published swatches), with group weights from section 1.
- **Undertones:** cool, neutral, olive, golden and warm red-brown, weighted by group.
- **Freckles (new):** 25–35% of North European men and 60–90% of red-haired men, about 5% of Mediterranean men, under 2% elsewhere.
- **Age spots (new):** from about 40 on fair skin and near-universal at 60+. On dark skin, small dark facial papules (dermatosis papulosa nigra) replace them.

Freckles and age spots are new noise layers in the skin shader.

## 10. Walk-in hairstyles: 6 families → about 9 families, roughly 25 cuts

The cuts are limited to 16 mm at walk-in (25 mm engine maximum). Each cut is gated by texture and weighted by age band.

| Family | Cuts | Texture | Strongest ages |
|---|---|---|---|
| Fade + short top | skin / low / mid / high / drop fades, Caesar | all; the standard for 4A–4C | 18–44 |
| Burst and temple fades | burst fade, temple taper ("Brooklyn fade") | all; temple taper mostly coily | 18–34 |
| Crops | textured crop, crew cut | 1A–3B | 18–44 |
| Classic | regular scissor taper, ivy league, side part with hard part (shaved line) | 1A–2C | 35+ |
| Strip styles | faux hawk, mohawk strip (short) | all | 18–24 |
| Buzz | induction, butch, buzz | all | all |
| Shaved | 3 mm regrowth, skin | all; more likely with balding | 45+ |
| High and tight | high and tight, recon | all | 18–44 |
| Flat top | short flat top (≤25 mm) | 3C–4C, plus 1C (classic 55+) | 18–34, 55+ |

**Balding:** from Norwood IV, about 50% of customers get a buzz, shaved or short classic cut [E].

**Engine change:** new contours (burst, temple, strip, hard part, flat top) are new starting length maps for the walk-in profile list in `game.js` (patch13). The cutting itself is unchanged.

## Phasing and risk

| Phase | Contents | Where | Risk | Size |
|---|---|---|---|---|
| **A** | 12 phenotypes, 7 age bands, 12 textures, 8 eye colours + arcus, grey model, balding curves and hairline shapes, beard weights, Monk skin | `people.js`, `meta.js` (heritage decks), `render.js` (texture presets) | Low: tables and existing shader settings | ~10 KB |
| **B** | Brow shapes and unibrow, freckles and age spots, widow's peak and hairline shapes, 8 new beard styles, 10 hair colours | `glsl.js`, `faces.js`, `people.js`, one small engine patch for the tint table | Medium: shader changes, needs visual review | ~8 KB |
| **C** | About 12 new walk-in cuts gated by texture and age | engine patch (walk-in length maps), `state.js` | Medium: touches the walk-in builder, not cutting | ~5 KB |

**Checks for each phase:**
- the existing suites (graphics, rewards, viewport, contracts),
- a 3,000-customer realism audit (no impossible combinations),
- contact sheets per group and age for owner review,
- a cutting play-through.
