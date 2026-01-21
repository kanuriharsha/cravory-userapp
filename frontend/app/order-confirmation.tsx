import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const currentOrderId = useOrderStore(state => state.currentOrderId);
  const cart = useOrderStore(state => state.cart);
  const clearCart = useOrderStore(state => state.clearCart);
  
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    router.replace('/order-tracking');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.successIcon,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Your order has been confirmed and will be delivered soon
          </Text>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order ID</Text>
              <Text style={styles.orderValue}>{currentOrderId}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Restaurant</Text>
              <Text style={styles.orderValue}>{cart[0]?.restaurantName}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Items</Text>
              <Text style={styles.orderValue}>{cart.length} items</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.trackButton}
            onPress={handleTrackOrder}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
            <Ionicons name="location" size={20} color="#FFFFFF" />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  trackButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  homeButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});