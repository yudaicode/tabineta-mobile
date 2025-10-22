import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, Share } from 'react-native';
import { Text, Chip, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTripDetail } from '@/hooks/useTrips';
import { useTripComments } from '@/hooks/useSocial';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LikeButton, BookmarkButton, CommentList, CommentForm } from '@/components/social';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trip, isLoading } = useTripDetail(id);
  const { comments, commentsCount, addComment, deleteComment, isLoading: commentsLoading } = useTripComments(id);
  const [showComments, setShowComments] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${trip?.title}\n${trip?.description}`,
        title: trip?.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="旅行プランを読み込み中..." />;
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge">旅行プランが見つかりません</Text>
      </View>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <>
      <Stack.Screen
        options={{
          title: trip.title,
          headerShown: true,
        }}
      />
      <ScrollView style={styles.container}>
        {/* カバー画像 */}
        {trip.cover_image && (
          <Image source={{ uri: trip.cover_image }} style={styles.coverImage} />
        )}

        <View style={styles.content}>
          {/* タイトルとメタ情報 */}
          <Text variant="headlineMedium" style={styles.title}>
            {trip.title}
          </Text>

          <View style={styles.metaContainer}>
            <Chip mode="outlined" style={styles.chip}>
              {trip.category}
            </Chip>
            <Text variant="bodyMedium" style={styles.meta}>
              {duration}日間 • {trip.traveler_count}人
            </Text>
          </View>

          {/* ソーシャルアクション */}
          <View style={styles.socialActions}>
            <LikeButton tripScheduleId={id} />
            <BookmarkButton tripScheduleId={id} />
            <View style={styles.commentButton}>
              <Text
                variant="bodyMedium"
                style={styles.commentButtonText}
                onPress={() => setShowComments(!showComments)}
              >
                💬 コメント ({commentsCount})
              </Text>
            </View>
            <IconButton icon="share-variant" size={24} onPress={handleShare} />
          </View>

          <Divider style={styles.divider} />

          {/* 日程 */}
          <View style={styles.dateContainer}>
            <Text variant="bodyMedium" style={styles.dateText}>
              📅 {format(startDate, 'yyyy年M月d日', { locale: ja })} -{' '}
              {format(endDate, 'M月d日', { locale: ja })}
            </Text>
          </View>

          {/* 説明 */}
          {trip.description && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                説明
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {trip.description}
              </Text>
            </View>
          )}

          {/* スケジュール */}
          {trip.day_schedules && trip.day_schedules.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                スケジュール
              </Text>

              {trip.day_schedules
                .sort((a: any, b: any) => a.day_number - b.day_number)
                .map((daySchedule: any) => (
                  <View key={daySchedule.id} style={styles.dayContainer}>
                    <Text variant="titleSmall" style={styles.dayTitle}>
                      {daySchedule.day_number}日目 - {daySchedule.title || daySchedule.date}
                    </Text>

                    {daySchedule.activities &&
                      daySchedule.activities.length > 0 &&
                      daySchedule.activities
                        .sort((a: any, b: any) => a.time.localeCompare(b.time))
                        .map((activity: any) => (
                          <View key={activity.id} style={styles.activityContainer}>
                            <View style={styles.activityHeader}>
                              <Text variant="bodyMedium" style={styles.activityTime}>
                                {activity.time}
                              </Text>
                              <Text variant="bodyMedium" style={styles.activityType}>
                                {getActivityIcon(activity.type)}
                              </Text>
                            </View>
                            <Text variant="bodyLarge" style={styles.activityTitle}>
                              {activity.title}
                            </Text>
                            {activity.location && (
                              <Text variant="bodySmall" style={styles.activityLocation}>
                                📍 {activity.location}
                              </Text>
                            )}
                            {activity.description && (
                              <Text variant="bodySmall" style={styles.activityDescription}>
                                {activity.description}
                              </Text>
                            )}
                            {(activity.duration || activity.cost) && (
                              <View style={styles.activityMeta}>
                                {activity.duration && (
                                  <Text variant="bodySmall" style={styles.activityMetaText}>
                                    ⏱ {activity.duration}
                                  </Text>
                                )}
                                {activity.cost && (
                                  <Text variant="bodySmall" style={styles.activityMetaText}>
                                    💰 {activity.cost.toLocaleString()}円
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        ))}
                  </View>
                ))}
            </View>
          )}

          {/* コメントセクション */}
          {showComments && (
            <View style={styles.commentsSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                コメント
              </Text>
              <CommentList
                comments={comments}
                onDeleteComment={deleteComment}
                isLoading={commentsLoading}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* コメント入力フォーム */}
      {showComments && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <CommentForm onSubmit={addComment} />
        </KeyboardAvoidingView>
      )}
    </>
  );
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    activity: '🚶',
    transport: '🚃',
    meal: '🍴',
    accommodation: '🏨',
    shopping: '🛍',
    sightseeing: '🗿',
    meeting: '👥',
  };
  return icons[type] || '📍';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chip: {
    marginRight: 12,
  },
  meta: {
    color: '#64748B',
  },
  dateContainer: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  dateText: {
    color: '#475569',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#475569',
    lineHeight: 24,
  },
  dayContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  dayTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  activityContainer: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTime: {
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 8,
  },
  activityType: {
    fontSize: 16,
  },
  activityTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  activityLocation: {
    color: '#64748B',
    marginBottom: 4,
  },
  activityDescription: {
    color: '#475569',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  activityMetaText: {
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  commentButton: {
    marginLeft: 8,
  },
  commentButtonText: {
    color: '#6B7280',
  },
  divider: {
    marginBottom: 16,
  },
  commentsSection: {
    marginTop: 24,
  },
});
