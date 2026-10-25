import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/api';

export function VerificationScreen() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const initialDevCode = (params.devCode as string) || '';
  const [devCode, setDevCode] = useState<string>(initialDevCode);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    initialDevCode ? initialDevCode.slice(0, 4).split('') : ['', '', '', '']
  );
  const [loading, setLoading] = useState(false);

  // Create refs for each input field
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  // Handle input change for each digit
  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    // Handle pasting of full code
    if (text.length > 1) {
      // If user pastes a code, distribute it across the inputs
      const digits = text.split('').slice(0, 4);
      const newCode = [...verificationCode];

      digits.forEach((digit, i) => {
        if (i < 4) newCode[i] = digit;
      });

      setVerificationCode(newCode);

      // Focus the last filled input or the next empty one
      const lastIndex = Math.min(index + digits.length, 3);
      setTimeout(() => {
        inputRefs.current[lastIndex]?.focus();
      }, 0);

      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    // Auto-focus next input if current input is filled
    if (text.length === 1 && index < 3) {
      // Focus the next input with a slight delay to ensure it works on all devices
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  // Handle key press to enable backspace navigation
  const handleKeyPress = (e: any, index: number) => {
    // If backspace is pressed, handle navigation
    if (e.nativeEvent.key === 'Backspace') {
      // If current field is empty or we're deleting the content, focus previous field
      if ((verificationCode[index] === '' || e.nativeEvent.key === 'Backspace') && index > 0) {
        // Clear current field if it has content
        if (verificationCode[index] !== '') {
          const newCode = [...verificationCode];
          newCode[index] = '';
          setVerificationCode(newCode);
        }

        // Focus previous field with a slight delay
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      }
    }
  };

  // Handle verification
  const handleVerify = async () => {
    // Check if code is complete
    const code = verificationCode.join('');
    if (code.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter the complete 4-digit verification code');
      return;
    }

    setLoading(true);
    try {
      // Call the verify API
      await authService.verify(email, code);

      // Navigate to profile setup screen
      router.replace('/profile-setup');
    } catch (error: any) {
      console.error('Verification error:', error);

      // Show a user-friendly error message
      Alert.alert(
        'Verification Error',
        'Invalid verification code. Please check your email and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill the verification code (for accessibility)
  const autoFillCode = (code: string) => {
    if (!code || code.length !== 4) return;

    const digits = code.split('');
    setVerificationCode(digits);
  };

  // Handle resend code
  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is missing');
      return;
    }

    setLoading(true);
    try {
      // Call the login API to resend code
      const response = await authService.login(email);

      const returnedCode = response?.devCode || response?.code;
      if (returnedCode) {
        const codeStr = String(returnedCode);
        setDevCode(codeStr);
        setVerificationCode(codeStr.slice(0, 4).split(''));
        Alert.alert('Verification Code', `Your verification code is: ${codeStr}`);
      } else {
        setVerificationCode(['', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        Alert.alert('Success', 'A new 4-digit verification code has been sent to your email');
      }
    } catch (error: any) {
      console.error('Resend code error:', error);

      // Show an error message
      Alert.alert(
        'Error',
        'Failed to resend verification code. Please try again later.',
        [{ text: 'OK' }]
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
          We've sent a 4-digit verification code to {email || 'your email'}.
          Please enter it below.
        </Text>

        <View style={styles.emailInfoContainer}>
          <Text style={styles.emailInfoText}>
            Please check your email inbox for the verification code.
          </Text>
          <Text style={styles.emailInfoDetail}>
            If you don't see it, check your spam folder or try the "Resend Code" option below.
          </Text>
        </View>

        {devCode ? (
          <View style={styles.devCodeBadge}>
            <Text style={styles.devCodeBadgeText}>
              Dev Code: <Text style={{ fontWeight: 'bold', color: '#FF7E45' }}>{devCode}</Text>
            </Text>
            <TouchableOpacity onPress={() => setVerificationCode(devCode.slice(0, 4).split(''))}>
              <Text style={styles.devCodeBadgeAction}>Auto-Fill</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref }}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : {},
                index === 0 && styles.codeInputFirst,
                index === 3 && styles.codeInputLast
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
            <Text style={styles.verifyButtonText}>Verify</Text>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    width: '80%',
    maxWidth: 280,
  },
  codeInput: {
    width: 65,
    height: 65,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
    color: '#FF7E45',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  codeInputFilled: {
    borderColor: '#FF7E45',
    backgroundColor: '#FFF5F0',
  },
  codeInputFirst: {
    marginLeft: 0,
  },
  codeInputLast: {
    marginRight: 0,
  },
  verifyButton: {
    backgroundColor: '#FF7E45',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 56,
  },
  disabledButton: {
    backgroundColor: '#FFB599',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 12,
  },
  resendButtonText: {
    color: '#FF7E45',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },

  emailInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  emailInfoText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  emailInfoDetail: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
  },
  devCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4EE',
    borderWidth: 1,
    borderColor: '#FF7E45',
    borderRadius: 8,
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
});
