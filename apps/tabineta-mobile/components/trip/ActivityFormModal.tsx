import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { pickAndUploadImages } from '@/lib/upload';
import Toast from 'react-native-toast-message';

interface Activity {
  time: string;
  title: string;
  type: string;
  location: string | null;
  description: string | null;
  duration: string | null;
  cost: number | null;
  images?: string[];
}

interface ActivityFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (activity: Activity) => void;
  initialData?: Activity;
}

const ACTIVITY_TYPES = [
  { value: 'activity', label: '活動', icon: '🚶' },
  { value: 'transport', label: '移動', icon: '🚃' },
  { value: 'meal', label: '食事', icon: '🍴' },
  { value: 'accommodation', label: '宿泊', icon: '🏨' },
  { value: 'shopping', label: '買物', icon: '🛍' },
  { value: 'sightseeing', label: '観光', icon: '🗿' },
  { value: 'meeting', label: '集合', icon: '👥' },
];

export function ActivityFormModal({ visible, onDismiss, onSubmit, initialData }: ActivityFormModalProps) {
  const [time, setTime] = useState(initialData?.time || '09:00');
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'activity');
  const [location, setLocation] = useState(initialData?.location || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [cost, setCost] = useState(initialData?.cost?.toString() || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImages = async () => {
    try {
      setIsUploading(true);
      const uploadedUrls = await pickAndUploadImages('activity-images', 'activities', 5 - images.length);

      if (uploadedUrls.length > 0) {
        setImages([...images, ...uploadedUrls]);
        Toast.show({
          type: 'success',
          text1: `${uploadedUrls.length}枚の画像をアップロードしました`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'エラー',
        text2: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!time || !title || !type) {
      return;
    }

    onSubmit({
      time,
      title,
      type,
      location: location || null,
      description: description || null,
      duration: duration || null,
      cost: cost ? parseFloat(cost) : null,
      images,
    });

    // フォームをリセット
    setTime('09:00');
    setTitle('');
    setType('activity');
    setLocation('');
    setDescription('');
    setDuration('');
    setCost('');
    setImages([]);

    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">アクティビティを追加</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <ScrollView style={styles.content}>
          {/* 時刻 */}
          <Text variant="labelLarge" style={styles.label}>
            時刻 *
          </Text>
          <TextInput
            mode="outlined"
            value={time}
            onChangeText={setTime}
            placeholder="09:00"
            keyboardType="default"
            style={styles.input}
            returnKeyType="done"
          />

          {/* タイトル */}
          <Text variant="labelLarge" style={styles.label}>
            タイトル *
          </Text>
          <TextInput
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            placeholder="例: 新宿駅集合"
            style={styles.input}
            returnKeyType="done"
          />

          {/* 種類 */}
          <Text variant="labelLarge" style={styles.label}>
            種類 *
          </Text>
          <View style={styles.typeGrid}>
            {ACTIVITY_TYPES.map((activityType) => (
              <TouchableOpacity
                key={activityType.value}
                style={[
                  styles.typeButton,
                  type === activityType.value && styles.typeButtonSelected,
                ]}
                onPress={() => setType(activityType.value)}
              >
                <Text style={styles.typeIcon}>{activityType.icon}</Text>
                <Text style={styles.typeLabel}>{activityType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 場所 */}
          <Text variant="labelLarge" style={styles.label}>
            場所
          </Text>
          <TextInput
            mode="outlined"
            value={location}
            onChangeText={setLocation}
            placeholder="例: 新宿駅南口"
            style={styles.input}
            returnKeyType="done"
          />

          {/* 説明 */}
          <Text variant="labelLarge" style={styles.label}>
            説明
          </Text>
          <TextInput
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            placeholder="詳細を入力..."
            multiline
            numberOfLines={3}
            style={styles.input}
            returnKeyType="done"
          />

          {/* 所要時間 */}
          <Text variant="labelLarge" style={styles.label}>
            所要時間
          </Text>
          <TextInput
            mode="outlined"
            value={duration}
            onChangeText={setDuration}
            placeholder="例: 15分"
            style={styles.input}
            returnKeyType="done"
          />

          {/* 費用 */}
          <Text variant="labelLarge" style={styles.label}>
            費用
          </Text>
          <TextInput
            mode="outlined"
            value={cost}
            onChangeText={setCost}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
            right={<TextInput.Affix text="円" />}
            returnKeyType="done"
          />

          {/* 画像 */}
          <Text variant="labelLarge" style={styles.label}>
            画像 ({images.length}/5)
          </Text>

          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <IconButton
                  icon="close-circle"
                  size={24}
                  iconColor="#FFFFFF"
                  containerColor="rgba(0, 0, 0, 0.6)"
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                />
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImages}
                disabled={isUploading}
              >
                <IconButton
                  icon={isUploading ? 'loading' : 'camera-plus'}
                  size={32}
                  iconColor="#6B7280"
                />
                <Text style={styles.addImageText}>
                  {isUploading ? 'アップロード中...' : '画像を追加'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button mode="contained" onPress={handleSubmit} disabled={!time || !title || !type}>
            {initialData ? '更新' : '追加'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  label: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    backgroundColor: 'white',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  typeButton: {
    width: '30%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -8,
  },
});
