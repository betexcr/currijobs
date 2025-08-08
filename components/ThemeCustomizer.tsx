import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ColorblindType, CustomThemeColors, defaultCustomTheme } from '../lib/theme';
import ColorPicker from './ColorPicker';

interface ThemeCustomizerProps {
  onClose?: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const { theme, setMode, setColorblind, toggleMode, setCustomColors: applyCustomColors, setCustomTheme, customColors: currentCustomColors } = useTheme();
  const [customColors, setCustomColorsLocal] = useState<CustomThemeColors>(currentCustomColors || defaultCustomTheme);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const colorblindOptions: { type: ColorblindType; label: string; description: string }[] = [
    { type: 'normal', label: 'Normal Vision', description: 'Standard color scheme' },
    { type: 'protanopia', label: 'Protanopia', description: 'Red-green colorblindness' },
    { type: 'deuteranopia', label: 'Deuteranopia', description: 'Red-green colorblindness' },
    { type: 'tritanopia', label: 'Tritanopia', description: 'Blue-yellow colorblindness' },
  ];

  const colorOptions = [
    { key: 'primary', label: 'Primary Color', color: customColors.primary },
    { key: 'secondary', label: 'Secondary Color', color: customColors.secondary },
    { key: 'accent', label: 'Accent Color', color: customColors.accent },
    { key: 'background', label: 'Background Color', color: customColors.background },
    { key: 'surface', label: 'Surface Color', color: customColors.surface },
    { key: 'text', label: 'Text Color', color: customColors.text },
    { key: 'border', label: 'Border Color', color: customColors.border },
  ];

  const handleColorChange = (key: keyof CustomThemeColors, color: string) => {
    setCustomColorsLocal(prev => {
      const updated = { ...prev, [key]: color } as CustomThemeColors;
      // Live preview: apply immediately so UI reflects changes before saving
      try {
        applyCustomColors(updated);
        setCustomTheme('custom');
      } catch {}
      return updated;
    });
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset Theme',
      'Are you sure you want to reset to default colors?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => setCustomColorsLocal(defaultCustomTheme) },
      ]
    );
  };

  const saveCustomTheme = () => {
    try {
      applyCustomColors(customColors);
      setCustomTheme('custom');
      Alert.alert('Success', 'Custom theme applied!');
    } catch (e) {
      Alert.alert('Error', 'Could not apply custom theme');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Theme Customizer
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Theme Mode */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Theme Mode
        </Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              { 
                backgroundColor: theme.mode === 'light' ? theme.colors.primary.blue : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setMode('light')}
          >
            <Ionicons 
              name="sunny" 
              size={20} 
              color={theme.mode === 'light' ? 'white' : theme.colors.text.primary} 
            />
            <Text style={[
              styles.modeText,
              { color: theme.mode === 'light' ? 'white' : theme.colors.text.primary }
            ]}>
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              { 
                backgroundColor: theme.mode === 'dark' ? theme.colors.primary.blue : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setMode('dark')}
          >
            <Ionicons 
              name="moon" 
              size={20} 
              color={theme.mode === 'dark' ? 'white' : theme.colors.text.primary} 
            />
            <Text style={[
              styles.modeText,
              { color: theme.mode === 'dark' ? 'white' : theme.colors.text.primary }
            ]}>
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Colorblind Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Colorblind Support
        </Text>
        {colorblindOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.colorblindOption,
              { 
                backgroundColor: theme.colorblind === option.type ? theme.colors.primary.blue : theme.colors.surface,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setColorblind(option.type)}
          >
            <View style={styles.colorblindInfo}>
              <Text style={[
                styles.colorblindLabel,
                { color: theme.colorblind === option.type ? 'white' : theme.colors.text.primary }
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.colorblindDescription,
                { color: theme.colorblind === option.type ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }
              ]}>
                {option.description}
              </Text>
            </View>
            {theme.colorblind === option.type && (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Colors */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Custom Colors
          </Text>
          <TouchableOpacity onPress={resetToDefault} style={styles.resetButton}>
            <Text style={[styles.resetText, { color: theme.colors.primary.blue }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {colorOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.colorOption,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
            ]}
            onPress={() => setShowColorPicker(option.key)}
          >
            <View style={styles.colorInfo}>
              <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>
                {option.label}
              </Text>
              <View style={[styles.colorPreview, { backgroundColor: option.color }]} />
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary.blue }
          ]}
          onPress={saveCustomTheme}
        >
          <Text style={[styles.saveButtonText, { color: 'white' }]}>
            Save Custom Theme
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.surface, marginTop: 8 }
          ]}
          onPress={() => setCustomTheme('default')}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.text.primary }]}> 
            Use Default Theme
          </Text>
        </TouchableOpacity>
      </View>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPicker
          color={customColors[showColorPicker as keyof CustomThemeColors]}
          onColorChange={(color) => handleColorChange(showColorPicker as keyof CustomThemeColors, color)}
          onClose={() => setShowColorPicker(null)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorblindOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  colorblindInfo: {
    flex: 1,
  },
  colorblindLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  colorblindDescription: {
    fontSize: 14,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  resetButton: {
    padding: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeCustomizer;

