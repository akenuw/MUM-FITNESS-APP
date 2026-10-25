import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  G,
  Line,
} from 'react-native-svg';

import { profileService } from '@/services/api';
import Storage from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Data points for the 7-day activities spline chart matching mockup
const WEEKLY_DATA = [
  { day: 'Sat', value: 120, label: '120 kcl' },
  { day: 'Sun', value: 236, label: '236 kcl' }, // Highlighted in mockup
  { day: 'Mon', value: 180, label: '180 kcl' },
  { day: 'Tue', value: 150, label: '150 kcl' },
  { day: 'Wed', value: 210, label: '210 kcl' },
  { day: 'Thu', value: 130, label: '130 kcl' },
  { day: 'Fri', value: 195, label: '195 kcl' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Lina');
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Default to Sunday (index 1)

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await profileService.getProfile();
      if (profile && profile.name) {
        setUserName(profile.name.split(' ')[0]);
      }
    } catch (e) {
      console.log('Error loading user profile:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  // Dynamic formatted date e.g., "Thursday, 08 July"
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  // Spline Chart Dimensions & Coordinates
  const chartWidth = SCREEN_WIDTH - 40 - 45; // subtract screen padding and y-axis width
  const chartHeight = 150;
  const maxValue = 400;

  const points = WEEKLY_DATA.map((item, index) => {
    const x = (index / (WEEKLY_DATA.length - 1)) * chartWidth;
    const y = chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, value: item.value, label: item.label, day: item.day };
  });

  // Generate smooth cubic Bézier curve path
  const generateSplinePath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      // Catmull-Rom to Cubic Bézier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const splinePath = generateSplinePath();
  const areaPath = `${splinePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const activePoint = points[selectedDayIndex] || points[1];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 18) }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F8B8D" />
        }
      >
        {/* Top Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerRow}>
          <View style={styles.userInfoCol}>
            {/* Avatar Circle with Tan Background */}
            <TouchableOpacity
              style={styles.avatarContainer}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <Circle cx="24" cy="24" r="24" fill="#E6C6A8" />
                {/* Clean Stylized Avatar Illustration */}
                {/* Hair / Hat Brim */}
                <Path
                  d="M10 24C10 24 16 19 24 19C32 19 38 24 38 24C38 24 35 22 24 22C13 22 10 24 10 24Z"
                  fill="#75482F"
                />
                <Path
                  d="M17 19C17 15 20 12 24 12C28 12 31 15 31 19H17Z"
                  fill="#8A5A3B"
                />
                {/* Face & Features */}
                <Circle cx="24" cy="25" r="7" fill="#D39F75" />
                <Circle cx="22" cy="24" r="1" fill="#4A2E1B" />
                <Circle cx="26" cy="24" r="1" fill="#4A2E1B" />
                <Path
                  d="M22.5 27.5C23 28.2 25 28.2 25.5 27.5"
                  stroke="#4A2E1B"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* Shoulders */}
                <Path
                  d="M15 42C15 35 18 32 24 32C30 32 33 35 33 42H15Z"
                  fill="#2A2A2E"
                />
              </Svg>
            </TouchableOpacity>

            <View style={styles.greetingCol}>
              <Text style={styles.greetingTitle}>Hello {userName}!</Text>
              <Text style={styles.dateSubtitle}>{todayFormatted}</Text>
            </View>
          </View>

          {/* Notification Bell Button with Coral Red Dot */}
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="notifications-outline" size={22} color="#18181A" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* Featured Yoga Class Carousel */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScroll}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.82 + 14}
          >
            {/* Card 1: Yoga Class 101 */}
            <TouchableOpacity
              style={styles.heroCard}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              {/* Left Yoga Character Illustration */}
              <View style={styles.heroIllustWrap}>
                <Svg width="86" height="86" viewBox="0 0 100 100" fill="none">
                  {/* Subtle Glow Aura */}
                  <Circle cx="50" cy="50" r="42" fill="rgba(255, 90, 78, 0.08)" />

                  {/* Character Head & Bun */}
                  <Circle cx="50" cy="26" r="10" fill="#D39F75" />
                  <Circle cx="50" cy="14" r="5" fill="#18181A" />
                  <Path d="M40 25C40 18 45 15 50 15C55 15 60 18 60 25H40Z" fill="#18181A" />

                  {/* Torso in Vibrant Coral */}
                  <Path
                    d="M39 36C42 33 58 33 61 36L64 54C64 57 60 59 50 59C40 59 36 57 36 54L39 36Z"
                    fill="#FF5A4E"
                  />

                  {/* Arms extended in calm mudra */}
                  <Path
                    d="M39 38L22 47C20 48 20 51 22 52L30 54"
                    stroke="#FF5A4E"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M61 38L78 47C80 48 80 51 78 52L70 54"
                    stroke="#FF5A4E"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Hands */}
                  <Circle cx="21" cy="49" r="3" fill="#D39F75" />
                  <Circle cx="79" cy="49" r="3" fill="#D39F75" />

                  {/* Crossed Legs in Brand Teal */}
                  <Path
                    d="M26 62C26 56 36 56 50 56C64 56 74 56 74 62C74 68 62 70 50 70C38 70 26 68 26 62Z"
                    fill="#0F8B8D"
                  />
                  {/* Crossed Feet */}
                  <Circle cx="33" cy="63" r="4.5" fill="#D39F75" />
                  <Circle cx="67" cy="63" r="4.5" fill="#D39F75" />

                  {/* Sparkle Floating Stars */}
                  <Path d="M18 28L19.5 32L24 33.5L19.5 35L18 39L16.5 35L12 33.5L16.5 32Z" fill="#FFB703" />
                  <Path d="M80 22L81 25L84 26L81 27L80 30L79 27L76 26L79 25Z" fill="#FFB703" />
                </Svg>
              </View>

              {/* Card Details */}
              <View style={styles.heroContentWrap}>
                <View style={styles.heroTopRow}>
                  <Text style={styles.fitnessBadge}>FITNESS</Text>
                  <Ionicons name="ellipsis-vertical" size={17} color="#8E9297" />
                </View>

                <Text style={styles.heroTitle}>Training Yoga{'\n'}Class 101</Text>
                <Text style={styles.heroSubtitle}>Starting Date: 12 Apr</Text>
              </View>
            </TouchableOpacity>

            {/* Peeking Secondary Card (Card 2) */}
            <TouchableOpacity
              style={styles.heroCardPeeking}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <Svg width="70" height="90" viewBox="0 0 80 100" fill="none">
                <Circle cx="40" cy="50" r="35" fill="rgba(15, 139, 141, 0.12)" />
                {/* Peeking Runner Figure */}
                <Circle cx="35" cy="24" r="9" fill="#D39F75" />
                <Path d="M26 23C26 17 31 15 36 15C41 15 44 17 44 23H26Z" fill="#18181A" />
                <Path d="M26 34C28 32 40 32 44 34L40 56H28L26 34Z" fill="#FF5A4E" />
                <Path d="M25 56L18 76" stroke="#0F8B8D" strokeWidth="6" strokeLinecap="round" />
                <Path d="M38 56L48 72" stroke="#0F8B8D" strokeWidth="6" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Section: My Plan */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>My Plan</Text>

          <View style={styles.planCardsRow}>
            {/* Card 1: Workout (Dark / Black) */}
            <TouchableOpacity
              style={styles.planCardDark}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={styles.planIconBadgeDark}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M7 17L17 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <Path d="M13.5 5.5L18.5 10.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
                  <Path d="M5.5 13.5L10.5 18.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.planTitleWhite}>Workout</Text>
              <Text style={styles.planSubtitleMuted}>2 Hours</Text>
            </TouchableOpacity>

            {/* Card 2: Running (Blush Pink) */}
            <TouchableOpacity
              style={styles.planCardPink}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={styles.planIconBadgePink}>
                <MaterialCommunityIcons name="shoe-sneaker" size={19} color="#FF5A4E" />
              </View>
              <Text style={styles.planTitleDark}>Running</Text>
              <Text style={styles.planSubtitleDark}>12 km</Text>
            </TouchableOpacity>

            {/* Card 3: Food (Ice Blue) */}
            <TouchableOpacity
              style={styles.planCardBlue}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/nutrition')}
            >
              <View style={styles.planIconBadgeBlue}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="5.5" r="1.6" fill="#0F8B8D" />
                  <Path
                    d="M4.5 15.5C4.8 11.2 8 7.8 12 7.8C16 7.8 19.2 11.2 19.5 15.5H4.5Z"
                    stroke="#0F8B8D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path d="M2.8 18.5H21.2" stroke="#0F8B8D" strokeWidth="2.1" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.planTitleDark}>Food</Text>
              <Text style={styles.planSubtitleDark}>1832 kcal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Section: Activites (Spline Chart) */}
        <Animated.View entering={FadeInDown.duration(400).delay(220)} style={styles.sectionContainer}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Activites</Text>
            <View style={styles.dropdownBadge}>
              <Text style={styles.dropdownBadgeText}>Weekly</Text>
              <Ionicons name="chevron-down" size={14} color="#18181A" style={{ marginLeft: 3 }} />
            </View>
          </View>

          {/* Interactive Spline Chart Container */}
          <View style={styles.chartCard}>
            <View style={styles.chartFlexRow}>
              {/* Y-Axis Labels */}
              <View style={styles.yAxisCol}>
                <Text style={styles.axisLabelText}>400</Text>
                <Text style={styles.axisLabelText}>300</Text>
                <Text style={styles.axisLabelText}>200</Text>
                <Text style={styles.axisLabelText}>100</Text>
                <Text style={styles.axisLabelText}>00</Text>
              </View>

              {/* Chart SVG Canvas */}
              <View style={styles.chartSvgArea}>
                <Svg width={chartWidth} height={chartHeight} style={StyleSheet.absoluteFill}>
                  <Defs>
                    {/* Brand Teal Area Gradient */}
                    <LinearGradient id="tealAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#0F8B8D" stopOpacity="0.22" />
                      <Stop offset="100%" stopColor="#0F8B8D" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>

                  {/* Horizontal Guide Lines */}
                  {[0, 1, 2, 3, 4].map((step) => {
                    const lineY = (step / 4) * chartHeight;
                    return (
                      <Line
                        key={step}
                        x1="0"
                        y1={lineY}
                        x2={chartWidth}
                        y2={lineY}
                        stroke="#F0F2F5"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Smooth Area Gradient Fill */}
                  <Path d={areaPath} fill="url(#tealAreaGrad)" />

                  {/* Smooth Brand Teal Curve Line */}
                  <Path
                    d={splinePath}
                    stroke="#0F8B8D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* Vertical Dashed Line at Active Day (Mockup: Sunday) */}
                  <Line
                    x1={activePoint.x}
                    y1={activePoint.y}
                    x2={activePoint.x}
                    y2={chartHeight}
                    stroke="#0F8B8D"
                    strokeWidth="1.6"
                    strokeDasharray="4 4"
                  />

                  {/* Active Peak Dot: White Center with Brand Teal Ring */}
                  <Circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#0F8B8D"
                    strokeWidth="2.4"
                  />
                </Svg>

                {/* Floating Tooltip Pill (Positioned above active peak) */}
                <View
                  style={[
                    styles.tooltipPill,
                    {
                      left: Math.max(0, Math.min(activePoint.x - 30, chartWidth - 60)),
                      top: Math.max(0, activePoint.y - 34),
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.tooltipPillText}>{activePoint.label}</Text>
                </View>
              </View>
            </View>

            {/* X-Axis Labels Row */}
            <View style={styles.xAxisRow}>
              {WEEKLY_DATA.map((item, index) => {
                const isSelected = index === selectedDayIndex;
                return (
                  <TouchableOpacity
                    key={item.day}
                    style={styles.xAxisItem}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDayIndex(index)}
                  >
                    <Text style={[styles.xAxisText, isSelected && styles.xAxisTextActive]}>
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* Top Header Row */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  userInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingCol: {
    marginLeft: 12,
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181A',
    letterSpacing: -0.2,
  },
  dateSubtitle: {
    fontSize: 13,
    color: '#8E9297',
    marginTop: 2,
    fontWeight: '400',
  },
  notificationBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A4E',
  },

  /* Featured Carousel */
  carouselContainer: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  carouselScroll: {
    paddingHorizontal: 20,
  },
  heroCard: {
    width: SCREEN_WIDTH * 0.82,
    height: 142,
    borderRadius: 24,
    backgroundColor: '#FDF3E7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 14,
  },
  heroIllustWrap: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContentWrap: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fitnessBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5A4E',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181A',
    lineHeight: 21,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#8E9297',
    marginTop: 4,
    fontWeight: '400',
  },
  heroCardPeeking: {
    width: 65,
    height: 142,
    borderRadius: 24,
    backgroundColor: '#EAF6F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* Section: My Plan */
  sectionContainer: {
    marginBottom: 26,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181A',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  planCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  planCardDark: {
    flex: 1,
    minHeight: 124,
    borderRadius: 20,
    backgroundColor: '#18181A',
    padding: 14,
    justifyContent: 'space-between',
  },
  planIconBadgeDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleWhite: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
  },
  planSubtitleMuted: {
    fontSize: 12,
    color: '#A0A5AA',
    marginTop: 2,
    fontWeight: '400',
  },
  planCardPink: {
    flex: 1,
    minHeight: 124,
    borderRadius: 20,
    backgroundColor: '#FDECEB',
    padding: 14,
    justifyContent: 'space-between',
  },
  planIconBadgePink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 90, 78, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardBlue: {
    flex: 1,
    minHeight: 124,
    borderRadius: 20,
    backgroundColor: '#EAF6F8',
    padding: 14,
    justifyContent: 'space-between',
  },
  planIconBadgeBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 139, 141, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181A',
    marginTop: 14,
  },
  planSubtitleDark: {
    fontSize: 12,
    color: '#8E9297',
    marginTop: 2,
    fontWeight: '400',
  },

  /* Spline Chart */
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dropdownBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181A',
  },
  chartCard: {
    width: '100%',
    paddingTop: 10,
  },
  chartFlexRow: {
    flexDirection: 'row',
    height: 150,
  },
  yAxisCol: {
    width: 38,
    height: 150,
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  axisLabelText: {
    fontSize: 11,
    color: '#A0A5AA',
    fontWeight: '400',
  },
  chartSvgArea: {
    flex: 1,
    height: 150,
    position: 'relative',
  },
  tooltipPill: {
    position: 'absolute',
    backgroundColor: '#18181A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 38,
    marginTop: 10,
  },
  xAxisItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  xAxisText: {
    fontSize: 11,
    color: '#A0A5AA',
    fontWeight: '500',
  },
  xAxisTextActive: {
    color: '#18181A',
    fontWeight: '700',
  },
});
