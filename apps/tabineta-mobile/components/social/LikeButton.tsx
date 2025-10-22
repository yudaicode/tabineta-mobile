import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTripLike } from '@/hooks/useSocial';

interface LikeButtonProps {
  tripScheduleId: string;
}

export function LikeButton({ tripScheduleId }: LikeButtonProps) {
  const { isLiked, likesCount, toggleLike, isLoading } = useTripLike(tripScheduleId);

  return (
    <View style={styles.container}>
      <IconButton
        icon={isLiked ? 'heart' : 'heart-outline'}
        iconColor={isLiked ? '#EF4444' : '#6B7280'}
        size={24}
        onPress={() => toggleLike()}
        disabled={isLoading}
      />
      <Text style={styles.count}>{likesCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: -4,
  },
});
