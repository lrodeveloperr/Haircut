package com.worksbien.barbersimulatorasmr;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class ReviewPromptPolicyTest {
    private static final long NOW = 2_000_000_000_000L;

    @Test public void firstAttemptStartsAtThirdCompletedCustomer() {
        assertFalse(eligible(2, false, 0, 0, 0, 0, NOW, 12));
        assertTrue(eligible(3, false, 0, 0, 0, 0, NOW, 12));
        assertTrue(eligible(21, false, 0, 0, 0, 0, NOW, 12));
    }

    @Test public void pendingInterstitialAlwaysWinsTheNaturalBreak() {
        assertFalse(eligible(3, true, 0, 0, 0, 0, NOW, 12));
    }

    @Test public void repeatNeedsCooldownNewVersionAndFiveMoreCustomers() {
        long old = NOW - ReviewPromptPolicy.RETRY_AFTER_MS;
        assertFalse(eligible(8, false, 1, old, 12, 3, NOW, 12));
        assertFalse(eligible(8, false, 1, NOW - 1, 11, 3, NOW, 12));
        assertFalse(eligible(7, false, 1, old, 11, 3, NOW, 12));
        assertTrue(eligible(8, false, 1, old, 11, 3, NOW, 12));
    }

    @Test public void automaticRequestsStopAfterThreeAttempts() {
        assertFalse(eligible(100, false, 3, 0, 1, 1, NOW, 12));
    }

    private static boolean eligible(
            int completed, boolean adBreakPending, int attempts, long lastAttemptAt,
            int lastAttemptVersion, int lastAttemptCompletion, long now, int currentVersion) {
        return ReviewPromptPolicy.eligible(completed, adBreakPending, attempts, lastAttemptAt,
                lastAttemptVersion, lastAttemptCompletion, now, currentVersion);
    }
}
