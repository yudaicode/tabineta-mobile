# Android キーストア情報

生成日: 2025年10月22日

## デバッグキーストア

### 基本情報
- **場所:** `%USERPROFILE%\.android\debug.keystore`
- **エイリアス:** androiddebugkey
- **ストアパスワード:** android
- **キーパスワード:** android
- **有効期限:** 2053年3月9日

### フィンガープリント

#### SHA-1
```
FA:B7:73:74:7B:FD:DE:C5:2D:16:78:E7:06:CA:FF:A5:D1:A5:5E:A1
```

#### SHA-256
```
C8:0F:A8:7E:8D:2E:B7:D2:BE:F6:02:C9:69:37:26:59:97:A4:D8:A1:C7:AF:0F:F3:8B:9C:A1:8C:69:51:BB:BC
```

### 証明書詳細
- **所有者:** CN=Android Debug, O=Android, C=US
- **発行者:** CN=Android Debug, O=Android, C=US
- **シリアル番号:** a85f585a7b8ca66a
- **署名アルゴリズム:** SHA384withRSA
- **鍵のアルゴリズム:** 2048-bit RSA

## 使用方法

### キーストア情報を確認するコマンド
```powershell
"C:\Program Files\Java\jdk-25\bin\keytool.exe" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### Google Cloud Console での使用
Google OAuth設定時に、SHA-1フィンガープリントを使用します：
1. Google Cloud Console → 認証情報
2. OAuth クライアント ID を作成（Android）
3. パッケージ名: `com.tabineta.mobile`
4. SHA-1証明書フィンガープリント: 上記のSHA-1を入力

## 注意事項

- このキーストアは**開発用のみ**です
- 本番リリース用には別途リリースキーストアを作成する必要があります
- SHA-1/SHA-256フィンガープリントは、Firebase、Google Sign-In、Facebook SDKなどの設定で必要です
- キーストアファイルとパスワードは厳重に管理してください

## 次のステップ

✅ ステップ4完了: SHA-1フィンガープリント取得
→ **ステップ5へ**: Google Cloud Console で Android クライアント ID を作成
