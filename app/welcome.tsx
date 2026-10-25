import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const PRIMARY_ORANGE = Colors.light.primary || '#FF7E45';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Login or signup to continue</Text>
      </View>

      {/* Visual breathing space reserved for future illustration */}
      <View style={styles.imageSpacer} />

      {/* Bottom Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.primaryButtonText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.88}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
    textAlign: 'left',
  },
  imageSpacer: {
    flex: 1,
    minHeight: 180,
  },
  actionSection: {
    width: '100%',
    gap: 14,
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: PRIMARY_ORANGE, // Established orange brand color
    height: 56,
    borderRadius: 28, // Rounded pill shape matching reference
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // High-contrast crisp white text
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
