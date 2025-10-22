# Android 完全セットアップガイド（Windows）

完全セットアップを選択されたので、Android Studio のインストールから SHA-1 取得、Google OAuth 設定まで順番にガイドします。

---

## 📋 全体の流れ

1. **JDK の確認**（5分）
2. **Android Studio のインストール**（30-40分）
3. **環境変数の設定**（5分）
4. **SHA-1 フィンガープリントの取得**（2分）
5. **Google Cloud Console で Android クライアント ID 作成**（5分）
6. **動作確認**（5-10分）

**合計: 約 60分**

---

## ステップ 1: JDK の確認と準備

### 1.1 JDK がインストールされているか確認

PowerShell またはコマンドプロンプトを開いて実行：

```powershell
keytool -version
```

**結果の判定:**

✅ **バージョン情報が表示される場合:**
```
keytool 17.0.1 (Java(TM) SE Runtime Environment ...)
```
→ JDK インストール済み。**ステップ 2 へ進んでください**

❌ **エラーが表示される場合:**
```
'keytool' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```
→ JDK 未インストール。**ステップ 1.2 へ**

### 1.2 JDK のインストール（必要な場合のみ）

#### Option A: Android Studio と一緒にインストール（推奨）

Android Studio をインストールすると JDK も自動的にインストールされます。
→ **このステップをスキップして、ステップ 2 へ進んでください**

#### Option B: JDK を単独でインストール

1. [Oracle JDK ダウンロード](https://www.oracle.com/java/technologies/downloads/) にアクセス
2. 「Windows」タブから **x64 Installer** をダウンロード
3. インストーラーを実行（デフォルト設定でOK）
4. PowerShell を**再起動**
5. `keytool -version` で確認

---

## ステップ 2: Android Studio のインストール

### 2.1 ダウンロード

1. [Android Studio 公式サイト](https://developer.android.com/studio) にアクセス
2. 「Download Android Studio」ボタンをクリック
3. 利用規約に同意してダウンロード開始（約 1 GB）

**💡 ダウンロード中に...**
- コーヒーでも飲んで休憩しましょう ☕
- ダウンロード時間: 回線速度によって 5-15分

### 2.2 インストール

1. ダウンロードした `.exe` ファイルを実行
2. セットアップウィザードが起動します

#### インストール設定

**すべてデフォルトのままで OK です:**

- **Welcome 画面**: 「Next」をクリック
- **Choose Components**: すべてにチェック（デフォルト）
  ```
  ✓ Android Studio
  ✓ Android Virtual Device
  ```
  → 「Next」

- **Configuration Settings**: デフォルトのまま
  → 「Next」

- **Choose Start Menu Folder**: デフォルトのまま
  → 「Install」

**インストール開始！**
- 時間: 約 10-15分
- インストール先: `C:\Program Files\Android\Android Studio`

### 2.3 初回セットアップ

インストール完了後、Android Studio が起動します。

#### セットアップウィザード

1. **Welcome 画面**
   - 「Next」をクリック

2. **Install Type**
   - 「Standard」を選択（推奨）
   - 「Next」

3. **Select UI Theme**
   - お好みのテーマを選択（Darcula または Light）
   - 「Next」

4. **Verify Settings**
   - 以下がインストールされることを確認:
     ```
     ✓ Android SDK
     ✓ Android SDK Platform
     ✓ Android Virtual Device
     ✓ Performance (Intel® HAXM) ※Intel CPU の場合
     ```
   - **SDK の場所を確認してメモ:**
     ```
     Android SDK Location: C:\Users\[ユーザー名]\AppData\Local\Android\Sdk
     ```
   - 「Next」

5. **License Agreement**
   - すべてのライセンスに同意
   - 「Finish」をクリック

**コンポーネントのダウンロード開始！**
- 時間: 約 15-20分（回線速度による）
- サイズ: 約 3-4 GB

**💡 ダウンロード中に...**
- YouTube でも見ながら待ちましょう 📺
- このドキュメントの次のステップを読んでおきましょう

### 2.4 完了確認

セットアップ完了後、Android Studio のメイン画面が表示されます。

**確認:**
- 「Welcome to Android Studio」画面が表示される
- エラーがない

→ **成功！ステップ 3 へ**

---

## ステップ 3: 環境変数の設定

Android SDK のパスを環境変数に設定します。

### 3.1 Android SDK の場所を確認

Android Studio を開いて:

1. 右上の歯車アイコン ⚙️ → 「Settings」
2. 「Appearance & Behavior」→「System Settings」→「Android SDK」
3. 「Android SDK Location」に表示されているパスをコピー

**通常は:**
```
C:\Users\[ユーザー名]\AppData\Local\Android\Sdk
```

### 3.2 環境変数を設定

#### 方法 A: GUI から設定（初心者向け）

1. **スタートメニュー**を右クリック → 「システム」
2. 「詳細情報」→「システムの詳細設定」
3. 「環境変数」ボタンをクリック

**ANDROID_HOME を追加:**

4. 「システム環境変数」セクションで「新規」をクリック
5. 以下を入力:
   ```
   変数名: ANDROID_HOME
   変数値: C:\Users\[ユーザー名]\AppData\Local\Android\Sdk
   ```
   ※ `[ユーザー名]` は自分のユーザー名に置き換え
6. 「OK」をクリック

**Path に追加:**

7. 「システム環境変数」で「Path」を選択 → 「編集」
8. 「新規」をクリックして以下を追加:
   ```
   %ANDROID_HOME%\platform-tools
   ```
9. もう一度「新規」をクリックして追加:
   ```
   %ANDROID_HOME%\tools
   ```
10. 「OK」を3回クリックしてすべて閉じる

#### 方法 B: PowerShell から設定（上級者向け）

PowerShell を**管理者として実行**して以下を実行:

```powershell
# ANDROID_HOME を設定（[ユーザー名] を実際のユーザー名に置き換え）
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\ydkit\AppData\Local\Android\Sdk", "User")

# Path に追加
$androidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;$androidHome\platform-tools;$androidHome\tools"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

### 3.3 確認

**すべてのターミナル/PowerShell を閉じて、新しく開いてから:**

```powershell
# ANDROID_HOME が設定されているか確認
echo $env:ANDROID_HOME

# adb が使えるか確認
adb --version
```

**期待する出力:**
```
C:\Users\[ユーザー名]\AppData\Local\Android\Sdk
Android Debug Bridge version 1.0.41
...
```

✅ **成功！ステップ 4 へ**

❌ **エラーの場合:**
- PowerShell を完全に閉じて再度開く
- PC を再起動してみる

---

## ステップ 4: SHA-1 フィンガープリントの取得

### 4.1 デバッグキーストアから取得

PowerShell またはコマンドプロンプトで以下を実行:

```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### 4.2 結果を確認

**成功した場合:**

出力から `SHA1:` で始まる行を探します:

```
Certificate fingerprints:
         SHA1: 8A:F4:32:E1:8C:A4:0C:39:7D:B2:1E:07:F1:3A:8B:6C:8A:D0:3E:9F
         SHA256: 2A:B8:...
         Signature algorithm name: SHA256withRSA
         ...
```

**SHA-1 の値をコピー:**
```
8A:F4:32:E1:8C:A4:0C:39:7D:B2:1E:07:F1:3A:8B:6C:8A:D0:3E:9F
```

→ ✅ **成功！この値を次のステップで使います**

**エラーが出た場合（キーストアが存在しない）:**

```
keytool error: java.io.FileNotFoundException: C:\Users\...\debug.keystore
```

**解決方法: キーストアを生成**

```powershell
# .android ディレクトリを作成
mkdir "$env:USERPROFILE\.android" -ErrorAction SilentlyContinue

# デバッグキーストアを生成
keytool -genkey -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
```

その後、もう一度 SHA-1 取得コマンドを実行してください。

---

## ステップ 5: Google Cloud Console で Android クライアント ID を作成

### 5.1 Google Cloud Console にアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 既存のプロジェクトを選択（Web 版で使用しているもの）

### 5.2 Android クライアント ID を作成

1. 左側のメニュー → 「API とサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」をクリック
3. 以下の情報を入力:

```
アプリケーションの種類: Android

名前: Tabineta Mobile (Android)

パッケージ名: com.tabineta.mobile

SHA-1 証明書フィンガープリント:
[ステップ 4.2 でコピーした SHA-1 を貼り付け]
例: 8A:F4:32:E1:8C:A4:0C:39:7D:B2:1E:07:F1:3A:8B:6C:8A:D0:3E:9F
```

4. 「作成」をクリック

✅ **Android クライアント ID が作成されました！**

---

## ステップ 6: Web クライアント ID の更新

Android でも OAuth を動作させるため、Web クライアント ID にリダイレクト URI を追加します。

### 6.1 Web クライアント ID を編集

1. 「認証情報」ページで、既存の **Web クライアント ID** を選択
2. 「承認済みのリダイレクト URI」セクションまでスクロール

### 6.2 リダイレクト URI を追加

既存の URI に加えて、以下を追加:

```
tabinetamobile://auth/callback
```

**注意:** Supabase のリダイレクト URI も必要です:
```
https://your-project.supabase.co/auth/v1/callback
```

（`your-project` は実際の Supabase プロジェクト ID に置き換え）

3. 「保存」をクリック

---

## ステップ 7: Supabase の確認

### 7.1 Google Provider の確認

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択
3. 「Authentication」→「Providers」→「Google」

### 7.2 設定の確認

以下が設定されているか確認:

- ✅ 「Enable Sign in with Google」がオン
- ✅ Client ID が設定されている（Web クライアントのもの）
- ✅ Client Secret が設定されている

---

## ステップ 8: モバイルアプリの設定

### 8.1 環境変数を設定

プロジェクトディレクトリ:
```powershell
cd C:\Users\ydkit\Documents\tabineta\apps\tabineta-mobile
```

`.env` ファイルを作成:
```powershell
copy .env.example .env
```

`.env` ファイルを編集して以下を設定:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_WEB_API_URL=https://your-domain.com/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## ステップ 9: 動作確認

### 9.1 依存関係のインストール

```powershell
npm install
```

### 9.2 開発サーバーの起動

```powershell
npm start
```

### 9.3 Android で実行

**Option A: Android エミュレータを使用**

Android Studio で AVD (Android Virtual Device) を作成してから:

```powershell
npm run android
```

**Option B: 実機で実行**

1. Android スマートフォンの「開発者向けオプション」を有効化
2. USB デバッグを有効化
3. PC に USB 接続
4. `npm run android` を実行

### 9.4 Google OAuth のテスト

1. アプリが起動したら、サインイン画面を開く
2. 「Google でログイン」ボタンをタップ
3. ブラウザが開き、Google ログイン画面が表示される
4. Google アカウントでログイン
5. アプリに自動的に戻り、ホーム画面が表示される

✅ **成功！完全セットアップ完了です！** 🎉

---

## 🎉 完了！

おめでとうございます！Android の完全セットアップが完了しました。

**セットアップした内容:**
- ✅ Android Studio インストール
- ✅ Android SDK 設定
- ✅ 環境変数設定
- ✅ SHA-1 フィンガープリント取得
- ✅ Android OAuth クライアント ID 作成
- ✅ リダイレクト URI 設定
- ✅ モバイルアプリ設定

**次にできること:**
- Android エミュレータでアプリを開発
- ネイティブモジュールを追加
- パフォーマンスのデバッグ
- Google OAuth を使った認証実装

---

## ❌ トラブルシューティング

### 問題 1: `adb` コマンドが見つからない

**解決方法:**
1. 環境変数が正しく設定されているか確認
2. PowerShell を完全に閉じて再度開く
3. PC を再起動

### 問題 2: Android Studio のインストールが失敗する

**解決方法:**
1. 管理者権限でインストーラーを実行
2. ウイルス対策ソフトを一時的に無効化
3. インストール先を変更（`C:\Android` など）

### 問題 3: エミュレータが起動しない

**解決方法:**
1. BIOS で仮想化（VT-x/AMD-V）を有効化
2. Hyper-V を有効化（Windows の機能）
3. AVD を再作成

### 問題 4: 「10: Developer Error」が表示される

**原因:** SHA-1 が間違っている

**解決方法:**
1. SHA-1 を再度取得して確認
2. Google Cloud Console で SHA-1 を修正
3. 数分待ってから再試行

---

## 📞 サポート

問題が解決しない場合は、以下の情報を含めて issue を作成してください:

1. Windows のバージョン
2. Android Studio のバージョン
3. エラーメッセージの全文
4. 実行したコマンド
5. スクリーンショット

---

## 🎓 次のステップ

完全セットアップが完了したので:

1. **[QUICK_START.md](./QUICK_START.md)** に戻って残りのステップを完了
2. Google OAuth の実装を始める
3. アプリの機能開発に進む

頑張ってください！ 🚀
