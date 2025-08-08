import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Import the Chambito mascot image
const chambitoImage = require('../assets/chambito.png');

interface ChambitoMascotProps {
  mood?: 'happy' | 'working' | 'thinking' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
  message?: string;
  style?: any;
}

export default function ChambitoMascot({
  size = 'medium',
  showMessage = false,
  message = '',
  style,
}: ChambitoMascotProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'large':
        return { width: 120, height: 120 };
      default:
        return { width: 80, height: 80 };
    }
  };

  return (
    <View style={[styles.container, getSizeStyle(), style]}>
      <View style={[styles.mascotContainer, getSizeStyle()]}>
        {/* Real Chambito Mascot Image */}
        <Image
          source={chambitoImage}
          style={[styles.chambitoImage, getSizeStyle()]}
          resizeMode="contain"
        />
      </View>
      
      {showMessage && message && (
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chambitoImage: {
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    maxWidth: 200,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
