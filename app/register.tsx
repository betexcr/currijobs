import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs for keyboard navigation
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  
  const { signUp } = useAuth();
  const { t } = useLocalization();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
            {t('joinCurriJobs') || 'Únete a CurriJobs!'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {t('createAccountToGetStarted') || 'Crea tu cuenta para comenzar'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Full Name Input */}
          <TextInput
            style={styles.input}
            placeholder={t('fullName') || 'Full Name'}
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder={t('email') || 'Email'}
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            ref={emailInputRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder={t('password') || 'Password'}
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            ref={passwordInputRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          />

          {/* Confirm Password Input */}
          <TextInput
            style={styles.input}
            placeholder={t('confirmPassword') || 'Confirm Password'}
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            ref={confirmPasswordInputRef}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? (t('creatingAccount') || 'Creando cuenta...') : (t('createAccount') || 'Crear cuenta')}
            </Text>
          </TouchableOpacity>

          {/* Back to Login Button */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backToLoginButtonText}>
              {t('alreadyHaveAccount') || '¿Ya tienes una cuenta?'} <Text style={styles.backToLoginHighlight}>{t('signIn') || 'Iniciar sesión'}</Text>
            </Text>
          </TouchableOpacity>
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
  registerButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToLoginButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backToLoginHighlight: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});
