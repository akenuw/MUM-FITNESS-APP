import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Bottom Navigation Bar
 * Custom floating pill container matching the reference mockup specification:
 * - Floating capsule pill: backgroundColor '#F1F3F6', height 62, borderRadius 31
 * - NO center plus button
 * - 4 evenly distributed buttons:
 *   1. Home: Rounded house with tiny center dot when active -> /(tabs)
 *   2. Nutrition / Food: Covered food cloche platter -> /(tabs)/nutrition
 *   3. Workout / Training: 45° angled dumbbell -> /(tabs)/workouts
 *   4. Analytics / Stats: Pie chart with offset slice -> /(tabs)/profile
 * - Active color: Brand Teal (#0F8B8D)
 * - Inactive color: Muted Cool Gray (#C2C7D0)
 */

interface TabItemConfig {
  routeName: string;
  fallbackPath: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
  label: string;
}

const COLOR_ACTIVE = '#0F8B8D';
const COLOR_INACTIVE = '#C2C7D0';

const TABS: TabItemConfig[] = [
  {
    routeName: 'index',
    fallbackPath: '/(tabs)',
    label: 'Home',
    renderIcon: (isActive) => {
      const color = isActive ? COLOR_ACTIVE : COLOR_INACTIVE;
      return (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          {/* Rounded House Outline */}
          <Path
            d="M3.8 10.7L10.5 4.8C11.4 4 12.6 4 13.5 4.8L20.2 10.7C20.9 11.3 21 12.3 20.4 13C20 13.4 19.5 13.6 19 13.6V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V13.6C4 13.6 3.2 12.7 3.2 11.7C3.2 11.3 3.4 11 3.8 10.7Z"
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tiny center dot when active */}
          {isActive && <Circle cx="12" cy="14.5" r="2.1" fill={COLOR_ACTIVE} />}
        </Svg>
      );
    },
  },
  {
    routeName: 'nutrition',
    fallbackPath: '/(tabs)/nutrition',
    label: 'Nutrition',
    renderIcon: (isActive) => {
      const color = isActive ? COLOR_ACTIVE : COLOR_INACTIVE;
      return (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          {/* Covered Food Cloche / Dome Platter */}
          <Circle cx="12" cy="5.5" r="1.6" fill={color} />
          {/* Cloche Dome */}
          <Path
            d="M4.5 15.5C4.8 11.2 8 7.8 12 7.8C16 7.8 19.2 11.2 19.5 15.5H4.5Z"
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Serving Platter Base Tray */}
          <Path
            d="M2.8 18.5H21.2"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </Svg>
      );
    },
  },
  {
    routeName: 'workouts',
    fallbackPath: '/(tabs)/workouts',
    label: 'Workouts',
    renderIcon: (isActive) => {
      const color = isActive ? COLOR_ACTIVE : COLOR_INACTIVE;
      return (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          {/* 45° Angled Dumbbell */}
          {/* Connecting Handle */}
          <Path
            d="M8.5 15.5L15.5 8.5"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Top-Right Plates */}
          <Path
            d="M13.8 6.8L17.2 10.2"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Path
            d="M16 4.5L19.5 8"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Bottom-Left Plates */}
          <Path
            d="M6.8 13.8L10.2 17.2"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Path
            d="M4.5 16L8 19.5"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </Svg>
      );
    },
  },
  {
    routeName: 'profile',
    fallbackPath: '/(tabs)/profile',
    label: 'Account',
    renderIcon: (isActive) => {
      const color = isActive ? COLOR_ACTIVE : COLOR_INACTIVE;
      return (
        <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          {/* Analytics / Stats Pie Chart with offset quarter slice */}
          {/* 3/4 Main Pie */}
          <Path
            d="M11 21C6.03 21 2 16.97 2 12C2 7.03 6.03 3 11 3V12L17.36 18.36C15.7 20 13.47 21 11 21Z"
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Offset Top-Right Slice */}
          <Path
            d="M14 2.5C18.2 3.1 21.4 6.3 22 10.5H14V2.5Z"
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    },
  },
];

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

  // Bottom margin calculation ensuring comfortable safe area clearance
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10) + 8;

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.container}>
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
              style={[
                styles.tabItem,
                isActive && styles.tabItemActive,
              ]}
              activeOpacity={0.75}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {tab.renderIcon(isActive)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F1F3F6',
    paddingHorizontal: 8,
    // Subtle refined elevation & shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  tabItem: {
    flex: 1,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabItemActive: {
    transform: [{ scale: 1.05 }],
  },
});

export default BottomNavBar;