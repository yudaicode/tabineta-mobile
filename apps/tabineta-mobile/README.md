# Tabineta Mobile

Tabineta のモバイルアプリケーション (iOS/Android) です。React Native と Expo を使用して開発されています。

## 技術スタック

- **フレームワーク**: React Native (Expo)
- **ルーティング**: Expo Router
- **認証**: Supabase Auth + expo-secure-store
- **状態管理**: Zustand + React Query
- **UI**: React Native Paper
- **言語**: TypeScript

## プロジェクト構造

```
tabineta-mobile/
├── app/                    # Expo Router 画面
│   ├── (auth)/            # 認証画面
│   ├── (tabs)/            # タブナビゲーション画面
│   ├── trips/             # 旅行詳細画面
│   └── users/             # ユーザープロフィール画面
├── components/            # UIコンポーネント
│   ├── common/           # 共通コンポーネント
│   ├── auth/             # 認証関連
│   ├── trip/             # 旅行関連
│   ├── social/           # ソーシャル機能
│   └── profile/          # プロフィール関連
├── hooks/                # カスタムフック
├── lib/                  # ライブラリ設定
│   ├── supabase.ts      # Supabaseクライアント
│   └── queryClient.ts   # React Query設定
├── stores/               # Zustand ストア
│   └── authStore.ts     # 認証ストア
├── types/                # TypeScript型定義
└── constants/            # 定数
```

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd apps/tabineta-mobile
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

必要な環境変数:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名キー
- `EXPO_PUBLIC_WEB_API_URL`: Web API URL
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth クライアント ID（オプション）

### 3. Google OAuth の設定（オプション）

#### 📝 セットアップドキュメント

- **🚀 [QUICK_START.md](./QUICK_START.md)**: チェックリスト形式のクイックスタートガイド（推奨）
- **📖 [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**: 詳細なセットアップ手順とトラブルシューティング
- **🪟 [SHA1_GUIDE_WINDOWS.md](./SHA1_GUIDE_WINDOWS.md)**: Windows で SHA-1 を取得する方法（Android SDK 不要の方法も紹介）

#### 重要な注意点

**✅ 既存のプロジェクトを使用できます**:
- すでに Web 版で Supabase プロジェクトと Google Cloud プロジェクトを作成している場合、**新しく作り直す必要はありません**
- 既存のプロジェクトにモバイルアプリの OAuth クライアント ID（iOS/Android）を追加するだけです
- 同じ Supabase プロジェクトを Web とモバイルで共有できます

#### 簡易セットアップ手順

1. Google Cloud Console で iOS/Android 用の OAuth クライアント ID を作成
2. Google Cloud Console の Web クライアント ID に `tabinetamobile://auth/callback` を追加
3. Supabase の Google Provider が有効になっていることを確認
4. `.env` ファイルを設定

詳しくは [QUICK_START.md](./QUICK_START.md) を参照してください。

### 4. 開発サーバーの起動

```bash
npm start
```

## 開発コマンド

- `npm start`: 開発サーバーを起動
- `npm run android`: Android エミュレータで起動
- `npm run ios`: iOS シミュレータで起動 (macOS のみ)
- `npm run web`: Web ブラウザで起動

## 実装フェーズ

現在のプロジェクトは以下のフェーズで実装を進めています:

### フェーズ1: 基盤構築 ✅ (完了)
- [x] Expo プロジェクトセットアップ
- [x] 依存パッケージインストール
- [x] Supabase 統合
- [x] ディレクトリ構造構築
- [x] 基本ライブラリ設定

### フェーズ2: 認証システム ✅ (完了)
- [x] 認証画面の実装 (サインイン・サインアップ)
- [x] メール/パスワード認証
- [x] セッション管理 (useAuth フック)
- [x] 認証状態に基づくナビゲーション
- [x] タブナビゲーション実装
- [x] ログアウト機能
- [x] Google OAuth 認証

### フェーズ3: コア機能 ✅ (完了)
- [x] ホーム画面 (旅行一覧表示)
  - 人気の旅行プラン (横スクロール)
  - 新着の旅行プラン (縦スクロール)
  - Pull-to-refresh 機能
- [x] 旅行詳細画面
  - カバー画像、タイトル、説明表示
  - 日程別スケジュール表示
  - アクティビティ詳細表示
- [x] 探す画面
  - キーワード検索
  - カテゴリフィルター
  - 検索結果表示
- [x] TripCard コンポーネント
- [x] API クライアント (Supabase統合)
- [x] React Query フック
- [x] 旅行作成機能
  - 3ステップウィザード（基本情報、日程、スケジュール）
  - アクティビティ追加モーダル
  - 画像アップロード機能
  - 日程自動生成

### フェーズ4: ソーシャル機能 ✅ (完了)
- [x] いいね機能
  - LikeButton コンポーネント
  - いいね数表示
  - トグル機能
- [x] コメント機能
  - CommentList コンポーネント
  - CommentForm コンポーネント
  - コメント投稿・削除機能
- [x] ブックマーク機能
  - BookmarkButton コンポーネント
  - ブックマーク画面実装
  - ブックマーク一覧表示
- [x] フォロー機能 (API・フック実装済み)
- [x] ソーシャル API (lib/social.ts)
- [x] ソーシャル React Query フック (hooks/useSocial.ts)
- [x] 旅行詳細画面へのソーシャル機能統合

### フェーズ5: 最適化・仕上げ
- [ ] パフォーマンス最適化
- [ ] オフライン対応
- [ ] プッシュ通知

## 詳細仕様

プロジェクトの詳細な仕様については、ルートディレクトリの `MOBILE_SPEC.md` を参照してください。

## ライセンス

Private
