package com.worksbien.barbersimulatorasmr;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Allowlisted achievements and leaderboards (docs/GOOGLE-PLAY-GAMES-SERVICES-STRATEGY.md sections 5 and 8). The web
 * game sends facts; only this table turns them into platform actions, so JavaScript can never name a platform id.
 * Console ids are empty until the owner creates them: an entry with no id reports nothing.
 */
final class PlayGamesCatalog {
    static final class Goal {
        final String key;
        final String metric;
        final int target;
        final String platformId;

        Goal(String key, String metric, int target, String platformId) {
            this.key = key;
            this.metric = metric;
            this.target = target;
            this.platformId = platformId;
        }
    }

    private static final List<Goal> GOALS = new ArrayList<>();

    private static void add(String key, String metric, int target) {
        GOALS.add(new Goal(key, metric, target, ""));
    }

    static {
        add("first_client", "customers", 1);
        add("getting_booked", "customers", 3);
        add("five_in_the_chair", "customers", 5);
        add("local_favorite", "customers", 25);
        add("chair_veteran", "customers", 100);
        add("always_open", "customers", 500);
        add("two_thousand_cuts", "customers", 2000);
        add("clean_finish", "threeStars", 3);
        add("sharp_eye", "threeStars", 25);
        add("precision_pro", "threeStars", 100);
        add("five_hundred_perfect", "threeStars", 500);
        add("precision_five", "perfectStreak", 5);
        add("perfect_ten", "perfectStreak", 10);
        add("rescue_specialist", "rescues", 25);
        add("beard_specialist", "beards", 25);
        add("rush_specialist", "rushes", 25);
        add("trusted_barber", "regularReturns", 25);
        add("open_for_business", "branches", 1);
        add("growing_brand", "branches", 3);
        add("licensed_barber", "rank", 1);
        add("professional_barber", "rank", 2);
        add("specialist", "rank", 3);
        add("master_barber", "rank", 4);
        add("world_barber", "rank", 6);
        add("a_legend_begins", "legend", 1);
        add("living_legend", "legend", 5);
    }

    private PlayGamesCatalog() {}

    static List<Goal> goals() {
        return Collections.unmodifiableList(GOALS);
    }

    /** The goals these committed totals have reached (a total only rises, so reporting again is safe). */
    static List<Goal> reached(Map<String, Integer> totals) {
        List<Goal> out = new ArrayList<>();
        for (Goal g : GOALS) {
            Integer v = totals.get(g.metric);
            if (v != null && v >= g.target) out.add(g);
        }
        return out;
    }

    /** Only known metrics pass: anything else in an envelope is dropped. */
    static Map<String, Integer> allowlisted(Map<String, Integer> facts) {
        Map<String, Integer> out = new HashMap<>();
        for (Goal g : GOALS) {
            Integer v = facts.get(g.metric);
            if (v != null && v >= 0) out.put(g.metric, v);
        }
        return out;
    }
}
