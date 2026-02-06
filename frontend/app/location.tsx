import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOrderStore } from '../store/orderStore';

export default function LocationScreen() {
  const router = useRouter();
  const setDeliveryAddress = useOrderStore(state => state.setDeliveryAddress);
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby restaurants. You can enter your location manually.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      setLocationGranted(true);

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Format address
      let formattedAddress = '';
      if (address) {
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.name && address.name !== address.street) parts.push(address.name);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.postalCode) parts.push(address.postalCode);
        
        formattedAddress = parts.join(', ') || 'Current Location';
      } else {
        formattedAddress = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
      }

      setDeliveryAddress(formattedAddress);

      // Continue to main tabs
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch your location. Please try again or enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/location-map.jpg')}
          style={styles.image}
        />
        
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={64} color="#FF6B35" />
        </View>

        <Text style={styles.title}>Enable Location Access</Text>
        <Text style={styles.description}>
          We need your location to show nearby restaurants and deliver your food accurately.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="restaurant-outline" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Find nearby restaurants</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="time-outline" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Accurate delivery time</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="navigate-outline" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Track your order live</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.allowButton, loading && styles.buttonDisabled]}
          onPress={handleAllowLocation}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.allowButtonText}>Allow Location Access</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.manualButton}
          onPress={async () => {
            setDeliveryAddress('MG Road, Bangalore, Karnataka 560001');
            
            // Continue to main tabs
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.manualButtonText}>Enter Location Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 32,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 16,
  },
  allowButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  manualButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});