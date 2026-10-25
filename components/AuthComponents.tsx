import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Tactile Button with 0.97x spring scale physics and light haptic feedback
 */
interface TactilePressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeScale?: number;
}

export function TactilePressable({
  style,
  children,
  activeScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: TactilePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(activeScale, { damping: 15, stiffness: 300 });
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * Official 4-color Google "G" SVG Icon
 */
export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        fill="#4285F4"
      />
      <Path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.37 7.31 24 12 24z"
        fill="#34A853"
      />
      <Path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
        fill="#FBBC05"
      />
      <Path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/**
 * Official Black Apple Logo SVG Icon
 */
export function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#141518">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.66-2.84 1.45-.58.68-1.1 1.77-.96 2.84 1.12.09 2.22-.56 2.84-1.34z" />
    </Svg>
  );
}

/**
 * Node-Tipped Divider flanking text e.g., "or sign up with"
 */
export function NodeTippedDivider({ text = 'or sign up with' }: { text?: string }) {
  return (
    <View style={dividerStyles.row}>
      <View style={dividerStyles.lineLeftWrap}>
        <View style={dividerStyles.line} />
        <View style={dividerStyles.node} />
      </View>
      <Text style={dividerStyles.text}>{text}</Text>
      <View style={dividerStyles.lineRightWrap}>
        <View style={dividerStyles.node} />
        <View style={dividerStyles.line} />
      </View>
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    width: '100%',
  },
  lineLeftWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineRightWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E6EB',
  },
  node: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D0D4DC',
  },
  text: {
    fontSize: 12,
    color: '#7C808B',
    marginHorizontal: 12,
    fontWeight: '400',
  },
});

/**
 * Biometric Glowing Hotspot with breathing pulse animation
 */
export function BiometricHotspot({
  top,
  left,
  right,
  bottom,
}: {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1200 }),
        withTiming(1.0, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.85 - (pulse.value - 1) * 1.5,
  }));

  return (
    <View style={[hotspotStyles.container, { top, left, right, bottom } as any]}>
      {/* Translucent Breathing Outer Halo */}
      <Animated.View style={[hotspotStyles.halo, haloAnimatedStyle]} />
      {/* Crisp White Ring */}
      <View style={hotspotStyles.whiteRing}>
        {/* Solid Warm Coral-Orange Center Dot */}
        <View style={hotspotStyles.orangeDot} />
      </View>
    </View>
  );
}

const hotspotStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  halo: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 87, 51, 0.35)',
  },
  whiteRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5733',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5733',
  },
});

/**
 * Floating "Brain MRI" Diagnostic Card (Top-Right Overlay)
 */
export function BrainDiagnosticCard() {
  return (
    <View style={cardStyles.container}>
      {/* Top Row: Brain Icon + Details */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.brainIconWrapper}>
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#FDECE8" />
            <Path
              d="M9 8C7.5 8 7 9.5 7 11C7 12.5 8 13 8 14C8 15 7.5 16 9 16C10 16 10.5 15.5 11 15C11.5 15.5 12 16 13 16C14.5 16 14 15 14 14C14 13 15 12.5 15 11C15 9.5 14.5 8 13 8C12 8 11.5 8.5 11 9C10.5 8.5 10 8 9 8Z"
              fill="#FF5733"
            />
            <Path
              d="M11 9V15M9 11H13M8.5 13.5H13.5"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        <View style={cardStyles.textCol}>
          <Text style={cardStyles.overline}>Blood test</Text>
          <Text style={cardStyles.title}>Brain MRI</Text>
        </View>
      </View>

      {/* Connecting indicator pointer */}
      <View style={cardStyles.indicatorDot} />

      {/* Bottom Waveform Graph (ECG / neural frequency line) */}
      <View style={cardStyles.waveformWrap}>
        <Svg width="120" height="24" viewBox="0 0 120 24" fill="none">
          <Path
            d="M 2 14 L 18 14 L 24 7 L 30 20 L 36 4 L 42 17 L 46 14 L 60 14 L 66 8 L 72 19 L 78 5 L 84 17 L 88 14 L 118 14"
            stroke="#C45A41"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 148,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    zIndex: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brainIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    justifyContent: 'center',
  },
  overline: {
    fontSize: 9.5,
    color: '#8E939E',
    fontWeight: '400',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#141518',
    marginTop: 1,
  },
  indicatorDot: {
    position: 'absolute',
    left: -6,
    top: 18,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#86EFAC',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  waveformWrap: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
});
