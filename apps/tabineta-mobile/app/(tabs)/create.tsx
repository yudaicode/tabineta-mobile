import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useCreateTripWithSchedule } from '@/hooks/useTrips';
import { useImagePicker } from '@/hooks/useImagePicker';
import { ActivityFormModal } from '@/components/trip/ActivityFormModal';
import { format, addDays, differenceInDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
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

interface Activity {
  time: string;
  title: string;
  type: string;
  location: string | null;
  description: string | null;
  duration: string | null;
  cost: number | null;
}

interface DaySchedule {
  day_number: number;
  date: string;
  title: string;
  activities: Activity[];
}

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createTrip = useCreateTripWithSchedule();
  const { pickImage, uploading } = useImagePicker();

  // ステップ管理
  const [step, setStep] = useState(1);

  // ステップ1: 基本情報
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('国内旅行');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [travelerCount, setTravelerCount] = useState('2');
  const [isPublic, setIsPublic] = useState('public');

  // ステップ2: 日程
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 2));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // ステップ3: スケジュール
  const [selectedDay, setSelectedDay] = useState(0);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [activityModalVisible, setActivityModalVisible] = useState(false);

  // 日程を生成
  const generateDaySchedules = () => {
    const days: DaySchedule[] = [];
    const dayCount = differenceInDays(endDate, startDate) + 1;

    for (let i = 0; i < dayCount; i++) {
      const date = addDays(startDate, i);
      days.push({
        day_number: i + 1,
        date: format(date, 'yyyy-MM-dd'),
        title: `${i + 1}日目 - ${format(date, 'M月d日')}`,
        activities: [],
      });
    }

    setDaySchedules(days);
    setSelectedDay(0);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      generateDaySchedules();
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePickImage = async () => {
    const url = await pickImage();
    if (url) {
      setCoverImage(url);
    }
  };

  const handleAddActivity = (activity: Activity) => {
    const updatedSchedules = [...daySchedules];
    updatedSchedules[selectedDay].activities.push(activity);
    updatedSchedules[selectedDay].activities.sort((a, b) => a.time.localeCompare(b.time));
    setDaySchedules(updatedSchedules);
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    const updatedSchedules = [...daySchedules];
    updatedSchedules[dayIndex].activities.splice(activityIndex, 1);
    setDaySchedules(updatedSchedules);
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

    try {
      // "5+" を 5 に変換
      const travelerNumber = travelerCount === '5+' ? 5 : parseInt(travelerCount);

      await createTrip.mutateAsync({
        userId: user.id,
        data: {
          title,
          description,
          category,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          traveler_count: travelerNumber,
          cover_image: coverImage,
          is_public: isPublic === 'public',
          day_schedules: daySchedules.map((day) => ({
            ...day,
            activities: day.activities.map((activity) => ({
              ...activity,
              images: [],
            })),
          })),
        },
      });

      router.push('/');
    } catch (error) {
      console.error('旅行作成エラー:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ステップインジケーター */}
      <View style={styles.stepIndicator}>
        <Text variant="titleMedium">ステップ {step}/3</Text>
        <Text variant="bodyMedium" style={styles.stepTitle}>
          {step === 1 && '基本情報'}
          {step === 2 && '日程'}
          {step === 3 && 'スケジュール'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* ステップ1: 基本情報 */}
        {step === 1 && (
          <View>
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
                  <Text>{count}</Text>
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
          </View>
        )}

        {/* ステップ2: 日程 */}
        {step === 2 && (
          <View>
            <Text variant="labelLarge" style={styles.label}>
              出発日 *
            </Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{format(startDate, 'yyyy/MM/dd')}</Text>
              <Text>📅</Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(event, date) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (date) {
                    setStartDate(date);
                    if (date > endDate) {
                      setEndDate(addDays(date, 2));
                    }
                  }
                }}
              />
            )}

            <Text variant="labelLarge" style={styles.label}>
              帰着日 *
            </Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{format(endDate, 'yyyy/MM/dd')}</Text>
              <Text>📅</Text>
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                onChange={(event, date) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (date) setEndDate(date);
                }}
              />
            )}

            <View style={styles.durationInfo}>
              <Text variant="bodyLarge">
                日数: {differenceInDays(endDate, startDate)}泊
                {differenceInDays(endDate, startDate) + 1}日
              </Text>
            </View>
          </View>
        )}

        {/* ステップ3: スケジュール */}
        {step === 3 && daySchedules.length > 0 && (
          <View>
            {/* 日タブ */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
              {daySchedules.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayTab,
                    selectedDay === index && styles.dayTabSelected,
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text>{day.day_number}日</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text variant="titleMedium" style={styles.dayTitle}>
              {daySchedules[selectedDay].title}
            </Text>

            {/* アクティビティリスト */}
            {daySchedules[selectedDay].activities.map((activity, activityIndex) => (
              <View key={activityIndex} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text variant="bodyMedium" style={styles.activityTime}>
                    {activity.time}
                  </Text>
                  <Text>{activity.type}</Text>
                </View>
                <Text variant="bodyLarge" style={styles.activityTitle}>
                  {activity.title}
                </Text>
                {activity.location && (
                  <Text variant="bodySmall">📍 {activity.location}</Text>
                )}
                <View style={styles.activityActions}>
                  <Button
                    mode="text"
                    onPress={() => handleDeleteActivity(selectedDay, activityIndex)}
                  >
                    削除
                  </Button>
                </View>
              </View>
            ))}

            {/* アクティビティ追加ボタン */}
            <Button
              mode="outlined"
              onPress={() => setActivityModalVisible(true)}
              style={styles.addActivityButton}
            >
              + アクティビティ追加
            </Button>
          </View>
        )}
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        {step > 1 && (
          <Button mode="outlined" onPress={handleBack} style={styles.footerButton}>
            戻る
          </Button>
        )}
        {step < 3 ? (
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={step === 1 && (!title || !description)}
            style={styles.footerButton}
          >
            次へ
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={createTrip.isPending}
            disabled={createTrip.isPending}
            style={styles.footerButton}
          >
            作成
          </Button>
        )}
      </View>

      {/* アクティビティ追加モーダル */}
      <ActivityFormModal
        visible={activityModalVisible}
        onDismiss={() => setActivityModalVisible(false)}
        onSubmit={handleAddActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stepIndicator: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepTitle: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    backgroundColor: 'white',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  imagePicker: {
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 40,
    color: '#94A3B8',
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
  },
  imageChangeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  travelerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  travelerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  travelerButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  radioRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  durationInfo: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dayTabs: {
    marginBottom: 20,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayTabSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  activityItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTime: {
    color: '#3B82F6',
    fontWeight: '700',
    marginRight: 12,
    fontSize: 15,
  },
  activityTitle: {
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 16,
    color: '#1E293B',
  },
  activityActions: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  addActivityButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  footerButton: {
    flex: 1,
    borderRadius: 12,
  },
});
