import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AnimationConfig } from '@/utils/animations';
import { ensureTouchTarget, AccessibilityProps } from '@/utils/accessibility';

interface AnimatedButtonProps extends TouchableOpacityProps, Partial<AccessibilityProps> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleValue?: number; // タップ時のスケール値（デフォルト: 0.95）
  hapticFeedback?: boolean; // ハプティックフィードバックを有効にするか（将来の拡張用）
  minTouchTarget?: number; // 最小タッチターゲットサイズ（デフォルト: 44）
}

/**
 * タップ時にアニメーションするボタンコンポーネント
 * TouchableOpacityの代わりに使用することで、より滑らかなタップフィードバックを提供
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  disabled = false,
  scaleValue = 0.95,
  onPressIn,
  onPressOut,
  hapticFeedback = false,
  minTouchTarget = 44,
  accessible = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: any) => {
    if (!disabled) {
      scale.value = withTiming(scaleValue, { duration: AnimationConfig.tap.duration });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (!disabled) {
      scale.value = withSpring(1, AnimationConfig.spring);
    }
    onPressOut?.(event);
  };

  const touchTargetProps = ensureTouchTarget(minTouchTarget);

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled,
        ...accessibilityState,
      }}
      {...touchTargetProps}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

/**
 * より強いバウンス効果を持つボタン
 * 重要なアクションボタンなどに使用
 */
export const BounceButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  disabled = false,
  onPress,
  minTouchTarget = 44,
  accessible = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (event: any) => {
    if (!disabled) {
      scale.value = withSequence(
        withSpring(0.9, { damping: 10, stiffness: 200 }),
        withSpring(1.05, { damping: 10, stiffness: 200 }),
        withSpring(1, AnimationConfig.spring)
      );
    }
    onPress?.(event);
  };

  const touchTargetProps = ensureTouchTarget(minTouchTarget);

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled}
      onPress={handlePress}
      activeOpacity={1}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled,
        ...accessibilityState,
      }}
      {...touchTargetProps}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};
