import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { profileService } from '@/services/api';
import Storage from '@/utils/storage';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Friend');
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [steps, setSteps] = useState(3420);
  const [activeMins, setActiveMins] = useState(20);
  const [streakDays, setStreakDays] = useState([
    { day: 'M', completed: true, label: 'Mon' },
    { day: 'T', completed: true, label: 'Tue' },
    { day: 'W', completed: true, label: 'Wed', isToday: true },
    { day: 'T', completed: false, label: 'Thu' },
    { day: 'F', completed: false, label: 'Fri' },
    { day: 'S', completed: false, label: 'Sat' },
    { day: 'S', completed: false, label: 'Sun' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedWater = Storage.get('today_water_glasses', null);
      if (savedWater !== null) {
        setWaterGlasses(Number(savedWater));
      }

      const profile = await profileService.getProfile();
      if (profile && profile.name) {
        setUserName(profile.name.split(' ')[0]);
      }
    } catch (e) {
      console.log('Error loading dashboard profile:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddWater = () => {
    const updated = Math.min(waterGlasses + 1, 12);
    setWaterGlasses(updated);
    Storage.set('today_water_glasses', updated);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DashboardSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateText}>{todayFormatted}</Text>
          <Text style={styles.greetingTitle}>
            {greeting}, <Text style={styles.nameHighlight}>{userName}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={require('@/assets/images/image1.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
      >
        {/* Today's Focus Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={13} color="#FF6A3D" />
                <Text style={styles.heroBadgeText}>TODAY'S GENTLE FOCUS</Text>
              </View>
              <Text style={styles.heroDuration}>15 mins • Low Impact</Text>
            </View>

            <Text style={styles.heroTitle}>Gentle Morning Movement & Joint Mobility</Text>
            <Text style={styles.heroDescription}>
              A restorative routine designed to relieve morning stiffness, improve circulation, and renew your energy gently.
            </Text>

            <View style={styles.heroFooter}>
              <TouchableOpacity
                style={styles.startSessionButton}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/workouts')}
              >
                <Text style={styles.startSessionText}>Start Workout</Text>
                <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.previewButton}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/workouts')}
              >
                <Text style={styles.previewButtonText}>Browse All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Consistency Strip */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Weekly Momentum</Text>
            <Text style={styles.streakSub}>3 of 5 active days</Text>
          </View>

          <View style={styles.weekStrip}>
            {streakDays.map((item, idx) => (
              <View key={idx} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayBubble,
                    item.completed && styles.dayBubbleCompleted,
                    item.isToday && !item.completed && styles.dayBubbleToday,
                  ]}
                >
                  {item.completed ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.dayInitial,
                        item.isToday ? styles.dayInitialToday : styles.dayInitialInactive
                      ]}
                    >
                      {item.day}
                    </Text>
                  )}
                </View>
                <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Daily Wellness Glance */}
        <Animated.View entering={FadeInDown.duration(400).delay(260)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Wellness</Text>
            <Text style={styles.sectionHint}>Updated just now</Text>
          </View>

          <View style={styles.statsGrid}>
            {/* Steps Card */}
            <View style={styles.statCard}>
              <View style={styles.statIconBadge}>
                <MaterialCommunityIcons name="shoe-print" size={20} color="#FF6A3D" />
              </View>
              <Text style={styles.statLabel}>Steps</Text>
              <Text style={styles.statNumber}>{steps.toLocaleString()}</Text>
              <Text style={styles.statSubText}>Goal: 6,000</Text>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.min((steps / 6000) * 100, 100)}%` }]} />
              </View>
            </View>

            {/* Active Minutes Card */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.statLabel}>Active Time</Text>
              <Text style={styles.statNumber}>{activeMins} <Text style={styles.statUnit}>min</Text></Text>
              <Text style={styles.statSubText}>Goal: 30 min</Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min((activeMins / 30) * 100, 100)}%`,
                      backgroundColor: '#2E7D32'
                    }
                  ]}
                />
              </View>
            </View>

            {/* Water Tracker Card */}
            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="water" size={20} color="#0284C7" />
              </View>
              <Text style={styles.statLabel}>Hydration</Text>
              <View style={styles.waterValueRow}>
                <Text style={styles.statNumber}>{waterGlasses}</Text>
                <Text style={styles.statUnit}> / 8 cups</Text>
              </View>
              <TouchableOpacity
                style={styles.addWaterButton}
                activeOpacity={0.7}
                onPress={handleAddWater}
              >
                <Ionicons name="add" size={14} color="#0284C7" />
                <Text style={styles.addWaterText}>+1 Cup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Nutrition Snapshot */}
        <Animated.View entering={FadeInDown.duration(400).delay(340)} style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.nutritionPreviewCard}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/nutrition')}
          >
            <View style={styles.nutritionHeaderRow}>
              <View>
                <Text style={styles.nutritionCardBadge}>NOURISHMENT</Text>
                <Text style={styles.nutritionCardTitle}>Daily Nourishment</Text>
              </View>
              <View style={styles.nutritionLinkIcon}>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </View>
            </View>

            <Text style={styles.nutritionCardSub}>
              Prioritize light, nutrient-rich meals, electrolytes, and easy-to-digest wholesome snacks.
            </Text>

            <View style={styles.macroPillsRow}>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillName}>Hydration</Text>
                <Text style={styles.macroPillValue}>{waterGlasses * 250} ml</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillName}>Status</Text>
                <Text style={[styles.macroPillValue, { color: '#2E7D32' }]}>Balanced</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillName}>Target</Text>
                <Text style={styles.macroPillValue}>Wholesome</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Supportive Actions */}
        <Animated.View entering={FadeInDown.duration(400).delay(420)} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Supportive Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4EE' }]}>
                <MaterialCommunityIcons name="walk" size={24} color="#FF6A3D" />
              </View>
              <Text style={styles.quickActionText}>Gentle Walk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.75}
              onPress={handleAddWater}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="cup-water" size={24} color="#0284C7" />
              </View>
              <Text style={styles.quickActionText}>Log Water</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="meditation" size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>Mindful Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/nutrition')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="food-apple-outline" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.quickActionText}>Log Meal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  nameHighlight: {
    color: '#FF6A3D',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFF4EE',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 22,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6A3D',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  heroDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    marginBottom: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6A3D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#FF6A3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  startSessionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  streakSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6A3D',
  },
  sectionHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  weekStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayBubbleCompleted: {
    backgroundColor: '#FF6A3D',
  },
  dayBubbleToday: {
    borderWidth: 2,
    borderColor: '#FF6A3D',
    backgroundColor: '#FFF4EE',
  },
  dayInitial: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayInitialToday: {
    color: '#FF6A3D',
  },
  dayInitialInactive: {
    color: '#94A3B8',
  },
  dayLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  dayLabelToday: {
    color: '#0F172A',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  statSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  waterValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6A3D',
    borderRadius: 3,
  },
  addWaterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  addWaterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 2,
  },
  nutritionPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nutritionCardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nutritionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  nutritionLinkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionCardSub: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  macroPillName: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  macroPillValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
