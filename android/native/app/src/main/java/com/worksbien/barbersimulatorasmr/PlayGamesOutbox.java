package com.worksbien.barbersimulatorasmr;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The bounded reporting queue (strategy section 5, "Outbox rules"). Deduplicates by commit, action and object;
 * coalesces scores and steps to the highest unsent value; never grows with an endless career. Game Stats are not
 * idempotent: an event marked sending before a process death counts as consumed rather than risk a duplicate.
 */
final class PlayGamesOutbox {
    static final int MAX = 256;

    enum Kind { ACHIEVEMENT_STEPS, LEADERBOARD, STAT }

    static final class Item {
        final String key;
        final Kind kind;
        final String object;
        long value;
        boolean sending;

        Item(String key, Kind kind, String object, long value) {
            this.key = key;
            this.kind = kind;
            this.object = object;
            this.value = value;
        }
    }

    private final LinkedHashMap<String, Item> items = new LinkedHashMap<>();
    private final Map<String, Boolean> seen = new HashMap<>();

    /** Returns false when this exact commit, action and object was already taken. */
    boolean add(String commitId, Kind kind, String object, long value) {
        String dedupe = commitId + "|" + kind + "|" + object;
        if (seen.containsKey(dedupe)) return false;
        seen.put(dedupe, true);
        if (seen.size() > MAX * 4) seen.clear(); // bounded; totals are reconciled after sign-in anyway
        if (kind != Kind.STAT) {
            String coalesced = kind + "|" + object;
            Item old = items.get(coalesced);
            if (old != null) {
                old.value = Math.max(old.value, value);
                return true;
            }
            items.put(coalesced, new Item(coalesced, kind, object, value));
        } else {
            items.put(dedupe, new Item(dedupe, kind, object, value));
        }
        while (items.size() > MAX) items.remove(items.keySet().iterator().next());
        return true;
    }

    List<Item> pending() {
        return new ArrayList<>(items.values());
    }

    /** Mark before the SDK call: this state is what survives a process death. */
    void markSending(Item item) {
        item.sending = true;
    }

    void acknowledge(Item item) {
        items.remove(item.key);
    }

    /** An explicit failure may retry. */
    void failed(Item item) {
        item.sending = false;
    }

    /** After a restart: an ambiguous stat is consumed; achievements and scores safely send again. */
    void recoverAfterRestart() {
        List<Item> drop = new ArrayList<>();
        for (Item i : items.values()) {
            if (!i.sending) continue;
            if (i.kind == Kind.STAT) drop.add(i);
            else i.sending = false;
        }
        for (Item i : drop) items.remove(i.key);
    }
}
