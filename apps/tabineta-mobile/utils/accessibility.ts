import { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * アクセシビリティ定数
 */
export const AccessibilityConstants = {
  // タッチターゲットの最小サイズ（Apple HIG & Material Design）
  MIN_TOUCH_TARGET: 44,
  // 推奨タッチターゲットサイズ
  RECOMMENDED_TOUCH_TARGET: 48,
};

/**
 * スクリーンリーダー用のラベルを生成
 */
export const generateAccessibilityLabel = {
  /**
   * いいねボタンのラベル
   */
  likeButton: (isLiked: boolean, count: number): string => {
    if (isLiked) {
      return `いいね済み、${count}件のいいね`;
    }
    return `いいねする、現在${count}件のいいね`;
  },

  /**
   * ブックマークボタンのラベル
   */
  bookmarkButton: (isBookmarked: boolean): string => {
    return isBookmarked ? 'ブックマーク済み' : 'ブックマークする';
  },

  /**
   * 通知の未読バッジラベル
   */
  notificationBadge: (count: number): string => {
    return `${count}件の未読通知があります`;
  },

  /**
   * タブのラベル
   */
  tab: (name: string, isSelected: boolean, count?: number): string => {
    const countText = count !== undefined ? `、${count}件` : '';
    const selectedText = isSelected ? '、選択中' : '';
    return `${name}タブ${countText}${selectedText}`;
  },

  /**
   * 旅行カードのラベル
   */
  tripCard: (title: string, category: string, days: number, likes: number): string => {
    return `${title}、${category}、${days}日間、${likes}件のいいね`;
  },

  /**
   * 日付のラベル
   */
  date: (dateString: string): string => {
    return `日付: ${dateString}`;
  },

  /**
   * 画像のラベル
   */
  image: (description?: string): string => {
    return description || '画像';
  },
};

/**
 * アクセシビリティヒントを生成
 */
export const generateAccessibilityHint = {
  /**
   * いいねボタンのヒント
   */
  likeButton: (isLiked: boolean): string => {
    return isLiked ? 'ダブルタップでいいねを解除' : 'ダブルタップでいいね';
  },

  /**
   * ブックマークボタンのヒント
   */
  bookmarkButton: (isBookmarked: boolean): string => {
    return isBookmarked ? 'ダブルタップでブックマークを解除' : 'ダブルタップでブックマーク';
  },

  /**
   * 編集ボタンのヒント
   */
  editButton: (): string => {
    return 'ダブルタップで編集画面を開く';
  },

  /**
   * 削除ボタンのヒント
   */
  deleteButton: (): string => {
    return 'ダブルタップで削除';
  },

  /**
   * リンクのヒント
   */
  link: (destination: string): string => {
    return `ダブルタップで${destination}を開く`;
  },
};

/**
 * タッチターゲットサイズの検証とヒットスロップの計算
 */
export const ensureTouchTarget = (
  size: number,
  minSize: number = AccessibilityConstants.MIN_TOUCH_TARGET
): { hitSlop?: { top: number; right: number; bottom: number; left: number } } => {
  if (size >= minSize) {
    return {};
  }

  const difference = minSize - size;
  const slop = Math.ceil(difference / 2);

  return {
    hitSlop: {
      top: slop,
      right: slop,
      bottom: slop,
      left: slop,
    },
  };
};

/**
 * アクセシビリティプロパティの型
 */
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{ name: string; label?: string }>;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

/**
 * ボタン用のアクセシビリティプロパティを生成
 */
export const getButtonAccessibilityProps = (
  label: string,
  hint?: string,
  disabled?: boolean
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'button',
  accessibilityState: {
    disabled: disabled ?? false,
  },
});

/**
 * 切り替え（トグル）用のアクセシビリティプロパティを生成
 */
export const getToggleAccessibilityProps = (
  label: string,
  isChecked: boolean,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'switch',
  accessibilityState: {
    checked: isChecked,
  },
});

/**
 * リンク用のアクセシビリティプロパティを生成
 */
export const getLinkAccessibilityProps = (label: string, hint?: string): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'link',
});

/**
 * 画像用のアクセシビリティプロパティを生成
 */
export const getImageAccessibilityProps = (
  label: string,
  isDecorative: boolean = false
): AccessibilityProps => ({
  accessible: !isDecorative,
  accessibilityLabel: isDecorative ? undefined : label,
  accessibilityRole: 'image',
});

/**
 * テキスト入力用のアクセシビリティプロパティを生成
 */
export const getTextInputAccessibilityProps = (
  label: string,
  hint?: string,
  isSecure?: boolean
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'none', // React Native Paperが自動で設定
});

/**
 * カラーコントラスト比の計算（WCAG 2.1準拠）
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // 簡易的な実装（完全な実装には外部ライブラリが必要）
  // この関数は開発時のチェック用
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const a = [r, g, b].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 0;
  }
};

/**
 * WCAGのコントラスト基準を満たしているかチェック
 */
export const meetsContrastRequirement = (
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean => {
  const ratio = calculateContrastRatio(color1, color2);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * アクセシビリティアナウンス用のユーティリティ
 * （react-native-accessibilityのannounceForAccessibilityを使用する想定）
 */
export const announceForAccessibility = (message: string) => {
  // 実装はコンポーネント内でAccessibilityInfo.announceForAccessibilityを使用
  console.log('[Accessibility] Announce:', message);
};

/**
 * フォーカス可能な要素かどうかをチェック
 */
export const isFocusable = (accessible?: boolean, disabled?: boolean): boolean => {
  return accessible !== false && disabled !== true;
};
