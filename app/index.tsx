import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { typography, spacing } from '../lib/designSystem';
import MapView, { Marker, PROVIDER_GOOGLE, Region, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { getCategoryLabel } from '../lib/utils';
import { isAmazonAndroid } from '../lib/utils';
import { fetchTasks, calculateDistance, fetchUserProfile, seedLocalTasksIfNeeded } from '../lib/database';
import { testSupabaseConnection, testSupabaseAuth, testSupabaseTables, testSupabaseNetwork } from '../lib/supabase-test';
import { useSupabase } from '../lib/feature-flags';
import CategoryIcon from '../components/CategoryIcon';
import CategoryBadge from '../components/CategoryBadge';
import UserProfileCard from '../components/UserProfileCard';
import { fetchPaymentsCountsForUser } from '../lib/database';
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
  // const [maxDistance] = useState(10);
  const [showTasksList, setShowTasksList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<(Task & { distance: number }) | null>(null);
  const [selectedTaskUser, setSelectedTaskUser] = useState<any | null>(null);
  const [selectedUserPayments, setSelectedUserPayments] = useState<{ made: number; received: number } | null>(null);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.5); // 0 (far) .. 1 (near)
  // Temporary expansion of overlapping markers near a clicked point
  const [expandedPositions, setExpandedPositions] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCluster, setExpandedCluster] = useState<{ lat: number; lon: number; radiusMeters: number } | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const lastMarkerPressRef = useRef<number>(0);

  // Google Maps dark mode style
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

  const supabaseEnabled = useSupabase();
  const isExpoGoAndroid = Platform.OS === 'android' && (Constants as any)?.appOwnership === 'expo';
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (supabaseEnabled) {
      testSupabaseConnection().then(() => {});
      testSupabaseAuth().then(() => {});
      testSupabaseTables().then(() => {});
      testSupabaseNetwork().then(() => {});
    }
    // In demo/simulator, allow map to load with demo user
    if (!user) {
      (globalThis as any).console?.log?.('No user set yet; waiting for auth or demo seed...');
      return;
    }
    getCurrentLocation();
  }, [user, authLoading, router, supabaseEnabled]);

  const getCurrentLocation = async () => {
    try {
      // Best-effort local seed on Android if needed (empty DB/local store)
      if (Platform.OS === 'android') {
        await seedLocalTasksIfNeeded();
      }
      // For demo user, always use Costa Rica location
      if (user?.email === 'demo@currijobs.com') {
        setUserLocation({
          coords: GBSYS_COSTA_RICA,
          timestamp: Date.now(),
        } as Location.LocationObject);
          await loadAllTasks(GBSYS_COSTA_RICA.latitude, GBSYS_COSTA_RICA.longitude);
        
        // Animate map to Costa Rica location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: GBSYS_COSTA_RICA.latitude,
            longitude: GBSYS_COSTA_RICA.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
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
      await loadAllTasks(location.coords.latitude, location.coords.longitude);
      
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
      await loadAllTasks(GBSYS_COSTA_RICA.latitude, GBSYS_COSTA_RICA.longitude);
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

  // Kept for future use; replaced by pixel-based overlap checks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const computeProximityKm = (): number => {
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const visibleKm = latDelta * 111;
    return Math.max(0.08, visibleKm * 0.05);
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

  const computeOverlapMeters = (): number => {
    const px = 90; // ~2.25x marker radius for easier overlap detection on phones
    const m = computeMetersForPixels(px);
    return Math.max(25, m); // ensure a sensible minimum in meters at far zooms
  };

  const computeLabelSeparationMeters = (): number => {
    // Minimum separation (in pixels) so price labels remain readable
    // Use ~28px (a bit under marker diameter) and scale by zoom via meters-per-pixel
    const px = 28;
    const m = computeMetersForPixels(px);
    return Math.max(10, m);
  };

  // Estimate meters covered by one pixel at current latitude; used to detect icon overlap
  const computeMetersForPixels = (pixels: number): number => {
    const screenHeight = Dimensions.get('window').height || 800;
    const latDelta = currentRegion?.latitudeDelta ?? 0.03;
    const metersPerPixel = (latDelta * 111000) / Math.max(1, screenHeight);
    return metersPerPixel * pixels;
  };

  // Concentric spiral offsets for expanding overlapping markers
  const generateSpiralOffsets = (
    count: number,
    atLat: number,
    stepMeters: number
  ): Array<{ dLat: number; dLon: number }> => {
    const positions: Array<{ dLat: number; dLon: number }> = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5° for nice radial separation
    const radialScale = stepMeters * 0.9; // tune spacing between spiral rings
    for (let i = 0; i < count; i++) {
      const k = i + 1; // skip exact center
      const radius = radialScale * Math.sqrt(k);
      const theta = k * goldenAngle;
      const offsetMetersX = radius * Math.cos(theta);
      const offsetMetersY = radius * Math.sin(theta);
      const dLat = metersToLat(offsetMetersY); // Y -> latitude meters
      const dLon = metersToLon(offsetMetersX, atLat); // X -> longitude meters
      positions.push({ dLat, dLon });
    }
    return positions;
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
      const start = Date.now();
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
        // Hide my own created tasks from the public map view
        const notMine = tasksWithDistance.filter(t => t.user_id !== user?.id);
        const jittered = applyMarkerJitter(notMine);
        setTasks(jittered);
        setAvailableCategories(getAvailableCategories(notMine));

      // Compute filtered list immediately to avoid empty-state flicker
      const useAll = selectedCategories.length === 0;
      let next = jittered;
      if (!useAll) {
        const selectedSet = new Set(selectedCategories);
        next = next.filter(task => selectedSet.has(task.category));
      }
      // Hide tasks created by me only on list overlay; keep them on the map for others
      // Ensure tasks from other users are shown
      next = next.filter(t => !!t.latitude && !!t.longitude);
      if (searchQuery.trim()) {
        next = next.filter(task =>
          fuzzySearch(searchQuery, task.title) ||
          fuzzySearch(searchQuery, task.description || '') ||
          fuzzySearch(searchQuery, task.category) ||
          fuzzySearch(searchQuery, task.location || '')
        );
      }
      setFilteredTasks(next);
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < 1000) {
        await new Promise((res) => setTimeout(res, 1000 - elapsed));
      }
      setLoading(false);
    }
  };

  const filterTasks = () => {
    // Always start from the full tasks array to avoid cumulative filtering bugs
    let next = tasks;

    const useAll = selectedCategories.length === 0 || selectedCategories.includes('All');
    if (!useAll) {
      // Allow filtering by only ONE category at a time (the first one)
      const first = selectedCategories[0];
      next = next.filter(task => task.category === first);
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

  const openOverlayForTask = (task: Task & { distance: number }) => {
    setSelectedTask(task);
    if (task.user_id) {
      fetchUserProfile(task.user_id).then((profile) => {
        if (!profile) { setSelectedTaskUser(null); return; }
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
        fetchPaymentsCountsForUser(profile.id).then((counts) => {
          setSelectedUserPayments(counts);
        }).catch(() => setSelectedUserPayments(null));
      }).catch(() => setSelectedTaskUser(null));
    } else {
      setSelectedTaskUser(null);
    }
  };

  const handleMarkerPress = (task: Task & { distance: number }) => {
    lastMarkerPressRef.current = Date.now();
    // When spiral expansion is active, only allow interaction with expanded items
    if (isExpanded) {
      const lat = task.latitude || 0;
      const lon = task.longitude || 0;
      // If task is part of the expanded set, allow as usual
      if (expandedPositions[task.id]) {
        // proceed
      } else if (expandedCluster) {
        // Allow clicks only if clearly outside the cluster radius + one marker width
        const bufferMeters = computeMetersForPixels(66); // 1.5x marker diameter buffer
        const dMeters = calculateDistance(expandedCluster.lat, expandedCluster.lon, lat, lon) * 1000;
        if (dMeters <= expandedCluster.radiusMeters + bufferMeters) {
          return; // ignore presses on markers behind/in the cluster area
        }
      } else {
        return;
      }
    }
    // If markers are too close, expand into grid first instead of showing tooltip
    const lat = task.latitude || 0;
    const lon = task.longitude || 0;
    // Consider icon overlap: threshold in meters using pixel heuristic with min floor
    const iconOverlapMeters = computeOverlapMeters();
    const nearby = filteredTasks.filter(t =>
      (calculateDistance(lat, lon, t.latitude || 0, t.longitude || 0) * 1000) <= iconOverlapMeters
    );
    if (nearby.length > 1 && !isExpanded) {
      const step = computeStepMeters(lat);
      const offsets = generateSpiralOffsets(nearby.length, lat, step);
      const mapping: Record<string, { latitude: number; longitude: number }> = {};
      let maxRadiusMeters = 0;
      nearby.forEach((t, idx) => {
        const baseLat = t.latitude || lat;
        const baseLon = t.longitude || lon;
        const off = offsets[idx] || { dLat: 0, dLon: 0 };
        mapping[t.id] = { latitude: baseLat + off.dLat, longitude: baseLon + off.dLon };
        const d = calculateDistance(lat, lon, baseLat, baseLon) * 1000;
        if (d > maxRadiusMeters) maxRadiusMeters = d;
      });
      setExpandedPositions(mapping);
      setIsExpanded(true);
      setExpandedCluster({ lat, lon, radiusMeters: maxRadiusMeters });
      setSelectedTask(null);
      setSelectedTaskUser(null);
      setPreviewTaskId(null);
      return; // do not show tooltip yet
    }

    // Always open overlay (no native tooltip)
    if (task.latitude && task.longitude && mapRef.current) {
      const nextRegion: Region = {
        latitude: task.latitude,
        longitude: task.longitude,
        latitudeDelta: currentRegion?.latitudeDelta || 0.03,
        longitudeDelta: currentRegion?.longitudeDelta || 0.03,
      };
      setCurrentRegion(nextRegion);
      mapRef.current.animateToRegion(nextRegion, 300);
    }
    setPreviewTaskId(null);
    openOverlayForTask(task);
  };

  // Long-press: if multiple tasks near press, force spiral; otherwise open nearest overlay
  const handleMapLongPress = (lat: number, lon: number) => {
    const iconOverlapMeters = computeOverlapMeters();
    const nearby = filteredTasks.filter(t => (
      calculateDistance(lat, lon, t.latitude || 0, t.longitude || 0) * 1000
    ) <= iconOverlapMeters);
    if (nearby.length > 1) {
      const step = computeStepMeters(lat);
      const offsets = generateSpiralOffsets(nearby.length, lat, step);
      const mapping: Record<string, { latitude: number; longitude: number }> = {};
      let maxRadiusMeters = 0;
      nearby.forEach((t, idx) => {
        const baseLat = t.latitude || lat;
        const baseLon = t.longitude || lon;
        const off = offsets[idx] || { dLat: 0, dLon: 0 };
        mapping[t.id] = { latitude: baseLat + off.dLat, longitude: baseLon + off.dLon };
        const d = calculateDistance(lat, lon, baseLat, baseLon) * 1000;
        if (d > maxRadiusMeters) maxRadiusMeters = d;
      });
      setExpandedPositions(mapping);
      setIsExpanded(true);
      setExpandedCluster({ lat, lon, radiusMeters: maxRadiusMeters });
      setSelectedTask(null);
      setSelectedTaskUser(null);
      setPreviewTaskId(null);
      return;
    }
    // Fallback to nearest overlay
    const nearest = filteredTasks.reduce((closest, current) => {
      const cd = calculateDistance(lat, lon, current.latitude || 0, current.longitude || 0);
      const dd = closest ? calculateDistance(lat, lon, closest.latitude || 0, closest.longitude || 0) : Number.POSITIVE_INFINITY;
      return cd < dd ? current : closest;
    }, null as (Task & { distance: number }) | null);
    if (nearest) {
      openOverlayForTask(nearest);
    }
  };

  const handleTooltipClose = () => {
    setSelectedTask(null);
    setSelectedTaskUser(null);
    setSelectedUserPayments(null);
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
    // Single-select; tap again to clear
    setSearchQuery('');
    setSelectedTask(null);
    setSelectedTaskUser(null);
    setSelectedCategories((prev) => (prev.length === 1 && prev[0] === category ? [] : [category]));
    // After state updates flush, center to the nearest visible task for current selection
    Promise.resolve().then(() => {
      focusNearestForSelection();
    });
  };

  const focusNearestForCategory = (category: string) => {
    try {
      const originLat = currentRegion?.latitude ?? userLocation?.coords.latitude ?? GBSYS_COSTA_RICA.latitude;
      const originLon = currentRegion?.longitude ?? userLocation?.coords.longitude ?? GBSYS_COSTA_RICA.longitude;
      const candidateTasks = category === 'All' ? tasks : tasks.filter(t => t.category === category);
      if (!candidateTasks || candidateTasks.length === 0) return;

      const nearest = candidateTasks.reduce((closest, current) => {
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
      setCurrentRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 400);
    } catch {
      // no-op
    }
  };

  // Re-focus when inputs change (selected categories, data set, or map center)
  useEffect(() => {
    // Center to the nearest task whenever categories or task set changes
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
          <ChambitoMascot variant="queen" size="giant" showMessage message={authLoading ? 'Loading...' : 'Finding tasks near you...'} />
          
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
              onPress={async () => {
                try {
                  const originLat = userLocation?.coords.latitude || GBSYS_COSTA_RICA.latitude;
                  const originLon = userLocation?.coords.longitude || GBSYS_COSTA_RICA.longitude;
                  await loadAllTasks(originLat, originLon);
                } catch {}
              }}
              style={[
                styles.listButton,
                {
                  backgroundColor: theme.mode === 'light' ? '#0B7A34' : theme.colors.surface,
                  borderColor: theme.mode === 'light' ? '#0B7A34' : theme.colors.border,
                  borderWidth: 1,
                }
              ]}
            >
              <Text style={styles.listButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/create-task')}
              style={[
                styles.createButton,
                {
                  backgroundColor: theme.mode === 'light' ? '#FF6B35' : '#1E3A8A',
                  borderWidth: 1,
                  borderColor: theme.mode === 'light' ? '#FF6B35' : '#3B82F6',
                },
              ]}
            >
              <Text style={[styles.createButtonText, { color: 'white' }]}>+ {t('createTask')}</Text>
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
           {availableCategories.map((category) => {
             const isSelected = selectedCategories.includes(category);
             const unselectedStyle = theme.mode === 'light'
               ? { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' }
               : { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: '#3B82F6' };
             const textColor = isSelected ? 'white' : (theme.mode === 'light' ? theme.colors.text.primary : '#E5E7EB');
             return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                   isSelected
                     ? { backgroundColor: getCategoryColor(category), borderColor: getCategoryColor(category) }
                     : unselectedStyle,
              ]}
               onPress={() => handleCategorySelect(category)}
            >
                 <Text style={[styles.categoryIcon, { color: textColor }]}>
                 {getCategoryIcon(category)}
              </Text>
                 <Text style={[styles.categoryText, { color: textColor }]}>
                 {getCategoryLabel(category as any, t)}
              </Text>
            </TouchableOpacity>
             );
           })}
          {ALL_CATEGORIES.filter(cat => !availableCategories.includes(cat)).map((category) => {
            const disabledStyle = theme.mode === 'light'
              ? { backgroundColor: '#F0F0F0' }
              : { backgroundColor: 'rgba(148,163,184,0.15)' };
            const disabledText = theme.mode === 'light' ? '#999999' : '#94A3B8';
            return (
            <TouchableOpacity
              key={category}
                style={[styles.categoryButton, styles.categoryButtonDisabled, disabledStyle]}
              disabled={true}
            >
                <Text style={[styles.categoryIcon, { color: disabledText }]}>
                {getCategoryIcon(category)}
              </Text>
                <Text style={[styles.categoryText, { color: disabledText }]}>
                 {getCategoryLabel(category as any, t)}
              </Text>
            </TouchableOpacity>
            );
          })}
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
                  {t('at')} {task.distance?.toFixed(1)} {t('kilometersAway')}
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
            provider={(isAmazonAndroid() || isExpoGoAndroid) ? undefined : (Platform.OS === 'ios' ? PROVIDER_GOOGLE : undefined)}
            mapType={(isAmazonAndroid() || isExpoGoAndroid) ? 'none' : 'standard'}
            customMapStyle={isAmazonAndroid() ? undefined : (theme.mode === 'dark' ? NIGHT_MAP_STYLE : [])}
          initialRegion={{
            latitude: userLocation?.coords.latitude || GBSYS_COSTA_RICA.latitude,
            longitude: userLocation?.coords.longitude || GBSYS_COSTA_RICA.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onLongPress={(event) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            handleMapLongPress(latitude, longitude);
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
          liteMode={false}
          moveOnMarkerPress={true}
          followsUserLocation={false}
          toolbarEnabled={false}
          onRegionChangeComplete={(region) => setCurrentRegion(region)}
          onPress={() => {
            if (Date.now() - lastMarkerPressRef.current < 250) {
              return;
            }
            // If spiral is open and an overlay is visible, close ONLY the overlay
            if (isExpanded && selectedTask) {
              setSelectedTask(null);
              setSelectedTaskUser(null);
              setSelectedUserPayments(null);
              if (previewTaskId) setPreviewTaskId(null);
              return;
            }
            // If spiral is open and no overlay, collapse the spiral
            if (isExpanded) {
              setIsExpanded(false);
              setExpandedPositions({});
              setExpandedCluster(null);
              if (previewTaskId) setPreviewTaskId(null);
              return;
            }
            // No spiral: close overlay/tooling if any
            if (selectedTask) {
              setSelectedTask(null);
              setSelectedTaskUser(null);
              setSelectedUserPayments(null);
            }
            if (previewTaskId) setPreviewTaskId(null);
          }}
        >
          {(isAmazonAndroid() || isExpoGoAndroid) && (
            <UrlTile
              urlTemplate={theme.mode === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
              maximumZ={19}
              tileSize={256}
            />
          )}
          {/* Home marker */}
          {((user as any)?.home_latitude != null && (user as any)?.home_longitude != null) && (
            <Marker
              key="home-marker"
              coordinate={{ latitude: (user as any).home_latitude, longitude: (user as any).home_longitude }}
              title={t('goHome')}
              description={t('address')}
              pinColor="#1E3A8A"
            >
              <View style={[styles.homeMarker, { backgroundColor: theme.mode === 'light' ? '#0F3576' : '#1E3A8A' }]}>
                <Text style={styles.homeMarkerEmoji}>🏠</Text>
              </View>
            </Marker>
          )}
          {filteredTasks.map((task) => {
            // Determine if price label should be shown based on proximity (zoom-aware)
            const thresholdMeters = computeLabelSeparationMeters();
            const hasCloseNeighbor = filteredTasks.some((other) => {
              if (other.id === task.id) return false;
              return (
                calculateDistance(
                  task.latitude || 0,
                  task.longitude || 0,
                  other.latitude || 0,
                  other.longitude || 0,
                ) * 1000
              ) <= thresholdMeters;
            });
            // In expanded mode: ALWAYS show for spiral members; for non-members, show if outside cluster buffer and not overcrowded
            const isSpiralMember = isExpanded && !!expandedPositions[task.id];
            let showPriceLabel = false;
            if (isExpanded) {
              if (isSpiralMember) {
                showPriceLabel = true;
              } else if (expandedCluster) {
                const bufferMeters = computeMetersForPixels(66); // 1.5x buffer outside cluster
                const dMeters = calculateDistance(
                  expandedCluster.lat,
                  expandedCluster.lon,
                  task.latitude || 0,
                  task.longitude || 0
                ) * 1000;
                const outsideCluster = dMeters > (expandedCluster.radiusMeters + bufferMeters);
                showPriceLabel = outsideCluster && !hasCloseNeighbor;
              } else {
                showPriceLabel = !hasCloseNeighbor;
              }
            } else {
              // If not expanded: always show for tasks separated at least ~15% of the overlap radius
              const looseThreshold = computeOverlapMeters() * 0.15;
              const nearAnother = filteredTasks.some((other) => {
                if (other.id === task.id) return false;
                const d = calculateDistance(
                  task.latitude || 0,
                  task.longitude || 0,
                  other.latitude || 0,
                  other.longitude || 0
                ) * 1000;
                return d < looseThreshold;
              });
              showPriceLabel = !nearAnother;
            }
            const isClusterAnchor = isExpanded && expandedCluster && expandedCluster.radiusMeters > 0 && task.id === '__cluster_close__';
            if (isClusterAnchor) return null;
            return (
            <Marker
              key={task.id}
              coordinate={{
                latitude: isExpanded && expandedPositions[task.id]?.latitude != null ? expandedPositions[task.id].latitude : (task.latitude || 0),
                longitude: isExpanded && expandedPositions[task.id]?.longitude != null ? expandedPositions[task.id].longitude : (task.longitude || 0),
              }}
              onPress={() => handleMarkerPress(task)}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.customMarker, { backgroundColor: getCategoryColor(task.category) }]}>
                  <Text style={styles.markerEmoji}>{getCategoryIcon(task.category)}</Text>
                </View>
                {(isSpiralMember || showPriceLabel) && (
                  <View style={styles.priceLabelContainer} pointerEvents="none">
                    <Text style={styles.priceLabelText}>{t('currency')}{(task.reward ?? 0).toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </Marker>
          );})}
          {isExpanded && expandedCluster && (
            <Marker
              key="cluster-close"
              coordinate={{
                latitude: expandedCluster.lat + metersToLat(expandedCluster.radiusMeters * 1.25),
                longitude: expandedCluster.lon + metersToLon(expandedCluster.radiusMeters * 1.25, expandedCluster.lat),
              }}
              onPress={() => {
                setIsExpanded(false);
                setExpandedPositions({});
                setExpandedCluster(null);
                if (selectedTask) {
                  setSelectedTask(null);
                  setSelectedTaskUser(null);
                  setSelectedUserPayments(null);
                }
                if (previewTaskId) setPreviewTaskId(null);
              }}
            >
              <View style={[styles.clusterCloseMarker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text.primary }}>✕</Text>
              </View>
            </Marker>
          )}
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
        {/* Home button to jump to saved home address */}
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.surface, marginTop: 8 }]}
          onPress={() => {
            // Fallback to demo center if no saved home is available
            const homeLat = (user as any)?.home_latitude ?? GBSYS_COSTA_RICA.latitude;
            const homeLon = (user as any)?.home_longitude ?? GBSYS_COSTA_RICA.longitude;
            const nextRegion: Region = {
              latitude: homeLat,
              longitude: homeLon,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            };
            setCurrentRegion(nextRegion);
            mapRef.current?.animateToRegion(nextRegion, 400);
          }}
        >
          <Text style={[styles.zoomLabel, { color: theme.colors.text.primary }]}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Cluster Close Button removed from map overlay; replaced with anchored marker near spiral */}

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
              <Text style={[styles.detailMetaText, { color: theme.colors.text.primary }]}>{t('address')}: {selectedTask.location}</Text>
            </View>
            <View style={styles.detailMetaItem}>
              <Text style={styles.detailMetaIcon}>🧭</Text>
              <Text style={[styles.detailMetaText, { color: theme.colors.text.secondary }]}>{t('at')} {selectedTask.distance?.toFixed(1)} {t('kilometersAway')}</Text>
            </View>
          </View>

          <Text style={styles.detailReward}>₡{selectedTask.reward?.toLocaleString()}</Text>

          {selectedTaskUser && (
            <View style={[styles.posterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <UserProfileCard user={selectedTaskUser} compact={true} paymentsMade={selectedUserPayments?.made} />
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
  homeMarker: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerEmoji: {
    fontSize: 18,
  },
  priceLabelContainer: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2,
  },
  priceLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  homeMarkerEmoji: {
    fontSize: 18,
    color: 'white',
  },
  clusterCloseMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
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
