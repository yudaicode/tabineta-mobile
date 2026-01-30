import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from '@/lib/api';
import Toast from 'react-native-toast-message';

/**
 * 通知一覧を取得するフック
 */
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
  });
}

/**
 * 未読通知数を取得するフック
 */
export function useUnreadNotificationsCount(userId: string) {
  return useQuery({
    queryKey: ['unread-notifications-count', userId],
    queryFn: () => getUnreadNotificationsCount(userId),
    enabled: !!userId,
    refetchInterval: 30000, // 30秒ごとに自動更新
  });
}

/**
 * 通知を既読にするフック
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      // 通知一覧と未読数のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    },
  });
}

/**
 * すべての通知を既読にするフック
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markAllNotificationsAsRead(userId),
    onSuccess: () => {
      // 通知一覧と未読数のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      Toast.show({
        type: 'success',
        text1: 'すべて既読にしました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    },
  });
}
