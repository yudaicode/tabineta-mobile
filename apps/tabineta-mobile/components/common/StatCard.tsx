import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: number | string;
}

export function StatCard({ icon, iconColor, iconBgColor, label, value }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text variant="bodyMedium" style={styles.label}>
            {label}
          </Text>
          <Text variant="headlineMedium" style={styles.value}>
            {value}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: '#64748B',
    marginBottom: 4,
    fontSize: 14,
  },
  value: {
    fontWeight: '700',
    color: '#1E293B',
  },
});
