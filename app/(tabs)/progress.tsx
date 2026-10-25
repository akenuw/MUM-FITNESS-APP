import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Storage from '@/utils/storage';

interface DayActivity {
  day: string;
  label: string;
  completed: boolean;
  mins: number;
  activityName: string;
  isToday?: boolean;
}

const weekData: DayActivity[] = [
  { day: 'M', label: 'Mon', completed: true, mins: 20, activityName: 'Joint Mobility' },
  { day: 'T', label: 'Tue', completed: true, mins: 15, activityName: 'Gentle Walk' },
  { day: 'W', label: 'Wed', completed: true, mins: 18, activityName: 'Restorative Stretch', isToday: true },
  { day: 'T', label: 'Thu', completed: false, mins: 0, activityName: 'Scheduled' },
  { day: 'F', label: 'Fri', completed: false, mins: 0, activityName: 'Rest Day' },
  { day: 'S', label: 'Sat', completed: false, mins: 0, activityName: 'Gentle Flow' },
  { day: 'S', label: 'Sun', completed: false, mins: 0, activityName: 'Mindful Breathing' },
];

const badges = [
  {
    id: 1,
    title: 'First Step',
    description: 'Completed your 1st session',
    icon: 'star-face',
    color: '#FF6A3D',
    bgColor: '#FFF4EE',
    earned: true,
  },
  {
    id: 2,
    title: 'Gentle Habit',
    description: '3 consecutive active days',
    icon: 'heart-pulse',
    color: '#10B981',
    bgColor: '#ECFDF5',
    earned: true,
  },
  {
    id: 3,
    title: 'Hydration Star',
    description: 'Reached 8 cups in a day',
    icon: 'water',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    earned: true,
  },
  {
    id: 4,
    title: 'Mindful Rest',
    description: 'Finished guided breathwork',
    icon: 'meditation',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    earned: true,
  },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [energyLevel, setEnergyLevel] = useState<'gentle' | 'steady' | 'energized'>('steady');
  const [bodyComfort, setBodyComfort] = useState<'good' | 'ease'>('good');

  useEffect(() => {
    const savedEnergy = Storage.get('today_energy_checkin', null);
    if (savedEnergy) {
      setEnergyLevel(savedEnergy as any);
    }
  }, []);

  const handleSelectEnergy = (lvl: 'gentle' | 'steady' | 'energized') => {
    setEnergyLevel(lvl);
    Storage.set('today_energy_checkin', lvl);
  };

  const totalMinutes = weekData.reduce((sum, d) => sum + d.mins, 0);
  const completedDaysCount = weekData.filter(d => d.completed).length;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenSubtitle}>MOMENTUM & WELLBEING</Text>
          <Text style={styles.screenTitle}>Your Progress</Text>
        </View>

        <View style={styles.periodSwitcher}>
          <TouchableOpacity
            style={[styles.periodTab, period === 'week' && styles.periodTabActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodTabText, period === 'week' && styles.periodTabTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'month' && styles.periodTabActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodTabText, period === 'month' && styles.periodTabTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Metric Highlights */}
        <Animated.View entering={FadeInDown.duration(350).delay(100)}>
          <View style={styles.metricsRow}>
            {/* Active Time */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FFF4EE' }]}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#FF6A3D" />
              </View>
              <Text style={styles.metricLabel}>Movement Time</Text>
              <Text style={styles.metricValue}>
                {totalMinutes} <Text style={styles.metricUnit}>mins</Text>
              </Text>
              <Text style={styles.metricSub}>Target: 90 mins</Text>
            </View>

            {/* Consistency */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricLabel}>Consistency</Text>
              <Text style={styles.metricValue}>
                {completedDaysCount} <Text style={styles.metricUnit}>/ 5 days</Text>
              </Text>
              <Text style={styles.metricSub}>60% of goal</Text>
            </View>

            {/* Gentle Energy */}
            <View style={styles.metricCard}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F0F9FF' }]}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#0284C7" />
              </View>
              <Text style={styles.metricLabel}>Daily Energy</Text>
              <Text style={styles.metricValue}>Stable</Text>
              <Text style={styles.metricSub}>3 check-ins</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Activity Breakdown */}
        <Animated.View entering={FadeInDown.duration(350).delay(180)} style={styles.sectionContainer}>
          <View style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardHeading}>Activity This Week</Text>
                <Text style={styles.cardSubheading}>Regular, gentle pacing yields lasting vitality</Text>
              </View>
              <View style={styles.streakIndicatorBadge}>
                <Ionicons name="flame" size={14} color="#FF6A3D" />
                <Text style={styles.streakIndicatorText}>3 Day Streak</Text>
              </View>
            </View>

            <View style={styles.daysGrid}>
              {weekData.map((item, idx) => {
                const maxMins = 30;
                const barHeight = item.mins > 0 ? Math.max((item.mins / maxMins) * 56, 14) : 6;

                return (
                  <View key={idx} style={styles.dayColumn}>
                    <Text style={styles.dayMinsLabel}>{item.mins > 0 ? `${item.mins}m` : '-'}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: barHeight },
                          item.completed ? styles.barFillDone : styles.barFillEmpty
                        ]}
                      />
                    </View>
                    <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Daily Well-being Check-In */}
        <Animated.View entering={FadeInDown.duration(350).delay(260)} style={styles.sectionContainer}>
          <View style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardHeading}>Daily Energy & Body Check-In</Text>
                <Text style={styles.cardSubheading}>How does your body feel today?</Text>
              </View>
            </View>

            <Text style={styles.checkInGroupLabel}>Today's Energy Rating</Text>
            <View style={styles.energySelectorRow}>
              <TouchableOpacity
                style={[styles.energyOption, energyLevel === 'gentle' && styles.energyOptionActive]}
                activeOpacity={0.7}
                onPress={() => handleSelectEnergy('gentle')}
              >
                <MaterialCommunityIcons
                  name="feather"
                  size={20}
                  color={energyLevel === 'gentle' ? '#FF6A3D' : '#64748B'}
                />
                <Text style={[styles.energyOptionText, energyLevel === 'gentle' && styles.energyOptionTextActive]}>
                  Low / Gentle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.energyOption, energyLevel === 'steady' && styles.energyOptionActive]}
                activeOpacity={0.7}
                onPress={() => handleSelectEnergy('steady')}
              >
                <MaterialCommunityIcons
                  name="battery-medium"
                  size={20}
                  color={energyLevel === 'steady' ? '#FF6A3D' : '#64748B'}
                />
                <Text style={[styles.energyOptionText, energyLevel === 'steady' && styles.energyOptionTextActive]}>
                  Steady & Good
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.energyOption, energyLevel === 'energized' && styles.energyOptionActive]}
                activeOpacity={0.7}
                onPress={() => handleSelectEnergy('energized')}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={20}
                  color={energyLevel === 'energized' ? '#FF6A3D' : '#64748B'}
                />
                <Text style={[styles.energyOptionText, energyLevel === 'energized' && styles.energyOptionTextActive]}>
                  Energized
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wellbeingNoteBox}>
              <Ionicons name="heart" size={16} color="#10B981" />
              <Text style={styles.wellbeingNoteText}>
                Remember: On lower energy days, 5 to 10 minutes of gentle breathing or light stretching is a complete success.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Milestone Badges */}
        <Animated.View entering={FadeInDown.duration(350).delay(340)} style={styles.sectionContainer}>
          <View style={styles.cardBox}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardHeading}>Milestone Badges</Text>
                <Text style={styles.cardSubheading}>Celebrating every step of your journey</Text>
              </View>
              <Text style={styles.badgesCountText}>4 of 8 Unlocked</Text>
            </View>

            <View style={styles.badgesGrid}>
              {badges.map(b => (
                <View key={b.id} style={styles.badgeCard}>
                  <View style={[styles.badgeIconBubble, { backgroundColor: b.bgColor }]}>
                    <MaterialCommunityIcons name={b.icon as any} size={26} color={b.color} />
                  </View>
                  <Text style={styles.badgeTitle}>{b.title}</Text>
                  <Text style={styles.badgeDescription}>{b.description}</Text>
                </View>
              ))}
            </View>
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
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
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
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  metricSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubheading: {
    fontSize: 12,
    color: '#64748B',
  },
  streakIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  streakIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayMinsLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  barTrack: {
    width: 14,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barFillDone: {
    backgroundColor: '#FF6A3D',
  },
  barFillEmpty: {
    backgroundColor: '#E2E8F0',
  },
  dayLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  dayLabelToday: {
    color: '#FF6A3D',
    fontWeight: '700',
  },
  checkInGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  energySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  energyOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 6,
  },
  energyOptionActive: {
    backgroundColor: '#FFF4EE',
    borderColor: '#FF6A3D',
  },
  energyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  energyOptionTextActive: {
    color: '#FF6A3D',
    fontWeight: '700',
  },
  wellbeingNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  wellbeingNoteText: {
    fontSize: 12,
    color: '#065F46',
    flex: 1,
    lineHeight: 18,
  },
  badgesCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6A3D',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    textAlign: 'center',
  },
  badgeIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
});
