import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
}

const Badge: React.FC<BadgeProps> = ({ label, variant }) => {
  let bgColor = '#f3f4f6';
  let textColor = '#374151';

  switch (variant) {
    case 'success':
      bgColor = '#dcfce7';
      textColor = '#166534';
      break;
    case 'warning':
      bgColor = '#fef9c3';
      textColor = '#854d0e';
      break;
    case 'danger':
      bgColor = '#fee2e2';
      textColor = '#991b1b';
      break;
    case 'neutral':
    default:
      bgColor = '#f3f4f6';
      textColor = '#374151';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Badge;
