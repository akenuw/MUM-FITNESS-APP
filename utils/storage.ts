/**
 * Simple synchronous-access storage utility with fallback memory cache.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore = new Map<string, any>();

export const Storage = {
  get<T = any>(key: string, defaultValue: T): T {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) as T;
    }

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            const parsed = JSON.parse(item);
            memoryStore.set(key, parsed);
            return parsed;
          }
        }
      } else {
        // SecureStore getItemSync is available in recent Expo SecureStore versions
        if (SecureStore.getItem) {
          const item = SecureStore.getItem(key);
          if (item !== null && item !== undefined) {
            try {
              const parsed = JSON.parse(item);
              memoryStore.set(key, parsed);
              return parsed;
            } catch {
              memoryStore.set(key, item);
              return item as unknown as T;
            }
          }
        }
      }
    } catch (e) {
      // In case synchronous read fails on certain platforms, fall back to memory
    }

    return defaultValue;
  },

  set(key: string, value: any): void {
    memoryStore.set(key, value);
    try {
      const serialized = JSON.stringify(value);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, serialized);
        }
      } else {
        SecureStore.setItemAsync(key, serialized).catch(() => {});
      }
    } catch (e) {
      // Fallback: value remains safely in memoryStore
    }
  },

  remove(key: string): void {
    memoryStore.delete(key);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        SecureStore.deleteItemAsync(key).catch(() => {});
      }
    } catch (e) {}
  }
};

export default Storage;
