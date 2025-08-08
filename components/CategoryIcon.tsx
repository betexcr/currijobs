import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryIconProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function CategoryIcon({ category, size = 'medium', showLabel = false }: CategoryIconProps) {
  const { theme } = useTheme();

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case 'cleaning':
        return '🧹';
      case 'pet care':
        return '🐕';
      case 'moving':
        return '📦';
      case 'gardening':
        return '🌱';
      case 'handyman':
        return '🔧';
      case 'delivery':
        return '🚚';
      case 'cooking':
        return '👨‍🍳';
      case 'tutoring':
        return '📚';
      case 'photography':
        return '📸';
      case 'event planning':
        return '🎉';
      case 'translation':
        return '🌐';
      case 'tech support':
        return '💻';
      default:
        return '💼';
    }
  };

  const getCategoryColor = () => {
    switch (category.toLowerCase()) {
      case 'cleaning':
        return theme.colors.primary;
      case 'pet care':
        return '#4CAF50';
      case 'moving':
        return '#FF9800';
      case 'gardening':
        return '#8BC34A';
      case 'handyman':
        return '#607D8B';
      case 'delivery':
        return '#9C27B0';
      case 'cooking':
        return '#F44336';
      case 'tutoring':
        return '#2196F3';
      case 'photography':
        return '#E91E63';
      case 'event planning':
        return '#FF5722';
      case 'translation':
        return '#00BCD4';
      case 'tech support':
        return '#795548';
      default:
        return theme.colors.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <View style={[styles.container, getSizeStyle()]}>
      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor() }]}>
        <Text style={[styles.icon, getSizeStyle()]}>{getCategoryIcon()}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          {category}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 16,
  },
  small: {
    fontSize: 12,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});


