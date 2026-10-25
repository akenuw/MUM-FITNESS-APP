/**
 * Helper utilities for verifying Supabase connection and generating troubleshooting tips.
 */
import { supabase } from '../services/supabase';

export async function testApiConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to connect to Supabase',
    };
  }
}

export function getTroubleshootingTips(error: string): string[] {
  return [
    'Check your internet connection on your phone or emulator.',
    'Verify EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.',
    'Confirm that your Supabase project is active in the Supabase Dashboard.',
    'Ensure you have executed supabase/setup.sql in your Supabase SQL Editor.',
  ];
}
