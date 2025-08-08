import { TaskCategory } from './types';
import type { LocalizationStrings } from './localization';

// Category icons mapping
export const getCategoryIcon = (category: TaskCategory): string => {
  const iconMap: Record<TaskCategory, string> = {
    plumbing: '🔧',
    electrician: '⚡',
    carpentry: '🪚',
    painting: '🎨',
    appliance_repair: '🔧',
    cleaning: '🧹',
    laundry_ironing: '👕',
    cooking: '👨‍🍳',
    grocery_shopping: '🛒',
    pet_care: '🐾',
    gardening: '🌱',
    moving_help: '📦',
    trash_removal: '🗑️',
    window_washing: '🧽',
    babysitting: '👶',
    elderly_care: '👴',
    tutoring: '📚',
    delivery_errands: '🛵',
    tech_support: '💻',
    photography: '📸',
  };
  
  return iconMap[category] || '📋';
};

// Category colors mapping
export const getCategoryColor = (category: TaskCategory): string => {
  const colorMap: Record<TaskCategory, string> = {
    plumbing: '#3B82F6', // Blue
    electrician: '#F59E0B', // Amber
    carpentry: '#8B4513', // Brown
    painting: '#10B981', // Emerald
    appliance_repair: '#6B7280', // Gray
    cleaning: '#8B5CF6', // Violet
    laundry_ironing: '#EC4899', // Pink
    cooking: '#F97316', // Orange
    grocery_shopping: '#84CC16', // Lime
    pet_care: '#06B6D4', // Cyan
    gardening: '#22C55E', // Green
    moving_help: '#6366F1', // Indigo
    trash_removal: '#EF4444', // Red
    window_washing: '#0EA5E9', // Sky
    babysitting: '#F472B6', // Rose
    elderly_care: '#A855F7', // Purple
    tutoring: '#F59E0B', // Amber
    delivery_errands: '#10B981', // Emerald
    tech_support: '#3B82F6', // Blue
    photography: '#8B5CF6', // Violet
  };
  
  return colorMap[category] || '#6B7280';
};

// Map a category slug to a human, localized label via the translation function
export const getCategoryLabel = (
  category: TaskCategory,
  t: (key: keyof LocalizationStrings) => string
): string => {
  switch (category) {
    case 'plumbing':
      return t('plumbing');
    case 'electrician':
      return t('electrician');
    case 'carpentry':
      return t('carpentry');
    case 'painting':
      return t('painting');
    case 'appliance_repair':
      return t('applianceRepair');
    case 'cleaning':
      return t('cleaning');
    case 'laundry_ironing':
      return t('laundryIroning');
    case 'cooking':
      return t('cooking');
    case 'grocery_shopping':
      return t('groceryShopping');
    case 'pet_care':
      return t('petCare');
    case 'gardening':
      return t('gardening');
    case 'moving_help':
      return t('movingHelp');
    case 'trash_removal':
      return t('trashRemoval');
    case 'window_washing':
      return t('windowWashing');
    case 'babysitting':
      return t('babysitting');
    case 'elderly_care':
      return t('elderlyCare');
    case 'tutoring':
      return t('tutoring');
    case 'delivery_errands':
      return t('deliveryErrands');
    case 'tech_support':
      return t('techSupport');
    case 'photography':
      return t('photography');
    default:
      return category;
  }
};

// Format currency (Costa Rican Colones)
export const formatCurrency = (amount: number): string => {
  return `₡${amount.toLocaleString()}`;
};

// Calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Hoy';
  } else if (diffDays === 2) {
    return 'Ayer';
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`;
  } else {
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Costa Rican format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+506)?[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Truncate text to specified length
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
