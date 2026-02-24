import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useOrderStore } from '../store/orderStore';

export default function ProgressBar() {
  const orderProgress = useOrderStore(state => state.orderProgress);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: orderProgress,
      useNativeDriver: false,
      tension: 40,
      friction: 7
    }).start();
  }, [orderProgress]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  if (orderProgress === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            { width }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 44,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 2,
  },
});