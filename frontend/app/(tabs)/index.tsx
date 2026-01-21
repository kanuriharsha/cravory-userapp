import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockRestaurants, mockCategories, mockOffers } from '../../data/mockData';
import { useOrderStore } from '../../store/orderStore';
import ProgressBar from '../../components/ProgressBar';

export default function HomeScreen() {
  const router = useRouter();
  const deliveryAddress = useOrderStore(state => state.deliveryAddress);
  const totalItems = useOrderStore(state => state.getTotalItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#FF6B35" />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Deliver to</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {deliveryAddress}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
          {mockRestaurants.map(restaurant => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              activeOpacity={0.7}
            >
              <Image source={restaurant.image} style={styles.restaurantImage} />
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
                  <Text style={styles.metaText}>{restaurant.distance}</Text>
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

      {/* Admin Add Restaurant Button */}
      {isAdmin && (
        <TouchableOpacity 
          style={[styles.cartButton, styles.adminButton]}
          onPress={() => router.push('/admin')}
          activeOpacity={0.9}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.cartButtonText}>Add Restaurant</Text>
          <Ionicons name="restaurant" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems}</Text>
          </View>
          <Text style={styles.cartButtonText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0D6',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
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
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  offerCodeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
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
    backgroundColor: '#FFF4F0',
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
  cartButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  cartButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  adminButton: {
    backgroundColor: '#10B981',
    bottom: 160,
  },
});