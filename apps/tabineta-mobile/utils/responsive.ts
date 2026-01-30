import { Dimensions, Platform } from 'react-native';

/**
 * デバイスの画面サイズとブレークポイント
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ブレークポイント定義
 */
export const Breakpoints = {
  small: 375, // iPhone SE, 小型スマートフォン
  medium: 414, // 標準的なスマートフォン
  large: 768, // タブレット縦
  xlarge: 1024, // タブレット横、小型デスクトップ
};

/**
 * デバイスタイプ
 */
export const DeviceType = {
  isSmallPhone: SCREEN_WIDTH < Breakpoints.small,
  isPhone: SCREEN_WIDTH >= Breakpoints.small && SCREEN_WIDTH < Breakpoints.large,
  isTablet: SCREEN_WIDTH >= Breakpoints.large,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  isPortrait: SCREEN_WIDTH <= SCREEN_HEIGHT,
};

/**
 * 画面サイズに応じたスケーリング関数
 * @param size ベースサイズ
 * @param baseWidth ベースとなる画面幅（デフォルト: 375）
 */
export const scale = (size: number, baseWidth: number = 375): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * 垂直方向のスケーリング
 * @param size ベースサイズ
 * @param baseHeight ベースとなる画面高さ（デフォルト: 812）
 */
export const verticalScale = (size: number, baseHeight: number = 812): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * モデレートスケール（スケーリングの度合いを調整可能）
 * @param size ベースサイズ
 * @param factor スケーリング係数（0-1、デフォルト: 0.5）
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * 最小値と最大値を設定したスケーリング
 */
export const scaleWithMinMax = (
  size: number,
  min: number,
  max: number,
  baseWidth: number = 375
): number => {
  const scaled = scale(size, baseWidth);
  return Math.min(Math.max(scaled, min), max);
};

/**
 * レスポンシブ値を取得（画面サイズに応じて異なる値を返す）
 */
export const responsive = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  default: T;
}): T => {
  if (SCREEN_WIDTH >= Breakpoints.xlarge && values.xlarge !== undefined) {
    return values.xlarge;
  }
  if (SCREEN_WIDTH >= Breakpoints.large && values.large !== undefined) {
    return values.large;
  }
  if (SCREEN_WIDTH >= Breakpoints.medium && values.medium !== undefined) {
    return values.medium;
  }
  if (SCREEN_WIDTH < Breakpoints.small && values.small !== undefined) {
    return values.small;
  }
  return values.default;
};

/**
 * 向きに応じた値を取得
 */
export const orientation = <T,>(values: { portrait: T; landscape: T }): T => {
  return DeviceType.isLandscape ? values.landscape : values.portrait;
};

/**
 * プラットフォーム＆画面サイズに応じた値を取得
 */
export const platformResponsive = <T,>(values: {
  ios?: { small?: T; medium?: T; large?: T; default: T };
  android?: { small?: T; medium?: T; large?: T; default: T };
  web?: T;
  default: T;
}): T => {
  if (Platform.OS === 'ios' && values.ios) {
    return responsive({ ...values.ios });
  }
  if (Platform.OS === 'android' && values.android) {
    return responsive({ ...values.android });
  }
  if (Platform.OS === 'web' && values.web !== undefined) {
    return values.web;
  }
  return values.default;
};

/**
 * タッチターゲットの最小サイズ（アクセシビリティガイドライン）
 */
export const MINIMUM_TOUCH_TARGET_SIZE = 44;

/**
 * タッチターゲットのサイズを確保
 */
export const ensureTouchTarget = (size: number): number => {
  return Math.max(size, MINIMUM_TOUCH_TARGET_SIZE);
};

/**
 * 安全なマージン（小さい画面では小さく、大きい画面では大きく）
 */
export const safeMargin = responsive({
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
  default: 16,
});

/**
 * コンテンツの最大幅（タブレットや大画面で見やすくするため）
 */
export const MAX_CONTENT_WIDTH = 1200;

/**
 * コンテンツ幅を制限
 */
export const constrainWidth = (width: number = SCREEN_WIDTH): number => {
  return Math.min(width, MAX_CONTENT_WIDTH);
};

/**
 * グリッドカラム数（画面サイズに応じて）
 */
export const gridColumns = responsive({
  small: 2,
  medium: 2,
  large: 3,
  xlarge: 4,
  default: 2,
});

/**
 * フォントサイズのスケーリング（アクセシビリティ対応）
 * 小さい画面では少し小さく、大きい画面では読みやすく
 */
export const scaleFontSize = (baseFontSize: number): number => {
  return moderateScale(baseFontSize, 0.3);
};

/**
 * 画面情報の取得
 */
export const getScreenInfo = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallPhone: DeviceType.isSmallPhone,
  isPhone: DeviceType.isPhone,
  isTablet: DeviceType.isTablet,
  isLandscape: DeviceType.isLandscape,
  isPortrait: DeviceType.isPortrait,
  platform: Platform.OS,
});
