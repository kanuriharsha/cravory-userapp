import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../services/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'restaurants' | 'menu' | 'categories'>('restaurants');
  const [restaurants, setRestaurants] = useState<Array<any>>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('');

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    image: '',
    rating: '4.5',
    deliveryTime: '30-40 mins',
    distance: '2.5 km',
    isOpen: true
  });

  // Menu item form state
  const [menuItemForm, setMenuItemForm] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isVeg: true,
    isAvailable: true
  });

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const fetchRestaurants = async (q = '') => {
    try {
      const token = await getAuthToken();
      const resp = await axios.get(`${API_URL}/admin/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q }
      });
      if (resp?.data) {
        setRestaurants(resp.data.data || resp.data);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants', err);
    }
  };

  useEffect(() => {
    // Load restaurants for selection in menu form
    fetchRestaurants();
  }, []);

  const handleAddRestaurant = async () => {
    if (!restaurantForm.name || !restaurantForm.cuisine || !restaurantForm.address || !restaurantForm.image) {
      Alert.alert('Error', 'Please fill in all required fields (name, cuisine, address, image)');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_URL}/admin/restaurants`,
        restaurantForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Success', 'Restaurant added successfully!');
      setRestaurantForm({
        name: '',
        cuisine: '',
        address: '',
        phone: '',
        image: '',
        rating: '4.5',
        deliveryTime: '30-40 mins',
        distance: '2.5 km',
        isOpen: true
      });
    } catch (error: any) {
      console.error('Error adding restaurant:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async () => {
    if (!menuItemForm.restaurantId || !menuItemForm.name || !menuItemForm.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_URL}/admin/menu-items`,
        {
          ...menuItemForm,
          price: parseFloat(menuItemForm.price)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Success', 'Menu item added successfully!');
      setMenuItemForm({
        restaurantId: '',
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isVeg: true,
        isAvailable: true
      });
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurantForm = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add New Restaurant</Text>

      <Text style={styles.label}>Restaurant Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter restaurant name"
        value={restaurantForm.name}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, name: text })}
      />

      <Text style={styles.label}>Cuisine Type *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Italian, Indian, Chinese"
        value={restaurantForm.cuisine}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, cuisine: text })}
      />

      <Text style={styles.label}>Image URL *</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/image.jpg"
        value={restaurantForm.image}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, image: text })}
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full address"
        value={restaurantForm.address}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, address: text })}
        multiline
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={restaurantForm.phone}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, phone: text })}
      />

      <Text style={styles.label}>Rating (0-5)</Text>
      <TextInput
        style={styles.input}
        placeholder="4.5"
        keyboardType="decimal-pad"
        value={restaurantForm.rating}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, rating: text })}
      />

      <Text style={styles.label}>Delivery Time</Text>
      <TextInput
        style={styles.input}
        placeholder="30-40 mins"
        value={restaurantForm.deliveryTime}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, deliveryTime: text })}
      />

      <Text style={styles.label}>Distance</Text>
      <TextInput
        style={styles.input}
        placeholder="2.5 km"
        value={restaurantForm.distance}
        onChangeText={(text) => setRestaurantForm({ ...restaurantForm, distance: text })}
      />

      <TouchableOpacity
        style={[styles.toggleButton, restaurantForm.isOpen && styles.toggleButtonActive]}
        onPress={() => setRestaurantForm({ ...restaurantForm, isOpen: !restaurantForm.isOpen })}
      >
        <Text style={styles.toggleText}>
          Restaurant is {restaurantForm.isOpen ? 'Open' : 'Closed'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAddRestaurant}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Add Restaurant</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMenuItemForm = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add Menu Item</Text>

      <Text style={styles.label}>Restaurant *</Text>

      <TouchableOpacity
        style={styles.dropdownField}
        activeOpacity={0.8}
        onPress={() => setDropdownOpen((v) => !v)}
      >
        <Text style={selectedRestaurantName ? styles.selectedText : styles.dropdownPlaceholder}>
          {selectedRestaurantName || 'Tap to select a restaurant'}
        </Text>
        <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
      </TouchableOpacity>

      {dropdownOpen && restaurants.length > 0 && (
        <ScrollView style={styles.dropdownList}>
          {restaurants.map((r: any) => (
            <TouchableOpacity
              key={r._id}
              style={[styles.restaurantListItem, menuItemForm.restaurantId === r._id && styles.restaurantListItemActive]}
              onPress={() => {
                setMenuItemForm({ ...menuItemForm, restaurantId: r._id });
                setSelectedRestaurantName(r.name);
                // close dropdown after selection
                setDropdownOpen(false);
              }}
            >
              <Text style={styles.restaurantListName}>{r.name}</Text>
              <Text style={styles.restaurantListMeta}>{r.cuisine || r.address || ''}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>Item Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        value={menuItemForm.name}
        onChangeText={(text) => setMenuItemForm({ ...menuItemForm, name: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter description"
        value={menuItemForm.description}
        onChangeText={(text) => setMenuItemForm({ ...menuItemForm, description: text })}
        multiline
      />

      <Text style={styles.label}>Price *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter price"
        keyboardType="decimal-pad"
        value={menuItemForm.price}
        onChangeText={(text) => setMenuItemForm({ ...menuItemForm, price: text })}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Starters, Main Course"
        value={menuItemForm.category}
        onChangeText={(text) => setMenuItemForm({ ...menuItemForm, category: text })}
      />

      <Text style={styles.label}>Item Image URL</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/item-image.jpg"
        value={menuItemForm.image}
        onChangeText={(text) => setMenuItemForm({ ...menuItemForm, image: text })}
      />

      <TouchableOpacity
        style={[styles.toggleButton, menuItemForm.isVeg && styles.toggleButtonActive]}
        onPress={() => setMenuItemForm({ ...menuItemForm, isVeg: !menuItemForm.isVeg })}
      >
        <Text style={styles.toggleText}>
          {menuItemForm.isVeg ? '🥬 Vegetarian' : '🍖 Non-Vegetarian'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggleButton, menuItemForm.isAvailable && styles.toggleButtonActive]}
        onPress={() => setMenuItemForm({ ...menuItemForm, isAvailable: !menuItemForm.isAvailable })}
      >
        <Text style={styles.toggleText}>
          Item is {menuItemForm.isAvailable ? 'Available' : 'Unavailable'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAddMenuItem}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Add Menu Item</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'restaurants' && styles.tabActive]}
          onPress={() => setActiveSection('restaurants')}
        >
          <Ionicons name="restaurant" size={20} color={activeSection === 'restaurants' ? '#FF6B35' : '#666'} />
          <Text style={[styles.tabText, activeSection === 'restaurants' && styles.tabTextActive]}>
            Restaurants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'menu' && styles.tabActive]}
          onPress={() => setActiveSection('menu')}
        >
          <Ionicons name="fast-food" size={20} color={activeSection === 'menu' ? '#FF6B35' : '#666'} />
          <Text style={[styles.tabText, activeSection === 'menu' && styles.tabTextActive]}>
            Menu Items
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === 'restaurants' && renderRestaurantForm()}
        {activeSection === 'menu' && renderMenuItemForm()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  restaurantListItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantListItemActive: {
    backgroundColor: '#FFF7F4',
  },
  restaurantListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  restaurantListMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  selectedText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600'
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF'
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFF4F0',
    borderColor: '#FF6B35',
  },
  toggleText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
