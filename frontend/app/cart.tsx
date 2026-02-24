import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';
import ProgressBar from '../components/ProgressBar';

export default function CartScreen() {
  const router = useRouter();
  const cart = useOrderStore(state => state.cart);
  const updateQuantity = useOrderStore(state => state.updateQuantity);
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);
  const setOrderProgress = useOrderStore(state => state.setOrderProgress);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const totalAmount = getTotalAmount() + deliveryFee + platformFee + gst;

  const handleCheckout = () => {
    setOrderProgress(50);
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add items to get started</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{cart[0]?.restaurantName}</Text>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Image 
                source={item.image && item.image !== "" ? 
                  (typeof item.image === 'string' ? { uri: item.image } : item.image) : 
                  require('../assets/images/food-naan.jpg')
                } 
                style={styles.itemImage} 
                defaultSource={require('../assets/images/food-naan.jpg')}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    key={`remove-${item.id}`}
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#FFC107" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    key={`add-${item.id}`}
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color="#FFC107" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Bill Details */}
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View key="itemTotal" style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{getTotalAmount()}</Text>
          </View>
          <View key="deliveryFee" style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          <View key="platformFee" style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>
          <View key="gst" style={styles.billRow}>
            <Text style={styles.billLabel}>GST (5%)</Text>
            <Text style={styles.billValue}>₹{gst}</Text>
          </View>
          <View key="total" style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>₹{totalAmount}</Text>
          <Text style={styles.checkoutText}>TOTAL</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#111111" />
        </TouchableOpacity>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  restaurantInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  itemsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 6,
    width: 28,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
    paddingHorizontal: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  billContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
    marginBottom: 100,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  totalRow: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkoutInfo: {
    marginBottom: 8,
  },
  checkoutTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  checkoutText: {
    fontSize: 12,
    color: '#666',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginRight: 8,
  },
});