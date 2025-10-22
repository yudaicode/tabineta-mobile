import { supabase } from './supabase';
import { TripSchedule } from '@/types';

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
