import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { fetchTripDetail } from '@/lib/api';
import { useTripLike, useTripBookmark, useTripComments } from '@/hooks/useSocial';
import { useCopyTripSchedule, useDeleteTrip, useUpdateActivity, useReorderActivities } from '@/hooks/useTrips';
import { useAuthStore } from '@/stores/authStore';
import { LikeButton } from '@/components/social/LikeButton';
import { BookmarkButton } from '@/components/social/BookmarkButton';
import { CommentForm } from '@/components/social/CommentForm';
import { CommentList } from '@/components/social/CommentList';
import { ActivityFormModal } from '@/components/trip/ActivityFormModal';
import { DaySchedule, Activity } from '@/types';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';
import Toast from 'react-native-toast-message';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const copyTrip = useCopyTripSchedule();
  const deleteTrip = useDeleteTrip();
  const updateActivity = useUpdateActivity();
  const reorderActivities = useReorderActivities();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip-detail', id],
    queryFn: () => fetchTripDetail(id),
    enabled: !!id,
  });

  const { comments, commentsCount, addComment, updateComment, deleteComment, isLoading: commentsLoading } =
    useTripComments(id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.neutral[400]} />
        <Text style={styles.errorText}>旅行プランが見つかりません</Text>
      </View>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const daySchedules = (trip.day_schedules || []) as (DaySchedule & {
    activities: Activity[];
  })[];

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'activity':
        return 'fitness-outline';
      case 'transport':
        return 'car-outline';
      case 'meal':
        return 'restaurant-outline';
      case 'accommodation':
        return 'bed-outline';
      case 'shopping':
        return 'cart-outline';
      case 'sightseeing':
        return 'camera-outline';
      case 'meeting':
        return 'people-outline';
      default:
        return 'location-outline';
    }
  };

  const getActivityIconColor = (type: string): string => {
    switch (type) {
      case 'activity':
        return Colors.primary[500];
      case 'transport':
        return '#8B5CF6';
      case 'meal':
        return '#F59E0B';
      case 'accommodation':
        return '#EC4899';
      case 'shopping':
        return '#10B981';
      case 'sightseeing':
        return '#06B6D4';
      case 'meeting':
        return '#6366F1';
      default:
        return Colors.neutral[500];
    }
  };

  const handleCopyTrip = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'ログインが必要です',
        text2: 'ログインしてからコピーしてください',
      });
      return;
    }

    try {
      await copyTrip.mutateAsync({
        tripScheduleId: id,
        userId: user.id,
      });
      // 成功メッセージはフック内で表示される
    } catch (error: any) {
      // エラーメッセージもフック内で表示される
      console.error('Copy error:', error);
    }
  };

  const handleEditTrip = () => {
    router.push(`/trip/edit/${id}`);
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      '旅行プランを削除',
      'この旅行プランを削除してもよろしいですか？この操作は取り消せません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip.mutateAsync(id);
              Toast.show({
                type: 'success',
                text1: '削除しました',
                text2: '旅行プランを削除しました',
              });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: '削除に失敗しました',
                text2: error.message,
              });
            }
          },
        },
      ]
    );
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditModalVisible(true);
  };

  const handleUpdateActivity = async (activityData: {
    time: string;
    title: string;
    type: string;
    location: string | null;
    description: string | null;
    duration: string | null;
    cost: number | null;
  }) => {
    if (!selectedActivity) return;

    try {
      await updateActivity.mutateAsync({
        activityId: selectedActivity.id,
        tripScheduleId: id,
        data: activityData,
      });
      setEditModalVisible(false);
      setSelectedActivity(null);
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Update activity error:', error);
    }
  };

  const handleMoveActivity = (daySchedule: DaySchedule & { activities: Activity[] }, activityIndex: number, direction: 'up' | 'down') => {
    const activities = [...daySchedule.activities];

    if (direction === 'up' && activityIndex > 0) {
      // Swap with previous activity
      [activities[activityIndex - 1], activities[activityIndex]] = [activities[activityIndex], activities[activityIndex - 1]];
    } else if (direction === 'down' && activityIndex < activities.length - 1) {
      // Swap with next activity
      [activities[activityIndex], activities[activityIndex + 1]] = [activities[activityIndex + 1], activities[activityIndex]];
    } else {
      return; // Cannot move
    }

    // Get the activity IDs in the new order
    const activityIds = activities.map(a => a.id);

    // Call the reorder mutation
    reorderActivities.mutate({
      dayScheduleId: daySchedule.id,
      tripScheduleId: id,
      activityIds,
    });
  };

  // 自分の投稿かどうかを判定
  const isOwnTrip = trip && user && trip.user_id === user.id;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button and Actions */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={IconSizes.md} color={Colors.text.primary} />
          </TouchableOpacity>

          {isOwnTrip && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEditTrip}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={IconSizes.md} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteTrip}
                activeOpacity={0.7}
                disabled={deleteTrip.isPending}
              >
                <Ionicons
                  name={deleteTrip.isPending ? "hourglass-outline" : "trash-outline"}
                  size={IconSizes.md}
                  color={Colors.error[600]}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cover Image */}
        {trip.cover_image ? (
          <Image source={{ uri: trip.cover_image }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={64} color={Colors.neutral[300]} />
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag" size={14} color={Colors.primary[600]} />
            <Text style={styles.categoryText}>{trip.category}</Text>
          </View>

          {/* Title */}
          <Text variant="headlineMedium" style={styles.title}>
            {trip.title}
          </Text>

          {/* User Info */}
          {trip.profiles && (
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => router.push(`/user/${trip.user_id}`)}
              activeOpacity={0.7}
            >
              {trip.profiles.avatar_url ? (
                <Image source={{ uri: trip.profiles.avatar_url }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color={Colors.text.inverse} />
                </View>
              )}
              <View style={styles.userTextContainer}>
                <Text style={styles.userFullName}>
                  {trip.profiles.full_name || trip.profiles.username || 'ユーザー'}
                </Text>
                {trip.profiles.username && (
                  <Text style={styles.username}>@{trip.profiles.username}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{duration}日間</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{trip.traveler_count}人</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={IconSizes.sm} color={Colors.text.secondary} />
              <Text style={styles.metaText}>
                {format(startDate, 'M/d', { locale: ja })} - {format(endDate, 'M/d', { locale: ja })}
              </Text>
            </View>
          </View>

          {/* Social Buttons */}
          <View style={styles.socialBar}>
            <LikeButton tripScheduleId={id} />
            <BookmarkButton tripScheduleId={id} />
            <View style={styles.commentCount}>
              <Ionicons name="chatbubble-outline" size={IconSizes.sm} color={Colors.text.tertiary} />
              <Text style={styles.commentCountText}>{commentsCount}</Text>
            </View>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyTrip}
              disabled={copyTrip.isPending}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copyTrip.isPending ? 'hourglass-outline' : 'copy-outline'}
                size={IconSizes.sm}
                color={Colors.primary[600]}
              />
              <Text style={styles.copyButtonText}>
                {copyTrip.isPending ? 'コピー中...' : 'プランをコピー'}
              </Text>
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          {trip.description && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={IconSizes.md} color={Colors.text.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  概要
                </Text>
              </View>
              <Text style={styles.description}>{trip.description}</Text>
              <Divider style={styles.divider} />
            </>
          )}

          {/* Schedule */}
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={IconSizes.md} color={Colors.text.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              スケジュール
            </Text>
          </View>

          {daySchedules.map((day) => (
            <View key={day.id} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayNumberBadge}>
                  <Text style={styles.dayNumber}>Day {day.day_number}</Text>
                </View>
                <Text style={styles.dayDate}>
                  {format(new Date(day.date), 'M月d日(E)', { locale: ja })}
                </Text>
              </View>
              {day.title && <Text style={styles.dayTitle}>{day.title}</Text>}

              {/* Activities */}
              {day.activities && day.activities.length > 0 && (
                <View style={styles.activitiesContainer}>
                  {day.activities.map((activity, index) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityTimeContainer}>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                      <View style={styles.activityContent}>
                        <View style={styles.activityHeader}>
                          <View style={[styles.activityIconContainer, { backgroundColor: `${getActivityIconColor(activity.type)}15` }]}>
                            <Ionicons
                              name={getActivityIcon(activity.type)}
                              size={IconSizes.sm}
                              color={getActivityIconColor(activity.type)}
                            />
                          </View>
                          <Text style={styles.activityTitle}>{activity.title}</Text>
                          {isOwnTrip && (
                            <View style={styles.activityActions}>
                              {day.activities.length > 1 && (
                                <View style={styles.activityReorderButtons}>
                                  <TouchableOpacity
                                    style={[styles.activityReorderButton, index === 0 && styles.activityReorderButtonDisabled]}
                                    onPress={() => handleMoveActivity(day, index, 'up')}
                                    disabled={index === 0}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name="chevron-up-outline"
                                      size={16}
                                      color={index === 0 ? Colors.neutral[400] : Colors.neutral[600]}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.activityReorderButton, index === day.activities.length - 1 && styles.activityReorderButtonDisabled]}
                                    onPress={() => handleMoveActivity(day, index, 'down')}
                                    disabled={index === day.activities.length - 1}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons
                                      name="chevron-down-outline"
                                      size={16}
                                      color={index === day.activities.length - 1 ? Colors.neutral[400] : Colors.neutral[600]}
                                    />
                                  </TouchableOpacity>
                                </View>
                              )}
                              <TouchableOpacity
                                style={styles.activityEditButton}
                                onPress={() => handleEditActivity(activity)}
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={IconSizes.sm}
                                  color={Colors.primary[600]}
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        {activity.location && (
                          <View style={styles.activityDetail}>
                            <Ionicons name="location-outline" size={14} color={Colors.text.tertiary} />
                            <Text style={styles.activityDetailText}>{activity.location}</Text>
                          </View>
                        )}
                        {activity.description && (
                          <Text style={styles.activityDescription}>
                            {activity.description}
                          </Text>
                        )}
                        {activity.images && activity.images.length > 0 && (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.activityImagesScroll}
                          >
                            {activity.images.map((imageUrl, imgIndex) => (
                              <Image
                                key={imgIndex}
                                source={{ uri: imageUrl }}
                                style={styles.activityImage}
                              />
                            ))}
                          </ScrollView>
                        )}
                        {activity.cost && (
                          <View style={styles.activityCostContainer}>
                            <Ionicons name="cash-outline" size={14} color={Colors.success[600]} />
                            <Text style={styles.activityCost}>¥{activity.cost.toLocaleString()}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Comments Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={IconSizes.md} color={Colors.text.primary} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              コメント ({commentsCount})
            </Text>
          </View>

          <CommentForm
            tripScheduleId={id}
            onSubmit={(content) => addComment(content)}
          />

          <View style={styles.commentsContainer}>
            <CommentList
              comments={comments}
              onEditComment={(commentId, content) => updateComment({ commentId, content })}
              onDeleteComment={deleteComment}
              isLoading={commentsLoading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Activity Edit Modal */}
      <ActivityFormModal
        visible={editModalVisible}
        onDismiss={() => {
          setEditModalVisible(false);
          setSelectedActivity(null);
        }}
        onSubmit={handleUpdateActivity}
        initialData={selectedActivity ? {
          time: selectedActivity.time,
          title: selectedActivity.title,
          type: selectedActivity.type,
          location: selectedActivity.location || '',
          description: selectedActivity.description || '',
          duration: selectedActivity.duration || '',
          cost: selectedActivity.cost || null,
        } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: Spacing['3xl'],
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  headerActions: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  deleteButton: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.xl,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  title: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    flex: 1,
  },
  userFullName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  username: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  socialBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  commentCountText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  spacer: {
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  copyButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.semibold,
  },
  divider: {
    marginVertical: Spacing.xl,
    backgroundColor: Colors.border.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  dayCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dayNumberBadge: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  dayNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  dayDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  dayTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  activitiesContainer: {
    gap: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  activityTimeContainer: {
    minWidth: 60,
    paddingTop: 2,
  },
  activityTime: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  activityContent: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  activityReorderButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  activityReorderButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityReorderButtonDisabled: {
    opacity: 0.3,
  },
  activityEditButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  activityDetailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  activityDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  activityImagesScroll: {
    marginTop: Spacing.sm,
  },
  activityImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.neutral[200],
  },
  activityCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  activityCost: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success[600],
  },
  commentsContainer: {
    marginTop: Spacing.lg,
  },
});
