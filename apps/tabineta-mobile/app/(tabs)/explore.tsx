import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSearchTrips, useTrips } from '@/hooks/useTrips';
import { TripCard } from '@/components/trip/TripCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TripCategory } from '@/types';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

const CATEGORIES: TripCategory[] = [
  '国内旅行',
  '海外旅行',
  'グルメ旅',
  '温泉旅行',
  'アウトドア',
  '文化・歴史',
  'リゾート',
  '冒険・アクティビティ',
  'その他',
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  const [travelerCount, setTravelerCount] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // フィルターパラメータ
  const filterParams = {
    category: selectedCategory || undefined,
    sort: sortOrder,
    minTravelerCount: travelerCount || undefined,
    maxTravelerCount: travelerCount || undefined,
    minDuration: duration || undefined,
    maxDuration: duration || undefined,
  };

  // 検索結果
  const { data: searchResults, isLoading: searchLoading } = useSearchTrips(searchQuery, filterParams);

  // カテゴリフィルターのみ（検索なし）
  const { data: categoryResults, isLoading: categoryLoading } = useTrips(filterParams);

  const trips = searchQuery ? searchResults : categoryResults;
  const isLoading = searchQuery ? searchLoading : categoryLoading;

  const handleResetFilters = () => {
    setTravelerCount(null);
    setDuration(null);
    setSortOrder('latest');
  };

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleTripPress = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>旅行プランを探す</Text>
          <Text style={styles.subtitle}>
            みんなが作った素敵な旅行プランを見つけよう
          </Text>
        </View>

        {/* 検索カード */}
        <View style={styles.searchCard}>
          <Searchbar
            placeholder="旅行プランを検索..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        {/* フィルターバー */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* 並び順 */}
            <TouchableOpacity
              style={[styles.filterChip, sortOrder === 'latest' && styles.filterChipActive]}
              onPress={() => setSortOrder('latest')}
            >
              <Ionicons
                name="time-outline"
                size={IconSizes.xs}
                color={sortOrder === 'latest' ? Colors.primary[600] : Colors.text.secondary}
              />
              <Text style={[styles.filterChipText, sortOrder === 'latest' && styles.filterChipTextActive]}>
                新着順
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, sortOrder === 'popular' && styles.filterChipActive]}
              onPress={() => setSortOrder('popular')}
            >
              <Ionicons
                name="flame-outline"
                size={IconSizes.xs}
                color={sortOrder === 'popular' ? Colors.primary[600] : Colors.text.secondary}
              />
              <Text style={[styles.filterChipText, sortOrder === 'popular' && styles.filterChipTextActive]}>
                人気順
              </Text>
            </TouchableOpacity>

            {/* 人数フィルター */}
            {[1, 2, 3, 4].map((count) => (
              <TouchableOpacity
                key={`traveler-${count}`}
                style={[styles.filterChip, travelerCount === count && styles.filterChipActive]}
                onPress={() => setTravelerCount(travelerCount === count ? null : count)}
              >
                <Ionicons
                  name="people-outline"
                  size={IconSizes.xs}
                  color={travelerCount === count ? Colors.primary[600] : Colors.text.secondary}
                />
                <Text style={[styles.filterChipText, travelerCount === count && styles.filterChipTextActive]}>
                  {count}人
                </Text>
              </TouchableOpacity>
            ))}

            {/* 日数フィルター */}
            {[1, 2, 3, 5, 7].map((days) => (
              <TouchableOpacity
                key={`duration-${days}`}
                style={[styles.filterChip, duration === days && styles.filterChipActive]}
                onPress={() => setDuration(duration === days ? null : days)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={IconSizes.xs}
                  color={duration === days ? Colors.primary[600] : Colors.text.secondary}
                />
                <Text style={[styles.filterChipText, duration === days && styles.filterChipTextActive]}>
                  {days}日間
                </Text>
              </TouchableOpacity>
            ))}

            {/* フィルターリセット */}
            {(travelerCount || duration) && (
              <TouchableOpacity style={styles.filterChipReset} onPress={handleResetFilters}>
                <Ionicons name="close-circle" size={IconSizes.xs} color={Colors.text.tertiary} />
                <Text style={styles.filterChipResetText}>リセット</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* カテゴリ */}
        <View style={styles.categorySection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            カテゴリー
          </Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  !selectedCategory && styles.categoryTextSelected,
                ]}
              >
                すべて
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 検索結果 */}
        <View style={styles.resultsSection}>
          {isLoading ? (
            <LoadingSpinner message="検索中..." />
          ) : trips && trips.length > 0 ? (
            <>
              <Text variant="bodyLarge" style={styles.resultCount}>
                {trips.length}件の旅行プラン
              </Text>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onPress={() => handleTripPress(trip.id)} />
              ))}
            </>
          ) : (
            <View style={styles.noResults}>
              <Text variant="headlineSmall" style={styles.noResultsText}>
                旅行プランが見つかりません
              </Text>
              {searchQuery && (
                <Text variant="bodyMedium" style={styles.noResultsSubtext}>
                  別のキーワードで検索してみてください
                </Text>
              )}
            </View>
          )}
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
    padding: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  searchCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchBar: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    elevation: 0,
  },
  searchInput: {
    fontSize: Typography.fontSize.sm,
  },
  filterBar: {
    marginBottom: Spacing.xl,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  filterChipReset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1.5,
    borderColor: Colors.border.light,
  },
  filterChipResetText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  categorySection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    fontSize: Typography.fontSize.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  categoryTextSelected: {
    color: '#7C3AED',
  },
  resultsSection: {
    paddingBottom: Spacing['2xl'],
  },
  resultCount: {
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  noResultsText: {
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.bold,
  },
  noResultsSubtext: {
    color: Colors.text.secondary,
  },
});
