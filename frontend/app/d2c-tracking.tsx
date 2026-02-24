/**
 * D2C Tracking Screen — Part 15
 *
 * Shows the full 7-milestone vertical timeline for an Authentic Originals order.
 * Architecture restrictions:
 *  • Milestone-based only — NO live GPS tracking
 *  • NO rider assignment display
 *  • Outsourced courier partner (Delhivery placeholder)
 *  • 3-4 day estimated delivery window
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useD2CStore, D2C_MILESTONES } from '../store/d2cStore';

// ── Status explanation map ─────────────────────────────────────────────────
const STATUS_EXPLANATION: Record<string, string> = {
  order_confirmed:
    'We have received your order and confirmed it with the origin artisan. They will begin preparing your authentic item shortly.',
  preparing_at_origin:
    'Skilled artisans at the origin town are handcrafting or sourcing your authentic product. This step ensures quality.',
  packed_ready:
    'Your item has been carefully quality-checked and packed using premium, food-safe packaging to preserve freshness during transit.',
  shipped_origin:
    'Your package has been handed over to our courier partner at the origin location and is now officially in the logistics network.',
  in_transit:
    'Your package is travelling the long-distance route from the origin town to your delivery city. No live GPS — estimated arrival 3–4 days.',
  out_for_delivery:
    'Your package has reached the local delivery hub and is out for final delivery today. Please keep your phone accessible.',
  delivered:
    'Your Authentic Originals order has been delivered! Enjoy the taste of origin. Rate your experience in the Orders tab.',
};

// ── Timeline step component ────────────────────────────────────────────────
function MilestoneStep({
  milestone,
  index,
  currentIndex,
  isLast,
  onShowQR,
}: {
  milestone: (typeof D2C_MILESTONES)[number];
  index: number;
  currentIndex: number;
  isLast: boolean;
  onShowQR?: () => void;
}) {
  const isDone = index <= currentIndex;
  const isCurrent = index === currentIndex;

  return (
    <View style={styles.stepRow}>
      {/* Left: icon + connector line */}
      <View style={styles.stepIconCol}>
        <View
          style={[
            styles.stepCircle,
            isDone && styles.stepCircleDone,
            isCurrent && styles.stepCircleCurrent,
          ]}
        >
          <Ionicons
            name={milestone.icon as any}
            size={18}
            color={isDone ? '#FFFFFF' : '#BDBDBD'}
          />
        </View>
        {!isLast && (
          <View style={[styles.connector, isDone && styles.connectorDone]} />
        )}
      </View>

      {/* Right: text */}
      <View style={styles.stepContent}>
        <Text
          style={[styles.stepLabel, isDone && styles.stepLabelDone]}
          numberOfLines={1}
        >
          {milestone.label}
        </Text>
        <Text style={styles.stepSub}>{milestone.sub}</Text>
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>● Current Stage</Text>
          </View>
        )}
        {isCurrent && (
          <Text style={styles.statusExplanation}>
            {STATUS_EXPLANATION[milestone.key]}
          </Text>
        )}
        {/* ── Part 17: QR button when Out for Delivery ── */}
        {isCurrent && milestone.key === 'out_for_delivery' && onShowQR && (
          <TouchableOpacity style={styles.qrButton} onPress={onShowQR} activeOpacity={0.8}>
            <Ionicons name="qr-code" size={16} color="#111" style={{ marginRight: 8 }} />
            <Text style={styles.qrButtonText}>Show QR Code to Receive</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function D2CTrackingScreen() {
  const router = useRouter();
  const d2cOrder = useD2CStore((s) => s.d2cOrder);

  if (!d2cOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No active D2C order</Text>
          <Text style={styles.emptyText}>
            Place an Authentic Originals order to track it here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { product, address, pricing, milestoneIndex, courierPartner, placedAt, orderId } = d2cOrder;

  const placedDate = new Date(placedAt);
  const etaStart = new Date(placedDate);
  etaStart.setDate(etaStart.getDate() + 3);
  const etaEnd = new Date(placedDate);
  etaEnd.setDate(etaEnd.getDate() + 5);
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const etaWindow = `${formatDate(etaStart)} – ${formatDate(etaEnd)}`;

  const currentMilestone = D2C_MILESTONES[milestoneIndex];
  const isDelivered = milestoneIndex === D2C_MILESTONES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Premium Origin Journey Banner ── */}
        <View style={styles.journeyBanner}>
          <View style={styles.journeyBannerContent}>
            <View style={styles.journeyBannerBadge}>
              <Ionicons name="ribbon" size={11} color="#B8860B" />
              <Text style={styles.journeyBannerBadgeText}>AUTHENTIC ORIGINALS · ORIGIN DELIVERY</Text>
            </View>
            <Text style={styles.journeyBannerTitle}>{product.name}</Text>
            <Text style={styles.journeyBannerSub}>
              Travelling from {product.region}, {product.stateName}{`\n`}directly to your doorstep.
            </Text>
          </View>
          <View style={styles.journeyBannerStatus}>
            <Text style={styles.journeyBannerStatusIcon}>{isDelivered ? '✅' : '🚚'}</Text>
            <Text style={styles.journeyBannerStatusText}>
              {isDelivered ? 'DELIVERED' : 'IN TRANSIT'}
            </Text>
          </View>
        </View>

        {/* ── Badge ── */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📦 Long-Distance Authentic Delivery</Text>
          </View>
        </View>

        {/* ── Order summary ── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Order ID</Text>
          <Text style={styles.cardValue}>{orderId}</Text>
          <Text style={styles.cardLabel}>Product</Text>
          <Text style={styles.cardValue}>{product.name}</Text>
          <Text style={styles.cardStatusLine}>
            {isDelivered ? '✅ Delivered' : `🚚 ${currentMilestone.label}`}
          </Text>
        </View>

        {/* ── Route info ── */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routePin}>
              <Ionicons name="location" size={18} color="#FFC107" />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>Origin</Text>
              <Text style={styles.routeValue}>
                {product.region}, {product.stateName}
              </Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeRow}>
            <View style={styles.routePin}>
              <Ionicons name="home" size={18} color="#4CAF50" />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeValue} numberOfLines={2}>
                {address.address}, {address.city}, {address.state} – {address.pincode}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Delivery info strip ── */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#FFC107" />
            <Text style={styles.infoLabel}>Est. Delivery</Text>
            <Text style={styles.infoValue}>{etaWindow}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#FFC107" />
            <Text style={styles.infoLabel}>Delivery Window</Text>
            <Text style={styles.infoValue}>3–4 Days</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={20} color="#FFC107" />
            <Text style={styles.infoLabel}>Courier</Text>
            <Text style={styles.infoValue}>{courierPartner ?? 'TBD'}</Text>
          </View>
        </View>

        {/* ── Courier Partner Trust ── */}
        <View style={styles.courierCard}>
          <View style={styles.courierCardHeader}>
            <Ionicons name="business-outline" size={16} color="#FFC107" />
            <Text style={styles.courierCardTitle}>Long-Distance Courier Partner</Text>
          </View>
          <View style={styles.courierDetailsRow}>
            <View style={styles.courierDetail}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#4CAF50" />
              <Text style={styles.courierDetailText}>Vetted Partner</Text>
            </View>
            <View style={styles.courierDetail}>
              <Ionicons name="cube-outline" size={14} color="#FFC107" />
              <Text style={styles.courierDetailText}>Food-Safe Logistics</Text>
            </View>
            <View style={styles.courierDetail}>
              <Ionicons name="navigate-outline" size={14} color="#2196F3" />
              <Text style={styles.courierDetailText}>Milestone Tracked</Text>
            </View>
          </View>
          <Text style={styles.courierPartnerName}>
            {courierPartner ?? 'Courier Partner: To Be Assigned'}
          </Text>
        </View>

        {/* ── Milestone timeline ── */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Progress</Text>
          {D2C_MILESTONES.map((m, i) => (
            <MilestoneStep
              key={m.key}
              milestone={m}
              index={i}
              currentIndex={milestoneIndex}
              isLast={i === D2C_MILESTONES.length - 1}
              onShowQR={
                m.key === 'out_for_delivery'
                  ? () => router.push(`/qr-delivery?orderId=${orderId}&type=d2c` as any)
                  : undefined
              }
            />
          ))}
        </View>

        {/* ── Note ── */}
        <View style={styles.noteCard}>
          <Ionicons name="train-outline" size={18} color="#B8860B" />
          <Text style={styles.noteText}>
            Origin deliveries travel long-distance via secure courier logistics.
            Milestone tracked for transparency. 3–4 days estimated from dispatch date.
            Premium packaging preserves freshness throughout the journey.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  // Premium Journey Banner
  journeyBanner: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  journeyBannerContent: { flex: 1 },
  journeyBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  journeyBannerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFC107',
    letterSpacing: 0.8,
  },
  journeyBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  journeyBannerSub: {
    fontSize: 12,
    color: '#BDBDBD',
    lineHeight: 18,
  },
  journeyBannerStatus: {
    alignItems: 'center',
    marginLeft: 12,
  },
  journeyBannerStatusIcon: { fontSize: 22 },
  journeyBannerStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFC107',
    letterSpacing: 1,
    marginTop: 4,
  },

  // Courier trust card
  courierCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  courierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  courierCardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  courierDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  courierDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  courierDetailText: { fontSize: 11, fontWeight: '600', color: '#424242' },
  courierPartnerName: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },

  // Badge
  badgeRow: { alignItems: 'center', marginTop: 16 },
  badge: {
    backgroundColor: '#FFFDE7',
    borderWidth: 1,
    borderColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#B8860B' },

  // Order summary card
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cardLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  cardValue: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  cardStatusLine: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFC107',
  },

  // Route card
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routePin: { marginRight: 12, marginTop: 2 },
  routeTextCol: { flex: 1 },
  routeLabel: { fontSize: 12, color: '#999' },
  routeValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginTop: 2 },
  routeDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },

  // Info strip
  infoStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#999', marginTop: 4, textAlign: 'center' },
  infoValue: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginTop: 2 },
  infoSep: { width: 1, backgroundColor: '#F0F0F0' },

  // Timeline card
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepIconCol: { alignItems: 'center', marginRight: 14, width: 40 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleDone: { backgroundColor: '#4CAF50' },
  stepCircleCurrent: { backgroundColor: '#FFC107' },
  connector: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#E0E0E0', marginVertical: 4 },
  connectorDone: { backgroundColor: '#4CAF50' },

  stepContent: { flex: 1, paddingTop: 8, paddingBottom: 20 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: '#BDBDBD' },
  stepLabelDone: { color: '#1A1A1A' },
  stepSub: { fontSize: 12, color: '#999', marginTop: 2 },
  currentBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  currentBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFC107' },
  statusExplanation: {
    fontSize: 13,
    color: '#555',
    marginTop: 8,
    lineHeight: 19,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDE7',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 8,
  },
  noteText: { flex: 1, fontSize: 12, color: '#6D4C00', lineHeight: 18 },
});
