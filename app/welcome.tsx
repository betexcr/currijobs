import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, signIn, loading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('demo@currijobs.com');
  const [password, setPassword] = useState('demo123456');
  const splashSource = require('../assets/splash.png');
  const [splashHeight, setSplashHeight] = useState(height);

  useEffect(() => {
    // Show login after 2 seconds
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const meta = Image.resolveAssetSource(splashSource);
      if (meta?.width && meta?.height) {
        const computedHeight = (width * meta.height) / meta.width;
        setSplashHeight(computedHeight);
      }
    } catch {
      // ignore asset resolution issues; fallback height remains
    }
  }, [splashSource]);

  useEffect(() => {
    // Redirect to onboarding when user is logged in
    if (user && !loading) {
      const redirectTimer = setTimeout(() => {
        router.replace('/onboarding');
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading]);

  // no get started button; splash auto-transitions

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        console.error('Login failed:', result.error);
        Alert.alert(t('error'), t('loginFailed'));
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert(t('error'), t('loginFailed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSkipToOnboarding = () => {
    router.replace('/onboarding');
  };

  if (!showLogin) {
    return (
      <View style={[styles.container, { backgroundColor: '#e3923d' }]}>
        {/* Splash Image - Fit Width */}
        <View style={styles.splashWrapper}>
          <Image
            source={splashSource}
            style={[styles.splashImage, { height: splashHeight }]}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.loginContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t('welcomeToCurriJobs')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t('loginToContinue')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text.primary,
              borderColor: theme.colors.border
            }]}
            placeholder={t('email')}
            placeholderTextColor={theme.colors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text.primary,
              borderColor: theme.colors.border
            }]}
            placeholder={t('password')}
            placeholderTextColor={theme.colors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#1E3A8A' }]}
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            <Text style={styles.loginButtonText}>
              {isLoggingIn ? t('loggingIn') : t('login')}
            </Text>
          </TouchableOpacity>

          {/* Removed skip to app link as login is required */}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashImage: {
    width: width,
    alignSelf: 'center',
  },
  splashWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
