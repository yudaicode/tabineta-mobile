import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/supabase';

export function useImagePicker() {
  const [uploading, setUploading] = useState(false);

  const pickImage = async (): Promise<string | null> => {
    try {
      // パーミッション確認
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: '写真へのアクセスを許可してください',
        });
        return null;
      }

      // 画像選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) return null;

      // リサイズ
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // アップロード
      const url = await uploadImage(manipulated.uri);
      return url;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '画像の選択に失敗しました',
        text2: error.message,
      });
      return null;
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    setUploading(true);
    try {
      // ファイル名生成
      const timestamp = Date.now();
      const filename = `trip-${timestamp}.jpg`;

      // Base64に変換してアップロード
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from('trip-images')
        .upload(filename, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'アップロードに失敗しました',
        text2: error.message,
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, uploading };
}
