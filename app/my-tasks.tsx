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
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region, UrlTile } from 'react-native-maps';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// Date picker removed (not used in this view)
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { isAmazonAndroid } from '../lib/utils';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchTasksByUser, fetchOfferCountsForTasks, fetchTasksAssignedToUser, fetchUserProfile, cancelAssignedTaskByWorker, finishTaskByOwner, cancelTaskByOwner } from '../lib/database';
import { Task } from '../lib/types';
import { getCategoryIcon, getCategoryColor, getCategoryLabel } from '../lib/utils';
import CreateTaskForm from '../components/CreateTaskForm';
import UserProfileCard from '../components/UserProfileCard';
import QRCode from 'react-native-qrcode-svg';
import ChambitoMascot from '../components/ChambitoMascot';
const { height } = Dimensions.get('window');

export default function MyTasksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const mapRef = useRef<MapView>(null);
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
  const isExpoGoAndroid = Platform.OS === 'android' && (Constants as any)?.appOwnership === 'expo';

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const openMyTasks = useMemo(() => myTasks.filter(t => t.status === 'open'), [myTasks]);
  // Created by me and in progress
  const myCreatedInProgress = useMemo(() => myTasks.filter(t => t.status === 'in_progress'), [myTasks]);
  // Assigned to me (worker side)
  const [assignedToMe, setAssignedToMe] = useState<Task[]>([]);
  const [offerCounts, setOfferCounts] = useState<Record<string, number>>({});
  const [assignedProfiles, setAssignedProfiles] = useState<Record<string, any>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenList, setShowOpenList] = useState(true);
  const [showInProgressList, setShowInProgressList] = useState(true);
  const [showAssignedList, setShowAssignedList] = useState(true);
  const [cancelModalTask, setCancelModalTask] = useState<Task | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  // Removed old inline form state; using shared CreateTaskForm inside modal

  // Removed local category filter bar/state to revert to previous behavior

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
        setAssignedProfiles(map);
      } else {
        setAssignedProfiles({});
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

  // Removed inline create-task logic; CreateTaskForm handles this in the modal

  const handleTaskPress = (_task: Task) => {};

  const handleTaskDetails = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  // submit offer navigation unused here

  // categories list not used here

  // Do not block UI on loading; render content and show inline status instead

  // QRCode component imported directly

  // Helpers for expansion similar to main map
  const metersToLat = (meters: number) => meters / 111000; // approx
  const metersToLon = (meters: number, atLat: number) => meters / (111000 * Math.cos((atLat * Math.PI) / 180));
  const computeProximityKm = (): number => {
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const visibleKm = latDelta * 111;
    return Math.max(0.08, visibleKm * 0.05);
  };
  // (reuse existing implementations further below)
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
    const nearby = myTasks.filter(t => {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {t('myTasks')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
          {t('longPressMapToCreate')}
        </Text>
        {/* create button removed per request */}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} nestedScrollEnabled>
        {/* Queen loading overlay for initial load or refresh */}
        {!myTasks && (
          <View style={{ position: 'absolute', top: 100, left: 0, right: 0, alignItems: 'center', zIndex: 5 }}>
            <ChambitoMascot variant="queen" size="giant" showMessage message="Cargando..." />
          </View>
        )}
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={(isAmazonAndroid() || isExpoGoAndroid) ? undefined : (Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined)}
          mapType={(isAmazonAndroid() || isExpoGoAndroid) ? 'none' : 'standard'}
          customMapStyle={isAmazonAndroid() ? undefined : (theme.mode === 'dark' ? NIGHT_MAP_STYLE : [])}
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
          {(isAmazonAndroid() || isExpoGoAndroid) && (
            <UrlTile
              urlTemplate={theme.mode === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              maximumZ={19}
              tileSize={256}
            />
          )}
           {openMyTasks.map((task) => (
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
              {/* Remove native callout to mirror map view overlay-only behavior */}
            </Marker>
          ))}
        </MapView>

        {/* Category Filter Bar removed per revert */}

        {/* My Created Tasks - In Progress */}
        {myCreatedInProgress.length > 0 && (
          <View style={[styles.taskList, { backgroundColor: theme.colors.surface }]}> 
            <TouchableOpacity onPress={() => setShowInProgressList(v => !v)}>
              <Text style={[styles.taskListTitle, { color: theme.colors.text.primary }]}> 
                {t('currentTasksInProgress') || 'Current Tasks In Progress'} ({myCreatedInProgress.length}) {showInProgressList ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {showInProgressList && (
            <View>
              {myCreatedInProgress.map((task) => (
                <TouchableOpacity key={task.id} style={[styles.taskItem, { backgroundColor: theme.colors.background }]} onPress={() => handleTaskDetails(task)}> 
                  <View style={styles.taskHeader}>
                    <View style={styles.taskCategory}>
                      <Text style={styles.taskCategoryIcon}>{getCategoryIcon(task.category)}</Text>
                      <Text style={[styles.taskCategoryText, { color: getCategoryColor(task.category) }]}>
                        {getCategoryLabel(task.category as any, t)}
                      </Text>
                    </View>
                    <Text style={[styles.taskReward, { color: theme.colors.primary?.blue }]}>₡{task.reward?.toLocaleString()}</Text>
                  </View>
                  <Text style={[styles.taskTitle, { color: theme.colors.text.primary }]}>{task.title}</Text>
                  <Text style={[styles.taskDescription, { color: theme.colors.text.secondary }]}>{task.description}</Text>
                  {/* Assigned worker profile */}
                  {!!(task as any).assigned_to && assignedProfiles[String((task as any).assigned_to)] && (
                    <UserProfileCard
                      compact
                      user={{
                        id: String((task as any).assigned_to),
                        name: assignedProfiles[String((task as any).assigned_to)]?.full_name || 'User',
                        avatar: assignedProfiles[String((task as any).assigned_to)]?.avatar_url,
                        rating: assignedProfiles[String((task as any).assigned_to)]?.rating || 4.5,
                        total_reviews: assignedProfiles[String((task as any).assigned_to)]?.total_reviews || 0,
                        completed_tasks: assignedProfiles[String((task as any).assigned_to)]?.completed_tasks || 0,
                        total_earnings: assignedProfiles[String((task as any).assigned_to)]?.total_earnings || 0,
                        wallet_balance: assignedProfiles[String((task as any).assigned_to)]?.wallet_balance || 0,
                        member_since: assignedProfiles[String((task as any).assigned_to)]?.created_at || new Date().toISOString(),
                        location: assignedProfiles[String((task as any).assigned_to)]?.location,
                        verified: !!assignedProfiles[String((task as any).assigned_to)]?.is_verified,
                      }}
                    />
                  )}
                  <View style={styles.taskFooter}>
                    <Text style={[styles.taskLocation, { color: theme.colors.text.secondary }]}>📍 {task.location}</Text>
                    <Text style={[styles.taskStatus, { color: theme.colors.text.secondary }]}>Assigned</Text>
                  </View>
                  {QRCode && (
                    <View style={{ alignItems: 'center', marginTop: 12 }}>
                      <QRCode value={`currijobs://finish/${task.id}`} size={120} />
                      <Text style={{ marginTop: 6, color: theme.colors.text.secondary }}>Scan to finalize and get paid.</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            )}
          </View>
        )}

        {/* Tasks Assigned To Me (worker) */}
        {assignedToMe.length > 0 && (
          <View style={[styles.taskList, { backgroundColor: theme.colors.surface }]}> 
            <TouchableOpacity onPress={() => setShowAssignedList(v => !v)}>
              <Text style={[styles.taskListTitle, { color: theme.colors.text.primary }]}>
                {t('assignedToMe') || 'Assigned To Me'} ({assignedToMe.length}) {showAssignedList ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {showAssignedList && (
            <View>
              {assignedToMe.map((task) => (
                <TouchableOpacity key={task.id} style={[styles.taskItem, { backgroundColor: theme.colors.background }]} onPress={() => handleTaskDetails(task)}> 
                  <View style={styles.taskHeader}>
                    <View style={styles.taskCategory}>
                      <Text style={styles.taskCategoryIcon}>{getCategoryIcon(task.category)}</Text>
                      <Text style={[styles.taskCategoryText, { color: getCategoryColor(task.category) }]}>{getCategoryLabel(task.category as any, t)}</Text>
                    </View>
                    <Text style={[styles.taskReward, { color: theme.colors.primary?.blue }]}>₡{task.reward?.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignSelf: 'flex-start', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 }}>
                    <Text style={{ color: '#111827', fontWeight: '700', fontSize: 10 }}>{t('beingWorked') || 'In progress'}</Text>
                  </View>
                  <Text style={[styles.taskTitle, { color: theme.colors.text.primary }]}>{task.title}</Text>
                  <Text style={[styles.taskDescription, { color: theme.colors.text.secondary }]}>{task.description}</Text>
                  <View style={styles.taskFooter}>
                    <Text style={[styles.taskLocation, { color: theme.colors.text.secondary }]}>📍 {task.location}</Text>
                    <Text style={[styles.taskStatus, { color: theme.colors.text.secondary }]}>
                      {task.status === 'open' && (t('openStatus') || 'Open')}
                      {task.status === 'in_progress' && (t('inProgressStatus') || 'In Progress')}
                      {task.status === 'completed' && (t('completedStatus') || 'Completed')}
                      {task.status === 'cancelled' && (t('cancelledStatus') || 'Cancelled')}
                    </Text>
                  </View>
                  {/* Cancel job (worker) */}
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#F87171', paddingHorizontal: 12, paddingVertical: 8 }]}
                    onPress={() => setCancelModalTask(task)}
                  >
                     <Text style={{ color: 'white', fontWeight: '700' }}>{t('cancelJob') || 'Cancel Job'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            )}
          </View>
        )}

        {/* Open Task List */}
        <View style={[styles.taskList, { backgroundColor: theme.colors.surface }]}> 
          <TouchableOpacity onPress={() => setShowOpenList(v => !v)}>
              <Text style={[styles.taskListTitle, { color: theme.colors.text.primary }]}> 
                {t('myTasks')} ({openMyTasks.length}) {showOpenList ? '▾' : '▸'}
            </Text>
          </TouchableOpacity>
          {showOpenList && (
          <View>
            {openMyTasks.map((task) => (
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
              {/* In-progress badge for owner tasks */}
              {task.status === 'in_progress' && task.user_id === user?.id && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ color: '#111827', fontWeight: '700', fontSize: 10 }}>{t('beingWorked') || 'In progress'}</Text>
                </View>
              )}
              {task.status === 'in_progress' && (task as any).assigned_to === user?.id && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: '#3B82F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>{t('youAreWorking') || 'You are working'}</Text>
                </View>
              )}
              <Text style={[styles.taskTitle, { color: theme.colors.text.primary }]}>
                {task.title}
              </Text>
              <Text style={[styles.taskDescription, { color: theme.colors.text.secondary }]}>
                {task.description}
              </Text>
              {/* Owner: cancel job button (for tasks I created) */}
              {task.user_id === user?.id && (
                <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#F87171', paddingHorizontal: 12, paddingVertical: 8 }]}
                    onPress={async () => {
                      const ok = await cancelTaskByOwner(task.id as string, user!.id);
                      if (!ok) { Alert.alert(t('error') || 'Error', 'Could not cancel task'); return; }
                      await fetchMyTasks();
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>{t('cancelJob') || 'Cancel Job'}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Offers count and action */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: theme.colors.text.secondary }}>
                  {(offerCounts[task.id as string] || 0)} {t('offers') || 'offers'}
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 8 }]}
                  onPress={() => {
                    router.push(`/make-offer?taskId=${task.id}&mode=manage`);
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>{t('offers') || 'Offers'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.taskFooter}>
                <Text style={[styles.taskLocation, { color: theme.colors.text.secondary }]}>
                  📍 {task.location}
                </Text>
                 <Text style={[styles.taskStatus, { color: theme.colors.text.secondary }]}>
                   {task.status === 'open' && (t('openStatus') || 'Open')}
                   {task.status === 'in_progress' && (t('inProgressStatus') || 'In Progress')}
                   {task.status === 'completed' && (t('completedStatus') || 'Completed')}
                   {task.status === 'cancelled' && (t('cancelledStatus') || 'Cancelled')}
                 </Text>
              </View>
                {/* Finish task (owner) */}
                {task.status === 'in_progress' && (task as any).assigned_to && (task as any).user_id === user?.id && (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 8 }]}
                    onPress={async () => {
                      const ok = await finishTaskByOwner(task.id as string, user!.id);
                      if (!ok) { Alert.alert(t('error') || 'Error', 'Could not finish task'); return; }
                      await fetchMyTasks();
                    }}
                  >
                     <Text style={{ color: 'white', fontWeight: '700' }}>{t('finishTask') || 'Finish Task'}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
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
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setCancelModalTask(null); setCancelReason(''); }}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
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
  addButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  map: {
    height: Math.round(height * 0.35),
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
    padding: 16,
    marginTop: 12,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskScrollView: {},
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
    height: Math.round(height * 0.8),
    width: '100%',
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
  helperText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
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


