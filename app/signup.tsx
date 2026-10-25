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

const PRIMARY_ORANGE = Colors.light.primary || '#FF7E45';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(
        'Terms of Service',
        'Please agree to the Terms and Conditions to create your account.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await authService.signUpWithPassword(cleanEmail, password);

      if (result.needsOtp) {
        // Navigate to OTP verification screen
        router.push({
          pathname: '/verification',
          params: { email: cleanEmail, mode: 'signup' },
        });
      } else {
        // Direct session created -> straight into the app!
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert(
        'Sign Up Error',
        error?.message || 'Could not complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to continue</Text>
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
                placeholder="Create password"
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

          {/* 6. Confirm Password Label and Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#94A3B8"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.rightIcon}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 7. Terms and Conditions Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxActive,
              ]}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => router.push('/terms')}
              >
                Terms and Conditions
              </Text>
            </Text>
          </TouchableOpacity>

          {/* 8. Orange Create Account Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            activeOpacity={0.88}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 9. Existing-Account Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              Login
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: PRIMARY_ORANGE,
    borderColor: PRIMARY_ORANGE,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B',
  },
  termsLink: {
    fontWeight: '700',
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
  loginLink: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
