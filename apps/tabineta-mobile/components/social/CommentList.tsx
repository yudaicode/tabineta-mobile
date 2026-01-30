import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  isLoading?: boolean;
}

export function CommentList({ comments, onEditComment, onDeleteComment, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>読み込み中...</Text>
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>コメントはまだありません</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CommentItem comment={item} onEdit={onEditComment} onDelete={onDeleteComment} />
      )}
      ItemSeparatorComponent={() => <Divider />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
