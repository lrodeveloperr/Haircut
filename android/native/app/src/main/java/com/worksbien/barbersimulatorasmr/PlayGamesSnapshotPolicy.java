package com.worksbien.barbersimulatorasmr;

/**
 * Saved Games conflict rule (strategy section 7). Lineage decides, never coins, items or clocks: a descendant replaces
 * its ancestor; diverged saves always go to the player, because no merge of a signed economy is safe.
 */
final class PlayGamesSnapshotPolicy {
    enum Decision { SAME, USE_LOCAL, USE_CLOUD, ASK_PLAYER }

    static final class Header {
        final long revision;
        final String contentHash;
        final String parentContentHash;

        Header(long revision, String contentHash, String parentContentHash) {
            this.revision = revision;
            this.contentHash = contentHash;
            this.parentContentHash = parentContentHash;
        }
    }

    private PlayGamesSnapshotPolicy() {}

    static Decision resolve(Header local, Header cloud) {
        if (cloud == null) return Decision.USE_LOCAL;
        if (local == null) return Decision.USE_CLOUD;
        if (local.contentHash.equals(cloud.contentHash)) return Decision.SAME;
        if (cloud.contentHash.equals(local.parentContentHash) && local.revision > cloud.revision) return Decision.USE_LOCAL;
        if (local.contentHash.equals(cloud.parentContentHash) && cloud.revision > local.revision) return Decision.USE_CLOUD;
        return Decision.ASK_PLAYER;
    }
}
