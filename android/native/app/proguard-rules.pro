# The page calls these through the WebView JavaScript interface.
-keepclassmembers class com.worksbien.barbersimulatorasmr.HostBridge {
    @android.webkit.JavascriptInterface <methods>;
}
