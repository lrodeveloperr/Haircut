package com.worksbien.barbersimulatorasmr;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.Map;
import org.junit.Test;

public class PlayGamesTest {
    private static Map<String, Integer> facts(String k, int v) {
        Map<String, Integer> m = new HashMap<>();
        m.put(k, v);
        return m;
    }

    @Test public void staysOffWithoutAConsoleId() {
        PlayGamesController off = new PlayGamesController("");
        assertFalse(off.enabled());
        assertFalse(off.onCommit("c1", facts("customers", 5)));
        assertTrue(off.outbox().pending().isEmpty());
        assertFalse(new PlayGamesController(null).enabled());
    }

    @Test public void onlyAllowlistedFactsBecomeActions() {
        Map<String, Integer> f = facts("customers", 3);
        f.put("coins", 999999);
        f.put("anything", 5);
        assertEquals(1, PlayGamesCatalog.allowlisted(f).size());
        assertEquals(2, PlayGamesCatalog.reached(PlayGamesCatalog.allowlisted(f)).size());
    }

    @Test public void aRepeatedCommitReportsOnce() {
        PlayGamesController on = new PlayGamesController("123");
        assertTrue(on.onCommit("c1", facts("customers", 1)));
        assertFalse(on.onCommit("c1", facts("customers", 1)));
        assertEquals(1, on.outbox().pending().size());
    }

    @Test public void scoresCoalesceToTheHighestAndTheQueueIsBounded() {
        PlayGamesOutbox o = new PlayGamesOutbox();
        o.add("a", PlayGamesOutbox.Kind.LEADERBOARD, "board", 10);
        o.add("b", PlayGamesOutbox.Kind.LEADERBOARD, "board", 7);
        assertEquals(1, o.pending().size());
        assertEquals(10, o.pending().get(0).value);
        for (int i = 0; i < 1000; i++) o.add("s" + i, PlayGamesOutbox.Kind.STAT, "stat", 1);
        assertTrue(o.pending().size() <= PlayGamesOutbox.MAX);
    }

    @Test public void anAmbiguousStatIsConsumedAfterAProcessDeath() {
        PlayGamesOutbox o = new PlayGamesOutbox();
        o.add("a", PlayGamesOutbox.Kind.STAT, "stat", 1);
        o.add("a", PlayGamesOutbox.Kind.LEADERBOARD, "board", 3);
        for (PlayGamesOutbox.Item i : o.pending()) o.markSending(i);
        o.recoverAfterRestart();
        assertEquals(1, o.pending().size());
        assertEquals(PlayGamesOutbox.Kind.LEADERBOARD, o.pending().get(0).kind);
        assertFalse(o.pending().get(0).sending);
    }

    @Test public void lineageDecidesNeverCoinsOrClocks() {
        PlayGamesSnapshotPolicy.Header a = new PlayGamesSnapshotPolicy.Header(5, "a", "x");
        PlayGamesSnapshotPolicy.Header child = new PlayGamesSnapshotPolicy.Header(6, "b", "a");
        PlayGamesSnapshotPolicy.Header fork = new PlayGamesSnapshotPolicy.Header(9, "c", "x");
        assertEquals(PlayGamesSnapshotPolicy.Decision.SAME, PlayGamesSnapshotPolicy.resolve(a, a));
        assertEquals(PlayGamesSnapshotPolicy.Decision.USE_LOCAL, PlayGamesSnapshotPolicy.resolve(child, a));
        assertEquals(PlayGamesSnapshotPolicy.Decision.USE_CLOUD, PlayGamesSnapshotPolicy.resolve(a, child));
        assertEquals("a higher revision alone never wins", PlayGamesSnapshotPolicy.Decision.ASK_PLAYER, PlayGamesSnapshotPolicy.resolve(a, fork));
        assertEquals(PlayGamesSnapshotPolicy.Decision.USE_LOCAL, PlayGamesSnapshotPolicy.resolve(a, null));
    }
}
