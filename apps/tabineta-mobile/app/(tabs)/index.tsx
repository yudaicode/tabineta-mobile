import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrips } from '@/hooks/useTrips';
import { TripCard } from '@/components/trip/TripCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

export default function HomeScreen() {
  const { data: popularTrips, isLoading: popularLoading, refetch: refetchPopular } = useTrips({
    sort: 'popular',
    limit: 5,
  });

  const { data: latestTrips, isLoading: latestLoading, refetch: refetchLatest } = useTrips({
    sort: 'latest',
    limit: 10,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPopular(), refetchLatest()]);
    setRefreshing(false);
  };

  if (popularLoading && latestLoading) {
    return <LoadingSpinner message="読み込み中..." />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* 人気の旅行プラン */}
          {popularTrips && popularTrips.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="flame" size={IconSizes.sm} color="#EF4444" />
                </View>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  人気の旅行プラン
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {popularTrips.map((trip) => (
                  <View key={trip.id} style={styles.horizontalCard}>
                    <TripCard
                      trip={trip}
                      variant="small"
                      onPress={() => router.push(`/trip/${trip.id}`)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ピックアップ（新着）の旅行プラン */}
          {latestTrips && latestTrips.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="sparkles" size={IconSizes.sm} color="#F59E0B" />
                </View>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  ピックアップ
                </Text>
              </View>
              <View style={styles.tripsContainer}>
                {latestTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onPress={() => router.push(`/trip/${trip.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* 空の状態 */}
          {(!popularTrips || popularTrips.length === 0) &&
            (!latestTrips || latestTrips.length === 0) && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="map-outline" size={64} color={Colors.neutral[300]} />
                </View>
                <Text variant="headlineMedium" style={styles.emptyTitle}>
                  旅行プランがまだありません
                </Text>
                <Text variant="bodyLarge" style={styles.emptySubtitle}>
                  最初の旅行プランを作成してみましょう
                </Text>
              </View>
            )}
        </View>
      </ScrollView>

      {/* FABボタン */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/create')}
        color={Colors.text.inverse}
        label="新規作成"
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
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  horizontalCard: {
    width: 300,
    marginRight: Spacing.md,
  },
  tripsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: '#EC4899',
    borderRadius: BorderRadius['2xl'],
  },
});
