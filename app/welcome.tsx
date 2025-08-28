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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [splashTimerComplete, setSplashTimerComplete] = useState(false);
  const [splashStarted, setSplashStarted] = useState(false);
  // User input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const splashSource = require('../assets/splash.png');
  const [splashHeight, setSplashHeight] = useState(height);

  useEffect(() => {
    // Start splash screen immediately
    setSplashStarted(true);
  }, []);

  useEffect(() => {
    // Start 3-second timer only after image is loaded
    if (imageLoaded && splashStarted) {
      const timer = setTimeout(() => {
        setSplashTimerComplete(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [imageLoaded, splashStarted]);

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

  // Show splash screen when image is loaded and timer is active
  const shouldShowSplash = splashStarted && imageLoaded && !splashTimerComplete;
  const shouldShowLogin = splashTimerComplete;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      console.log('Attempting login with:', email);
      const result = await signIn(email, password);
      if (result.error) {
        console.error('Login failed:', result.error);
        Alert.alert(t('error'), t('loginFailed'));
      } else {
        console.log('Login successful for user:', result.data?.user?.email);
        Alert.alert(t('success'), 'Login successful!');
        // Navigation will be handled by the AuthContext
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

  // Show splash screen only when image is loaded and timer is active
  if (shouldShowSplash && imageLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: '#f8d384' }]}>
        {/* Splash Image - Fit Width */}
        <View style={styles.splashWrapper}>
          <Image
            source={splashSource}
            style={[styles.splashImage, { height: splashHeight }]}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
          />
        </View>
      </View>
    );
  }

  // Show loading state while splash is not started yet or image is loading
  if (!splashStarted || !imageLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.splashWrapper}>
          <Image
            source={splashSource}
            style={[styles.splashImage, { height: splashHeight }]}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Image */}
      <View style={styles.headerSection}>
        <Image 
          source={require('../assets/login.png')} 
          style={styles.headerImage} 
          resizeMode="cover"
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
                {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {t('welcomeToCurriJobs') || 'Bienvenido a CurriJobs'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {t('connectingWorkersAndClients') || 'Conectando trabajadores y clientes de confianza.'}
          </Text>
 
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder={t('email') || 'Email'}
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder={t('password') || 'Password'}
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoggingIn}
          >
            <Text style={styles.loginButtonText}>
              {isLoggingIn ? (t('loggingIn') || 'Iniciando sesión...') : (t('login') || 'Iniciar sesión')}
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => router.push('/register')}
            disabled={isLoggingIn}
          >
            <Text style={styles.createAccountButtonText}>
              {t('createAccount') || 'Crear cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>{t('or') || 'Or'}</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Social Buttons */}
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>
              {t('continueWithGoogle') || 'Continuar con Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>
              {t('continueWithApple') || 'Continuar con Apple'}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>
                {t('forgotPassword') || '¿Olvidaste tu contraseña?'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              {t('termsAndPrivacy') || 'Al registrarte, aceptas nuestras Términos y Política de privacidad'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  loadingPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
  },
  headerSection: {
    height: height * 0.35,
    backgroundColor: '#E3F2FD',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountButton: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createAccountButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  termsText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
