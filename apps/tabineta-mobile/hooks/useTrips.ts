import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrips,
  fetchTripDetail,
  createTrip,
  updateTrip,
  deleteTrip,
  searchTrips,
  createTripWithSchedule,
  copyTripSchedule,
  updateActivity,
  reorderActivities,
  FetchTripsParams,
  CreateTripWithScheduleData,
} from '@/lib/api';
import { TripSchedule } from '@/types';
import Toast from 'react-native-toast-message';

/**
 * 旅行プラン一覧を取得するフック
 */
export function useTrips(params: FetchTripsParams = {}) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => fetchTrips(params),
  });
}

/**
 * 旅行プラン詳細を取得するフック
 */
export function useTripDetail(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => fetchTripDetail(id),
    enabled: !!id,
  });
}

/**
 * 旅行プランを作成するフック
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TripSchedule>) => createTrip(data),
    onSuccess: () => {
      // 旅行一覧のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * 旅行プランを更新するフック
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TripSchedule> }) =>
      updateTrip(id, data),
    onSuccess: (_, variables) => {
      // 更新した旅行の詳細キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['trips', variables.id] });
      // 旅行一覧のキャッシュも無効化
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * 旅行プランを削除するフック
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      // 旅行一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

/**
 * アクティビティを更新するフック
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      tripScheduleId,
      data,
    }: {
      activityId: string;
      tripScheduleId: string;
      data: {
        time?: string;
        title?: string;
        type?: string;
        location?: string | null;
        description?: string | null;
        duration?: string | null;
        cost?: number | null;
      };
    }) => updateActivity(activityId, data),
    onSuccess: (_, variables) => {
      // 旅行詳細のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['trip-detail', variables.tripScheduleId] });
      queryClient.invalidateQueries({ queryKey: ['trips', variables.tripScheduleId] });
      Toast.show({
        type: 'success',
        text1: 'アクティビティを更新しました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: '更新に失敗しました',
        text2: error.message,
      });
    },
  });
}

/**
 * アクティビティの順序を変更するフック
 */
export function useReorderActivities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dayScheduleId,
      tripScheduleId,
      activityIds,
    }: {
      dayScheduleId: string;
      tripScheduleId: string;
      activityIds: string[];
    }) => reorderActivities(dayScheduleId, activityIds),
    onSuccess: (_, variables) => {
      // 旅行詳細のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['trip-detail', variables.tripScheduleId] });
      Toast.show({
        type: 'success',
        text1: 'アクティビティの順序を変更しました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: '順序変更に失敗しました',
        text2: error.message,
      });
    },
  });
}

/**
 * 旅行プランを検索するフック
 */
export function useSearchTrips(query: string, params: FetchTripsParams = {}) {
  return useQuery({
    queryKey: ['trips', 'search', query, params],
    queryFn: () => searchTrips(query, params),
    enabled: query.length > 0,
  });
}

/**
 * 旅行プランをスケジュールと一緒に作成するフック
 */
export function useCreateTripWithSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateTripWithScheduleData }) =>
      createTripWithSchedule(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      Toast.show({
        type: 'success',
        text1: '旅行プランを作成しました',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: '作成に失敗しました',
        text2: error.message,
      });
    },
  });
}

/**
 * 旅行プランをコピーするフック
 * 画像はプライバシーの観点からコピーされません
 */
export function useCopyTripSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripScheduleId,
      userId,
      options,
    }: {
      tripScheduleId: string;
      userId: string;
      options?: { title?: string; isPublic?: boolean };
    }) => copyTripSchedule(tripScheduleId, userId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      Toast.show({
        type: 'success',
        text1: '旅行プランをコピーしました',
        text2: '「マイページ」から編集できます',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'コピーに失敗しました',
        text2: error.message,
      });
    },
  });
}
