import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';
import ProgressBar from '../components/ProgressBar';
import { orderService } from '../services/api';
import { Alert } from 'react-native';

export default function PaymentScreen() {
  const router = useRouter();
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);
  const setOrderProgress = useOrderStore(state => state.setOrderProgress);
  const setCurrentOrderId = useOrderStore(state => state.setCurrentOrderId);
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);
  const clearCart = useOrderStore(state => state.clearCart);
  const cart = useOrderStore(state => state.cart);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const totalAmount = getTotalAmount() + deliveryFee + platformFee + gst;

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: 'qr-code-outline', subtitle: 'Pay via any UPI app' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', subtitle: 'Visa, Mastercard, RuPay' },
    { id: 'wallet', name: 'Wallets', icon: 'wallet-outline', subtitle: 'Paytm, PhonePe, GooglePay' },
    { id: 'netbanking', name: 'Net Banking', icon: 'business-outline', subtitle: 'All major banks' },
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline', subtitle: 'Pay when order arrives' },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    try {
      // Simulate payment processing delay
      await new Promise(res => setTimeout(res, 800));

      // Create order on backend
      // If frontend cart exists (mock/local), send items to backend so it can create an order
      const itemsPayload = cart.map(i => ({
        menuItemId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        restaurantName: i.restaurantName
      }));

      const resp = await orderService.createOrder({
        deliveryAddress,
        paymentMethod: selectedMethod,
        items: itemsPayload,
        restaurantName: cart[0]?.restaurantName || undefined
      });

      if (resp && resp.success && resp.data) {
        setOrderProgress(100);
        // Use DB order id
        setCurrentOrderId(resp.data._id || resp.data.id || `ORD${Date.now()}`);
        // Keep client-side cart until confirmation screen clears it (so user sees order summary)
        router.replace('/order-confirmation');
      } else {
        throw new Error((resp && resp.message) || 'Failed to create order');
      }
    } catch (err: any) {
      console.error('Payment / create order error', err);
      Alert.alert('Order Failed', err?.message || 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{totalAmount}</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodIcon}>
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedMethod === method.id ? '#FF6B35' : '#666'} 
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                selectedMethod === method.id && styles.radioOuterSelected
              ]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers */}
        <View style={styles.offerSection}>
          <View style={styles.offerHeader}>
            <Ionicons name="pricetag" size={20} color="#FF6B35" />
            <Text style={styles.offerTitle}>Apply Offers</Text>
          </View>
          <TouchableOpacity style={styles.offerCard}>
            <Text style={styles.offerText}>View all offers & coupons</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.payButton,
            (!selectedMethod || loading) && styles.payButtonDisabled
          ]}
          disabled={!selectedMethod || loading}
          onPress={handlePayment}
        >
          <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>{loading ? 'Processing...' : `Pay ₹${totalAmount} Securely`}</Text>
        </TouchableOpacity>
        <Text style={styles.secureText}>100% secure payments powered by industry standards</Text>
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
  amountSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  methodsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F9F9F9',
  },
  methodCardSelected: {
    backgroundColor: '#FFF4F0',
    borderColor: '#FF6B35',
  },
  methodIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FF6B35',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  offerSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  offerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  offerText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#FFB399',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});