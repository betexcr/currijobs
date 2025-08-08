import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium' | 'large';
}

const categoryToEmoji: Record<string, string> = {
  plumbing: '🔧',
  electrician: '⚡',
  carpentry: '🪚',
  painting: '🎨',
  appliance_repair: '⚙️',
  cleaning: '🧹',
  laundry_ironing: '👕',
  cooking: '🍳',
  grocery_shopping: '🛒',
  pet_care: '🐶',
  gardening: '🌿',
  moving_help: '📦',
  trash_removal: '🗑️',
  window_washing: '🪟',
  babysitting: '🍼',
  elderly_care: '🧓',
  tutoring: '📚',
  delivery_errands: '🛵',
  tech_support: '💻',
  photography: '📸',
};

const categoryToBg: Record<string, string> = {
  plumbing: '#E0F2FE',
  electrician: '#FEF3C7',
  carpentry: '#FCE7F3',
  painting: '#EDE9FE',
  appliance_repair: '#E2E8F0',
  cleaning: '#ECFDF5',
  laundry_ironing: '#F0FDFA',
  cooking: '#FFF7ED',
  grocery_shopping: '#F5F3FF',
  pet_care: '#FFF1F2',
  gardening: '#ECFCCB',
  moving_help: '#FFE4E6',
  trash_removal: '#F5F5F4',
  window_washing: '#E0F2FE',
  babysitting: '#FFF1F2',
  elderly_care: '#F1F5F9',
  tutoring: '#E0E7FF',
  delivery_errands: '#FFFBEB',
  tech_support: '#E2E8F0',
  photography: '#F3E8FF',
};

export default function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  const { theme } = useTheme();
  const normalized = (category || '').toLowerCase();
  const emoji = categoryToEmoji[normalized] || '💼';
  const bg = categoryToBg[normalized] || theme.colors.surface;

  const dim = size === 'large' ? 56 : size === 'small' ? 36 : 44;
  const emojiSize = size === 'large' ? 24 : size === 'small' ? 16 : 18;

  return (
    <View style={[styles.container, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg }] }>
      <Image
        source={require('../assets/chambito.png')}
        style={{ width: dim * 0.85, height: dim * 0.85, resizeMode: 'contain' }}
      />
      <View style={[styles.emojiBubble, { width: dim * 0.5, height: dim * 0.5, borderRadius: (dim * 0.5) / 2 }] }>
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBubble: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});


