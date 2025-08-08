import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { taskService, Task, TASK_CATEGORIES } from '../lib/database';
import ChambitoMascot from '../components/ChambitoMascot';

interface TaskWithDistance extends Task {
  distance: number;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapScreen() {
  const [tasks, setTasks] = useState<TaskWithDistance[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState(10); // 10km default
  const [region, setRegion] = useState<Region>({
    latitude: 9.9281, // San José, Costa Rica
    longitude: -84.0907,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  
  const mapRef = useRef<MapView>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyTasks();
      updateMapRegion();
    }
  }, [userLocation, selectedCategory, maxDistance]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedCategory]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show nearby tasks. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Using default location.');
    }
  };

  const updateMapRegion = () => {
    if (userLocation) {
      const newRegion: Region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  const fetchNearbyTasks = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      let result;
      
      if (selectedCategory) {
        result = await taskService.getTasksByCategoryAndLocation(
          selectedCategory,
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          maxDistance
        );
      } else {
        result = await taskService.getNearbyTasks(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          maxDistance
        );
      }

      if (result.error) {
        Alert.alert('Error', 'Failed to fetch nearby tasks');
        return;
      }

      setTasks(result.data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (selectedCategory) {
      setFilteredTasks(tasks.filter(task => task.category === selectedCategory));
    } else {
      setFilteredTasks(tasks);
    }
  };

  const handleMarkerPress = (task: TaskWithDistance) => {
    router.push(`/task/${task.id}`);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleDistanceFilter = (distance: number) => {
    setMaxDistance(distance);
  };

  const getMarkerColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Cleaning': '#FF6B35',
      'Gardening': '#4CAF50',
      'Pet Care': '#9C27B0',
      'Delivery': '#2196F3',
      'Moving': '#FF9800',
      'Repairs': '#795548',
      'Tutoring': '#607D8B',
      'Technology': '#E91E63',
      'Cooking': '#FF5722',
      'Other': '#9E9E9E',
    };
    return colors[category] || '#9E9E9E';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (loading && !userLocation) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ChambitoMascot mood="working" size="large" />
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 20 }} />
        <Text className="mt-4 text-gray-600">Getting your location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <ChambitoMascot mood="happy" size="small" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">Map View</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Back</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600">
          {filteredTasks.length} tasks nearby • {formatDistance(maxDistance)} radius
        </Text>
      </View>

      {/* Filters */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-gray-700 font-medium mb-2">Filter by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TASK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryFilter(category)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedCategory === category
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedCategory === category ? 'text-white' : 'text-gray-700'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Distance Filter */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-gray-700 font-medium mb-2">Distance Radius</Text>
        <View className="flex-row">
          {[5, 10, 20, 50].map((distance) => (
            <TouchableOpacity
              key={distance}
              onPress={() => handleDistanceFilter(distance)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                maxDistance === distance
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`font-medium ${
                  maxDistance === distance ? 'text-white' : 'text-gray-700'
                }`}
              >
                {distance}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map */}
      <View className="flex-1">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {filteredTasks.map((task) => (
            <Marker
              key={task.id}
              coordinate={{
                latitude: task.latitude || 0,
                longitude: task.longitude || 0,
              }}
              title={task.title}
              description={`₡${task.reward?.toLocaleString()} • ${formatDistance(task.distance)} away`}
              pinColor={getMarkerColor(task.category)}
              onPress={() => handleMarkerPress(task)}
            />
          ))}
        </MapView>
      </View>

      {/* Task List Overlay */}
      {filteredTasks.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-h-48">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-4">
            {filteredTasks.slice(0, 5).map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => handleMarkerPress(task)}
                className="bg-white mr-4 p-3 rounded-lg shadow-sm border border-gray-200 min-w-48"
              >
                <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                  {task.title}
                </Text>
                <Text className="text-green-600 font-bold mb-1">
                  ₡{task.reward?.toLocaleString()}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatDistance(task.distance)} away • {task.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-4 rounded-lg">
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text className="mt-2 text-gray-600">Loading nearby tasks...</Text>
          </View>
        </View>
      )}
    </View>
  );
}



