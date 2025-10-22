import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TripSchedule } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

interface TripCardProps {
  trip: TripSchedule;
  onPress?: () => void;
  variant?: 'default' | 'small';
}

export function TripCard({ trip, onPress, variant = 'default' }: TripCardProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={variant === 'small' ? styles.containerSmall : styles.container}
    >
      <View style={styles.card}>
        {/* カバー画像 */}
        {trip.cover_image ? (
          <View style={variant === 'small' ? styles.imageContainerSmall : styles.imageContainer}>
            <Image
              source={{ uri: trip.cover_image }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* グラデーションオーバーレイ */}
            <View style={styles.gradient} />
            {/* カテゴリバッジ */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{trip.category}</Text>
            </View>
          </View>
        ) : (
          <View style={[variant === 'small' ? styles.imageContainerSmall : styles.imageContainer, styles.placeholder]}>
            <Ionicons name="image-outline" size={48} color={Colors.neutral[300]} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{trip.category}</Text>
            </View>
          </View>
        )}

        {/* コンテンツ */}
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {trip.title}
          </Text>

          {trip.description && variant === 'default' && (
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {trip.description}
            </Text>
          )}

          {/* メタ情報 */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.text.tertiary} />
              <Text variant="bodySmall" style={styles.metaText}>
                {duration}日間
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={Colors.text.tertiary} />
              <Text variant="bodySmall" style={styles.metaText}>
                {trip.traveler_count}人
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.text.tertiary} />
              <Text variant="bodySmall" style={styles.metaText}>
                {format(startDate, 'M/d', { locale: ja })}~
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  containerSmall: {
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  imageContainerSmall: {
    height: 150,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  placeholder: {
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.tight,
  },
  description: {
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
  },
});
