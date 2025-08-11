import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import ThemeCustomizer from '../components/ThemeCustomizer';
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import { updateUserProfile } from '../lib/database';
import { isAmazonAndroid } from '../lib/utils';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setColorblind, toggleMode, setCustomTheme } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [homeAddress, setHomeAddress] = useState<string>((user as any)?.home_address || '');
  const [homeLat, setHomeLat] = useState<number | null>((user as any)?.home_latitude ?? null);
  const [homeLon, setHomeLon] = useState<number | null>((user as any)?.home_longitude ?? null);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const languageOptions = [
    { code: 'es-CR', name: 'Español', flag: '🇨🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const colorblindOptions = [
    { type: 'normal', name: 'Normal Vision', description: 'Standard colors' },
    { type: 'protanopia', name: 'Protanopia', description: 'Red-green colorblindness' },
    { type: 'deuteranopia', name: 'Deuteranopia', description: 'Red-green colorblindness' },
    { type: 'tritanopia', name: 'Tritanopia', description: 'Blue-yellow colorblindness' },
  ];

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {t('settings')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Mode */}
        {renderSection(t('themeMode'), (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={theme.mode === 'light' ? 'sunny' : 'moon'} 
                size={20} 
                color={theme.colors.text.primary} 
              />
              <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>
                {theme.mode === 'light' ? t('lightMode') : t('darkMode')}
              </Text>
            </View>
            <Switch
              value={theme.mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary.blue }}
              thumbColor="white"
            />
          </View>
        ))}

        {/* Language */}
        {renderSection(t('language'), (
          <View style={styles.optionsContainer}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.code}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  language === option.code ? { backgroundColor: theme.colors.primary.blue } : null
                ]}
                onPress={() => setLanguage(option.code as 'es-CR' | 'en' | 'zh')}
              >
                <Text style={styles.optionFlag}>{option.flag}</Text>
                <Text style={[
                  styles.optionText,
                  { color: language === option.code ? 'white' : theme.colors.text.primary }
                ]}>
                  {option.name}
                </Text>
                {language === option.code && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Colorblind Support */}
        {renderSection(t('colorblindSupport'), (
          <View style={styles.optionsContainer}>
            {colorblindOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  theme.colorblind === (option.type as 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia') ? { backgroundColor: theme.colors.primary.blue } : null
                ]}
                onPress={() => setColorblind(option.type as 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
              >
                <View style={styles.optionInfo}>
                  <Text style={[
                    styles.optionText,
                    { color: theme.colorblind === option.type ? 'white' : theme.colors.text.primary }
                  ]}>
                    {option.type === 'normal' ? t('colorblindNormal') : option.type === 'protanopia' ? t('colorblindProtanopia') : option.type === 'deuteranopia' ? t('colorblindDeuteranopia') : t('colorblindTritanopia')}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    { color: theme.colorblind === option.type ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }
                  ]}>
                    {t('colorblindStandardColors')}
                  </Text>
                </View>
                {theme.colorblind === option.type && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Custom Theme Option */}
        {renderSection(t('customTheme'), (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  theme.customTheme === 'custom' ? { backgroundColor: theme.colors.primary.blue } : null
              ]}
              onPress={() => setShowThemeCustomizer(true)}
            >
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionText,
                  { color: theme.customTheme === 'custom' ? 'white' : theme.colors.text.primary }
                ]}>
                  {t('customColorsLabel')}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  { color: theme.customTheme === 'custom' ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }
                ]}>
                  {t('chooseCustomColors')}
                </Text>
              </View>
              {theme.customTheme === 'custom' && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                  { backgroundColor: theme.colors.surface },
                  theme.customTheme === 'default' ? { backgroundColor: theme.colors.primary.blue } : null
              ]}
              onPress={() => setCustomTheme('default')}
            >
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionText,
                  { color: theme.customTheme === 'default' ? 'white' : theme.colors.text.primary }
                ]}>
                  {t('defaultThemeLabel')}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  { color: theme.customTheme === 'default' ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary }
                ]}>
                  {t('useSystemPalette')}
                </Text>
              </View>
              {theme.customTheme === 'default' && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Theme Customizer */}
        {renderSection(t('customizeTheme'), (
          <TouchableOpacity
            style={[styles.customizeButton, { backgroundColor: theme.colors.primary.blue }]}
            onPress={() => setShowThemeCustomizer(true)}
          >
            <Ionicons name="color-palette" size={20} color="white" />
            <Text style={[styles.customizeButtonText, { color: 'white' }]}>
              {t('openThemeCustomizer')}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Home Address */}
        {renderSection(t('location'), (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{t('address')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary, borderColor: theme.colors.border }]}
              placeholder={t('address')}
              placeholderTextColor={theme.colors.text.secondary}
              value={homeAddress}
              onChangeText={setHomeAddress}
            />
            <Text style={{ color: theme.colors.text.secondary }}>{t('yourLocation')}</Text>
            <View style={{ height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
              <MapView
                provider={isAmazonAndroid() ? undefined : PROVIDER_GOOGLE}
                mapType={isAmazonAndroid() ? 'none' : 'standard'}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: homeLat ?? 9.923035,
                  longitude: homeLon ?? -84.043457,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onLongPress={(e) => {
                  setHomeLat(e.nativeEvent.coordinate.latitude);
                  setHomeLon(e.nativeEvent.coordinate.longitude);
                }}
              >
                {isAmazonAndroid() && (
                  <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    tileSize={256}
                  />
                )}
                {homeLat != null && homeLon != null && (
                  <Marker
                    coordinate={{ latitude: homeLat, longitude: homeLon }}
                    draggable
                    onDragEnd={(e) => {
                      setHomeLat(e.nativeEvent.coordinate.latitude);
                      setHomeLon(e.nativeEvent.coordinate.longitude);
                    }}
                  />
                )}
              </MapView>
              <Text style={{ textAlign: 'center', padding: 8, color: theme.colors.text.secondary }}>{t('longPressToDropPin') || 'Long press to drop/move the pin'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.customizeButton, { backgroundColor: theme.colors.primary.blue }]}
              onPress={async () => {
                if (!user) return;
                const updates: any = {
                  home_address: homeAddress,
                  home_latitude: homeLat,
                  home_longitude: homeLon,
                };
                const saved = await updateUserProfile(user.id, updates);
                if (!saved) Alert.alert('Error', 'Could not save home address');
                else Alert.alert(t('success'), t('settingsSavedSuccessfully'));
              }}
            >
              <Text style={[styles.customizeButtonText, { color: 'white' }]}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Account */}
        {renderSection(t('account'), (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="person" size={20} color={theme.colors.text.primary} />
              <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>
                {user?.email || 'User'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#EF4444' }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={[styles.signOutText, { color: 'white' }]}>
            {t('logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Customizer Modal */}
      {showThemeCustomizer && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                Theme Customizer
              </Text>
              <TouchableOpacity onPress={() => setShowThemeCustomizer(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ThemeCustomizer onClose={() => setShowThemeCustomizer(false)} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  customizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
