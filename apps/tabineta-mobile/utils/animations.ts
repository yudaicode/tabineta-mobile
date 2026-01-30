import {
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

/**
 * アニメーション設定の定数
 */
export const AnimationConfig = {
  // タップフィードバック
  tap: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
  },
  // スプリングアニメーション
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  // フェード
  fade: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  // スライド
  slide: {
    duration: 300,
    easing: Easing.out(Easing.exp),
  },
  // スケール
  scale: {
    duration: 200,
    easing: Easing.inOut(Easing.ease),
  },
};

/**
 * ボタンタップ時のスケールアニメーション
 */
export const buttonTapAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withTiming(0.95, { duration: AnimationConfig.tap.duration }),
    withTiming(1, { duration: AnimationConfig.tap.duration })
  );
};

/**
 * いいねボタンのアニメーション
 */
export const likeButtonAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withTiming(0, { duration: 0 }),
    withSpring(1.2, AnimationConfig.spring),
    withSpring(1, AnimationConfig.spring)
  );
};

/**
 * ハートの鼓動アニメーション
 */
export const heartbeatAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withRepeat(
    withSequence(
      withTiming(1.1, { duration: 300 }),
      withTiming(1, { duration: 300 })
    ),
    -1,
    true
  );
};

/**
 * フェードインアニメーション
 */
export const fadeIn = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withTiming(1, AnimationConfig.fade);
};

/**
 * フェードアウトアニメーション
 */
export const fadeOut = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withTiming(0, AnimationConfig.fade);
};

/**
 * スライドインアニメーション（上から）
 */
export const slideInFromTop = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withTiming(0, AnimationConfig.slide);
};

/**
 * スライドアウトアニメーション（上へ）
 */
export const slideOutToTop = (translateY: SharedValue<number>, distance: number = -100) => {
  'worklet';
  translateY.value = withTiming(distance, AnimationConfig.slide);
};

/**
 * スライドインアニメーション（下から）
 */
export const slideInFromBottom = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withTiming(0, AnimationConfig.slide);
};

/**
 * スライドアウトアニメーション（下へ）
 */
export const slideOutToBottom = (translateY: SharedValue<number>, distance: number = 100) => {
  'worklet';
  translateY.value = withTiming(distance, AnimationConfig.slide);
};

/**
 * スケールインアニメーション
 */
export const scaleIn = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSpring(1, AnimationConfig.spring);
};

/**
 * スケールアウトアニメーション
 */
export const scaleOut = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withTiming(0, AnimationConfig.scale);
};

/**
 * 回転アニメーション
 */
export const rotate360 = (rotation: SharedValue<number>) => {
  'worklet';
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000, easing: Easing.linear }),
    -1,
    false
  );
};

/**
 * バウンスアニメーション
 */
export const bounce = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withSequence(
    withSpring(-10, { damping: 8, stiffness: 200 }),
    withSpring(0, { damping: 8, stiffness: 200 })
  );
};

/**
 * シェイクアニメーション
 */
export const shake = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};
