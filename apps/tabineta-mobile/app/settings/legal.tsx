import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, IconSizes } from '@/constants/theme';

const PRIVACY_POLICY = `# プライバシーポリシー

最終更新日: 2025年1月1日

Tabineta（以下「本アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。

## 1. 収集する情報

### 1.1 ユーザーが提供する情報
- アカウント情報: メールアドレス、ユーザー名、プロフィール画像
- 認証情報: Google認証を通じて取得する基本プロフィール情報
- コンテンツ: 旅行記、写真、コメント、いいね、ブックマーク
- プロフィール情報: 自己紹介文、表示名

### 1.2 自動的に収集される情報
- デバイス情報: デバイスの種類、OS バージョン
- 利用状況: アプリの利用頻度、機能の使用状況
- エラーログ: アプリのクラッシュ情報（個人を特定しない形式）

## 2. 情報の利用目的

収集した情報は、以下の目的で使用します：

- アカウントの作成・管理
- 旅行記の投稿・共有機能の提供
- ユーザー間のソーシャル機能の提供
- アプリの改善・新機能の開発
- ユーザーサポートの提供
- 不正利用の防止

## 3. 情報の共有

ユーザーの個人情報を、以下の場合を除き第三者に提供することはありません：

- ユーザーの同意がある場合
- 法令に基づく開示請求があった場合
- サービス提供に必要な業務委託先

### 3.1 公開される情報
本アプリはソーシャル機能を持つため、以下の情報は他のユーザーに公開されます：
- ユーザー名、プロフィール画像
- 公開設定された旅行記
- いいね、コメント、フォロー情報

## 4. データの保管

- ユーザーデータは、セキュリティ対策が施されたクラウドサーバーに保管されます
- 通信は SSL/TLS により暗号化されています
- アカウント削除時には、関連するデータを削除します

## 5. ユーザーの権利

ユーザーは以下の権利を有します：

- アクセス権: 自身の個人情報へのアクセス
- 訂正権: 個人情報の訂正・更新
- 削除権: アカウントおよび関連データの削除

## 6. 子どものプライバシー

本アプリは13歳未満のお子様を対象としていません。

## 7. プライバシーポリシーの変更

本ポリシーは、法令の変更やサービス内容の変更に伴い更新される場合があります。

## 8. お問い合わせ

本ポリシーに関するご質問は、アプリ内のお問い合わせフォームよりご連絡ください。

## 9. 準拠法

本ポリシーは、日本法に準拠して解釈されます。`;

const TERMS_OF_SERVICE = `# 利用規約

最終更新日: 2025年1月1日

本利用規約（以下「本規約」）は、Tabineta（以下「本アプリ」）の利用条件を定めるものです。

## 1. サービスの概要

本アプリは、旅行記の作成・共有を目的としたソーシャルプラットフォームです。

## 2. アカウント

### 2.1 アカウント登録
- 本アプリの利用には、アカウント登録が必要です
- 登録時には正確な情報を提供してください
- 1人につき1つのアカウントのみ登録できます

### 2.2 アカウント管理
- アカウント情報の管理はユーザーの責任です
- 不正アクセスを発見した場合は、直ちにご連絡ください

## 3. 禁止事項

ユーザーは、以下の行為を行ってはなりません：

### 3.1 コンテンツに関する禁止事項
- 虚偽または誤解を招く情報の投稿
- 他者の著作権、肖像権、プライバシーを侵害するコンテンツ
- わいせつ、暴力的、差別的なコンテンツ
- 広告、スパム、営利目的のコンテンツ（許可なく）
- 違法行為を助長するコンテンツ

### 3.2 行為に関する禁止事項
- 他のユーザーへの嫌がらせ、脅迫、誹謗中傷
- なりすまし行為
- 不正アクセス、システムへの攻撃

## 4. コンテンツの権利

### 4.1 ユーザーのコンテンツ
- ユーザーが投稿したコンテンツの著作権は、ユーザーに帰属します
- 投稿により、本アプリにコンテンツの表示・配信に必要なライセンスを付与します

### 4.2 本アプリのコンテンツ
- 本アプリのデザイン、ロゴ、機能は運営者に帰属します

## 5. サービスの変更・停止

- 本アプリは、事前の通知なくサービス内容を変更する場合があります
- メンテナンスや不可抗力により、サービスを一時停止する場合があります

## 6. 免責事項

- 本アプリは「現状有姿」で提供されます
- ユーザー間のトラブルは、当事者間で解決してください

## 7. アカウントの停止・削除

以下の場合、アカウントを停止または削除することがあります：

- 本規約に違反した場合
- 長期間利用がない場合（1年以上）
- 不正利用が疑われる場合

## 8. 規約の変更

本規約は、法令の変更やサービス内容の変更に伴い更新される場合があります。

## 9. 準拠法・裁判管轄

- 本規約は、日本法に準拠して解釈されます
- 本アプリに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします

## 10. お問い合わせ

本規約に関するご質問は、アプリ内のお問い合わせフォームよりご連絡ください。`;

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: 'privacy' | 'terms' }>();

  const title = type === 'privacy' ? 'プライバシーポリシー' : '利用規約';
  const content = type === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE;

  // Simple markdown to text rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.h1}>
            {line.replace('# ', '')}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.h2}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={styles.h3}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{line.replace('- ', '')}</Text>
          </View>
        );
      }
      if (line.trim() === '') {
        return <View key={index} style={styles.spacer} />;
      }
      return (
        <Text key={index} style={styles.paragraph}>
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={IconSizes.md} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderContent(content)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  h1: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  h2: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  h3: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  listItem: {
    flexDirection: 'row',
    paddingLeft: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  spacer: {
    height: Spacing.sm,
  },
});
