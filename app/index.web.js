import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { Storage } from '@/utils/storage';

export default function Index() {
  // Handle errors from browser extensions
  useEffect(() => {
    const handleError = (event) => {
      // Prevent browser extension errors from crashing the app
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

  const token = Storage.get('authToken', null);
  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
