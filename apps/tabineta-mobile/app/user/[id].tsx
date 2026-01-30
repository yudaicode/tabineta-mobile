import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useTrips } from '@/hooks/useTrips';
import { useUserStats, useUserLikedTrips, useUserFollow } from '@/hooks/useSocial';
import { useProfile } from '@/hooks/useProfile';
import { TripCard } from '@/components/trip/TripCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

type TabType = 'posts' | 'likes';

export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<TabType>('posts');

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile(userId || '');
  const { data: userTrips, isLoading: tripsLoading, refetch: refetchTrips } = useTrips({
    userId: userId,
  });
  const { data: likedTripsData, isLoading: likedLoading, refetch: refetchLiked } =
    useUserLikedTrips(userId || '');
  const { totalLikes, totalComments } = useUserStats(userId || '');
  const { isFollowing, followersCount, followingCount, toggleFollow, isLoading: followLoading } =
    useUserFollow(userId || '');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchTrips(), refetchLiked()]);
    setRefreshing(false);
  };

  const likedTrips = likedTripsData?.map((l: any) => l.trip_schedule).filter(Boolean) || [];

  // 自分のプロフィールの場合はプロフィール画面にリダイレクト
  React.useEffect(() => {
    if (currentUser?.id === userId) {
      router.replace('/(tabs)/profile');
    }
  }, [currentUser, userId]);

  // ローディング中
  if (profileLoading) {
    return <LoadingSpinner message="読み込み中..." />;
  }

  // ユーザーが見つからない場合
  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={Colors.neutral[300]} />
          <Text variant="titleLarge" style={styles.errorTitle}>
            ユーザーが見つかりません
          </Text>
          <Text variant="bodyMedium" style={styles.errorSubtitle}>
            このユーザーは存在しないか、削除された可能性があります
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            戻る
          </Button>
        </View>
      </View>
    );
  }

  const renderContent = () => {
    const isLoading = selectedTab === 'posts' ? tripsLoading : likedLoading;
    const trips = selectedTab === 'posts' ? userTrips : likedTrips;

    if (isLoading) {
      return <LoadingSpinner message="読み込み中..." />;
    }

    if (!trips || trips.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name={selectedTab === 'posts' ? 'map-outline' : 'heart-outline'}
            size={64}
            color={Colors.neutral[300]}
          />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            {selectedTab === 'posts' ? 'まだプランがありません' : 'いいねした投稿がありません'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {selectedTab === 'posts'
              ? 'このユーザーはまだ旅行プランを投稿していません'
              : 'このユーザーはまだいいねしていません'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tripsList}>
        {trips.map((trip: any) => (
          <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/trip/${trip.id}`)} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ユーザー情報カード */}
        <View style={styles.userCard}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.userAvatarImage} />
          ) : (
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={40} color={Colors.text.inverse} />
            </View>
          )}
          <Text variant="titleLarge" style={styles.userName}>
            {profile.full_name || profile.username || 'ユーザー'}
          </Text>
          {profile.username && (
            <Text variant="bodyMedium" style={styles.userHandle}>
              @{profile.username}
            </Text>
          )}
          {profile.bio && (
            <Text variant="bodyMedium" style={styles.userBio}>
              {profile.bio}
            </Text>
          )}

          {/* フォローボタン */}
          <View style={styles.userActions}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => toggleFollow()}
              activeOpacity={0.7}
              disabled={followLoading}
            >
              <Ionicons
                name={isFollowing ? 'checkmark-outline' : 'person-add-outline'}
                size={IconSizes.sm}
                color={isFollowing ? Colors.text.inverse : Colors.primary[600]}
              />
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'フォロー中' : 'フォロー'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 統計カード */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: Colors.primary[50] }]}>
              <Ionicons name="map" size={IconSizes.md} color={Colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{userTrips?.length || 0}</Text>
            <Text style={styles.statLabel}>投稿</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(`/followers/${userId}` as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="people" size={IconSizes.md} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{followersCount}</Text>
            <Text style={styles.statLabel}>フォロワー</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(`/following/${userId}` as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="person-add" size={IconSizes.md} color="#EC4899" />
            </View>
            <Text style={styles.statValue}>{followingCount}</Text>
            <Text style={styles.statLabel}>フォロー中</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="heart" size={IconSizes.md} color="#EC4899" />
            </View>
            <Text style={styles.statValue}>{totalLikes}</Text>
            <Text style={styles.statLabel}>総いいね数</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="chatbubble" size={IconSizes.md} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{totalComments}</Text>
            <Text style={styles.statLabel}>総コメント数</Text>
          </View>
        </View>

        {/* タブ（投稿といいねのみ） */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'posts' && styles.tabActive]}
            onPress={() => setSelectedTab('posts')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="map"
              size={IconSizes.sm}
              color={selectedTab === 'posts' ? Colors.primary[600] : Colors.text.tertiary}
            />
            <Text style={[styles.tabText, selectedTab === 'posts' && styles.tabTextActive]}>
              投稿
            </Text>
            <View style={[styles.tabBadge, selectedTab === 'posts' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedTab === 'posts' && styles.tabBadgeTextActive]}>
                {userTrips?.length || 0}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'likes' && styles.tabActive]}
            onPress={() => setSelectedTab('likes')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart"
              size={IconSizes.sm}
              color={selectedTab === 'likes' ? Colors.primary[600] : Colors.text.tertiary}
            />
            <Text style={[styles.tabText, selectedTab === 'likes' && styles.tabTextActive]}>
              いいね
            </Text>
            <View style={[styles.tabBadge, selectedTab === 'likes' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, selectedTab === 'likes' && styles.tabBadgeTextActive]}>
                {likedTrips.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* コンテンツ */}
        <View style={styles.content}>{renderContent()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    paddingBottom: Spacing['4xl'],
  },

  // ヘッダー
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },

  // エラー状態
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
  },
  errorTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  errorSubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginTop: Spacing.lg,
  },

  // ユーザー情報カード
  userCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
    margin: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  userAvatar: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  userAvatarImage: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  userName: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userHandle: {
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userBio: {
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  followingButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  followButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  followingButtonText: {
    color: Colors.text.inverse,
  },

  // 統計カード
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // タブ
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.bold,
  },
  tabBadge: {
    backgroundColor: Colors.neutral[200],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: Colors.primary[200],
  },
  tabBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.tertiary,
  },
  tabBadgeTextActive: {
    color: Colors.primary[700],
  },

  // リスト・空の状態
  tripsList: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['4xl'],
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
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
});
