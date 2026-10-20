import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  TrendingUp,
  ShoppingBag,
  Store,
  Award,
  BarChart3,
  Clock,
  MapPin
} from "lucide-react";
import { COLORS } from "../theme/colors";

export default function SalesAnalyticsView({ orders = [] }) {
  // Core Analytics Calculations (No artificial daily target limits)
  const analytics = useMemo(() => {
    let totalSales = 0;
    const productMap = {};
    const beatMap = {};
    const storeSet = new Set();
    const timeBuckets = {
      morning: { label: "8-11 AM", count: 0, amount: 0 },
      midday: { label: "11-2 PM", count: 0, amount: 0 },
      afternoon: { label: "2-5 PM", count: 0, amount: 0 },
      evening: { label: "5 PM+", count: 0, amount: 0 }
    };

    orders.forEach((o) => {
      const amount = Number(o.grand_total || 0);
      totalSales += amount;

      if (o.retailer_name) storeSet.add(o.retailer_name);

      const beat = o.beat_name || "General Beat";
      beatMap[beat] = (beatMap[beat] || 0) + amount;

      // Time bucket analysis
      if (o.created_at) {
        const hour = new Date(o.created_at).getHours();
        if (hour < 11) {
          timeBuckets.morning.count++;
          timeBuckets.morning.amount += amount;
        } else if (hour < 14) {
          timeBuckets.midday.count++;
          timeBuckets.midday.amount += amount;
        } else if (hour < 17) {
          timeBuckets.afternoon.count++;
          timeBuckets.afternoon.amount += amount;
        } else {
          timeBuckets.evening.count++;
          timeBuckets.evening.amount += amount;
        }
      } else {
        timeBuckets.afternoon.count++;
        timeBuckets.afternoon.amount += amount;
      }

      // Products breakdown
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const name = it.item_name || it.name || "FMCG Item";
          const qty = Number(it.quantity || 1);
          const itemTotal = Number(it.amount || qty * Number(it.rate || it.selling_rate || 0));

          if (!productMap[name]) {
            productMap[name] = { name, qty: 0, amount: 0, unit: it.unit || "PCS" };
          }
          productMap[name].qty += qty;
          productMap[name].amount += itemTotal;
        });
      }
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalOrdersCount = orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

    return {
      totalSales,
      totalOrdersCount,
      uniqueStoresCount: storeSet.size,
      avgOrderValue,
      topProducts,
      beatMap,
      timeBuckets
    };
  }, [orders]);

  const maxProductAmount =
    analytics.topProducts.length > 0 ? analytics.topProducts[0].amount : 1;

  const maxBucketAmount = Math.max(
    ...Object.values(analytics.timeBuckets).map((b) => b.amount),
    1
  );

  return (
    <View style={styles.container}>
      {/* 1. Today's Performance Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>आजचे एकूण बुकिंग (Today's Total Sales)</Text>
          <Text style={styles.heroValue}>
            ₹{analytics.totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.heroSub}>
            {analytics.totalOrdersCount} {analytics.totalOrdersCount === 1 ? "Order" : "Orders"} Placed • {analytics.uniqueStoresCount} Stores Covered
          </Text>
        </View>
        <View style={styles.heroIconBox}>
          <TrendingUp size={26} color="#ffffff" />
        </View>
      </View>

      {/* 2. 4 Clean KPI Metric Tiles */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiTile}>
          <View style={styles.kpiTileHeader}>
            <Text style={styles.kpiTileLabel}>एकूण विक्री (Revenue)</Text>
            <TrendingUp size={14} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.kpiTileValue}>₹{analytics.totalSales.toFixed(0)}</Text>
          <Text style={styles.kpiTileSub}>Today's Booking</Text>
        </View>

        <View style={styles.kpiTile}>
          <View style={styles.kpiTileHeader}>
            <Text style={styles.kpiTileLabel}>ऑर्डर्स (Orders)</Text>
            <ShoppingBag size={14} color={COLORS.accentGold} />
          </View>
          <Text style={styles.kpiTileValue}>{analytics.totalOrdersCount}</Text>
          <Text style={styles.kpiTileSub}>Booked Today</Text>
        </View>

        <View style={styles.kpiTile}>
          <View style={styles.kpiTileHeader}>
            <Text style={styles.kpiTileLabel}>किराणा दुकाने (Stores)</Text>
            <Store size={14} color={COLORS.primaryMint} />
          </View>
          <Text style={styles.kpiTileValue}>{analytics.uniqueStoresCount}</Text>
          <Text style={styles.kpiTileSub}>Visited on Beat</Text>
        </View>

        <View style={styles.kpiTile}>
          <View style={styles.kpiTileHeader}>
            <Text style={styles.kpiTileLabel}>सरासरी (Avg Basket)</Text>
            <Award size={14} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.kpiTileValue}>₹{analytics.avgOrderValue.toFixed(0)}</Text>
          <Text style={styles.kpiTileSub}>Per Store Booking</Text>
        </View>
      </View>

      {/* 3. Top-Selling Products (Ranked Horizontal Bar Chart) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <BarChart3 size={16} color={COLORS.primary} />
          <Text style={styles.cardTitle}>सर्वाधिक खपाची उत्पादने (Top Selling Items)</Text>
        </View>

        {analytics.topProducts.length > 0 ? (
          <View style={styles.barsList}>
            {analytics.topProducts.map((prod, idx) => {
              const barWidth = Math.max(
                Math.round((prod.amount / maxProductAmount) * 100),
                8
              );
              const percentOfTotal =
                analytics.totalSales > 0
                  ? Math.round((prod.amount / analytics.totalSales) * 100)
                  : 0;

              return (
                <View key={prod.name} style={styles.productBarItem}>
                  <View style={styles.prodRowTop}>
                    <View style={styles.prodNameBox}>
                      <View style={[styles.rankDot, idx === 0 && styles.rankDotGold]}>
                        <Text style={styles.rankText}>#{idx + 1}</Text>
                      </View>
                      <Text style={styles.prodName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                    </View>
                    <View style={styles.prodFigures}>
                      <Text style={styles.prodQty}>{prod.qty} {prod.unit}</Text>
                      <Text style={styles.prodAmount}>₹{prod.amount.toFixed(0)}</Text>
                    </View>
                  </View>

                  {/* Horizontal Bar */}
                  <View style={styles.horizTrack}>
                    <View
                      style={[
                        styles.horizFill,
                        { width: `${barWidth}%` },
                        idx === 0 ? styles.horizFillGold : styles.horizFillGreen
                      ]}
                    />
                  </View>
                  <Text style={styles.prodPercent}>{percentOfTotal}% of today's sales</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyAnalytics}>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>अद्याप कोणतीही ऑर्डर नोंदवली नाही</Text>
            <Text style={styles.emptySub}>
              Start booking orders from the catalog to see real-time product charts here.
            </Text>
          </View>
        )}
      </View>

      {/* 4. Hourly Sales Velocity (Column Bar Chart) */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Clock size={16} color={COLORS.primary} />
          <Text style={styles.cardTitle}>वेळेनुसार ऑर्डर ओघ (Order Velocity)</Text>
        </View>

        <View style={styles.velocityGrid}>
          {Object.entries(analytics.timeBuckets).map(([key, bucket]) => {
            const barHeight =
              maxBucketAmount > 0
                ? Math.max(Math.round((bucket.amount / maxBucketAmount) * 80), 8)
                : 8;
            const isPeak = bucket.amount === maxBucketAmount && bucket.amount > 0;

            return (
              <View key={key} style={styles.velocityCol}>
                <Text style={styles.colAmount}>
                  {bucket.amount > 0 ? `₹${(bucket.amount / 1000).toFixed(1)}k` : "₹0"}
                </Text>
                <View style={styles.verticalTrack}>
                  <View
                    style={[
                      styles.verticalFill,
                      { height: barHeight },
                      isPeak && styles.verticalFillPeak
                    ]}
                  />
                </View>
                <Text style={[styles.colLabel, isPeak && styles.colLabelPeak]}>
                  {bucket.label}
                </Text>
                <Text style={styles.colOrders}>{bucket.count} ord</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 5. Beat-Wise Revenue Distribution */}
      {Object.keys(analytics.beatMap).length > 0 && (
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>बीटनुसार विक्री (Beat-Wise Breakdown)</Text>
          </View>

          <View style={styles.beatDistributionList}>
            {Object.entries(analytics.beatMap).map(([beatName, amount]) => {
              const percent =
                analytics.totalSales > 0
                  ? Math.round((amount / analytics.totalSales) * 100)
                  : 0;

              return (
                <View key={beatName} style={styles.beatRow}>
                  <View style={styles.beatRowText}>
                    <Text style={styles.beatRowTitle} numberOfLines={1}>
                      📍 {beatName}
                    </Text>
                    <Text style={styles.beatRowAmount}>₹{amount.toFixed(0)} ({percent}%)</Text>
                  </View>
                  <View style={styles.beatTrack}>
                    <View
                      style={[
                        styles.beatFill,
                        { width: `${Math.max(percent, 4)}%` }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4
  },
  heroLeft: {
    flex: 1,
    marginRight: 10
  },
  heroLabel: {
    fontSize: 11,
    color: COLORS.primarySoft,
    fontWeight: "600"
  },
  heroValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 2
  },
  heroSub: {
    fontSize: 11,
    color: COLORS.accentGold,
    fontWeight: "700",
    marginTop: 2
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  kpiTile: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  kpiTileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  kpiTileLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700"
  },
  kpiTileValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary
  },
  kpiTileSub: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 8
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  barsList: {
    gap: 12
  },
  productBarItem: {
    marginBottom: 2
  },
  prodRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  prodNameBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8
  },
  rankDot: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  rankDotGold: {
    backgroundColor: COLORS.accentLight
  },
  rankText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary
  },
  prodName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1
  },
  prodFigures: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  prodQty: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  prodAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  horizTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    overflow: "hidden"
  },
  horizFill: {
    height: "100%",
    borderRadius: 3
  },
  horizFillGreen: {
    backgroundColor: COLORS.primaryLight
  },
  horizFillGold: {
    backgroundColor: COLORS.accentGold
  },
  prodPercent: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: "right"
  },
  velocityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 10,
    paddingBottom: 4,
    height: 140
  },
  velocityCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%"
  },
  colAmount: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 4
  },
  verticalTrack: {
    width: 22,
    height: 80,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  verticalFill: {
    width: "100%",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 6
  },
  verticalFillPeak: {
    backgroundColor: COLORS.primaryLight
  },
  colLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: 6
  },
  colLabelPeak: {
    color: COLORS.primary,
    fontWeight: "900"
  },
  colOrders: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 1
  },
  beatDistributionList: {
    gap: 8
  },
  beatRow: {
    marginBottom: 2
  },
  beatRowText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  beatRowTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1
  },
  beatRowAmount: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary
  },
  beatTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    overflow: "hidden"
  },
  beatFill: {
    height: "100%",
    backgroundColor: COLORS.primaryMint,
    borderRadius: 3
  },
  emptyAnalytics: {
    alignItems: "center",
    paddingVertical: 20
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textDark
  },
  emptySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
    maxWidth: 240
  }
});
