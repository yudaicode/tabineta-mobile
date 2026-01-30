import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useProfile, useUpdateProfile, useDeleteAccount } from '@/hooks/useProfile';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { data: profile, isLoading } = useProfile(user?.id || '');
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const { pickImage, uploading } = useImagePicker();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const url = await pickImage();
    if (url) {
      setAvatarUrl(url);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'ログインが必要です',
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        data: {
          username,
          full_name: fullName,
          bio,
          website,
          avatar_url: avatarUrl,
        },
      });

      router.back();
    } catch (error: any) {
      // エラーはフック内で表示される
      console.error('Profile update error:', error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウントを削除',
      'アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。本当に削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            // 二重確認
            Alert.alert(
              '最終確認',
              'もう一度確認します。本当にアカウントを削除しますか？',
              [
                {
                  text: 'キャンセル',
                  style: 'cancel',
                },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (user?.id) {
                        await deleteAccount.mutateAsync(user.id);
                        await signOut();
                        router.replace('/(auth)/sign-in');
                      }
                    } catch (error: any) {
                      // エラーはフック内で表示される
                      console.error('Account deletion error:', error);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.neutral[400]} />
        <Text style={styles.errorText}>ログインが必要です</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>プロフィール編集</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* アバター画像 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploading}
            activeOpacity={0.7}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.text.inverse} />
              </View>
            )}
            <View style={styles.avatarEditButton}>
              <Ionicons name="camera" size={IconSizes.sm} color={Colors.text.inverse} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploading ? 'アップロード中...' : 'タップして画像を変更'}
          </Text>
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          <Text variant="labelLarge" style={styles.label}>
            ユーザー名
          </Text>
          <TextInput
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            placeholder="例: tabineta_traveler"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="none"
          />

          <Text variant="labelLarge" style={styles.label}>
            表示名
          </Text>
          <TextInput
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            placeholder="例: 旅ネタ 太郎"
            style={styles.input}
            returnKeyType="done"
          />

          <Text variant="labelLarge" style={styles.label}>
            自己紹介
          </Text>
          <TextInput
            mode="outlined"
            value={bio}
            onChangeText={setBio}
            placeholder="旅行が好きで、国内外を旅しています..."
            multiline
            numberOfLines={4}
            style={styles.input}
            returnKeyType="done"
          />

          <Text variant="labelLarge" style={styles.label}>
            ウェブサイト
          </Text>
          <TextInput
            mode="outlined"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://example.com"
            style={styles.input}
            returnKeyType="done"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* 危険ゾーン */}
        <View style={styles.dangerZone}>
          <View style={styles.dangerZoneHeader}>
            <Ionicons name="warning" size={IconSizes.sm} color={Colors.error[600]} />
            <Text style={styles.dangerZoneTitle}>危険な操作</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleteAccount.isPending}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={IconSizes.sm} color={Colors.error[600]} />
            <Text style={styles.deleteButtonText}>
              {deleteAccount.isPending ? 'アカウントを削除しています...' : 'アカウントを削除'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dangerZoneWarning}>
            アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.footerButton}
        >
          キャンセル
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={updateProfile.isPending}
          disabled={updateProfile.isPending}
          style={styles.footerButton}
        >
          保存
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: Spacing['3xl'],
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    borderWidth: 4,
    borderColor: Colors.background.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.background.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background.primary,
    ...Shadows.md,
  },
  avatarHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  form: {
    padding: Spacing.xl,
  },
  label: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.background.primary,
  },
  dangerZone: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing['4xl'],
    padding: Spacing.xl,
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dangerZoneTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error[700],
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.error[500],
    marginBottom: Spacing.md,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error[600],
  },
  dangerZoneWarning: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[700],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadows.sm,
  },
  footerButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
  },
});
