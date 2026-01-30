import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile, deleteAccount } from '@/lib/api';
import { Profile } from '@/types';
import Toast from 'react-native-toast-message';

/**
 * プロフィールを取得するフック
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}

/**
 * プロフィールを更新するフック
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<Profile> }) =>
      updateProfile(userId, data),
    onSuccess: (_, variables) => {
      // 更新したプロフィールのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      Toast.show({
        type: 'success',
        text1: 'プロフィールを更新しました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: '更新に失敗しました',
        text2: error.message,
      });
    },
  });
}

/**
 * アカウントを削除するフック
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAccount(userId),
    onSuccess: () => {
      // すべてのキャッシュをクリア
      queryClient.clear();
      Toast.show({
        type: 'success',
        text1: 'アカウントを削除しました',
        text2: 'ご利用ありがとうございました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: '削除に失敗しました',
        text2: error.message,
      });
    },
  });
}
