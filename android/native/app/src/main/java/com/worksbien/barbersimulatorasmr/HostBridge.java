package com.worksbien.barbersimulatorasmr;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The native side of assets/android-bridge.js. Saves live only in the app's private storage on the
 * device; each write is committed to disk before the game is told it succeeded.
 */
final class HostBridge {
    private final MainActivity activity;
    private final AdsController ads;
    private final SharedPreferences prefs;

    HostBridge(MainActivity activity, AdsController ads) {
        this.activity = activity;
        this.ads = ads;
        this.prefs = activity.getSharedPreferences("game-saves", Context.MODE_PRIVATE);
    }

    @JavascriptInterface
    public String storageGet(String keysJson) throws JSONException {
        JSONArray keys = new JSONArray(keysJson), out = new JSONArray();
        for (int i = 0; i < keys.length(); i++) {
            String v = prefs.getString(keys.getString(i), null);
            out.put(v == null ? JSONObject.NULL : v);
        }
        return out.toString();
    }

    @JavascriptInterface
    public boolean storageSet(String keysJson, String valuesJson) {
        try {
            JSONArray keys = new JSONArray(keysJson), values = new JSONArray(valuesJson);
            if (keys.length() != values.length()) return false;
            SharedPreferences.Editor e = prefs.edit();
            for (int i = 0; i < keys.length(); i++) e.putString(keys.getString(i), values.getString(i));
            return e.commit();
        } catch (JSONException e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean storageDelete(String keysJson) {
        try {
            JSONArray keys = new JSONArray(keysJson);
            SharedPreferences.Editor e = prefs.edit();
            for (int i = 0; i < keys.length(); i++) e.remove(keys.getString(i));
            return e.commit();
        } catch (JSONException e) {
            return false;
        }
    }

    @JavascriptInterface
    public void showRewarded(String placement) {
        activity.runOnUiThread(() -> ads.showRewarded(placement));
    }

    @JavascriptInterface
    public void showInterstitial(String placement) {
        activity.runOnUiThread(() -> ads.showInterstitial(placement));
    }

    @JavascriptInterface
    public void gameReady() {
        activity.onGameReady();
    }
}
