import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { authService } from '@/services/api';
import { supabase } from '@/services/supabase';

const PRIMARY_ORANGE = Colors.light.primary || '#FF7E45';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter your registered email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password Required', 'Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      // Direct login with email & password - NO OTP REQUIRED
      await authService.loginWithPassword(cleanEmail, password);

      // Session is stored in device SecureStore -> Straight to the app!
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.message || 'Invalid email or password. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert(
        'Reset Password',
        'Please enter your email in the field above first, then tap Forgot password.'
      );
      return;
    }

    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail);
      Alert.alert(
        'Check Your Email',
        `A password reset link has been dispatched to ${cleanEmail}.`
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send reset link.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Back Control */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        {/* 2. Heading & 3. Subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>Login account</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* 4. Email Label and Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#94A3B8"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 5. Password Label and Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#94A3B8"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.rightIcon}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. Remember-me Checkbox & Forgot Password Link */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
            >
              <View
                style={[
                  styles.checkbox,
                  keepLoggedIn && styles.checkboxActive,
                ]}
              >
                {keepLoggedIn && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Keep me logged in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* 7. Orange Login Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            activeOpacity={0.88}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 8. Existing-Account Creation Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: 24,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  header: {
    marginBottom: 26,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 54,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 26,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: PRIMARY_ORANGE,
    borderColor: PRIMARY_ORANGE,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
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
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // High-contrast crisp white text
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupLink: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
