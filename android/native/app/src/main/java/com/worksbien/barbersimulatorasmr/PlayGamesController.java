package com.worksbien.barbersimulatorasmr;

/**
 * Google Play Games, switched off (owner decision 5 November 2026: build it, inert). Stays off until the Console
 * project id exists: then add the APP_ID manifest value and play-services-games-v2, and connect this controller's
 * flush to the SDK. A failure here can never block the game; local saves always commit first.
 */
final class PlayGamesController {
    private final String appId;
    private final PlayGamesOutbox outbox = new PlayGamesOutbox();

    PlayGamesController(String appId) {
        this.appId = appId == null ? "" : appId.trim();
    }

    boolean enabled() {
        return !appId.isEmpty();
    }

    /** Takes one committed envelope; does nothing while switched off. */
    boolean onCommit(String commitId, java.util.Map<String, Integer> facts) {
        if (!enabled() || commitId == null || commitId.isEmpty()) return false;
        java.util.Map<String, Integer> totals = PlayGamesCatalog.allowlisted(facts);
        boolean added = false;
        for (PlayGamesCatalog.Goal g : PlayGamesCatalog.reached(totals)) {
            added |= outbox.add(commitId, PlayGamesOutbox.Kind.ACHIEVEMENT_STEPS, g.key, g.target);
        }
        return added;
    }

    PlayGamesOutbox outbox() {
        return outbox;
    }
}
