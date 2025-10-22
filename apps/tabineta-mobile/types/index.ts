// Database Types based on MOBILE_SPEC.md

export type TripCategory =
  | '国内旅行'
  | '海外旅行'
  | 'グルメ旅'
  | '温泉旅行'
  | 'アウトドア'
  | '文化・歴史'
  | 'リゾート'
  | '冒険・アクティビティ'
  | 'その他';

export type ActivityType =
  | 'activity'       // アクティビティ
  | 'transport'      // 移動
  | 'meal'           // 食事
  | 'accommodation'  // 宿泊
  | 'shopping'       // ショッピング
  | 'sightseeing'    // 観光
  | 'meeting';       // 集合

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TripSchedule {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  category: TripCategory;
  traveler_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DaySchedule {
  id: string;
  trip_schedule_id: string;
  day_number: number;
  date: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  day_schedule_id: string;
  time: string;
  title: string;
  type: ActivityType;
  location: string | null;
  description: string | null;
  duration: string | null;
  images: string[];
  cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface TripLike {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  created_at: string;
}

export interface TripComment {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TripBookmark {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string;
  type: NotificationType;
  content: string;
  trip_schedule_id: string | null;
  is_read: boolean;
  created_at: string;
}
