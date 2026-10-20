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
  Alert
} from "react-native";
import Header from "./src/components/Header";
import LoginScreen from "./src/components/LoginScreen";
import LaunchScreen from "./src/components/LaunchScreen";
import BottomNavBar from "./src/components/BottomNavBar";
import RetailerSelector from "./src/components/RetailerSelector";
import ProductCard from "./src/components/ProductCard";
import StoresScreen from "./src/components/StoresScreen";
import OrdersScreen from "./src/components/OrdersScreen";
import SyncScreen from "./src/components/SyncScreen";
import ProfileScreen from "./src/components/ProfileScreen";
import CartModal from "./src/components/CartModal";
import OrderSuccessModal from "./src/components/OrderSuccessModal";
import RecentOrdersModal from "./src/components/RecentOrdersModal";
import { COLORS } from "./src/theme/colors";
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
  // Navigation Tabs: 'catalog' | 'stores' | 'orders' | 'sync' | 'profile'
  const [activeTab, setActiveTab] = useState("catalog");

  // Splash & Entry Screen State
  const [showSplash, setShowSplash] = useState(true);

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
      setActiveTab("catalog");
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
  const handleUpdateQty = (productId, qty, forceRemove = false) => {
    if (forceRemove) {
      setCartQuantities(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }
    const num = Number(qty);
    setCartQuantities(prev => ({
      ...prev,
      [productId]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleRemoveFromCart = (productId) => {
    setCartQuantities(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleCloseCart = () => {
    setCartQuantities(prev => {
      const next = {};
      Object.keys(prev).forEach(k => {
        if (Number(prev[k]) > 0) next[k] = prev[k];
      });
      return next;
    });
    setCartModalVisible(false);
  };

  // Edit Order Handler
  const handleEditOrder = (order) => {
    const matchedRetailer =
      retailers.find(r => String(r.id) === String(order.retailer_id)) ||
      retailers.find(r => r.shop_name === order.retailer_name);
    if (matchedRetailer) {
      setSelectedRetailer(matchedRetailer);
    }

    if (order.beat_name) {
      setCurrentBeat(order.beat_name);
    }

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
    setEditingOrder(order);
    setActiveTab("catalog");
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
        let prod = products.find(p => String(p.id) === String(id));
        if (!prod && editingOrder && Array.isArray(editingOrder.items)) {
          const foundInOrder = editingOrder.items.find(it => String(it.product_id || it.id) === String(id));
          if (foundInOrder) {
            prod = {
              id: foundInOrder.product_id || foundInOrder.id,
              name: foundInOrder.item_name || foundInOrder.name,
              selling_rate: foundInOrder.rate || foundInOrder.selling_rate,
              rate: foundInOrder.rate || foundInOrder.selling_rate,
              mrp: foundInOrder.mrp,
              tax_rate: foundInOrder.tax_rate,
              unit: foundInOrder.unit || "PCS"
            };
          }
        }
        if (!prod) return null;
        return {
          ...prod,
          quantity: cartQuantities[id]
        };
      })
      .filter(Boolean);
  }, [cartQuantities, products, editingOrder]);

  const orderTotals = useMemo(() => {
    return calculateOrderTotals(cartItems);
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return Object.values(cartQuantities).reduce((acc, q) => acc + (Number(q) || 0), 0);
  }, [cartQuantities]);

  // Submit order handler
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

      if (editingOrder) {
        await markOrderAsRevised(editingOrder.order_number, result.orderNumber);
        setEditingOrder(null);
      }

      setCartQuantities({});
      setCartModalVisible(false);
      setOrderResult(result);
      setSuccessModalVisible(true);

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

  // Launch / Welcome Screen on App Startup
  if (showSplash) {
    return (
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <LaunchScreen
            isLoading={isCheckingAuth}
            onFinish={() => setShowSplash(false)}
          />
        </SafeAreaView>
      </View>
    );
  }

  // If salesman not logged in, render LoginScreen
  if (!currentSalesman) {
    return (
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
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
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Clean, Decent Top Header without Crowded Icons or Hamburger */}
        <Header
          currentSalesman={currentSalesman}
          beats={beats}
          currentBeat={currentBeat}
          onSelectBeat={handleSelectBeat}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={handleToggleOfflineMode}
          offlineQueueCount={offlineQueueCount}
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

        {/* Main Tab Screen Content */}
        <View style={styles.tabContentContainer}>
          {/* TAB 1: PRODUCT CATALOG & DIRECT ORDERING */}
          {activeTab === "catalog" && (
            <View style={styles.catalogTab}>
              {/* Retailer Selector Card */}
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
                    placeholder="Search biscuits, soaps, spices, SKU..."
                    placeholderTextColor={COLORS.textLight}
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

              {/* Product List */}
              <FlatList
                data={filteredProducts}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={[
                  styles.listContainer,
                  cartItems.length > 0 && { paddingBottom: 110 }
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
                    <Text style={styles.emptyIcon}>🌾</Text>
                    <Text style={styles.emptyTitle}>कोणतेही उत्पादन सापडले नाही</Text>
                    <Text style={styles.emptySubtitle}>No matching products. Try another search or category.</Text>
                  </View>
                }
                ListFooterComponent={
                  <View style={styles.catalogFooter}>
                    <View style={styles.footerBrandRow}>
                      <Text style={styles.footerBrandName}>GaavBilling</Text>
                      <Text style={styles.footerBrandDot}>•</Text>
                      <Text style={styles.footerBrandMarathi}>गाव बिलिंग</Text>
                    </View>
                    <Text style={styles.footerDistrict}>
                      सुलभ FMCG वितरण • Nashik District & Rural Network
                    </Text>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerCredit}>
                      Developed with pride by <Text style={styles.footerAuthor}>Om Vilas Shinde</Text>
                    </Text>
                  </View>
                }
              />

              {/* Floating Bottom Cart Bar (Positioned above Instagram bottom nav) */}
              {cartItems.length > 0 && (
                <View style={styles.floatingCartBar}>
                  <View style={styles.cartBarInfo}>
                    <View style={styles.cartCountBadge}>
                      <Text style={styles.cartCountText}>{totalCartCount}</Text>
                    </View>
                    <View>
                      <Text style={styles.cartBarLabel}>
                        {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} • Total
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
                      {editingOrder ? "REVISION CHECKOUT ➔" : "ORDER SUMMARY ➔"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: KIRANA STORES DIRECTORY */}
          {activeTab === "stores" && (
            <StoresScreen
              retailers={retailers}
              selectedRetailer={selectedRetailer}
              onSelectRetailer={setSelectedRetailer}
              currentBeat={currentBeat}
              onStartOrder={() => setActiveTab("catalog")}
            />
          )}

          {/* TAB 3: ORDERS HISTORY & REVISION */}
          {activeTab === "orders" && (
            <OrdersScreen
              orders={recentOrders}
              onEditOrder={handleEditOrder}
              onSyncOffline={handleSyncOffline}
              isSyncing={isSyncingOffline}
              onStartNewOrder={() => setActiveTab("catalog")}
            />
          )}

          {/* TAB 4: REAL-TIME CLOUD & OFFLINE SYNC */}
          {activeTab === "sync" && (
            <SyncScreen
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={handleToggleOfflineMode}
              offlineQueueCount={offlineQueueCount}
              onSyncOffline={handleSyncOffline}
              isSyncing={isSyncingOffline}
              orders={recentOrders}
            />
          )}

          {/* TAB 5: SALESMAN PROFILE & PERFORMANCE */}
          {activeTab === "profile" && (
            <ProfileScreen
              salesman={currentSalesman}
              salesmen={salesmen}
              onSelectSalesman={setCurrentSalesman}
              beats={beats}
              currentBeat={currentBeat}
              onSelectBeat={handleSelectBeat}
              orders={recentOrders}
              onLogout={handleLogout}
            />
          )}
        </View>

        {/* Instagram-Style Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={totalCartCount}
          pendingSyncCount={offlineQueueCount}
        />

        {/* Review & Submit Cart Modal */}
        <CartModal
          visible={cartModalVisible}
          onClose={handleCloseCart}
          cartItems={cartItems}
          retailer={selectedRetailer}
          salesman={currentSalesman}
          beat={currentBeat}
          totals={orderTotals}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveFromCart}
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

        {/* Recent Orders Modal (kept for backward compatibility or quick view) */}
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
    backgroundColor: Platform.OS === "web" ? "#0D2018" : COLORS.background,
    alignItems: "center",
    justifyContent: "center"
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    backgroundColor: COLORS.background,
    position: "relative",
    ...(Platform.OS === "web" ? {
      boxShadow: "0 20px 35px -5px rgba(0, 20, 10, 0.45), 0 8px 16px -6px rgba(0, 0, 0, 0.3)",
      overflow: "hidden"
    } : {})
  },
  tabContentContainer: {
    flex: 1
  },
  catalogTab: {
    flex: 1,
    position: "relative"
  },
  editingBanner: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A"
  },
  editingBannerLeft: {
    flex: 1,
    marginRight: 8
  },
  editingBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E"
  },
  editingBannerSub: {
    fontSize: 11,
    color: "#B45309",
    marginTop: 1
  },
  cancelEditBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  cancelEditBtnText: {
    fontSize: 11,
    color: "#B91C1C",
    fontWeight: "700"
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
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: "500"
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.textLight,
    paddingHorizontal: 6
  },
  categoryBar: {
    paddingVertical: 6,
    backgroundColor: COLORS.background
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  categoryPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeCategoryPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted
  },
  activeCategoryText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center"
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  catalogFooter: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 8
  },
  footerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  footerBrandName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary
  },
  footerBrandDot: {
    color: COLORS.accentGold,
    fontWeight: "900"
  },
  footerBrandMarathi: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accentGold
  },
  footerDistrict: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 10
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 10
  },
  footerCredit: {
    fontSize: 11,
    color: COLORS.textLight
  },
  footerAuthor: {
    fontWeight: "700",
    color: COLORS.primaryLight
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 14,
    zIndex: 90
  },
  cartBarInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  cartCountBadge: {
    backgroundColor: COLORS.accentGold,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  cartCountText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  cartBarLabel: {
    fontSize: 11,
    color: COLORS.primarySoft,
    fontWeight: "600"
  },
  cartBarTotal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff"
  },
  viewCartButton: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: COLORS.accentGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  viewCartText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5
  }
});
