import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, IconButton, Menu, TextInput, Button } from 'react-native-paper';
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
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const { user } = useAuthStore();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(comment.content);
  const isOwnComment = user?.id === comment.user.id;

  const handleEdit = () => {
    setMenuVisible(false);
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editedContent.trim()) {
      onEdit(comment.id, editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };

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
          {isOwnComment && (onEdit || onDelete) && !isEditing && (
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
              {onEdit && <Menu.Item onPress={handleEdit} title="編集" leadingIcon="pencil" />}
              {onDelete && <Menu.Item onPress={handleDelete} title="削除" leadingIcon="delete" />}
            </Menu>
          )}
        </View>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              mode="outlined"
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              numberOfLines={3}
              style={styles.editInput}
              autoFocus
            />
            <View style={styles.editButtons}>
              <Button mode="outlined" onPress={handleCancelEdit} style={styles.editButton}>
                キャンセル
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEdit}
                style={styles.editButton}
                disabled={!editedContent.trim()}
              >
                保存
              </Button>
            </View>
          </View>
        ) : (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}
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
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    minWidth: 80,
  },
});
