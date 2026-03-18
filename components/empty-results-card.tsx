import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type EmptyResultsCardProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  cardColor: string;
  titleColor: string;
  subtitleColor: string;
};

export function EmptyResultsCard({
  iconName,
  title,
  subtitle,
  cardColor,
  titleColor,
  subtitleColor,
}: EmptyResultsCardProps) {
  return (
    <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
      <MaterialIcons name={iconName} size={26} color={subtitleColor} />
      <Text style={[styles.emptyTitle, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: subtitleColor }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
