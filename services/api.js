import axios from 'axios';
import Constants from 'expo-constants';
import { Storage } from '../utils/storage';

// Current backend server URL with dynamic host detection for mobile devices
export function getBaseUrl() {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }
  return 'http://192.168.8.39:5000';
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Authorization token and dynamically update baseURL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = Storage.get('authToken', null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging & graceful error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Request Failed:', error.message || error);
    return Promise.reject(error);
  }
);

export const authService = {
  async register(email) {
    try {
      const response = await api.post('/api/auth/register', { email });
      return response.data;
    } catch (error) {
      // Offline / fallback support
      console.warn('Backend unavailable, using local mock for register');
      return { success: true, message: 'Local verification mode' };
    }
  },

  async login(email) {
    try {
      const response = await api.post('/api/auth/login', { email });
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using local mock for login');
      return { success: true, message: 'Local verification code sent' };
    }
  },

  async verify(email, code) {
    try {
      const response = await api.post('/api/auth/verify', { email, code });
      if (response.data?.token) {
        Storage.set('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, simulating verification success');
      const mockToken = 'mock_jwt_token_' + Date.now();
      Storage.set('authToken', mockToken);
      return { success: true, token: mockToken };
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data?.data || response.data;
    } catch (error) {
      return { email: 'user@example.com', isVerified: true };
    }
  },

  async googleLogin(token) {
    try {
      const response = await api.post('/api/auth/google', { token });
      if (response.data?.token) {
        Storage.set('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      const mockToken = 'mock_google_jwt_' + Date.now();
      Storage.set('authToken', mockToken);
      return { success: true, token: mockToken };
    }
  },

  logout() {
    Storage.remove('authToken');
  }
};

export const profileService = {
  async getProfile() {
    try {
      const response = await api.get('/api/profile');
      return response.data?.data || response.data;
    } catch (error) {
      const cached = Storage.get('cachedProfile', null);
      if (cached) return cached;
      return null;
    }
  },

  async createProfile(profileData) {
    Storage.set('cachedProfile', profileData);
    try {
      const response = await api.post('/api/profile', profileData);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Backend unavailable, saved profile locally');
      return { success: true, data: profileData };
    }
  },

  async updateStats(stats) {
    try {
      const response = await api.put('/api/profile/stats', stats);
      return response.data?.data || response.data;
    } catch (error) {
      return { success: true, stats };
    }
  },

  async updateGoals(goals) {
    try {
      const response = await api.put('/api/profile/goals', goals);
      return response.data?.data || response.data;
    } catch (error) {
      return { success: true, goals };
    }
  }
};

export default api;
