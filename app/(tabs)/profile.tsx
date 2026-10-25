import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { TactilePressable } from '@/components/AuthComponents';
import { ProfileSkeleton } from '@/components/SkeletonLoader';
import { authService, profileService } from '@/services/api';
import Storage from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLOR_BG = '#F6F5F0';
const COLOR_CARD = '#FFFFFF';
const COLOR_TEXT_PRIMARY = '#16181A';
const COLOR_TEXT_SECONDARY = '#5A5E66';
const COLOR_TEXT_MUTED = '#8C9098';
const COLOR_DIVIDER = '#E4E2DC';
const COLOR_ICON = '#22252A';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  // User Identity & Stats State
  const [name, setName] = useState('Darlene Robertson');
  const [email, setEmail] = useState('darlene.robertson@example.com');
  const [fitnessLevel, setFitnessLevel] = useState('Intermediate');
  const [primaryGoal, setPrimaryGoal] = useState('Muscle Building');
  const [planTitle, setPlanTitle] = useState('Muscle Builder');
  const [targetWeight, setTargetWeight] = useState('82');
  const [currentWeight, setCurrentWeight] = useState('78');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('28');

  // 3-Column Stats
  const [workoutsCount, setWorkoutsCount] = useState(28);
  const [achievementsCount, setAchievementsCount] = useState(12);
  const [dayStreak, setDayStreak] = useState(7);

  // App Preference Toggles
  const [dailyReminder, setDailyReminder] = useState(true);
  const [hydrationReminder, setHydrationReminder] = useState(true);

  // Modals
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isBodyDataModalOpen, setIsBodyDataModalOpen] = useState(false);

  // Form edit states
  const [tempTargetWeight, setTempTargetWeight] = useState('82');
  const [tempGoal, setTempGoal] = useState('Muscle Building');
  const [tempWeight, setTempWeight] = useState('78');
  const [tempHeight, setTempHeight] = useState('175');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.email) {
        setEmail(user.email);
      }

      const profile = await profileService.getProfile();
      if (profile) {
        if (profile.name && profile.name !== 'Friend') {
          setName(profile.name);
        }
        if (profile.fitnessLevel) {
          const capLevel = profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1);
          setFitnessLevel(capLevel);
        }
        if (profile.fitnessGoals && profile.fitnessGoals.length > 0) {
          const formattedGoal = profile.fitnessGoals[0]
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          setPrimaryGoal(formattedGoal);
          setPlanTitle(formattedGoal);
        } else if (profile.customGoal) {
          setPrimaryGoal(profile.customGoal);
          setPlanTitle(profile.customGoal);
        }

        if (profile.weight) {
          setCurrentWeight(String(profile.weight));
        }
        if ((profile as any).targetWeight) {
          setTargetWeight(String((profile as any).targetWeight));
        } else if ((profile as any).goals?.targetWeight) {
          setTargetWeight(String((profile as any).goals.targetWeight));
        }
        if (profile.height) {
          setHeight(String(profile.height));
        }
        if (profile.age) {
          setAge(String(profile.age));
        }

        if (profile.stats) {
          if (profile.stats.workoutsCompleted) setWorkoutsCount(profile.stats.workoutsCompleted);
          if (profile.stats.dayStreak) setDayStreak(profile.stats.dayStreak);
        }
        if (profile.achievements && Array.isArray(profile.achievements)) {
          setAchievementsCount(Math.max(12, profile.achievements.length));
        }
      }
    } catch (e) {
      console.log('Error loading profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    setTargetWeight(tempTargetWeight.trim() || '82');
    setPrimaryGoal(tempGoal.trim() || 'Muscle Building');
    setPlanTitle(tempGoal.trim() || 'Muscle Builder');
    setIsGoalsModalOpen(false);

    try {
      const cached = Storage.get('cachedProfile', {}) || {};
      const updated = {
        ...cached,
        targetWeight: parseFloat(tempTargetWeight) || 82,
        customGoal: tempGoal.trim(),
      };
      await profileService.createProfile(updated);
      Alert.alert('Saved', 'Your fitness goals have been updated.');
    } catch (err) {
      console.warn('Error saving goals:', err);
    }
  };

  const handleSaveBodyData = async () => {
    setCurrentWeight(tempWeight.trim() || '78');
    setHeight(tempHeight.trim() || '175');
    setIsBodyDataModalOpen(false);

    try {
      const cached = Storage.get('cachedProfile', {}) || {};
      const updated = {
        ...cached,
        weight: parseFloat(tempWeight) || 78,
        height: parseFloat(tempHeight) || 175,
      };
      await profileService.createProfile(updated);
      Alert.alert('Saved', 'Your health and body metrics have been updated.');
    } catch (err) {
      console.warn('Error saving body metrics:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main Scroll Content with 110px bottom clearance for the floating nav bar */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Full-Bleed Atmospheric Gym Hero Banner with Multi-Stop Bottom Fade */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/gym-hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Seamless Multi-Stop Fade Gradient into Screen Background (#F6F5F0) */}
          <Svg height="220" width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroBottomFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#F6F5F0" stopOpacity="0.0" />
                <Stop offset="40%" stopColor="#F6F5F0" stopOpacity="0.0" />
                <Stop offset="68%" stopColor="#F6F5F0" stopOpacity="0.65" />
                <Stop offset="100%" stopColor="#F6F5F0" stopOpacity="1.0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height="220" fill="url(#heroBottomFade)" />
          </Svg>

          {/* Floating Top Navigation Row (Over Hero Banner) */}
          <View style={[styles.topNavRow, { top: Math.max(insets.top, 14) + 6 }]}>
            <View style={styles.topNavLeft}>
              <TouchableOpacity
                style={styles.frostedBackButton}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={17} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Profile</Text>
            </View>

            {/* Right Action Button with Coral-Red Indicator Dot */}
            <TouchableOpacity
              style={styles.frostedRightButton}
              activeOpacity={0.8}
              onPress={() => setIsNotificationsModalOpen(true)}
            >
              <View style={styles.rightIndicatorDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Overlapping Centered Avatar & Identity Block */}
        <View style={styles.identityContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('@/assets/images/avatar-default.jpg')}
              style={styles.avatarImage}
            />
          </View>

          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSubtitle}>
            {fitnessLevel} • {primaryGoal}
          </Text>
        </View>

        {/* 3. 3-Column Stats Bar */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.statsBar}>
          {/* Workouts */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutsCount}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Achievements */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievementsCount}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Day Streak */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dayStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Animated.View>

        {/* 4. "My Fitness" Section Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)}>
          <Text style={styles.sectionHeaderTitle}>My Fitness</Text>
        </Animated.View>

        {/* 5. Standardized Menu Cards */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          {/* Card 1: My Plan */}
          <TactilePressable
            style={styles.menuCard}
            onPress={() => router.push('/(tabs)/workouts')}
          >
            <View style={styles.cardLeftIcon}>
              <Ionicons name="clipboard-outline" size={22} color={COLOR_ICON} />
            </View>
            <View style={styles.cardCenterCol}>
              <Text style={styles.cardTitle}>My Plan</Text>
              <Text style={styles.cardSubtitle}>{planTitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLOR_ICON} />
          </TactilePressable>

          {/* Card 2: Goals */}
          <TactilePressable
            style={styles.menuCard}
            onPress={() => {
              setTempTargetWeight(targetWeight);
              setTempGoal(primaryGoal);
              setIsGoalsModalOpen(true);
            }}
          >
            <View style={styles.cardLeftIcon}>
              <MaterialCommunityIcons name="target" size={23} color={COLOR_ICON} />
            </View>
            <View style={styles.cardCenterCol}>
              <Text style={styles.cardTitle}>Goals</Text>
              <Text style={styles.cardSubtitle}>Target Weight: {targetWeight} kg</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLOR_ICON} />
          </TactilePressable>

          {/* Card 3: Personal Records */}
          <TactilePressable
            style={styles.menuCard}
            onPress={() => {
              Alert.alert(
                'Personal Records',
                'Strength Focus:\n• Bench Press: 95 kg\n• Squat: 120 kg\n• Deadlift: 140 kg'
              );
            }}
          >
            <View style={styles.cardLeftIcon}>
              <Ionicons name="trophy-outline" size={22} color={COLOR_ICON} />
            </View>
            <View style={styles.cardCenterCol}>
              <Text style={styles.cardTitle}>Personal Records</Text>
              <Text style={styles.cardSubtitle}>Strength Focus</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLOR_ICON} />
          </TactilePressable>

          {/* Card 4: Health & Body Data */}
          <TactilePressable
            style={styles.menuCard}
            onPress={() => {
              setTempWeight(currentWeight);
              setTempHeight(height);
              setIsBodyDataModalOpen(true);
            }}
          >
            <View style={styles.cardLeftIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={22} color={COLOR_ICON} />
            </View>
            <View style={styles.cardCenterCol}>
              <Text style={styles.cardTitle}>Health & Body Data</Text>
              <Text style={styles.cardSubtitle}>Strength Focus</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLOR_ICON} />
          </TactilePressable>

          {/* Card 5: Notifications */}
          <TactilePressable
            style={styles.menuCard}
            onPress={() => setIsNotificationsModalOpen(true)}
          >
            <View style={styles.cardLeftIcon}>
              <Ionicons name="notifications-outline" size={22} color={COLOR_ICON} />
            </View>
            <View style={styles.cardCenterCol}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>
                {dailyReminder ? 'Daily Reminders Active' : 'Muted'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLOR_ICON} />
          </TactilePressable>

          {/* 6. Account Action: Log Out */}
          <TactilePressable style={styles.logoutCard} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TactilePressable>

          <Text style={styles.versionText}>FitTrack v2.1.0 • Supportive Wellness</Text>
        </Animated.View>
      </ScrollView>

      {/* --- MODAL 1: Goals & Target Weight Editor --- */}
      <Modal visible={isGoalsModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Fitness Goals</Text>
              <TouchableOpacity onPress={() => setIsGoalsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#16181A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Primary Focus / Program</Text>
            <TextInput
              style={styles.inputField}
              value={tempGoal}
              onChangeText={setTempGoal}
              placeholder="e.g. Muscle Building"
              placeholderTextColor="#8C9098"
            />

            <Text style={styles.inputLabel}>Target Weight (kg)</Text>
            <TextInput
              style={styles.inputField}
              value={tempTargetWeight}
              onChangeText={setTempTargetWeight}
              keyboardType="numeric"
              placeholder="e.g. 82"
              placeholderTextColor="#8C9098"
            />

            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSaveGoals}>
              <Text style={styles.saveBtnText}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: Health & Body Metrics Editor --- */}
      <Modal visible={isBodyDataModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Health & Body Data</Text>
              <TouchableOpacity onPress={() => setIsBodyDataModalOpen(false)}>
                <Ionicons name="close" size={22} color="#16181A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Weight (kg)</Text>
            <TextInput
              style={styles.inputField}
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
              placeholder="e.g. 78"
              placeholderTextColor="#8C9098"
            />

            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.inputField}
              value={tempHeight}
              onChangeText={setTempHeight}
              keyboardType="numeric"
              placeholder="e.g. 175"
              placeholderTextColor="#8C9098"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.85}
              onPress={handleSaveBodyData}
            >
              <Text style={styles.saveBtnText}>Save Metrics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: Notifications Settings --- */}
      <Modal visible={isNotificationsModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotificationsModalOpen(false)}>
                <Ionicons name="close" size={22} color="#16181A" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Daily Movement Reminder</Text>
                <Text style={styles.toggleSubtitle}>Prompt around 9:00 AM</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: '#E2E8F0', true: '#FF6B2C' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Hydration Prompts</Text>
                <Text style={styles.toggleSubtitle}>Reminders to drink water regularly</Text>
              </View>
              <Switch
                value={hydrationReminder}
                onValueChange={setHydrationReminder}
                trackColor={{ false: '#E2E8F0', true: '#FF6B2C' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* Hero Banner */
  heroContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#1E2328',
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  topNavRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frostedBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  frostedRightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rightIndicatorDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4B4B',
  },

  /* Identity Block */
  identityContainer: {
    alignItems: 'center',
    marginTop: -44,
    zIndex: 5,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLOR_BG,
    backgroundColor: '#E5E4DF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: COLOR_TEXT_PRIMARY,
    letterSpacing: -0.3,
    marginTop: 10,
    textAlign: 'center',
  },
  userSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLOR_TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },

  /* 3-Column Stats Bar */
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 28,
    paddingVertical: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLOR_TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '400',
    color: COLOR_TEXT_MUTED,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLOR_DIVIDER,
  },

  /* Section Title */
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR_TEXT_PRIMARY,
    marginTop: 26,
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  /* Menu Cards */
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: COLOR_CARD,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardLeftIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenterCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLOR_TEXT_PRIMARY,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLOR_TEXT_MUTED,
    marginTop: 2,
  },

  /* Log Out Card */
  logoutCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: COLOR_TEXT_MUTED,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
  },

  /* Modal Sheets */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_TEXT_PRIMARY,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLOR_TEXT_PRIMARY,
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLOR_TEXT_PRIMARY,
    marginBottom: 10,
  },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  toggleTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLOR_TEXT_PRIMARY,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: COLOR_TEXT_MUTED,
    marginTop: 2,
  },
});
