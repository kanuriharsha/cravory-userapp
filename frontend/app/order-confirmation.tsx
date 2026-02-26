import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const currentOrderId = useOrderStore(state => state.currentOrderId);
  const cart = useOrderStore(state => state.cart);
  const clearCart = useOrderStore(state => state.clearCart);
  const customerName = useOrderStore(state => state.customerName);
  const customerPhone = useOrderStore(state => state.customerPhone);
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const totalAmount = getTotalAmount() + deliveryFee + platformFee + gst;

  const fullAddress = [
    deliveryAddress.addressLine1,
    deliveryAddress.addressLine2,
    deliveryAddress.city,
    deliveryAddress.state,
    deliveryAddress.pincode,
  ].filter(Boolean).join(', ');

  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    router.replace('/order-tracking');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Your order has been confirmed and will be delivered to you soon.
          </Text>

          {/* Order ID + Restaurant */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Details</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Order ID</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{currentOrderId || 'N/A'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Restaurant</Text>
              <Text style={styles.cardValue}>{cart[0]?.restaurantName || 'N/A'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Est. Delivery</Text>
              <Text style={styles.cardValue}>30 - 45 mins</Text>
            </View>
          </View>

          {/* Items Ordered */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Items Ordered</Text>
            {cart.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: '#888', fontSize: 13 }]}>Delivery + Platform + GST</Text>
              <Text style={[styles.itemTotal, { color: '#888', fontSize: 13 }]}>
                ₹{deliveryFee + platformFee + gst}
              </Text>
            </View>
            <View style={[styles.itemRow, { marginTop: 4 }]}>
              <Text style={[styles.itemName, { fontWeight: 'bold', fontSize: 15 }]}>Total Paid</Text>
              <Text style={[styles.itemTotal, { fontWeight: 'bold', fontSize: 15, color: '#FFC107' }]}>
                ₹{totalAmount}
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#FFC107" />
              <Text style={styles.infoText}>{customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#FFC107" />
              <Text style={styles.infoText}>+91 {customerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#FFC107" />
              <Text style={styles.infoText}>{fullAddress}</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
            <Ionicons name="location" size={20} color="#111111" />
            <Text style={styles.trackButtonText}>Track My Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              clearCart();
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 32, paddingTop: 24 },
  successIcon: { marginBottom: 20 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  cardTitle: {
    fontSize: 14, fontWeight: 'bold', color: '#888', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  cardLabel: { fontSize: 14, color: '#666' },
  cardValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', maxWidth: '60%', textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
  },
  itemQty: { fontSize: 14, fontWeight: 'bold', color: '#FFC107', marginRight: 8, minWidth: 28 },
  itemName: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  itemTotal: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#1A1A1A', marginLeft: 10, flex: 1, lineHeight: 20 },
  trackButton: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFC107', paddingVertical: 14, borderRadius: 10, gap: 8, marginTop: 4,
  },
  trackButtonText: { fontSize: 16, fontWeight: 'bold', color: '#111111' },
  homeButton: {
    width: '100%', paddingVertical: 14, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', marginTop: 12,
  },
  homeButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
});
