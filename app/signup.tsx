import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppleIcon,
  GoogleIcon,
  NodeTippedDivider,
  TactilePressable,
} from '@/components/AuthComponents';
import { authService } from '@/services/api';
import { supabase } from '@/services/supabase';

const COLOR_PRIMARY_ORANGE = '#FF6B2C';
const COLOR_TITLE = '#141518';
const COLOR_SUBTITLE = '#7C808B';
const COLOR_BORDER_DEFAULT = '#E4E6EB';
const COLOR_ICON_DEFAULT = '#7C808B';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'confirm' | null>(null);
  const [loading, setLoading] = useState(false);

  // Synchronized Keyboard Slide-Up and Slide-Down Physics
  const formTranslateY = useSharedValue(0);
  const headerMargin = useSharedValue(26);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardHeight = e.endCoordinates.height;
      formTranslateY.value = withTiming(-Math.min(keyboardHeight * 0.22, 70), {
        duration: 300,
      });
      headerMargin.value = withTiming(10, { duration: 300 });
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      formTranslateY.value = withTiming(0, { duration: 280 });
      headerMargin.value = withTiming(26, { duration: 280 });
      setFocusedField(null);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    marginBottom: headerMargin.value,
  }));

  const handleSignUp = async () => {
    Keyboard.dismiss();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms and Conditions', 'Please agree to the Terms and Conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.signUpWithPassword(cleanEmail, password);

      if (result.needsOtp) {
        router.push({
          pathname: '/verification',
          params: { email: cleanEmail, mode: 'signup' },
        });
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error?.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Google Sign-In', err?.message || 'Google OAuth is being configured.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Apple Sign-In', err?.message || 'Apple Sign-In is being configured.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 14) }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 10 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Top Navigation: Back Button */}
          <Animated.View entering={FadeInDown.duration(350)}>
            <TactilePressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={18} color="#141518" />
            </TactilePressable>
          </Animated.View>

          <Animated.View style={animatedContainerStyle}>
            {/* 2. Header Block */}
            <Animated.View style={[styles.headerBlock, animatedHeaderStyle]}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Sign up to continue</Text>
            </Animated.View>

            {/* 3. Form Inputs */}
            <View style={styles.formContainer}>
              {/* Field 1: Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === 'email' && styles.inputBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={focusedField === 'email' ? COLOR_PRIMARY_ORANGE : COLOR_ICON_DEFAULT}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    ref={emailRef}
                    style={styles.textInput}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#8E939E"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onFocus={() => {
                      setFocusedField('email');
                      scrollRef.current?.scrollTo({ y: 40, animated: true });
                    }}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
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
                    size={18}
                    color={focusedField === 'password' ? COLOR_PRIMARY_ORANGE : COLOR_ICON_DEFAULT}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.textInput}
                    placeholder="Create password"
                    placeholderTextColor="#8E939E"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onFocus={() => {
                      setFocusedField('password');
                      scrollRef.current?.scrollTo({ y: 80, animated: true });
                    }}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.eyeIconWrap}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#7C808B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 3: Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirm password</Text>
                <View
                  style={[
                    styles.inputBox,
                    focusedField === 'confirm' && styles.inputBoxFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusedField === 'confirm' ? COLOR_PRIMARY_ORANGE : COLOR_ICON_DEFAULT}
                    style={styles.inputLeftIcon}
                  />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.textInput}
                    placeholder="Re-enter password"
                    placeholderTextColor="#8E939E"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onFocus={() => {
                      setFocusedField('confirm');
                      scrollRef.current?.scrollTo({ y: 130, animated: true });
                    }}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.eyeIconWrap}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#7C808B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.8}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                    Terms and Conditions
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Primary Orange CTA Button */}
              <TactilePressable
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create account</Text>
                )}
              </TactilePressable>
            </View>

            {/* 4. Decorative Node-Tipped Divider */}
            <NodeTippedDivider text="or sign up with" />

            {/* 5. Social Auth Buttons Row */}
            <View style={styles.socialButtonsRow}>
              <TactilePressable style={styles.socialButton} onPress={handleGoogleSignIn}>
                <GoogleIcon size={18} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TactilePressable>

              <TactilePressable style={styles.socialButton} onPress={handleAppleSignIn}>
                <AppleIcon size={18} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TactilePressable>
            </View>

            {/* 6. Footer Link */}
            <View style={styles.footerLinkRow}>
              <Text style={styles.footerTextRegular}>
                Already have an account?{' '}
                <Text style={styles.footerTextBold} onPress={() => router.push('/login')}>
                  Login
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F6F7F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerBlock: {
    marginTop: 6,
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
  },
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
    height: 52,
    borderRadius: 14,
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 14,
    color: COLOR_TITLE,
  },
  eyeIconWrap: {
    padding: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#141518',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLOR_PRIMARY_ORANGE,
    borderColor: COLOR_PRIMARY_ORANGE,
  },
  termsText: {
    fontSize: 12.5,
    color: COLOR_SUBTITLE,
  },
  termsLink: {
    fontWeight: '700',
    color: COLOR_TITLE,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLOR_PRIMARY_ORANGE,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.2,
    borderColor: COLOR_BORDER_DEFAULT,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_TITLE,
  },
  footerLinkRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
  },
  footerTextRegular: {
    fontSize: 13,
    color: COLOR_SUBTITLE,
  },
  footerTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_TITLE,
  },
});
