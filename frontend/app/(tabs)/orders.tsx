import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { orderService } from '../../services/api';
import { useD2CStore, D2C_MILESTONES } from '../../store/d2cStore';

interface Order {
  _id: string;
  restaurantName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // D2C order state
  const d2cOrder = useD2CStore((s) => s.d2cOrder);
  const isD2CActive = useD2CStore((s) => s.isD2COrderActive)();
  const currentMilestone = d2cOrder ? D2C_MILESTONES[d2cOrder.milestoneIndex] : null;

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setError('');
      const response: any = await orderService.getOrders({ limit: 50 });
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#FF9800';
      case 'out_for_delivery': return '#9C27B0';
      default: return '#FFC107';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFC107']} />
          }
        >
          {/* ── PINNED D2C TRACKING CARD (Part 13) ── */}
          {d2cOrder && (
            <TouchableOpacity
              style={[
                styles.d2cPinnedCard,
                isD2CActive ? styles.d2cPinnedCardActive : styles.d2cPinnedCardDelivered,
              ]}
              onPress={() => router.push('/d2c-tracking')}
              activeOpacity={0.88}
            >
              <View style={styles.d2cPinnedHeader}>
                <View style={styles.d2cPinnedIconWrap}>
                  <Text style={styles.d2cPinnedIcon}>📦</Text>
                </View>
                <View style={styles.d2cPinnedTextCol}>
                  <Text style={styles.d2cPinnedTitle}>Authentic Originals Order</Text>
                  <Text style={styles.d2cPinnedStatus}>
                    {currentMilestone?.label ?? 'Order Placed'}
                  </Text>
                </View>
                <View style={styles.d2cPinnedArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#FFC107" />
                </View>
              </View>
              <Text style={styles.d2cPinnedSub}>
                {isD2CActive
                  ? `Your order is being shipped from ${d2cOrder.product.region} (3–4 days delivery).`
                  : 'Your Authentic Originals order has been delivered!'}
              </Text>
              <View style={styles.d2cMilestoneMini}>
                {D2C_MILESTONES.map((m, i) => (
                  <View
                    key={m.key}
                    style={[
                      styles.d2cDot,
                      i <= d2cOrder.milestoneIndex && styles.d2cDotDone,
                      i === d2cOrder.milestoneIndex && styles.d2cDotCurrent,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.d2cTrackBtn}
                onPress={() => router.push('/d2c-tracking')}
              >
                <Text style={styles.d2cTrackBtnText}>Track Order</Text>
                <Ionicons name="arrow-forward" size={14} color="#111111" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <TouchableOpacity key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.restaurantName}>{order.restaurantName || 'Restaurant'}</Text>
                  <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
                    {formatStatus(order.status)}
                  </Text>
                </View>
                <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDetails}>
                  {order.items.length} items • ₹{order.total.toFixed(2)}
                </Text>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                <View style={styles.orderActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(`/order-tracking?id=${order._id}`)}
                  >
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  {order.status === 'delivered' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.reorderButton]}
                      onPress={() => router.push(`/rate-order?id=${order._id}`)}
                    >
                      <Text style={styles.reorderButtonText}>Rate Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>Start ordering to see your history</Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.browseButtonText}>Browse Restaurants</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  orderCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107',
  },
  reorderButton: {
    backgroundColor: '#FFC107',
    borderWidth: 0,
  },
  reorderButtonText: {
    color: '#111111',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },

  // ── Pinned D2C card (Part 13) ────────────────────────────────────────────
  d2cPinnedCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  d2cPinnedCardActive: { borderColor: '#FFC107' },
  d2cPinnedCardDelivered: { borderColor: '#4CAF50' },
  d2cPinnedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  d2cPinnedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFDE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  d2cPinnedIcon: { fontSize: 22 },
  d2cPinnedTextCol: { flex: 1 },
  d2cPinnedTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  d2cPinnedStatus: { fontSize: 12, color: '#FFC107', fontWeight: '600', marginTop: 2 },
  d2cPinnedArrow: { paddingLeft: 8 },
  d2cPinnedSub: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 10 },
  d2cMilestoneMini: { flexDirection: 'row', gap: 5, marginBottom: 12 },
  d2cDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  d2cDotDone: { backgroundColor: '#4CAF50' },
  d2cDotCurrent: { backgroundColor: '#FFC107' },
  d2cTrackBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  d2cTrackBtnText: { fontSize: 13, fontWeight: '700', color: '#111111' },
});