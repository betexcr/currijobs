import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  visible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3923d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8, // 80% of screen width
    height: height * 0.6, // 60% of screen height
    maxWidth: 400, // Maximum width
    maxHeight: 600, // Maximum height
  },
});

export default SplashScreen;

