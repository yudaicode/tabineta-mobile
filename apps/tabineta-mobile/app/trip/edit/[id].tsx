import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Button, RadioButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTripDetail, useUpdateTrip } from '@/hooks/useTrips';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows, Typography, IconSizes } from '@/constants/theme';
import Toast from 'react-native-toast-message';

const CATEGORIES = [
  '国内旅行',
  '海外旅行',
  'グルメ旅',
  '温泉旅行',
  'アウトドア',
  '文化・歴史',
  'リゾート',
  '冒険・アクティビティ',
  'その他',
];

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: trip, isLoading } = useTripDetail(id);
  const updateTrip = useUpdateTrip();
  const { pickImage, uploading } = useImagePicker();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('国内旅行');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [travelerCount, setTravelerCount] = useState('2');
  const [isPublic, setIsPublic] = useState('public');

  useEffect(() => {
    if (trip) {
      setTitle(trip.title || '');
      setDescription(trip.description || '');
      setCategory(trip.category || '国内旅行');
      setCoverImage(trip.cover_image);
      setTravelerCount(
        trip.traveler_count === 5 || trip.traveler_count > 5
          ? '5+'
          : String(trip.traveler_count || 2)
      );
      setIsPublic(trip.is_public ? 'public' : 'private');
    }
  }, [trip]);

  const handlePickImage = async () => {
    const url = await pickImage();
    if (url) {
      setCoverImage(url);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'ログインが必要です',
      });
      return;
    }

    if (!title || !description) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: 'タイトルと説明は必須です',
      });
      return;
    }

    try {
      const travelerNumber = travelerCount === '5+' ? 5 : parseInt(travelerCount);

      await updateTrip.mutateAsync({
        id,
        data: {
          title,
          description,
          category,
          traveler_count: travelerNumber,
          cover_image: coverImage,
          is_public: isPublic === 'public',
        },
      });

      Toast.show({
        type: 'success',
        text1: '更新しました',
        text2: '旅行プランを更新しました',
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '更新に失敗しました',
        text2: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.neutral[400]} />
        <Text style={styles.errorText}>旅行プランが見つかりません</Text>
      </View>
    );
  }

  // 権限チェック
  if (trip.user_id !== user?.id) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.neutral[400]} />
        <Text style={styles.errorText}>編集権限がありません</Text>
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
        <Text style={styles.headerTitle}>旅行プランを編集</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="labelLarge" style={styles.label}>
          タイトル *
        </Text>
        <TextInput
          mode="outlined"
          value={title}
          onChangeText={setTitle}
          placeholder="例: 東京3泊4日グルメ旅"
          style={styles.input}
          returnKeyType="done"
        />

        <Text variant="labelLarge" style={styles.label}>
          説明 *
        </Text>
        <TextInput
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          placeholder="旅行の概要を入力..."
          multiline
          numberOfLines={4}
          style={styles.input}
          returnKeyType="done"
        />

        <Text variant="labelLarge" style={styles.label}>
          カテゴリ *
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text variant="labelLarge" style={styles.label}>
          カバー画像
        </Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} disabled={uploading}>
          {coverImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: coverImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageChangeText}>タップで変更</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePickerContent}>
              <Text style={styles.imagePickerIcon}>+</Text>
              <Text style={styles.imagePickerText}>
                {uploading ? 'アップロード中...' : '画像を追加'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text variant="labelLarge" style={styles.label}>
          人数
        </Text>
        <View style={styles.travelerButtons}>
          {['1', '2', '3', '4', '5+'].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.travelerButton,
                travelerCount === count && styles.travelerButtonSelected,
              ]}
              onPress={() => setTravelerCount(count)}
            >
              <Text
                style={[
                  styles.travelerText,
                  travelerCount === count && styles.travelerTextSelected,
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text variant="labelLarge" style={styles.label}>
          公開設定
        </Text>
        <RadioButton.Group onValueChange={setIsPublic} value={isPublic}>
          <View style={styles.radioRow}>
            <RadioButton.Item label="公開" value="public" />
            <RadioButton.Item label="非公開" value="private" />
          </View>
        </RadioButton.Group>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={IconSizes.sm} color={Colors.primary[600]} />
          <Text style={styles.infoText}>
            日程とアクティビティの編集は現在準備中です
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
          onPress={handleSubmit}
          loading={updateTrip.isPending}
          disabled={updateTrip.isPending || !title || !description}
          style={styles.footerButton}
        >
          更新
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.primary,
  },
  categoryButtonSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryTextSelected: {
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.bold,
  },
  imagePicker: {
    height: 140,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 40,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  imagePickerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    alignItems: 'center',
  },
  imageChangeText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  travelerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  travelerButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  travelerButtonSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  travelerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  travelerTextSelected: {
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.bold,
  },
  radioRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[700],
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
