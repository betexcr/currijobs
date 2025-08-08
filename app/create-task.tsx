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
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { taskService } from '../lib/database';
import ChambitoMascot from '../components/ChambitoMascot';

const { width, height } = Dimensions.get('window');

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [reward, setReward] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Refs for native keyboard navigation
  const descriptionInputRef = useRef<TextInput>(null);
  const categoryInputRef = useRef<TextInput>(null);
  const rewardInputRef = useRef<TextInput>(null);
  const timeEstimateInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  
  const { user } = useAuth();
  const { theme } = useTheme();
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
    if (!title || !description || !category || !reward || !timeEstimate || !coords) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    Alert.alert('Success', 'Task created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
          <ChambitoMascot mood="working" size="medium" />
          <Text style={styles.welcomeTitle}>Create a New Task</Text>
          <Text style={styles.welcomeSubtitle}>Help others and earn money</Text>
        </View>

        {/* Task Form */}
        <View style={[styles.formContainer, { backgroundColor: '#FFFFFF' }]}>
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
              onSubmitEditing={() => categoryInputRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="sentences"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              ref={categoryInputRef}
              style={[styles.input, { borderColor: '#E5E7EB' }]}
              placeholder="e.g., Cleaning, Handyman, Delivery"
              placeholderTextColor="#9CA3AF"
              value={category}
              onChangeText={setCategory}
              returnKeyType="next"
              onSubmitEditing={() => rewardInputRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="words"
              autoComplete="off"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reward (₡)</Text>
            <TextInput
              ref={rewardInputRef}
              style={[styles.input, { borderColor: '#E5E7EB' }]}
              placeholder="15000"
              placeholderTextColor="#9CA3AF"
              value={reward}
              onChangeText={setReward}
              returnKeyType="next"
              onSubmitEditing={() => timeEstimateInputRef.current?.focus()}
              blurOnSubmit={false}
              keyboardType="numeric"
              autoComplete="off"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time Estimate</Text>
            <TextInput
              ref={timeEstimateInputRef}
              style={[styles.input, { borderColor: '#E5E7EB' }]}
              placeholder="e.g., 2 hours, 30 minutes"
              placeholderTextColor="#9CA3AF"
              value={timeEstimate}
              onChangeText={setTimeEstimate}
              returnKeyType="next"
              onSubmitEditing={() => locationInputRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="words"
              autoComplete="off"
            />
          </View>

          {/* Location Preview & Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.mapPreviewContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.mapPreview}
                initialRegion={{
                  latitude: (coords?.latitude ?? 9.9281),
                  longitude: (coords?.longitude ?? -84.0907),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onLongPress={(e) => setCoords(e.nativeEvent.coordinate)}
              >
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
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
