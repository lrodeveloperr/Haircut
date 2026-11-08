package com.worksbien.barbersimulatorasmr;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Google Play one-time products. The game grants first and this class acknowledges or consumes only afterwards. */
final class BillingController implements PurchasesUpdatedListener {
    // List.of/Set.of are Android API 30. Keep the declared API-26 floor real: this controller is initialized during
    // launch, so an unavailable collection factory would otherwise crash before the native loading handoff finishes.
    static final List<String> PRODUCTS = Collections.unmodifiableList(Arrays.asList(
            "coins_500", "coins_3000", "coins_7500", "coins_18000", "starter_pack", "supporter_bundle"));
    static final Set<String> CONSUMABLES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
            "coins_500", "coins_3000", "coins_7500", "coins_18000")));

    private final MainActivity activity;
    private final WebView web;
    private final SharedPreferences state;
    private final Map<String, ProductDetails> details = new HashMap<>();
    private final Map<String, Purchase> waiting = new HashMap<>();
    private final Set<String> owned = new HashSet<>();
    private BillingClient client;
    private boolean destroyed;
    private boolean ready;
    private boolean pageReady;
    private String activeProduct;

    BillingController(MainActivity activity, WebView web) {
        this.activity = activity;
        this.web = web;
        state = activity.getSharedPreferences("play-billing-v1", Context.MODE_PRIVATE);
        for (String id : PRODUCTS) if (!CONSUMABLES.contains(id) && state.getBoolean("owned:" + id, false)) owned.add(id);
    }

    void start() {
        client = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult result) {
                if (destroyed) return;
                ready = result.getResponseCode() == BillingClient.BillingResponseCode.OK;
                if (ready) refresh(); else publishCatalog();
            }
            @Override public void onBillingServiceDisconnected() { ready = false; }
        });
    }

    void pageReady() {
        pageReady = true;
        publishCatalog();
        if (ready) refresh();
    }

    void resume() { if (ready) queryPurchases(); }

    void refresh() {
        if (!ready || destroyed) { publishCatalog(); return; }
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (String id : PRODUCTS) products.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder().setProductList(products).build();
        client.queryProductDetailsAsync(params, (result, response) -> {
            if (destroyed) return;
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                details.clear();
                for (ProductDetails item : response.getProductDetailsList()) if (PRODUCTS.contains(item.getProductId())) details.put(item.getProductId(), item);
            }
            publishCatalog();
        });
        queryPurchases();
    }

    void buy(String productId) {
        if (destroyed || !ready || !PRODUCTS.contains(productId) || activeProduct != null) {
            publishDone(productId, false);
            return;
        }
        ProductDetails item = details.get(productId);
        ProductDetails.OneTimePurchaseOfferDetails offer = offer(item);
        if (item == null || offer == null) {
            refresh();
            publishDone(productId, false);
            return;
        }
        BillingFlowParams.ProductDetailsParams.Builder chosen = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(item);
        String offerToken = offer.getOfferToken();
        if (offerToken != null && !offerToken.isEmpty()) chosen.setOfferToken(offerToken);
        BillingFlowParams flow = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(chosen.build())).build();
        activeProduct = productId;
        BillingResult result = client.launchBillingFlow(activity, flow);
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            activeProduct = null;
            publishDone(productId, false);
        }
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (destroyed) return;
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) process(purchase);
            return;
        }
        if (activeProduct != null) {
            String id = activeProduct;
            activeProduct = null;
            publishDone(id, false);
        }
    }

    private void queryPurchases() {
        if (!ready || destroyed) return;
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build();
        client.queryPurchasesAsync(params, (result, purchases) -> {
            if (destroyed || result.getResponseCode() != BillingClient.BillingResponseCode.OK) return;
            for (Purchase purchase : purchases) process(purchase);
            publishCatalog();
        });
    }

    private void process(Purchase purchase) {
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            if (activeProduct != null && purchase.getProducts().contains(activeProduct)) {
                String id = activeProduct; activeProduct = null; publishDone(id, false);
            }
            return;
        }
        for (String productId : purchase.getProducts()) {
            if (!PRODUCTS.contains(productId)) continue;
            String done = state.getString(tokenKey(purchase.getPurchaseToken()), null);
            if (productId.equals(done)) {
                finish(productId, purchase);
                continue;
            }
            waiting.put(purchase.getPurchaseToken(), purchase);
            JSONObject payload = new JSONObject();
            try { payload.put("productId", productId).put("purchaseToken", purchase.getPurchaseToken()); }
            catch (Exception ignored) { continue; }
            evaluate("window.__androidHost&&window.__androidHost.billingPurchase(" + JSONObject.quote(payload.toString()) + ")");
        }
    }

    void complete(String productId, String purchaseToken, boolean granted) {
        if (destroyed || !PRODUCTS.contains(productId) || purchaseToken == null) return;
        Purchase purchase = waiting.remove(purchaseToken);
        if (purchase == null || !purchase.getProducts().contains(productId)) {
            publishDone(productId, false);
            return;
        }
        if (!granted || !state.edit().putString(tokenKey(purchaseToken), productId)
                .putBoolean("owned:" + productId, !CONSUMABLES.contains(productId)).commit()) {
            publishDone(productId, false);
            return;
        }
        if (!CONSUMABLES.contains(productId)) owned.add(productId);
        finish(productId, purchase);
    }

    private void finish(String productId, Purchase purchase) {
        if (CONSUMABLES.contains(productId)) {
            ConsumeParams params = ConsumeParams.newBuilder().setPurchaseToken(purchase.getPurchaseToken()).build();
            client.consumeAsync(params, (result, token) -> {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) publishDone(productId, true);
                else publishDone(productId, false);
                publishCatalog();
            });
        } else if (purchase.isAcknowledged()) {
            publishDone(productId, true);
            publishCatalog();
        } else {
            AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.getPurchaseToken()).build();
            client.acknowledgePurchase(params, result -> {
                publishDone(productId, result.getResponseCode() == BillingClient.BillingResponseCode.OK);
                publishCatalog();
            });
        }
    }

    private void publishCatalog() {
        if (!pageReady || destroyed) return;
        JSONObject prices = new JSONObject(), catalog = new JSONObject();
        JSONArray ownedJson = new JSONArray();
        try {
            for (String id : PRODUCTS) {
                ProductDetails.OneTimePurchaseOfferDetails offer = offer(details.get(id));
                if (offer != null && offer.getFormattedPrice() != null) prices.put(id, offer.getFormattedPrice());
            }
            for (String id : owned) ownedJson.put(id);
            catalog.put("prices", prices).put("owned", ownedJson);
        } catch (Exception ignored) { return; }
        evaluate("window.__androidHost&&window.__androidHost.billingCatalog(" + JSONObject.quote(catalog.toString()) + ")");
    }

    private void publishDone(String productId, boolean success) {
        if (productId != null && productId.equals(activeProduct)) activeProduct = null;
        evaluate("window.__androidHost&&window.__androidHost.billingDone(" + JSONObject.quote(productId == null ? "" : productId) + "," + success + ")");
    }

    private void evaluate(String script) {
        if (pageReady && !destroyed) web.evaluateJavascript(script, null);
    }

    private static ProductDetails.OneTimePurchaseOfferDetails offer(ProductDetails item) {
        if (item == null) return null;
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = item.getOneTimePurchaseOfferDetailsList();
        if (offers != null && !offers.isEmpty()) return offers.get(0);
        return item.getOneTimePurchaseOfferDetails();
    }

    private static String tokenKey(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder("fulfilled:");
            for (byte b : digest) out.append(String.format("%02x", b & 255));
            return out.toString();
        } catch (Exception e) { return "fulfilled:" + token; }
    }

    void destroy() {
        destroyed = true;
        waiting.clear(); details.clear();
        if (client != null) client.endConnection();
    }
}
