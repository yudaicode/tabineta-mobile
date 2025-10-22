import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // URLパラメータからトークンを取得
      const { access_token, refresh_token, error, error_description } = params;

      if (error) {
        throw new Error(error_description as string || 'Authentication failed');
      }

      if (access_token && refresh_token) {
        // セッションを設定
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) throw sessionError;

        Toast.show({
          type: 'success',
          text1: 'ログイン成功',
        });

        // マイページにリダイレクト
        router.replace('/(tabs)/profile');
      } else {
        throw new Error('トークンが見つかりませんでした');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      Toast.show({
        type: 'error',
        text1: '認証エラー',
        text2: error.message || '認証に失敗しました',
      });

      // ログイン画面に戻る
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text variant="bodyLarge" style={styles.text}>
        認証処理中...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    color: '#64748B',
  },
});
