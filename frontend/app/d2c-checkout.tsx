/**
 * D2C Checkout Screen
 *
 * CRITICAL ARCHITECTURE RESTRICTIONS (Part 21):
 *  • This screen is completely separate from the local restaurant cart/checkout
 *  • No rider assignment, no instant delivery timers, no live GPS
 *  • Region branding only – vendor identity hidden
 *  • Mandatory pincode validation
 *  • Prepaid only – COD is disabled
 *  • Separate pricing structure (product + packaging + long-distance shipping)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useD2CStore,
  calcD2CPricing,
  D2C_PACKAGING_FEE,
  D2C_SHIPPING_FEE,
} from '../store/d2cStore';

// ── Pincode validation (6-digit Indian PIN) ────────────────────────────────
function isValidPincode(pin: string) {
  return /^[1-9][0-9]{5}$/.test(pin);
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon as any} size={18} color="#FFC107" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────
function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {optional && <Text style={styles.fieldOptional}>(Optional)</Text>}
        {!optional && <Text style={styles.fieldRequired}>*</Text>}
      </View>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function D2CCheckoutScreen() {
  const router = useRouter();
  const d2cProduct = useD2CStore((s) => s.d2cProduct);
  const d2cAddress = useD2CStore((s) => s.d2cAddress);
  const updateD2cAddress = useD2CStore((s) => s.updateD2cAddress);
  const placeD2cOrder = useD2CStore((s) => s.placeD2cOrder);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Guard: if no product selected, go back
  if (!d2cProduct) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color="#E0E0E0" />
          <Text style={styles.errorStateText}>No product selected.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pricing = calcD2CPricing(d2cProduct.price);

  // ── Validation ─────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  if (!d2cAddress.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!/^[6-9]\d{9}$/.test(d2cAddress.mobile))
    errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!d2cAddress.address.trim()) errors.address = 'Address is required.';
  if (!d2cAddress.city.trim()) errors.city = 'City is required.';
  if (!d2cAddress.state.trim()) errors.state = 'State is required.';
  if (!d2cAddress.pincode.trim())
    errors.pincode = 'Pincode required for long-distance origin delivery eligibility.';
  else if (!isValidPincode(d2cAddress.pincode))
    errors.pincode = 'Enter a valid 6-digit Indian pincode.';

  const isFormValid = Object.keys(errors).length === 0;

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Payment ────────────────────────────────────────────────────────────
  const handleConfirmAndPay = async () => {
    // Touch all fields to show errors
    const allFields: Record<string, boolean> = {};
    ['fullName', 'mobile', 'address', 'city', 'state', 'pincode'].forEach(
      (f) => (allFields[f] = true)
    );
    setTouched(allFields);

    if (!isFormValid) {
      if (errors.pincode) {
        Alert.alert(
          'Pincode Required',
          'Pincode required for long-distance origin delivery eligibility.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    setLoading(true);
    // Simulate payment gateway (prepaid only)
    await new Promise((r) => setTimeout(r, 1000));
    placeD2cOrder('prepaid_upi');
    setLoading(false);
    router.replace('/d2c-order-confirmation' as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Origin Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Isolated Flow Badge */}
        <View style={styles.isolatedBadge}>
          <Ionicons name="lock-closed" size={12} color="#B8860B" />
          <Text style={styles.isolatedBadgeText}>
            Authentic Originals · Origin-Sourced · Separate from Local Orders
          </Text>
        </View>

        {/* ── Premium Origin Source Banner ── */}
        <View style={styles.sourceBanner}>
          <View style={styles.sourceBannerLeft}>
            <Text style={styles.sourceBannerEmoji}>🏺</Text>
          </View>
          <View style={styles.sourceBannerContent}>
            <Text style={styles.sourceBannerTitle}>Ordering from the Source</Text>
            <Text style={styles.sourceBannerSub}>
              You are buying directly from verified artisan producers at the origin town.
              Not a copy. Not a replica. The real thing.
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Product Summary ── */}
          <Section icon="cube-outline" title="Your D2C Item">
            <View style={styles.productCard}>
              <View style={styles.productCardTop}>
                <View style={styles.regionChip}>
                  <Text style={styles.regionChipText}>
                    📍 {d2cProduct.region}, {d2cProduct.stateName}
                  </Text>
                </View>
                <View style={styles.originBadge}>
                  <Ionicons name="checkmark-circle" size={11} color="#2E7D32" style={{ marginRight: 3 }} />
                  <Text style={styles.originBadgeText}>Verified Origin Item</Text>
                </View>
              </View>
              <Text style={styles.productName}>{d2cProduct.name}</Text>
              <Text style={styles.productDesc}>{d2cProduct.description}</Text>
              <View style={styles.deliveryInfoRow}>
                <Ionicons name="time-outline" size={14} color="#FFC107" />
                <Text style={styles.deliveryInfoText}>
                  Long-Distance Delivery · {d2cProduct.deliveryDays}
                </Text>
              </View>
              <View style={styles.shippingNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#795548"
                />
                <Text style={styles.shippingNoteText}>
                  This item is shipped from origin town via long-distance
                  delivery.
                </Text>
              </View>
            </View>
          </Section>

          {/* ── Delivery Address Form  ── */}
          <Section icon="location-outline" title="Delivery Address">
            <View style={styles.formCard}>
              <Field
                label="Full Name"
                error={touched.fullName ? errors.fullName : undefined}
              >
                <TextInput
                  style={[
                    styles.input,
                    touched.fullName && errors.fullName && styles.inputError,
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#BDBDBD"
                  value={d2cAddress.fullName}
                  onChangeText={(v) => updateD2cAddress({ fullName: v })}
                  onBlur={() => touch('fullName')}
                  returnKeyType="next"
                />
              </Field>

              <Field
                label="Mobile Number"
                error={touched.mobile ? errors.mobile : undefined}
              >
                <View style={styles.mobileRow}>
                  <View style={styles.mobilePrefix}>
                    <Text style={styles.mobilePrefixText}>+91</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.mobileInput,
                      touched.mobile && errors.mobile && styles.inputError,
                    ]}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#BDBDBD"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={d2cAddress.mobile}
                    onChangeText={(v) => updateD2cAddress({ mobile: v })}
                    onBlur={() => touch('mobile')}
                  />
                </View>
              </Field>

              <Field
                label="Full Address"
                error={touched.address ? errors.address : undefined}
              >
                <TextInput
                  style={[
                    styles.input,
                    styles.multilineInput,
                    touched.address && errors.address && styles.inputError,
                  ]}
                  placeholder="House/Flat No., Street, Area, Locality"
                  placeholderTextColor="#BDBDBD"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={d2cAddress.address}
                  onChangeText={(v) => updateD2cAddress({ address: v })}
                  onBlur={() => touch('address')}
                />
              </Field>

              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field
                    label="City"
                    error={touched.city ? errors.city : undefined}
                  >
                    <TextInput
                      style={[
                        styles.input,
                        touched.city && errors.city && styles.inputError,
                      ]}
                      placeholder="City"
                      placeholderTextColor="#BDBDBD"
                      value={d2cAddress.city}
                      onChangeText={(v) => updateD2cAddress({ city: v })}
                      onBlur={() => touch('city')}
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="State"
                    error={touched.state ? errors.state : undefined}
                  >
                    <TextInput
                      style={[
                        styles.input,
                        touched.state && errors.state && styles.inputError,
                      ]}
                      placeholder="State"
                      placeholderTextColor="#BDBDBD"
                      value={d2cAddress.state}
                      onChangeText={(v) => updateD2cAddress({ state: v })}
                      onBlur={() => touch('state')}
                    />
                  </Field>
                </View>
              </View>

              {/* PINCODE — mandatory, highlighted */}
              <Field
                label="Pincode"
                error={touched.pincode ? errors.pincode : undefined}
              >
                <View style={styles.pincodeRow}>
                  <Ionicons
                    name="pin-outline"
                    size={16}
                    color={
                      touched.pincode && errors.pincode ? '#E53935' : '#FFC107'
                    }
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.pincodeInput,
                      touched.pincode && errors.pincode && styles.inputError,
                    ]}
                    placeholder="6-digit pincode"
                    placeholderTextColor="#BDBDBD"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={d2cAddress.pincode}
                    onChangeText={(v) => updateD2cAddress({ pincode: v })}
                    onBlur={() => touch('pincode')}
                  />
                  {isValidPincode(d2cAddress.pincode) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#43A047"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
                <View style={styles.pincodeNote}>
                  <Ionicons
                    name="information-circle-outline"
                    size={13}
                    color="#FFA000"
                  />
                  <Text style={styles.pincodeNoteText}>
                    Delivery charges calculated based on delivery pincode.
                  </Text>
                </View>
              </Field>

              <Field label="Landmark" optional>
                <TextInput
                  style={styles.input}
                  placeholder="Near school, temple, etc. (optional)"
                  placeholderTextColor="#BDBDBD"
                  value={d2cAddress.landmark}
                  onChangeText={(v) => updateD2cAddress({ landmark: v })}
                />
              </Field>
            </View>
          </Section>

          {/* ── Bill Details ── */}
          <Section icon="receipt-outline" title="Bill Details">
            <View style={styles.billCard}>
              {/* Header note */}
              <View style={styles.billNote}>
                <Ionicons name="cube-outline" size={14} color="#795548" />
                <Text style={styles.billNoteText}>
                  Separate from local food orders. D2C pricing applies.
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>
                  Product Price ({d2cProduct.name})
                </Text>
                <Text style={styles.billValue}>₹{pricing.productPrice}</Text>
              </View>

              <View style={styles.billRow}>
                <View style={styles.billLabelWithBadge}>
                  <Text style={styles.billLabel}>Premium Packaging Fee</Text>
                  <View style={styles.billBadge}>
                    <Text style={styles.billBadgeText}>Origin Safe-Pack</Text>
                  </View>
                </View>
                <Text style={styles.billValue}>₹{pricing.premiumPackagingFee}</Text>
              </View>

              <View style={styles.billRow}>
                <View style={styles.billLabelWithBadge}>
                  <Text style={styles.billLabel}>
                    Long-Distance Shipping
                  </Text>
                  <View style={styles.billBadge}>
                    <Text style={styles.billBadgeText}>PIN-to-PIN</Text>
                  </View>
                </View>
                <Text style={styles.billValue}>₹{pricing.longDistanceShipping}</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Total Payable</Text>
                <Text style={styles.billTotalValue}>₹{pricing.total}</Text>
              </View>
            </View>
          </Section>

          {/* ── Payment Mode ── */}
          <Section icon="card-outline" title="Payment Mode">
            <View style={styles.paymentCard}>
              {/* Why Prepaid explainer */}
              <View style={styles.prepaidExplainer}>
                <Ionicons name="shield-checkmark" size={16} color="#1565C0" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.prepaidExplainerTitle}>Why Prepaid Only?</Text>
                  <Text style={styles.prepaidExplainerText}>
                    Origin items are prepared and packed specifically for your order.
                    Prepaid ensures commitment from both sides and protects artisan producers.
                  </Text>
                </View>
              </View>
              {/* Prepaid selected */}
              <View style={styles.paymentOption}>
                <View style={styles.paymentRadioSelected}>
                  <View style={styles.paymentRadioDot} />
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionName}>Prepaid (UPI / Card / Wallet)</Text>
                  <Text style={styles.paymentOptionSub}>Quality assured, origin verified delivery</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#43A047" />
              </View>

              {/* COD disabled */}
              <View style={[styles.paymentOption, styles.paymentOptionDisabled]}>
                <View style={styles.paymentRadioDisabled}>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionNameDisabled}>Cash on Delivery</Text>
                  <View style={styles.codBadge}>
                    <Ionicons name="lock-closed" size={11} color="#E53935" />
                    <Text style={styles.codBadgeText}>Not available for origin delivery</Text>
                  </View>
                </View>
              </View>
            </View>
          </Section>

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* ── Sticky CTA ── */}
        <View style={styles.stickyFooter}>
          <View style={styles.footerPriceSummary}>
            <Text style={styles.footerLabel}>Total Payable</Text>
            <Text style={styles.footerAmount}>₹{pricing.total}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              (!isFormValid) && styles.ctaButtonDisabled,
            ]}
            onPress={handleConfirmAndPay}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={16} color="#111111" />
                <Text style={styles.ctaButtonText}>Confirm & Pay (Prepaid)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },

  // Isolated flow badge
  isolatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  isolatedBadgeText: { fontSize: 11, fontWeight: '600', color: '#B8860B' },

  // Premium Source Banner
  sourceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#FFC107',
  },
  sourceBannerLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  sourceBannerEmoji: { fontSize: 18 },
  sourceBannerContent: { flex: 1 },
  sourceBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  sourceBannerSub: {
    fontSize: 11,
    color: '#BDBDBD',
    lineHeight: 16,
  },

  scrollContent: { paddingBottom: 16 },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  // Product card
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  productCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  regionChip: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  regionChipText: { fontSize: 11, fontWeight: '600', color: '#795548' },
  originBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  originBadgeText: { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  productName: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  productDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  deliveryInfoText: { fontSize: 12, fontWeight: '500', color: '#FFA000' },
  shippingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFDE7',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  shippingNoteText: { flex: 1, fontSize: 11, color: '#5D4037', lineHeight: 15 },

  // Form
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  fieldWrapper: { marginBottom: 14 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#424242' },
  fieldOptional: { fontSize: 11, color: '#9E9E9E' },
  fieldRequired: { fontSize: 13, fontWeight: '700', color: '#E53935' },
  fieldError: { fontSize: 11, color: '#E53935', marginTop: 4, lineHeight: 14 },

  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E53935', backgroundColor: '#FFF8F8' },
  multilineInput: { height: 80 },

  mobileRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  mobilePrefix: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  mobilePrefixText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  mobileInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  row2: { flexDirection: 'row' },

  pincodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeInput: { flex: 1 },
  pincodeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: '#FFF8E1',
    padding: 7,
    borderRadius: 7,
  },
  pincodeNoteText: { fontSize: 11, color: '#795548', flex: 1, lineHeight: 14 },

  // Bill
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  billNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFDE7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  billNoteText: { fontSize: 11, color: '#5D4037', flex: 1 },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billLabelWithBadge: { flex: 1, marginRight: 8 },
  billLabel: { fontSize: 13, color: '#555', marginBottom: 3 },
  billBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  billBadgeText: { fontSize: 10, color: '#9E9E9E', fontWeight: '500' },
  billValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  billDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  billTotalValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },

  // Payment
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 8,
  },
  prepaidExplainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginBottom: 4,
  },
  prepaidExplainerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 3,
  },
  prepaidExplainerText: {
    fontSize: 11,
    color: '#1565C0',
    lineHeight: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FBE7',
    borderWidth: 1.5,
    borderColor: '#C5E1A5',
    gap: 12,
  },
  paymentOptionDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
  },
  paymentRadioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#43A047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#43A047',
  },
  paymentRadioDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  paymentOptionInfo: { flex: 1 },
  paymentOptionName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  paymentOptionSub: { fontSize: 11, color: '#666', marginTop: 2 },
  paymentOptionNameDisabled: { fontSize: 13, fontWeight: '500', color: '#BDBDBD' },
  codBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  codBadgeText: { fontSize: 11, color: '#E53935', fontWeight: '500' },

  // Sticky footer
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  footerPriceSummary: { flex: 1 },
  footerLabel: { fontSize: 12, color: '#777' },
  footerAmount: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonDisabled: { opacity: 0.65 },
  ctaButtonText: { fontSize: 14, fontWeight: '700', color: '#111111' },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorStateText: { fontSize: 16, color: '#9E9E9E' },
  backBtn: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#111111' },

  bottomPad: { height: 16 },
});
