package com.worksbien.barbersimulatorasmr;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.LocaleList;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;
import org.json.JSONTokener;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Non-blocking JS requests, with save acknowledgements only after durable disk commits. */
final class HostBridge {
    private static final String ENVELOPE = "android-envelope-v1";
    private final MainActivity activity;
    private final AdsController ads;
    private final ReviewController reviews;
    private final BillingController billing;
    private final WebView web;
    private final SharedPreferences prefs;
    private final ExecutorService storage = Executors.newSingleThreadExecutor();
    private volatile boolean destroyed;

    HostBridge(MainActivity activity, AdsController ads, ReviewController reviews, BillingController billing, WebView web) {
        this.activity = activity;
        this.ads = ads;
        this.reviews = reviews;
        this.billing = billing;
        this.web = web;
        this.prefs = activity.getSharedPreferences("game-saves", Context.MODE_PRIVATE);
    }

    @JavascriptInterface
    public String languageTag() {
        LocaleList locales = LocaleList.getDefault();
        if (!locales.isEmpty()) return locales.get(0).toLanguageTag();
        return "en";
    }

    @JavascriptInterface
    public void request(String id, String operation, String payloadJson) {
        if (destroyed || id == null || !id.matches("[0-9]{1,16}")) return;
        storage.execute(() -> {
            boolean success = false;
            String result;
            try {
                if ("load".equals(operation)) {
                    result = prefs.getString(ENVELOPE, null);
                    if (result == null) {
                        JSONObject legacy = new JSONObject();
                        for (Map.Entry<String, ?> entry : prefs.getAll().entrySet()) {
                            if (entry.getKey().startsWith("skin-fade-studio-") && entry.getValue() instanceof String)
                                legacy.put(entry.getKey(), entry.getValue());
                        }
                        result = legacy.toString();
                    }
                } else if ("save".equals(operation)) {
                    Object payload = new JSONTokener(payloadJson).nextValue();
                    if (!(payload instanceof String)) throw new IllegalArgumentException("Invalid save");
                    String data = (String) payload;
                    if (data.length() >= 3 * 1024 * 1024) throw new IllegalArgumentException("Save too large");
                    if (!prefs.edit().putString(ENVELOPE, data).commit()) throw new IllegalStateException("Android storage write failed");
                    result = "";
                } else throw new IllegalArgumentException("Unknown storage request");
                success = true;
            } catch (Exception e) {
                result = "Android storage " + ("save".equals(operation) ? "write" : "read") + " failed";
            }
            final boolean ok = success;
            final String value = result;
            activity.runOnUiThread(() -> {
                if (!destroyed) web.evaluateJavascript("window.__androidHost && window.__androidHost.complete("
                        + JSONObject.quote(id) + "," + ok + "," + JSONObject.quote(value) + ")", null);
            });
        });
    }

    @JavascriptInterface
    public void showRewarded(String placement) {
        activity.runOnUiThread(() -> { if (!destroyed) ads.showRewarded(placement); });
    }

    @JavascriptInterface
    public void showInterstitial(String placement) {
        activity.runOnUiThread(() -> { if (!destroyed) ads.showInterstitial(placement); });
    }

    @JavascriptInterface
    public void reviewMoment(int completed, int qualifiedForInterstitial, long activeMs) {
        activity.runOnUiThread(() -> {
            if (!destroyed) reviews.onCustomerCompleted(completed, qualifiedForInterstitial, activeMs);
        });
    }

    @JavascriptInterface
    public void homeReady() {
        // The native barbershop loading surface remains over the WebView until Home is fully painted.
        if (!destroyed) activity.onHomeReady();
    }

    @JavascriptInterface
    public void gameReady() {
        activity.runOnUiThread(() -> { if (!destroyed) { ads.publishPrivacyOptions(); ads.publishRewardedReady(); billing.pageReady(); } });
    }

    @JavascriptInterface
    public void billingBuy(String productId) {
        activity.runOnUiThread(() -> { if (!destroyed) billing.buy(productId); });
    }

    @JavascriptInterface
    public void billingComplete(String productId, String purchaseToken, boolean granted) {
        activity.runOnUiThread(() -> { if (!destroyed) billing.complete(productId, purchaseToken, granted); });
    }

    @JavascriptInterface
    public void billingRefresh() {
        activity.runOnUiThread(() -> { if (!destroyed) billing.refresh(); });
    }

    @JavascriptInterface
    public void showPrivacyOptions() {
        activity.runOnUiThread(() -> { if (!destroyed) ads.showPrivacyOptions(); });
    }

    @JavascriptInterface
    public void openPrivacy() {
        activity.runOnUiThread(() -> { if (!destroyed) activity.openPrivacy(); });
    }

    @JavascriptInterface
    public void shareGame(String dataUrl) {
        if (destroyed) return;
        storage.execute(() -> {
            Uri image = destroyed ? null : activity.createShareImage(dataUrl);
            activity.runOnUiThread(() -> { if (!destroyed) activity.openShareSheet(image); });
        });
    }

    void destroy() {
        destroyed = true;
        storage.shutdown(); // finish queued durable writes, without calling the destroyed WebView
    }
}
