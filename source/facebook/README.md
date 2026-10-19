# Meta Instant Games target

This target uses Meta Instant Games SDK v8 directly. It contains no Playgama or YouTube SDK.

Build and package:

```sh
bash source/build-facebook.sh
python3 source/facebook/package.py /tmp/barber-facebook.zip
```

The build keeps the full-detail renderer, current controls, three existing save schemas, two-completed-video daily unlock rule, earned-reward callbacks, and natural-break interstitial timing.

Ad placement IDs are public configuration values supplied only to the Facebook build:

- `FACEBOOK_REWARDED_UNLOCK_ID`
- `FACEBOOK_REWARDED_REPLAY_ID`
- `FACEBOOK_INTERSTITIAL_ID`

When those values are not provided, the related ad request safely returns unavailable; gameplay and saves continue. A rewarded unlock is granted only when Meta's `AdInstance.showAsync()` resolves after the video has been watched.

Player progress uses `FBInstant.player.getDataAsync`, `setDataAsync`, and `flushDataAsync`. Startup keeps every save key write-protected until the first successful read. The combined save is checked against Meta's 1 MB per-player limit.
