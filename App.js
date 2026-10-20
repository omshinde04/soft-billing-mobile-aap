import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import Header from "./src/components/Header";
import LoginScreen from "./src/components/LoginScreen";
import RetailerSelector from "./src/components/RetailerSelector";
import ProductCard from "./src/components/ProductCard";
import CartModal from "./src/components/CartModal";
import OrderSuccessModal from "./src/components/OrderSuccessModal";
import RecentOrdersModal from "./src/components/RecentOrdersModal";
import {
  fetchCatalogFromCloud,
  getActiveSession,
  clearActiveSession
} from "./src/services/catalogService";
import {
  calculateOrderTotals,
  sendOrder,
  flushOfflineQueue,
  getRecentOrders,
  setSimulatedOfflineMode,
  getOfflineQueueCount,
  markOrderAsRevised
} from "./src/services/orderService";

export default function App() {
  // Authentication & Session
  const [currentSalesman, setCurrentSalesman] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Catalog Master state
  const [salesmen, setSalesmen] = useState([]);
  const [beats, setBeats] = useState([]);
  const [currentBeat, setCurrentBeat] = useState("");
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [products, setProducts] = useState([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart state: map of productId -> quantity
  const [cartQuantities, setCartQuantities] = useState({});

  // Order Editing state
  const [editingOrder, setEditingOrder] = useState(null);

  // Modals
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [recentModalVisible, setRecentModalVisible] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Network & Sync status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // 1. Initial Load: Auth check and catalog prefetch
  useEffect(() => {
    async function init() {
      try {
        const session = await getActiveSession();
        if (session) {
          setCurrentSalesman(session);
          if (session.assigned_beat) {
            setCurrentBeat(session.assigned_beat);
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        setIsCheckingAuth(false);
      }

      await loadCatalogData();
      await loadRecentOrdersList();
      await checkQueueCount();
    }
    init();
  }, []);

  const checkQueueCount = async () => {
    const count = await getOfflineQueueCount();
    setOfflineQueueCount(count);
  };

  const triggerAutoSync = async () => {
    const count = await getOfflineQueueCount();
    if (count > 0) {
      const res = await flushOfflineQueue();
      if (res.flushed > 0) {
        await loadRecentOrdersList();
        await checkQueueCount();
      }
    } else {
      setOfflineQueueCount(0);
    }
  };

  const handleToggleOfflineMode = async () => {
    const next = !isOfflineMode;
    setIsOfflineMode(next);
    setSimulatedOfflineMode(next);
    if (!next) {
      await triggerAutoSync();
    }
  };

  // Periodic auto-sync when online
  useEffect(() => {
    checkQueueCount();
    const interval = setInterval(() => {
      if (!isOfflineMode) {
        triggerAutoSync();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isOfflineMode]);

  const loadCatalogData = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchCatalogFromCloud();
      setSalesmen(data.salesmen || []);
      setBeats(data.beats || []);
      setRetailers(data.retailers || []);
      setProducts(data.products || []);

      if (!currentBeat && data.beats?.length > 0) {
        setCurrentBeat(data.beats[0]);
      }

      if (!selectedRetailer && data.retailers?.length > 0) {
        const matching = data.retailers.find(r => !currentBeat || r.beat_name === currentBeat);
        setSelectedRetailer(matching || data.retailers[0]);
      }
    } catch (err) {
      console.error("Failed loading catalog", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadRecentOrdersList = async () => {
    const list = await getRecentOrders();
    setRecentOrders(list);
  };

  // Auth Handlers
  const handleLoginSuccess = (salesman) => {
    setCurrentSalesman(salesman);
    if (salesman.assigned_beat) {
      setCurrentBeat(salesman.assigned_beat);
      const retailerOnBeat = retailers.find(r => r.beat_name === salesman.assigned_beat);
      if (retailerOnBeat) {
        setSelectedRetailer(retailerOnBeat);
      }
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      await clearActiveSession();
      setCurrentSalesman(null);
      setCartQuantities({});
      setEditingOrder(null);
    };

    if (Platform.OS === "web") {
      if (window.confirm("Logout from Salesman Account?")) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out from this device?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: performLogout }
        ]
      );
    }
  };

  // Switch beat also selects first retailer of that beat
  const handleSelectBeat = (beat) => {
    setCurrentBeat(beat);
    const retailerOnBeat = retailers.find(r => r.beat_name === beat);
    if (retailerOnBeat) {
      setSelectedRetailer(retailerOnBeat);
    }
  };

  // Stepper & Direct Numeric Quantity handlers
  const handleIncrement = (productId) => {
    setCartQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleDecrement = (productId) => {
    setCartQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: current - 1
      };
    });
  };

  // Real-time direct quantity update
  const handleUpdateQty = (productId, qty) => {
    const num = Number(qty);
    if (isNaN(num) || num <= 0) {
      setCartQuantities(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: num
      }));
    }
  };

  // Edit Order Handler
  const handleEditOrder = (order) => {
    // 1. Match retailer
    const matchedRetailer =
      retailers.find(r => String(r.id) === String(order.retailer_id)) ||
      retailers.find(r => r.shop_name === order.retailer_name);
    if (matchedRetailer) {
      setSelectedRetailer(matchedRetailer);
    }

    // 2. Set beat
    if (order.beat_name) {
      setCurrentBeat(order.beat_name);
    }

    // 3. Populate cart quantities
    const newCart = {};
    if (Array.isArray(order.items)) {
      order.items.forEach(it => {
        const prodId = it.product_id || it.id;
        if (prodId) {
          newCart[prodId] = Number(it.quantity || 1);
        }
      });
    }
    setCartQuantities(newCart);

    // 4. Mark editing state & open cart review directly for fast adjustment
    setEditingOrder(order);
    setRecentModalVisible(false);
    setCartModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setCartQuantities({});
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart items & totals calculation
  const cartItems = useMemo(() => {
    return Object.keys(cartQuantities)
      .map(id => {
        const prod = products.find(p => String(p.id) === String(id));
        if (!prod) return null;
        return {
          ...prod,
          quantity: cartQuantities[id]
        };
      })
      .filter(item => item && item.quantity > 0);
  }, [cartQuantities, products]);

  const orderTotals = useMemo(() => {
    return calculateOrderTotals(cartItems);
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return Object.values(cartQuantities).reduce((acc, q) => acc + (Number(q) || 0), 0);
  }, [cartQuantities]);

  // Submit order handler (handles both fresh and revised orders)
  const handleSubmitOrder = async ({ notes }) => {
    setIsSubmitting(true);
    try {
      const finalNotes = editingOrder
        ? (notes ? `${notes} | ` : "") + `[Revised Order from #${editingOrder.order_number}]`
        : notes;

      const result = await sendOrder({
        salesman_name: currentSalesman?.name,
        salesman_phone: currentSalesman?.phone,
        beat_name: currentBeat || selectedRetailer?.beat_name,
        retailer_id: selectedRetailer?.id,
        retailer_name: selectedRetailer?.shop_name,
        retailer_phone: selectedRetailer?.phone,
        retailer_address: selectedRetailer?.address,
        notes: finalNotes,
        replaces_order_number: editingOrder ? editingOrder.order_number : null,
        is_revision: !!editingOrder,
        subtotal_taxable: orderTotals.subtotal_taxable,
        total_cgst: orderTotals.total_cgst,
        total_sgst: orderTotals.total_sgst,
        grand_total: orderTotals.grand_total,
        items: orderTotals.items
      });

      // If we were revising a previous order, mark the old one as revised
      if (editingOrder) {
        await markOrderAsRevised(editingOrder.order_number, result.orderNumber);
        setEditingOrder(null);
      }

      // Clear cart
      setCartQuantities({});
      setCartModalVisible(false);

      // Show success modal
      setOrderResult(result);
      setSuccessModalVisible(true);

      // Refresh recent orders & queue
      await loadRecentOrdersList();
      await checkQueueCount();
    } catch (err) {
      alert("Failed submitting order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncOffline = async () => {
    setIsSyncingOffline(true);
    try {
      const res = await flushOfflineQueue();
      alert("Offline sync completed! Pushed " + res.flushed + " orders to Desktop.");
      await loadRecentOrdersList();
      await checkQueueCount();
    } catch (e) {
      alert("Sync error: " + e.message);
    } finally {
      setIsSyncingOffline(false);
    }
  };

  // If checking authentication session on launch
  if (isCheckingAuth) {
    return (
      <View style={[styles.outerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={{ color: "#ffffff", marginTop: 12, fontWeight: "700" }}>
          Loading Billing-Soft...
        </Text>
      </View>
    );
  }

  // If salesman not logged in, render LoginScreen
  if (!currentSalesman) {
    return (
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
          <LoginScreen
            salesmen={salesmen}
            onLoginSuccess={handleLoginSuccess}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

        {/* Header with Salesman Profile, Beat Selector & Logout */}
        <Header
          salesmen={salesmen}
          currentSalesman={currentSalesman}
          onSelectSalesman={setCurrentSalesman}
          beats={beats}
          currentBeat={currentBeat}
          onSelectBeat={handleSelectBeat}
          onOpenRecent={() => setRecentModalVisible(true)}
          onRefreshCatalog={loadCatalogData}
          isRefreshing={isRefreshing}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={handleToggleOfflineMode}
          offlineQueueCount={offlineQueueCount}
          onLogout={handleLogout}
        />

        {/* Editing Order Notice Banner */}
        {editingOrder && (
          <View style={styles.editingBanner}>
            <View style={styles.editingBannerLeft}>
              <Text style={styles.editingBannerTitle}>
                ✏️ Revising Order #{editingOrder.order_number}
              </Text>
              <Text style={styles.editingBannerSub}>
                {editingOrder.retailer_name} • Make changes & re-dispatch
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelEditBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Offline Alert Banner */}
        {offlineQueueCount > 0 && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              📦 {offlineQueueCount} {offlineQueueCount === 1 ? "order" : "orders"} stored in phone (Basement Mode)
            </Text>
            <TouchableOpacity
              style={styles.syncNowBtn}
              onPress={async () => {
                setIsSyncingOffline(true);
                const res = await flushOfflineQueue();
                setIsSyncingOffline(false);
                await checkQueueCount();
                await loadRecentOrdersList();
                if (res.flushed > 0) {
                  alert("⚡ Sent " + res.flushed + " offline orders to Desktop!");
                }
              }}
            >
              <Text style={styles.syncNowBtnText}>SYNC NOW ⚡</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Retailer Selector Bar */}
        <RetailerSelector
          retailers={retailers}
          selectedRetailer={selectedRetailer}
          onSelectRetailer={setSelectedRetailer}
          currentBeat={currentBeat}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search biscuits, chocolates, soaps, SKU..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.activeCategoryPill]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, isSelected && styles.activeCategoryText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Catalog List with Direct Quantity Input */}
        <FlatList
          data={filteredProducts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[
            styles.listContainer,
            cartItems.length > 0 && { paddingBottom: 100 }
          ]}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              quantity={cartQuantities[item.id] || 0}
              onIncrement={() => handleIncrement(item.id)}
              onDecrement={() => handleDecrement(item.id)}
              onSetQuantity={handleUpdateQty}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySubtitle}>Try searching for another FMCG brand or category.</Text>
            </View>
          }
        />

        {/* Floating Bottom Cart Bar */}
        {cartItems.length > 0 && (
          <View style={styles.floatingCartBar}>
            <View style={styles.cartBarInfo}>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{totalCartCount}</Text>
              </View>
              <View>
                <Text style={styles.cartBarLabel}>
                  {cartItems.length} {cartItems.length === 1 ? "Product" : "Products"} Added
                </Text>
                <Text style={styles.cartBarTotal}>₹{orderTotals.grand_total.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => setCartModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.viewCartText}>
                {editingOrder ? "REVIEW REVISION ⚡" : "VIEW ORDER ⚡"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review & Submit Cart Modal */}
        <CartModal
          visible={cartModalVisible}
          onClose={() => setCartModalVisible(false)}
          cartItems={cartItems}
          retailer={selectedRetailer}
          salesman={currentSalesman}
          beat={currentBeat}
          totals={orderTotals}
          onUpdateQty={handleUpdateQty}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={isSubmitting}
          editingOrder={editingOrder}
        />

        {/* Success Celebration Modal */}
        <OrderSuccessModal
          visible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          result={orderResult}
        />

        {/* Recent Orders Modal with Edit & Re-send Action */}
        <RecentOrdersModal
          visible={recentModalVisible}
          onClose={() => setRecentModalVisible(false)}
          orders={recentOrders}
          onSyncOffline={handleSyncOffline}
          isSyncing={isSyncingOffline}
          onEditOrder={handleEditOrder}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#0f172a" : "#f8fafc",
    alignItems: "center",
    justifyContent: "center"
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#f8fafc",
    position: "relative",
    ...(Platform.OS === "web" ? {
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
      overflow: "hidden"
    } : {})
  },
  editingBanner: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a"
  },
  editingBannerLeft: {
    flex: 1,
    marginRight: 8
  },
  editingBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400e"
  },
  editingBannerSub: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 1
  },
  cancelEditBtn: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  cancelEditBtnText: {
    fontSize: 11,
    color: "#b91c1c",
    fontWeight: "700"
  },
  offlineBanner: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a"
  },
  offlineBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    flex: 1,
    marginRight: 8
  },
  syncNowBtn: {
    backgroundColor: "#d97706",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  syncNowBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900"
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a"
  },
  clearSearchText: {
    fontSize: 14,
    color: "#94a3b8",
    paddingHorizontal: 6
  },
  categoryBar: {
    paddingVertical: 6,
    backgroundColor: "#f8fafc"
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  categoryPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  activeCategoryPill: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b"
  },
  activeCategoryText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center"
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748b"
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10
  },
  cartBarInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  cartCountBadge: {
    backgroundColor: "#f59e0b",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  cartCountText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900"
  },
  cartBarLabel: {
    fontSize: 11,
    color: "#94a3b8"
  },
  cartBarTotal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff"
  },
  viewCartButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  viewCartText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5
  }
});
