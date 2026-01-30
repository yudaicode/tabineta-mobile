import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const PUSH_TOKEN_KEY = '@push_token';

export interface NotificationSettings {
  appNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * 通知設定を取得
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    // デフォルト設定
    return {
      appNotifications: true,
      pushNotifications: false,
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      appNotifications: true,
      pushNotifications: false,
    };
  }
}

/**
 * 通知設定を保存
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * プッシュ通知の許可をリクエスト
 * expo-notificationsがインストールされている場合に動作します
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  try {
    // expo-notificationsが利用可能か確認
    const Notifications = await import('expo-notifications').catch(() => null);

    if (!Notifications) {
      console.warn('expo-notifications is not installed');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting push notification permission:', error);
    return false;
  }
}

/**
 * プッシュトークンを取得
 */
export async function getPushToken(): Promise<string | null> {
  try {
    // expo-notificationsが利用可能か確認
    const Notifications = await import('expo-notifications').catch(() => null);

    if (!Notifications) {
      console.warn('expo-notifications is not installed');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // トークンを保存
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);

    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * 保存されたプッシュトークンを取得
 */
export async function getSavedPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting saved push token:', error);
    return null;
  }
}

/**
 * プッシュ通知を有効化
 */
export async function enablePushNotifications(): Promise<boolean> {
  const hasPermission = await requestPushNotificationPermission();

  if (!hasPermission) {
    return false;
  }

  const token = await getPushToken();

  if (!token) {
    return false;
  }

  // TODO: トークンをサーバーに送信してユーザーと紐付ける
  console.log('Push token:', token);

  const settings = await getNotificationSettings();
  await saveNotificationSettings({
    ...settings,
    pushNotifications: true,
  });

  return true;
}

/**
 * プッシュ通知を無効化
 */
export async function disablePushNotifications(): Promise<void> {
  const settings = await getNotificationSettings();
  await saveNotificationSettings({
    ...settings,
    pushNotifications: false,
  });

  // TODO: サーバーに通知を無効化したことを送信
}

/**
 * 通知ハンドラーを設定
 */
export async function setupNotificationHandlers() {
  try {
    // expo-notificationsが利用可能か確認
    const Notifications = await import('expo-notifications').catch(() => null);

    if (!Notifications) {
      console.warn('expo-notifications is not installed');
      return;
    }

    // アプリがフォアグラウンドにあるときの通知の表示方法を設定
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.error('Error setting up notification handlers:', error);
  }
}
