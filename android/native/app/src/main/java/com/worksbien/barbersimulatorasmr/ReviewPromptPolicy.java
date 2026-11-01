package com.worksbien.barbersimulatorasmr;

/** Pure eligibility rules for the Play in-app review request. */
final class ReviewPromptPolicy {
    static final int FIRST_COMPLETION = 3;
    static final int MIN_ADDITIONAL_COMPLETIONS = 5;
    static final int MAX_ATTEMPTS = 3;
    static final long RETRY_AFTER_MS = 60L * 24 * 60 * 60 * 1000;

    private ReviewPromptPolicy() {}

    static boolean eligible(
            int completed,
            boolean adBreakPending,
            int attempts,
            long lastAttemptAt,
            int lastAttemptVersion,
            int lastAttemptCompletion,
            long now,
            int currentVersion) {
        if (completed < FIRST_COMPLETION || adBreakPending || attempts >= MAX_ATTEMPTS) return false;
        if (attempts == 0) return true;
        return currentVersion > lastAttemptVersion
                && now - lastAttemptAt >= RETRY_AFTER_MS
                && completed - lastAttemptCompletion >= MIN_ADDITIONAL_COMPLETIONS;
    }
}
