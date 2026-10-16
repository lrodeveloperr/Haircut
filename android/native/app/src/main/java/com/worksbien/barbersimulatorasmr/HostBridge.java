package com.worksbien.barbersimulatorasmr;

import android.content.Context;
import android.content.SharedPreferences;
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
    private final WebView web;
    private final SharedPreferences prefs;
    private final ExecutorService storage = Executors.newSingleThreadExecutor();
    private volatile boolean destroyed;

    HostBridge(MainActivity activity, AdsController ads, WebView web) {
        this.activity = activity;
        this.ads = ads;
        this.web = web;
        this.prefs = activity.getSharedPreferences("game-saves", Context.MODE_PRIVATE);
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
    public void gameReady() { activity.onGameReady(); }

    void destroy() {
        destroyed = true;
        storage.shutdown(); // finish queued durable writes, without calling the destroyed WebView
    }
}
