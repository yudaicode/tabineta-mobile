# プッシュ通知のセットアップ

このアプリでプッシュ通知を有効にするには、`expo-notifications`パッケージをインストールする必要があります。

## インストール手順

### 1. パッケージのインストール

```bash
npm install expo-notifications
```

または

```bash
npx expo install expo-notifications
```

### 2. app.jsonの設定

`app.json`に以下の設定を追加してください：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4F46E5",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#4F46E5",
      "androidMode": "default",
      "androidCollapsedTitle": "新しい通知があります"
    }
  }
}
```

### 3. Androidの追加設定（必要に応じて）

`app.json`のAndroidセクションに以下を追加：

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    }
  }
}
```

### 4. iOSの追加設定（必要に応じて）

`app.json`のiOSセクションに以下を追加：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

## 使用方法

### プッシュ通知の有効化

アプリ内の設定画面から「プッシュ通知」のスイッチをONにすると、以下の処理が自動的に実行されます：

1. 通知の許可をリクエスト
2. プッシュトークンを取得
3. トークンをAsyncStorageに保存

### サーバーへのトークン送信（TODO）

現在、プッシュトークンは取得されますが、サーバーには送信されていません。
`utils/notifications.ts`の`enablePushNotifications`関数内で、以下のようにサーバーにトークンを送信する処理を追加してください：

```typescript
// TODO: トークンをサーバーに送信してユーザーと紐付ける
await supabase
  .from('user_push_tokens')
  .upsert({
    user_id: userId,
    push_token: token,
    platform: Platform.OS,
  });
```

## テスト

### 1. 開発環境でのテスト

Expo Goアプリを使用している場合、プッシュ通知は制限があります。
実際のテストには、開発ビルド（`expo run:android`または`expo run:ios`）を使用してください。

### 2. プッシュ通知の送信テスト

Expo Push Notification Toolを使用してテスト通知を送信できます：
https://expo.dev/notifications

取得したプッシュトークンを入力して、テスト通知を送信してください。

## トラブルシューティング

### プッシュ通知が届かない場合

1. **許可が正しく与えられているか確認**
   - デバイスの設定 → アプリ → 通知 で許可されているか確認

2. **プッシュトークンが取得できているか確認**
   - コンソールログに`Push token:`が出力されているか確認

3. **開発ビルドを使用しているか確認**
   - Expo Goではプッシュ通知に制限があります

4. **Androidの場合、Google Services JSONファイルが正しく設定されているか確認**

## 参考資料

- [Expo Notifications公式ドキュメント](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
