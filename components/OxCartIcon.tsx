import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OxCartIconProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function OxCartIcon({
  size = 'medium',
  style,
}: OxCartIconProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 80, height: 80 };
      default:
        return { width: 60, height: 60 };
    }
  };

  return (
    <View style={[styles.container, getSizeStyle(), style]}>
      {/* Ox Cart Icon */}
      <View style={styles.oxCart}>
        {/* Ox (Blue) */}
        <View style={styles.ox}>
          <View style={styles.oxHead} />
          <View style={styles.oxBody} />
          <View style={styles.oxLegs}>
            <View style={styles.oxLeg} />
            <View style={styles.oxLeg} />
            <View style={styles.oxLeg} />
            <View style={styles.oxLeg} />
          </View>
        </View>
        
        {/* Cart (Red) */}
        <View style={styles.cart}>
          {/* Cart Body */}
          <View style={styles.cartBody}>
            {/* Cart Contents */}
            <View style={styles.cartContents}>
              <View style={styles.wrench} />
              <View style={styles.house} />
              <View style={styles.heart} />
            </View>
          </View>
          
          {/* Wheel */}
          <View style={styles.wheel}>
            <View style={styles.wheelRim} />
            <View style={styles.wheelCenter}>
              <View style={styles.dollarSign} />
            </View>
            <View style={styles.wheelSpokes}>
              <View style={styles.spoke} />
              <View style={styles.spoke} />
              <View style={styles.spoke} />
              <View style={styles.spoke} />
            </View>
          </View>
          
          {/* Axle */}
          <View style={styles.axle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  oxCart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ox: {
    alignItems: 'center',
    marginRight: 8,
  },
  oxHead: {
    width: 12,
    height: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    marginBottom: 2,
  },
  oxBody: {
    width: 16,
    height: 12,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
  },
  oxLegs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
    marginTop: 2,
  },
  oxLeg: {
    width: 2,
    height: 6,
    backgroundColor: '#1E3A8A',
    borderRadius: 1,
  },
  cart: {
    alignItems: 'center',
  },
  cartBody: {
    width: 20,
    height: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cartContents: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
  },
  wrench: {
    width: 4,
    height: 6,
    backgroundColor: '#FBC02D',
    borderRadius: 2,
  },
  house: {
    width: 4,
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  heart: {
    width: 4,
    height: 4,
    backgroundColor: '#F44336',
    borderRadius: 2,
  },
  wheel: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  wheelRim: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderRadius: 8,
  },
  wheelCenter: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 12,
    height: 12,
    backgroundColor: '#FBC02D',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollarSign: {
    width: 6,
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  wheelSpokes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spoke: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 1,
  },
  axle: {
    width: 12,
    height: 2,
    backgroundColor: '#1E3A8A',
    borderRadius: 1,
    marginTop: 2,
  },
});
