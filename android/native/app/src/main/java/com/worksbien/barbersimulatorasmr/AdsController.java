package com.worksbien.barbersimulatorasmr;

import android.app.Activity;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
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
    private final FrameLayout bannerSlot;
    private AdView banner;
    private int bannerKey = -1;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final AtomicBoolean initialized = new AtomicBoolean(false);
    private ConsentInformation consent;
    private RewardedAd rewarded;
    private InterstitialAd interstitial;
    private boolean loadingRewarded, loadingInterstitial, rewardedWanted, showing, destroyed;
    private boolean privacyOptionsShowing;
    private boolean sdkReady, interstitialWanted;
    private int consentGeneration;
    private final Runnable rewardedTimeout = () -> {
        if (rewardedWanted) { rewardedWanted = false; emit("rewarded", "failed"); }
    };
    private final Runnable interstitialTimeout = () -> {
        if (interstitialWanted) {
            interstitialWanted = false;
            emit("interstitial", "failed");
        }
    };

    AdsController(Activity activity, WebView web, FrameLayout bannerSlot) {
        this.activity = activity;
        this.web = web;
        this.bannerSlot = bannerSlot;
        // the strip is sized for the adaptive banner straight away (and on every width change), before any ad loads
        bannerSlot.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> { if (r - l != or - ol || b - t != ob - ot) ui.post(this::sizeBanner); });
        ui.post(this::sizeBanner);
    }

    // ---- the bottom banner: an anchored adaptive banner in a strip of fixed height; AdMob refreshes it on the
    // ad unit's refresh rate (set in the AdMob console). Nothing is requested before consent allows it. ----
    // In landscape the anchored adaptive banner is up to 90dp tall (about a fifth of a phone's height with the
    // reserved strip), so landscape uses the standard 320x50 banner instead (owner decision, 4 November 2026).
    private AdSize bannerSize() {
        DisplayMetrics m = activity.getResources().getDisplayMetrics();
        if (m.widthPixels > m.heightPixels) return AdSize.BANNER;
        int widthPx = bannerSlot.getWidth() > 0 ? bannerSlot.getWidth() : m.widthPixels;
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, Math.max(320, Math.round(widthPx / m.density)));
    }
    private static int sizeKey(AdSize s) { return s.getWidth() * 1000 + s.getHeight(); }
    private void sizeBanner() {
        if (destroyed) return;
        AdSize size = bannerSize();
        ViewGroup.LayoutParams lp = bannerSlot.getLayoutParams();
        int h = size.getHeightInPixels(activity);
        if (lp != null && lp.height != h) { lp.height = h; bannerSlot.setLayoutParams(lp); }
        if (sdkReady && sizeKey(size) != bannerKey) loadBanner();
    }
    private void loadBanner() {
        if (destroyed || !sdkReady || !canRequestAds() || BuildConfig.ADMOB_BANNER_ID.isEmpty()) return;
        AdSize size = bannerSize();
        if (banner != null) { bannerSlot.removeView(banner); banner.destroy(); banner = null; }
        bannerKey = sizeKey(size);
        banner = new AdView(activity);
        banner.setAdUnitId(BuildConfig.ADMOB_BANNER_ID);
        banner.setAdSize(size);
        banner.setAdListener(new AdListener() {
            @Override public void onAdFailedToLoad(@NonNull LoadAdError error) { /* the strip keeps its height; AdMob retries on refresh */ }
        });
        bannerSlot.addView(banner, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER));
        banner.loadAd(new AdRequest.Builder().build());
    }

    void start() {
        MobileAds.setRequestConfiguration(new RequestConfiguration.Builder()
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).build());
        consent = UserMessagingPlatform.getConsentInformation(activity);
        consent.requestConsentInfoUpdate(activity, new ConsentRequestParameters.Builder().build(),
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity, formError -> {
                    publishPrivacyOptions();
                    initAds();
                }),
                requestError -> { publishPrivacyOptions(); initAds(); });
        // consent gathered in an earlier session: ads may start straight away
        initAds();
    }

    void publishPrivacyOptions() {
        if (destroyed) return;
        boolean required = consent != null && consent.getPrivacyOptionsRequirementStatus()
                == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
        web.evaluateJavascript("window.__androidPrivacyOptionsRequired=" + required
                + ";window.dispatchEvent(new Event('android-privacy-options'))", null);
    }

    void showPrivacyOptions() {
        if (destroyed || showing || rewardedWanted || interstitialWanted || privacyOptionsShowing || consent == null
                || consent.getPrivacyOptionsRequirementStatus()
                    != ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED) return;
        privacyOptionsShowing = true;
        // Previously cached ads must not survive a change in consent. Ignore any older load callback.
        consentGeneration++;
        rewarded = null;
        interstitial = null;
        loadingRewarded = loadingInterstitial = false;
        if (banner != null) { bannerSlot.removeView(banner); banner.destroy(); banner = null; bannerKey = -1; }
        UserMessagingPlatform.showPrivacyOptionsForm(activity, formError -> {
            if (destroyed) return;
            privacyOptionsShowing = false;
            publishPrivacyOptions();
            if (!canRequestAds()) return;
            if (initialized.get()) {
                loadRewarded(); loadInterstitial(); loadBanner();
            } else initAds();
        });
    }

    private boolean canRequestAds() {
        return consent != null && consent.canRequestAds();
    }

    private void initAds() {
        if (!canRequestAds() || initialized.getAndSet(true)) return;
        new Thread(() -> MobileAds.initialize(activity, status -> ui.post(() -> {
            if (destroyed) return;
            sdkReady = true;
            loadRewarded();
            loadInterstitial();
            loadBanner();
        }))).start();
    }

    private void loadRewarded() {
        if (destroyed || privacyOptionsShowing || loadingRewarded || rewarded != null || !canRequestAds()) return;
        loadingRewarded = true;
        final int generation = consentGeneration;
        RewardedAd.load(activity, BuildConfig.ADMOB_REWARDED_ID, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull RewardedAd ad) {
                if (destroyed || generation != consentGeneration) return;
                loadingRewarded = false;
                rewarded = ad;
                if (rewardedWanted) { rewardedWanted = false; ui.removeCallbacks(rewardedTimeout); presentRewarded(); }
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                if (destroyed || generation != consentGeneration) return;
                loadingRewarded = false;
                if (rewardedWanted) { rewardedWanted = false; ui.removeCallbacks(rewardedTimeout); emit("rewarded", "failed"); }
            }
        });
    }

    private void loadInterstitial() {
        if (destroyed || privacyOptionsShowing || loadingInterstitial || interstitial != null || !canRequestAds()) return;
        loadingInterstitial = true;
        final int generation = consentGeneration;
        InterstitialAd.load(activity, BuildConfig.ADMOB_INTERSTITIAL_ID, new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
            @Override
            public void onAdLoaded(@NonNull InterstitialAd ad) {
                if (destroyed || generation != consentGeneration) return;
                loadingInterstitial = false;
                interstitial = ad;
                if (interstitialWanted) {
                    interstitialWanted = false;
                    ui.removeCallbacks(interstitialTimeout);
                    presentInterstitial();
                }
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                if (destroyed || generation != consentGeneration) return;
                loadingInterstitial = false;
                if (interstitialWanted) {
                    interstitialWanted = false;
                    ui.removeCallbacks(interstitialTimeout);
                    emit("interstitial", "failed");
                }
            }
        });
    }

    void showRewarded(String placement) {
        if (destroyed || privacyOptionsShowing || showing || rewardedWanted) { emit("rewarded", "failed"); return; }
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
        if (destroyed || privacyOptionsShowing || showing || rewardedWanted || interstitialWanted || !canRequestAds()) {
            emit("interstitial", "failed");
            return;
        }
        initAds();
        if (interstitial != null) { presentInterstitial(); return; }
        // This opportunity expires immediately; loading only prepares a future completion.
        emit("interstitial", "failed");
        loadInterstitial();
    }

    private void presentInterstitial() {
        if (destroyed || activity.isFinishing() || activity.isDestroyed() || !activity.hasWindowFocus()) {
            emit("interstitial", "failed");
            return;
        }
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

    boolean isFullScreenBusy() {
        return privacyOptionsShowing || rewardedWanted || interstitialWanted || showing;
    }

    void resume() { if (banner != null) banner.resume(); }

    void pause() {
        if (banner != null) banner.pause();
        if (interstitialWanted && !showing) {
            interstitialWanted = false;
            ui.removeCallbacks(interstitialTimeout);
            emit("interstitial", "failed");
        }
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
        if (banner != null) { banner.destroy(); banner = null; }
        ui.removeCallbacksAndMessages(null);
    }
}
