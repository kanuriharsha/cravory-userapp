import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockRestaurants } from '../../data/mockData';
import { restaurantService } from '../../services/api';
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { normalizeRestaurant, haversineDistanceKm } from '../../utils/geo';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState(['Biryani', 'Pizza', 'Burger', 'Chinese']);
  const [restaurants, setRestaurants] = useState<Array<any>>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (mounted && pos?.coords) setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }

        const resp: any = await restaurantService.getRestaurants();
        const data = resp?.data || resp;
        const list = Array.isArray(data) ? data : (data?.data || []);
        const normalized = list.map(normalizeRestaurant);
        if (userCoords) {
          normalized.forEach(r => {
            if (r.latitude != null && r.longitude != null) {
              (r as any).computedDistance = haversineDistanceKm(userCoords.latitude, userCoords.longitude, Number(r.latitude), Number(r.longitude));
            }
          });
          setRestaurants(normalized.filter(r => (r as any).computedDistance == null || (r as any).computedDistance <= 30));
        } else {
          setRestaurants(normalized);
        }
      } catch (err) {
        console.warn('Search: failed to fetch restaurants, using mock', err);
        setRestaurants(mockRestaurants.map(normalizeRestaurant));
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredRestaurants = (restaurants || mockRestaurants).filter(restaurant =>
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
        {searchQuery.length === 0 ? (
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
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {filteredRestaurants.length} results found
            </Text>
            {filteredRestaurants.map(restaurant => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <Image source={typeof restaurant.image === 'string' ? { uri: restaurant.image } : restaurant.image} style={styles.restaurantImage} />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.restaurantMeta}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
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