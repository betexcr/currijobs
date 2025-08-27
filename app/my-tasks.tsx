import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, UrlTile } from 'react-native-maps';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { shouldUseOSMTiles } from '../lib/utils';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchTasksByUser, fetchOfferCountsForTasks, fetchTasksAssignedToUser, fetchUserProfile, cancelAssignedTaskByWorker, cancelTaskByOwner } from '../lib/database';
import { Task } from '../lib/types';
import { getCategoryIcon, getCategoryColor, getCategoryLabel } from '../lib/utils';
import CreateTaskForm from '../components/CreateTaskForm';
import ChambitoMascot from '../components/ChambitoMascot';
const { height } = Dimensions.get('window');

// Import Chambito icon
const chambitoIcon = require('../assets/chambito.png');

export default function MyTasksScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLocalization();
  
  // Try to get auth context safely
  let authContext;
  let user;
  try {
    authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    console.log('Auth context not available yet, showing loading...');
    // If useAuth fails, show loading state
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('loading') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  // Show loading state if auth is still loading
  if (authContext?.loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('loading') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }
  const mapRef = useRef<MapView>(null);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  
  const NIGHT_MAP_STYLE: any[] = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
  ];
  
  // Spiderfy/grid expansion state for bundled markers
  const [expandedPositions, setExpandedPositions] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const openMyTasks = useMemo(() => myTasks.filter(t => t.status === 'open'), [myTasks]);
  
  // Filtered tasks for map based on active filter
  const filteredMapTasks = useMemo(() => {
    switch (activeFilter) {
      case 'all':
        return [...openMyTasks, ...assignedToMe];
      case 'in_progress':
        return [...openMyTasks.filter(t => t.status === 'in_progress'), ...assignedToMe];
      case 'completed':
        return [...openMyTasks.filter(t => t.status === 'completed'), ...assignedToMe.filter(t => t.status === 'completed')];
      default:
        return [...openMyTasks, ...assignedToMe];
    }
  }, [openMyTasks, assignedToMe, activeFilter]);
  
  // Assigned to me (worker side)
  const [assignedToMe, setAssignedToMe] = useState<Task[]>([]);
  const [offerCounts, setOfferCounts] = useState<Record<string, number>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cancelModalTask, setCancelModalTask] = useState<Task | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) { return; }
      await fetchMyTasks();
      const mineAssigned = await fetchTasksAssignedToUser(user.id);
      setAssignedToMe(mineAssigned);
    })();
  }, [user]);

  // Also refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        if (!user || !isActive) return;
        await fetchMyTasks();
        if (!isActive) return;
        const mineAssigned = await fetchTasksAssignedToUser(user.id);
        if (isActive) setAssignedToMe(mineAssigned);
      })();
      return () => { isActive = false; };
    }, [user?.id])
  );

  const fetchMyTasks = async () => {
    try {
      const uid = user?.id || '';
      if (!uid) { setMyTasks([]); setOfferCounts({}); return; }
      const tasks = await fetchTasksByUser(uid);
      setMyTasks(Array.isArray(tasks) ? tasks : []);
      const ids = (Array.isArray(tasks) ? tasks : []).map(t => String(t.id));
      try {
        const counts = await fetchOfferCountsForTasks(ids);
        setOfferCounts(counts);
      } catch {
        setOfferCounts({});
      }
      // Load assigned worker profiles for in-progress tasks created by me
      const inProgress = (Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'in_progress' && (t as any).assigned_to);
      const uniqueAssigned = Array.from(new Set(inProgress.map(t => String((t as any).assigned_to))));
      if (uniqueAssigned.length > 0) {
        const entries = await Promise.all(uniqueAssigned.map(async (uid) => {
          const p = await fetchUserProfile(uid);
          return [uid, p] as const;
        }));
        const map: Record<string, any> = {};
        entries.forEach(([uid, p]) => { map[uid] = p; });
        // Note: assignedProfiles state was removed as it's not used in the new design
      }
    } catch (error) {
      (globalThis as any).console?.error?.('Error fetching my tasks:', error);
      // non-blocking
    }
  };

  const handleMapLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewTaskLocation({ latitude, longitude });
    setShowCreateModal(true);
  };

  const handleTaskPress = (_task: Task) => {};

  const handleTaskDetails = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  // Helpers for expansion similar to main map
  const metersToLat = (meters: number) => meters / 111000; // approx
  const metersToLon = (meters: number, atLat: number) => meters / (111000 * Math.cos((atLat * Math.PI) / 180));
  const computeProximityKm = (): number => {
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const visibleKm = latDelta * 111;
    return Math.max(0.08, visibleKm * 0.05);
  };
  const computeStepMeters = (): number => {
    const desiredMarkerPx = 40;
    const desiredGapPx = 24;
    const desiredSpacingPx = desiredMarkerPx + desiredGapPx; // ~64px
    const screenHeight = Dimensions.get('window').height || 800;
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const metersPerPixel = (latDelta * 111000) / Math.max(1, screenHeight);
    return Math.max(35, metersPerPixel * desiredSpacingPx);
  };
  // Use golden-angle spiral to expand clustered tasks
  const generateSpiralOffsets = (count: number, atLat: number, stepMeters: number): Array<{ dLat: number; dLon: number }> => {
    const positions: Array<{ dLat: number; dLon: number }> = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const radialScale = stepMeters * 0.9;
    for (let i = 0; i < count; i++) {
      const k = i + 1;
      const radius = radialScale * Math.sqrt(k);
      const theta = k * goldenAngle;
      const offsetX = radius * Math.cos(theta);
      const offsetY = radius * Math.sin(theta);
      positions.push({ dLat: metersToLat(offsetY), dLon: metersToLon(offsetX, atLat) });
    }
    return positions;
  };

  const handleMarkerPressWithExpand = (task: Task) => {
    // Expand when bundled
    const proximityKm = computeProximityKm();
    const nearby = filteredMapTasks.filter(t => {
      if (!t.latitude || !t.longitude || !task.latitude || !task.longitude) return false;
      const dLat = (t.latitude - task.latitude) * Math.PI / 180;
      const dLon = (t.longitude - task.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos((task.latitude) * Math.PI/180) * Math.cos((t.latitude) * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distKm = 6371 * c;
      return distKm <= proximityKm;
    });
    if (nearby.length > 1 && !isExpanded) {
      const step = computeStepMeters();
      const offsets = generateSpiralOffsets(nearby.length, task.latitude || 0, step);
      const mapping: Record<string, { latitude: number; longitude: number }> = {};
      nearby.forEach((t, idx) => {
        const baseLat = t.latitude || 0;
        const baseLon = t.longitude || 0;
        const off = offsets[idx] || { dLat: 0, dLon: 0 };
        mapping[t.id] = { latitude: baseLat + off.dLat, longitude: baseLon + off.dLon };
      });
      setExpandedPositions(mapping);
      setIsExpanded(true);
      return;
    }
    // Fall back to original behavior
    handleTaskPress(task);
  };

  // Filter chips data
  const filterChips = [
    { key: 'all', label: t('all') || 'Todos' },
    { key: 'in_progress', label: t('inProgressStatus') || 'En progreso' },
    { key: 'completed', label: t('completedStatus') || 'Completados' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#FAFAFA' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={chambitoIcon} style={styles.chambitoIcon} />
          <Text style={styles.headerTitle}>
            {t('myTasks') || 'Mis tareas'}
          </Text>
          <TouchableOpacity style={styles.filterIcon}>
            <Text style={styles.filterIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Chips */}
        <View style={styles.filterChipsContainer}>
          {filterChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.filterChip,
                activeFilter === chip.key && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(chip.key as any)}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === chip.key && styles.filterChipTextActive
              ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} nestedScrollEnabled>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={shouldUseOSMTiles() ? undefined : (Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined)}
            mapType={shouldUseOSMTiles() ? 'none' : 'standard'}
            customMapStyle={shouldUseOSMTiles() ? undefined : (theme.mode === 'dark' ? NIGHT_MAP_STYLE : [])}
            initialRegion={{
              latitude: 9.923035,
              longitude: -84.043457,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onLongPress={handleMapLongPress}
            onPress={() => {
              if (isExpanded) {
                setIsExpanded(false);
                setExpandedPositions({});
              }
            }}
            onRegionChangeComplete={(region) => setCurrentRegion(region)}
          >
            {shouldUseOSMTiles() && (
              <UrlTile
                urlTemplate={theme.mode === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                maximumZ={19}
                tileSize={256}
              />
            )}
            {filteredMapTasks.map((task) => (
              <Marker
                key={task.id}
                coordinate={{
                  latitude: isExpanded && expandedPositions[task.id]?.latitude != null ? expandedPositions[task.id].latitude : (task.latitude || 0),
                  longitude: isExpanded && expandedPositions[task.id]?.longitude != null ? expandedPositions[task.id].longitude : (task.longitude || 0),
                }}
                onPress={() => handleMarkerPressWithExpand(task)}
              >
                <View style={[styles.customMarker, { backgroundColor: getCategoryColor(task.category) }]}>
                  <Text style={styles.markerEmoji}>{getCategoryIcon(task.category)}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Assigned to Me Section */}
        {assignedToMe.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Asignadas a mí</Text>
            </View>
            {assignedToMe.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <View style={styles.taskCategoryContainer}>
                    <Text style={styles.taskCategoryIcon}>{getCategoryIcon(task.category)}</Text>
                    <View style={[styles.categoryPill, { backgroundColor: '#E8F5E8' }]}>
                      <Text style={[styles.categoryPillText, { color: '#2E7D32' }]}>
                        {getCategoryLabel(task.category as any, t)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.taskReward}>€{task.reward?.toLocaleString()}</Text>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskCardFooter}>
                  <Text style={styles.taskLocation}>📍 {task.location}</Text>
                  <Text style={styles.taskStatus}>En progreso</Text>
                </View>
                <View style={styles.taskCardButtons}>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => handleTaskDetails(task)}
                  >
                    <Text style={styles.primaryButtonText}>Ver detalles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => setCancelModalTask(task)}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ChambitoMascot size="large" showMessage message="Todavía no tienes tareas activas. ¡Acepta una oferta para empezar!" />
          </View>
        )}

        {/* My Publications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderNeutral}>
            <Text style={styles.sectionTitleNeutral}>Mis publicaciones</Text>
          </View>
          {openMyTasks.length > 0 ? (
            openMyTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <View style={styles.taskCategoryContainer}>
                    <Text style={styles.taskCategoryIcon}>{getCategoryIcon(task.category)}</Text>
                    <View style={[styles.categoryPill, { backgroundColor: '#E8F5E8' }]}>
                      <Text style={[styles.categoryPillText, { color: '#2E7D32' }]}>
                        {getCategoryLabel(task.category as any, t)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.taskReward}>€{task.reward?.toLocaleString()}</Text>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskCardFooter}>
                  <Text style={styles.taskLocation}>📍 {task.location}</Text>
                  <Text style={styles.taskStatus}>Abierto</Text>
                </View>
                <View style={styles.taskCardButtons}>
                  <TouchableOpacity 
                    style={styles.offersButton}
                    onPress={() => {
                      router.push(`/make-offer?taskId=${task.id}&mode=manage`);
                    }}
                  >
                    <Text style={styles.offersButtonText}>
                      Ver ofertas ({offerCounts[task.id as string] || 0})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={async () => {
                      const ok = await cancelTaskByOwner(task.id as string, user!.id);
                      if (!ok) { Alert.alert(t('error') || 'Error', 'Could not cancel task'); return; }
                      await fetchMyTasks();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <ChambitoMascot size="large" showMessage message="Publica tu primera tarea aquí." />
            </View>
          )}
        </View>
      </ScrollView>

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
            <View style={{ flex: 1 }}>
            <CreateTaskForm
              initialCoords={newTaskLocation}
              onCancel={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                setNewTaskLocation(null);
                fetchMyTasks();
              }}
            />
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Reason Modal */}
      <Modal
        visible={!!cancelModalTask}
        animationType="slide"
        transparent
        onRequestClose={() => setCancelModalTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}> 
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Why are you cancelling?</Text>
            <ScrollView>
              <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, minHeight: 100 }}>
                <Text style={{ color: theme.colors.text.secondary }}>{cancelReason || 'Describe your reason...'}</Text>
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => { setCancelModalTask(null); setCancelReason(''); }}>
                <Text style={styles.modalCancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={async () => {
                  if (!cancelModalTask || !user) return;
                  const ok = await cancelAssignedTaskByWorker(cancelModalTask.id as string, user.id, cancelReason || '');
                  if (!ok) { Alert.alert(t('error') || 'Error', 'Could not cancel'); return; }
                  setCancelModalTask(null);
                  setCancelReason('');
                  await fetchMyTasks();
                }}
              >
                <Text style={styles.createButtonText}>Confirm Cancel</Text>
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chambitoIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  filterIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconText: {
    fontSize: 16,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: Math.round(height * 0.25),
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionHeaderNeutral: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitleNeutral: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCategoryIcon: {
    fontSize: 16,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskReward: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBC02D',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskCardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  offersButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  offersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    height: Math.round(height * 0.8),
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  createButton: {
    backgroundColor: '#1E3A8A',
  },
  modalCancelButtonText: {
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  createButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


