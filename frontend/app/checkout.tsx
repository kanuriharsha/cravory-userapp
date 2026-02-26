import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore, DeliveryAddress } from '../store/orderStore';
import ProgressBar from '../components/ProgressBar';

const LABELS = ['Home', 'Work', 'Other'];

export default function CheckoutScreen() {
  const router = useRouter();
  const cart = useOrderStore(state => state.cart);
  const getTotalAmount = useOrderStore(state => state.getTotalAmount);
  const setOrderProgress = useOrderStore(state => state.setOrderProgress);
  const setCustomerName = useOrderStore(state => state.setCustomerName);
  const setCustomerPhone = useOrderStore(state => state.setCustomerPhone);
  const setDeliveryAddress = useOrderStore(state => state.setDeliveryAddress);

  const storedName = useOrderStore(state => state.customerName);
  const storedPhone = useOrderStore(state => state.customerPhone);
  const storedAddr = useOrderStore(state => state.deliveryAddress);

  const [name, setName] = useState(storedName || '');
  const [phone, setPhone] = useState(storedPhone || '');
  const [label, setLabel] = useState<string>(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.label : '') || 'Home'
  );
  const [addressLine1, setAddressLine1] = useState(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.addressLine1 : '') || ''
  );
  const [addressLine2, setAddressLine2] = useState(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.addressLine2 : '') || ''
  );
  const [city, setCity] = useState(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.city : '') || ''
  );
  const [stateVal, setStateVal] = useState(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.state : '') || ''
  );
  const [pincode, setPincode] = useState(
    (storedAddr && typeof storedAddr === 'object' ? storedAddr.pincode : '') || ''
  );

  const deliveryFee = 40;
  const platformFee = 5;
  const gst = Math.round(getTotalAmount() * 0.05);
  const totalAmount = getTotalAmount() + deliveryFee + platformFee + gst;

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.trim().length !== 10 || isNaN(Number(phone.trim()))) {
      Alert.alert('Required', 'Please enter a valid 10-digit phone number.');
      return false;
    }
    if (!addressLine1.trim()) {
      Alert.alert('Required', 'Please enter your house / flat / building.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Required', 'Please enter your city.');
      return false;
    }
    if (!pincode.trim() || pincode.trim().length !== 6 || isNaN(Number(pincode.trim()))) {
      Alert.alert('Required', 'Please enter a valid 6-digit pincode.');
      return false;
    }
    return true;
  };

  const handleProceed = () => {
    if (!validate()) return;
    setCustomerName(name.trim());
    setCustomerPhone(phone.trim());
    const addr: DeliveryAddress = {
      label,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      pincode: pincode.trim(),
    };
    setDeliveryAddress(addr);
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
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Order Strip */}
          <View style={styles.orderStrip}>
            <Ionicons name="restaurant" size={18} color="#FFC107" />
            <Text style={styles.orderStripText} numberOfLines={1}>
              {cart[0]?.restaurantName} · {cart.length} item{cart.length !== 1 ? 's' : ''} · ₹{totalAmount}
            </Text>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#AAAAAA"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="10-digit mobile number"
                placeholderTextColor="#AAAAAA"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <Text style={styles.fieldLabel}>Save As</Text>
            <View style={styles.labelRow}>
              {LABELS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, label === l && styles.labelChipActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>House / Flat / Building *</Text>
            <TextInput
              style={styles.input}
              placeholder="House no., Flat no., Building name"
              placeholderTextColor="#AAAAAA"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />

            <Text style={styles.fieldLabel}>Street / Area / Locality</Text>
            <TextInput
              style={styles.input}
              placeholder="Street, Area, Locality (optional)"
              placeholderTextColor="#AAAAAA"
              value={addressLine2}
              onChangeText={setAddressLine2}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#AAAAAA"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor="#AAAAAA"
                  value={stateVal}
                  onChangeText={setStateVal}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit pincode"
              placeholderTextColor="#AAAAAA"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Order — {cart[0]?.restaurantName}</Text>
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

          {/* Price Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Summary</Text>
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
              <Text style={styles.billLabel}>GST (5%)</Text>
              <Text style={styles.billValue}>₹{gst}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>₹{totalAmount}</Text>
          <Text style={styles.footerText}>TOTAL</Text>
        </View>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color="#111111" />
        </TouchableOpacity>
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
  orderStrip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFE082',
  },
  orderStripText: { flex: 1, fontSize: 13, color: '#555', fontWeight: '500', marginLeft: 8 },
  section: {
    backgroundColor: '#FFFFFF', marginTop: 12, paddingHorizontal: 16, paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: '#FFC107', paddingLeft: 8,
  },
  fieldLabel: {
    fontSize: 13, color: '#555', fontWeight: '500', marginBottom: 6, marginTop: 10,
  },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: '#1A1A1A', backgroundColor: '#FAFAFA',
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  countryCode: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#F0F0F0', marginRight: 8,
  },
  countryCodeText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  phoneInput: { flex: 1 },
  labelRow: { flexDirection: 'row', marginBottom: 6 },
  labelChip: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, marginRight: 10,
    paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#FAFAFA',
  },
  labelChipActive: { borderColor: '#FFC107', backgroundColor: '#FFF8E1' },
  labelChipText: { fontSize: 13, color: '#666' },
  labelChipTextActive: { color: '#B8860B', fontWeight: '600' },
  row: { flexDirection: 'row' },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemQty: { fontSize: 15, fontWeight: 'bold', color: '#FFC107', marginRight: 10, minWidth: 30 },
  itemName: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  itemUnitPrice: { fontSize: 12, color: '#888', marginTop: 2 },
  itemLineTotal: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#666' },
  billValue: { fontSize: 14, color: '#1A1A1A' },
  totalRow: { paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#FFC107' },
  footer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  footerTotal: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  footerText: { fontSize: 11, color: '#666' },
  proceedButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC107',
    paddingVertical: 13, paddingHorizontal: 18, borderRadius: 8,
  },
  proceedButtonText: { fontSize: 15, fontWeight: 'bold', color: '#111111', marginRight: 8 },
});
