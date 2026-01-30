import { supabase } from './supabase';
import { TripSchedule, Profile, Notification } from '@/types';

export interface FetchTripsParams {
  limit?: number;
  offset?: number;
  sort?: 'latest' | 'popular';
  category?: string;
  userId?: string;
  minTravelerCount?: number;
  maxTravelerCount?: number;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * 旅行プランを取得
 */
export async function fetchTrips(params: FetchTripsParams = {}) {
  const {
    limit = 20,
    offset = 0,
    sort = 'latest',
    category,
    userId,
    minTravelerCount,
    maxTravelerCount,
    minDuration,
    maxDuration,
  } = params;

  let query = supabase
    .from('trip_schedules')
    .select('*')
    .eq('is_public', true);

  // フィルター適用
  if (category) {
    query = query.eq('category', category);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  // 人数フィルター
  if (minTravelerCount !== undefined) {
    query = query.gte('traveler_count', minTravelerCount);
  }
  if (maxTravelerCount !== undefined) {
    query = query.lte('traveler_count', maxTravelerCount);
  }

  // ソート適用
  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'popular') {
    // いいね数でソート（後で実装）
    query = query.order('created_at', { ascending: false });
  }

  // ページネーション
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  let trips = data as TripSchedule[];

  // 日数フィルター（クライアント側で実施）
  if (minDuration !== undefined || maxDuration !== undefined) {
    trips = trips.filter((trip) => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (minDuration !== undefined && duration < minDuration) return false;
      if (maxDuration !== undefined && duration > maxDuration) return false;
      return true;
    });
  }

  return trips;
}

/**
 * 旅行プラン詳細を取得
 */
export async function fetchTripDetail(id: string) {
  const { data, error } = await supabase
    .from('trip_schedules')
    .select(`
      *,
      profiles!user_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      day_schedules (
        *,
        activities (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

/**
 * 旅行プランを作成
 */
export async function createTrip(tripData: Partial<TripSchedule>) {
  const { data, error } = await supabase
    .from('trip_schedules')
    .insert(tripData)
    .select()
    .single();

  if (error) throw error;

  return data as TripSchedule;
}

/**
 * 旅行プランを更新
 */
export async function updateTrip(id: string, tripData: Partial<TripSchedule>) {
  const { data, error } = await supabase
    .from('trip_schedules')
    .update(tripData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as TripSchedule;
}

/**
 * 旅行プランを削除
 */
export async function deleteTrip(id: string) {
  const { error } = await supabase
    .from('trip_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * 旅行プランを検索
 */
export async function searchTrips(query: string, params: FetchTripsParams = {}) {
  const {
    limit = 20,
    offset = 0,
    category,
    sort = 'latest',
    minTravelerCount,
    maxTravelerCount,
    minDuration,
    maxDuration,
  } = params;

  let supabaseQuery = supabase
    .from('trip_schedules')
    .select('*')
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (category) {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  // 人数フィルター
  if (minTravelerCount !== undefined) {
    supabaseQuery = supabaseQuery.gte('traveler_count', minTravelerCount);
  }
  if (maxTravelerCount !== undefined) {
    supabaseQuery = supabaseQuery.lte('traveler_count', maxTravelerCount);
  }

  // ソート適用
  if (sort === 'latest') {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  } else if (sort === 'popular') {
    // いいね数でソート（後で実装）
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  }

  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  const { data, error } = await supabaseQuery;

  if (error) throw error;

  let trips = data as TripSchedule[];

  // 日数フィルター（クライアント側で実施）
  if (minDuration !== undefined || maxDuration !== undefined) {
    trips = trips.filter((trip) => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (minDuration !== undefined && duration < minDuration) return false;
      if (maxDuration !== undefined && duration > maxDuration) return false;
      return true;
    });
  }

  return trips;
}

/**
 * 旅行プランをスケジュールと一緒に作成
 */
export interface CreateTripWithScheduleData {
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  traveler_count: number;
  cover_image: string | null;
  is_public: boolean;
  day_schedules: Array<{
    day_number: number;
    date: string;
    title: string;
    activities: Array<{
      time: string;
      title: string;
      type: string;
      location: string | null;
      description: string | null;
      duration: string | null;
      cost: number | null;
      images: string[];
    }>;
  }>;
}

export async function createTripWithSchedule(
  userId: string,
  data: CreateTripWithScheduleData
) {
  // 1. 旅行プランを作成
  const { data: trip, error: tripError } = await supabase
    .from('trip_schedules')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      start_date: data.start_date,
      end_date: data.end_date,
      traveler_count: data.traveler_count,
      cover_image: data.cover_image,
      is_public: data.is_public,
    })
    .select()
    .single();

  if (tripError) throw tripError;

  // 2. 日程を作成
  for (const daySchedule of data.day_schedules) {
    const { data: day, error: dayError } = await supabase
      .from('day_schedules')
      .insert({
        trip_schedule_id: trip.id,
        day_number: daySchedule.day_number,
        date: daySchedule.date,
        title: daySchedule.title,
      })
      .select()
      .single();

    if (dayError) throw dayError;

    // 3. アクティビティを作成
    if (daySchedule.activities && daySchedule.activities.length > 0) {
      const activitiesData = daySchedule.activities.map((activity) => ({
        day_schedule_id: day.id,
        time: activity.time,
        title: activity.title,
        type: activity.type,
        location: activity.location,
        description: activity.description,
        duration: activity.duration,
        cost: activity.cost,
        images: activity.images,
      }));

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activitiesData);

      if (activityError) throw activityError;
    }
  }

  return trip;
}

/**
 * 旅行プランをコピーして新しいプランを作成
 * 画像はプライバシーの観点からコピーしない
 */
export async function copyTripSchedule(
  tripScheduleId: string,
  userId: string,
  options?: {
    title?: string;
    isPublic?: boolean;
  }
) {
  // 1. 元の旅行プランを取得（day_schedulesとactivitiesを含む）
  const originalTrip = await fetchTripDetail(tripScheduleId);

  if (!originalTrip) {
    throw new Error('コピー元の旅行プランが見つかりません');
  }

  // 2. 画像を除外してコピーデータを作成
  const copiedData: CreateTripWithScheduleData = {
    title: options?.title || `${originalTrip.title} (コピー)`,
    description: originalTrip.description || '',
    category: originalTrip.category || '国内旅行',
    start_date: originalTrip.start_date,
    end_date: originalTrip.end_date,
    traveler_count: originalTrip.traveler_count || 2,
    cover_image: null, // カバー画像はコピーしない
    is_public: options?.isPublic !== undefined ? options.isPublic : false, // デフォルトは非公開
    day_schedules: (originalTrip.day_schedules || []).map((day: any) => ({
      day_number: day.day_number,
      date: day.date,
      title: day.title || '',
      activities: (day.activities || []).map((activity: any) => ({
        time: activity.time,
        title: activity.title,
        type: activity.type,
        location: activity.location,
        description: activity.description,
        duration: activity.duration,
        cost: activity.cost,
        images: [], // 画像はコピーしない（プライバシー保護）
      })),
    })),
  };

  // 3. 新しい旅行プランを作成
  const newTrip = await createTripWithSchedule(userId, copiedData);

  return newTrip;
}

/**
 * プロフィールを取得
 */
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return data as Profile;
}

/**
 * プロフィールを更新
 */
export async function updateProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}

/**
 * アカウントを削除（プロフィールと関連データを削除）
 * 注意: ユーザーの認証情報自体の削除は別途必要
 */
export async function deleteAccount(userId: string) {
  // プロフィールを削除（カスケードで関連データも削除される想定）
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;

  // Supabase Authのユーザーも削除
  // 注意: これはクライアント側では実行できない可能性があるため、
  // 実際にはバックエンドのエッジ関数で実装する必要がある場合があります
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.warn('Auth user deletion failed:', authError);
    // エラーを投げないで警告のみ（プロフィールは削除済み）
  }
}

/**
 * アクティビティを更新
 */
export async function updateActivity(activityId: string, activityData: {
  time?: string;
  title?: string;
  type?: string;
  location?: string | null;
  description?: string | null;
  duration?: string | null;
  cost?: number | null;
  images?: string[];
}) {
  const { data, error } = await supabase
    .from('activities')
    .update(activityData)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * アクティビティの順序を更新
 */
export async function reorderActivities(dayScheduleId: string, activityIds: string[]) {
  // 各アクティビティの並び順を更新
  const updates = activityIds.map((id, index) =>
    supabase
      .from('activities')
      .update({ order: index })
      .eq('id', id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter(r => r.error).map(r => r.error);
  if (errors.length > 0) {
    throw errors[0];
  }

  return true;
}

/**
 * 通知を取得
 */
export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as Notification[];
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationsCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;

  return count || 0;
}

/**
 * コメント通知を作成
 */
export async function createCommentNotification(
  tripOwnerId: string,
  commenterId: string,
  tripScheduleId: string,
  commenterName: string
) {
  // 自分のコメントには通知を送らない
  if (tripOwnerId === commenterId) {
    return;
  }

  const { error } = await supabase.from('notifications').insert({
    user_id: tripOwnerId,
    from_user_id: commenterId,
    type: 'comment',
    content: `${commenterName}さんがあなたの旅行記にコメントしました`,
    trip_schedule_id: tripScheduleId,
    is_read: false,
  });

  if (error) throw error;
}
