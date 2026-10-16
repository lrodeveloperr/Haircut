package com.worksbien.barbersimulatorasmr;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.ByteArrayInputStream;

/**
 * Hosts the game's web build (bundled in assets/game, served offline from the app's own origin) in a
 * full-screen WebView. The page's Playgama Bridge script URL is answered with assets/android-bridge.js,
 * and every other outside request is refused, so the game runs without any web host services.
 */
public class MainActivity extends ComponentActivity {
    static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String GAME_URL = ORIGIN + "/assets/game/index.html";
    private static final String PLAYGAMA_BRIDGE = "https://bridge.playgama.com/v2/stable/playgama-bridge.js";
    private static final long SPLASH_MAX_MS = 6000;

    private WebView web;
    private AdsController ads;
    private volatile boolean gameReady;
    private long started;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        started = SystemClock.uptimeMillis();
        splash.setKeepOnScreenCondition(() -> !gameReady && SystemClock.uptimeMillis() - started < SPLASH_MAX_MS);

        // Full screen: the system bars are hidden (a swipe shows them briefly) and the game is kept clear of
        // any camera cutout and of bars that are showing, so no control sits under them.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#2b1e17"));
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets i = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(i.left, i.top, i.right, i.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#2b1e17"));
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        hideSystemBars();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100); // the phone's font size setting must not resize the game's numbers
        s.setSupportZoom(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (PLAYGAMA_BRIDGE.equals(url.toString())) {
                    return assets.shouldInterceptRequest(Uri.parse(ORIGIN + "/assets/android-bridge.js"));
                }
                WebResourceResponse local = assets.shouldInterceptRequest(url);
                if (local != null) return local;
                // nothing else is fetched: the game is fully bundled
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not available offline", null,
                        new ByteArrayInputStream(new byte[0]));
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (ORIGIN.equals(url.getScheme() + "://" + url.getHost())) return false;
                openExternal(url);
                return true;
            }
        });

        ads = new AdsController(this, web);
        web.addJavascriptInterface(new HostBridge(this, ads), "AndroidHost");
        web.loadUrl(GAME_URL);
        ads.start();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                web.evaluateJavascript("window.__androidHost ? window.__androidHost.back() : false", closed -> {
                    if (!"true".equals(closed)) moveTaskToBack(true);
                });
            }
        });
    }

    void onGameReady() { gameReady = true; }

    void openExternal(Uri url) {
        if (!"https".equals(url.getScheme())) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (ActivityNotFoundException ignored) {
        }
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onPause() {
        // tell the game first (it stops sound and the timer), then freeze the page
        web.evaluateJavascript("window.__androidHost && window.__androidHost.pause(true)", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.evaluateJavascript("window.__androidHost && window.__androidHost.pause(false)", null);
        hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        ads.destroy();
        web.destroy();
        super.onDestroy();
    }
}
