import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TactilePressable } from '@/components/AuthComponents';
import { authService, profileService } from '@/services/api';
import { supabase } from '@/services/supabase';

const COLOR_PRIMARY_ORANGE = '#FF6B2C';
const COLOR_TITLE = '#111318';
const COLOR_SUBTITLE = '#7C808B';
const COLOR_BORDER_DEFAULT = '#E2E6ED';

interface UnifiedAuthScreenProps {
  initialMode?: 'signin' | 'signup';
}

export function UnifiedAuthScreen({ initialMode = 'signin' }: UnifiedAuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  // Field focus states
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'confirm' | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time Email validation check
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Real-time Password Strength meter (0 - 4)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength();
  const passwordMatch =
    confirmPassword.length > 0 && confirmPassword === password && password.length >= 6;

  // Handle Form Submission
  const handleSubmit = async () => {
    const cleanEmail = email.trim();

    if (!isEmailValid) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
        return;
      }

      if (!agreedToTerms) {
        Alert.alert('Terms Agreement', 'Please agree to the Terms of Service to continue.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // --- SIGN UP PIPELINE ---
        const result = await authService.signUpWithPassword(cleanEmail, password);

        if (result.needsOtp) {
          router.push({
            pathname: '/verification',
            params: { email: cleanEmail, mode: 'signup' },
          });
        } else {
          // Direct account created -> Transition to Personal Data Screen
          router.replace('/profile-setup');
        }
      } else {
        // --- SIGN IN PIPELINE ---
        await authService.loginWithPassword(cleanEmail, password);

        // Check if user has already completed Personal Data setup
        try {
          const profile = await profileService.getProfile();
          if (
            profile &&
            (profile.fitnessLevel ||
              profile.weight ||
              (profile.fitnessGoals && profile.fitnessGoals.length > 0))
          ) {
            router.replace('/(tabs)');
          } else {
            router.replace('/profile-setup');
          }
        } catch {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert(
        mode === 'signup' ? 'Sign Up Failed' : 'Sign In Failed',
        error?.message || 'Could not complete authentication. Please try again.'
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
        'Please enter your registered email address above first, then tap Forgot password.'
      );
      return;
    }

    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail);
      Alert.alert('Check Your Inbox', `A password reset link was sent to ${cleanEmail}.`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not send reset link.');
    }
  };

  const handleBiometricAuth = () => {
    Alert.alert(
      'Biometric Quick-Sign-In',
      'Face ID / Biometric authentication will authenticate your saved device credentials.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 20) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Top Navigation: Back Button to Welcome */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/welcome')}
          >
            <Ionicons name="chevron-back" size={20} color="#111318" />
          </TouchableOpacity>
        </View>

        {/* 2. Brand & Header Block */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerBlock}>
          {/* Futuristic Minimal Logo Glyph */}
          <View style={styles.brandGlyphWrap}>
            <View style={styles.brandGlyph}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to access your workout routines & metrics'
              : 'Join in seconds and begin your personalized wellness journey'}
          </Text>
        </Animated.View>

        {/* 3. Fluid Segmented Mode Switcher Pill ("Sign In" vs. "Sign Up") */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[styles.segmentTab, mode === 'signin' && styles.segmentTabActive]}
            activeOpacity={0.85}
            onPress={() => setMode('signin')}
          >
            <Text
              style={[
                styles.segmentTabText,
                mode === 'signin' && styles.segmentTabTextActive,
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, mode === 'signup' && styles.segmentTabActive]}
            activeOpacity={0.85}
            onPress={() => setMode('signup')}
          >
            <Text
              style={[
                styles.segmentTabText,
                mode === 'signup' && styles.segmentTabTextActive,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Form Inputs */}
        <View style={styles.formContainer}>
          {/* Field 1: Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View
              style={[
                styles.inputBox,
                focusedField === 'email' && styles.inputBoxFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color={focusedField === 'email' ? COLOR_PRIMARY_ORANGE : '#7C808B'}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#8C919D"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {/* Real-time Validation Checkmark */}
              {isEmailValid && (
                <View style={styles.validCheckWrap}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </View>
              )}
            </View>
          </View>

          {/* Field 2: Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View
              style={[
                styles.inputBox,
                focusedField === 'password' && styles.inputBoxFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={focusedField === 'password' ? COLOR_PRIMARY_ORANGE : '#7C808B'}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={mode === 'signin' ? 'Enter your password' : 'Create a strong password'}
                placeholderTextColor="#8C919D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeIconWrap}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color="#7C808B"
                />
              </TouchableOpacity>
            </View>

            {/* Real-time Password Strength Meter (Sign Up Mode Only) */}
            {mode === 'signup' && password.length > 0 && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.strengthWrapper}>
                <View style={styles.strengthBarsRow}>
                  {[1, 2, 3, 4].map((step) => {
                    const isFilled = passwordStrength >= step;
                    const barColor =
                      passwordStrength <= 1
                        ? '#EF4444'
                        : passwordStrength === 2
                        ? '#F59E0B'
                        : passwordStrength === 3
                        ? '#0F8B8D'
                        : '#10B981';
                    return (
                      <View
                        key={step}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: isFilled ? barColor : '#E5E7EB' },
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={styles.strengthText}>
                  {passwordStrength <= 1
                    ? 'Weak (add numbers & symbols)'
                    : passwordStrength === 2
                    ? 'Fair password'
                    : passwordStrength === 3
                    ? 'Good password'
                    : 'Strong secure password!'}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Field 3: Confirm Password (Sign Up Mode Only) */}
          {mode === 'signup' && (
            <Animated.View entering={FadeInDown.duration(250)} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'confirm' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={focusedField === 'confirm' ? COLOR_PRIMARY_ORANGE : '#7C808B'}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#8C919D"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.eyeIconWrap}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#7C808B"
                  />
                </TouchableOpacity>

                {passwordMatch && (
                  <View style={styles.validCheckWrap}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Options Row (Sign In Mode): Keep Me Logged In & Forgot Password */}
          {mode === 'signin' && (
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.8}
                onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              >
                <View style={[styles.checkbox, keepLoggedIn && styles.checkboxActive]}>
                  {keepLoggedIn && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Terms Agreement (Sign Up Mode Only) */}
          {mode === 'signup' && (
            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                {agreedToTerms && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                  Terms of Service & Privacy
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Primary Action Button */}
          <TactilePressable
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonInnerRow}>
                <Text style={styles.primaryButtonText}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TactilePressable>

          {/* Biometric Quick-Sign-In Button (Sign In Mode Only) */}
          {mode === 'signin' && (
            <TouchableOpacity
              style={styles.biometricBtn}
              activeOpacity={0.75}
              onPress={handleBiometricAuth}
            >
              <MaterialCommunityIcons name="fingerprint" size={20} color="#7C808B" />
              <Text style={styles.biometricBtnText}>Sign in with Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F6F7F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    marginTop: 12,
  },
  brandGlyphWrap: {
    marginBottom: 14,
  },
  brandGlyph: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLOR_PRIMARY_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLOR_PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLOR_TITLE,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLOR_SUBTITLE,
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 20,
  },

  /* Segmented Mode Switcher Pill */
  segmentedContainer: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F3F7',
    padding: 4,
    marginVertical: 20,
  },
  segmentTab: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: COLOR_PRIMARY_ORANGE,
    ...Platform.select({
      ios: {
        shadowColor: COLOR_PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  segmentTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C808B',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Form Inputs */
  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_TITLE,
    marginBottom: 7,
  },
  inputBox: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLOR_BORDER_DEFAULT,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxFocused: {
    borderColor: COLOR_PRIMARY_ORANGE,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: COLOR_PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLOR_TITLE,
  },
  eyeIconWrap: {
    padding: 6,
  },
  validCheckWrap: {
    marginLeft: 6,
  },
  strengthWrapper: {
    marginTop: 8,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    color: '#7C808B',
    marginTop: 4,
    fontWeight: '500',
  },

  /* Options Row */
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: COLOR_PRIMARY_ORANGE,
    borderColor: COLOR_PRIMARY_ORANGE,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PRIMARY_ORANGE,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 22,
  },
  termsText: {
    fontSize: 12.5,
    color: COLOR_SUBTITLE,
  },
  termsLink: {
    fontWeight: '700',
    color: COLOR_TITLE,
  },

  /* Primary Button */
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLOR_PRIMARY_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLOR_PRIMARY_ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Biometrics Button */
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 10,
    gap: 6,
  },
  biometricBtnText: {
    fontSize: 13.5,
    color: '#7C808B',
    fontWeight: '500',
  },
});
