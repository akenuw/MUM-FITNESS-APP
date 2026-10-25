import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BottomNavBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: 'Home', icon: 'home', route: '/(tabs)' },
    { name: 'Workouts', icon: 'fitness', route: '/(tabs)/workouts' },
    { name: 'Nutrition', icon: 'restaurant', route: '/(tabs)/nutrition' },
    { name: 'Progress', icon: 'stats-chart', route: '/(tabs)/progress' },
    { name: 'Profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {navItems.map((item) => {
        const isSelected =
          pathname === item.route ||
          (item.route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)'));

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace(item.route as any)}
          >
            <View style={[styles.iconWrapper, isSelected && styles.iconWrapperActive]}>
              <Ionicons
                name={isSelected ? (`${item.icon}` as any) : (`${item.icon}-outline` as any)}
                size={22}
                color={isSelected ? '#FF6A3D' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navText,
                isSelected ? styles.navTextSelected : styles.navTextInactive
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 46,
  },
  iconWrapper: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#FFF4EE',
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  navTextSelected: {
    color: '#FF6A3D',
    fontWeight: '700',
  },
  navTextInactive: {
    color: '#64748B',
  },
});
