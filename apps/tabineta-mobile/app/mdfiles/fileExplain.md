# Tabineta Mobile - ファイル構成解説

## プロジェクト概要

Tabineta Mobileは、旅行記録を共有するためのReact Native（Expo）モバイルアプリケーションです。
- **フレームワーク**: Expo + React Native
- **ルーティング**: Expo Router（ファイルベースルーティング）
- **状態管理**: Zustand
- **データフェッチング**: TanStack Query (React Query)
- **バックエンド**: Supabase（認証、データベース、ストレージ）
- **UIライブラリ**: React Native Paper
- **言語**: TypeScript

---

## ディレクトリ構造

```
tabineta-mobile/
├── app/                      # Expo Routerのルーティングフォルダ（画面定義）
│   ├── (auth)/              # 認証関連の画面グループ
│   ├── (tabs)/              # タブナビゲーション画面グループ
│   ├── auth/                # OAuth コールバック等
│   ├── trip/                # 旅行詳細画面
│   ├── trips/               # 旅行一覧画面
│   ├── users/               # ユーザープロフィール画面
│   ├── mdfiles/             # ドキュメント管理フォルダ
│   ├── _layout.tsx          # ルートレイアウト
│   ├── +html.tsx            # HTML出力用
│   ├── +not-found.tsx       # 404画面
│   └── modal.tsx            # モーダル画面
├── components/              # 再利用可能なUIコンポーネント
│   ├── auth/               # 認証関連コンポーネント
│   ├── common/             # 共通コンポーネント（Button, Input等）
│   ├── navigation/         # ナビゲーション関連
│   ├── notification/       # 通知関連
│   ├── profile/            # プロフィール関連
│   ├── search/             # 検索関連
│   ├── social/             # ソーシャル機能（いいね、コメント等）
│   └── trip/               # 旅行関連コンポーネント
├── hooks/                   # カスタムReact Hooks
│   ├── useAuth.ts          # 認証フック
│   ├── useTrips.ts         # 旅行データフック
│   ├── useSocial.ts        # ソーシャル機能フック
│   └── useImagePicker.ts   # 画像選択フック
├── lib/                     # ライブラリ・ユーティリティ
│   ├── supabase.ts         # Supabaseクライアント設定
│   ├── api.ts              # API関数
│   ├── auth.ts             # 認証ロジック
│   ├── social.ts           # ソーシャル機能ロジック
│   └── queryClient.ts      # React Query設定
├── stores/                  # Zustand状態管理ストア
│   └── authStore.ts        # 認証状態管理
├── types/                   # TypeScript型定義
│   └── index.ts            # 共通型定義
├── constants/               # 定数定義
│   ├── Colors.ts           # カラーテーマ
│   └── theme.ts            # テーマ設定
├── assets/                  # 静的アセット（画像、フォント等）
│   ├── fonts/              # フォントファイル
│   └── images/             # 画像ファイル
├── android/                 # Android固有の設定
├── .vscode/                 # VSCode設定
├── package.json            # 依存関係とスクリプト
├── app.json                # Expo設定
├── tsconfig.json           # TypeScript設定
└── README.md               # プロジェクト概要

```

---

## appフォルダの詳細解説

### 1. `app/_layout.tsx`（ルートレイアウト）
**役割**: アプリ全体のルートレイアウトを定義します。

**主な機能**:
- フォントの読み込み
- 認証状態の確認
- テーマプロバイダー（ダーク/ライトモード）
- React QueryとReact Native Paperのプロバイダー設定
- 認証状態に応じた画面の切り替え（認証前: `(auth)`, 認証後: `(tabs)`）
- トースト通知の設定

**コード例**:
```tsx
export default function RootLayout() {
  const [loaded, error] = useFonts({ ... });
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <ThemeProvider>
          <Stack>
            {!isAuthenticated ? (
              <Stack.Screen name="(auth)" />
            ) : (
              <Stack.Screen name="(tabs)" />
            )}
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
```

---

### 2. `app/(auth)/`（認証画面グループ）
**役割**: 認証に関連する画面をグループ化します。

#### `app/(auth)/_layout.tsx`
- 認証画面用のレイアウト

#### `app/(auth)/sign-in.tsx`
- ログイン画面
- メールアドレス/パスワードでのログイン
- Google OAuth ログイン

#### `app/(auth)/sign-up.tsx`
- 新規登録画面
- メールアドレス/パスワードでの登録
- バリデーション

---

### 3. `app/(tabs)/`（タブナビゲーション画面グループ）
**役割**: ログイン後のメイン画面をタブナビゲーションで管理します。

#### `app/(tabs)/_layout.tsx`
タブバーの設定を定義します。

```tsx
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#3B82F6' }}>
      <Tabs.Screen name="index" options={{ title: 'ホーム', ... }} />
      <Tabs.Screen name="explore" options={{ title: '探す', ... }} />
      <Tabs.Screen name="create" options={{ title: '作成', ... }} />
      <Tabs.Screen name="bookmarks" options={{ title: 'ブックマーク', ... }} />
      <Tabs.Screen name="profile" options={{ title: 'マイページ', ... }} />
    </Tabs>
  );
}
```

#### 各タブ画面:
- **`index.tsx`** (ホーム): タイムライン、最近の投稿を表示
- **`explore.tsx`** (探す): 旅行記の検索・探索機能
- **`create.tsx`** (作成): 新しい旅行記の作成
- **`bookmarks.tsx`** (ブックマーク): ブックマークした旅行記一覧
- **`profile.tsx`** (マイページ): ユーザープロフィールと設定

---

### 4. `app/auth/callback.tsx`
**役割**: OAuth認証（Google等）のコールバックを処理します。

---

### 5. `app/trip/[id].tsx` と `app/trips/[id].tsx`
**役割**: 動的ルートを使用した旅行詳細画面。

- `[id]`は動的パラメータで、URLから旅行IDを取得します
- 例: `/trip/123` → `id = "123"`

**コード例**:
```tsx
import { useLocalSearchParams } from 'expo-router';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  // id を使って旅行データを取得
}
```

---

### 6. `app/modal.tsx`
**役割**: モーダル表示用の画面。

---

### 7. `app/+not-found.tsx`
**役割**: 404エラー画面（存在しないルートにアクセスした場合）。

---

## 主要なフォルダの役割

### **components/** - UIコンポーネント
再利用可能なUIパーツを格納します。

#### `components/common/`
- **`Button.tsx`**: 共通ボタンコンポーネント
- **`Input.tsx`**: 共通入力フィールド
- **`LoadingSpinner.tsx`**: ローディング表示
- **`StatCard.tsx`**: 統計カード
- **`ActionCard.tsx`**: アクションカード

#### `components/social/`
- **`LikeButton.tsx`**: いいねボタン
- **`BookmarkButton.tsx`**: ブックマークボタン
- **`CommentForm.tsx`**: コメント投稿フォーム
- **`CommentItem.tsx`**: コメント表示アイテム
- **`CommentList.tsx`**: コメントリスト

#### `components/trip/`
- **`TripCard.tsx`**: 旅行カード表示
- **`ActivityFormModal.tsx`**: アクティビティ作成モーダル

---

### **hooks/** - カスタムフック
ロジックを再利用可能なフックとして抽出します。

#### `useAuth.ts`
認証状態を管理するフック。

```tsx
export function useAuth() {
  const { session, user, loading, setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, [setSession]);

  return { session, user, loading, isAuthenticated: !!session };
}
```

#### `useTrips.ts`
旅行データの取得・操作を行うフック。

#### `useSocial.ts`
いいね、ブックマーク、コメント機能を提供するフック。

#### `useImagePicker.ts`
画像選択機能を提供するフック。

---

### **lib/** - ユーティリティとAPI
ライブラリの初期化やAPI関数を格納します。

#### `supabase.ts`
Supabaseクライアントの初期化を行います。

```tsx
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStore, // ネイティブでは SecureStore を使用
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

#### `api.ts`
API呼び出しの共通関数を定義します。

#### `queryClient.ts`
React Query（TanStack Query）の設定。

```tsx
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      retry: 1,
    },
  },
});
```

---

### **stores/** - 状態管理
Zustandを使用したグローバル状態管理。

#### `authStore.ts`
認証状態を管理するストア。

```tsx
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    loading: false,
  }),
}));
```

---

### **types/** - 型定義
TypeScriptの型定義を一元管理します。

```tsx
export interface Trip {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  date: string;
  location?: string;
  notes?: string;
}
```

---

## TSXファイルの基本的な書き方

### 1. 基本構造
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 2. Props（プロパティ）の使用
```tsx
interface MyComponentProps {
  title: string;
  count: number;
  onPress?: () => void;
}

export default function MyComponent({ title, count, onPress }: MyComponentProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}: {count}</Text>
    </TouchableOpacity>
  );
}
```

### 3. State（状態）の使用
```tsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

### 4. useEffectの使用（副作用処理）
```tsx
import { useEffect } from 'react';

export default function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // コンポーネントのマウント時に実行
    fetchData().then(setData);

    // クリーンアップ関数（アンマウント時に実行）
    return () => {
      // リソースの解放など
    };
  }, []); // 空配列 = 初回のみ実行

  return <Text>{data}</Text>;
}
```

### 5. カスタムフックの使用
```tsx
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Text>ログインしてください</Text>;
  }

  return <Text>ようこそ、{user?.email}さん</Text>;
}
```

### 6. React Queryの使用（データフェッチング）
```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function TripList() {
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Text>エラー: {error.message}</Text>;

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TripCard trip={item} />}
    />
  );
}
```

### 7. フォームハンドリング（react-hook-form）
```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="メールアドレス"
          />
        )}
      />
      {errors.email && <Text>{errors.email.message}</Text>}

      <Button title="ログイン" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

### 8. ナビゲーション（Expo Router）
```tsx
import { router, useLocalSearchParams } from 'expo-router';

export default function TripDetailScreen() {
  // URLパラメータを取得
  const { id } = useLocalSearchParams();

  // プログラムでナビゲーション
  const navigateBack = () => {
    router.back();
  };

  const navigateToEdit = () => {
    router.push(`/trip/${id}/edit`);
  };

  return (
    <View>
      <Button title="戻る" onPress={navigateBack} />
      <Button title="編集" onPress={navigateToEdit} />
    </View>
  );
}
```

---

## ベストプラクティス

### 1. コンポーネントの分割
- 1つのコンポーネントは100行以内を目安に
- 再利用可能な部分は別コンポーネントに分割

### 2. 型定義の活用
- Propsには必ず型を定義
- `any`型の使用は避ける

### 3. カスタムフックの活用
- ロジックはカスタムフックに抽出
- UIとロジックを分離

### 4. パフォーマンス最適化
- 大きなリストには`FlatList`を使用
- `useMemo`や`useCallback`で不要な再レンダリングを防ぐ
- 画像は最適化してから使用

### 5. エラーハンドリング
- APIコールは必ずエラーハンドリングを行う
- ユーザーにわかりやすいエラーメッセージを表示

---

## 開発の流れ

1. **新しい画面を追加する場合**
   - `app/`フォルダに新しい`.tsx`ファイルを作成
   - Expo Routerが自動的にルートを生成

2. **新しいコンポーネントを追加する場合**
   - `components/`内の適切なサブフォルダに作成
   - 型定義を含める

3. **新しいAPIを追加する場合**
   - `lib/api.ts`または関連するファイルに関数を追加
   - React Queryで使用するためのフックを作成

4. **状態管理が必要な場合**
   - グローバル状態: `stores/`にZustandストアを作成
   - ローカル状態: `useState`を使用

---

このドキュメントを参考に、Tabineta Mobileアプリの開発を進めてください。
