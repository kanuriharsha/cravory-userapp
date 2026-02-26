import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';
import ProgressBar from '../components/ProgressBar';
import { orderService } from '../services/api';

export default function PaymentScreen() {
  const router = useRouter();
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);
  const setOrderProgress = useOrderStore(state => state.setOrderProgress);
  const setCurrentOrderId = useOrderStore(state => state.setCurrentOrderId);
  const cart = useOrderStore(state => state.cart);
  const customerName = useOrderStore(state => state.customerName);
  const customerPhone = useOrderStore(state => state.customerPhone);
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: 'qr-code-outline', subtitle: 'Pay via any UPI app' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline', subtitle: 'Visa, Mastercard, RuPay' },
    { id: 'wallet', name: 'Wallets', icon: 'wallet-outline', subtitle: 'Paytm, PhonePe, GooglePay' },
    { id: 'netbanking', name: 'Net Banking', icon: 'business-outline', subtitle: 'All major banks' },
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline', subtitle: 'Pay when order arrives' },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment', 'Please select a payment method to continue.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 800));

      const itemsPayload = cart.map(i => ({
        menuItemId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        restaurantName: i.restaurantName,
      }));

      const resp: any = await orderService.createOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        paymentMethod: selectedMethod,
        items: itemsPayload,
        restaurantName: cart[0]?.restaurantName || undefined,
      });

      if (resp && resp.success && resp.data) {
        setOrderProgress(100);
        setCurrentOrderId(resp.data._id || resp.data.id || `ORD${Date.now()}`);
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
        <Text style={styles.headerTitle}>Review & Pay</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* ── ORDER ITEMS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary — {cart[0]?.restaurantName}</Text>
          {cart.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnitPrice}>₹{item.price} each</Text>
                </View>
              </View>
              <Text style={styles.itemLineTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* ── DELIVERY DETAILS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color="#FFC107" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{customerName}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color="#FFC107" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>+91 {customerPhone}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#FFC107" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.detailLabel}>{deliveryAddress.label || 'Address'}</Text>
              <Text style={styles.detailValue}>{fullAddress}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changeLink} onPress={() => router.back()}>
            <Text style={styles.changeLinkText}>Change delivery details</Text>
          </TouchableOpacity>
        </View>

        {/* ── PRICE BREAKDOWN ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.billRow}><Text style={styles.billLabel}>Item Total</Text><Text style={styles.billValue}>₹{getTotalAmount()}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>Delivery Fee</Text><Text style={styles.billValue}>₹{deliveryFee}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>Platform Fee</Text><Text style={styles.billValue}>₹{platformFee}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>GST (5%)</Text><Text style={styles.billValue}>₹{gst}</Text></View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total to Pay</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* ── PAYMENT METHODS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodIcon}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={selectedMethod === method.id ? '#FFC107' : '#666'}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>
              <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioOuterSelected]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || loading) && styles.payButtonDisabled]}
          disabled={!selectedMethod || loading}
          onPress={handlePayment}
        >
          <Ionicons name="shield-checkmark" size={20} color="#111111" />
          <Text style={styles.payButtonText}>
            {loading ? 'Placing Order...' : `Pay ₹${totalAmount} & Place Order`}
          </Text>
        </TouchableOpacity>
        <Text style={styles.secureText}>100% secure payments</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  section: { backgroundColor: '#FFFFFF', marginTop: 12, paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: '#FFC107', paddingLeft: 8,
  },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemQty: { fontSize: 15, fontWeight: 'bold', color: '#FFC107', marginRight: 10, minWidth: 30 },
  itemName: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  itemUnitPrice: { fontSize: 12, color: '#888', marginTop: 2 },
  itemLineTotal: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  detailLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '500', lineHeight: 20 },
  changeLink: { marginTop: 10, alignSelf: 'flex-end' },
  changeLinkText: { fontSize: 13, color: '#FFC107', fontWeight: '600' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#666' },
  billValue: { fontSize: 14, color: '#1A1A1A' },
  totalRow: { paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#FFC107' },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA', marginBottom: 10,
  },
  methodCardSelected: { borderColor: '#FFC107', backgroundColor: '#FFFDF0' },
  methodIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  methodSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCCCCC',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterSelected: { borderColor: '#FFC107' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFC107' },
  footer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  payButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFC107', paddingVertical: 15, borderRadius: 10, gap: 10,
  },
  payButtonDisabled: { backgroundColor: '#E0E0E0' },
  payButtonText: { fontSize: 16, fontWeight: 'bold', color: '#111111' },
  secureText: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 },
});
