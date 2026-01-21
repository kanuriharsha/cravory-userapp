import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockRestaurants, mockMenuItems } from '../../data/mockData';
import { useOrderStore } from '../../store/orderStore';
import ProgressBar from '../../components/ProgressBar';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addToCart = useOrderStore(state => state.addToCart);
  const cart = useOrderStore(state => state.cart);
  const totalItems = useOrderStore(state => state.getTotalItems());
  
  const restaurant = mockRestaurants.find(r => r.id === id);
  const menuItems = mockMenuItems[id as string] || [];

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      restaurantId: id as string,
      restaurantName: restaurant.name,
    });
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <Image source={restaurant.image} style={styles.restaurantImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <View style={styles.metaItem}>
              <Ionicons name="navigate" size={16} color="#666" />
              <Text style={styles.metaText}>{restaurant.distance}</Text>
            </View>
          </View>
        </View>

        {/* Offer Banner */}
        <View style={styles.offerBanner}>
          <Ionicons name="pricetag" size={20} color="#FF6B35" />
          <Text style={styles.offerText}>50% off up to ₹100 on orders above ₹199</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>
          {menuItems.map(item => {
            const quantity = getItemQuantity(item.id);
            return (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemInfo}>
                  <View style={styles.vegIndicator}>
                    <View style={[styles.vegDot, !item.isVeg && styles.nonVegDot]} />
                  </View>
                  <View style={styles.menuItemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                </View>
                <View>
                  <Image source={item.image} style={styles.itemImage} />
                  {quantity > 0 ? (
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => {
                          const updateQuantity = useOrderStore.getState().updateQuantity;
                          updateQuantity(item.id, quantity - 1);
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#FF6B35" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Ionicons name="add" size={16} color="#FF6B35" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* View Cart Button */}
      {totalItems > 0 && (
        <TouchableOpacity 
          style={styles.viewCartButton}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartInfo}>
            <Text style={styles.cartItems}>{totalItems} items</Text>
            <Text style={styles.cartTotal}>₹{useOrderStore.getState().getTotalAmount()}</Text>
          </View>
          <Text style={styles.viewCartText}>View Cart</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 16,
  },
  searchButton: {
    padding: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  infoContainer: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  metaDivider: {
    marginHorizontal: 12,
    color: '#999',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FFF4F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0D6',
    marginBottom: 16,
  },
  offerText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemInfo: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 16,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  nonVegDot: {
    backgroundColor: '#F44336',
  },
  menuItemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    width: 32,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    paddingHorizontal: 12,
  },
  viewCartButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});