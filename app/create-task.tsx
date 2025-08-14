import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
// import { useTheme } from '../contexts/ThemeContext';
// @ts-expect-error - type defs may be missing in RN env
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createTask } from '../lib/database';
import { validateCreateTask } from '../lib/schemas';
// import ChambitoMascot from '../components/ChambitoMascot';
import { isAmazonAndroid } from '../lib/utils';


export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cleaning');
  const [reward, setReward] = useState('');
  // const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerStep, setPickerStep] = useState<'date' | 'time'>('date');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading] = useState(false);
  
  // Refs for native keyboard navigation
  const descriptionInputRef = useRef<TextInput>(null);
  const rewardInputRef = useRef<TextInput>(null);
  
  const { user } = useAuth();
  // const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lon?: string }>();

  useEffect(() => {
    // Prefill coordinates from map long-press
    const lat = params.lat ? parseFloat(params.lat) : undefined;
    const lon = params.lon ? parseFloat(params.lon) : undefined;
    if (typeof lat === 'number' && !Number.isNaN(lat) && typeof lon === 'number' && !Number.isNaN(lon)) {
      setCoords({ latitude: lat, longitude: lon });
    }
  }, [params.lat, params.lon]);

  const handleCreateTask = async () => {
    try {
      if (!title || !description || !category || !reward || !coords) {
        Alert.alert('Error', 'Please complete all required fields');
        return;
      }
      if (!user?.id) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      const taskData: {
        title: string;
        description: string;
        category: string;
        reward: number;
        location: string;
        latitude: number;
        longitude: number;
        deadline?: string;
      } = {
        title,
        description,
        category: category as any,
        reward: Number(reward) || 0,
        location: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        deadline: deadline ? deadline.toISOString() : undefined,
      } as any;

      const validated = validateCreateTask(taskData as unknown as {
        title: string;
        description: string;
        category: any;
        reward: number;
        location: string;
        latitude: number;
        longitude: number;
        deadline?: string;
      });
      const created = await createTask(validated as unknown as any, user.id);
      if (created) {
        Alert.alert('Success', 'Task created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Could not create task');
      }
    } catch (e) {
      // istanbul ignore next
      (globalThis as any).console?.error?.('Create task failed', e);
      Alert.alert('Error', 'Could not create task');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header with time - Like in the image */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>5:41</Text>
          <View style={styles.signalIcons}>
            <Text style={styles.signalIcon}>📶</Text>
            <Text style={styles.batteryIcon}>🔋</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Create Task</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Image
            source={require('../assets/create-new-task.png')}
            style={styles.createImage}
            resizeMode="contain"
          />
          <Text style={styles.welcomeTitle}>Create a New Task</Text>
          <Text style={styles.welcomeSubtitle}>Help others and earn money</Text>
        </View>

        {/* Task Form */}
        <View style={[styles.formContainer, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.sectionTitle}>🛠️ Información Básica</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task Title</Text>
            <TextInput
              style={[styles.input, { borderColor: '#E5E7EB' }]}
              placeholder="What needs to be done?"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onSubmitEditing={() => descriptionInputRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="words"
              autoComplete="off"
              textContentType="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              ref={descriptionInputRef}
              style={[styles.input, styles.textArea, { borderColor: '#E5E7EB' }]}
              placeholder="Describe the task in detail..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              returnKeyType="next"
              onSubmitEditing={() => rewardInputRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="sentences"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.sectionTitle}>🪛 Categoría</Text>
          <View style={styles.categoryGrid}>
            {[
              { key: 'cleaning', label: '🧹 Limpieza' },
              { key: 'plumbing', label: '🔧 Plomería' },
              { key: 'electricity', label: '⚡ Electricidad' },
              { key: 'carpentry', label: '🔨 Carpintería' },
              { key: 'painting', label: '🪛 Pintura' },
              { key: 'appliance_repair', label: '🖥️ Reparación Electrodóm.' },
              { key: 'laundry_ironing', label: '👕 Lavandería y Planchado' },
              { key: 'cooking', label: '🏠 Cocina' },
              { key: 'pet_care', label: '🪴 Cuidado de Mascotas' },
              { key: 'gardening', label: '🌿 Jardinería' },
              { key: 'photography', label: '📷 Fotografía' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryPill,
                  category === cat.key && { backgroundColor: '#5B21B6', borderColor: '#5B21B6' },
                ]}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: category === cat.key ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>💰 Recompensa</Text>
          <View style={styles.inputGroup}>
            <View style={styles.rewardRow}>
              <View style={styles.currencyBox}><Text style={styles.currencyText}>₡</Text></View>
              <TextInput
                ref={rewardInputRef}
                style={[styles.input, { borderColor: '#E5E7EB', flex: 1 }]}
                placeholder="15000"
                placeholderTextColor="#9CA3AF"
                value={reward}
                onChangeText={setReward}
                blurOnSubmit={false}
                keyboardType="numeric"
                autoComplete="off"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>⏰ Fecha exacta de finalización (Opcional)</Text>
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.input, { borderColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => {
                setPickerStep('date');
                setPickerVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: deadline ? '#111827' : '#9CA3AF' }}>
                {deadline ? formatDateTime(deadline) : 'Seleccionar fecha y hora'}
              </Text>
              {deadline ? (
                <TouchableOpacity onPress={() => { setDeadline(null); }}>
                  <Text style={{ color: '#6B7280' }}>✕</Text>
                </TouchableOpacity>
              ) : (
                <Text>📅</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.mapHint}>Se agenda al mediodía si no indicas hora.</Text>
          </View>

          {/* Location Preview & Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ubicación</Text>
            <View style={styles.mapPreviewContainer}>
              <MapView
                provider={(isAmazonAndroid() || ((Platform.OS === 'android') && (Constants as any)?.appOwnership === 'expo')) ? undefined : PROVIDER_GOOGLE}
                mapType={(isAmazonAndroid() || ((Platform.OS === 'android') && (Constants as any)?.appOwnership === 'expo')) ? 'none' : 'standard'}
                style={styles.mapPreview}
                initialRegion={{
                  latitude: (coords?.latitude ?? 9.9281),
                  longitude: (coords?.longitude ?? -84.0907),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onLongPress={(e) => setCoords(e.nativeEvent.coordinate)}
              >
                {(isAmazonAndroid() || ((Platform.OS === 'android') && (Constants as any)?.appOwnership === 'expo')) && (
                  <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    tileSize={256}
                  />
                )}
                {coords && (
                  <Marker coordinate={coords} />
                )}
              </MapView>
              <Text style={styles.mapHint}>Long-press the map to set or replace the location</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: '#FF6B35' }]}
            onPress={handleCreateTask}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating Task...' : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Date & Time Picker Modals */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={pickerStep}
        date={deadline ?? new Date()}
        onConfirm={(picked: Date) => {
          if (pickerStep === 'date') {
            // hold date and ask for time next
            const withDate = new Date(picked);
            if (!deadline) setDeadline(withDate);
            else setDeadline(new Date(withDate));
            setPickerStep('time');
          } else {
            const base = deadline ?? new Date();
            const merged = new Date(base);
            merged.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
            setDeadline(merged);
            setPickerVisible(false);
            setPickerStep('date');
          }
        }}
        onCancel={() => {
          if (pickerStep === 'time') {
            // go back to date if cancelling time
            setPickerStep('date');
          }
          setPickerVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signalIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  batteryIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  createImage: {
    width: 160,
    height: 160,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E3A8A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mapPreviewContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPreview: {
    width: '100%',
    height: 180,
  },
  mapHint: {
    padding: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    backgroundColor: '#FAFAFA',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateTime(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
