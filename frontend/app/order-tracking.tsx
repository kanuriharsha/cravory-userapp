import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';
import { orderService } from '../services/api';

type StageKey = 'orderConfirmed' | 'preparingFood' | 'foodReady' | 'outForDelivery' | 'delivered';

interface TrackingStages {
  orderConfirmed: 'pending' | 'completed';
  preparingFood: 'pending' | 'completed';
  foodReady: 'pending' | 'completed';
  outForDelivery: 'pending' | 'completed';
  delivered: 'pending' | 'completed';
}

const STAGE_KEYS: StageKey[] = ['orderConfirmed', 'preparingFood', 'foodReady', 'outForDelivery', 'delivered'];

const DEFAULT_STAGES: TrackingStages = {
  orderConfirmed: 'pending',
  preparingFood: 'pending',
  foodReady: 'pending',
  outForDelivery: 'pending',
  delivered: 'pending',
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const currentOrderId = useOrderStore(state => state.currentOrderId);
  const cart = useOrderStore(state => state.cart);

  const [trackingStages, setTrackingStages] = useState<TrackingStages>(DEFAULT_STAGES);

  const statuses: { key: StageKey; title: string; subtitle: string; icon: string }[] = [
    { key: 'orderConfirmed',  title: 'Order Confirmed',   subtitle: 'Restaurant accepted your order',                         icon: 'checkmark-circle' },
    { key: 'preparingFood',   title: 'Preparing Food',    subtitle: 'Your delicious meal is being prepared',                  icon: 'restaurant' },
    { key: 'foodReady',       title: 'Food Ready',        subtitle: 'Waiting for delivery partner',                           icon: 'bag-check' },
    { key: 'outForDelivery',  title: 'Out for Delivery',  subtitle: 'Show QR code to delivery partner to confirm receipt',    icon: 'bicycle' },
    { key: 'delivered',       title: 'Delivered',         subtitle: 'Enjoy your meal! QR scan verified.',                     icon: 'home' },
  ];

  /** Index of the last completed stage (-1 if none) */
  const getCurrentIndex = (stages: TrackingStages): number => {
    let last = -1;
    STAGE_KEYS.forEach((key, i) => {
      if (stages[key] === 'completed') last = i;
    });
    return last;
  };

  // ── Poll order from backend every 5 seconds to get live tracking stages ──
  useEffect(() => {
    if (!currentOrderId) return;

    const fetchOrder = async () => {
      try {
        const resp: any = await orderService.getOrderById(currentOrderId);
        if (resp?.success && resp?.data?.trackingStages) {
          setTrackingStages(resp.data.trackingStages as TrackingStages);
        }
      } catch {
        // silently ignore poll errors (offline / backend down)
      }
    };

    fetchOrder(); // immediate first fetch
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [currentOrderId]);

  // NOTE: This app does NOT auto-advance tracking stages. Stages are
  // controlled by the restaurant application. We only poll the order
  // to display whatever the restaurant has set in `trackingStages`.

  const currentIndex = getCurrentIndex(trackingStages);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color="#FFC107" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{currentOrderId}</Text>
          <Text style={styles.restaurantName}>{cart[0]?.restaurantName}</Text>
          <Text style={styles.itemCount}>{cart.length} items</Text>
        </View>

        {/* Estimated Time */}
        <View style={styles.timeCard}>
          <Ionicons name="time" size={32} color="#FFC107" />
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Estimated Delivery</Text>
            <Text style={styles.timeValue}>
              {trackingStages.delivered === 'completed' ? 'Delivered' : '25-30 mins'}
            </Text>
          </View>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.timeline}>
          {statuses.map((status, index) => {
            const isCompleted = trackingStages[status.key] === 'completed';
            const isCurrent = index === currentIndex;
            // line below is green if the NEXT stage is also completed
            const isLineCompleted = index < statuses.length - 1 &&
              trackingStages[statuses[index + 1].key] === 'completed';

            return (
              <View key={status.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.statusIcon,
                    isCompleted && styles.statusIconCompleted,
                    isCurrent && styles.statusIconCurrent,
                  ]}>
                    <Ionicons
                      name={status.icon as any}
                      size={24}
                      color={isCompleted ? '#FFFFFF' : '#999'}
                    />
                  </View>
                  {index < statuses.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      isLineCompleted && styles.timelineLineCompleted
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[
                    styles.statusTitle,
                    isCompleted && styles.statusTitleCompleted
                  ]}>
                    {status.title}
                  </Text>
                  <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>In Progress</Text>
                    </View>
                  )}
                  {/* ── QR button at "Out for Delivery" stage ── */}
                  {isCurrent && status.key === 'outForDelivery' && (
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() =>
                        router.push(
                          `/qr-delivery?orderId=${currentOrderId ?? 'ORDER'}&type=restaurant`
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="qr-code" size={18} color="#111" style={{ marginRight: 8 }} />
                      <Text style={styles.qrButtonText}>Show QR Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="headset" size={20} color="#FFC107" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  orderInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF9C4',
  },
  timeInfo: {
    marginLeft: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusIconCurrent: {
    backgroundColor: '#FFC107',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineRight: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 4,
  },
  statusTitleCompleted: {
    color: '#1A1A1A',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  currentBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC107',
  },
  // ── Part 17: QR delivery button
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDE7',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF9C4',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC107',
    marginLeft: 8,
  },
});