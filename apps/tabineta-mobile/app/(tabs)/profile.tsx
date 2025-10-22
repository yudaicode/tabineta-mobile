import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, FAB, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useTrips } from '@/hooks/useTrips';
import { useUserStats } from '@/hooks/useSocial';
import { StatCard } from '@/components/common/StatCard';
import { TripCard } from '@/components/trip/TripCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { data: myTrips, isLoading, refetch } = useTrips();
  const { totalLikes, totalComments } = useUserStats(user?.id || '');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    router.push('/(auth)/sign-in');
  };

  if (isLoading) {
    return <LoadingSpinner message="読み込み中..." />;
  }

  // 未認証時の表示
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.unauthContent}>
          <View style={styles.loginPrompt}>
            <View style={styles.loginIconContainer}>
              <Ionicons name="airplane-outline" size={64} color={Colors.primary[500]} />
            </View>
            <Text variant="headlineMedium" style={styles.loginTitle}>
              Tabinetaへようこそ
            </Text>
            <Text variant="bodyLarge" style={styles.loginSubtitle}>
              ログインして旅の思い出を記録・共有しましょう
            </Text>

            {/* 機能紹介 */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="map-outline" size={IconSizes.md} color={Colors.primary[600]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>旅行プランを作成</Text>
                  <Text style={styles.featureDescription}>詳細なスケジュールを管理</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="chatbubbles-outline" size={IconSizes.md} color={Colors.primary[600]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>他の旅行者と交流</Text>
                  <Text style={styles.featureDescription}>コメントやいいねで繋がる</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="bookmark-outline" size={IconSizes.md} color={Colors.primary[600]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>お気に入りを保存</Text>
                  <Text style={styles.featureDescription}>気になるプランをブックマーク</Text>
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
            >
              ログイン / 新規登録
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* ユーザー情報カード */}
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={40} color={Colors.text.inverse} />
            </View>
            <Text variant="titleLarge" style={styles.userName}>
              {user?.email}
            </Text>
            <Text variant="bodyMedium" style={styles.userId}>
              ID: {user?.id.substring(0, 12)}...
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={IconSizes.sm} color={Colors.error[600]} />
              <Text style={styles.logoutButtonText}>ログアウト</Text>
            </TouchableOpacity>
          </View>

          {/* 統計カード */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            統計
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: Colors.primary[50] }]}>
                <Ionicons name="map" size={IconSizes.md} color={Colors.primary[600]} />
              </View>
              <Text style={styles.statValue}>{myTrips?.length || 0}</Text>
              <Text style={styles.statLabel}>作成したプラン</Text>
            </View>

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

          {/* 作成した旅行プラン */}
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              作成した旅行プラン
            </Text>
            <Text style={styles.sectionCount}>({myTrips?.length || 0})</Text>
          </View>

          {myTrips && myTrips.length > 0 ? (
            <View style={styles.tripsList}>
              {myTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={() => router.push(`/trip/${trip.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={64} color={Colors.neutral[300]} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                まだプランがありません
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                最初の旅行プランを作成してみましょう
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/(tabs)/create')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={IconSizes.sm} color={Colors.text.inverse} />
                <Text style={styles.createButtonText}>プランを作成</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FABボタン */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create')}
        color={Colors.text.inverse}
        label="新しいプランを作成"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  // 未認証時のスタイル
  unauthContent: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing['5xl'],
  },
  loginPrompt: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  loginIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    ...Shadows.md,
  },
  loginTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  loginSubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },
  features: {
    width: '100%',
    marginBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  loginButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[500],
    ...Shadows.md,
  },
  loginButtonContent: {
    paddingVertical: Spacing.sm,
  },
  loginButtonLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },

  // 認証済みのスタイル
  userCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
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
  userName: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  userId: {
    color: Colors.text.tertiary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.error[500],
  },
  logoutButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error[600],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  sectionCount: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
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
  tripsList: {
    gap: Spacing.lg,
  },
  emptyState: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['4xl'],
    alignItems: 'center',
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
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  createButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: '#EC4899',
    borderRadius: BorderRadius['2xl'],
  },
});
