import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'メールアドレスとパスワードを入力してください',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'ログイン成功',
      });

      // マイページに遷移
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'ログインエラー',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={IconSizes.sm} color={Colors.text.tertiary} style={styles.inputIcon} />
            <Input
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={IconSizes.sm} color={Colors.text.tertiary} style={styles.inputIcon} />
            <Input
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              placeholder="6文字以上"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>ログイン中...</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={IconSizes.sm} color={Colors.text.inverse} />
                <Text style={styles.loginButtonText}>ログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text variant="bodyMedium" style={styles.dividerText}>または</Text>
            <View style={styles.dividerLine} />
          </View>

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
                <Ionicons name="logo-google" size={IconSizes.sm} color={Colors.text.primary} />
                <Text style={styles.googleButtonText}>Google でログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text variant="bodyMedium" style={styles.signUpText}>
              アカウントをお持ちでない方
            </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  form: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  inputIcon: {
    position: 'absolute',
    left: Spacing.md,
    top: 38,
    zIndex: 1,
  },
  input: {
    paddingLeft: Spacing['4xl'],
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.medium,
  },
  dividerText: {
    marginHorizontal: Spacing.lg,
    color: Colors.text.tertiary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border.dark,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
    gap: Spacing.xs,
  },
  signUpText: {
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
});
