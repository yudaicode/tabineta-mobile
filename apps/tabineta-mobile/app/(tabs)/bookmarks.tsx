import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserBookmarks } from '@/hooks/useSocial';
import { useAuthStore } from '@/stores/authStore';
import { TripCard } from '@/components/trip/TripCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function BookmarksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: bookmarks, isLoading, refetch } = useUserBookmarks(user?.id || '');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="ブックマークを読み込み中..." />;
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            ブックマークがありません
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            気になる旅行プランをブックマークしましょう
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (!item.trip_schedule) return null;
          return (
            <TripCard
              trip={item.trip_schedule}
              onPress={() => router.push(`/trips/${item.trip_schedule.id}`)}
            />
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
});
