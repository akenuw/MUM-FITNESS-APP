import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  routeName: string;
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  fallbackPath: string;
}

const TABS: TabItem[] = [
  {
    routeName: 'index',
    label: 'Home',
    iconName: 'home-outline',
    fallbackPath: '/(tabs)',
  },
  {
    routeName: 'workouts',
    label: 'Training',
    iconName: 'dumbbell',
    fallbackPath: '/(tabs)/workouts',
  },
  {
    routeName: 'nutrition',
    label: 'Nutrition',
    iconName: 'food-apple-outline',
    fallbackPath: '/(tabs)/nutrition',
  },
  {
    routeName: 'profile',
    label: 'Account',
    iconName: 'account-outline',
    fallbackPath: '/(tabs)/profile',
  },
];

const COLOR_BACKGROUND = '#080808';
const COLOR_BORDER = '#222222';
const COLOR_ACTIVE = '#FF5B6E'; // Reference-matched muted coral accent
const COLOR_INACTIVE = '#A0A0A0'; // Clean muted gray

export interface BottomNavBarProps {
  state?: any;
  navigation?: any;
  descriptors?: any;
}

export function BottomNavBar(props?: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const currentPathname = usePathname();

  const state = props?.state;
  const navigation = props?.navigation;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          let isActive = false;

          if (state) {
            const activeRoute = state.routes[state.index];
            isActive = activeRoute ? activeRoute.name === tab.routeName : false;
          } else {
            isActive =
              currentPathname === tab.fallbackPath ||
              (tab.fallbackPath === '/(tabs)' &&
                (currentPathname === '/' || currentPathname === '/(tabs)'));
          }

          const handlePress = () => {
            if (navigation && state) {
              const targetRoute = state.routes.find((r: any) => r.name === tab.routeName);
              if (targetRoute) {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: targetRoute.key,
                  canPreventDefault: true,
                });

                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(targetRoute.name);
                }
                return;
              }
            }

            // Fallback navigation
            router.replace(tab.fallbackPath as any);
          };

          return (
            <TouchableOpacity
              key={tab.routeName}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={tab.iconName}
                  size={21}
                  color={isActive ? COLOR_ACTIVE : COLOR_INACTIVE}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? COLOR_ACTIVE : COLOR_INACTIVE },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOR_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    width: '100%',
    paddingTop: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 44, // Accessible touch target
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});

export default BottomNavBar;
