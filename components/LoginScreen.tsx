import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { authService } from '../services/api';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';



export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to login with email:', email);

      // Call the login API
      const response = await authService.login(email);
      console.log('Login response:', response);

      const res = response as any;
      const devCode = res?.devCode || res?.code || '';

      // Navigate to verification screen with email and devCode parameters
      router.push({
        pathname: '/verification',
        params: { email, ...(devCode ? { devCode } : {}) }
      });
    } catch (error: any) {
      console.error('Login error:', error);

      // Show a user-friendly error message
      Alert.alert(
        'Login Error',
        error?.message || 'There was a problem sending the verification code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        {/* Remove back button to prevent going back to onboarding */}
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.content}>
        <ThemedText type="title" style={styles.title}>Log in</ThemedText>

        <ThemedText style={styles.subtitle}>
          By logging in, you agree to our{' '}
          <ThemedText
            style={styles.link}
            onPress={() => router.push('/terms')}
          >
            Terms of Use
          </ThemedText>.
        </ThemedText>

        <View style={styles.inputContainer}>
          <ThemedText>Email</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <ThemedText style={styles.infoText}>
          We will send you a code to your email for verification.
        </ThemedText>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Connect</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            For more information, please see our{' '}
            <ThemedText
              style={styles.link}
              onPress={() => router.push('/terms')}
            >
              Privacy policy
            </ThemedText>.
          </ThemedText>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    color: '#666',
  },
  link: {
    color: '#FF7E45',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#FF7E45',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
