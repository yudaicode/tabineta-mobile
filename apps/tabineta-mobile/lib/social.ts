import { supabase } from './supabase';
import { TripLike, TripComment, TripBookmark } from '@/types';

/**
 * いいね機能
 */

// 旅行プランをいいねする
export async function toggleTripLike(tripScheduleId: string, userId: string) {
  // 既存のいいねを確認
  const { data: existingLike } = await supabase
    .from('trip_likes')
    .select('*')
    .eq('trip_schedule_id', tripScheduleId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // いいねを削除
    const { error } = await supabase
      .from('trip_likes')
      .delete()
      .eq('id', existingLike.id);

    if (error) throw error;
    return { liked: false };
  } else {
    // いいねを追加
    const { error } = await supabase
      .from('trip_likes')
      .insert({
        trip_schedule_id: tripScheduleId,
        user_id: userId,
      });

    if (error) throw error;
    return { liked: true };
  }
}

// 旅行プランのいいね数を取得
export async function getTripLikesCount(tripScheduleId: string) {
  const { count, error } = await supabase
    .from('trip_likes')
    .select('*', { count: 'exact', head: true })
    .eq('trip_schedule_id', tripScheduleId);

  if (error) throw error;
  return count || 0;
}

// ユーザーが旅行プランをいいねしているか確認
export async function checkUserLiked(tripScheduleId: string, userId: string) {
  const { data, error } = await supabase
    .from('trip_likes')
    .select('*')
    .eq('trip_schedule_id', tripScheduleId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = Not found
  return !!data;
}

/**
 * コメント機能
 */

// コメントを投稿
export async function addComment(tripScheduleId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('trip_comments')
    .insert({
      trip_schedule_id: tripScheduleId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TripComment;
}

// コメントを取得
export async function getTripComments(tripScheduleId: string) {
  const { data, error } = await supabase
    .from('trip_comments')
    .select(`
      *,
      user:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('trip_schedule_id', tripScheduleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// コメントを削除
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('trip_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// コメント数を取得
export async function getTripCommentsCount(tripScheduleId: string) {
  const { count, error } = await supabase
    .from('trip_comments')
    .select('*', { count: 'exact', head: true })
    .eq('trip_schedule_id', tripScheduleId);

  if (error) throw error;
  return count || 0;
}

/**
 * ブックマーク機能
 */

// ブックマークをトグル
export async function toggleBookmark(tripScheduleId: string, userId: string) {
  // 既存のブックマークを確認
  const { data: existingBookmark } = await supabase
    .from('trip_bookmarks')
    .select('*')
    .eq('trip_schedule_id', tripScheduleId)
    .eq('user_id', userId)
    .single();

  if (existingBookmark) {
    // ブックマークを削除
    const { error } = await supabase
      .from('trip_bookmarks')
      .delete()
      .eq('id', existingBookmark.id);

    if (error) throw error;
    return { bookmarked: false };
  } else {
    // ブックマークを追加
    const { error } = await supabase
      .from('trip_bookmarks')
      .insert({
        trip_schedule_id: tripScheduleId,
        user_id: userId,
      });

    if (error) throw error;
    return { bookmarked: true };
  }
}

// ユーザーのブックマーク一覧を取得
export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('trip_bookmarks')
    .select(`
      *,
      trip_schedule:trip_schedule_id (
        id,
        title,
        description,
        start_date,
        end_date,
        cover_image,
        category,
        traveler_count,
        is_public,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ユーザーがブックマークしているか確認
export async function checkUserBookmarked(tripScheduleId: string, userId: string) {
  const { data, error } = await supabase
    .from('trip_bookmarks')
    .select('*')
    .eq('trip_schedule_id', tripScheduleId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

/**
 * フォロー機能
 */

// フォロー・アンフォロー
export async function toggleFollow(followerId: string, followingId: string) {
  // 既存のフォローを確認
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (existingFollow) {
    // アンフォロー
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id);

    if (error) throw error;
    return { following: false };
  } else {
    // フォロー
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) throw error;
    return { following: true };
  }
}

// フォロワー数を取得
export async function getFollowersCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) throw error;
  return count || 0;
}

// フォロー中の数を取得
export async function getFollowingCount(userId: string) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) throw error;
  return count || 0;
}

// フォローしているか確認
export async function checkUserFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

/**
 * ユーザー統計機能
 */

// ユーザーの全プランの総いいね数を取得
export async function getUserTotalLikes(userId: string) {
  // ユーザーが作成したプランのIDを取得
  const { data: trips, error: tripsError } = await supabase
    .from('trip_schedules')
    .select('id')
    .eq('user_id', userId);

  if (tripsError) throw tripsError;
  if (!trips || trips.length === 0) return 0;

  const tripIds = trips.map((trip) => trip.id);

  // それらのプランの総いいね数を取得
  const { count, error } = await supabase
    .from('trip_likes')
    .select('*', { count: 'exact', head: true })
    .in('trip_schedule_id', tripIds);

  if (error) throw error;
  return count || 0;
}

// ユーザーの全プランの総コメント数を取得
export async function getUserTotalComments(userId: string) {
  // ユーザーが作成したプランのIDを取得
  const { data: trips, error: tripsError } = await supabase
    .from('trip_schedules')
    .select('id')
    .eq('user_id', userId);

  if (tripsError) throw tripsError;
  if (!trips || trips.length === 0) return 0;

  const tripIds = trips.map((trip) => trip.id);

  // それらのプランの総コメント数を取得
  const { count, error } = await supabase
    .from('trip_comments')
    .select('*', { count: 'exact', head: true })
    .in('trip_schedule_id', tripIds);

  if (error) throw error;
  return count || 0;
}
