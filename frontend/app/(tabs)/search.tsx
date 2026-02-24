import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { restaurantService } from '../../services/api';
import { normalizeRestaurant } from '../../utils/geo';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['Biryani', 'Pizza', 'Burger', 'Chinese']);
  const [restaurants, setRestaurants] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Search shows ALL restaurants — no lat/lng so the backend skips the 3.5 KM radius filter
        const resp: any = await restaurantService.getRestaurants({});
        const data = resp?.data || resp;
        const list = Array.isArray(data) ? data : (data?.data || []);
        const normalized = list.map(normalizeRestaurant);
        if (mounted) setRestaurants(normalized);
      } catch (err) {
        console.error('[Search] Failed to fetch restaurants:', err);
        if (mounted) setError('Could not load restaurants. Please check your connection.');
        if (mounted) setRestaurants([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant =>
    (restaurant.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (restaurant.cuisine || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants or dishes"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#FFC107" />
            <Text style={styles.stateSubText}>Finding restaurants near you...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="wifi-outline" size={56} color="#DDD" />
            <Text style={styles.stateTitle}>Connection Error</Text>
            <Text style={styles.stateSubText}>{error}</Text>
          </View>
        ) : searchQuery.length === 0 ? (
          <>
            {restaurants.length > 0 ? (
              <View style={styles.recentContainer}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.recentText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.centeredState}>
                <Ionicons name="location-outline" size={56} color="#DDD" />
                <Text style={styles.stateTitle}>No restaurants available{'\n'}in your region</Text>
                <Text style={styles.stateSubText}>Try searching for a specific dish or area</Text>
              </View>
            )}
          </>
        ) : filteredRestaurants.length === 0 ? (
          <View style={styles.centeredState}>
            <Ionicons name="search-outline" size={56} color="#DDD" />
            <Text style={styles.stateTitle}>No results for "{searchQuery}"</Text>
            <Text style={styles.stateSubText}>Try a different name or cuisine</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
            </Text>
            {filteredRestaurants.map(restaurant => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <Image
                  source={typeof restaurant.image === 'string' ? { uri: restaurant.image } : restaurant.image}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.restaurantMeta}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                    {restaurant.computedDistance != null && (
                      <>
                        <Text style={styles.metaDivider}>•</Text>
                        <Text style={styles.metaText}>{Number(restaurant.computedDistance).toFixed(1)} km</Text>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 26,
  },
  stateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recentContainer: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
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
});
