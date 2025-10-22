import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    // バリデーション
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'すべての項目を入力してください',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'パスワードは6文字以上で入力してください',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'パスワードが一致しません',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: '登録成功',
        text2: 'アカウントが作成されました',
      });

      // 自動ログイン後、ナビゲーションはuseAuthのセッション変更で自動的に行われる
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '登録エラー',
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
        text1: '登録成功',
      });

      // ナビゲーションはuseAuthのセッション変更で自動的に行われる
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google 登録エラー',
        text2: error.message || '認証に失敗しました',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            アカウント作成
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Tabinetaへようこそ
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="6文字以上"
            secureTextEntry
          />

          <Input
            label="パスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="もう一度入力してください"
            secureTextEntry
          />

          <Button onPress={handleSignUp} loading={loading} disabled={loading}>
            登録
          </Button>

          <View style={styles.divider}>
            <Text variant="bodyMedium">または</Text>
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={googleLoading}
          >
            Google で登録
          </Button>

          <View style={styles.signInContainer}>
            <Text variant="bodyMedium">すでにアカウントをお持ちの方</Text>
            <Button mode="text" onPress={handleBackToSignIn}>
              ログイン
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
  },
  form: {
    width: '100%',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  signInContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
});
