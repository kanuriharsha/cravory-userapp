import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockRestaurants, mockMenuItems } from '../../data/mockData';
import { restaurantService } from '../../services/api';
import { useOrderStore } from '../../store/orderStore';
import ProgressBar from '../../components/ProgressBar';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addToCart = useOrderStore(state => state.addToCart);
  const cart = useOrderStore(state => state.cart);
  const totalItems = useOrderStore(state => state.getTotalItems());

  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!id) return;
        const respR: any = await restaurantService.getRestaurantById(id as string);
        const rData = respR?.data || respR;
        const respM: any = await restaurantService.getRestaurantMenu(id as string);
        const mData = respM?.data || respM;
        if (mounted) {
          setRestaurant(rData || (mockRestaurants.find(r => r.id === id) ?? null));
          setMenuItems(Array.isArray(mData) ? mData : (mData?.data || (mockMenuItems as any)[id as string] || []));
        }
      } catch (err) {
        console.warn('Failed to load restaurant/menu from API, falling back to mock', err);
        if (mounted) {
          setRestaurant(mockRestaurants.find(r => r.id === id) || null);
          setMenuItems((mockMenuItems as any)[id as string] || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const handleAddToCart = (item: any) => {
    const itemId = item.id || item._id; // Handle both id and _id fields
    addToCart({
      id: itemId,
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
        <Image source={typeof restaurant.image === 'string' ? { uri: restaurant.image } : restaurant.image} style={styles.restaurantImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          <View style={styles.metaRow}>
            <View key="rating" style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.metaText}>{restaurant.rating}</Text>
            </View>
            <Text key="divider1" style={styles.metaDivider}>•</Text>
            <View key="delivery" style={styles.metaItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
            </View>
            <Text key="divider2" style={styles.metaDivider}>•</Text>
            <View key="distance" style={styles.metaItem}>
              <Ionicons name="navigate" size={16} color="#666" />
              <Text style={styles.metaText}>{restaurant.distance}</Text>
            </View>
          </View>
        </View>

        {/* Offer Banner */}
        <View style={styles.offerBanner}>
          <Ionicons name="pricetag" size={20} color="#FFC107" />
          <Text style={styles.offerText}>50% off up to ₹100 on orders above ₹199</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>
          {menuItems.map((item, index) => {
            const itemId = item.id || item._id; // Handle both id and _id fields
            const quantity = getItemQuantity(itemId);
            return (
              <View key={itemId || `menu-item-${index}`} style={styles.menuItem}>
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
                  <Image 
                    source={item.image && item.image !== "" ? 
                      (typeof item.image === 'string' ? { uri: item.image } : item.image) : 
                      require('../../assets/images/food-naan.jpg')
                    } 
                    style={styles.itemImage} 
                    defaultSource={require('../../assets/images/food-naan.jpg')}
                  />
                  {quantity > 0 ? (
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => {
                          const updateQuantity = useOrderStore.getState().updateQuantity;
                          updateQuantity(itemId, quantity - 1);
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#FFC107" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Ionicons name="add" size={16} color="#FFC107" />
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
          <Ionicons name="arrow-forward" size={20} color="#111111" />
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
    backgroundColor: '#FFFDE7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF9C4',
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
    borderColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFC107',
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
    color: '#111111',
    paddingHorizontal: 12,
  },
  viewCartButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: 14,
    color: '#111111',
    opacity: 0.7,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
  },
  viewCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginRight: 8,
  },
});