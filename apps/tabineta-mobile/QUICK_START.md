# クイックスタートガイド

既存の Supabase と Google Cloud プロジェクトを使って、すぐに Google OAuth を有効にするためのチェックリストです。

## 📋 チェックリスト

> **🎯 初めての方へ（推奨）**: Android の SHA-1 取得には Android Studio のインストールが必要で時間がかかります。
>
> **簡易セットアップ** を選択すると、すぐに開発を始められます：
> - ✅ Android SDK 不要
> - ✅ SHA-1 取得不要
> - ✅ iOS/Android 両方で動作
> - ⏱️ 5分でセットアップ完了
>
> → **ステップ 8-12 をスキップして、ステップ 13 から始めてください**
>
> 詳しくは **[SHA1_GUIDE_WINDOWS.md](./SHA1_GUIDE_WINDOWS.md)** を参照

### ✅ Google Cloud Console での設定

1. [ ] [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. [ ] 既存のプロジェクトを選択（Web版で使用しているもの）
3. [ ] 「API とサービス」→「認証情報」を開く

#### iOS クライアント ID の追加
4. [ ] 「+ 認証情報を作成」→「OAuth クライアント ID」
5. [ ] アプリケーションの種類: **iOS**
6. [ ] バンドル ID: `com.tabineta.mobile`
7. [ ] 「作成」をクリック

#### Android クライアント ID の追加
8. [ ] 再度「+ 認証情報を作成」→「OAuth クライアント ID」
9. [ ] アプリケーションの種類: **Android**
10. [ ] パッケージ名: `com.tabineta.mobile`
11. [ ] SHA-1 証明書フィンガープリント: （下記の手順で取得）
12. [ ] 「作成」をクリック

**SHA-1 フィンガープリントの取得方法:**

> ⚠️ **注意**: SHA-1 を取得するには Android Studio のインストールが必要な場合があります。
>
> **Windows ユーザー**: 詳しい手順は **[SHA1_GUIDE_WINDOWS.md](./SHA1_GUIDE_WINDOWS.md)** を参照してください。

開発環境では、デバッグキーストアから SHA-1 を取得します。

**Option A: デフォルトの Android デバッグキーストアから取得（推奨）**
```bash
# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

出力から `SHA1:` で始まる行をコピーします。

**Option B: Expo 開発ビルドから取得**
```bash
cd apps/tabineta-mobile
npx expo run:android  # Android Studio が必要
cd android
./gradlew signingReport  # Windows: gradlew.bat signingReport
```

出力から `Variant: debug` セクションの `SHA1` をコピーします。

**Option C: SHA-1 なしで進める（簡易セットアップ - 推奨）** 🚀
開発中は Android 用のクライアント ID を作成せず、Web クライアント ID のみで進めることができます。この場合、ステップ 8-12 をスキップしてください。

**メリット:**
- Android SDK のインストール不要
- すぐに開発を開始できる
- iOS/Android 両方で動作

#### Web クライアント ID の更新
13. [ ] 既存の Web クライアント ID を選択
14. [ ] 「承認済みのリダイレクト URI」に以下を追加：
   ```
   https://your-project.supabase.co/auth/v1/callback
   tabinetamobile://auth/callback
   ```
15. [ ] 「保存」をクリック

---

### ✅ Supabase での設定

16. [ ] [Supabase Dashboard](https://app.supabase.com/) にアクセス
17. [ ] 既存のプロジェクトを選択（Web版で使用しているもの）
18. [ ] 「Authentication」→「Providers」→「Google」を開く

#### Google Provider の確認
19. [ ] 「Enable Sign in with Google」がオンになっているか確認
20. [ ] Client ID と Client Secret が設定されているか確認（Web クライアントのもの）

#### リダイレクト URI の確認
21. [ ] 「Authorized redirect URIs」に以下が含まれているか確認：
   ```
   tabinetamobile://auth/callback
   ```

---

### ✅ モバイルアプリの設定

#### 環境変数の設定
22. [ ] `apps/tabineta-mobile/` ディレクトリに移動
23. [ ] `.env.example` をコピーして `.env` を作成
   ```bash
   cp .env.example .env
   ```

24. [ ] `.env` ファイルを編集して以下を設定：
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_WEB_API_URL=https://your-domain.com/api
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

#### 取得方法:
- Supabase Dashboard → Settings → API
- **Project URL** を `EXPO_PUBLIC_SUPABASE_URL` にコピー
- **anon public** キーを `EXPO_PUBLIC_SUPABASE_ANON_KEY` にコピー

---

### ✅ 動作確認

#### 依存関係のインストール
25. [ ] ターミナルで以下を実行：
   ```bash
   cd apps/tabineta-mobile
   npm install
   ```

#### 開発サーバーの起動
26. [ ] 以下のコマンドで開発サーバーを起動：
   ```bash
   npm start
   ```

#### iOS での確認（macOS のみ）
27. [ ] 別のターミナルで以下を実行：
   ```bash
   npm run ios
   ```
   または Expo Go アプリで QR コードをスキャン

#### Android での確認
28. [ ] 別のターミナルで以下を実行：
   ```bash
   npm run android
   ```
   または Expo Go アプリで QR コードをスキャン

#### Google ログインのテスト
29. [ ] アプリを起動し、サインイン画面を開く
30. [ ] 「Google でログイン」ボタンをタップ
31. [ ] ブラウザが開き、Google ログイン画面が表示される
32. [ ] Google アカウントでログイン
33. [ ] アプリに自動的に戻り、ホーム画面が表示される

---

## 🎉 完了！

すべてのステップが完了すれば、Google OAuth が正常に動作します。

---

## ❌ トラブルシューティング

### 問題が発生した場合

#### 1. "Redirect URI mismatch" エラー
- Google Cloud Console の Web クライアント ID に `tabinetamobile://auth/callback` が追加されているか確認
- Supabase の URL も正しく設定されているか確認

#### 2. "Invalid client" エラー
- Supabase の Google Provider に設定されているのが **Web** クライアント ID であることを確認
- iOS や Android のクライアント ID ではなく、Web のものを使用

#### 3. ブラウザが開かない
- 以下のパッケージがインストールされているか確認：
  ```bash
  npm install expo-web-browser expo-auth-session
  ```

#### 4. リダイレクト後にアプリに戻らない
- `app.json` の `scheme` が `tabinetamobile` であることを確認
- Expo Go ではなく、開発ビルドを使用してみる：
  ```bash
  npx expo run:ios  # または npx expo run:android
  ```

#### 5. Android で「10: Developer Error」が表示される
- SHA-1 フィンガープリントが正しく設定されているか確認
- Google Cloud Console で Android クライアント ID の SHA-1 が開発環境のものと一致するか確認
- または、Android クライアント ID を削除して Web クライアント ID のみで試す

#### 6. 詳細なエラーログを確認
- ターミナルのログを確認
- Supabase Dashboard → Logs でエラーを確認
- Google Cloud Console → ログエクスプローラー でエラーを確認

---

## 📚 詳細なドキュメント

さらに詳しい情報が必要な場合は、以下のドキュメントを参照してください：

- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**: 完全なセットアップガイド
- **[README.md](./README.md)**: プロジェクト全体の概要

---

## 🔑 重要なポイント

### 既存のプロジェクトを使う場合
✅ **新しく作り直す必要はありません**
- 同じ Supabase プロジェクトを Web とモバイルで共有できます
- Google Cloud プロジェクトも同じものを使用します
- モバイルアプリ用の OAuth クライアント ID（iOS/Android）を追加するだけです

### Web クライアント ID を使用
✅ **Supabase の設定には Web クライアント ID を使用**
- iOS や Android のクライアント ID ではありません
- Web クライアント ID の Client Secret を Supabase に設定します
- これにより、すべてのプラットフォーム（Web/iOS/Android）で同じ認証フローが使えます

### PKCE フロー
✅ **本実装は PKCE フロー（より安全）を使用**
- クライアントシークレットをモバイルアプリに埋め込む必要がありません
- Supabase が自動的にセキュアな認証フローを処理します

---

## 📞 サポート

問題が解決しない場合は、以下の情報を含めて issue を作成してください：

1. 実行したステップ
2. エラーメッセージ（スクリーンショット）
3. 使用しているプラットフォーム（iOS/Android/Web）
4. Expo のバージョン（`npx expo --version`）
5. Node.js のバージョン（`node --version`）
