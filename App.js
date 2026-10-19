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
import RetailerSelector from "./src/components/RetailerSelector";
import ProductCard from "./src/components/ProductCard";
import CartModal from "./src/components/CartModal";
import OrderSuccessModal from "./src/components/OrderSuccessModal";
import RecentOrdersModal from "./src/components/RecentOrdersModal";
import { fetchCatalogFromCloud } from "./src/services/catalogService";
import {
  calculateOrderTotals,
  sendOrder,
  flushOfflineQueue,
  getRecentOrders
} from "./src/services/orderService";

export default function App() {
  // Master state
  const [salesmen, setSalesmen] = useState([]);
  const [currentSalesman, setCurrentSalesman] = useState(null);
  const [beats, setBeats] = useState([]);
  const [currentBeat, setCurrentBeat] = useState("");
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [products, setProducts] = useState([]);

  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart state: map of productId -> quantity
  const [cartQuantities, setCartQuantities] = useState({});

  // Modals
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [recentModalVisible, setRecentModalVisible] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Loading & status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  // Initial load
  useEffect(() => {
    loadCatalogData();
    loadRecentOrdersList();
  }, []);

  const loadCatalogData = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchCatalogFromCloud();
      setSalesmen(data.salesmen || []);
      if (!currentSalesman && data.salesmen?.length > 0) {
        setCurrentSalesman(data.salesmen[0]);
      }
      setBeats(data.beats || []);
      if (!currentBeat && data.beats?.length > 0) {
        setCurrentBeat(data.beats[0]);
      }
      setRetailers(data.retailers || []);
      if (!selectedRetailer && data.retailers?.length > 0) {
        setSelectedRetailer(data.retailers[0]);
      }
      setProducts(data.products || []);
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

  // Switch beat also selects first retailer of that beat
  const handleSelectBeat = (beat) => {
    setCurrentBeat(beat);
    const retailerOnBeat = retailers.find(r => r.beat_name === beat);
    if (retailerOnBeat) {
      setSelectedRetailer(retailerOnBeat);
    }
  };

  // Stepper handlers
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

  const handleUpdateQty = (productId, qty) => {
    if (qty <= 0) {
      setCartQuantities(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: qty
      }));
    }
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
      .filter(Boolean);
  }, [cartQuantities, products]);

  const orderTotals = useMemo(() => {
    return calculateOrderTotals(cartItems);
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return Object.values(cartQuantities).reduce((acc, q) => acc + q, 0);
  }, [cartQuantities]);

  // Submit order handler
  const handleSubmitOrder = async ({ notes }) => {
    setIsSubmitting(true);
    try {
      const result = await sendOrder({
        salesman_name: currentSalesman?.name,
        salesman_phone: currentSalesman?.phone,
        beat_name: currentBeat || selectedRetailer?.beat_name,
        retailer_id: selectedRetailer?.id,
        retailer_name: selectedRetailer?.shop_name,
        retailer_phone: selectedRetailer?.phone,
        retailer_address: selectedRetailer?.address,
        notes,
        subtotal_taxable: orderTotals.subtotal_taxable,
        total_cgst: orderTotals.total_cgst,
        total_sgst: orderTotals.total_sgst,
        grand_total: orderTotals.grand_total,
        items: orderTotals.items
      });

      // Clear cart
      setCartQuantities({});
      setCartModalVisible(false);

      // Show success modal
      setOrderResult(result);
      setSuccessModalVisible(true);

      // Refresh recent orders
      loadRecentOrdersList();
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
      alert("Offline sync completed! Pushed " + res.flushed + " orders to cloud.");
      loadRecentOrdersList();
    } catch (e) {
      alert("Sync error: " + e.message);
    } finally {
      setIsSyncingOffline(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header with Salesman & Beat */}
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
      />

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

      {/* Product Catalog List */}
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
            <Text style={styles.viewCartText}>VIEW ORDER ⚡</Text>
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
      />

      {/* Success Celebration Modal */}
      <OrderSuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        result={orderResult}
      />

      {/* Recent Orders Modal */}
      <RecentOrdersModal
        visible={recentModalVisible}
        onClose={() => setRecentModalVisible(false)}
        orders={recentOrders}
        onSyncOffline={handleSyncOffline}
        isSyncing={isSyncingOffline}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc"
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
