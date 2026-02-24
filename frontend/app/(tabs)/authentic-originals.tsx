import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useD2CStore, D2CProduct } from '../../store/d2cStore';

// ── Types ──────────────────────────────────────────────────────────────────
// Product extends D2CProduct so it can be passed directly to the D2C store.
// 'live' controls UI state (available vs locked).
interface Product extends D2CProduct {
  live: boolean;
  /** Short origin story shown on the card – builds trust and authenticity */
  originStory: string;
  /** Visual heritage tag shown as accent */
  heritageTag: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
// originPin is the vendor's PIN code used for backend routing only.
// It is NEVER rendered in the UI (Part 21: vendor routing hidden from users).
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kakinada Kaja',
    region: 'Kakinada',
    stateName: 'Andhra Pradesh',
    description:
      'Authentic Kaja freshly prepared in its original birthplace and shipped with premium protective packaging.',
    originStory:
      'Kaja has been crafted in Kakinada for over 200 years. Local sweetmakers follow a closely guarded recipe passed across generations — nowhere else replicates this exact taste.',
    heritageTag: '200+ Year Heritage',
    price: 349,
    originPin: '533001',
    live: true,
    deliveryDays: '3–4 Days',
  },
  {
    id: '2',
    name: 'Atreyapuram Pootharekulu',
    region: 'Atreyapuram',
    stateName: 'Andhra Pradesh',
    description: 'Paper-thin rice sweet handcrafted by artisans in Atreyapuram village.',
    originStory:
      'Pootharekulu — "paper sweet" — is an art form unique to Atreyapuram. Each sheet is hand-drawn from rice starch, layered with ghee and jaggery by skilled artisan families.',
    heritageTag: 'Village Artisan Craft',
    price: 499,
    originPin: '533212',
    live: false,
    deliveryDays: '3–4 Days',
  },
  {
    id: '3',
    name: 'Guntur Karam',
    region: 'Guntur',
    stateName: 'Andhra Pradesh',
    description: 'Authentic spice blend from Guntur, the chilli capital of India.',
    originStory:
      'Guntur grows 30% of India\'s chillies. The Guntur Sannam chilli — ground with regional spices — produces a heat profile and aroma that no imitation can match.',
    heritageTag: 'Chilli Capital of India',
    price: 249,
    originPin: '522001',
    live: false,
    deliveryDays: '3–4 Days',
  },
  {
    id: '4',
    name: 'Bhimavaram Chicken Pickle',
    region: 'Bhimavaram',
    stateName: 'Andhra Pradesh',
    description: 'Traditional slow-cooked chicken pickle made with origin spices and technique.',
    originStory:
      'Bhimavaram\'s chicken pickle uses a centuries-old slow-cook technique with locally sourced spices. Each batch is prepared in small quantities to preserve quality — not mass-produced.',
    heritageTag: 'Small-Batch Origin Recipe',
    price: 599,
    originPin: '534201',
    live: false,
    deliveryDays: '3–4 Days',
  },
];

const TRUST_TAGS = [
  { icon: '🏺', label: 'Verified Origin Partners — No Middlemen' },
  { icon: '📦', label: 'Premium Protective Packaging' },
  { icon: '📍', label: 'Origin-Sourced, Not Replicated' },
  { icon: '🚚', label: 'Long-Distance Secure Courier Delivery' },
  { icon: '🔒', label: 'Prepaid Only — Quality Guaranteed' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🔍',
    title: 'We Verify the Origin',
    detail: 'Every product is sourced directly from verified artisan producers at the origin town. No imitators, no substitutes.',
  },
  {
    step: '02',
    icon: '📦',
    title: 'Packed with Care',
    detail: 'Premium food-safe packaging preserves freshness across the long-distance journey from origin to your door.',
  },
  {
    step: '03',
    icon: '🚚',
    title: 'Delivered to Your Door',
    detail: 'Long-distance courier logistics with milestone-tracked updates. 3–4 day estimated delivery from dispatch.',
  },
];

// ── Notify Me Alert ────────────────────────────────────────────────────────
const handleNotify = (name: string) => {
  Alert.alert(
    'Notify Me',
    `We'll notify you when ${name} becomes available for order!`,
    [{ text: 'OK', style: 'default' }],
  );
};

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({
  product,
  onOrder,
}: {
  product: Product;
  /** Called when user taps Order Now – triggers D2C checkout flow */
  onOrder: (p: Product) => void;
}) {
  const isLive = product.live;

  return (
    <View style={[styles.productCard, !isLive && styles.productCardLocked]}>
      {/* Region badge */}
      <View style={styles.regionBadgeRow}>
        <View style={[styles.regionBadge, !isLive && styles.regionBadgeLocked]}>
          <Text style={styles.regionBadgeText}>
            📍 {product.region}, {product.stateName}
          </Text>
        </View>
        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color="#9E9E9E" />
            <Text style={styles.lockedBadgeText}>Coming Soon</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={[styles.productName, !isLive && styles.productNameLocked]}>
        {product.name}
      </Text>

      {/* Sub-label */}
      <Text style={styles.productSubLabel}>Authentic Origin{isLive ? '' : ' · Coming Soon'}</Text>

      {/* Description */}
      <Text style={[styles.productDescription, !isLive && styles.productDescriptionLocked]}>
        {product.description}
      </Text>

      {/* Origin Story */}
      {isLive && (
        <View style={styles.originStoryBox}>
          <View style={styles.originStoryHeader}>
            <Text style={styles.originStoryIcon}>🏺</Text>
            <Text style={styles.originStoryTitle}>Origin Story</Text>
            <View style={styles.heritageTag}>
              <Text style={styles.heritageTagText}>{product.heritageTag}</Text>
            </View>
          </View>
          <Text style={styles.originStoryText}>{product.originStory}</Text>
        </View>
      )}
      {!isLive && (
        <View style={[styles.originStoryBox, styles.originStoryBoxLocked]}>
          <Text style={styles.originStoryLockedText}>📖 Origin story revealed when live</Text>
        </View>
      )}

      {/* Delivery badge */}
      <View style={styles.deliveryRow}>
        <Ionicons name="cube-outline" size={14} color={isLive ? '#FFC107' : '#BDBDBD'} />
        <Text style={[styles.deliveryText, !isLive && styles.deliveryTextLocked]}>
          Long-Distance Delivery ({product.deliveryDays})
        </Text>
      </View>

      <View style={styles.productFooter}>
        <Text style={[styles.productPrice, !isLive && styles.productPriceLocked]}>
          {isLive ? `₹${product.price}` : '—'}
        </Text>

        {isLive ? (
          <TouchableOpacity
            style={styles.orderButton}
            activeOpacity={0.85}
            onPress={() => onOrder(product)}
          >
            <Ionicons name="flash" size={14} color="#111111" />
            <Text style={styles.orderButtonText}>Order Now (D2C Delivery)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.lockedActions}>
            <View style={styles.orderLockedButton}>
              <Ionicons name="lock-closed" size={13} color="#BDBDBD" />
              <Text style={styles.orderLockedText}>Order Locked</Text>
            </View>
            <TouchableOpacity
              style={styles.notifyButton}
              activeOpacity={0.85}
              onPress={() => handleNotify(product.name)}
            >
              <Ionicons name="notifications-outline" size={13} color="#FFC107" />
              <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function AuthenticOriginalsScreen() {
  const router = useRouter();
  const setD2cProduct = useD2CStore((s) => s.setD2cProduct);
  const updateD2cAddress = useD2CStore((s) => s.updateD2cAddress);

  /**
   * Enters the D2C checkout flow.
   * CRITICAL (Part 8 / Part 21):
   *  • Does NOT touch the local cart (orderStore)
   *  • Does NOT trigger rider assignment
   *  • Does NOT show 30-min timers
   *  • Opens the dedicated D2C checkout screen
   */
  const handleOrderNow = (product: Product) => {
    // Set product in dedicated D2C store (never touches local cart)
    setD2cProduct(product);
    // Pre-clear any stale address from previous D2C session
    updateD2cAddress({ fullName: '', mobile: '', address: '', city: '', state: '', pincode: '', landmark: '' });
    // Navigate to isolated D2C checkout (not /checkout, not /cart)
    router.push('/d2c-checkout' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* ── PREMIUM HEADER ── */}
        <View style={styles.headerGradient}>
          <View style={styles.headerOverlay}>
            <View style={styles.premiumBadge}>
              <Ionicons name="lock-closed" size={12} color="#B8860B" />
              <Text style={styles.premiumBadgeText}>PREMIUM · ORIGIN VERIFIED</Text>
            </View>
            <Text style={styles.headerTitle}>Authentic Originals</Text>
            <Text style={styles.headerSubheading}>
              Iconic regional specialties sourced directly from their origin towns.
            </Text>

            {/* Trust Tags */}
            <View style={styles.trustTagsContainer}>
              {TRUST_TAGS.map((tag, index) => (
                <View key={index} style={styles.trustTag}>
                  <Text style={styles.trustTagIcon}>{tag.icon}</Text>
                  <Text style={styles.trustTagLabel}>{tag.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── HERO BANNER ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerInner}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroAccentLine} />
              <Text style={styles.heroLabel}>ORIGIN DELIVERY</Text>
            </View>
            <Text style={styles.heroTitle}>Authentic Taste{'\n'}From Origin Towns</Text>
            <Text style={styles.heroTagline}>
              Not replicated. Not copied.{'\n'}Delivered from the real source.
            </Text>
            <View style={styles.heroInfoNote}>
              <Ionicons name="information-circle-outline" size={15} color="#FFC107" />
              <Text style={styles.heroInfoText}>
                Ships in 3–4 days via secure long-distance logistics.
              </Text>
            </View>
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.howItWorksSection}>
          <View style={styles.howItWorksHeader}>
            <View style={styles.sectionAccentLine} />
            <Text style={styles.howItWorksLabel}>HOW IT WORKS</Text>
          </View>
          <Text style={styles.howItWorksTitle}>From Origin Town{`\n`}to Your Doorstep</Text>
          <View style={styles.howItWorksSteps}>
            {HOW_IT_WORKS.map((step) => (
              <View key={step.step} style={styles.howStep}>
                <View style={styles.howStepLeft}>
                  <View style={styles.howStepNumberWrap}>
                    <Text style={styles.howStepNumber}>{step.step}</Text>
                  </View>
                  <Text style={styles.howStepIcon}>{step.icon}</Text>
                </View>
                <View style={styles.howStepRight}>
                  <Text style={styles.howStepTitle}>{step.title}</Text>
                  <Text style={styles.howStepDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── WHY ORIGIN MATTERS ── */}
        <View style={styles.manifestoCard}>
          <View style={styles.manifestoInner}>
            <Text style={styles.manifestoQuote}>
              "The taste of a place cannot be replicated.{`\n`}It must be experienced from its source."
            </Text>
            <Text style={styles.manifestoCaption}>— The Authentic Originals Philosophy</Text>
            <View style={styles.manifestoTagRow}>
              <View style={styles.manifestoTag}><Text style={styles.manifestoTagText}>Not Fast Food</Text></View>
              <View style={styles.manifestoTag}><Text style={styles.manifestoTagText}>Not Local Delivery</Text></View>
              <View style={styles.manifestoTag}><Text style={styles.manifestoTagText}>Origin Sourced</Text></View>
            </View>
          </View>
        </View>

        {/* ── SECTION LABEL ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Region-First Curation</Text>
          <Text style={styles.sectionSubtitle}>Handpicked from the source. No middlemen.</Text>
        </View>

        {/* ── PRODUCT LISTING ── */}
        <View style={styles.productsContainer}>
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} onOrder={handleOrderNow} />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  scroll: {
    flex: 1,
  },

  // Header
  headerGradient: {
    backgroundColor: '#FFC107',
    paddingBottom: 0,
  },
  headerOverlay: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    gap: 5,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B8860B',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubheading: {
    fontSize: 14,
    color: '#3A3A3A',
    lineHeight: 20,
    marginBottom: 18,
  },
  trustTagsContainer: {
    gap: 8,
  },
  trustTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustTagIcon: {
    fontSize: 15,
  },
  trustTagLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  // Hero Banner
  heroBanner: {
    margin: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFF0B3',
  },
  heroBannerInner: {
    padding: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroAccentLine: {
    width: 20,
    height: 3,
    backgroundColor: '#FFC107',
    borderRadius: 2,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC107',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 30,
    marginBottom: 10,
  },
  heroTagline: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  heroInfoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFDE7',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  heroInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 17,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  // Products container
  productsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },

  // Product Card
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productCardLocked: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E8E8E8',
    opacity: 0.88,
  },
  regionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  regionBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
    flexShrink: 1,
  },
  regionBadgeLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  regionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#795548',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#43A047',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  productNameLocked: {
    color: '#757575',
  },
  productSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFC107',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  productDescriptionLocked: {
    color: '#9E9E9E',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFA000',
  },
  deliveryTextLocked: {
    color: '#BDBDBD',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  // price is stored as number; rendered with ₹ prefix inline
  productPriceLocked: {
    color: '#BDBDBD',
    fontSize: 16,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  orderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  lockedActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  orderLockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderLockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BDBDBD',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  notifyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC107',
  },

  bottomPad: {
    height: 30,
  },

  // Origin Story box
  originStoryBox: {
    backgroundColor: '#FFFDE7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  originStoryBoxLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  originStoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  originStoryIcon: { fontSize: 14 },
  originStoryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#795548',
    letterSpacing: 0.5,
    flex: 1,
  },
  heritageTag: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  heritageTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.3,
  },
  originStoryText: {
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  originStoryLockedText: {
    fontSize: 12,
    color: '#BDBDBD',
    fontStyle: 'italic',
  },

  // How It Works
  howItWorksSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFF0B3',
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionAccentLine: {
    width: 16,
    height: 3,
    backgroundColor: '#FFC107',
    borderRadius: 2,
  },
  howItWorksLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC107',
    letterSpacing: 1.5,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 26,
    marginBottom: 16,
  },
  howItWorksSteps: {
    gap: 14,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  howStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  howStepRight: {
    flex: 1,
  },
  howStepNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  howStepNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
  },
  howStepIcon: {
    fontSize: 20,
    marginTop: 2,
    flexShrink: 0,
  },
  howStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  howStepDetail: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },

  // Manifesto card
  manifestoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },
  manifestoInner: {
    padding: 22,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  manifestoQuote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  manifestoCaption: {
    fontSize: 11,
    color: '#FFC107',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  manifestoTagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  manifestoTag: {
    backgroundColor: 'rgba(255,193,7,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  manifestoTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFC107',
  },
});
