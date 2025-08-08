import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { typography, spacing } from '../lib/designSystem';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { getCategoryLabel } from '../lib/utils';
import { fetchTasks, fetchTasksNearby, calculateDistance, fetchUserProfile } from '../lib/database';
import { testSupabaseConnection, testSupabaseAuth, testSupabaseTables, testSupabaseNetwork } from '../lib/supabase-test';
import { useSupabase } from '../lib/feature-flags';
import CategoryIcon from '../components/CategoryIcon';
import CategoryBadge from '../components/CategoryBadge';
import UserProfileCard from '../components/UserProfileCard';
import ChambitoMascot from '../components/ChambitoMascot';
import BottomNavigation from '../components/BottomNavigation';

// Define Task type locally to avoid import issues
interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  reward?: number;
  latitude?: number;
  longitude?: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Demo user coordinates (La Nopalera, San José)
const GBSYS_COSTA_RICA = {
  latitude: 9.923035, // N 9° 55' 22.925''
  longitude: -84.043457, // W 84° 2' 36.445''
};

// Available categories
const ALL_CATEGORIES = [
  'All',
  'plumbing',
  'electrician',
  'carpentry',
  'painting',
  'appliance_repair',
  'cleaning',
  'laundry_ironing',
  'cooking',
  'grocery_shopping',
  'pet_care',
  'gardening',
  'moving_help',
  'trash_removal',
  'window_washing',
  'babysitting',
  'elderly_care',
  'tutoring',
  'delivery_errands',
  'tech_support',
  'photography'
];

// Fuzzy search function
function fuzzySearch(searchTerm: string, text: string): boolean {
  const search = searchTerm.toLowerCase();
  const target = text.toLowerCase();
  
  let searchIndex = 0;
  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (target[i] === search[searchIndex]) {
      searchIndex++;
    }
  }
  return searchIndex === search.length;
}

export default function MapScreen() {
  const [tasks, setTasks] = useState<(Task & { distance: number })[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<(Task & { distance: number })[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [maxDistance] = useState(10);
  const [showTasksList, setShowTasksList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  const [selectedTask, setSelectedTask] = useState<(Task & { distance: number }) | null>(null);
  const [selectedTaskUser, setSelectedTaskUser] = useState<any | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.5); // 0 (far) .. 1 (near)
  // Temporary expansion of overlapping markers near a clicked point
  const [expandedPositions, setExpandedPositions] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const supabaseEnabled = useSupabase();
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (supabaseEnabled) {
      testSupabaseConnection().then(() => {});
      testSupabaseAuth().then(() => {});
      testSupabaseTables().then(() => {});
      testSupabaseNetwork().then(() => {});
    }
    if (!user) {
      router.replace('/welcome');
      return;
    }
    getCurrentLocation();
  }, [user, authLoading, router, supabaseEnabled]);

  const getCurrentLocation = async () => {
    try {
      // For demo user, always use Costa Rica location
      if (user?.email === 'demo@currijobs.com') {
          setUserLocation({
          coords: GBSYS_COSTA_RICA,
          timestamp: Date.now(),
        } as Location.LocationObject);
          loadAllTasks(GBSYS_COSTA_RICA.latitude, GBSYS_COSTA_RICA.longitude);
        
        // Animate map to Costa Rica location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: GBSYS_COSTA_RICA.latitude,
            longitude: GBSYS_COSTA_RICA.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        setLoading(false);
        return;
      }

      // Request location permissions for other users
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to see tasks near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              Alert.alert('Settings', 'Please enable location access in your device settings.');
            }}
          ]
        );
        // Use default location if permission denied
        setUserLocation({
          coords: GBSYS_COSTA_RICA,
          timestamp: Date.now(),
        } as Location.LocationObject);
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      setUserLocation(location);
      loadAllTasks(location.coords.latitude, location.coords.longitude);
      
      // Animate map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch {
      Alert.alert('Location Error', 'Could not get your location. Using default location.');
      
      // Use default location
      setUserLocation({
        coords: GBSYS_COSTA_RICA,
        timestamp: Date.now(),
      } as Location.LocationObject);
      loadAllTasks(GBSYS_COSTA_RICA.latitude, GBSYS_COSTA_RICA.longitude);
    } finally {
      setLoading(false);
    }
  };

  // (Removed AI recommendations)

  // Jitter overlapping markers slightly so they do not perfectly overlap on the map
  const applyMarkerJitter = (taskList: (Task & { distance: number })[]): (Task & { distance: number })[] => {
    const byKey = new Map<string, (Task & { distance: number })[]>();
    const keyFor = (lat?: number, lon?: number) => `${(lat ?? 0).toFixed(4)}_${(lon ?? 0).toFixed(4)}`;
    taskList.forEach(t => {
      const k = keyFor(t.latitude, t.longitude);
      const arr = byKey.get(k) || [];
      arr.push(t);
      byKey.set(k, arr);
    });

    const metersToLat = (meters: number) => meters / 111000; // approx
    const metersToLon = (meters: number, atLat: number) => meters / (111000 * Math.cos((atLat * Math.PI) / 180));

    const jittered: (Task & { distance: number })[] = [];
    byKey.forEach(arr => {
      if (arr.length === 1) {
        jittered.push(arr[0]);
        return;
      }
      const radiusMeters = 6; // base radius
      arr.forEach((t, idx) => {
        const angle = (idx / arr.length) * 2 * Math.PI;
        const lat = t.latitude || 0;
        const lon = t.longitude || 0;
        const dLat = metersToLat(radiusMeters) * Math.cos(angle);
        const dLon = metersToLon(radiusMeters, lat) * Math.sin(angle);
        jittered.push({ ...t, latitude: lat + dLat, longitude: lon + dLon });
      });
    });

    return jittered;
  };

  // Compute dynamic proximity threshold (km) from current region zoom
  const computeProximityKm = (): number => {
    const latDelta = currentRegion?.latitudeDelta ?? 0.03; // reasonable default
    // Convert degrees to km (~111 km per degree latitude) then take 5% of visible height
    const visibleKm = latDelta * 111;
    return Math.max(0.08, visibleKm * 0.05); // min 80m
  };

  const metersToLat = (meters: number) => meters / 111000; // approx
  const metersToLon = (meters: number, atLat: number) => meters / (111000 * Math.cos((atLat * Math.PI) / 180));

  // Compute spacing in meters based on current zoom and approximate marker size (40px) + gap (24px)
  const computeStepMeters = (_atLat: number): number => {
    const desiredMarkerPx = 40;
    const desiredGapPx = 24;
    const desiredSpacingPx = desiredMarkerPx + desiredGapPx; // ~64px
    const screenHeight = Dimensions.get('window').height || 800;
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const metersPerPixel = (latDelta * 111000) / Math.max(1, screenHeight);
    const step = metersPerPixel * desiredSpacingPx;
    // Ensure a minimum separation so even at far zoom they are not too close
    return Math.max(35, step);
  };

  const generateGridOffsets = (count: number, atLat: number, stepMeters: number): Array<{ dLat: number; dLon: number }> => {
    // Place up to N positions in an NxN grid skipping center; grows with count
    const grid: Array<{ dLat: number; dLon: number }> = [];
    let size = 3;
    while ((size * size - 1) < count) size++;
    const half = Math.floor(size / 2);
    for (let r = -half; r <= half; r++) {
      for (let c = -half; c <= half; c++) {
        if (r === 0 && c === 0) continue; // skip center
        grid.push({ dLat: metersToLat(r * stepMeters), dLon: metersToLon(c * stepMeters, atLat) });
      }
    }
    return grid.slice(0, count);
  };

  const getAvailableCategories = (taskList: (Task & { distance: number })[]) => {
    // Ensure we always expose all categories present in data
    const categories = new Set<string>(['All']);
    taskList.forEach(task => {
      if (task.category) categories.add(task.category);
    });
    return Array.from(categories);
  };

  const loadAllTasks = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const all = await fetchTasks();
      const tasksWithDistance = (all || []).map(task => ({
        ...task,
        distance: calculateDistance(
          latitude,
          longitude,
          task.latitude || 0,
          task.longitude || 0
        )
      }));
      const jittered = applyMarkerJitter(tasksWithDistance);
      setTasks(jittered);
      setAvailableCategories(getAvailableCategories(tasksWithDistance));
      filterTasks();
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    // Always start from the full tasks array to avoid cumulative filtering bugs
    let next = tasks;

    const useAll = selectedCategories.length === 0 || selectedCategories.includes('All');
    if (!useAll) {
      const selectedSet = new Set(selectedCategories);
      next = next.filter(task => selectedSet.has(task.category));
    }

    if (searchQuery.trim()) {
      next = next.filter(task => 
        fuzzySearch(searchQuery, task.title) ||
        fuzzySearch(searchQuery, task.description || '') ||
        fuzzySearch(searchQuery, task.category) ||
        fuzzySearch(searchQuery, task.location || '')
      );
    }

    setFilteredTasks(next);
  };

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, selectedCategories]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'plumbing': '#2196F3',
      'electrician': '#FF9800',
      'carpentry': '#8D6E63',
      'painting': '#9C27B0',
      'appliance_repair': '#607D8B',
      'cleaning': '#4CAF50',
      'laundry_ironing': '#00BCD4',
      'cooking': '#F44336',
      'grocery_shopping': '#FF5722',
      'pet_care': '#9C27B0',
      'gardening': '#8BC34A',
      'moving_help': '#795548',
      'trash_removal': '#607D8B',
      'window_washing': '#00BCD4',
      'babysitting': '#E91E63',
      'elderly_care': '#FF5722',
      'tutoring': '#2196F3',
      'delivery_errands': '#FF9800',
      'tech_support': '#607D8B',
      'photography': '#9C27B0',
    };
    return colors[category || 'cleaning'] || '#607D8B';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return '🔧💧';
      case 'electrician':
        return '⚡🔌';
      case 'carpentry':
        return '🪚🪵';
      case 'painting':
        return '🎨';
      case 'appliance_repair':
        return '⚙️📺';
      case 'cleaning':
        return '🧹✨';
      case 'laundry_ironing':
        return '👕♨️';
      case 'cooking':
        return '👨‍🍳🍳';
      case 'grocery_shopping':
        return '🛒🥗';
      case 'pet_care':
        return '🐕';
      case 'gardening':
        return '🌱🌿';
      case 'moving_help':
        return '📦➡️';
      case 'trash_removal':
        return '🗑️';
      case 'window_washing':
        return '🧽';
      case 'babysitting':
        return '🍼';
      case 'elderly_care':
        return '🦯❤️';
      case 'tutoring':
        return '📚✏️';
      case 'delivery_errands':
        return '🛵📦';
      case 'tech_support':
        return '💻🔧';
      case 'photography':
        return '📸';
      default:
        return '💼';
    }
  };

  // reserved for future adaptive marker sizing
  // Placeholder to keep for future adaptive sizing (unused)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMarkerSize = (_task: Task & { distance: number }) => 'small';

  // reserved for future adaptive marker opacity
  // Placeholder to keep for future adaptive opacity (unused)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMarkerOpacity = (_task: Task & { distance: number }) => 1.0;

  const handleMarkerPress = (task: Task & { distance: number }) => {
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      // optional haptics intentionally disabled to avoid runtime require
    }
    
    // Check for overlapping markers nearby this task; if many, expand grid; if already expanded, navigate
    const proximityKm = computeProximityKm();
    const nearby = filteredTasks.filter(t =>
      calculateDistance(
        task.latitude || 0,
        task.longitude || 0,
        t.latitude || 0,
        t.longitude || 0,
      ) <= proximityKm
    );

    if (nearby.length > 1 && !isExpanded) {
      // Expand into grid
      const step = computeStepMeters(task.latitude || 0);
      const offsets = generateGridOffsets(nearby.length, task.latitude || 0, step);
      const mapping: Record<string, { latitude: number; longitude: number }> = {};
      nearby.forEach((t, idx) => {
        const baseLat = t.latitude || 0;
        const baseLon = t.longitude || 0;
        const off = offsets[idx] || { dLat: 0, dLon: 0 };
        mapping[t.id] = { latitude: baseLat + off.dLat, longitude: baseLon + off.dLon };
      });
      setExpandedPositions(mapping);
      setIsExpanded(true);
      setSelectedTask(null);
      setSelectedTaskUser(null);
      return;
    }

    // If expanded and clicking again on a specific marker, go to its detail card (tooltip flow)
    if (selectedTask?.id === task.id) {
      router.push(`/task/${task.id}`);
      return;
    }

    setSelectedTask(task);
    if (task.user_id) {
      fetchUserProfile(task.user_id).then((profile) => {
        if (!profile) {
          setSelectedTaskUser(null);
          return;
        }
        const mapped = {
          id: profile.id,
          name: profile.full_name || 'User',
          avatar: profile.avatar_url,
          rating: profile.rating ?? 0,
          total_reviews: 0,
          completed_tasks: profile.total_jobs ?? 0,
          total_earnings: profile.total_earnings ?? 0,
          wallet_balance: 0,
          member_since: profile.created_at || new Date().toISOString(),
          location: profile.location,
          verified: profile.is_verified ?? false,
        };
        setSelectedTaskUser(mapped);
      }).catch(() => setSelectedTaskUser(null));
    } else {
      setSelectedTaskUser(null);
    }
  };

  const handleTooltipClose = () => {
    setSelectedTask(null);
    setSelectedTaskUser(null);
  };

  const handleSubmitOffer = (taskId: string) => {
    router.push(`/make-offer?taskId=${taskId}`);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  const focusNearestForSelection = () => {
    try {
      // Prefer current map center if available so repeated taps behave predictably
      const originLat = currentRegion?.latitude ?? userLocation?.coords.latitude ?? GBSYS_COSTA_RICA.latitude;
      const originLon = currentRegion?.longitude ?? userLocation?.coords.longitude ?? GBSYS_COSTA_RICA.longitude;

      const useAll = selectedCategories.length === 0 || selectedCategories.includes('All');
      const candidateTasks = useAll ? tasks : tasks.filter(t => selectedCategories.includes(t.category));
      if (candidateTasks.length === 0) return;

      const nearest = candidateTasks.reduce((closest, current) => {
        // Compute on the fly from origin to avoid relying on precomputed distance when switching categories
        const currentDistance = calculateDistance(
          originLat,
          originLon,
          current.latitude || 0,
          current.longitude || 0
        );
        const closestDistance = closest
          ? calculateDistance(originLat, originLon, closest.latitude || 0, closest.longitude || 0)
          : Number.POSITIVE_INFINITY;
        return currentDistance < closestDistance ? current : closest;
      }, null as (Task & { distance: number }) | null);

      if (!nearest || !nearest.latitude || !nearest.longitude) return;
      const nextRegion: Region = {
        latitude: nearest.latitude,
        longitude: nearest.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      // Avoid unnecessary state updates to prevent render loops
      const isSameRegion = (
        currentRegion &&
        Math.abs(currentRegion.latitude - nextRegion.latitude) < 1e-6 &&
        Math.abs(currentRegion.longitude - nextRegion.longitude) < 1e-6 &&
        Math.abs((currentRegion as any).latitudeDelta - nextRegion.latitudeDelta) < 1e-6 &&
        Math.abs((currentRegion as any).longitudeDelta - nextRegion.longitudeDelta) < 1e-6
      );
      if (!isSameRegion) {
        setCurrentRegion(nextRegion);
      }
      setZoomLevel(0.8);
      // Slight defer using microtask
      Promise.resolve().then(() => {
        if (mapRef.current) {
          if (!isSameRegion) {
            mapRef.current.animateToRegion(nextRegion, 400);
          }
        }
      });
    } catch {
      // no-op
    }
  };

  const handleCategorySelect = (category: string) => {
    setSearchQuery('');
    setSelectedTask(null);
    setSelectedTaskUser(null);
    setSelectedCategories(prev => {
      // Reset when choosing All
      if (category === 'All') return ['All'];
      // Toggle logic
      const hasAll = prev.includes('All');
      const next = new Set<string>(hasAll ? [] : prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      const arr = Array.from(next);
      return arr.length === 0 ? ['All'] : arr;
    });
  };

  // Re-focus when inputs change (selected categories, data set, or map center)
  useEffect(() => {
    focusNearestForSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, tasks]);

  // Zoom helpers
  const MIN_DELTA = 0.005;
  const MAX_DELTA = 0.3;
  const computeDeltaForZoom = (z: number) => {
    const clamped = Math.max(0, Math.min(1, z));
    // linear interpolate deltas
    const latDelta = MAX_DELTA - (MAX_DELTA - MIN_DELTA) * clamped;
    const lonDelta = latDelta;
    return { latDelta, lonDelta };
  };

  const applyZoom = (z: number) => {
    const origin = currentRegion || {
      latitude: userLocation?.coords.latitude || GBSYS_COSTA_RICA.latitude,
      longitude: userLocation?.coords.longitude || GBSYS_COSTA_RICA.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    const { latDelta, lonDelta } = computeDeltaForZoom(z);
    const nextRegion: Region = {
      latitude: origin.latitude,
      longitude: origin.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
    setZoomLevel(Math.max(0, Math.min(1, z)));
    setCurrentRegion(nextRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(nextRegion, 200);
    }
  };

  const handleZoomIn = () => applyZoom(zoomLevel + 0.1);
  const handleZoomOut = () => applyZoom(zoomLevel - 0.1);

  const toggleTasksList = () => {
    setShowTasksList(!showTasksList);
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ChambitoMascot mood="thinking" size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            {authLoading ? 'Loading...' : 'Finding tasks near you...'}
          </Text>
        </View>
      </View>
    );
  }

  // Empty state: no tasks nearby
  if (!authLoading && !loading && filteredTasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.loadingContainer}> 
          <ChambitoMascot mood="error" size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>No nearby tasks found</Text>
          <Text style={{ marginTop: 8, color: theme.colors.text.secondary }}>Try widening distance, clearing search, or selecting more categories.</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Simple Header */}
      <View style={[
        styles.header,
        {
          backgroundColor: theme.mode === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(18,26,44,0.92)',
          borderBottomColor: theme.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'transparent',
          borderBottomWidth: theme.mode === 'light' ? StyleSheet.hairlineWidth : 0,
        }
      ]}> 
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ChambitoMascot mood="happy" size="small" />
            <Text style={[styles.headerTitle, { color: theme.mode === 'light' ? '#0B1020' : theme.colors.text.primary }]}>CurriJobs</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/tasks')}
              style={[
                styles.listButton,
                {
                  backgroundColor: theme.mode === 'light' ? '#0F3576' : theme.colors.surface,
                  borderColor: theme.mode === 'light' ? '#0F3576' : theme.colors.border,
                  borderWidth: 1,
                }
              ]}
            >
              <Text style={styles.listButtonText}>📋 {t('listView')}</Text>
            </TouchableOpacity>
          <TouchableOpacity
              onPress={() => router.push('/create-task')}
              style={[styles.createButton, { backgroundColor: theme.mode === 'light' ? '#FF6B35' : theme.colors.primary.blue }]}
          >
              <Text style={styles.createButtonText}>+ {t('createTask')}</Text>
          </TouchableOpacity>
          </View>
      </View>

      {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: theme.colors.surface,
            borderColor: isSearchFocused ? '#1E3A8A' : theme.colors.border
          }]}>
            <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleSearchClear} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.searchResults, { color: theme.colors.text.secondary }]}> 
            {filteredTasks.length} {filteredTasks.length === 1 ? 'result' : 'results'}
          </Text>
      </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
           {availableCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                 (selectedCategories.includes('All') && category === 'All') || selectedCategories.includes(category)
                   ? { backgroundColor: getCategoryColor(category) }
                   : null
              ]}
               onPress={() => handleCategorySelect(category)}
            >
              <Text style={[
                styles.categoryIcon,
                 ((selectedCategories.includes('All') && category === 'All') || selectedCategories.includes(category))
                   ? { color: 'white' }
                   : { color: theme.colors.text.primary }
              ]}>
                {category === 'All' ? '📋' : getCategoryIcon(category)}
              </Text>
              <Text style={[
                styles.categoryText,
                 ((selectedCategories.includes('All') && category === 'All') || selectedCategories.includes(category))
                   ? { color: 'white' }
                   : { color: theme.colors.text.primary }
              ]}>
                 {category === 'All' ? t('all') : getCategoryLabel(category as any, t)}
              </Text>
            </TouchableOpacity>
          ))}
          {ALL_CATEGORIES.filter(cat => cat !== 'All' && !availableCategories.includes(cat)).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                styles.categoryButtonDisabled
              ]}
              disabled={true}
            >
              <Text style={[
                styles.categoryIcon,
                styles.categoryTextDisabled
              ]}>
                {getCategoryIcon(category)}
              </Text>
              <Text style={[
                styles.categoryText,
                styles.categoryTextDisabled
              ]}>
                 {getCategoryLabel(category as any, t)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
      {/* (Location status indicator removed as unnecessary) */}
      </View>

      {/* Tasks List Toggle */}
      <View style={[styles.recommendationsToggleContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.recommendationsToggleRow}>
          <Text style={[styles.recommendationsToggleTitle, { color: theme.colors.text.primary }]}>
            📋 Tasks
          </Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: showTasksList ? '#1E3A8A' : '#E5E7EB' }
            ]}
            onPress={toggleTasksList}
          >
            <View style={[
              styles.toggleThumb,
              { 
                backgroundColor: 'white',
                transform: [{ translateX: showTasksList ? 20 : 0 }]
              }
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tasks Inline List */}
      {showTasksList && filteredTasks.length > 0 && (
        <View style={[styles.recommendationsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.recommendationsList}>
            {filteredTasks.slice(0, 5).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.recommendationCard, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setShowTasksList(false);
                  // Center and open the preview for the selected task
                  if (task.latitude && task.longitude) {
                    const nextRegion: Region = {
                      latitude: task.latitude,
                      longitude: task.longitude,
                      latitudeDelta: 0.03,
                      longitudeDelta: 0.03,
                    };
                    setCurrentRegion(nextRegion);
                    Promise.resolve().then(() => {
                      mapRef.current?.animateToRegion(nextRegion, 400);
                    });
                  }
                  handleMarkerPress(task);
                }}
              >
                <View style={styles.recommendationHeader}>
                  <CategoryIcon category={task.category} size="small" />
                  <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
                    {task.title}
                  </Text>
                </View>
                <Text style={[styles.recommendationReward, { color: '#FF6B35' }]}>
                  ₡{task.reward?.toLocaleString()}
                </Text>
                <Text style={[styles.recommendationDistance, { color: theme.colors.text.secondary }]}>
                  {task.distance?.toFixed(1)}km away
                </Text>
                <TouchableOpacity
                  style={[styles.offerButton, { backgroundColor: '#1E3A8A' }]}
                  onPress={() => handleSubmitOffer(task.id)}
                >
                 <Text style={styles.offerButtonText}>{t('submitOffer')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation?.coords.latitude || GBSYS_COSTA_RICA.latitude,
            longitude: userLocation?.coords.longitude || GBSYS_COSTA_RICA.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onLongPress={(event) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            router.push({ pathname: '/create-task', params: { lat: String(latitude), lon: String(longitude) } });
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          zoomTapEnabled={true}
          zoomControlEnabled={true}
          minZoomLevel={10}
          maxZoomLevel={20}
          mapType="standard"
          liteMode={false}
          moveOnMarkerPress={true}
          followsUserLocation={false}
          toolbarEnabled={false}
          onRegionChangeComplete={(region) => setCurrentRegion(region)}
          onPress={() => {
            // collapse expansion when tapping elsewhere
            if (isExpanded) {
              setIsExpanded(false);
              setExpandedPositions({});
            }
          }}
        >
          {filteredTasks.map((task) => (
            <Marker
              key={task.id}
              coordinate={{
                latitude: isExpanded && expandedPositions[task.id]?.latitude != null ? expandedPositions[task.id].latitude : (task.latitude || 0),
                longitude: isExpanded && expandedPositions[task.id]?.longitude != null ? expandedPositions[task.id].longitude : (task.longitude || 0),
              }}
              onPress={() => handleMarkerPress(task)}
              title={task.title}
              description={`₡${task.reward?.toLocaleString() || '0'}`}
            >
              <View style={[styles.customMarker, { backgroundColor: getCategoryColor(task.category) }]}>
                <Text style={styles.markerEmoji}>{getCategoryIcon(task.category)}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Zoom Controls (less intrusive) */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={[styles.zoomButton, { backgroundColor: theme.colors.surface }]} onPress={handleZoomIn}>
          <Text style={[styles.zoomLabel, { color: theme.colors.text.primary }]}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoomButton, { backgroundColor: theme.colors.surface, marginTop: 8 }]} onPress={handleZoomOut}>
          <Text style={[styles.zoomLabel, { color: theme.colors.text.primary }]}>－</Text>
        </TouchableOpacity>
      </View>

      {/* Task Detail Overlay */}
      {selectedTask && (
        <View style={[styles.detailCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.detailHeaderRow}>
            <CategoryBadge category={selectedTask.category} size="large" />
            <View style={[styles.detailCategoryPill, { backgroundColor: '#FFE9D9' }]}>
              <Text style={[styles.detailCategoryPillText, { color: '#C85212' }]}>
                {getCategoryLabel(selectedTask.category as any, t)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleTooltipClose} style={styles.detailCloseButton}>
              <Text style={styles.detailCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>{selectedTask.title}</Text>
          <Text style={[styles.detailDescription, { color: theme.colors.text.secondary }]} numberOfLines={3}>
            {selectedTask.description}
          </Text>

          <View style={styles.detailMetaRow}>
            <View style={styles.detailMetaItem}>
              <Text style={styles.detailMetaIcon}>📍</Text>
              <Text style={[styles.detailMetaText, { color: theme.colors.text.primary }]}>{selectedTask.location}</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <Text style={styles.detailMetaIcon}>🧭</Text>
              <Text style={[styles.detailMetaText, { color: theme.colors.text.secondary }]}>{selectedTask.distance?.toFixed(1)} km</Text>
            </View>
          </View>

          <Text style={styles.detailReward}>₡{selectedTask.reward?.toLocaleString()}</Text>

          {selectedTaskUser && (
            <View style={[styles.posterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <UserProfileCard user={selectedTaskUser} compact={true} />
            </View>
          )}

          <View style={styles.detailActionsRow}>
            <TouchableOpacity
              style={[styles.detailButtonSecondary, { backgroundColor: '#0F3576' }]}
              onPress={() => router.push(`/task/${selectedTask.id}`)}
            >
              <Text style={styles.detailButtonSecondaryText}>{t('viewDetails')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailButtonPrimary, { backgroundColor: '#FF6B35' }]}
              onPress={() => handleSubmitOffer(selectedTask.id)}
            >
              <Text style={styles.detailButtonPrimaryText}>{t('submitOffer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  },
  header: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title,
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  listButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  searchResults: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: spacing.xs,
    backgroundColor: '#F5F5F5',
    minWidth: 60,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryText: {
    ...typography.small,
    textTransform: 'capitalize',
  },
  categoryButtonDisabled: {
    opacity: 0.4,
    backgroundColor: '#F0F0F0',
  },
  categoryTextDisabled: {
    color: '#999999',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // New detail card styles
  detailCard: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  // replaced by CategoryBadge
  detailCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  detailCategoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailCloseButton: {
    marginLeft: 'auto',
    padding: 6,
  },
  detailCloseText: {
    fontSize: 18,
    color: '#666',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  detailMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetaIcon: {
    marginRight: 6,
  },
  detailMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailReward: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B35',
    marginVertical: 8,
  },
  posterCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailButtonSecondaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  detailButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailButtonPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipCategoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tooltipCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tooltipCloseButton: {
    padding: 4,
  },
  tooltipCloseText: {
    fontSize: 18,
    color: '#666',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tooltipDetails: {
    marginBottom: 12,
  },
  tooltipDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipDetailIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  tooltipDetailText: {
    fontSize: 12,
  },
  tooltipReward: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tooltipRewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tooltipRewardLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tooltipActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tooltipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tooltipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerEmoji: {
    fontSize: 18,
  },
  locationStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
  },
  recommendationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationCard: {
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recommendationReward: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recommendationDistance: {
    fontSize: 12,
  },
  offerButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 140,
    alignItems: 'center',
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  zoomLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
  markerContainer: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  calloutDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  calloutReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#666',
  },
  calloutUrgent: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginTop: 4,
  },
  calloutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  calloutDetailButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  calloutOfferButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationsToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recommendationsToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationsToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
