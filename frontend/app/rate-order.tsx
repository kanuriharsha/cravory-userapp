import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore } from '../store/orderStore';

export default function RateOrderScreen() {
  const router = useRouter();
  const cart = useOrderStore(state => state.cart);
  const currentOrderId = useOrderStore(state => state.currentOrderId);
  const clearCart = useOrderStore(state => state.clearCart);
  
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    // Submit ratings and review
    clearCart();
    router.replace('/(tabs)');
  };

  const RatingStars = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Ionicons 
            name={star <= rating ? 'star' : 'star-outline'} 
            size={32} 
            color={star <= rating ? '#FFC107' : '#E0E0E0'} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.title}>Order Delivered!</Text>
          <Text style={styles.subtitle}>Thank you for ordering</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order #{currentOrderId}</Text>
          <Text style={styles.restaurantName}>{cart[0]?.restaurantName}</Text>
        </View>

        {/* Food Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Food Quality</Text>
          <RatingStars rating={foodRating} onRate={setFoodRating} />
        </View>

        {/* Delivery Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Delivery Experience</Text>
          <RatingStars rating={deliveryRating} onRate={setDeliveryRating} />
        </View>

        {/* Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Write a Review (Optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        {/* Quick Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Quick Tags</Text>
          <View style={styles.tagsContainer}>
            {['Delicious', 'Hot & Fresh', 'On Time', 'Great Packaging', 'Good Quantity'].map(tag => (
              <TouchableOpacity key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reorder Button */}
        <TouchableOpacity style={styles.reorderButton}>
          <Ionicons name="repeat" size={20} color="#FF6B35" />
          <Text style={styles.reorderText}>Reorder</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit & Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          clearCart();
          router.replace('/(tabs)');
        }}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  orderCard: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  ratingSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 100,
  },
  tagsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0D6',
  },
  reorderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});