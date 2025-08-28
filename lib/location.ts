// Location utilities for address autocomplete and geocoding

export interface AddressSuggestion {
  id: string;
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
}

// Mock address suggestions for demo mode
const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    id: '1',
    description: 'San José, Costa Rica',
    place_id: 'mock_1',
    structured_formatting: {
      main_text: 'San José',
      secondary_text: 'Costa Rica'
    }
  },
  {
    id: '2',
    description: 'Escazú, San José, Costa Rica',
    place_id: 'mock_2',
    structured_formatting: {
      main_text: 'Escazú',
      secondary_text: 'San José, Costa Rica'
    }
  },
  {
    id: '3',
    description: 'Heredia, Costa Rica',
    place_id: 'mock_3',
    structured_formatting: {
      main_text: 'Heredia',
      secondary_text: 'Costa Rica'
    }
  },
  {
    id: '4',
    description: 'Alajuela, Costa Rica',
    place_id: 'mock_4',
    structured_formatting: {
      main_text: 'Alajuela',
      secondary_text: 'Costa Rica'
    }
  },
  {
    id: '5',
    description: 'Cartago, Costa Rica',
    place_id: 'mock_5',
    structured_formatting: {
      main_text: 'Cartago',
      secondary_text: 'Costa Rica'
    }
  }
];

// Mock geocoding results
const MOCK_GEOCODING: Record<string, GeocodingResult> = {
  'mock_1': { latitude: 9.9281, longitude: -84.0907, address: 'San José, Costa Rica' },
  'mock_2': { latitude: 9.9186, longitude: -84.1407, address: 'Escazú, San José, Costa Rica' },
  'mock_3': { latitude: 10.0029, longitude: -84.1165, address: 'Heredia, Costa Rica' },
  'mock_4': { latitude: 10.0169, longitude: -84.2114, address: 'Alajuela, Costa Rica' },
  'mock_5': { latitude: 9.8644, longitude: -83.9194, address: 'Cartago, Costa Rica' }
};

// Check if we're in demo mode
const isDemoMode = () => {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
};

// Get address suggestions based on input
export const getAddressSuggestions = async (input: string): Promise<AddressSuggestion[]> => {
  if (isDemoMode()) {
    // Return mock suggestions based on input
    const filtered = MOCK_ADDRESSES.filter(addr => 
      addr.description.toLowerCase().includes(input.toLowerCase()) ||
      addr.structured_formatting.main_text.toLowerCase().includes(input.toLowerCase())
    );
    return filtered.slice(0, 5); // Limit to 5 results
  }

  // TODO: Implement real Google Places API
  // For now, return mock data
  return MOCK_ADDRESSES.filter(addr => 
    addr.description.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 5);
};

// Geocode an address to get coordinates
export const geocodeAddress = async (placeId: string): Promise<GeocodingResult | null> => {
  if (isDemoMode()) {
    return MOCK_GEOCODING[placeId] || null;
  }

  // TODO: Implement real Google Geocoding API
  // For now, return mock data
  return MOCK_GEOCODING[placeId] || null;
};

// Reverse geocode coordinates to get address
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  if (isDemoMode()) {
    // Find the closest mock location
    let closest: string | null = null;
    let minDistance = Infinity;
    
    Object.entries(MOCK_GEOCODING).forEach(([_placeId, result]) => {
      const distance = Math.sqrt(
        Math.pow(result.latitude - latitude, 2) + 
        Math.pow(result.longitude - longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = result.address;
      }
    });
    
    return closest;
  }

  // TODO: Implement real reverse geocoding
  return null;
};

// Calculate distance between two points
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
