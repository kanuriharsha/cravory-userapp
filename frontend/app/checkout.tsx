import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';
import ProgressBar from '../components/ProgressBar';

export default function CheckoutScreen() {
  const router = useRouter();
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);
  const cart = useOrderStore(state => state.cart);
  const setOrderProgress = useOrderStore(state => state.setOrderProgress);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const totalAmount = getTotalAmount() + deliveryFee + platformFee + gst;

  const handleProceedToPayment = () => {
    setOrderProgress(75);
    router.push('/payment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>{deliveryAddress}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Order from {cart[0]?.restaurantName}</Text>
          </View>
          <View style={styles.itemsList}>
            {cart.map(item => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          </View>
          <TouchableOpacity style={styles.instructionCard}>
            <Text style={styles.instructionText}>Add cooking/delivery instructions</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Bill Summary</Text>
          </View>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{getTotalAmount()}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Platform Fee</Text>
              <Text style={styles.billValue}>₹{platformFee}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST</Text>
              <Text style={styles.billValue}>₹{gst}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerTotal}>₹{totalAmount}</Text>
          <Text style={styles.footerText}>TOTAL</Text>
        </View>
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  section: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  itemsList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  instructionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
  },
  billCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerInfo: {
    marginBottom: 8,
  },
  footerTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});