package com.worksbien.barbersimulatorasmr;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AdMob behind Google's consent (UMP): nothing is requested until UMP says ads may be requested. The game
 * hears "rewarded" only from AdMob's earned-reward callback; a closed, unavailable or failed ad gives it
 * only "closed" or "failed", so it never credits a video that was not completed. All calls on the UI thread.
 */
final class AdsController {
    private static final long SHOW_WAIT_MS = 8000; // an ad requested before one has loaded waits this long

    private final Activity activity;
    private final WebView web;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final AtomicBoolean initialized = new AtomicBoolean(false);
    private ConsentInformation consent;
    private RewardedAd rewarded;
    private InterstitialAd interstitial;
    private boolean loadingRewarded, loadingInterstitial, rewardedWanted, showing, destroyed;
    private final Runnable rewardedTimeout = () -> {
        if (rewardedWanted) { rewardedWanted = false; emit("rewarded", "failed"); }
    };

    AdsController(Activity activity, WebView web) {
        this.activity = activity;
        this.web = web;
    }

    void start() {
        consent = UserMessagingPlatform.getConsentInformation(activity);
        consent.requestConsentInfoUpdate(activity, new ConsentRequestParameters.Builder().build(),
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity, formError -> initAds()),
                requestError -> initAds());
        // consent gathered in an earlier session: ads may start straight away
        initAds();
    }

    private boolean canRequestAds() {
        return consent != null && consent.canRequestAds();
    }

    private void initAds() {
        if (!canRequestAds() || initialized.getAndSet(true)) return;
        new Thread(() -> MobileAds.initialize(activity, status -> ui.post(() -> {
            loadRewarded();
            loadInterstitial();
        }))).start();
    }

    private void loadRewarded() {
        if (destroyed || loadingRewarded || rewarded != null || !canRequestAds()) return;
        loadingRewarded = true;
        RewardedAd.load(activity, BuildConfig.ADMOB_REWARDED_ID, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull RewardedAd ad) {
                loadingRewarded = false;
                rewarded = ad;
                if (rewardedWanted) { rewardedWanted = false; ui.removeCallbacks(rewardedTimeout); presentRewarded(); }
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                loadingRewarded = false;
                if (rewardedWanted) { rewardedWanted = false; ui.removeCallbacks(rewardedTimeout); emit("rewarded", "failed"); }
            }
        });
    }

    private void loadInterstitial() {
        if (destroyed || loadingInterstitial || interstitial != null || !canRequestAds()) return;
        loadingInterstitial = true;
        InterstitialAd.load(activity, BuildConfig.ADMOB_INTERSTITIAL_ID, new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull InterstitialAd ad) {
                loadingInterstitial = false;
                interstitial = ad;
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                loadingInterstitial = false;
            }
        });
    }

    void showRewarded(String placement) {
        if (showing || rewardedWanted) { emit("rewarded", "failed"); return; }
        if (!canRequestAds()) { emit("rewarded", "failed"); return; }
        initAds();
        if (rewarded != null) { presentRewarded(); return; }
        rewardedWanted = true;
        ui.postDelayed(rewardedTimeout, SHOW_WAIT_MS);
        loadRewarded();
    }

    private void presentRewarded() {
        RewardedAd ad = rewarded;
        rewarded = null;
        showing = true;
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdShowedFullScreenContent() { emit("rewarded", "opened"); }

            @Override
            public void onAdDismissedFullScreenContent() { finished("rewarded", "closed"); }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { finished("rewarded", "failed"); }
        });
        ad.show(activity, reward -> emit("rewarded", "rewarded"));
    }

    void showInterstitial(String placement) {
        // the next customer never waits for an interstitial: none ready means none shown
        if (showing || interstitial == null || !canRequestAds()) { emit("interstitial", "failed"); loadInterstitial(); return; }
        InterstitialAd ad = interstitial;
        interstitial = null;
        showing = true;
        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdShowedFullScreenContent() { emit("interstitial", "opened"); }

            @Override
            public void onAdDismissedFullScreenContent() { finished("interstitial", "closed"); }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { finished("interstitial", "failed"); }
        });
        ad.show(activity);
    }

    private void finished(String kind, String state) {
        showing = false;
        emit(kind, state);
        if ("rewarded".equals(kind)) loadRewarded(); else loadInterstitial();
    }

    private void emit(String kind, String state) {
        if (destroyed) return;
        ui.post(() -> web.evaluateJavascript("window.__androidHost && window.__androidHost.ad('" + kind + "','" + state + "')", null));
    }

    void destroy() {
        destroyed = true;
        ui.removeCallbacksAndMessages(null);
    }
}
