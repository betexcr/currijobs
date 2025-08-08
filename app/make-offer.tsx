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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { fetchTaskById, createOffer } from '../lib/database';
import type { Task } from '../lib/types';
import ChambitoMascot from '../components/ChambitoMascot';

export default function MakeOfferScreen() {
  const [task, setTask] = useState<Task | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Refs for keyboard navigation
  const amountInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);
  
  const { taskId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const DEFAULT_COORDS = { latitude: 9.9281, longitude: -84.0907 };

  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
      return;
    }
    fetchTaskDetails();
  }, [taskId, user]);

  const fetchTaskDetails = async () => {
    try {
      const t = await fetchTaskById(taskId as string);
      if (!t) {
        Alert.alert('Error', 'Failed to fetch task details');
        return;
      }
      setTask(t);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async () => {
    if (!task || !user) {
      Alert.alert('Error', 'Missing task or user information');
      return;
    }

    if (!amount || !message) {
      Alert.alert('Error', 'Please fill in amount and message');
      return;
    }

    const offerAmount = parseInt(amount);
    if (isNaN(offerAmount) || offerAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await createOffer({ task_id: taskId as string, user_id: user.id, proposed_reward: offerAmount, message }, user.id);

      Alert.alert(
        'Offer Submitted! 🎉',
        'Your offer has been sent to the task owner. They will review it and get back to you soon!',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ChambitoMascot mood="thinking" size="large" />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ChambitoMascot mood="error" size="large" />
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>5:41</Text>
          <View style={styles.signalIcons}>
            <Text style={styles.signalIcon}>📶</Text>
            <Text style={styles.batteryIcon}>🔋</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Submit Offer</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Details */}
        <View style={[styles.taskCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.taskCardTitle}>{task.title}</Text>
          <Text style={styles.taskCardReward}>₡{task.reward?.toLocaleString()}</Text>
          <Text style={styles.taskCardLocation}>{task.location}</Text>
          <Text style={styles.taskCardDescription}>{task.description}</Text>
          {/* Task Location Map */}
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              pointerEvents="none"
              initialRegion={{
                latitude: (task.latitude as number) || DEFAULT_COORDS.latitude,
                longitude: (task.longitude as number) || DEFAULT_COORDS.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: (task.latitude as number) || DEFAULT_COORDS.latitude,
                  longitude: (task.longitude as number) || DEFAULT_COORDS.longitude,
                }}
                title={task.title}
                description={task.location}
              />
            </MapView>
          </View>
        </View>

        {/* Offer Form */}
        <View style={[styles.offerForm, { backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.formTitle}>Your Offer</Text>
          
          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Price (₡)</Text>
            <TextInput
              ref={amountInputRef}
              style={[styles.input, { borderColor: '#E5E7EB' }]}
              placeholder="15000"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => messageInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Why should they choose you?</Text>
            <TextInput
              ref={messageInputRef}
              style={[styles.input, styles.textArea, { borderColor: '#E5E7EB' }]}
              placeholder="Tell them about your experience, skills, and why you're perfect for this job..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              returnKeyType="done"
              onSubmitEditing={handleSubmitOffer}
              blurOnSubmit={true}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#FF6B35' }]}
            onPress={handleSubmitOffer}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting Offer...' : 'Submit Offer'}
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
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  taskCardReward: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  taskCardLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  offerForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
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
  inputSubtext: {
    fontSize: 12,
    color: '#6B7280',
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
    minHeight: 120,
    paddingTop: 16,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  imageUploadText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  imagePreview: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#F44336',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
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
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});
