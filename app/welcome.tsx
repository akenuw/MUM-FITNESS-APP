import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BiometricHotspot,
  BrainDiagnosticCard,
  TactilePressable,
} from '@/components/AuthComponents';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLOR_PRIMARY_ORANGE = '#FF6B2C';
const COLOR_TITLE = '#141518';
const COLOR_SUBTITLE = '#7C808B';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {/* 1. Top Header Block */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Login or signup to continue</Text>
      </Animated.View>

      {/* 2. Center Anatomy Hero & Floating Diagnostic Card */}
      <View style={styles.heroStage}>
        {/* Anatomical Muscular Human Body Image */}
        <Image
          source={require('@/assets/images/image1.png')}
          style={styles.anatomyImage}
          resizeMode="contain"
        />

        {/* 3 Glowing Biometric Hotspots with Breathing Pulse */}
        <BiometricHotspot top="18%" left="37%" />
        <BiometricHotspot top="33%" left="42%" />
        <BiometricHotspot top="49%" left="44%" />

        {/* Floating "Brain MRI" Diagnostic Card */}
        <BrainDiagnosticCard />
      </View>

      {/* 3. Bottom Action Sheet Container (No Guest Mode) */}
      <Animated.View
        entering={FadeInDown.duration(450).delay(100)}
        style={styles.bottomCardWrapper}
      >
        <View style={styles.bottomActionCard}>
          {/* Primary CTA: "Create account" (Vibrant Product Orange) */}
          <TactilePressable
            style={styles.primaryButton}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.primaryButtonText}>Create account</Text>
          </TactilePressable>

          {/* Secondary Button: "Already have an account" */}
          <TactilePressable
            style={styles.secondaryButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>Already have an account</Text>
          </TactilePressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 29,
    fontWeight: '700',
    color: COLOR_TITLE,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLOR_SUBTITLE,
    fontWeight: '400',
    marginTop: 4,
  },
  heroStage: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  anatomyImage: {
    width: SCREEN_WIDTH * 0.84,
    height: SCREEN_HEIGHT * 0.52,
    alignSelf: 'center',
    marginBottom: -10,
  },
  bottomCardWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bottomActionCard: {
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#FDE3D5',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B2C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButton: {
    backgroundColor: COLOR_PRIMARY_ORANGE,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLOR_PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 27,
    borderWidth: 1.2,
    borderColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLOR_TITLE,
  },
});
