import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // フェードイン & スケールイン
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinnerContainer, containerAnimatedStyle]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </Animated.View>
      {message && (
        <Animated.View style={messageAnimatedStyle}>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.secondary,
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
});
