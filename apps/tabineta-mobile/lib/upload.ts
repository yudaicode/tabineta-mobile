import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * 画像を選択してアップロード
 */
export async function pickAndUploadImages(
  bucket: string,
  folder: string,
  maxImages: number = 5
): Promise<string[]> {
  // 権限をリクエスト
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('画像ライブラリへのアクセス権限が必要です');
  }

  // 画像を選択
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.8,
    selectionLimit: maxImages,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  // 選択された画像をアップロード
  const uploadPromises = result.assets.map(async (asset) => {
    return uploadImage(asset.uri, bucket, folder);
  });

  const uploadedUrls = await Promise.all(uploadPromises);
  return uploadedUrls.filter((url): url is string => url !== null);
}

/**
 * 画像をSupabase Storageにアップロード
 */
export async function uploadImage(
  uri: string,
  bucket: string,
  folder: string
): Promise<string | null> {
  try {
    // ファイルをbase64として読み込む
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
}

/**
 * 画像を削除
 */
export async function deleteImage(url: string, bucket: string): Promise<boolean> {
  try {
    // URLからファイルパスを抽出
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex((part) => part === bucket);

    if (bucketIndex === -1) {
      throw new Error('Invalid URL format');
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Image delete failed:', error);
    return false;
  }
}
