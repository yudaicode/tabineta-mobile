-- =====================================================
-- Tabineta Mobile - RLS (Row Level Security) Policies
-- =====================================================
-- このファイルをSupabaseダッシュボードのSQLエディタで実行してください

-- =====================================================
-- 1. PROFILES テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 誰でも全てのプロフィールを閲覧可能
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (auth.uid()::text = id);

-- 自分のプロフィールのみ削除可能
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE
  USING (auth.uid()::text = id);

-- =====================================================
-- 2. TRIP_SCHEDULES テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;

-- 公開されている旅行記は誰でも閲覧可能、非公開は作成者のみ
CREATE POLICY "trip_schedules_select_policy" ON trip_schedules
  FOR SELECT
  USING (is_public = true OR auth.uid()::text = user_id);

-- 自分の旅行記のみ作成可能
CREATE POLICY "trip_schedules_insert_policy" ON trip_schedules
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 自分の旅行記のみ更新可能
CREATE POLICY "trip_schedules_update_policy" ON trip_schedules
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 自分の旅行記のみ削除可能
CREATE POLICY "trip_schedules_delete_policy" ON trip_schedules
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 3. DAY_SCHEDULES テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE day_schedules ENABLE ROW LEVEL SECURITY;

-- 対応する旅行記が閲覧可能なら日程も閲覧可能
CREATE POLICY "day_schedules_select_policy" ON day_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND (trip_schedules.is_public = true OR trip_schedules.user_id = auth.uid()::text)
    )
  );

-- 自分の旅行記の日程のみ作成可能
CREATE POLICY "day_schedules_insert_policy" ON day_schedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- 自分の旅行記の日程のみ更新可能
CREATE POLICY "day_schedules_update_policy" ON day_schedules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- 自分の旅行記の日程のみ削除可能
CREATE POLICY "day_schedules_delete_policy" ON day_schedules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- 4. ACTIVITIES テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 対応する旅行記が閲覧可能ならアクティビティも閲覧可能
CREATE POLICY "activities_select_policy" ON activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM day_schedules
      JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
      WHERE day_schedules.id = activities.day_schedule_id
      AND (trip_schedules.is_public = true OR trip_schedules.user_id = auth.uid()::text)
    )
  );

-- 自分の旅行記のアクティビティのみ作成可能
CREATE POLICY "activities_insert_policy" ON activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM day_schedules
      JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
      WHERE day_schedules.id = activities.day_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- 自分の旅行記のアクティビティのみ更新可能
CREATE POLICY "activities_update_policy" ON activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM day_schedules
      JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
      WHERE day_schedules.id = activities.day_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- 自分の旅行記のアクティビティのみ削除可能
CREATE POLICY "activities_delete_policy" ON activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM day_schedules
      JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
      WHERE day_schedules.id = activities.day_schedule_id
      AND trip_schedules.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- 5. TRIP_COMMENTS テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE trip_comments ENABLE ROW LEVEL SECURITY;

-- 公開されている旅行記のコメントは誰でも閲覧可能
CREATE POLICY "trip_comments_select_policy" ON trip_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_comments.trip_schedule_id
      AND (trip_schedules.is_public = true OR trip_schedules.user_id = auth.uid()::text)
    )
  );

-- ログインユーザーは公開旅行記にコメント可能
CREATE POLICY "trip_comments_insert_policy" ON trip_comments
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    AND EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_comments.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

-- 自分のコメントのみ更新可能
CREATE POLICY "trip_comments_update_policy" ON trip_comments
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 自分のコメントのみ削除可能
CREATE POLICY "trip_comments_delete_policy" ON trip_comments
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 6. TRIP_LIKES テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;

-- 誰でも全てのいいねを閲覧可能（カウント用）
CREATE POLICY "trip_likes_select_policy" ON trip_likes
  FOR SELECT
  USING (true);

-- 自分のいいねのみ作成可能
CREATE POLICY "trip_likes_insert_policy" ON trip_likes
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "trip_likes_delete_policy" ON trip_likes
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 7. TRIP_BOOKMARKS テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE trip_bookmarks ENABLE ROW LEVEL SECURITY;

-- 自分のブックマークのみ閲覧可能
CREATE POLICY "trip_bookmarks_select_policy" ON trip_bookmarks
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- 自分のブックマークのみ作成可能
CREATE POLICY "trip_bookmarks_insert_policy" ON trip_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 自分のブックマークのみ削除可能
CREATE POLICY "trip_bookmarks_delete_policy" ON trip_bookmarks
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 8. FOLLOWS テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 誰でも全てのフォロー関係を閲覧可能（カウント用）
CREATE POLICY "follows_select_policy" ON follows
  FOR SELECT
  USING (true);

-- 自分のフォローのみ作成可能
CREATE POLICY "follows_insert_policy" ON follows
  FOR INSERT
  WITH CHECK (auth.uid()::text = follower_id);

-- 自分のフォローのみ削除可能
CREATE POLICY "follows_delete_policy" ON follows
  FOR DELETE
  USING (auth.uid()::text = follower_id);

-- =====================================================
-- 9. NOTIFICATIONS テーブル
-- =====================================================

-- RLSを有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 自分宛の通知のみ閲覧可能
CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- システムまたはユーザーが通知を作成可能
CREATE POLICY "notifications_insert_policy" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- 自分宛の通知のみ更新可能（既読フラグ用）
CREATE POLICY "notifications_update_policy" ON notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 自分宛の通知のみ削除可能
CREATE POLICY "notifications_delete_policy" ON notifications
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================================================
-- 完了メッセージ
-- =====================================================
-- RLSポリシーの設定が完了しました。
-- Supabaseダッシュボードで確認してください。
