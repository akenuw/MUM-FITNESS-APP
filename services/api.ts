import { Storage } from '../utils/storage';
import { supabase } from './supabase';

export function getBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://ihyfsvyynoafkvpqhcjz.supabase.co'
  );
}

export const authService = {
  /**
   * Request OTP code via Supabase Email Auth
   */
  async register(email: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'A verification code has been sent to your email.',
        data,
      };
    } catch (error: any) {
      console.warn('Supabase register error:', error.message || error);
      throw error;
    }
  },

  /**
   * Request OTP code via Supabase Email Auth for existing or new user
   */
  async login(email: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        data,
      };
    } catch (error: any) {
      console.warn('Supabase login error:', error.message || error);
      throw error;
    }
  },

  /**
   * Verify 6-digit email OTP
   */
  async verify(email: string, code: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanToken = code.trim();

      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        throw error;
      }

      if (data?.session?.access_token) {
        Storage.set('authToken', data.session.access_token);
      }

      // Check if user already has an established profile
      if (data?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            Storage.set('cachedProfile', {
              ...profile,
              fitnessGoals: profile.fitness_goals,
              customGoal: profile.custom_goal,
              fitnessLevel: profile.fitness_level,
              workoutFrequency: profile.workout_frequency,
            });
          }
        } catch (profileErr) {
          console.warn('Could not load initial profile on verify:', profileErr);
        }
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        token: data.session?.access_token,
      };
    } catch (error: any) {
      console.warn('Supabase verifyOtp error:', error.message || error);
      throw error;
    }
  },

  /**
   * Get current authenticated user session
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        return {
          id: user.id,
          email: user.email,
          isVerified: !!user.email_confirmed_at,
          ...user.user_metadata,
        };
      }
      return { email: 'friend@mumfitness.app', isVerified: true };
    } catch (error) {
      return { email: 'friend@mumfitness.app', isVerified: true };
    }
  },

  /**
   * Google login support
   */
  async googleLogin(idToken: string) {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      if (data?.session?.access_token) {
        Storage.set('authToken', data.session.access_token);
      }
      return { success: true, token: data.session?.access_token, user: data.user };
    } catch (error: any) {
      console.warn('Google login failed:', error.message || error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    Storage.remove('authToken');
    Storage.remove('cachedProfile');
  },
};

export const profileService = {
  /**
   * Fetch current user's profile from Supabase
   */
  async getProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return Storage.get('cachedProfile', null);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching Supabase profile:', error.message);
        return Storage.get('cachedProfile', null);
      }

      if (data) {
        const formatted = {
          id: data.id,
          name: data.name || 'Friend',
          email: data.email || user.email,
          age: data.age,
          height: data.height,
          weight: data.weight,
          fitnessGoals: data.fitness_goals || [],
          customGoal: data.custom_goal,
          fitnessLevel: data.fitness_level,
          workoutFrequency: data.workout_frequency,
          stats: data.stats || {
            workoutsCompleted: 0,
            totalMinutes: 0,
            averageCaloriesBurned: 0,
          },
          achievements: data.achievements || [],
          goals: data.goals || { weekly: { workouts: 3, current: 0 } },
          preferences: data.preferences || {
            dailyReminder: true,
            hydrationReminder: true,
          },
        };
        Storage.set('cachedProfile', formatted);
        return formatted;
      }

      return Storage.get('cachedProfile', null);
    } catch (error) {
      console.warn('Profile fetch exception:', error);
      return Storage.get('cachedProfile', null);
    }
  },

  /**
   * Upsert user profile to Supabase
   */
  async createProfile(profileData: any) {
    Storage.set('cachedProfile', profileData);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: true, data: profileData };
      }

      const payload: Record<string, any> = {
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      if (profileData.name !== undefined) payload.name = profileData.name;
      if (profileData.age !== undefined) payload.age = profileData.age;
      if (profileData.height !== undefined) payload.height = profileData.height;
      if (profileData.weight !== undefined) payload.weight = profileData.weight;
      if (profileData.fitnessGoals !== undefined) {
        payload.fitness_goals = profileData.fitnessGoals;
      } else if (profileData.fitnessGoal !== undefined) {
        payload.fitness_goals = [profileData.fitnessGoal];
      }
      if (profileData.customGoal !== undefined) {
        payload.custom_goal = profileData.customGoal;
      }
      if (profileData.fitnessLevel !== undefined) {
        payload.fitness_level = profileData.fitnessLevel;
      }
      if (profileData.workoutFrequency !== undefined) {
        payload.workout_frequency = profileData.workoutFrequency;
      }
      if (profileData.stats !== undefined) payload.stats = profileData.stats;
      if (profileData.achievements !== undefined) {
        payload.achievements = profileData.achievements;
      }
      if (profileData.goals !== undefined) payload.goals = profileData.goals;
      if (profileData.preferences !== undefined) {
        payload.preferences = profileData.preferences;
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase profile upsert error:', error.message);
      }

      return { success: true, data: data || profileData };
    } catch (error: any) {
      console.warn('Profile upsert exception:', error);
      return { success: true, data: profileData };
    }
  },

  /**
   * Increment workout stats in Supabase
   */
  async updateStats(statsDelta: {
    workoutsCompleted?: number;
    totalMinutes?: number;
    averageCaloriesBurned?: number;
  }) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { success: true, stats: statsDelta };

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('stats')
        .eq('id', user.id)
        .maybeSingle();

      const currentStats = currentProfile?.stats || {
        workoutsCompleted: 0,
        totalMinutes: 0,
        averageCaloriesBurned: 0,
      };

      const updatedStats = {
        workoutsCompleted:
          (currentStats.workoutsCompleted || 0) +
          (statsDelta.workoutsCompleted || 0),
        totalMinutes:
          (currentStats.totalMinutes || 0) + (statsDelta.totalMinutes || 0),
        averageCaloriesBurned:
          (currentStats.averageCaloriesBurned || 0) +
          (statsDelta.averageCaloriesBurned || 0),
      };

      await supabase
        .from('profiles')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { success: true, stats: updatedStats };
    } catch (error) {
      console.warn('Supabase updateStats exception:', error);
      return { success: true, stats: statsDelta };
    }
  },

  /**
   * Update goal settings in Supabase
   */
  async updateGoals(goals: any) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { success: true, goals };

      await supabase
        .from('profiles')
        .update({
          goals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { success: true, goals };
    } catch (error) {
      return { success: true, goals };
    }
  },
};

export const api = {
  authService,
  profileService,
  getBaseUrl,
};

export default api;
