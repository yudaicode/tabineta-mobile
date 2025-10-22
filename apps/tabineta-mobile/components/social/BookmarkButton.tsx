import React from 'react';
import { IconButton } from 'react-native-paper';
import { useTripBookmark } from '@/hooks/useSocial';

interface BookmarkButtonProps {
  tripScheduleId: string;
}

export function BookmarkButton({ tripScheduleId }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoading } = useTripBookmark(tripScheduleId);

  return (
    <IconButton
      icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
      iconColor={isBookmarked ? '#3B82F6' : '#6B7280'}
      size={24}
      onPress={() => toggleBookmark()}
      disabled={isLoading}
    />
  );
}
