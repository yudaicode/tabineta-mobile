import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

export function CommentForm({ onSubmit, isLoading }: CommentFormProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder="コメントを入力..."
        value={comment}
        onChangeText={setComment}
        style={styles.input}
        multiline
        maxLength={500}
        disabled={isLoading}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />
      <IconButton
        icon="send"
        iconColor="#3B82F6"
        size={24}
        onPress={handleSubmit}
        disabled={isLoading || !comment.trim()}
        style={styles.sendButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
});
