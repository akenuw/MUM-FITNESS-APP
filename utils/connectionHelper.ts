/**
 * Helper utilities for verifying backend connection and generating troubleshooting tips.
 */
import { getBaseUrl } from '../services/api';

export async function testApiConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Server responded with status ${response.status}` };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Unable to reach backend')
    };
  }
}

export function getTroubleshootingTips(error: string): string[] {
  return [
    'Make sure the backend server is running (node start-backend.js or npm run backend).',
    'Ensure your phone and computer are connected to the same Wi-Fi network.',
    'Check if your computer firewall allows incoming connections on port 5000.',
    'If using Expo Go on a real device across networks, use "npx expo start --tunnel".',
    'Verify that the IP address in services/api.js matches your computer\'s local IP.'
  ];
}
