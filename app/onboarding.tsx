import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: 'onboardingStep1Title',
    description: 'onboardingStep1Description',
    icon: '🗺️',
  },
  {
    id: 2,
    title: 'onboardingStep2Title',
    description: 'onboardingStep2Description',
    icon: '📋',
  },
  {
    id: 3,
    title: 'onboardingStep3Title',
    description: 'onboardingStep3Description',
    icon: '💼',
  },
  {
    id: 4,
    title: 'onboardingStep4Title',
    description: 'onboardingStep4Description',
    icon: '✅',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    router.replace('/');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
                backgroundColor: '#1E3A8A'
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          {currentStep + 1} / {onboardingSteps.length}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
          </View>
          
          <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
            {t(currentStepData.title)}
          </Text>
          
          <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
            {t(currentStepData.description)}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.previousButton]}
              onPress={handlePrevious}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.text.secondary }]}>
                {t('previous')}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.navButton, 
              styles.nextButton,
              { backgroundColor: '#1E3A8A' }
            ]}
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
          <Text style={[styles.skipButtonText, { color: theme.colors.text.secondary }]}>
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
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    fontSize: 48,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  previousButton: {
    backgroundColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#1E3A8A',
  },
  navButtonText: {
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
  },
});
