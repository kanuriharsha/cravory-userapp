/**
 * D2C Order Confirmation Screen
 *
 * ARCHITECTURE RESTRICTIONS (Part 21):
 *  • NO rider assignment display
 *  • NO instant delivery timers
 *  • NO live GPS tracking — milestone-only status shown
 *  • Region branding only (vendor identity hidden)
 *  • Prepaid confirmed badge
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useD2CStore } from '../store/d2cStore';

// ── Milestone data ────────────────────────────────────────────────────────
const MILESTONES = [
  {
    label: 'Order Confirmed',
    sub: 'Your origin order is confirmed & being prepared.',
    icon: 'checkmark-circle',
  },
  {
    label: 'Dispatched from Origin',
    sub: 'Item packed and handed to long-distance courier.',
    icon: 'cube-outline',
  },
  {
    label: 'In Transit',
    sub: 'On its way from the origin town to your city.',
    icon: 'train-outline',
  },
  {
    label: 'Delivered',
    sub: 'Authentic origin item delivered to your door.',
    icon: 'home',
  },
];

// ── Milestone Step ────────────────────────────────────────────────────────
function MilestoneStep({
  step,
  index,
  currentStep,
  isLast,
}: {
  step: (typeof MILESTONES)[0];
  index: number;
  currentStep: number;
  isLast: boolean;
}) {
  const isDone = index <= currentStep;
  const isActive = index === currentStep;

  return (
    <View style={styles.milestoneRow}>
      {/* Icon column */}
      <View style={styles.milestoneIconCol}>
        <View
          style={[
            styles.milestoneCircle,
            isDone && styles.milestoneCircleDone,
            isActive && styles.milestoneCircleActive,
          ]}
        >
          <Ionicons
            name={step.icon as any}
            size={16}
            color={isDone ? '#FFFFFF' : '#BDBDBD'}
          />
        </View>
        {!isLast && (
          <View
            style={[styles.milestoneLine, isDone && styles.milestoneLineDone]}
          />
        )}
      </View>

      {/* Text column */}
      <View style={styles.milestoneText}>
        <Text
          style={[
            styles.milestoneLabel,
            isDone && styles.milestoneLabelDone,
            isActive && styles.milestoneLabelActive,
          ]}
        >
          {step.label}
          {isActive && (
            <Text style={styles.milestoneLiveTag}> ← Current</Text>
          )}
        </Text>
        <Text style={styles.milestoneSub}>{step.sub}</Text>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────
export default function D2COrderConfirmationScreen() {
  const router = useRouter();
  const d2cOrder = useD2CStore((s) => s.d2cOrder);
  const resetD2cFlow = useD2CStore((s) => s.resetD2cFlow);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 18,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    resetD2cFlow();
    router.replace('/(tabs)');
  };

  const handleExploreMore = () => {
    resetD2cFlow();
    router.replace('/(tabs)/authentic-originals' as any);
  };

  if (!d2cOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color="#E0E0E0" />
          <Text style={styles.errorText}>No D2C order found.</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Success animation ── */}
        <Animated.View
          style={[
            styles.successBlock,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
          ]}
        >
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={52} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Your Journey Begins!</Text>
          <Text style={styles.successSub}>
            Your authentic origin item is confirmed{`\n`}and beginning its journey to you.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ── Origin Certificate Card ── */}
          <View style={styles.certificateCard}>
            <View style={styles.certificateHeader}>
              <Ionicons name="ribbon" size={18} color="#B8860B" />
              <Text style={styles.certificateTitle}>Origin Verified</Text>
              <View style={styles.certificateSeal}>
                <Text style={styles.certificateSealText}>✓ AUTHENTIC</Text>
              </View>
            </View>
            <Text style={styles.certificateQuote}>
              “Prepared with generations of craft at its origin town.
              Packed with care. Travelling to you.”
            </Text>
            <Text style={styles.certificateCaption}>— Authentic Originals Quality Assurance</Text>
          </View>

          {/* ── Order summary card ── */}
          <View style={styles.summaryCard}>
            {/* D2C badge */}
            <View style={styles.d2cBadge}>
              <Ionicons name="lock-closed" size={11} color="#B8860B" />
              <Text style={styles.d2cBadgeText}>
                D2C Origin Order · Prepaid Confirmed
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>{d2cOrder.orderId}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item</Text>
              <Text style={styles.summaryValue}>{d2cOrder.product.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Origin</Text>
              <Text style={styles.summaryValue}>
                📍 {d2cOrder.product.region}, {d2cOrder.product.stateName}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Delivery</Text>
              <Text style={styles.summaryValue}>
                {d2cOrder.product.deliveryDays} from dispatch
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment</Text>
              <View style={styles.prepaidTag}>
                <Ionicons name="checkmark-circle" size={13} color="#43A047" />
                <Text style={styles.prepaidTagText}>Prepaid Confirmed</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Address */}
            <View style={styles.addressBlock}>
              <View style={styles.addressIconRow}>
                <Ionicons name="location" size={14} color="#FFC107" />
                <Text style={styles.addressBlockTitle}>Shipping To</Text>
              </View>
              <Text style={styles.addressLine}>
                {d2cOrder.address.fullName}
              </Text>
              <Text style={styles.addressLine}>{d2cOrder.address.address}</Text>
              <Text style={styles.addressLine}>
                {d2cOrder.address.city}, {d2cOrder.address.state} –{' '}
                {d2cOrder.address.pincode}
              </Text>
              {d2cOrder.address.landmark ? (
                <Text style={styles.addressLine}>
                  Near: {d2cOrder.address.landmark}
                </Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* Pricing summary */}
            <View style={styles.pricingBlock}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Product</Text>
                <Text style={styles.pricingVal}>
                  ₹{d2cOrder.pricing.productPrice}
                </Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Packaging</Text>
                <Text style={styles.pricingVal}>
                  ₹{d2cOrder.pricing.premiumPackagingFee}
                </Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Shipping</Text>
                <Text style={styles.pricingVal}>
                  ₹{d2cOrder.pricing.longDistanceShipping}
                </Text>
              </View>
              <View style={[styles.pricingRow, styles.pricingTotalRow]}>
                <Text style={styles.pricingTotalLabel}>Total Paid</Text>
                <Text style={styles.pricingTotalVal}>
                  ₹{d2cOrder.pricing.total}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Milestone Tracker ── */}
          <View style={styles.trackerCard}>
            <View style={styles.trackerHeader}>
              <Ionicons name="navigate-outline" size={16} color="#FFC107" />
              <Text style={styles.trackerTitle}>Shipment Milestones</Text>
            </View>

            {/* NO RIDER / NO GPS note */}
            <View style={styles.noRiderNote}>
              <Ionicons
                name="train-outline"
                size={14}
                color="#5D4037"
              />
              <Text style={styles.noRiderNoteText}>
                Long-distance courier logistics — tracked by milestone.{`\n`}
                No live GPS. Estimated 3–4 days from dispatch.
              </Text>
            </View>

            {MILESTONES.map((m, i) => (
              <MilestoneStep
                key={i}
                step={m}
                index={i}
                currentStep={d2cOrder.milestoneIndex}
                isLast={i === MILESTONES.length - 1}
              />
            ))}
          </View>

          {/* ── CTA buttons ── */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={handleExploreMore}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={16} color="#111111" />
              <Text style={styles.exploreBtnText}>Explore More Originals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={handleGoHome}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={16} color="#FFC107" />
              <Text style={styles.homeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // Success block
  successBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#43A047',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  successSub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },

  // Origin certificate card
  certificateCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  certificateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFC107',
    flex: 1,
  },
  certificateSeal: {
    backgroundColor: 'rgba(255,193,7,0.2)',
    borderWidth: 1,
    borderColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  certificateSealText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFC107',
    letterSpacing: 0.8,
  },
  certificateQuote: {
    fontSize: 13,
    color: '#E0E0E0',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  certificateCaption: {
    fontSize: 10,
    color: '#FFC107',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Summary card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: 14,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  d2cBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: 14,
  },
  d2cBadgeText: { fontSize: 10, fontWeight: '700', color: '#B8860B' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 13, color: '#777' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', maxWidth: '60%', textAlign: 'right' },
  prepaidTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  prepaidTagText: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

  // Address
  addressBlock: { gap: 3 },
  addressIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  addressBlockTitle: { fontSize: 13, fontWeight: '600', color: '#424242' },
  addressLine: { fontSize: 13, color: '#555', lineHeight: 18 },

  // Pricing
  pricingBlock: { gap: 6 },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pricingLabel: { fontSize: 13, color: '#777' },
  pricingVal: { fontSize: 13, fontWeight: '500', color: '#424242' },
  pricingTotalRow: { marginTop: 4 },
  pricingTotalLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  pricingTotalVal: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },

  // Tracker
  trackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 14,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  trackerTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  noRiderNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  noRiderNoteText: { flex: 1, fontSize: 11, color: '#5D4037', lineHeight: 16 },

  // Milestone
  milestoneRow: { flexDirection: 'row', marginBottom: 0 },
  milestoneIconCol: { alignItems: 'center', width: 32 },
  milestoneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  milestoneCircleDone: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  milestoneCircleActive: {
    backgroundColor: '#FFC107',
    borderColor: '#FF8F00',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: '#E0E0E0',
    marginVertical: 2,
  },
  milestoneLineDone: { backgroundColor: '#FFC107' },
  milestoneText: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  milestoneLabel: { fontSize: 13, fontWeight: '600', color: '#9E9E9E' },
  milestoneLabelDone: { color: '#1A1A1A' },
  milestoneLabelActive: { color: '#E65100', fontWeight: '700' },
  milestoneLiveTag: { fontSize: 11, color: '#E65100', fontStyle: 'italic' },
  milestoneSub: { fontSize: 11, color: '#9E9E9E', marginTop: 2, lineHeight: 15 },

  // CTAs
  ctaRow: { gap: 10, marginBottom: 8 },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreBtnText: { fontSize: 15, fontWeight: '700', color: '#111111' },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    backgroundColor: '#FFFFFF',
  },
  homeBtnText: { fontSize: 15, fontWeight: '600', color: '#FFC107' },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: '#9E9E9E' },
});
