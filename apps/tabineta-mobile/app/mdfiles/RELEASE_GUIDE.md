# Tabineta iOS リリース手順書

## 前提条件

- [x] Apple Developer Program に登録済み ($99/年)
- [x] Expo / EAS CLI インストール済み
- [x] Supabase データベース構築済み
- [x] アプリ機能実装完了

---

## ステップ 1: プライバシーポリシーの Web 公開

App Store Connect ではプライバシーポリシーの **URL** が必須。

### 方法 A: GitHub Pages (無料・推奨)

1. GitHub リポジトリの Settings > Pages を有効化
2. `docs/privacy-policy.html` を作成してプッシュ
3. URL 例: `https://yourusername.github.io/tabineta/privacy-policy.html`

### 方法 B: Supabase Edge Function

1. Edge Function でプライバシーポリシーの HTML を返すエンドポイントを作成
2. URL 例: `https://qligfarbbfsbyarihnxw.supabase.co/functions/v1/privacy-policy`

### 方法 C: 既存の Web サイト

- 自分のドメインにプライバシーポリシーページを設置

> **取得した URL をメモしておく** → ステップ 4 で使用

---

## ステップ 2: Apple 認証情報の確認

### 必要な情報

| 項目 | 確認場所 |
|------|----------|
| Apple ID (メール) | Apple Developer アカウントのログインメール |
| Team ID | https://developer.apple.com/account > Membership > Team ID |
| ASC App ID | ステップ 4 で App Store Connect にアプリ作成後に取得 |

### eas.json の更新

`eas.json` の submit > production > ios セクションを更新:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-actual-email@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

> **注意**: `ascAppId` はステップ 4 の後に記入する

---

## ステップ 3: EAS プロジェクトの確認

```bash
# EAS CLI がインストールされているか確認
npx eas-cli --version

# EAS にログイン
npx eas-cli login

# プロジェクトの紐付けを確認
npx eas-cli project:info
```

EAS プロジェクト ID: `0b1e87d7-50f3-4eb0-b98c-045a5ca26a70`

---

## ステップ 4: App Store Connect でアプリを作成

1. https://appstoreconnect.apple.com にアクセス
2. 「マイ App」>「+」>「新規 App」
3. 以下を入力:

| 項目 | 値 |
|------|-----|
| プラットフォーム | iOS |
| 名前 | Tabineta |
| プライマリ言語 | 日本語 |
| バンドル ID | com.tabineta.mobile |
| SKU | com.tabineta.mobile (任意の一意文字列) |
| ユーザーアクセス | アクセス制限なし |

4. 作成後、「App 情報」ページの **Apple ID** (数字) をメモ → `eas.json` の `ascAppId` に記入

### App Store 情報の入力

App Store Connect で以下を設定:

#### 基本情報
- **カテゴリ**: 旅行
- **サブカテゴリ**: ソーシャルネットワーキング (任意)
- **プライバシーポリシー URL**: ステップ 1 で作成した URL
- **年齢制限**: 4+ (該当する場合)

#### App Store 掲載情報
- **スクリーンショット**: iPhone 6.7インチ (必須)、6.5インチ、5.5インチ
  - 最低 3 枚、最大 10 枚
  - Simulator で撮影可能
- **説明文** (例):

```
Tabineta は、旅行プランを作成・共有できるソーシャルアプリです。

【主な機能】
・旅行プランの作成 - 日程・スケジュールを簡単に作成
・旅行記の共有 - 公開設定で他のユーザーと共有
・いいね・コメント - 他のユーザーの旅行記にリアクション
・ブックマーク - 気になる旅行記を保存
・フォロー - お気に入りのユーザーをフォロー
・カテゴリ検索 - 国内旅行、海外旅行、グルメ旅など

旅の計画から共有まで、Tabineta で旅をもっと楽しく。
```

- **キーワード** (例): `旅行,旅行記,旅行プラン,しおり,スケジュール,共有,SNS,旅`
- **サポート URL**: プライバシーポリシーと同じ URL or サポートページ
- **プロモーションテキスト** (任意): `旅行プランを作成・共有しよう`

---

## ステップ 5: 本番ビルドの実行

```bash
# iOS 本番ビルド
npx eas-cli build --platform ios --profile production
```

### ビルド中に聞かれること

1. **Apple アカウントへのログイン**: Apple ID とパスワードを入力
2. **Distribution Certificate**: 「Generate new」を選択 (初回)
3. **Provisioning Profile**: 「Generate new」を選択 (初回)

> ビルドは EAS のクラウド上で実行される (Mac 不要)
> ビルド完了まで待つ (状況は https://expo.dev で確認可能)

---

## ステップ 6: App Store への提出

### 方法 A: EAS Submit (推奨)

```bash
# eas.json の ascAppId を設定済みであること
npx eas-cli submit --platform ios --profile production
```

対話形式で最新のビルドを選択すると、自動で App Store Connect にアップロードされる。

### 方法 B: 手動アップロード

1. EAS ダッシュボードからビルド (.ipa) をダウンロード
2. Transporter アプリ (Mac App Store から無料) で App Store Connect にアップロード

---

## ステップ 7: 審査提出

1. App Store Connect で「ビルド」に新しいビルドが表示される
2. ビルドを選択
3. **App Review 情報** を入力:
   - デモアカウント情報 (審査者がログインするため)
   - 連絡先情報
4. **「審査に提出」** をクリック

### 審査で問われやすいポイント

| チェック項目 | 対応状況 |
|-------------|---------|
| プライバシーポリシー URL | ステップ 1 で設定 |
| アカウント削除機能 | ✅ 設定画面に実装済み |
| カメラ/写真のパーミッション説明 | ✅ app.json の infoPlist に記載済み |
| 13歳未満の対応 | ✅ プライバシーポリシーに記載 |
| ログイン手段 | メール認証で対応済み |

---

## ステップ 8: 審査後

- **承認**: App Store に公開される
- **リジェクト**: 理由を確認し、修正して再提出

### よくあるリジェクト理由と対策

| 理由 | 対策 |
|------|------|
| スクリーンショットが不適切 | 実機の画面を正確にキャプチャ |
| メタデータが不足 | 説明文・カテゴリを正確に記入 |
| デモアカウントが無効 | 審査用の有効なアカウントを用意 |
| クラッシュ・バグ | 十分なテストを実施 |
| プライバシーポリシー URL が無効 | URL がアクセス可能か確認 |

---

## コマンド一覧 (クイックリファレンス)

```bash
# EAS ログイン
npx eas-cli login

# iOS 本番ビルド
npx eas-cli build --platform ios --profile production

# ビルド状況確認
npx eas-cli build:list

# App Store へ提出
npx eas-cli submit --platform ios --profile production

# プレビュービルド (内部テスト用)
npx eas-cli build --platform ios --profile preview
```

---

## チェックリスト

- [ ] プライバシーポリシーを Web 上に公開
- [ ] `eas.json` に Apple ID / Team ID を記入
- [ ] App Store Connect でアプリを作成
- [ ] `eas.json` に ASC App ID を記入
- [ ] スクリーンショットを準備 (6.7インチ必須)
- [ ] App Store 掲載情報を入力 (説明文、キーワード等)
- [ ] `npx eas-cli build --platform ios --profile production` を実行
- [ ] `npx eas-cli submit --platform ios --profile production` を実行
- [ ] 審査用デモアカウントを用意
- [ ] 審査に提出
