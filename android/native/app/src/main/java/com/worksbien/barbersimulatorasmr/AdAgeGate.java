package com.worksbien.barbersimulatorasmr;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;

/** Local, neutral age bands. Unknown and under-18 players never start advertising or UMP. */
final class AdAgeGate {
    private static final String PREFS = "advertising-age";
    private static final String BAND = "age-band-v1";
    private final Activity activity;
    private final Runnable ready;
    private AlertDialog dialog;
    private int selected = -1;

    AdAgeGate(Activity activity, Runnable ready) {
        this.activity = activity;
        this.ready = ready;
    }

    static boolean allowsAdvertising(int band) { return band == 3; }

    static boolean advertisingAllowed(Context context) {
        return allowsAdvertising(readBand(context));
    }

    private static int readBand(Context context) {
        try {
            return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt(BAND, -1);
        } catch (ClassCastException invalidStoredValue) {
            return -1; // corrupted/migrated preferences must never grant advertising eligibility
        }
    }

    void start() {
        int saved = readBand(activity);
        if (saved >= 0 && saved <= 3) {
            if (allowsAdvertising(saved)) ready.run();
            return;
        }
        dialog = new AlertDialog.Builder(activity)
                .setTitle(R.string.age_title)
                .setSingleChoiceItems(R.array.age_bands, -1, (d, which) -> {
                    selected = which;
                    dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(true);
                })
                .setPositiveButton(R.string.age_continue, (d, which) -> {
                    if (selected < 0 || selected > 3) return;
                    SharedPreferences prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
                    prefs.edit().putInt(BAND, selected).apply();
                    if (allowsAdvertising(selected)) ready.run();
                })
                .setCancelable(false)
                .create();
        dialog.setOnShowListener(d -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setEnabled(false));
        dialog.show();
    }

    void destroy() {
        if (dialog != null) { dialog.dismiss(); dialog = null; }
    }
}
