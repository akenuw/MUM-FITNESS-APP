import '@/utils/polyfills';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

export default function WebRootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('chrome-extension') ||
        event.filename?.includes('chrome-extension') ||
        event.error?.stack?.includes('chrome-extension')
      ) {
        event.preventDefault();
        console.warn('Browser extension error suppressed:', event.message);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'simple_push',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="custom-goal" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not Found' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
