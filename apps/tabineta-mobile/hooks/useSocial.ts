import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  toggleTripLike,
  getTripLikesCount,
  checkUserLiked,
  addComment,
  getTripComments,
  updateComment,
  deleteComment,
  getTripCommentsCount,
  toggleBookmark,
  getUserBookmarks,
  checkUserBookmarked,
  toggleFollow,
  getFollowersCount,
  getFollowingCount,
  checkUserFollowing,
  getUserTotalLikes,
  getUserTotalComments,
  getUserLikedTrips,
} from '@/lib/social';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';

/**
 * いいね機能のフック
 */

export function useTripLike(tripScheduleId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: isLiked, isLoading: isLikedLoading } = useQuery({
    queryKey: ['trip-like', tripScheduleId, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return checkUserLiked(tripScheduleId, user.id);
    },
    enabled: !!user,
  });

  const { data: likesCount } = useQuery({
    queryKey: ['trip-likes-count', tripScheduleId],
    queryFn: () => getTripLikesCount(tripScheduleId),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return toggleTripLike(tripScheduleId, user.id);
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['trip-like', tripScheduleId] });
      queryClient.invalidateQueries({ queryKey: ['trip-likes-count', tripScheduleId] });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    },
  });

  // リアルタイム更新を購読
  useEffect(() => {
    const channel = supabase
      .channel(`trip-likes:${tripScheduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_likes',
          filter: `trip_schedule_id=eq.${tripScheduleId}`,
        },
        (payload) => {
          // いいね数とステータスを再取得
          queryClient.invalidateQueries({ queryKey: ['trip-likes-count', tripScheduleId] });
          if (user?.id) {
            queryClient.invalidateQueries({ queryKey: ['trip-like', tripScheduleId, user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripScheduleId, user?.id, queryClient]);

  return {
    isLiked: isLiked || false,
    likesCount: likesCount || 0,
    toggleLike: toggleLikeMutation.mutate,
    isLoading: isLikedLoading,
  };
}

/**
 * コメント機能のフック
 */

export function useTripComments(tripScheduleId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['trip-comments', tripScheduleId],
    queryFn: () => getTripComments(tripScheduleId),
  });

  const { data: commentsCount } = useQuery({
    queryKey: ['trip-comments-count', tripScheduleId],
    queryFn: () => getTripCommentsCount(tripScheduleId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => {
      if (!user?.id) throw new Error('ログインが必要です');
      return addComment(tripScheduleId, user.id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-comments', tripScheduleId] });
      queryClient.invalidateQueries({ queryKey: ['trip-comments-count', tripScheduleId] });
      Toast.show({
        type: 'success',
        text1: 'コメントを投稿しました',
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

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-comments', tripScheduleId] });
      Toast.show({
        type: 'success',
        text1: 'コメントを更新しました',
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

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-comments', tripScheduleId] });
      queryClient.invalidateQueries({ queryKey: ['trip-comments-count', tripScheduleId] });
      Toast.show({
        type: 'success',
        text1: 'コメントを削除しました',
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

  // リアルタイム更新を購読
  useEffect(() => {
    const channel = supabase
      .channel(`trip-comments:${tripScheduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_comments',
          filter: `trip_schedule_id=eq.${tripScheduleId}`,
        },
        (payload) => {
          // コメント一覧とカウントを再取得
          queryClient.invalidateQueries({ queryKey: ['trip-comments', tripScheduleId] });
          queryClient.invalidateQueries({ queryKey: ['trip-comments-count', tripScheduleId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripScheduleId, queryClient]);

  return {
    comments: comments || [],
    commentsCount: commentsCount || 0,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isLoading,
  };
}

/**
 * ブックマーク機能のフック
 */

export function useTripBookmark(tripScheduleId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: isBookmarked, isLoading } = useQuery({
    queryKey: ['trip-bookmark', tripScheduleId, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return checkUserBookmarked(tripScheduleId, user.id);
    },
    enabled: !!user,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return toggleBookmark(tripScheduleId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-bookmark', tripScheduleId] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-bookmarks', user.id] });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    },
  });

  return {
    isBookmarked: isBookmarked || false,
    toggleBookmark: toggleBookmarkMutation.mutate,
    isLoading,
  };
}

/**
 * ユーザーのブックマーク一覧を取得
 */
export function useUserBookmarks(userId: string) {
  return useQuery({
    queryKey: ['user-bookmarks', userId],
    queryFn: () => getUserBookmarks(userId),
    enabled: !!userId,
  });
}

/**
 * フォロー機能のフック
 */

export function useUserFollow(targetUserId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['user-follow', user?.id, targetUserId],
    queryFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return checkUserFollowing(user.id, targetUserId);
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });

  const { data: followersCount } = useQuery({
    queryKey: ['followers-count', targetUserId],
    queryFn: () => getFollowersCount(targetUserId),
    enabled: !!targetUserId,
  });

  const { data: followingCount } = useQuery({
    queryKey: ['following-count', targetUserId],
    queryFn: () => getFollowingCount(targetUserId),
    enabled: !!targetUserId,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('ログインが必要です');
      return toggleFollow(user.id, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-follow'] });
      queryClient.invalidateQueries({ queryKey: ['followers-count', targetUserId] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['following-count', user.id] });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    },
  });

  return {
    isFollowing: isFollowing || false,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    toggleFollow: toggleFollowMutation.mutate,
    isLoading,
  };
}

/**
 * ユーザー統計のフック
 */
export function useUserStats(userId: string) {
  const { data: totalLikes } = useQuery({
    queryKey: ['user-total-likes', userId],
    queryFn: () => getUserTotalLikes(userId),
    enabled: !!userId,
  });

  const { data: totalComments } = useQuery({
    queryKey: ['user-total-comments', userId],
    queryFn: () => getUserTotalComments(userId),
    enabled: !!userId,
  });

  return {
    totalLikes: totalLikes || 0,
    totalComments: totalComments || 0,
  };
}

/**
 * ユーザーがいいねした旅行記一覧を取得
 */
export function useUserLikedTrips(userId: string) {
  return useQuery({
    queryKey: ['user-liked-trips', userId],
    queryFn: () => getUserLikedTrips(userId),
    enabled: !!userId,
  });
}
