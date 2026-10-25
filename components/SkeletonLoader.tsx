import React, { useEffect, useRef } from 'react';
import {
  Animated,
  DimensionValue,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface SkeletonItemProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * High-performance, lightweight pulsating skeleton block using native animations.
 */
export function SkeletonItem({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonItemProps) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

/**
 * Full structural wireframe for the Home Dashboard.
 */
export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Greeting Row */}
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={120} height={14} style={{ marginBottom: 8 }} />
          <SkeletonItem width={180} height={26} borderRadius={6} />
        </View>
        <SkeletonItem width={48} height={48} borderRadius={24} />
      </View>

      {/* Motivational / Today Banner */}
      <SkeletonItem
        height={110}
        borderRadius={18}
        style={{ marginTop: 24, marginBottom: 20 }}
      />

      {/* Weekly Activity Days Row */}
      <View style={styles.daysRow}>
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <SkeletonItem
            key={item}
            width={40}
            height={60}
            borderRadius={12}
            style={{ marginHorizontal: 4 }}
          />
        ))}
      </View>

      {/* Metric Cards Row */}
      <View style={[styles.rowBetween, { marginTop: 24, gap: 12 }]}>
        <SkeletonItem height={90} borderRadius={16} style={{ flex: 1 }} />
        <SkeletonItem height={90} borderRadius={16} style={{ flex: 1 }} />
        <SkeletonItem height={90} borderRadius={16} style={{ flex: 1 }} />
      </View>

      {/* Section Title */}
      <SkeletonItem
        width={160}
        height={20}
        style={{ marginTop: 28, marginBottom: 14 }}
      />

      {/* Featured Workout Routine Card */}
      <SkeletonItem height={160} borderRadius={20} style={{ marginBottom: 16 }} />
      <SkeletonItem height={100} borderRadius={16} />
    </View>
  );
}

/**
 * Structural wireframe for Workouts screen.
 */
export function WorkoutListSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search / Filter Chips */}
      <View style={styles.chipsRow}>
        <SkeletonItem width={80} height={36} borderRadius={18} />
        <SkeletonItem width={100} height={36} borderRadius={18} />
        <SkeletonItem width={90} height={36} borderRadius={18} />
      </View>

      {/* List of Workout Cards */}
      {[1, 2, 3, 4].map((id) => (
        <View key={id} style={styles.workoutCardSkeleton}>
          <SkeletonItem width={80} height={80} borderRadius={14} />
          <View style={{ flex: 1, marginLeft: 14, justifyContent: 'center' }}>
            <SkeletonItem width={70} height={12} style={{ marginBottom: 8 }} />
            <SkeletonItem width={160} height={18} style={{ marginBottom: 10 }} />
            <SkeletonItem width={110} height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Structural wireframe for Profile screen.
 */
export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Centered Avatar and Name */}
      <View style={styles.centerCol}>
        <SkeletonItem width={96} height={96} borderRadius={48} />
        <SkeletonItem
          width={150}
          height={22}
          borderRadius={6}
          style={{ marginTop: 16, marginBottom: 8 }}
        />
        <SkeletonItem width={190} height={14} borderRadius={4} />
      </View>

      {/* Stats Summary Box */}
      <SkeletonItem
        height={85}
        borderRadius={16}
        style={{ marginTop: 28, marginBottom: 24 }}
      />

      {/* Option Rows */}
      {[1, 2, 3, 4].map((item) => (
        <SkeletonItem
          key={item}
          height={56}
          borderRadius={14}
          style={{ marginBottom: 12 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
  },
  container: {
    padding: 20,
    width: '100%',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  centerCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  workoutCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});

export default SkeletonItem;
