import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { makeRedirectUri } from 'expo-auth-session';

// WebBrowser を使用した認証完了後の処理を有効化
WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth でサインイン
 *
 * React Native (Expo) で Supabase の Google OAuth を実装します。
 * Supabase の PKCE フローを使用して、セキュアな認証を行います。
 */
export async function signInWithGoogle() {
  try {
    // リダイレクトURIを生成（Expo Goの場合は exp:// スキームになる）
    const redirectUrl = makeRedirectUri({
      scheme: 'tabinetamobile',
      path: 'auth/callback',
    });

    console.log('Redirect URL:', redirectUrl);

    // Supabase OAuth フローを開始
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // モバイルではtrueにする
      },
    });

    if (error) throw error;

    // OAuth URLを取得
    const authUrl = data?.url;
    if (!authUrl) {
      throw new Error('認証URLの取得に失敗しました');
    }

    console.log('Opening auth URL:', authUrl);

    // ブラウザでOAuthフローを開始
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      redirectUrl,
    );

    console.log('Auth result:', result);

    // 認証結果を処理
    if (result.type === 'success') {
      const { url } = result;
      console.log('Success URL:', url);

      // URLからトークンを抽出
      // Supabaseは #access_token=... 形式でトークンを返すことがある
      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const queryParams = new URLSearchParams(url.split('?')[1] || '');

      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

      if (accessToken && refreshToken) {
        console.log('Setting session with tokens');
        // セッションを設定
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('Session set successfully');
        return { data: sessionData, error: null };
      } else if (errorDescription) {
        console.error('Auth error:', errorDescription);
        throw new Error(errorDescription);
      } else {
        console.error('No tokens found in URL:', url);
        throw new Error('認証トークンが見つかりませんでした');
      }
    } else if (result.type === 'cancel') {
      console.log('Auth cancelled');
      return { data: null, error: { message: 'ログインがキャンセルされました' } };
    }

    console.log('Auth failed with result:', result);
    return { data: null, error: { message: '認証に失敗しました' } };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
}

/**
 * メールアドレスとパスワードでサインイン
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * メールアドレスとパスワードで新規登録
 */
export async function signUpWithEmail(email: string, password: string, metadata?: { full_name?: string }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * サインアウト
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
}
