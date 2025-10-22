# Windows で SHA-1 フィンガープリントを取得する方法

Android の OAuth クライアント ID を作成する際に必要な SHA-1 フィンガープリントを、Windows で簡単に取得する方法を説明します。

---

## 🚀 最も簡単な方法: デフォルトのデバッグキーストアを使用

Android Studio をインストールしていない場合でも、JDK (Java Development Kit) さえあれば SHA-1 を取得できます。

### ステップ 1: JDK がインストールされているか確認

コマンドプロンプトまたは PowerShell で以下を実行：

```powershell
keytool -version
```

**結果:**
- ✅ バージョン情報が表示される → JDK インストール済み（ステップ 2 へ）
- ❌ 「コマンドが認識されません」エラー → JDK をインストールする必要があります（ステップ 1.1 へ）

### ステップ 1.1: JDK のインストール（必要な場合のみ）

1. [Oracle JDK ダウンロードページ](https://www.oracle.com/java/technologies/downloads/) にアクセス
2. 「Windows」タブから **x64 Installer** をダウンロード
3. インストーラーを実行してデフォルト設定でインストール
4. コマンドプロンプトを**再起動**してから、再度 `keytool -version` で確認

---

### ステップ 2: デバッグキーストアから SHA-1 を取得

#### 方法 A: Android Studio のデバッグキーストアを使用（推奨）

Android Studio をインストール済みの場合、デバッグキーストアが既に存在します：

```powershell
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

#### 方法 B: まだデバッグキーストアが存在しない場合

Android Studio をインストールしていない、またはキーストアが存在しない場合、新しく作成できます：

```powershell
# .android ディレクトリを作成
mkdir "%USERPROFILE%\.android"

# デバッグキーストアを生成
keytool -genkey -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
```

その後、方法 A のコマンドを実行して SHA-1 を取得します。

---

### ステップ 3: SHA-1 を取得

コマンドの出力から、`SHA1:` で始まる行を探します：

```
Certificate fingerprints:
         SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
         SHA256: 1A:2B:3C:...
```

**コロンで区切られた英数字の文字列**（例: `AA:BB:CC:DD:...`）をコピーします。

これを Google Cloud Console の Android クライアント ID の「SHA-1 証明書フィンガープリント」欄に貼り付けます。

---

## ❌ Android SDK がない場合のエラー対処

`npx expo run:android` を実行した際に以下のエラーが出た場合：

```
Failed to resolve the Android SDK path. Default install location not found
```

### 解決策 1: 簡易セットアップを使用（推奨） 🎯

**Android クライアント ID を作成せず、Web クライアント ID のみで OAuth を設定**することができます。

**メリット:**
- ✅ Android SDK のインストール不要
- ✅ SHA-1 の取得不要
- ✅ すぐに開発を開始できる
- ✅ iOS/Android 両方で動作

**手順:**
1. QUICK_START.md のステップ 8-12（Android クライアント ID 作成）をスキップ
2. iOS クライアント ID と Web クライアント ID のみを設定
3. 開発を進める

### 解決策 2: Android Studio をインストール（完全な環境）

Android 開発の完全な環境を構築したい場合：

#### Android Studio のインストール

1. **Android Studio をダウンロード**
   - [Android Studio 公式サイト](https://developer.android.com/studio) にアクセス
   - Windows 用インストーラーをダウンロード（約 1 GB）

2. **インストーラーを実行**
   - デフォルト設定で進める
   - すべてのコンポーネントをインストール（Android SDK、Android Virtual Device など）

3. **初回セットアップ**
   - Android Studio を起動
   - 「Standard」セットアップを選択
   - Android SDK、エミュレータなどが自動インストールされます（時間がかかります）

4. **環境変数の設定**

   **方法 A: GUI から設定**

   1. 「スタートメニュー」→「設定」→「システム」→「詳細情報」→「システムの詳細設定」
   2. 「環境変数」をクリック
   3. 「システム環境変数」セクションで「新規」をクリック
   4. 以下を追加：
      ```
      変数名: ANDROID_HOME
      変数値: C:\Users\[ユーザー名]\AppData\Local\Android\Sdk
      ```
   5. 「Path」変数を編集し、以下を追加：
      ```
      %ANDROID_HOME%\platform-tools
      %ANDROID_HOME%\tools
      ```

   **方法 B: PowerShell から設定（管理者権限）**

   PowerShell を管理者として実行し、以下を実行：

   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

   # Path に追加
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   $newPath = "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\tools"
   [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
   ```

5. **ターミナルを再起動**
   - 環境変数を反映させるため、すべてのターミナルを閉じて再度開く

6. **確認**
   ```powershell
   adb --version
   ```
   バージョン情報が表示されれば成功！

#### Android SDK の場所を確認

Android Studio で確認する方法：
1. Android Studio を開く
2. 右上の歯車アイコン → 「Settings」
3. 「Appearance & Behavior」→「System Settings」→「Android SDK」
4. 「Android SDK Location」に表示されているパスをコピー

通常は以下のいずれか：
- `C:\Users\[ユーザー名]\AppData\Local\Android\Sdk`
- `C:\Android\sdk`

---

## 📝 まとめ: おすすめの進め方

### 初めて React Native/Expo を使う場合

**簡易セットアップ（推奨）:**
- Android クライアント ID をスキップ
- Web クライアント ID のみで進める
- 後で必要になったら Android 環境を整える

### 本格的に Android 開発をする場合

1. Android Studio をインストール
2. 環境変数を設定
3. デバッグキーストアから SHA-1 を取得
4. Android クライアント ID を作成

---

## 🔄 簡易セットアップ vs 完全セットアップ

| 項目 | 簡易セットアップ | 完全セットアップ |
|------|-----------------|-----------------|
| Android SDK | 不要 | 必要 |
| SHA-1 取得 | 不要 | 必要 |
| セットアップ時間 | 5分 | 30-60分 |
| OAuth 動作 | ✅ 動作する | ✅ 動作する |
| 開発ビルド | Expo Go で可 | エミュレータで可 |
| 本番リリース | 後で設定が必要 | すぐに可能 |

---

## 💡 よくある質問

### Q1: 簡易セットアップでも Android で動作しますか？
**A**: はい、動作します。Web クライアント ID を使用して OAuth 認証が行われます。

### Q2: 後から Android クライアント ID を追加できますか？
**A**: はい、いつでも追加できます。Google Cloud Console で Android クライアント ID を作成するだけです。

### Q3: Expo Go アプリで Google OAuth は動作しますか？
**A**: カスタムスキーム（`tabinetamobile://`）が必要なため、Expo Go では制限があります。開発ビルド（`npx expo run:android`）を推奨します。

### Q4: デバッグキーストアと本番キーストアの違いは？
**A**:
- **デバッグキーストア**: 開発環境で使用、自動生成される
- **本番キーストア**: Google Play にリリースする際に使用、手動で作成・管理

開発段階ではデバッグキーストアを使用します。

---

## 📞 サポート

それでも問題が解決しない場合は、以下の情報を含めて issue を作成してください：

1. Windows のバージョン
2. JDK のバージョン（`keytool -version` の出力）
3. Android Studio のインストール状況
4. エラーメッセージの全文
5. 実行したコマンド

---

## 次のステップ

SHA-1 を取得できたら、**[QUICK_START.md](./QUICK_START.md)** に戻ってセットアップを続けてください。
