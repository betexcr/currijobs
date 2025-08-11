import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { FEATURE_FLAGS } from '../lib/feature-flags';
import { useLocalization } from '../contexts/LocalizationContext';

interface BottomNavItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const makeNavItems = (t: ReturnType<typeof useLocalization>['t']): BottomNavItem[] => {
  const items: BottomNavItem[] = [
    { name: 'Map', icon: '🗺️', route: '/', label: t('mapView') },
    { name: 'MyTasks', icon: '📁', route: '/my-tasks', label: t('myTasks') },
    { name: 'Profile', icon: '👤', route: '/profile', label: t('profile') },
  ];
  if (FEATURE_FLAGS.ENABLE_LIST_VIEW_LINK) {
    items.splice(1, 0, { name: 'Tasks', icon: '📋', route: '/tasks', label: t('taskList') });
  }
  return items;
};

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const navItems = makeNavItems(t);

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            styles.navItem,
            isActive(item.route) && { backgroundColor: '#1E3A8A' }
          ]}
          onPress={() => handleNavigation(item.route)}
        >
          <Text style={[
            styles.navIcon,
            isActive(item.route) && { color: 'white' }
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            { color: isActive(item.route) ? 'white' : theme.colors.text.secondary }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
