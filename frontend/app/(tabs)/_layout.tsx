import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useOrderStore } from '../../store/orderStore';

export default function TabLayout() {
  const totalItems = useOrderStore(state => state.getTotalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFC107',
        tabBarInactiveTintColor: 'rgba(17,17,17,0.6)',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="cart" size={size} color={color} />
              {totalItems > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: '#FF3B30',
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 'bold',
                  }}>{totalItems}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="authentic-originals"
        options={{
          title: 'Originals',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={focused ? styles.activeIconWrapper : null}>
                <Ionicons
                  name="lock-closed"
                  size={focused ? 20 : 18}
                  color={focused ? '#FFC107' : color}
                />
              </View>
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? '700' : '400',
                color: focused ? '#FFC107' : color,
                letterSpacing: focused ? 0.3 : 0,
              }}
            >
              Originals
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrapper: {
    backgroundColor: '#FFF8E1',
    padding: 4,
    borderRadius: 10,
  },
});