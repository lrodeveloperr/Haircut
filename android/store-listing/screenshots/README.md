# Google Play phone screenshots

Authentic gameplay captures of the Android full-detail build (`TARGET=full`, `?detail=high`), 1080×1920
(9:16), 24-bit PNG, no captions. Each shows a real game state reached through the game's own input
handlers: camera rotated by dragging, hair cut with the clipper and guard buttons, wardrobe items equipped.

| File | Angle | Customer | Shows |
|---|---|---|---|
| `phone/01-fade-clipper-back.png` | back three-quarter | Black, coily hair | clipper mid-stroke on a fade (guard 1) |
| `phone/02-skin-fade-side.png` | side profile | white, straight light-brown hair, stubble | finished skin fade blended into the sideburn |
| `phone/03-buzz-clipper-top.png` | high, top-down | East Asian, straight black hair | clipper on the last strip of a guard-1 buzz |
| `phone/04-beard-front.png` | front three-quarter | South Asian, greying full beard | the beard customer face-on |

Customers are game-generated (`HSC.makePerson`), dealt through the next-customer queue at barber level 5 so
beards appear, as they do for a progressed player. Clippings from earlier passes are cleared
(`HSC.clearClippings`, as the game does between customers) before the final stroke.

## Recreate

```sh
TARGET=full bash source/buildall.sh
npx http-server source/build -p 8124 -s &
cd android/store-listing/screenshots/capture
node scenes.cjs s1 ../phone 3 high      # s1..s4; add `calib` for an uncut framing check
```

Rendering uses software WebGL (SwiftShader), so a full-detail scene takes 5–20 minutes. Use `1 low` for a
fast preview. Customers are random per run within each scene's constraints.
