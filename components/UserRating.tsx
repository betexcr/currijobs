import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface UserRatingProps {
  rating: number; // 0 to 5 in 0.1 increments
  totalReviews: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const UserRating: React.FC<UserRatingProps> = ({ 
  rating, 
  totalReviews, 
  size = 'medium',
  showText = true 
}) => {
  const { theme } = useTheme();
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={getStarSize()}
          color={theme.colors.primary.yellow}
        />
      );
    }
    
    // Render half star if needed
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={getStarSize()}
          color={theme.colors.primary.yellow}
        />
      );
    }
    
    // Render empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={getStarSize()}
          color={theme.colors.text.secondary}
        />
      );
    }
    
    return stars;
  };
  
  const getStarSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 20;
      default: return 16;
    }
  };
  
  const getTextSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 16;
      default: return 12;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showText && (
        <Text style={[
          styles.ratingText, 
          { 
            fontSize: getTextSize(),
            color: theme.colors.text.secondary 
          }
        ]}>
          {rating.toFixed(1)} ({totalReviews} reviews)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingText: {
    fontWeight: '500',
  },
});

export default UserRating;

