import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { LocalizationStrings } from '../lib/localization';

const { width, height } = Dimensions.get('window');

const onboardingSteps: Array<{
  id: number;
  title: keyof LocalizationStrings;
  description: keyof LocalizationStrings;
  image: ImageSourcePropType;
}> = [
  {
    id: 1,
    title: 'onboardingStep1Title',
    description: 'onboardingStep1Description',
    image: require('../assets/onboarding-1.png'),
  },
  {
    id: 2,
    title: 'onboardingStep2Title',
    description: 'onboardingStep2Description',
    image: require('../assets/onboarding-2.png'),
  },
  {
    id: 3,
    title: 'onboardingStep3Title',
    description: 'onboardingStep3Description',
    image: require('../assets/onboarding-3.png'),
  },
  {
    id: 4,
    title: 'onboardingStep4Title',
    description: 'onboardingStep4Description',
    image: require('../assets/onboarding-4.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);

  // No need to preload images when using require() - they're bundled

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    Animated.spring(translateX, {
      toValue: -step * width,
      useNativeDriver: true,
    }).start();
  };

  const handleFinish = () => {
    router.replace('/');
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: { nativeEvent: { state: number; translationX: number } }) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const threshold = width * 0.3;

      if (translationX > threshold && currentStep > 0) {
        // Swipe right - go to previous
        goToStep(currentStep - 1);
      } else if (translationX < -threshold && currentStep < onboardingSteps.length - 1) {
        // Swipe left - go to next
        goToStep(currentStep + 1);
      } else {
        // Return to current position
        Animated.spring(translateX, {
          toValue: -currentStep * width,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Solid Background Color */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#f8d384' }]} />
      
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Swipeable Content */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateX }],
            }
          ]}
        >
          {onboardingSteps.map((step) => (
            <View key={step.id} style={styles.stepContainer}>
              {/* Illustration */}
              <View style={styles.imageContainer}>
                <Image
                  source={step.image}
                  style={styles.stepImage}
                  resizeMode="contain"
                  fadeDuration={0}
                />
              </View>
              
              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={styles.stepTitle}>
                  {t(step.title)}
                </Text>
                
                <Text style={styles.stepDescription}>
                  {t(step.description)}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </PanGestureHandler>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>
                {t('previous')}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? t('letsGo') : t('next')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleFinish}
        >
          <Text style={styles.skipButtonText}>
            {t('skipOnboarding')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#1E3A8A',
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    width: width * onboardingSteps.length,
  },
  stepContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    color: '#1E3A8A',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#374151',
    paddingHorizontal: 10,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#1E3A8A',
  },
  previousButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#6B7280',
  },
});
