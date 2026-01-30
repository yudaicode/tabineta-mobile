import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle } from '@/lib/auth';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

export default function SignInScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        // キャンセルの場合は何もしない
        if (error.message === 'ログインがキャンセルされました') {
          return;
        }
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'ログイン成功',
      });

      // マイページに遷移
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google ログインエラー',
        text2: error.message || '認証に失敗しました',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      // TODO: Apple Sign-In を実装
      Toast.show({
        type: 'info',
        text1: '準備中',
        text2: 'Apple Sign-In は現在準備中です',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Apple ログインエラー',
        text2: error.message || '認証に失敗しました',
      });
    } finally {
      setAppleLoading(false);
    }
  };

  const handleLineSignIn = async () => {
    setLineLoading(true);
    try {
      // TODO: LINE Login を実装
      Toast.show({
        type: 'info',
        text1: '準備中',
        text2: 'LINE Login は現在準備中です',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'LINE ログインエラー',
        text2: error.message || '認証に失敗しました',
      });
    } finally {
      setLineLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="airplane" size={48} color={Colors.primary[500]} />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Tabineta
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            旅の思い出をシェアしよう
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.welcomeText}>
            ログインして始めよう
          </Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.7}
          >
            {googleLoading ? (
              <Text style={styles.googleButtonText}>認証中...</Text>
            ) : (
              <>
                <Ionicons name="logo-google" size={IconSizes.md} color={Colors.text.primary} />
                <Text style={styles.googleButtonText}>Google でログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleSignIn}
            disabled={appleLoading}
            activeOpacity={0.7}
          >
            {appleLoading ? (
              <Text style={styles.appleButtonText}>認証中...</Text>
            ) : (
              <>
                <Ionicons name="logo-apple" size={IconSizes.md} color={Colors.text.inverse} />
                <Text style={styles.appleButtonText}>Apple でログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lineButton}
            onPress={handleLineSignIn}
            disabled={lineLoading}
            activeOpacity={0.7}
          >
            {lineLoading ? (
              <Text style={styles.lineButtonText}>認証中...</Text>
            ) : (
              <>
                <Ionicons name="chatbubble" size={IconSizes.md} color={Colors.text.inverse} />
                <Text style={styles.lineButtonText}>LINE でログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <Text variant="bodySmall" style={styles.privacyText}>
              ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  title: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.lg,
  },
  welcomeText: {
    textAlign: 'center',
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border.dark,
    ...Shadows.sm,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: '#000000',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  appleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  lineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: '#00B900',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  lineButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  privacyNote: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  privacyText: {
    textAlign: 'center',
    color: Colors.text.tertiary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
});
