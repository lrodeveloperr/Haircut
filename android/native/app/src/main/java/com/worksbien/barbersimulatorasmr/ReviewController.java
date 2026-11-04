package com.worksbien.barbersimulatorasmr;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.webkit.WebView;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

/**
 * Requests Google's unmodified in-app review card only at a completed, ad-free customer reveal.
 * Google intentionally does not disclose whether the card was shown or a rating was submitted, so
 * this records attempts and applies a conservative cross-version cooldown instead.
 */
final class ReviewController {
    private static final String APPGALLERY_DETAILS =
            "hiapplink://com.huawei.appmarket?appId=119651751";
    private static final String PREFS = "play-review-state";
    private static final String ATTEMPTS = "attempts";
    private static final String LAST_ATTEMPT_AT = "last-attempt-at";
    private static final String LAST_ATTEMPT_VERSION = "last-attempt-version";
    private static final String LAST_ATTEMPT_COMPLETION = "last-attempt-completion";
    private static final int INTERSTITIAL_COMPLETIONS = 2;
    private static final long INTERSTITIAL_ACTIVE_MS = 60_000;

    private final MainActivity activity;
    private final WebView web;
    private final AdsController ads;
    private final ReviewManager manager;
    private final SharedPreferences prefs;
    private boolean requestInFlight;
    private boolean destroyed;

    ReviewController(MainActivity activity, WebView web, AdsController ads) {
        this.activity = activity;
        this.web = web;
        this.ads = ads;
        this.manager = ReviewManagerFactory.create(activity);
        this.prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    void onCustomerCompleted(int completed, int qualifiedForInterstitial, long activeMs) {
        if (destroyed || requestInFlight || activity.isFinishing() || activity.isDestroyed()) return;
        if (completed < 1 || qualifiedForInterstitial < 0 || activeMs < 0) return;

        boolean adBreakPending = qualifiedForInterstitial >= INTERSTITIAL_COMPLETIONS
                && activeMs >= INTERSTITIAL_ACTIVE_MS;
        int attempts = prefs.getInt(ATTEMPTS, 0);
        long now = System.currentTimeMillis();
        if (!ReviewPromptPolicy.eligible(
                completed,
                adBreakPending || ads.isFullScreenBusy(),
                attempts,
                prefs.getLong(LAST_ATTEMPT_AT, 0),
                prefs.getInt(LAST_ATTEMPT_VERSION, 0),
                prefs.getInt(LAST_ATTEMPT_COMPLETION, 0),
                now,
                BuildConfig.VERSION_CODE)) return;

        requestInFlight = true;
        manager.requestReviewFlow().addOnCompleteListener(request -> {
            if (destroyed) {
                requestInFlight = false;
                return;
            }
            if (!request.isSuccessful()) {
                launchAppGalleryFallback(completed, attempts, now);
                return;
            }
            ReviewInfo review = request.getResult();
            // The Play request can take a moment. Never launch after the player has left this reveal.
            String stillAtMoment = "(function(){const g=window.skinFadeStudio;if(!g)return false;"
                    + "const s=g.getState(),v=g.getView();return s.status==='reveal'&&v.revealComplete"
                    + "&&s.completed===" + completed + ";})()";
            web.evaluateJavascript(stillAtMoment, value -> {
                if (destroyed || !"true".equals(value) || ads.isFullScreenBusy()) {
                    requestInFlight = false;
                    return;
                }
                try {
                    manager.launchReviewFlow(activity, review).addOnCompleteListener(ignored -> requestInFlight = false);
                    recordAttempt(completed, attempts, now);
                } catch (RuntimeException ignored) {
                    launchAppGalleryFallback(completed, attempts, now);
                }
            });
        });
    }

    private void launchAppGalleryFallback(int completed, int attempts, long now) {
        String stillAtMoment = "(function(){const g=window.skinFadeStudio;if(!g)return false;"
                + "const s=g.getState(),v=g.getView();return s.status==='reveal'&&v.revealComplete"
                + "&&s.completed===" + completed + ";})()";
        web.evaluateJavascript(stillAtMoment, value -> {
            if (destroyed || !"true".equals(value) || ads.isFullScreenBusy()) {
                requestInFlight = false;
                return;
            }
            try {
                Intent details = new Intent(Intent.ACTION_VIEW, Uri.parse(APPGALLERY_DETAILS));
                details.setPackage("com.huawei.appmarket");
                activity.startActivity(details);
                recordAttempt(completed, attempts, now);
            } catch (RuntimeException ignored) {
                // AppGallery is not installed. Leave the player in the game without a broken prompt.
            }
            requestInFlight = false;
        });
    }

    private void recordAttempt(int completed, int attempts, long now) {
        prefs.edit()
                .putInt(ATTEMPTS, attempts + 1)
                .putLong(LAST_ATTEMPT_AT, now)
                .putInt(LAST_ATTEMPT_VERSION, BuildConfig.VERSION_CODE)
                .putInt(LAST_ATTEMPT_COMPLETION, completed)
                .apply();
    }

    void destroy() {
        destroyed = true;
    }
}
