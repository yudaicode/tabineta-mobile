import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { Breakpoints, DeviceType } from '@/utils/responsive';

interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallPhone: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

/**
 * レスポンシブデザイン用のフック
 * 画面のサイズや向きの変化を検知し、リアルタイムで更新
 */
export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isPortrait = width <= height;

  return {
    width,
    height,
    isSmallPhone: width < Breakpoints.small,
    isPhone: width >= Breakpoints.small && width < Breakpoints.large,
    isTablet: width >= Breakpoints.large,
    isLandscape,
    isPortrait,
  };
};

/**
 * 向きの変化のみを検知するフック（パフォーマンス最適化用）
 */
export const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const newOrientation = window.width > window.height ? 'landscape' : 'portrait';
      if (newOrientation !== orientation) {
        setOrientation(newOrientation);
      }
    });

    return () => subscription?.remove();
  }, [orientation]);

  return orientation;
};

/**
 * 画面サイズのカテゴリを返すフック
 */
export const useScreenSize = (): 'small' | 'medium' | 'large' | 'xlarge' => {
  const { width } = useResponsive();

  if (width >= Breakpoints.xlarge) return 'xlarge';
  if (width >= Breakpoints.large) return 'large';
  if (width >= Breakpoints.medium) return 'medium';
  return 'small';
};

/**
 * タブレットかどうかを返すフック
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

/**
 * 横画面かどうかを返すフック
 */
export const useIsLandscape = (): boolean => {
  const { isLandscape } = useResponsive();
  return isLandscape;
};
