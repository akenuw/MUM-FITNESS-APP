import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService, profileService } from '../services/api';

const CODE_LENGTH = 6;

export function VerificationScreen() {
  const params = useLocalSearchParams();
  const email = ((params.email as string) || '').trim();
  const initialDevCode = ((params.devCode as string) || '').trim();

  const [devCode, setDevCode] = useState<string>(initialDevCode);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    initialDevCode
      ? initialDevCode.slice(0, CODE_LENGTH).split('').concat(Array(Math.max(0, CODE_LENGTH - initialDevCode.length)).fill(''))
      : Array(CODE_LENGTH).fill('')
  );
  const [loading, setLoading] = useState(false);

  // Input refs for auto-focus navigation
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Handle single or multi-character change (e.g. paste)
  const handleCodeChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '');

    // Handle paste of entire code
    if (sanitized.length > 1) {
      const digits = sanitized.slice(0, CODE_LENGTH).split('');
      const newCode = [...verificationCode];

      digits.forEach((digit, i) => {
        if (i < CODE_LENGTH) newCode[i] = digit;
      });

      setVerificationCode(newCode);

      const nextFocus = Math.min(digits.length, CODE_LENGTH - 1);
      setTimeout(() => {
        inputRefs.current[nextFocus]?.focus();
      }, 10);
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = sanitized;
    setVerificationCode(newCode);

    // Auto-focus next input if filled
    if (sanitized.length === 1 && index < CODE_LENGTH - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  // Backspace key handling
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (verificationCode[index] === '' && index > 0) {
        const newCode = [...verificationCode];
        newCode[index - 1] = '';
        setVerificationCode(newCode);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      }
    }
  };

  // Submit OTP Verification
  const handleVerify = async () => {
    const code = verificationCode.join('').trim();
    if (code.length < 4) {
      Alert.alert(
        'Invalid Code',
        `Please enter the verification code sent to your email.`
      );
      return;
    }

    setLoading(true);
    try {
      await authService.verifySignupOtp(email, code);

      // Session stored on device -> Straight to the app!
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert(
        'Verification Failed',
        error?.message ||
          'Invalid or expired verification code. Please check your email and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend code via Supabase
  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is missing.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email);
      setVerificationCode(Array(CODE_LENGTH).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      Alert.alert(
        'Code Sent',
        'A fresh verification code has been dispatched to your email inbox.'
      );
    } catch (error: any) {
      Alert.alert(
        'Resend Failed',
        error?.message || 'Unable to resend verification code right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to{' '}
          <Text style={styles.emailHighlight}>{email || 'your email'}</Text>.
        </Text>

        <View style={styles.emailInfoContainer}>
          <Text style={styles.emailInfoText}>
            Check your inbox or spam folder for your Supabase login code.
          </Text>
        </View>

        {devCode ? (
          <View style={styles.devCodeBadge}>
            <Text style={styles.devCodeBadgeText}>
              Code: <Text style={{ fontWeight: 'bold', color: '#FF7E45' }}>{devCode}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                const digits = devCode.slice(0, CODE_LENGTH).split('');
                const full = digits.concat(Array(Math.max(0, CODE_LENGTH - digits.length)).fill(''));
                setVerificationCode(full);
              }}
            >
              <Text style={styles.devCodeBadgeAction}>Auto-Fill</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : {},
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              selectTextOnFocus={true}
              caretHidden={true}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={loading}
        >
          <Text style={[styles.resendButtonText, loading && styles.disabledText]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#0F172A',
  },
  emailInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    width: '100%',
  },
  emailInfoText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  devCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4EE',
    borderWidth: 1,
    borderColor: '#FF7E45',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
  },
  devCodeBadgeText: {
    fontSize: 14,
    color: '#333',
  },
  devCodeBadgeAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF7E45',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    width: '100%',
  },
  codeInput: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  codeInputFilled: {
    borderColor: '#A3E635',
    backgroundColor: '#F7FEE7',
  },
  verifyButton: {
    backgroundColor: '#A3E635',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 56,
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  resendButton: {
    padding: 12,
  },
  resendButtonText: {
    color: '#4D7C0F',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
export default VerificationScreen;
