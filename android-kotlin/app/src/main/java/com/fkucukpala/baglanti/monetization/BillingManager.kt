package com.fkucukpala.baglanti.monetization

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.data.GameStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class ShopProduct(val id: String, val hints: Int, val price: String)

data class BillingState(
    val connected: Boolean = false,
    val hintPacks: List<ShopProduct> = emptyList(),
    val removeAdsPrice: String? = null,
    /** Satın alma akışı süren ürün. */
    val buying: String? = null,
    val error: String? = null,
)

/** Google Play'den ipucu paketleri (tüketilebilir) ve "Reklamları kaldır" (tek seferlik). */
class BillingManager(context: Context, private val store: GameStore) : PurchasesUpdatedListener {
    private val _state = MutableStateFlow(BillingState())
    val state: StateFlow<BillingState> = _state.asStateFlow()

    private val details = mutableMapOf<String, ProductDetails>()

    private val client = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
        .enableAutoServiceReconnection()
        .build()

    fun start() {
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode != BillingClient.BillingResponseCode.OK) return
                _state.update { it.copy(connected = true) }
                queryProducts()
                restore()
            }

            override fun onBillingServiceDisconnected() {
                _state.update { it.copy(connected = false) }
            }
        })
    }

    private fun queryProducts() {
        val ids = Config.HINT_PRODUCTS.keys + Config.REMOVE_ADS_PRODUCT
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                ids.map {
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(it)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()
                },
            )
            .build()
        client.queryProductDetailsAsync(params) { result, productDetailsResult ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) return@queryProductDetailsAsync
            val list = productDetailsResult.productDetailsList
            list.forEach { details[it.productId] = it }
            fun price(id: String) = details[id]?.oneTimePurchaseOfferDetails?.formattedPrice
            _state.update { s ->
                s.copy(
                    hintPacks = Config.HINT_PRODUCTS.mapNotNull { (id, hints) -> price(id)?.let { ShopProduct(id, hints, it) } },
                    removeAdsPrice = price(Config.REMOVE_ADS_PRODUCT),
                )
            }
        }
    }

    fun buy(activity: Activity, productId: String) {
        val d = details[productId] ?: return
        _state.update { it.copy(buying = productId, error = null) }
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build()))
            .build()
        val result = client.launchBillingFlow(activity, params)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            _state.update { it.copy(buying = null, error = "Satın alma başlatılamadı.") }
        }
    }

    /** Tamamlanmamış satın almaları ve daha önce alınmış "Reklamları kaldır"ı geri yükler. */
    fun restore() {
        val params = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build()
        client.queryPurchasesAsync(params) { result, purchases ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) purchases.forEach(::handle)
        }
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        _state.update { it.copy(buying = null) }
        when (result.responseCode) {
            BillingClient.BillingResponseCode.OK -> purchases?.forEach(::handle)
            BillingClient.BillingResponseCode.USER_CANCELED -> Unit
            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> restore()
            else -> _state.update { it.copy(error = "Satın alma tamamlanamadı. Lütfen tekrar dene.") }
        }
    }

    // Ödeme onaylanınca önce hakkı kaydet, sonra işlemi tamamla. Tamamlama başarısız olursa
    // satın alma tekrar gelir; grantPurchase ikinci kez eklemez, reklamsız bayrağı zaten açıktır.
    private fun handle(purchase: Purchase) {
        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) return
        for (productId in purchase.products) {
            if (productId == Config.REMOVE_ADS_PRODUCT) {
                store.setAdsRemoved()
                if (!purchase.isAcknowledged) {
                    val ack = AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                    client.acknowledgePurchase(ack) {}
                }
            } else {
                val hints = Config.HINT_PRODUCTS[productId] ?: continue
                store.grantPurchase(purchase.purchaseToken, hints * purchase.quantity)
                val consume = ConsumeParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                client.consumeAsync(consume) { _, _ -> }
            }
        }
    }
}
