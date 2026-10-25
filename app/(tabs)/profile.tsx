import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authService, profileService } from '@/services/api';
import { ProfileSkeleton } from '@/components/SkeletonLoader';
import Storage from '@/utils/storage';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Friend');
  const [email, setEmail] = useState('user@example.com');
  const [fitnessGoal, setFitnessGoal] = useState('Gentle Mobility & Energy');
  const [workoutFrequency, setWorkoutFrequency] = useState('3-4');
  const [workoutsCompleted, setWorkoutsCompleted] = useState(4);
  const [totalMinutes, setTotalMinutes] = useState(65);

  // Preference Toggles
  const [dailyReminder, setDailyReminder] = useState(true);
  const [hydrationReminder, setHydrationReminder] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState('');

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
        if (profile.name) setName(profile.name);
        if (profile.fitnessGoals && profile.fitnessGoals.length > 0) {
          setFitnessGoal(profile.fitnessGoals[0].replace('_', ' ').toUpperCase());
        } else if (profile.customGoal) {
          setFitnessGoal(profile.customGoal);
        }
        if (profile.workoutFrequency) {
          setWorkoutFrequency(profile.workoutFrequency);
        }
        if (profile.stats) {
          if (profile.stats.workoutsCompleted) setWorkoutsCompleted(profile.stats.workoutsCompleted);
          if (profile.stats.totalMinutes) setTotalMinutes(profile.stats.totalMinutes);
        }
      }
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditName(name);
    setEditGoal(fitnessGoal);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    try {
      setName(editName.trim());
      setFitnessGoal(editGoal.trim() || 'Gentle Mobility & Energy');

      await profileService.createProfile({
        name: editName.trim(),
        customGoal: editGoal.trim() || 'Gentle Mobility & Energy',
        workoutFrequency: workoutFrequency
      });

      setIsEditModalOpen(false);
      Alert.alert('Saved', 'Your profile details have been updated.');
    } catch (e) {
      console.log('Error saving profile:', e);
      setIsEditModalOpen(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of FitTrack?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            authService.logout();
            router.replace('/welcome');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenSubtitle}>ACCOUNT & SETTINGS</Text>
          <Text style={styles.screenTitle}>Your Profile</Text>
        </View>

        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={handleOpenEdit}>
          <Ionicons name="pencil" size={16} color="#FF6A3D" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(350).delay(100)}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatarContainer}>
              <Image source={require('@/assets/images/image1.png')} style={styles.profileAvatar} />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              <View style={styles.memberTag}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#2E7D32" />
                <Text style={styles.memberTagText}>FitTrack Active Member</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Lifetime Activity Stats */}
        <Animated.View entering={FadeInDown.duration(350).delay(180)} style={styles.sectionContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{workoutsCompleted}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>Movement Mins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Wellness & Fitness Focus */}
        <Animated.View entering={FadeInDown.duration(350).delay(260)} style={styles.sectionContainer}>
          <View style={styles.focusCard}>
            <View style={styles.focusHeaderRow}>
              <View style={styles.focusIconWrap}>
                <MaterialCommunityIcons name="heart-cog-outline" size={22} color="#FF6A3D" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.focusTitle}>Health & Fitness Focus</Text>
                <Text style={styles.focusSubtitle}>Personalized gentle routine goals</Text>
              </View>
            </View>

            <View style={styles.focusDetailRow}>
              <View style={styles.focusItem}>
                <Text style={styles.focusItemLabel}>Primary Goal</Text>
                <Text style={styles.focusItemValue}>{fitnessGoal}</Text>
              </View>
              <View style={styles.focusItem}>
                <Text style={styles.focusItemLabel}>Target Frequency</Text>
                <Text style={styles.focusItemValue}>{workoutFrequency} sessions / week</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* App Preferences & Notifications */}
        <Animated.View entering={FadeInDown.duration(350).delay(340)} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#FFF4EE' }]}>
                <Ionicons name="notifications-outline" size={18} color="#FF6A3D" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.settingLabel}>Daily Movement Reminder</Text>
                <Text style={styles.settingSubtext}>Gentle notification around 9:00 AM</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: '#E2E8F0', true: '#FF6A3D' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="water-outline" size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.settingLabel}>Hydration Prompts</Text>
                <Text style={styles.settingSubtext}>Gentle reminders to sip water regularly</Text>
              </View>
              <Switch
                value={hydrationReminder}
                onValueChange={setHydrationReminder}
                trackColor={{ false: '#E2E8F0', true: '#0284C7' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Support & Legal */}
        <Animated.View entering={FadeInDown.duration(350).delay(420)} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.settingLinkItem}
              activeOpacity={0.7}
              onPress={() => router.push('/terms')}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="document-text-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.settingLinkLabel}>Terms of Use & Privacy</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingLinkItem}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Support & Help', 'For any inquiries or feedback, contact: support@fittrack.app')}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="help-circle-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.settingLinkLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.duration(350).delay(480)}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>FitTrack v2.1.0 • Supportive Wellness</Text>
        </Animated.View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Primary Focus / Goal</Text>
              <TextInput
                style={styles.modalInput}
                value={editGoal}
                onChangeText={setEditGoal}
                placeholder="e.g. Gentle Recovery & Bone Health"
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity style={styles.saveModalBtn} activeOpacity={0.85} onPress={handleSaveProfile}>
                <Text style={styles.saveModalBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6A3D',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFF4EE',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  memberTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginLeft: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  focusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  focusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  focusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  focusSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  focusDetailRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  focusItem: {
    flex: 1,
  },
  focusItemLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  focusItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  settingLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingLinkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  saveModalBtn: {
    backgroundColor: '#FF6A3D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
