import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchTasksByUser, createTask } from '../lib/database';
import { Task, CreateTaskData } from '../lib/types';
import { validateCreateTask } from '../lib/schemas';
import { getCategoryIcon, getCategoryColor, getCategoryLabel } from '../lib/utils';

const { width, height } = Dimensions.get('window');

export default function MyTasksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const mapRef = useRef<MapView>(null);
  
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskLocation, setNewTaskLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Form state for creating new task
  const [newTask, setNewTask] = useState<Partial<CreateTaskData>>({
    title: '',
    description: '',
    category: 'cleaning',
    reward: 0,
    time_estimate: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const tasks = await fetchTasksByUser(user?.id || '');
      setMyTasks(tasks);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      Alert.alert(t('error'), t('errorFetchingTasks'));
    } finally {
      setLoading(false);
    }
  };

  const handleMapLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewTaskLocation({ latitude, longitude });
    setShowCreateModal(true);
  };

  const handleOpenCreate = () => {
    setShowCreateModal(true);
  };

  const handleCreateTask = async () => {
    try {
      if (!newTaskLocation || !user) return;

      // Validate the task data
      const taskData: CreateTaskData = {
        title: newTask.title || '',
        description: newTask.description || '',
        category: newTask.category || 'cleaning',
        reward: Number(newTask.reward) || 0,
        time_estimate: newTask.time_estimate || '',
        location: newTask.location || '',
        latitude: newTaskLocation.latitude,
        longitude: newTaskLocation.longitude,
      };

      // Validate with Zod
      const validatedData = validateCreateTask(taskData);

      // Create the task
      const createdTask = await createTask(validatedData, user.id);
      
      if (createdTask) {
        Alert.alert(t('success'), t('taskCreatedSuccessfully'));
        setShowCreateModal(false);
        setNewTask({
          title: '',
          description: '',
          category: 'cleaning',
          reward: 0,
          time_estimate: '',
          location: '',
        });
        setNewTaskLocation(null);
        fetchMyTasks(); // Refresh the list
      } else {
        Alert.alert(t('error'), t('errorCreatingTask'));
      }
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        const issues = error.issues as Array<{ path: (string|number)[]; message: string }>;
        const byField: Record<string, string[]> = {};
        issues.forEach((iss) => {
          const key = iss.path.join('.') || 'form';
          byField[key] = byField[key] ? [...byField[key], iss.message] : [iss.message];
        });
        const first = Object.entries(byField)[0];
        const msg = first ? `${first[0]}: ${first[1].join('\n')}` : t('errorCreatingTask');
        Alert.alert(t('validationError') || 'Validation Error', msg);
      } else {
        console.error('Error creating task:', error);
        Alert.alert(t('error'), t('errorCreatingTask'));
      }
    }
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskDetails = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleSubmitOffer = (task: Task) => {
    router.push(`/task/${task.id}?action=offer`);
  };

  const categories = [
    'cleaning', 'plumbing', 'electrician', 'carpentry', 'painting',
    'appliance_repair', 'laundry_ironing', 'cooking', 'grocery_shopping',
    'pet_care', 'gardening', 'moving_help', 'trash_removal', 'window_washing',
    'babysitting', 'elderly_care', 'tutoring', 'delivery_errands', 'tech_support', 'photography'
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          {t('loading')}...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {t('myCreatedTasks')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          {t('longPressMapToCreate')}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
          <Text style={styles.addButtonText}>+ {t('createTask')}</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 9.923035,
          longitude: -84.043457,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onLongPress={handleMapLongPress}
      >
        {myTasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{
              latitude: task.latitude || 0,
              longitude: task.longitude || 0,
            }}
            onPress={() => handleTaskPress(task)}
          >
            <View style={[styles.customMarker, { backgroundColor: getCategoryColor(task.category) }]}>
              <Text style={styles.markerEmoji}>{getCategoryIcon(task.category)}</Text>
            </View>
            <Callout>
              <View style={[styles.calloutContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.calloutTitle, { color: theme.colors.text.primary }]}>
                  {task.title}
                </Text>
                <Text style={[styles.calloutReward, { color: theme.colors.primary?.blue }]}>
                  ₡{task.reward?.toLocaleString()}
                </Text>
                <Text style={[styles.calloutCategory, { color: theme.colors.text.secondary }]}>
                  {getCategoryLabel(task.category as any, t)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Task List */}
      <View style={[styles.taskList, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.taskListTitle, { color: theme.colors.text.primary }]}>
          {t('myTasks')} ({myTasks.length})
        </Text>
        <ScrollView style={styles.taskScrollView}>
          {myTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskItem, { backgroundColor: theme.colors.background }]}
              onPress={() => handleTaskDetails(task)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskCategory}>
                  <Text style={styles.taskCategoryIcon}>{getCategoryIcon(task.category)}</Text>
                  <Text style={[styles.taskCategoryText, { color: getCategoryColor(task.category) }]}>
                  {getCategoryLabel(task.category as any, t)}
                  </Text>
                </View>
                <Text style={[styles.taskReward, { color: theme.colors.primary?.blue }]}>
                  ₡{task.reward?.toLocaleString()}
                </Text>
              </View>
              <Text style={[styles.taskTitle, { color: theme.colors.text.primary }]}>
                {task.title}
              </Text>
              <Text style={[styles.taskDescription, { color: theme.colors.text.secondary }]}>
                {task.description}
              </Text>
              <View style={styles.taskFooter}>
                <Text style={[styles.taskLocation, { color: theme.colors.text.secondary }]}>
                  📍 {task.location}
                </Text>
                <Text style={[styles.taskStatus, { color: theme.colors.text.secondary }]}>
                  {task.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create Task Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {t('createNewTask')}
            </Text>
            
            <ScrollView style={styles.modalScrollView}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }]}
                placeholder={t('taskTitle')}
                placeholderTextColor={theme.colors.text.secondary}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
              
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }]}
                placeholder={t('taskDescription')}
                placeholderTextColor={theme.colors.text.secondary}
                value={newTask.description}
                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                multiline
                numberOfLines={3}
              />
              
              <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}> 
                {t('category')}
              </Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryPill,
                      { borderColor: theme.colors.border },
                      newTask.category === category && { backgroundColor: getCategoryColor(category), borderColor: getCategoryColor(category) }
                    ]}
                    onPress={() => setNewTask({ ...newTask, category })}
                  >
                    <Text style={[styles.categoryPillText, { color: newTask.category === category ? 'white' : theme.colors.text.primary }]}>
                      {getCategoryIcon(category)} {getCategoryLabel(category as any, t)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }]}
                placeholder={t('reward')}
                placeholderTextColor={theme.colors.text.secondary}
                value={newTask.reward?.toString()}
                onChangeText={(text) => setNewTask({ ...newTask, reward: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }]}
                placeholder={t('timeEstimate')}
                placeholderTextColor={theme.colors.text.secondary}
                value={newTask.time_estimate}
                onChangeText={(text) => setNewTask({ ...newTask, time_estimate: text })}
              />
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }]}
                placeholder={t('location')}
                placeholderTextColor={theme.colors.text.secondary}
                value={newTask.location}
                onChangeText={(text) => setNewTask({ ...newTask, location: text })}
                onFocus={() => setShowLocationPicker(true)}
              />
              {showLocationPicker && (
                <View style={{ height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 }}>
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: newTaskLocation?.latitude || 9.923035,
                      longitude: newTaskLocation?.longitude || -84.043457,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onLongPress={(e) => setNewTaskLocation(e.nativeEvent.coordinate)}
                  >
                    {newTaskLocation && (
                      <Marker
                        coordinate={newTaskLocation}
                        draggable
                        onDragEnd={(e) => setNewTaskLocation(e.nativeEvent.coordinate)}
                      />
                    )}
                  </MapView>
                  <Text style={{ textAlign: 'center', padding: 8, color: theme.colors.text.secondary }}>
                    {t('longPressToDropPin')}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>{t('createTask')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerEmoji: {
    fontSize: 20,
  },
  calloutContainer: {
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutReward: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  calloutCategory: {
    fontSize: 10,
    marginTop: 2,
  },
  taskList: {
    height: height * 0.4,
    padding: 16,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskScrollView: {
    flex: 1,
  },
  taskItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCategoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  taskCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskReward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskLocation: {
    fontSize: 12,
  },
  taskStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: height * 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  createButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});


