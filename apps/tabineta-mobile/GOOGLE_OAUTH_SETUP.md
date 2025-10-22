# Google OAuth セットアップガイド

このガイドでは、Tabineta モバイルアプリに Google OAuth 認証を設定する手順を説明します。

**重要**: すでに Web 版で Supabase プロジェクトと Google Console プロジェクトを作成している場合、新しく作り直す必要はありません。既存のプロジェクトにモバイルアプリの設定を追加するだけです。

---

## 前提条件

- Supabase プロジェクトが作成済み
- Google Cloud Platform アカウントがある
- Expo CLI がインストールされている

---

## セットアップ手順

### ステップ 1: Google Cloud Console でモバイルアプリ用の OAuth クライアント ID を追加

既存の Google Cloud プロジェクトを使用します。

#### 1.1 Google Cloud Console にアクセス

[Google Cloud Console](https://console.cloud.google.com/) にアクセスし、既存のプロジェクトを選択します。

#### 1.2 OAuth 同意画面の確認

1. 左側のメニューから「API とサービス」→「OAuth 同意画面」を選択
2. すでに Web 版で設定済みの場合、そのまま使用できます
3. 未設定の場合：
   - ユーザータイプ: **外部** を選択（テスト中は外部でOK）
   - アプリ名: `Tabineta`
   - サポートメール: あなたのメールアドレス
   - 承認済みドメイン: （オプション）あなたのドメイン
   - 開発者の連絡先情報: あなたのメールアドレス

#### 1.3 iOS 用 OAuth クライアント ID を作成

1. 「API とサービス」→「認証情報」を選択
2. 「+ 認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類: **iOS** を選択
4. 以下の情報を入力：
   ```
   名前: Tabineta Mobile (iOS)
   バンドル ID: com.tabineta.mobile
   ```
5. 「作成」をクリック

#### 1.4 Android 用 OAuth クライアント ID を作成

1. 再度「+ 認証情報を作成」→「OAuth クライアント ID」をクリック
2. アプリケーションの種類: **Android** を選択
3. 以下の情報を入力：
   ```
   名前: Tabineta Mobile (Android)
   パッケージ名: com.tabineta.mobile
   SHA-1 証明書フィンガープリント: （下記の手順で取得）
   ```
4. 「作成」をクリック

**SHA-1 証明書フィンガープリントの取得方法:**

Google Cloud Console で Android クライアント ID を作成する際、SHA-1 フィンガープリントが必須になります。開発環境では以下の方法で取得できます。

**方法 1: デフォルトの Android デバッグキーストアから取得（推奨）**

```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

出力から `SHA1:` で始まる行をコピーします（例: `AA:BB:CC:DD:...`）。

**方法 2: Expo 開発ビルドから取得**

まず Expo の開発ビルドを実行してプロジェクトを初期化します：

```bash
cd apps/tabineta-mobile
npx expo run:android
```

初回実行時に `android` ディレクトリが生成されます。その後：

```bash
cd android
./gradlew signingReport
```

（Windows の場合: `gradlew.bat signingReport`）

出力から `Variant: debug` セクションの `SHA1:` の値をコピーします。

**方法 3: SHA-1 なしで進める（簡易的な開発用）**

開発段階では、Android クライアント ID を作成せずに Web クライアント ID のみで OAuth を動作させることも可能です。この場合、このステップをスキップしてください。

**注意**: 本番環境にリリースする際は、リリース用キーストアの SHA-1 を追加する必要があります。

#### 1.5 Web 用 OAuth クライアント ID の確認

すでに Web 版で作成している OAuth クライアント ID を確認します：

1. 「認証情報」ページで既存の Web クライアント ID を選択
2. **クライアント ID** と **クライアント シークレット** をメモしておきます
3. これらは次のステップで Supabase に設定します

---

### ステップ 2: Supabase で Google Provider を設定

既存の Supabase プロジェクトを使用します。

#### 2.1 Supabase ダッシュボードにアクセス

[Supabase Dashboard](https://app.supabase.com/) にアクセスし、プロジェクトを選択します。

#### 2.2 Google Provider を有効化

1. 左側のメニューから「Authentication」→「Providers」を選択
2. プロバイダー一覧から「Google」を選択
3. すでに Web 版で設定済みの場合、以下の設定を確認：
   - **Enable Sign in with Google**: オン
   - **Client ID**: Google Cloud Console の Web クライアント ID
   - **Client Secret**: Google Cloud Console の Web クライアントシークレット

4. 未設定の場合、上記の情報を入力して「Save」をクリック

#### 2.3 リダイレクト URI の追加

「Authorized redirect URIs」セクションで、モバイルアプリ用のリダイレクト URI が追加されていることを確認します：

```
tabinetamobile://auth/callback
```

**重要**: Supabase のデフォルトリダイレクト URI も必要です：
```
https://your-project.supabase.co/auth/v1/callback
```

これらの URI を Google Cloud Console の Web クライアント設定にも追加します：

1. Google Cloud Console → 「認証情報」
2. Web クライアント ID を選択
3. 「承認済みのリダイレクト URI」に以下を追加：
   ```
   https://your-project.supabase.co/auth/v1/callback
   tabinetamobile://auth/callback
   ```
4. 「保存」をクリック

---

### ステップ 3: モバイルアプリの環境変数を設定

#### 3.1 .env ファイルの作成

プロジェクトのルートディレクトリ（`apps/tabineta-mobile/`）で：

```bash
cp .env.example .env
```

#### 3.2 環境変数の設定

`.env` ファイルを編集し、以下の値を設定します：

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
EXPO_PUBLIC_WEB_API_URL=https://your-domain.com/api

# OAuth Configuration (現在は使用していませんが、将来的な拡張用)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**取得方法**:

- **SUPABASE_URL** と **SUPABASE_ANON_KEY**:
  - Supabase Dashboard → Settings → API
  - 「Project URL」と「anon public」キーをコピー

---

### ステップ 4: アプリの設定確認

#### 4.1 app.json の確認

`apps/tabineta-mobile/app.json` に以下の設定があることを確認します：

```json
{
  "expo": {
    "scheme": "tabinetamobile",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tabineta.mobile"
    },
    "android": {
      "package": "com.tabineta.mobile",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "tabinetamobile",
              "host": "auth",
              "pathPrefix": "/callback"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

これらの設定はすでに追加されています。

---

### ステップ 5: 動作確認

#### 5.1 開発サーバーの起動

```bash
cd apps/tabineta-mobile
npm start
```

#### 5.2 iOS シミュレータで確認 (macOS のみ)

```bash
npm run ios
```

または、Expo Go アプリで QR コードをスキャン

#### 5.3 Android エミュレータで確認

```bash
npm run android
```

#### 5.4 Google ログインのテスト

1. アプリを起動し、サインイン画面を開く
2. 「Google でログイン」ボタンをタップ
3. ブラウザが開き、Google ログイン画面が表示されることを確認
4. Google アカウントでログイン
5. アプリに自動的に戻り、ホーム画面が表示されることを確認

---

## 動作フロー

Google OAuth の認証フローは以下の通りです：

```
1. ユーザーが「Google でログイン」をタップ
   ↓
2. lib/auth.ts の signInWithGoogle() 関数が実行
   ↓
3. Supabase OAuth URL を生成
   ↓
4. expo-web-browser でブラウザを開く
   ↓
5. Google ログイン画面が表示
   ↓
6. ユーザーが Google アカウントで認証
   ↓
7. Supabase が認証を処理
   ↓
8. tabinetamobile://auth/callback にリダイレクト
   ↓
9. アプリが URL からトークンを抽出
   ↓
10. supabase.auth.setSession() でセッションを設定
    ↓
11. useAuth フックがセッション変更を検知
    ↓
12. 自動的にホーム画面に遷移
```

---

## トラブルシューティング

### 問題 1: 「Redirect URI mismatch」エラー

**原因**: Google Cloud Console のリダイレクト URI が正しく設定されていない

**解決方法**:
1. Google Cloud Console → 認証情報 → Web クライアント ID
2. 「承認済みのリダイレクト URI」に以下を追加：
   ```
   https://your-project.supabase.co/auth/v1/callback
   tabinetamobile://auth/callback
   ```

### 問題 2: 「Invalid client」エラー

**原因**: Supabase の Google Provider 設定が正しくない

**解決方法**:
1. Supabase Dashboard → Authentication → Providers → Google
2. Client ID と Client Secret が Web クライアント ID のものであることを確認
3. iOS や Android のクライアント ID ではなく、**Web** のクライアント ID を使用

### 問題 3: ブラウザが開かない

**原因**: expo-web-browser のインストールが不足している

**解決方法**:
```bash
npm install expo-web-browser expo-auth-session
```

### 問題 4: リダイレクト後にアプリに戻らない

**原因**: ディープリンクの設定が正しくない

**解決方法**:
1. `app.json` の `scheme` が `tabinetamobile` であることを確認
2. Android の場合、`intentFilters` が正しく設定されていることを確認
3. iOS の場合、開発ビルドまたは Expo Go を使用していることを確認

### 問題 5: 「Session not found」エラー

**原因**: トークンの抽出または設定に失敗している

**解決方法**:
1. コンソールログを確認：
   ```typescript
   console.log('Redirect URL:', redirectUrl);
   console.log('Auth URL:', authUrl);
   ```
2. リダイレクト後の URL にトークンが含まれているか確認
3. Supabase の Google Provider が有効になっているか確認

---

## 開発環境での注意事項

### Expo Go での制限

Expo Go アプリを使用する場合、カスタムスキーム（`tabinetamobile://`）が動作しない場合があります。

**推奨**: 開発ビルドを使用してください：

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Web プラットフォームでのテスト

Web ブラウザでテストする場合：

```bash
npm run web
```

Web では通常の OAuth リダイレクトフローが使用されるため、モバイルと若干動作が異なります。

---

## 本番環境へのデプロイ

### Android

1. **SHA-1 フィンガープリントの取得**:
   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Google Cloud Console → Android クライアント ID に SHA-1 を追加

3. リリースビルドを作成：
   ```bash
   eas build --platform android --profile production
   ```

### iOS

1. Apple Developer アカウントで App ID を作成
   - Bundle ID: `com.tabineta.mobile`

2. Associated Domains を有効化（Universal Links 用）

3. リリースビルドを作成：
   ```bash
   eas build --platform ios --profile production
   ```

---

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env` ファイルは `.gitignore` に追加済み
   - 機密情報をコミットしない

2. **Client Secret の保護**
   - Client Secret はサーバーサイドでのみ使用
   - モバイルアプリには含めない

3. **PKCE フローの使用**
   - 本実装では PKCE フローを使用（より安全）
   - `skipBrowserRedirect: false` で標準フローを使用

4. **リダイレクト URI の検証**
   - Google Cloud Console で承認済み URI のみを許可
   - ワイルドカードは使用しない

---

## 参考リンク

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Deep Linking](https://docs.expo.dev/guides/deep-linking/)

---

## サポート

問題が発生した場合は、以下を確認してください：

1. Supabase のログ: Dashboard → Logs
2. Expo のログ: `npm start` のコンソール出力
3. ブラウザの開発者ツール（Web の場合）

それでも解決しない場合は、issue を作成してください。
