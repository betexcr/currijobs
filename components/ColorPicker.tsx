import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange, onClose }) => {
  const { theme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(color);

  const predefinedColors = [
    '#1E3A8A', '#FF6B35', '#FBC02D', '#D32F2F', // Primary colors
    '#4CAF50', '#FF9800', '#9C27B0', '#607D8B', // Secondary colors
    '#FFFFFF', '#F8F9FA', '#E5E7EB', '#6B7280', // Grays
    '#000000', '#1E293B', '#334155', '#64748B', // Dark colors
  ];

  const handleColorSelect = (newColor: string) => {
    setSelectedColor(newColor);
    onColorChange(newColor);
  };

  const handleSave = () => {
    onColorChange(selectedColor);
    onClose();
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Choose Color
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.colorGrid}>
            {predefinedColors.map((predefinedColor) => (
              <TouchableOpacity
                key={predefinedColor}
                style={[
                  styles.colorOption,
                  { backgroundColor: predefinedColor },
                  selectedColor === predefinedColor && styles.selectedColor,
                ]}
                onPress={() => handleColorSelect(predefinedColor)}
              />
            ))}
          </View>

          <View style={styles.selectedColorPreview}>
            <Text style={[styles.previewLabel, { color: theme.colors.text.primary }]}>
              Selected Color:
            </Text>
            <View style={[styles.previewColor, { backgroundColor: selectedColor }]} />
            <Text style={[styles.colorHex, { color: theme.colors.text.secondary }]}>
              {selectedColor}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary.blue }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: 'white' }]}>
              Save Color
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#1E3A8A',
  },
  selectedColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorHex: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ColorPicker;

