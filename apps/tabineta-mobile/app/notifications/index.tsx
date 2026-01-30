import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuthStore } from '@/stores/authStore';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Notification, NotificationType } from '@/types';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { data: notifications, isLoading, refetch } = useNotifications(user?.id || '');
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 通知を既読にする
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // 通知の種類に応じて遷移
    if (notification.trip_schedule_id) {
      router.push(`/trip/${notification.trip_schedule_id}`);
    }
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      default:
        return 'notifications';
    }
  };

  const getNotificationIconColor = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return '#EC4899';
      case 'comment':
        return '#10B981';
      case 'follow':
        return Colors.primary[600];
      default:
        return Colors.neutral[500];
    }
  };

  const getNotificationIconBgColor = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return '#FCE7F3';
      case 'comment':
        return '#D1FAE5';
      case 'follow':
        return Colors.primary[50];
      default:
        return Colors.neutral[100];
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

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
          <Text style={styles.headerTitle}>通知</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.unauthContainer}>
          <Ionicons name="notifications-outline" size={64} color={Colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.unauthText}>
            ログインして通知を確認
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.loginButton}
          >
            ログイン
          </Button>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="読み込み中..." />;
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
        <Text style={styles.headerTitle}>通知</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllButtonText}>すべて既読</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={styles.headerSpacer} />}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 未読数バッジ */}
        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Ionicons name="notifications" size={IconSizes.sm} color={Colors.primary[600]} />
            <Text style={styles.unreadBannerText}>
              {unreadCount}件の未読通知があります
            </Text>
          </View>
        )}

        {/* 通知リスト */}
        {notifications && notifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.is_read && styles.notificationItemUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.notificationIconContainer,
                    {
                      backgroundColor: getNotificationIconBgColor(notification.type),
                    },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={IconSizes.md}
                    color={getNotificationIconColor(notification.type)}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <Text
                    style={[
                      styles.notificationText,
                      !notification.is_read && styles.notificationTextUnread,
                    ]}
                  >
                    {notification.content}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {format(new Date(notification.created_at), 'M月d日 HH:mm', { locale: ja })}
                  </Text>
                </View>

                {!notification.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={Colors.neutral[300]} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              通知はありません
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              いいねやコメントがあると通知が表示されます
            </Text>
          </View>
        )}
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
  markAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  markAllButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  content: {
    flex: 1,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  unreadBannerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  notificationsList: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.sm,
  },
  notificationItemUnread: {
    backgroundColor: Colors.primary[25] || '#F0F9FF',
    borderColor: Colors.primary[200],
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  notificationText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  notificationTextUnread: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    paddingHorizontal: Spacing['2xl'],
    margin: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  emptyTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
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
  loginButton: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing['3xl'],
  },
});
