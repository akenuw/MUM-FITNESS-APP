// Import polyfills first
import '@/utils/polyfills';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { EnhancedSplashScreen } from '@/components/EnhancedSplashScreen';
import NetworkProvider from '@/components/NetworkProvider';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { SplashScreen } from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Storage } from '@/utils/storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // State to track app initialization stages
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(!Storage.get('hasCompletedOnboarding', false));
  const [useSimpleSplash, setUseSimpleSplash] = useState(false);

  // Simulate splash screen timing
  useEffect(() => {
    if (loaded) {
      // Show splash for 4 seconds to ensure animation completes
      // The last letter appears at ~2.25s (500ms initial delay + 7*250ms letter delays)
      // Plus ~1s for the drop animation and ~0.75s buffer
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Platform-specific error handling for animations and API errors
  useEffect(() => {
    const handleError = (error: Error) => {
      // Check if it's a network error
      if (error.message && (
          error.message.includes('Network Error') ||
          error.message.includes('API Error') ||
          error.message.includes('Unable to connect')
      )) {
        console.warn('Network error detected, continuing with app:', error.message);
        // Don't switch to simple splash for network errors - we'll handle them with mock API
      } else {
        console.warn('Error detected, switching to simple splash screen:', error.message);
        setUseSimpleSplash(true);
      }
    };

    // We'll use a try-catch in our animation code instead of global error listeners
    // This is safer for cross-platform compatibility

    // Set up a global error handler for uncaught errors
    const originalConsoleError = console.error;
    console.error = (message, ...optionalParams) => {
      // Only handle errors that are strings or have a message property
      if (typeof message === 'string' || (message && message.message)) {
        const errorMessage = typeof message === 'string' ? message : message.message;
        handleError(new Error(String(errorMessage)));
      }
      originalConsoleError(message, ...optionalParams);
    };

    return () => {
      // Restore original handler
      console.error = originalConsoleError;
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Show splash screen
  if (showSplash) {
    // Use the enhanced splash screen or fall back to the regular one
    return useSimpleSplash ? <SplashScreen /> : <EnhancedSplashScreen />;
  }

  // Show onboarding screens only if not completed before
  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => {
      // Mark onboarding as completed
      Storage.set('hasCompletedOnboarding', true);
      setShowOnboarding(false);
      // Don't navigate here - let the Stack navigator handle it
    }} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* @ts-ignore - NetworkProvider is a JS file */}
      <NetworkProvider>
        <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="verification" />
          <Stack.Screen name="profile-setup" />
          <Stack.Screen name="custom-goal" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </NetworkProvider>
    </ThemeProvider>
  );
}
