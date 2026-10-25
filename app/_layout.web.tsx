import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { OnboardingScreen } from '@/components/OnboardingScreen';
import { SplashScreen } from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';

// This is a web-specific layout that handles browser extensions better
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // State to track app initialization stages
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

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

  // Handle errors from browser extensions
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Prevent browser extension errors from crashing the app
      if (event.message.includes('chrome-extension') ||
          event.filename?.includes('chrome-extension') ||
          event.error?.stack?.includes('chrome-extension')) {
        event.preventDefault();
        console.warn('Browser extension error suppressed:', event.message);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show onboarding screens
  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => {
      setShowOnboarding(false);
      // Ensure we navigate to login after onboarding
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    }} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
        <Stack.Screen name="custom-goal" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
