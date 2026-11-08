package com.worksbien.barbersimulatorasmr;

import android.annotation.SuppressLint;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.LinearInterpolator;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.core.content.FileProvider;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Hosts the game's web build (bundled in assets/game, served offline from the app's own origin) in a
 * full-screen WebView. Native transport provides storage and ads; outside game requests are refused.
 */
public class MainActivity extends ComponentActivity {
    static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String GAME_URL = ORIGIN + "/assets/game/index.html";
    private static final String PLAY_URL = "https://play.google.com/store/apps/details?id=com.worksbien.barbersimulatorasmr";
    private static final int BANNER_SURFACE = Color.rgb(13, 63, 134);

    private WebView web;
    private FrameLayout bannerSlot;
    private FrameLayout nativeLoading;
    private ObjectAnimator nativeLoadingSpinner;
    private ReviewController reviews;
    private AdsController ads;
    private BillingController billing;
    private HostBridge host;
    private volatile boolean loadingSurfaceReady;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        // Apply immersive edge-to-edge flags before Activity creation swaps the platform starting window for the
        // post-splash theme. Waiting until setContentView leaves a brief status/navigation-bar flash on API 36.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        hideSystemBars();
        super.onCreate(savedInstanceState);
        // Android's platform splash is icon-free and remains only until our simple cream native loading surface is
        // attached. The player then sees the moving native spinner while the WebView prepares Home.
        splash.setKeepOnScreenCondition(() -> !loadingSurfaceReady);

        // Draw the game background edge to edge. The page has viewport-fit=cover and every control surface applies
        // env(safe-area-inset-*), so controls remain clear of cutouts without turning those insets into dark bands.
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#2b1e17"));

        // The game on top; below it a reserved banner strip: a 16dp gap that takes and ignores every touch (so a tap
        // meant for the game's bottom controls can never land on the ad), then the adaptive banner at a fixed height
        // that never changes while an ad loads, fails or refreshes.
        LinearLayout column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#2b1e17"));
        column.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        View gap = new View(this);
        // Navy is the menu's own lower-edge colour, so an offline/no-fill banner remains a deliberate game surface
        // instead of an unexplained black block. A loaded AdView paints over the slot normally.
        gap.setBackgroundColor(BANNER_SURFACE);
        gap.setClickable(true);
        gap.setOnTouchListener((v, e) -> true);
        gap.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO);
        column.addView(gap, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Math.round(16 * getResources().getDisplayMetrics().density)));
        bannerSlot = new FrameLayout(this);
        bannerSlot.setBackgroundColor(BANNER_SURFACE);
        column.addView(bannerSlot, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0));
        root.addView(column, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        attachNativeLoading(root);
        setContentView(root);
        loadingSurfaceReady = true;
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

        ads = new AdsController(this, web, bannerSlot);
        reviews = new ReviewController(this, web, ads);
        billing = new BillingController(this, web);
        host = new HostBridge(this, ads, reviews, billing, web);
        web.addJavascriptInterface(host, "AndroidHost");
        web.loadUrl(GAME_URL);
        ads.start();
        billing.start();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                web.evaluateJavascript("window.__androidHost ? window.__androidHost.back() : false", closed -> {
                    if (!"true".equals(closed)) moveTaskToBack(true);
                });
            }
        });
    }

    void onHomeReady() {
        runOnUiThread(() -> {
            if (isFinishing() || isDestroyed()) return;
            FrameLayout loading = nativeLoading;
            if (loading == null) return;
            nativeLoading = null;
            loading.animate().alpha(0f).setDuration(180).withEndAction(() -> {
                stopNativeLoadingSpinner();
                ViewGroup parent = (ViewGroup) loading.getParent();
                if (parent != null) parent.removeView(loading);
            }).start();
        });
    }

    private void attachNativeLoading(FrameLayout root) {
        nativeLoading = new FrameLayout(this);
        nativeLoading.setBackgroundColor(Color.rgb(255, 246, 230));
        nativeLoading.setClickable(true);
        nativeLoading.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);

        ImageView spinner = new ImageView(this);
        spinner.setImageResource(R.drawable.loading_spinner_ring);
        FrameLayout.LayoutParams spinnerLayout = new FrameLayout.LayoutParams(dp(52), dp(52), Gravity.CENTER);
        nativeLoading.addView(spinner, spinnerLayout);

        nativeLoadingSpinner = ObjectAnimator.ofFloat(spinner, View.ROTATION, 0f, 360f);
        nativeLoadingSpinner.setDuration(850L);
        nativeLoadingSpinner.setInterpolator(new LinearInterpolator());
        nativeLoadingSpinner.setRepeatCount(ValueAnimator.INFINITE);
        nativeLoadingSpinner.start();

        root.addView(nativeLoading, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void stopNativeLoadingSpinner() {
        ObjectAnimator spinner = nativeLoadingSpinner;
        nativeLoadingSpinner = null;
        if (spinner != null) spinner.cancel();
    }

    void openPrivacy() {
        // Policy text is maintained on the website, never bundled or displayed inside the game.
        openExternal(Uri.parse("https://worksbienstudios.com/apps/barber-simulator-asmr/privacy/"));
    }

    Uri createShareImage(String dataUrl) {
        final String prefix = "data:image/jpeg;base64,";
        if (dataUrl == null || !dataUrl.startsWith(prefix)) return null;
        String encoded = dataUrl.substring(prefix.length());
        if (encoded.length() == 0 || encoded.length() > 8 * 1024 * 1024) return null;
        try {
            byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
            if (bytes.length == 0 || bytes.length > 6 * 1024 * 1024) return null;
            File directory = new File(getCacheDir(), "shared");
            if (!directory.exists() && !directory.mkdirs()) return null;
            File file = new File(directory, "haircut-share.jpg");
            try (FileOutputStream stream = new FileOutputStream(file, false)) {
                stream.write(bytes);
            }
            return FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);
        } catch (IllegalArgumentException | IOException ignored) {
            return null;
        }
    }

    void openShareSheet(Uri image) {
        // Android supplies and localizes the native Sharesheet. The image is the current finished haircut;
        // the Play Store URL travels with it for apps that accept both media and a caption.
        Intent send = new Intent(Intent.ACTION_SEND)
                .setType(image == null ? "text/plain" : "image/jpeg")
                .putExtra(Intent.EXTRA_TITLE, getString(R.string.app_name))
                .putExtra(Intent.EXTRA_TEXT, PLAY_URL);
        if (image != null) {
            send.putExtra(Intent.EXTRA_STREAM, image);
            send.setClipData(ClipData.newRawUri(getString(R.string.app_name), image));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        }
        try {
            startActivity(Intent.createChooser(send, null));
        } catch (ActivityNotFoundException ignored) {
        }
    }

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
        if (ads != null) ads.pause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (ads != null) ads.resume();
        if (billing != null) billing.resume();
        web.evaluateJavascript("window.__androidHost && window.__androidHost.pause(false)", null);
        hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        stopNativeLoadingSpinner();
        host.destroy();
        billing.destroy();
        reviews.destroy();
        ads.destroy();
        web.destroy();
        super.onDestroy();
    }
}
