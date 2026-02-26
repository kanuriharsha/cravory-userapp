import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockCategories, mockOffers } from '../../data/mockData';
import { restaurantService } from '../../services/api';
import { useOrderStore } from '../../store/orderStore';
import { useD2CStore, D2C_MILESTONES } from '../../store/d2cStore';
import ProgressBar from '../../components/ProgressBar';
import * as Location from 'expo-location';
import { normalizeRestaurant } from '../../utils/geo';

function getAddressDisplay(deliveryAddress: any): string {
  if (!deliveryAddress) return 'Select location';
  if (typeof deliveryAddress === 'string') return deliveryAddress;
  return (
    [deliveryAddress.city, deliveryAddress.state].filter(Boolean).join(', ') ||
    deliveryAddress.addressLine1 ||
    'Select location'
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);

  // D2C active order (Part 16)
  const d2cOrder = useD2CStore((s) => s.d2cOrder);
  const isD2COrderActive = useD2CStore((s) => s.isD2COrderActive)();
  const d2cMilestone = d2cOrder ? D2C_MILESTONES[d2cOrder.milestoneIndex] : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Array<any>>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Get user location first (required for the 3.5 km radius filter on the backend)
      let userPos: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 0,
          });
          if (pos?.coords) {
            userPos = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            console.log('Location obtained:', userPos);
          }
        } else {
          console.log('Location permission denied — cannot show nearby restaurants');
        }
      } catch (e) {
        console.warn('Location error:', e);
      }

      try {
        // Send live coordinates to the backend. The backend computes real-time
        // Haversine distance and returns only approved restaurants within 3.5 km.
        const apiParams: any = {};
        if (userPos) {
          apiParams.lat = userPos.latitude;
          apiParams.lng = userPos.longitude;
        }

        const resp: any = await restaurantService.getRestaurants(apiParams);
        const data = resp?.data || resp;
        const list = Array.isArray(data) ? data : (data?.data || []);

        // Normalize field names for the UI; computedDistance is already set by the backend
        const normalized = list.map(normalizeRestaurant);
        console.log(`[Nearby] ${normalized.length} restaurants within 3.5 km from backend`);
        if (mounted) setRestaurants(normalized);
      } catch (err) {
        console.error('[Nearby] Failed to fetch restaurants from API:', err);
        // Do NOT fall back to mock data — show an empty list so the user knows
        // no real restaurants were found rather than showing stale/fake data.
        if (mounted) setRestaurants([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#FFC107" />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Deliver to</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {getAddressDisplay(deliveryAddress)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── D2C Mini Tracking Banner (Part 16) ── */}
        {d2cOrder && isD2COrderActive && (
          <TouchableOpacity
            style={styles.d2cMiniBanner}
            onPress={() => router.push('/d2c-tracking')}
            activeOpacity={0.88}
          >
            <Text style={styles.d2cMiniBannerIcon}>📦</Text>
            <View style={styles.d2cMiniBannerText}>
              <Text style={styles.d2cMiniBannerTitle}>Authentic Originals Order In Transit</Text>
              <Text style={styles.d2cMiniBannerSub}>
                {d2cMilestone?.label} • {d2cOrder.product.region} → {d2cOrder.address.city}
              </Text>
            </View>
            <View style={styles.d2cMiniBannerBtn}>
              <Text style={styles.d2cMiniBannerBtnText}>Track</Text>
              <Ionicons name="arrow-forward" size={12} color="#111111" />
            </View>
          </TouchableOpacity>
        )}
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants or dishes"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── Authentic Originals Ad Card ── */}
        <TouchableOpacity
          style={styles.adCard}
          activeOpacity={0.88}
          onPress={() => router.push('/(tabs)/authentic-originals')}
        >
          <View style={styles.adCardInner}>
            {/* Left content */}
            <View style={styles.adCardContent}>
              <View style={styles.adPremiumBadge}>
                <Ionicons name="lock-closed" size={10} color="#B8860B" />
                <Text style={styles.adPremiumBadgeText}>🔒 Premium · Coming Soon</Text>
              </View>
              <Text style={styles.adCardTitle}>Authentic Originals</Text>
              <Text style={styles.adCardSubtitle}>
                Authentic regional foods delivered from their exact place of origin.
              </Text>
              <Text style={styles.adCardTagline}>Curated · Verified · Origin Sourced</Text>
              <View style={styles.adCTAButton}>
                <Text style={styles.adCTAText}>Explore Originals (Preview)</Text>
                <Ionicons name="arrow-forward" size={13} color="#111111" />
              </View>
            </View>
            {/* Right icon */}
            <View style={styles.adCardIconWrapper}>
              <View style={styles.adCardIconCircle}>
                <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Offers */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.offersContainer}
        >
          {mockOffers.map(offer => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
              <View style={styles.offerCode}>
                <Text style={styles.offerCodeText}>{offer.code}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {mockCategories.map(category => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants near you</Text>
          {restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={52} color="#DDD" />
              <Text style={styles.emptyTitle}>No restaurants available{'\n'}in your region</Text>
              <Text style={styles.emptySubText}>No approved restaurants found within 3.5 km of your location.</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.85}
              >
                <Ionicons name="search" size={16} color="#111111" />
                <Text style={styles.exploreButtonText}>Explore</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {restaurants.map(restaurant => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              activeOpacity={0.7}
            >
              <Image source={typeof restaurant.image === 'string' ? { uri: restaurant.image } : restaurant.image} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                <View style={styles.restaurantMeta}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{(restaurant as any).computedDistance ? `${((restaurant as any).computedDistance).toFixed(1)} km` : (restaurant.distance || 'N/A')}</Text>
                </View>
              </View>
              {!restaurant.isOpen && (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>Closed</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  offersContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  offerCard: {
    width: 280,
    padding: 16,
    marginRight: 12,
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF9C4',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  offerCode: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFC107',
    borderStyle: 'dashed',
  },
  offerCodeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingLeft: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFDE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  restaurantCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 26,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  metaDivider: {
    marginHorizontal: 8,
    color: '#999',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  closedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── D2C Mini Banner (Part 16) ──────────────────────────────────────────────
  d2cMiniBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFC107',
    gap: 10,
  },
  d2cMiniBannerIcon: { fontSize: 24 },
  d2cMiniBannerText: { flex: 1 },
  d2cMiniBannerTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  d2cMiniBannerSub: { fontSize: 11, color: '#666', marginTop: 2 },
  d2cMiniBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  d2cMiniBannerBtnText: { fontSize: 12, fontWeight: '700', color: '#111111' },

  // ── Authentic Originals Ad Card ──────────────────────────────────────────
  adCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#FFC107',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 7,
    overflow: 'hidden',
  },
  adCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  adCardContent: {
    flex: 1,
    marginRight: 12,
  },
  adPremiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  adPremiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B8860B',
    letterSpacing: 0.4,
  },
  adCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  adCardSubtitle: {
    fontSize: 12,
    color: '#3A3A3A',
    lineHeight: 17,
    marginBottom: 6,
  },
  adCardTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5D4037',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  adCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adCTAText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  adCardIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCardIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});