# Tabineta モバイルアプリ 詳細仕様書

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [データモデル](#3-データモデル)
4. [認証システム](#4-認証システム)
5. [画面一覧とUI仕様](#5-画面一覧とui仕様)
6. [API統合](#6-api統合)
7. [コンポーネント設計](#7-コンポーネント設計)
8. [ナビゲーション構造](#8-ナビゲーション構造)
9. [状態管理](#9-状態管理)
10. [画像アップロード](#10-画像アップロード)
11. [通知機能](#11-通知機能)
12. [オフライン対応](#12-オフライン対応)
13. [パフォーマンス最適化](#13-パフォーマンス最適化)
14. [セキュリティ](#14-セキュリティ)
15. [実装フェーズ](#15-実装フェーズ)

---

## 1. プロジェクト概要

### 1.1 目的
Web版Tabinetaの全機能をReact Native (Expo)で再実装し、iOS・Android向けのネイティブアプリを提供する。

### 1.2 基本方針
- **Web版との機能同等性**: 既存Web版の機能を100%移植
- **既存バックエンドの活用**: Supabaseデータベースとストレージをそのまま使用
- **API再利用**: Web版のNext.js APIルートまたはSupabase直接クライアントを使用
- **UI/UX最適化**: モバイルネイティブな操作感を提供

### 1.3 対象プラットフォーム
- iOS 13.0以上
- Android 6.0 (API Level 23)以上

---

## 2. 技術スタック

### 2.1 フレームワーク・ライブラリ

#### コア
```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "expo-router": "~6.0.0",
  "typescript": "^5"
}
```

#### ナビゲーション
```json
{
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/native-stack": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0"
}
```

#### UI・スタイリング
```json
{
  "react-native-paper": "^5.12.0",
  "react-native-vector-icons": "^10.0.0",
  "@expo/vector-icons": "^14.0.0",
  "react-native-svg": "^15.0.0",
  "nativewind": "^4.0.0"
}
```

#### 認証
```json
{
  "@supabase/supabase-js": "^2.45.0",
  "expo-secure-store": "~14.0.0",
  "expo-auth-session": "~6.0.0",
  "expo-crypto": "~14.0.0"
}
```

#### 画像処理
```json
{
  "expo-image-picker": "~16.0.0",
  "expo-image-manipulator": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "react-native-fast-image": "^8.6.0"
}
```

#### 状態管理
```json
{
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^5.0.7"
}
```

#### ユーティリティ
```json
{
  "date-fns": "^3.0.0",
  "react-hook-form": "^7.52.0",
  "zod": "^3.23.0",
  "react-native-toast-message": "^2.2.0"
}
```

### 2.2 開発ツール
```json
{
  "eslint": "^8",
  "prettier": "^3.0.0",
  "@typescript-eslint/parser": "^7.0.0",
  "@typescript-eslint/eslint-plugin": "^7.0.0"
}
```

### 2.3 環境変数
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_WEB_API_URL=https://your-domain.com/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 3. データモデル

### 3.1 データベーススキーマ
既存のSupabaseスキーマをそのまま使用。TypeScript型定義を共有。

#### 3.1.1 profiles テーブル
```typescript
interface Profile {
  id: string;                    // UUID (auth.users参照)
  username: string | null;       // ユーザー名 (一意)
  full_name: string | null;      // 表示名
  bio: string | null;            // プロフィール文
  website: string | null;        // ウェブサイトURL
  avatar_url: string | null;     // アバター画像URL
  created_at: string;            // 作成日時
  updated_at: string | null;     // 更新日時
}
```

#### 3.1.2 trip_schedules テーブル
```typescript
interface TripSchedule {
  id: string;                    // UUID
  user_id: string;               // 作成者ID
  title: string;                 // 旅行タイトル
  description: string;           // 説明
  start_date: string;            // 開始日 (YYYY-MM-DD)
  end_date: string;              // 終了日 (YYYY-MM-DD)
  cover_image: string | null;    // カバー画像URL
  category: TripCategory;        // カテゴリ
  traveler_count: number;        // 旅行人数
  is_public: boolean;            // 公開/非公開
  created_at: string;
  updated_at: string;
}

type TripCategory =
  | '国内旅行'
  | '海外旅行'
  | 'グルメ旅'
  | '温泉旅行'
  | 'アウトドア'
  | '文化・歴史'
  | 'リゾート'
  | '冒険・アクティビティ'
  | 'その他';
```

#### 3.1.3 day_schedules テーブル
```typescript
interface DaySchedule {
  id: string;
  trip_schedule_id: string;      // 親旅行ID (CASCADE DELETE)
  day_number: number;            // 日数 (1, 2, 3...)
  date: string;                  // 日付 (YYYY-MM-DD)
  title: string;                 // 日タイトル
  created_at: string;
  updated_at: string;
}
```

#### 3.1.4 activities テーブル
```typescript
interface Activity {
  id: string;
  day_schedule_id: string;       // 親日程ID (CASCADE DELETE)
  time: string;                  // 時刻 (HH:MM)
  title: string;                 // アクティビティ名
  type: ActivityType;            // 種類
  location: string | null;       // 場所
  description: string | null;    // 詳細
  duration: string | null;       // 所要時間
  images: string[];              // 画像URL配列 (JSON)
  cost: number | null;           // 費用
  created_at: string;
  updated_at: string;
}

type ActivityType =
  | 'activity'        // アクティビティ
  | 'transport'       // 移動
  | 'meal'            // 食事
  | 'accommodation'   // 宿泊
  | 'shopping'        // ショッピング
  | 'sightseeing'     // 観光
  | 'meeting';        // 集合
```

#### 3.1.5 ソーシャル機能テーブル

**trip_likes (いいね)**
```typescript
interface TripLike {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  created_at: string;
}
```

**trip_comments (コメント)**
```typescript
interface TripComment {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

**trip_bookmarks (ブックマーク)**
```typescript
interface TripBookmark {
  id: string;
  user_id: string;
  trip_schedule_id: string;
  created_at: string;
}
```

**follows (フォロー)**
```typescript
interface Follow {
  follower_id: string;           // フォローする側
  following_id: string;          // フォローされる側
  created_at: string;
}
```

**notifications (通知)**
```typescript
interface Notification {
  id: string;
  user_id: string;               // 通知を受け取るユーザー
  from_user_id: string;          // 通知を発生させたユーザー
  type: 'like' | 'comment' | 'follow';
  content: string;               // 通知メッセージ
  trip_schedule_id: string | null;
  is_read: boolean;
  created_at: string;
}
```

### 3.2 ローカルストレージ設計

#### 3.2.1 認証情報 (expo-secure-store)
```typescript
// SecureStoreに保存
{
  "auth.session": {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: {
      id: string;
      email: string;
    }
  }
}
```

#### 3.2.2 アプリ設定 (AsyncStorage)
```typescript
{
  "app.settings": {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
    notifications_enabled: boolean;
    push_token: string | null;
  },
  "app.cache": {
    last_sync: string;
    cached_trips: TripSchedule[];
  }
}
```

---

## 4. 認証システム

### 4.1 認証フロー

#### 4.1.1 メール/パスワード認証

**サインアップ**
```
ユーザー入力 (email, password)
  ↓
入力バリデーション (Zod)
  ↓
POST /api/auth/signup
  ↓
Supabase Auth: signUp()
  ↓
profiles テーブルに自動作成
  ↓
確認メール送信 (オプション)
  ↓
自動ログイン & セッション保存
  ↓
ホーム画面へ遷移
```

**サインイン**
```
ユーザー入力 (email, password)
  ↓
Supabase Auth: signInWithPassword()
  ↓
2FA有効チェック
  ├─ 有効 → 6桁コード入力画面
  │           ↓
  │        POST /api/auth/2fa/verify
  │           ↓
  │        OTP検証 (otplib)
  │           ↓
  │        成功 → セッション発行
  │
  └─ 無効 → セッション保存
              ↓
          SecureStoreに保存
              ↓
          ホーム画面へ遷移
```

#### 4.1.2 Google OAuth認証
```
"Googleでログイン" ボタンタップ
  ↓
expo-auth-session で認証フロー開始
  ↓
Google認証画面 (WebView)
  ↓
認証成功 → リダイレクトURL取得
  ↓
Supabase Auth: signInWithIdToken()
  ↓
profiles テーブル確認
  ├─ 存在しない → 新規作成
  └─ 存在する → そのまま
  ↓
セッション保存 → ホーム画面
```

#### 4.1.3 2FA (Two-Factor Authentication)

**セットアップフロー**
```
セキュリティ設定画面
  ↓
"2FAを有効化" ボタン
  ↓
POST /api/auth/2fa/setup
  ↓
サーバー側でOTPシークレット生成 (otplib)
  ↓
QRコード画像とバックアップコードを返却
  ↓
QRコード表示 (react-native-qrcode-svg)
  ↓
バックアップコード表示 & 保存促進
  ↓
確認コード入力
  ↓
POST /api/auth/2fa/enable
  ↓
profiles.two_factor_enabled = true
  ↓
完了画面
```

### 4.2 セッション管理

#### 4.2.1 セッション永続化
```typescript
// lib/auth.ts
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

#### 4.2.2 セッション状態監視
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // セッション変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, user: session?.user };
}
```

### 4.3 認証画面UI仕様

#### 4.3.1 サインイン画面
**レイアウト**
```
┌─────────────────────────┐
│    [ロゴ画像]           │
│                         │
│   旅の思い出を         │
│   シェアしよう         │
│                         │
│  ┌─────────────────┐  │
│  │ メールアドレス  │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ パスワード     │  │
│  └─────────────────┘  │
│                         │
│  ┌─────────────────┐  │
│  │  ログイン      │  │
│  └─────────────────┘  │
│                         │
│  ─── または ───        │
│                         │
│  ┌─────────────────┐  │
│  │ Google ログイン│  │
│  └─────────────────┘  │
│                         │
│  アカウント作成はこちら│
└─────────────────────────┘
```

**入力バリデーション**
- メール: Zod email検証
- パスワード: 6文字以上
- エラー表示: 入力欄下部に赤文字

#### 4.3.2 2FAコード入力画面
```
┌─────────────────────────┐
│  ← 戻る                 │
│                         │
│   2段階認証             │
│                         │
│  認証アプリに表示され  │
│  ている6桁のコードを   │
│  入力してください       │
│                         │
│  ┌─┬─┬─┬─┬─┬─┐  │
│  │ │ │ │ │ │ │  │
│  └─┴─┴─┴─┴─┴─┘  │
│                         │
│  バックアップコードを  │
│  使用する               │
│                         │
│  ┌─────────────────┐  │
│  │    確認         │  │
│  └─────────────────┘  │
└─────────────────────────┘
```

---

## 5. 画面一覧とUI仕様

### 5.1 タブナビゲーション構造

**ボトムタブ (認証後)**
```
┌──────┬──────┬──────┬──────┬──────┐
│ ホーム│ 探す │  +  │ブックマーク│ マイページ│
└──────┴──────┴──────┴──────┴──────┘
```

### 5.2 各画面の詳細仕様

---

#### 5.2.1 ホーム画面 (Home)

**パス**: `/`
**タブアイコン**: Home

**レイアウト**
```
┌─────────────────────────────┐
│ Tabineta            🔔[3]   │  ← ヘッダー
├─────────────────────────────┤
│ ┌─────────────────────────┐│
│ │  人気の旅行プラン       ││  ← セクションタイトル
│ └─────────────────────────┘│
│                             │
│ ┌───────┬───────┬───────┐ │
│ │[カバー]│[カバー]│[カバー]│ │  ← 横スクロール
│ │タイトル│タイトル│タイトル│ │     TripCard
│ │♥ 24   │♥ 18   │♥ 32   │ │
│ └───────┴───────┴───────┘ │
│                             │
│ ┌─────────────────────────┐│
│ │  新着の旅行プラン       ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ [カバー画像]            ││  ← 縦スクロール
│ │ 東京3泊4日グルメ旅      ││     TripCard (大)
│ │ @username               ││
│ │ ♥ 42  💬 12             ││
│ ├─────────────────────────┤│
│ │ [カバー画像]            ││
│ │ 沖縄リゾート満喫        ││
│ │ ...                     ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**機能**
- 人気の旅行プラン (いいね数順TOP 10, 横スクロール)
- 新着の旅行プラン (作成日時順, 縦スクロール)
- Pull-to-refresh で再読み込み
- 無限スクロール (次ページ自動読み込み)

**API**
```typescript
// 人気の旅行取得
GET /api/trips?sort=popular&limit=10

// 新着取得
GET /api/trips?sort=latest&limit=20&offset=0
```

**状態管理**
```typescript
const [popularTrips, setPopularTrips] = useState<TripSchedule[]>([]);
const [latestTrips, setLatestTrips] = useState<TripSchedule[]>([]);
const [refreshing, setRefreshing] = useState(false);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(0);
```

---

#### 5.2.2 探す画面 (Explore)

**パス**: `/explore`
**タブアイコン**: Search

**レイアウト**
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐│
│ │ 🔍 キーワード検索      ││  ← SearchBar
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ フィルター              ││  ← 展開可能
│ │ ▼ カテゴリ              ││
│ │ ▼ 期間                  ││
│ │ ▼ 旅行日                ││
│ │ ▼ 人数                  ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 検索結果: 42件          ││
│ ├─────────────────────────┤│
│ │ [カバー画像]            ││
│ │ 京都紅葉めぐり          ││
│ │ 2泊3日 / 国内旅行       ││
│ │ ♥ 28  💬 5              ││
│ ├─────────────────────────┤│
│ │ ...                     ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**フィルター詳細**

**カテゴリ**
- 国内旅行
- 海外旅行
- グルメ旅
- 温泉旅行
- アウトドア
- 文化・歴史
- リゾート
- 冒険・アクティビティ
- その他

**期間 (duration)**
- 日帰り (1日)
- 1泊2日
- 2泊3日
- 3泊4日
- 4-6泊
- 1週間以上

**旅行日 (dateRange)**
- 今週
- 今月
- 3ヶ月以内
- 6ヶ月以内
- 指定しない

**人数 (travelerCount)**
- 1人
- 2人
- 3-5人
- 6人以上

**API**
```typescript
GET /api/search?
  q=キーワード&
  category=国内旅行&
  duration=2-3&
  dateRange=this_month&
  travelers=2
```

**UI コンポーネント**
- FilterModal (モーダルでフィルター選択)
- TripCard (検索結果アイテム)
- NoResults (結果なし表示)

---

#### 5.2.3 旅行作成画面 (Create)

**パス**: `/create`
**タブアイコン**: PlusCircle (中央大きめ)

**フロー**
```
基本情報入力
  ↓
日程入力
  ↓
各日のスケジュール入力
  ↓
プレビュー
  ↓
作成完了
```

**画面1: 基本情報**
```
┌─────────────────────────────┐
│ ← 旅行を作成               │
├─────────────────────────────┤
│ ステップ 1/3                │
│ 基本情報                    │
│                             │
│ タイトル *                  │
│ ┌─────────────────────────┐│
│ │ 例: 東京3泊4日グルメ旅  ││
│ └─────────────────────────┘│
│                             │
│ 説明 *                      │
│ ┌─────────────────────────┐│
│ │ 旅行の概要を入力...    ││
│ │                        ││
│ └─────────────────────────┘│
│                             │
│ カテゴリ *                  │
│ ┌─────────────────────────┐│
│ │ 国内旅行 ▼             ││
│ └─────────────────────────┘│
│                             │
│ カバー画像                  │
│ ┌─────────────────────────┐│
│ │   [+]                  ││
│ │  画像を追加            ││
│ └─────────────────────────┘│
│                             │
│ 人数                        │
│ ┌───┬───┬───┬───┬───┐    │
│ │ 1 │ 2 │ 3 │ 4 │ 5+│    │
│ └───┴───┴───┴───┴───┘    │
│                             │
│ 公開設定                    │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐│
│  ○ 公開  ○ 非公開       │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
│                             │
│ ┌─────────────────────────┐│
│ │      次へ               ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**画面2: 日程入力**
```
┌─────────────────────────────┐
│ ← 旅行を作成               │
├─────────────────────────────┤
│ ステップ 2/3                │
│ 日程                        │
│                             │
│ 出発日 *                    │
│ ┌─────────────────────────┐│
│ │ 2025/11/01  📅         ││ ← DatePicker
│ └─────────────────────────┘│
│                             │
│ 帰着日 *                    │
│ ┌─────────────────────────┐│
│ │ 2025/11/04  📅         ││
│ └─────────────────────────┘│
│                             │
│ 日数: 3泊4日                │
│                             │
│ ┌─────────────────────────┐│
│ │      次へ               ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**画面3: スケジュール入力**
```
┌─────────────────────────────┐
│ ← 旅行を作成               │
├─────────────────────────────┤
│ ステップ 3/3                │
│ スケジュール                │
│                             │
│ ┌───┬───┬───┬───┐        │
│ │1日│2日│3日│4日│        │  ← タブで日切り替え
│ └───┴───┴───┴───┘        │
│                             │
│ 1日目 - 2025/11/01          │
│                             │
│ ┌─────────────────────────┐│
│ │ 09:00  🚃 移動         ││
│ │ 新宿駅集合             ││
│ │ [編集] [削除]          ││
│ ├─────────────────────────┤│
│ │ 12:00  🍴 食事         ││
│ │ 築地市場でランチ       ││
│ │ [編集] [削除]          ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │   + アクティビティ追加 ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │   プレビューして作成    ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**アクティビティ追加モーダル**
```
┌─────────────────────────────┐
│ アクティビティを追加     [×]│
├─────────────────────────────┤
│ 時刻 *                      │
│ ┌─────┐                     │
│ │09:00│ 🕐                  │
│ └─────┘                     │
│                             │
│ タイトル *                  │
│ ┌─────────────────────────┐│
│ │ 新宿駅集合             ││
│ └─────────────────────────┘│
│                             │
│ 種類 *                      │
│ ┌───┬───┬───┬───┐        │
│ │🚶活動│🚃移動│🍴食事│🏨宿泊│ │
│ └───┴───┴───┴───┘        │
│ ┌───┬───┬───┐            │
│ │🛍買物│🗿観光│👥集合│       │
│ └───┴───┴───┘            │
│                             │
│ 場所                        │
│ ┌─────────────────────────┐│
│ │ 新宿駅南口             ││
│ └─────────────────────────┘│
│                             │
│ 説明                        │
│ ┌─────────────────────────┐│
│ │ 南口改札前に集合       ││
│ └─────────────────────────┘│
│                             │
│ 所要時間                    │
│ ┌─────────────────────────┐│
│ │ 15分                   ││
│ └─────────────────────────┘│
│                             │
│ 費用                        │
│ ┌─────────────────────────┐│
│ │ 0 円                   ││
│ └─────────────────────────┘│
│                             │
│ 画像                        │
│ ┌───┬───┬───┐            │
│ │[+]│   │   │            │
│ └───┴───┴───┘            │
│                             │
│ ┌─────────────────────────┐│
│ │      追加               ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**バリデーション**
- タイトル: 必須, 1-100文字
- 説明: 必須, 1-1000文字
- カテゴリ: 必須
- 日付: 必須, 開始日 ≤ 終了日
- アクティビティ時刻: 必須, HH:MM形式

**API**
```typescript
POST /api/trips
{
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  coverImage: string | null;
  isPublic: boolean;
  daySchedules: [
    {
      dayNumber: number;
      date: string;
      title: string;
      activities: [
        {
          time: string;
          title: string;
          type: string;
          location: string;
          description: string;
          duration: string;
          cost: number;
          images: string[];
        }
      ]
    }
  ]
}
```

---

#### 5.2.4 旅行詳細画面 (Trip Detail)

**パス**: `/trips/[id]`

**レイアウト**
```
┌─────────────────────────────┐
│ ←          [⋮]             │  ← ヘッダー (戻る, メニュー)
├─────────────────────────────┤
│ [カバー画像 (フルサイズ)]  │
│                             │
│                             │
├─────────────────────────────┤
│ 東京3泊4日グルメ旅          │  ← タイトル
│ 🍴 グルメ旅                 │  ← カテゴリ
│                             │
│ @username  [アバター]       │  ← 作成者情報
│                             │
│ ♥ いいね 42  💬 コメント 12 │  ← エンゲージメント
│ 🔖 ブックマーク             │
│                             │
│ 説明文がここに入ります...  │  ← 説明
│                             │
│ 📅 2025/11/01 - 11/04       │  ← 日程
│ 👥 2人                      │  ← 人数
│                             │
│ ┌───┬───┬───┬───┐        │
│ │1日│2日│3日│4日│        │  ← 日程タブ
│ └───┴───┴───┴───┘        │
│                             │
│ 1日目 - 2025/11/01          │
│                             │
│ ┌─────────────────────────┐│
│ │ 09:00 🚃 移動          ││
│ │ 新宿駅集合             ││
│ │ 📍 新宿駅南口          ││
│ │ ⏱ 15分 / 💰 0円       ││
│ ├─────────────────────────┤│
│ │ [画像1] [画像2]        ││
│ │ 南口改札前に集合...    ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 12:00 🍴 食事          ││
│ │ 築地市場でランチ       ││
│ │ ...                    ││
│ └─────────────────────────┘│
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━    │
│                             │
│ コメント (12)               │
│                             │
│ ┌─────────────────────────┐│
│ │ [アバター] @user123    ││
│ │ すごく参考になりました!││
│ │ 2日前                  ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ コメントを入力... [送信]││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**機能**
- カバー画像タップで全画面表示
- いいねボタンタップでトグル
- ブックマークボタンでトグル
- 共有ボタン (Share API)
- 自分の投稿の場合: 編集・削除メニュー
- コメント投稿・削除
- 作成者タップでプロフィール遷移

**API**
```typescript
// 旅行詳細取得
GET /api/trips/[id]

// いいね
POST /api/trips/[id]/likes

// ブックマーク
POST /api/trips/[id]/bookmarks

// コメント投稿
POST /api/trips/[id]/comments
{ content: string }

// コメント削除
DELETE /api/trips/[id]/comments?commentId=xxx
```

---

#### 5.2.5 ブックマーク画面 (Bookmarks)

**パス**: `/bookmarks`
**タブアイコン**: Bookmark

**レイアウト**
```
┌─────────────────────────────┐
│ ブックマーク                │
├─────────────────────────────┤
│ ┌─────────────────────────┐│
│ │ [カバー画像]            ││
│ │ 京都紅葉めぐり          ││
│ │ @username               ││
│ │ ♥ 28  💬 5              ││
│ ├─────────────────────────┤│
│ │ [カバー画像]            ││
│ │ 沖縄リゾート満喫        ││
│ │ ...                     ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**機能**
- ブックマーク一覧表示
- タップで詳細画面へ
- Pull-to-refresh
- 空状態表示 (「まだブックマークがありません」)

**API**
```typescript
GET /api/users/[userId]/bookmarks
```

---

#### 5.2.6 マイページ (Profile)

**パス**: `/profile/[id]`
**タブアイコン**: User

**レイアウト (自分)**
```
┌─────────────────────────────┐
│         [⚙設定]            │
├─────────────────────────────┤
│      [アバター画像]         │
│                             │
│      @username              │
│      表示名                 │
│                             │
│  プロフィール文がここに... │
│  🌐 https://example.com     │
│                             │
│  ┌────┬────┬────┐         │
│  │12  │128 │256 │         │
│  │旅行│フォロワー│フォロー中│ │
│  └────┴────┴────┘         │
│                             │
│  ┌───────────────────────┐ │
│  │  プロフィール編集     │ │
│  └───────────────────────┘ │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━    │
│                             │
│ 投稿した旅行 (12)           │
│                             │
│ ┌───────┬───────┐         │
│ │[カバー]│[カバー]│         │  ← グリッド表示
│ ├───────┼───────┤         │
│ │[カバー]│[カバー]│         │
│ └───────┴───────┘         │
└─────────────────────────────┘
```

**レイアウト (他人)**
```
┌─────────────────────────────┐
│ ←                           │
├─────────────────────────────┤
│      [アバター画像]         │
│                             │
│      @username              │
│      表示名                 │
│                             │
│  プロフィール文がここに... │
│                             │
│  ┌────┬────┬────┐         │
│  │8   │45  │32  │         │
│  │旅行│フォロワー│フォロー中│ │
│  └────┴────┴────┘         │
│                             │
│  ┌───────────────────────┐ │
│  │   フォローする        │ │  ← フォロー状態でトグル
│  └───────────────────────┘ │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━    │
│                             │
│ 旅行プラン (8)              │
│                             │
│ ┌───────┬───────┐         │
│ │[カバー]│[カバー]│         │
│ └───────┴───────┘         │
└─────────────────────────────┘
```

**機能**
- フォロー/フォロー解除
- フォロワー数/フォロー中数タップで一覧表示
- 投稿グリッド表示 (2列)
- プロフィール編集 (自分のみ)

**API**
```typescript
// プロフィール取得
GET /api/users/[id]

// ユーザーの旅行取得
GET /api/users/[id]/trips

// フォロー
POST /api/users/[id]/follow

// フォロー解除
DELETE /api/users/[id]/follow
```

---

#### 5.2.7 プロフィール編集画面

**パス**: `/profile/edit`

**レイアウト**
```
┌─────────────────────────────┐
│ ← プロフィール編集      [保存]│
├─────────────────────────────┤
│      [アバター画像]         │
│      [写真を変更]           │
│                             │
│ ユーザー名 *                │
│ ┌─────────────────────────┐│
│ │ username123            ││
│ └─────────────────────────┘│
│                             │
│ 表示名                      │
│ ┌─────────────────────────┐│
│ │ 山田太郎               ││
│ └─────────────────────────┘│
│                             │
│ 自己紹介                    │
│ ┌─────────────────────────┐│
│ │ 旅行好きです...        ││
│ │                        ││
│ └─────────────────────────┘│
│                             │
│ ウェブサイト                │
│ ┌─────────────────────────┐│
│ │ https://example.com    ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**バリデーション**
- ユーザー名: 必須, 3-30文字, 英数字とアンダースコアのみ, 一意
- 表示名: 1-50文字
- 自己紹介: 最大500文字
- ウェブサイト: URL形式

**API**
```typescript
PUT /api/profile
{
  username: string;
  full_name: string;
  bio: string;
  website: string;
  avatar_url: string;
}
```

---

#### 5.2.8 設定画面

**パス**: `/settings`

**レイアウト**
```
┌─────────────────────────────┐
│ ← 設定                      │
├─────────────────────────────┤
│ アカウント                  │
│ ┌─────────────────────────┐│
│ │ プロフィール編集     > ││
│ ├─────────────────────────┤│
│ │ セキュリティ         > ││
│ └─────────────────────────┘│
│                             │
│ アプリ設定                  │
│ ┌─────────────────────────┐│
│ │ 通知                 > ││
│ ├─────────────────────────┤│
│ │ テーマ               > ││
│ ├─────────────────────────┤│
│ │ 言語                 > ││
│ └─────────────────────────┘│
│                             │
│ その他                      │
│ ┌─────────────────────────┐│
│ │ 利用規約             > ││
│ ├─────────────────────────┤│
│ │ プライバシーポリシー > ││
│ ├─────────────────────────┤│
│ │ アプリについて       > ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │    ログアウト           ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

#### 5.2.9 セキュリティ設定画面

**パス**: `/settings/security`

**レイアウト**
```
┌─────────────────────────────┐
│ ← セキュリティ              │
├─────────────────────────────┤
│ 2段階認証                   │
│                             │
│ ┌─────────────────────────┐│
│ │ 2段階認証      [○ ON] ││  ← Toggle
│ │                        ││
│ │ セキュリティを強化する ││
│ │ ために2段階認証を有効化││
│ │ することをおすすめします││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │  2FAを設定する         ││  ← OFFの場合
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │  2FAを無効化する       ││  ← ONの場合
│ └─────────────────────────┘│
│                             │
│ パスワード変更              │
│ ┌─────────────────────────┐│
│ │  パスワードを変更     >││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

---

#### 5.2.10 通知画面

**パス**: `/notifications`

**レイアウト**
```
┌─────────────────────────────┐
│ 通知                   [全て既読]│
├─────────────────────────────┤
│ ┌─────────────────────────┐│
│ │ [●] [アバター]         ││  ← 未読 (青丸)
│ │ @user123さんがあなたを  ││
│ │ フォローしました        ││
│ │ 5分前                  ││
│ ├─────────────────────────┤│
│ │ [アバター]             ││  ← 既読
│ │ @user456さんがあなたの ││
│ │ 投稿にいいねしました   ││
│ │ 1時間前                ││
│ ├─────────────────────────┤│
│ │ [アバター]             ││
│ │ @user789さんがコメント ││
│ │ しました               ││
│ │ 3時間前                ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**機能**
- 通知タイプ: like, comment, follow
- タップで該当画面へ遷移
- 未読バッジ表示
- 全て既読ボタン

**API**
```typescript
GET /api/notifications

PATCH /api/notifications
{ ids: string[] }  // 既読にする通知ID
```

---

## 6. API統合

### 6.1 API呼び出し方法

#### 6.1.1 選択肢

**Option A: Next.js APIルート経由 (推奨)**
```typescript
// lib/api.ts
const API_BASE = process.env.EXPO_PUBLIC_WEB_API_URL;

export async function fetchTrips() {
  const response = await fetch(`${API_BASE}/api/trips`);
  return response.json();
}
```

**Option B: Supabase直接クライアント**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// 使用例
const { data, error } = await supabase
  .from('trip_schedules')
  .select('*')
  .eq('is_public', true)
  .order('created_at', { ascending: false });
```

**推奨**: Next.js APIルート経由 (既存ロジック再利用、RLS統一)

### 6.2 React Query統合

```typescript
// hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trips`);
      return res.json();
    },
  });
}

export function useTripDetail(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/trips/${id}`);
      return res.json();
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTripInput) => {
      const res = await fetch(`${API_BASE}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
```

### 6.3 エラーハンドリング

```typescript
// lib/errorHandler.ts
import Toast from 'react-native-toast-message';

export function handleApiError(error: any) {
  if (error.status === 401) {
    Toast.show({
      type: 'error',
      text1: '認証エラー',
      text2: 'もう一度ログインしてください',
    });
    // Navigate to login
  } else if (error.status === 403) {
    Toast.show({
      type: 'error',
      text1: 'アクセス権限がありません',
    });
  } else if (error.status === 404) {
    Toast.show({
      type: 'error',
      text1: 'データが見つかりません',
    });
  } else {
    Toast.show({
      type: 'error',
      text1: 'エラーが発生しました',
      text2: error.message || '再度お試しください',
    });
  }
}
```

---

## 7. コンポーネント設計

### 7.1 コンポーネント階層

```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
├── auth/
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── TwoFactorInput.tsx
│   └── GoogleSignInButton.tsx
├── trip/
│   ├── TripCard.tsx
│   ├── TripCardSmall.tsx
│   ├── TripDetail.tsx
│   ├── DayScheduleTab.tsx
│   ├── ActivityItem.tsx
│   ├── ActivityForm.tsx
│   └── TripCreateWizard.tsx
├── social/
│   ├── LikeButton.tsx
│   ├── BookmarkButton.tsx
│   ├── CommentList.tsx
│   ├── CommentItem.tsx
│   ├── CommentForm.tsx
│   ├── FollowButton.tsx
│   └── ShareButton.tsx
├── profile/
│   ├── ProfileHeader.tsx
│   ├── ProfileStats.tsx
│   ├── ProfileTripGrid.tsx
│   └── ProfileEditForm.tsx
├── search/
│   ├── SearchBar.tsx
│   ├── FilterModal.tsx
│   ├── CategoryPicker.tsx
│   └── TripList.tsx
├── notification/
│   ├── NotificationList.tsx
│   ├── NotificationItem.tsx
│   └── NotificationBadge.tsx
└── navigation/
    ├── TabBar.tsx
    ├── Header.tsx
    └── BackButton.tsx
```

### 7.2 主要コンポーネント仕様

#### 7.2.1 TripCard

**用途**: 旅行プランのカード表示 (一覧用)

**Props**
```typescript
interface TripCardProps {
  trip: TripSchedule;
  onPress?: () => void;
  variant?: 'default' | 'small';
}
```

**レイアウト**
```tsx
<TouchableOpacity onPress={onPress}>
  <Card>
    <FastImage source={{ uri: trip.cover_image }} />
    <View>
      <Text>{trip.title}</Text>
      <Text>{trip.category}</Text>
      <View>
        <Avatar source={{ uri: trip.user.avatar_url }} />
        <Text>@{trip.user.username}</Text>
      </View>
      <View>
        <LikeButton tripId={trip.id} count={trip.likes_count} />
        <CommentCount count={trip.comments_count} />
      </View>
    </View>
  </Card>
</TouchableOpacity>
```

#### 7.2.2 ActivityItem

**用途**: アクティビティの表示・編集

**Props**
```typescript
interface ActivityItemProps {
  activity: Activity;
  editable?: boolean;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: string) => void;
}
```

**レイアウト**
```tsx
<Card>
  <View>
    <Text>{activity.time}</Text>
    <Text>{getActivityIcon(activity.type)} {activity.title}</Text>
    {activity.location && (
      <Text>📍 {activity.location}</Text>
    )}
    {activity.duration && (
      <Text>⏱ {activity.duration}</Text>
    )}
    {activity.cost && (
      <Text>💰 {activity.cost}円</Text>
    )}
  </View>

  {activity.images.length > 0 && (
    <ScrollView horizontal>
      {activity.images.map((img) => (
        <Image source={{ uri: img }} key={img} />
      ))}
    </ScrollView>
  )}

  {activity.description && (
    <Text>{activity.description}</Text>
  )}

  {editable && (
    <View>
      <Button onPress={() => onEdit?.(activity)}>編集</Button>
      <Button onPress={() => onDelete?.(activity.id)}>削除</Button>
    </View>
  )}
</Card>
```

#### 7.2.3 LikeButton

**Props**
```typescript
interface LikeButtonProps {
  tripId: string;
  initialLiked?: boolean;
  initialCount?: number;
}
```

**実装**
```tsx
export function LikeButton({ tripId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked || false);
  const [count, setCount] = useState(initialCount || 0);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/trips/${tripId}/likes`, {
        method: 'POST',
      });
      const data = await response.json();
      setLiked(data.liked);
      setCount(data.count);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleToggle} disabled={loading}>
      <Icon name={liked ? 'heart' : 'heart-outline'} color={liked ? 'red' : 'gray'} />
      <Text>{count}</Text>
    </TouchableOpacity>
  );
}
```

---

## 8. ナビゲーション構造

### 8.1 ナビゲーター階層

```
RootNavigator (Stack)
├── AuthStack (認証前)
│   ├── SignIn
│   ├── SignUp
│   └── TwoFactor
│
└── AppTabs (認証後)
    ├── HomeTab (Stack)
    │   ├── Home
    │   ├── TripDetail
    │   └── UserProfile
    │
    ├── ExploreTab (Stack)
    │   ├── Explore
    │   ├── TripDetail
    │   └── UserProfile
    │
    ├── CreateTab (Stack)
    │   └── CreateTrip
    │
    ├── BookmarksTab (Stack)
    │   ├── Bookmarks
    │   ├── TripDetail
    │   └── UserProfile
    │
    └── ProfileTab (Stack)
        ├── Profile
        ├── ProfileEdit
        ├── Settings
        ├── Security
        └── Notifications
```

### 8.2 Expo Routerを使った実装

**ディレクトリ構造**
```
app/
├── (auth)/
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── two-factor.tsx
│
├── (tabs)/
│   ├── index.tsx              (Home)
│   ├── explore.tsx
│   ├── create.tsx
│   ├── bookmarks.tsx
│   ├── profile/
│   │   ├── index.tsx
│   │   ├── edit.tsx
│   │   └── settings.tsx
│   └── _layout.tsx            (Tab Layout)
│
├── trips/
│   └── [id].tsx               (Trip Detail)
│
├── users/
│   └── [id].tsx               (User Profile)
│
├── notifications.tsx
├── _layout.tsx                (Root Layout)
└── +not-found.tsx
```

**app/_layout.tsx**
```tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Slot } from 'expo-router';

export default function RootLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Slot />;
}
```

**app/(tabs)/_layout.tsx**
```tsx
import { Tabs } from 'expo-router';
import { Home, Search, PlusCircle, Bookmark, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '探す',
          tabBarIcon: ({ color }) => <Search color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '作成',
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={32} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'ブックマーク',
          tabBarIcon: ({ color }) => <Bookmark color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'マイページ',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## 9. 状態管理

### 9.1 Zustand Store設計

#### 9.1.1 Auth Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user || null, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
```

#### 9.1.2 Trip Store (キャッシュ)

```typescript
// stores/tripStore.ts
import { create } from 'zustand';
import type { TripSchedule } from '@/types';

interface TripState {
  trips: Record<string, TripSchedule>;
  setTrip: (trip: TripSchedule) => void;
  getTrip: (id: string) => TripSchedule | undefined;
  clearTrips: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: {},
  setTrip: (trip) => set((state) => ({
    trips: { ...state.trips, [trip.id]: trip },
  })),
  getTrip: (id) => get().trips[id],
  clearTrips: () => set({ trips: {} }),
}));
```

### 9.2 React Query設定

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,  // 5分
      gcTime: 10 * 60 * 1000,    // 10分
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 10. 画像アップロード

### 10.1 フロー

```
ImagePicker起動
  ↓
ユーザーが画像選択
  ↓
ImageManipulator でリサイズ (max 1920px)
  ↓
Base64 or Blob変換
  ↓
POST /api/upload (multipart/form-data)
  ↓
Supabase Storage にアップロード
  ↓
公開URLを返却
  ↓
フォームに画像URL保存
```

### 10.2 実装

```typescript
// hooks/useImagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export function useImagePicker() {
  const pickImage = async (): Promise<string | null> => {
    // パーミッション確認
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: '写真へのアクセスを許可してください',
      });
      return null;
    }

    // 画像選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) return null;

    // リサイズ
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 1920 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // アップロード
    const url = await uploadImage(manipulated.uri);
    return url;
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const type = 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    return data.url;
  };

  return { pickImage };
}
```

---

## 11. 通知機能

### 11.1 プッシュ通知

#### 11.1.1 Expo Notificationsセットアップ

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('プッシュ通知の許可が必要です');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  return token;
}
```

#### 11.1.2 通知タイプ

**いいね通知**
```json
{
  "title": "新しいいいね",
  "body": "@user123があなたの投稿「東京グルメ旅」にいいねしました",
  "data": {
    "type": "like",
    "trip_id": "xxx",
    "from_user_id": "yyy"
  }
}
```

**コメント通知**
```json
{
  "title": "新しいコメント",
  "body": "@user456があなたの投稿にコメントしました",
  "data": {
    "type": "comment",
    "trip_id": "xxx",
    "comment_id": "zzz"
  }
}
```

**フォロー通知**
```json
{
  "title": "新しいフォロワー",
  "body": "@user789があなたをフォローしました",
  "data": {
    "type": "follow",
    "from_user_id": "yyy"
  }
}
```

### 11.2 アプリ内通知

React Native Toast Messageを使用

```typescript
Toast.show({
  type: 'success',
  text1: '旅行を作成しました',
  text2: '公開されました',
  visibilityTime: 3000,
});
```

---

## 12. オフライン対応

### 12.1 キャッシュ戦略

#### React Query のキャッシュ

```typescript
// 既読み込みデータはキャッシュから表示
const { data, isLoading } = useQuery({
  queryKey: ['trips'],
  queryFn: fetchTrips,
  staleTime: 5 * 60 * 1000,  // 5分間は fresh
  gcTime: 30 * 60 * 1000,    // 30分間キャッシュ保持
});
```

#### AsyncStorageへの永続化 (オプション)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24時間
});
```

### 12.2 ネットワーク状態検出

```typescript
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}
```

---

## 13. パフォーマンス最適化

### 13.1 画像最適化

```typescript
// react-native-fast-image を使用
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 13.2 リスト最適化

```typescript
// FlatList で仮想化
<FlatList
  data={trips}
  renderItem={({ item }) => <TripCard trip={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### 13.3 メモ化

```typescript
// React.memo で不要な再レンダリング防止
export const TripCard = React.memo(({ trip }: TripCardProps) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.trip.id === nextProps.trip.id;
});

// useMemo / useCallback
const filteredTrips = useMemo(() => {
  return trips.filter((trip) => trip.category === selectedCategory);
}, [trips, selectedCategory]);

const handleLike = useCallback(() => {
  // ...
}, [tripId]);
```

---

## 14. セキュリティ

### 14.1 認証トークン保護

```typescript
// expo-secure-store で暗号化保存
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('auth.token', token);
const token = await SecureStore.getItemAsync('auth.token');
```

### 14.2 APIリクエスト認証

```typescript
// すべてのAPIリクエストにトークンを付与
export async function authFetch(url: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}
```

### 14.3 入力サニタイゼーション

```typescript
import DOMPurify from 'isomorphic-dompurify';

// XSS対策
const sanitizedContent = DOMPurify.sanitize(userInput);
```

---

## 15. 実装フェーズ

### フェーズ1: 基盤構築 (1-2週間)

**タスク**
- [ ] Expoプロジェクトセットアップ
- [ ] 依存パッケージインストール
- [ ] Supabase統合
- [ ] 認証システム実装
  - [ ] メール/パスワード認証
  - [ ] Google OAuth
  - [ ] セッション管理
- [ ] ナビゲーション構築
- [ ] 基本コンポーネント作成 (Button, Input, Card, etc.)

**成果物**
- 認証フロー完成
- タブナビゲーション完成

---

### フェーズ2: コア機能 (2-3週間)

**タスク**
- [ ] ホーム画面実装
- [ ] 旅行詳細画面実装
- [ ] 旅行作成機能実装
  - [ ] 基本情報入力
  - [ ] 日程入力
  - [ ] スケジュール編集
  - [ ] 画像アップロード
- [ ] 探す画面実装
  - [ ] 検索機能
  - [ ] フィルター機能
- [ ] API統合 (React Query)

**成果物**
- 旅行CRUD機能完成
- 検索・フィルター機能完成

---

### フェーズ3: ソーシャル機能 (1-2週間)

**タスク**
- [ ] いいね機能
- [ ] コメント機能
- [ ] ブックマーク機能
- [ ] フォロー機能
- [ ] プロフィール画面実装
- [ ] プロフィール編集機能
- [ ] 通知機能実装

**成果物**
- ソーシャル機能完成
- プロフィール機能完成

---

### フェーズ4: 最適化・仕上げ (1週間)

**タスク**
- [ ] パフォーマンス最適化
  - [ ] 画像最適化
  - [ ] リスト仮想化
  - [ ] キャッシュ戦略
- [ ] オフライン対応
- [ ] プッシュ通知実装
- [ ] エラーハンドリング強化
- [ ] ローディング状態改善
- [ ] アニメーション追加

**成果物**
- 最適化完了
- UX向上

---

### フェーズ5: テスト・リリース準備 (1週間)

**タスク**
- [ ] 手動テスト
- [ ] バグ修正
- [ ] App Store / Google Play アセット準備
  - [ ] スクリーンショット
  - [ ] アプリアイコン
  - [ ] プライバシーポリシー
  - [ ] 利用規約
- [ ] ビルド設定
  - [ ] iOS Bundle ID
  - [ ] Android Package Name
  - [ ] 署名設定
- [ ] TestFlight / Internal Testing配布

**成果物**
- アプリストア申請可能状態

---

## 補足資料

### A. 環境構築手順

```bash
# 1. プロジェクト作成
cd apps
npx create-expo-app@latest mobile --template tabs

# 2. 依存パッケージインストール
cd mobile
npm install @supabase/supabase-js
npm install expo-secure-store expo-auth-session expo-crypto
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-paper react-native-vector-icons
npm install @tanstack/react-query zustand
npm install date-fns react-hook-form zod
npm install react-native-toast-message
npm install expo-image-picker expo-image-manipulator
npm install react-native-fast-image
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo

# 3. 環境変数設定
cp .env.example .env.local
# .env.localに環境変数を設定

# 4. 開発サーバー起動
npm start
```

### B. ディレクトリ構造

```
apps/mobile/
├── app/                    # Expo Router画面
│   ├── (auth)/
│   ├── (tabs)/
│   ├── trips/
│   ├── users/
│   └── _layout.tsx
├── components/             # コンポーネント
│   ├── common/
│   ├── auth/
│   ├── trip/
│   ├── social/
│   └── profile/
├── hooks/                  # カスタムフック
│   ├── useAuth.ts
│   ├── useTrips.ts
│   └── useImagePicker.ts
├── lib/                    # ユーティリティ
│   ├── supabase.ts
│   ├── api.ts
│   ├── queryClient.ts
│   └── notifications.ts
├── stores/                 # Zustand Store
│   ├── authStore.ts
│   └── tripStore.ts
├── types/                  # TypeScript型定義
│   └── index.ts
├── constants/              # 定数
│   └── categories.ts
├── app.json
├── package.json
└── tsconfig.json
```

### C. 型定義ファイル共有

Web版の `apps/web/lib/database.types.ts` をモバイルでも使用可能にする:

**Option 1: シンボリックリンク**
```bash
ln -s ../../web/lib/database.types.ts apps/mobile/types/database.types.ts
```

**Option 2: 共有パッケージ化**
```
packages/types/
├── src/
│   └── database.types.ts
└── package.json
```

---

## まとめ

この仕様書は、Web版Tabinetaの全機能をReact Native (Expo)で完全再現するための詳細設計書です。

**重要ポイント**:
1. 既存のSupabaseバックエンドをそのまま活用
2. Next.js APIルート経由でデータアクセス
3. React QueryとZustandで状態管理
4. Expo Routerでファイルベースルーティング
5. React Native PaperでUI統一
6. 段階的な実装フェーズ (5フェーズ, 計6-9週間)

**次のステップ**:
1. Expoプロジェクト作成
2. 認証機能から実装開始
3. 各フェーズを順次進める

ご質問や追加仕様が必要な箇所があれば、お知らせください。
