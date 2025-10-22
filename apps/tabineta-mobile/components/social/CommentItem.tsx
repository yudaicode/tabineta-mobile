import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, IconButton, Menu } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuthStore } from '@/stores/authStore';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  onDelete?: (commentId: string) => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { user } = useAuthStore();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const isOwnComment = user?.id === comment.user.id;

  const handleDelete = () => {
    setMenuVisible(false);
    if (onDelete) {
      onDelete(comment.id);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {comment.user.avatar_url ? (
        <Avatar.Image size={40} source={{ uri: comment.user.avatar_url }} />
      ) : (
        <Avatar.Text
          size={40}
          label={getInitials(comment.user.full_name || comment.user.username)}
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {comment.user.full_name || comment.user.username || 'Unknown User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ja,
              })}
            </Text>
          </View>
          {isOwnComment && onDelete && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={handleDelete} title="削除" />
            </Menu>
          )}
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
