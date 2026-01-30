import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';
import {
  getNotificationSettings,
  saveNotificationSettings,
  enablePushNotifications,
  disablePushNotifications,
} from '@/utils/notifications';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [loading, setLoading] = useState(true);

  // 通知設定を読み込み
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationsEnabled(settings.appNotifications);
      setPushNotificationsEnabled(settings.pushNotifications);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(tabs)/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    router.push('/profile/edit');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveNotificationSettings({
      appNotifications: value,
      pushNotifications: pushNotificationsEnabled,
    });
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    if (value) {
      // プッシュ通知を有効化
      const success = await enablePushNotifications();
      if (success) {
        setPushNotificationsEnabled(true);
        Toast.show({
          type: 'success',
          text1: 'プッシュ通知を有効化しました',
          text2: '重要な通知をお知らせします',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'プッシュ通知を有効化できませんでした',
          text2: 'expo-notificationsパッケージをインストールしてください',
        });
      }
    } else {
      // プッシュ通知を無効化
      await disablePushNotifications();
      setPushNotificationsEnabled(false);
      Toast.show({
        type: 'info',
        text1: 'プッシュ通知を無効化しました',
      });
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={IconSizes.md} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>設定</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.unauthContainer}>
          <Ionicons name="settings-outline" size={64} color={Colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.unauthText}>
            ログインして設定を変更
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={IconSizes.md} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* アカウント設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.primary[50] }]}>
                <Ionicons name="person-outline" size={IconSizes.sm} color={Colors.primary[600]} />
              </View>
              <Text style={styles.settingItemText}>プロフィール編集</Text>
            </View>
            <Ionicons name="chevron-forward" size={IconSizes.sm} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.error[50] }]}>
                <Ionicons name="log-out-outline" size={IconSizes.sm} color={Colors.error[600]} />
              </View>
              <Text style={styles.settingItemText}>ログアウト</Text>
            </View>
            <Ionicons name="chevron-forward" size={IconSizes.sm} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="notifications-outline" size={IconSizes.sm} color="#F59E0B" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingItemText}>アプリ内通知</Text>
                <Text style={styles.settingItemDescription}>
                  いいねやコメントの通知を受け取る
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              color={Colors.primary[500]}
              disabled={loading}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="phone-portrait-outline" size={IconSizes.sm} color="#6366F1" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingItemText}>プッシュ通知</Text>
                <Text style={styles.settingItemDescription}>
                  アプリを閉じている時も通知を受け取る
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={handlePushNotificationsToggle}
              color={Colors.primary[500]}
              disabled={loading}
            />
          </View>
        </View>

        {/* プライバシー設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プライバシー</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="lock-closed-outline" size={IconSizes.sm} color="#10B981" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingItemText}>プロフィールを公開</Text>
                <Text style={styles.settingItemDescription}>
                  他のユーザーがプロフィールを閲覧できる
                </Text>
              </View>
            </View>
            <Switch
              value={profilePublic}
              onValueChange={setProfilePublic}
              color={Colors.primary[500]}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="shield-checkmark-outline" size={IconSizes.sm} color="#8B5CF6" />
              </View>
              <Text style={styles.settingItemText}>ブロックリスト</Text>
            </View>
            <Ionicons name="chevron-forward" size={IconSizes.sm} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/legal?type=terms')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.neutral[100] }]}>
                <Ionicons name="document-text-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              </View>
              <Text style={styles.settingItemText}>利用規約</Text>
            </View>
            <Ionicons name="chevron-forward" size={IconSizes.sm} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/legal?type=privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.neutral[100] }]}>
                <Ionicons name="shield-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              </View>
              <Text style={styles.settingItemText}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={IconSizes.sm} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.neutral[100] }]}>
                <Ionicons name="information-circle-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              </View>
              <Text style={styles.settingItemText}>バージョン</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* アカウント削除 */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={IconSizes.sm} color={Colors.error[600]} />
            <Text style={styles.dangerButtonText}>アカウントを削除</Text>
          </TouchableOpacity>
          <Text style={styles.dangerWarning}>
            アカウントを削除すると、すべてのデータが完全に削除されます
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingItemText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  settingItemDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  dangerSection: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['5xl'],
    paddingHorizontal: Spacing.xl,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.error[500],
  },
  dangerButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error[600],
  },
  dangerWarning: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
  },
  unauthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.xl,
  },
  unauthText: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
