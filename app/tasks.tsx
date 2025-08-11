import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fetchTasks } from '../lib/database';
import type { Task } from '../lib/types';
import { useLocalization } from '../contexts/LocalizationContext';
import { getCategoryLabel } from '../lib/utils';
import CategoryIcon from '../components/CategoryIcon';
import ChambitoMascot from '../components/ChambitoMascot';
import BottomNavigation from '../components/BottomNavigation';
import { typography, spacing } from '../lib/designSystem';

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

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
      return;
    }
    loadTasks();
    // Fallback timeout so UI doesn't spin forever
    const timeout = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(timeout);
  }, [user]);

  const getAvailableCategories = (taskList: Task[]) => {
    const categories = new Set<string>(['All']);
    taskList.forEach(task => {
      if (task.category) {
        categories.add(task.category);
      }
    });
    return Array.from(categories);
  };

  const loadTasks = async () => {
    try {
      const taskList = await fetchTasks();
      setTasks(taskList);
      setAvailableCategories(getAvailableCategories(taskList));
      filterTasks(taskList);
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = (taskList: Task[]) => {
    let filtered = taskList;
    
    // Apply category filter
    const useAll = selectedCategories.length === 0 || selectedCategories.includes('All');
    if (!useAll) {
      const setSel = new Set(selectedCategories);
      filtered = filtered.filter(task => setSel.has(task.category));
    }
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(task => 
        fuzzySearch(searchQuery, task.title) ||
        fuzzySearch(searchQuery, task.description) ||
        fuzzySearch(searchQuery, task.category) ||
        fuzzySearch(searchQuery, task.location || '')
      );
    }
    
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    filterTasks(tasks);
  }, [tasks, searchQuery, selectedCategories]);

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

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleCategorySelect = (category: string) => {
    setSearchQuery('');
    setSelectedCategories(prev => {
      if (category === 'All') return ['All'];
      const hasAll = prev.includes('All');
      const next = new Set<string>(hasAll ? [] : prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      const arr = Array.from(next);
      return arr.length === 0 ? ['All'] : arr;
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ChambitoMascot mood="thinking" size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>Loading tasks...</Text>
        </View>
      </View>
    );
  }

  // Empty state if there are no tasks to show
  if (!loading && filteredTasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.loadingContainer}> 
          <ChambitoMascot mood="sad" size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>No tasks found</Text>
          <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => router.push('/')} style={[styles.mapButton, { backgroundColor: '#1E3A8A' }]}> 
              <Text style={[styles.mapButtonText]}>Go to Map</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/create-task')} style={[styles.createButton, { backgroundColor: '#FF6B35' }]}> 
              <Text style={[styles.createButtonText]}>+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ChambitoMascot mood="happy" size="small" />
            <Text style={[styles.headerTitle, { color: 'white' }]}>
              Task List
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={[styles.mapButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            >
              <Text style={styles.mapButtonText}>🗺️ Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/create-task')}
              style={[styles.createButton, { backgroundColor: '#FF6B35' }]}
            >
              <Text style={styles.createButtonText}>+ Create</Text>
            </TouchableOpacity>
          </View>
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
          {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} found
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
                ((selectedCategories.includes('All') && category === 'All') || selectedCategories.includes(category))
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

      {/* Task List */}
      <ScrollView style={styles.taskList} contentContainerStyle={styles.taskListContent}>
        {filteredTasks.slice(0, 20).map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/task/${task.id}`)}
          >
            <View style={styles.taskCardHeader}>
              <CategoryIcon category={task.category} size="small" />
              <Text style={[styles.taskCardTitle, { color: theme.colors.text.primary }]}>{task.title}</Text>
            </View>
            <Text style={[styles.taskCardLocation, { color: theme.colors.text.secondary }]}>{task.location}</Text>
            <Text style={[styles.taskCardReward, { color: '#FF6B35' }]}>₡{task.reward?.toLocaleString()}</Text>
            <TouchableOpacity
              style={[styles.offerButton, { backgroundColor: '#1E3A8A' }]}
              onPress={() => router.push(`/make-offer?taskId=${task.id}`)}
            >
              <Text style={styles.offerButtonText}>{t('submitOffer')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  header: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  mapButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapButtonText: {
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
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
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
    paddingVertical: spacing.xs,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginRight: spacing.xs,
    backgroundColor: 'rgba(59,130,246,0.08)',
    minWidth: 64,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 12,
    marginBottom: 0,
  },
  categoryText: {
    ...typography.small,
    textTransform: 'capitalize',
    color: '#E5E7EB',
  },
  categoryButtonDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(148,163,184,0.15)',
  },
  categoryTextDisabled: {
    color: '#94A3B8',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  taskCardLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  taskCardReward: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  offerButton: {
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
});
