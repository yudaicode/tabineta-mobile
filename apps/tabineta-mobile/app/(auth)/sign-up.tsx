import React, { useEffect } from 'react';
import { router } from 'expo-router';

// sign-upはsign-inと同じOAuth専用画面にリダイレクト
export default function SignUpScreen() {
  useEffect(() => {
    router.replace('/(auth)/sign-in');
  }, []);

  return null;
}
