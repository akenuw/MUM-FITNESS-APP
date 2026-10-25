import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import Storage from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CalendarDay {
  date: number;
  day: string;
}

const SEVEN_DAYS: CalendarDay[] = [
  { date: 15, day: 'Mon' },
  { date: 16, day: 'Tue' },
  { date: 17, day: 'Wed' },
  { date: 18, day: 'Thu' }, // Default selected in reference mockup
  { date: 19, day: 'Fri' },
  { date: 20, day: 'Sat' },
  { date: 21, day: 'Sun' },
];

interface MealItem {
  id: number;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const defaultMeals: MealItem[] = [
  {
    id: 1,
    type: 'Lunch',
    name: 'Steamed Wild Salmon with Quinoa & Greens',
    calories: 480,
    protein: 36,
    carbs: 42,
    fat: 16,
    time: '1:15 PM',
  },
  {
    id: 2,
    type: 'Breakfast',
    name: 'Warm Rolled Oats with Blueberries & Chia',
    calories: 340,
    protein: 12,
    carbs: 58,
    fat: 7,
    time: '8:30 AM',
  },
  {
    id: 3,
    type: 'Snacks',
    name: 'Green Recovery Smoothie (Spinach, Apple)',
    calories: 160,
    protein: 4,
    carbs: 34,
    fat: 1,
    time: '4:00 PM',
  },
];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDayDate, setSelectedDayDate] = useState<number>(18); // Default 18 Thu as in mockup
  const [waterGlasses, setWaterGlasses] = useState<number>(3); // 3 glasses filled in mockup
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Meal Form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customType, setCustomType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Lunch');

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    const saved = Storage.get<MealItem[] | null>('logged_meals', null);
    if (saved && Array.isArray(saved) && (saved as MealItem[]).length > 0) {
      setMeals(saved);
    } else {
      setMeals(defaultMeals);
      Storage.set('logged_meals', defaultMeals);
    }

    const savedWater = Storage.get('today_water_glasses', null);
    if (savedWater !== null) {
      setWaterGlasses(Math.min(5, Math.max(0, Number(savedWater))));
    }
  };

  const handleSetWater = (count: number) => {
    const clamped = Math.min(5, Math.max(0, count));
    setWaterGlasses(clamped);
    Storage.set('today_water_glasses', clamped);
  };

  const handleAddCustomMeal = () => {
    if (!customName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this meal.');
      return;
    }

    const newMeal: MealItem = {
      id: Date.now(),
      type: customType,
      name: customName.trim(),
      calories: parseInt(customCalories) || 350,
      protein: 18,
      carbs: 35,
      fat: 10,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    Storage.set('logged_meals', updated);

    setCustomName('');
    setCustomCalories('');
    setShowAddModal(false);
  };

  const handleDeleteMeal = (id: number) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    Storage.set('logged_meals', updated);
  };

  // Values matching reference mockup: 1456 kcal Consumed, 2875 kcal Remaining
  const consumedCalories = 1456;
  const remainingCalories = 2875;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 18) }]}>
      {/* Centered Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Summary</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 7-Day Strip Calendar */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.calendarStrip}>
          {SEVEN_DAYS.map((item) => {
            const isSelected = item.date === selectedDayDate;
            return (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.calendarPill,
                  isSelected && styles.calendarPillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedDayDate(item.date)}
              >
                <Text
                  style={[
                    styles.calendarDateText,
                    isSelected && styles.calendarDateTextActive,
                  ]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextActive,
                  ]}
                >
                  {item.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Main Calorie & Macronutrient Card (Ice Blue) */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.macroCard}>
          {/* Top 3-Column Stats Row */}
          <View style={styles.macroTopRow}>
            {/* Left: Consumed */}
            <View style={styles.macroStatCol}>
              <Text style={styles.macroStatValue}>{consumedCalories} kcal</Text>
              <Text style={styles.macroStatLabel}>Consumed</Text>
            </View>

            {/* Center: Radial Ring Gauge */}
            <View style={styles.ringGaugeWrapper}>
              <Svg width="116" height="116" viewBox="0 0 116 116" fill="none">
                {/* Radial Tick Marks (Unconsumed Upper-Left Arc) */}
                {Array.from({ length: 18 }).map((_, i) => {
                  const angle = 125 + i * 8.5; // Spread around upper-left quadrant
                  const rad = (angle * Math.PI) / 180;
                  const innerR = 43;
                  const outerR = 49;
                  const x1 = 58 + innerR * Math.cos(rad);
                  const y1 = 58 + innerR * Math.sin(rad);
                  const x2 = 58 + outerR * Math.cos(rad);
                  const y2 = 58 + outerR * Math.sin(rad);
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#B8D8DC"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Coral Red Progress Arc (Consumed portion) */}
                {/* Arc sweeping smoothly clockwise around 260 degrees */}
                <Path
                  d="M 58 12 A 46 46 0 1 1 20 40"
                  stroke="#FF5A4E"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>

              {/* Inner White Disc with Centered Calorie Text */}
              <View style={styles.innerWhiteDisc}>
                <Text style={styles.discCalorieNumber}>{remainingCalories}</Text>
                <Text style={styles.discCalorieUnit}>kcal</Text>
              </View>
            </View>

            {/* Right: Remaining */}
            <View style={styles.macroStatCol}>
              <Text style={styles.macroStatValue}>{remainingCalories} kcal</Text>
              <Text style={styles.macroStatLabel}>Remaining</Text>
            </View>
          </View>

          {/* Bottom 3 Macro Progress Bars: Protein, Carbs, Fat */}
          <View style={styles.macroBarsRow}>
            {/* Protein: Black */}
            <View style={styles.macroBarCol}>
              <Text style={styles.macroBarLabel}>P - 10/12g</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { backgroundColor: '#18181A', width: '83%' }]} />
              </View>
            </View>

            {/* Carbs: Teal */}
            <View style={styles.macroBarCol}>
              <Text style={styles.macroBarLabel}>C - 10/12g</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { backgroundColor: '#0F8B8D', width: '83%' }]} />
              </View>
            </View>

            {/* Fat: Coral Red */}
            <View style={styles.macroBarCol}>
              <Text style={styles.macroBarLabel}>F - 10/12g</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { backgroundColor: '#FF5A4E', width: '83%' }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Interactive Water Intake Card (Peach) */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.waterCard}>
          <Text style={styles.waterTitle}>Water Intake</Text>
          <Text style={styles.waterSubtitle}>Recomended 5 litter</Text>

          {/* 5 Tumbler Glasses Row */}
          <View style={styles.glassesRow}>
            {[1, 2, 3, 4, 5].map((glassNum) => {
              const isFilled = glassNum <= waterGlasses;
              const isNextAddGlass = glassNum === waterGlasses + 1;

              return (
                <TouchableOpacity
                  key={glassNum}
                  style={styles.glassTouchTarget}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (isFilled && glassNum === waterGlasses) {
                      handleSetWater(glassNum - 1); // Decrement on tapping last filled
                    } else {
                      handleSetWater(glassNum);
                    }
                  }}
                >
                  <Svg width="34" height="46" viewBox="0 0 34 46" fill="none">
                    {/* Glass Outline Container (tapered tumbler) */}
                    <Path
                      d="M5 4L8 41C8.2 42.5 9.5 43.5 11 43.5H23C24.5 43.5 25.8 42.5 26 41L29 4"
                      stroke={isFilled ? '#14939A' : '#C4D3D8'}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Filled Water with Wave Crest & Bubbles */}
                    {isFilled && (
                      <G>
                        {/* Wave Surface & Water Body */}
                        <Path
                          d="M6.5 16C9 14.5 13 17 17 15.5C21 14 25 16.5 27.5 15L26 41C25.8 42 24.5 43 23 43H11C9.5 43 8.2 42 8 41L6.5 16Z"
                          fill="#14939A"
                        />
                        {/* Floating Air Bubbles */}
                        <Circle cx="12" cy="24" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
                        <Circle cx="21" cy="28" r="1.2" fill="#FFFFFF" fillOpacity="0.8" />
                        <Circle cx="15" cy="33" r="1.4" fill="#FFFFFF" fillOpacity="0.8" />
                      </G>
                    )}

                    {/* Center Plus (+) on Next Empty Glass */}
                    {!isFilled && isNextAddGlass && (
                      <G>
                        <Path
                          d="M17 17V27M12 22H22"
                          stroke="#14939A"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </G>
                    )}
                  </Svg>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interactive Slider Track matching filled percentage */}
          <View style={styles.sliderTrackWrapper}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFillTeal,
                  { width: `${(waterGlasses / 5) * 100}%` },
                ]}
              />
            </View>
            {/* Slider Circular Thumb */}
            <View
              style={[
                styles.sliderThumb,
                { left: `${Math.max(4, Math.min(96, (waterGlasses / 5) * 100))}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* Meal Log Section: Starting with Lunch Card as in Mockup */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.mealSection}>
          <View style={styles.mealSectionHeader}>
            <Text style={styles.mealSectionTitle}>Meals Logged</Text>
            <TouchableOpacity
              style={styles.addMealBtn}
              activeOpacity={0.7}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={16} color="#0F8B8D" />
              <Text style={styles.addMealBtnText}>Add Meal</Text>
            </TouchableOpacity>
          </View>

          {/* Lunch Card matching reference mockup */}
          {meals.map((item) => (
            <View key={item.id} style={styles.mealCard}>
              {/* Circular Food Plate Illustration */}
              <View style={styles.foodPlateWrapper}>
                <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                  {/* Plate Base */}
                  <Circle cx="23" cy="23" r="21" fill="#FBF3EB" stroke="#F0E5D8" strokeWidth="1.5" />
                  {/* Food Serving Art (Salmon slice & fresh greens) */}
                  <Path
                    d="M14 24C14 17 21 15 28 17C31 23 27 29 20 29C16 29 14 27 14 24Z"
                    fill="#FF7E45"
                  />
                  <Path d="M18 20L25 24" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
                  <Path d="M16 24L23 28" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Greens Accents */}
                  <Circle cx="28" cy="28" r="3.5" fill="#4CAF50" />
                  <Circle cx="32" cy="24" r="2.5" fill="#81C784" />
                </Svg>
              </View>

              {/* Meal Details */}
              <View style={styles.mealInfoCol}>
                <Text style={styles.mealCardTitle}>{item.type}</Text>
                <Text style={styles.mealCardSubtitle} numberOfLines={1}>
                  {item.name} • {item.calories} kcal
                </Text>
              </View>

              {/* Time Tag & Action */}
              <View style={styles.mealRightCol}>
                <Text style={styles.mealTimeText}>{item.time}</Text>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => handleDeleteMeal(item.id)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#C2C7D0" style={{ marginTop: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Add Custom Meal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Log Meal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#18181A" />
              </TouchableOpacity>
            </View>

            {/* Meal Type Selector */}
            <View style={styles.typeSelectorRow}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeSelectorBtn,
                    customType === type && styles.typeSelectorBtnActive,
                  ]}
                  onPress={() => setCustomType(type)}
                >
                  <Text
                    style={[
                      styles.typeSelectorText,
                      customType === type && styles.typeSelectorTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Meal Name Input */}
            <Text style={styles.inputLabel}>Meal Description</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g., Avocado Toast with Poached Egg"
              placeholderTextColor="#A0A5AA"
              value={customName}
              onChangeText={setCustomName}
            />

            {/* Calories Input */}
            <Text style={styles.inputLabel}>Calories (kcal)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g., 420"
              placeholderTextColor="#A0A5AA"
              keyboardType="number-pad"
              value={customCalories}
              onChangeText={setCustomCalories}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.85}
              onPress={handleAddCustomMeal}
            >
              <Text style={styles.submitBtnText}>Save Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181A',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* 7-Day Calendar Strip */
  calendarStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  calendarPill: {
    width: 44,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPillActive: {
    backgroundColor: '#18181A',
  },
  calendarDateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181A',
  },
  calendarDateTextActive: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E9297',
    marginTop: 4,
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
  },

  /* Macro Card */
  macroCard: {
    backgroundColor: '#EAF6F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginVertical: 14,
  },
  macroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181A',
  },
  macroStatLabel: {
    fontSize: 12,
    color: '#8E9297',
    marginTop: 2,
  },
  ringGaugeWrapper: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerWhiteDisc: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  discCalorieNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18181A',
  },
  discCalorieUnit: {
    fontSize: 11,
    color: '#8E9297',
    marginTop: 1,
  },
  macroBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  macroBarCol: {
    flex: 1,
  },
  macroBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#18181A',
    marginBottom: 6,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },

  /* Water Card */
  waterCard: {
    backgroundColor: '#FDF3E7',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181A',
  },
  waterSubtitle: {
    fontSize: 12,
    color: '#8E9297',
    marginTop: 2,
    fontWeight: '400',
  },
  glassesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 6,
  },
  glassTouchTarget: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrackWrapper: {
    marginTop: 16,
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#EAD9C8',
    width: '100%',
    overflow: 'hidden',
  },
  sliderFillTeal: {
    height: 3,
    backgroundColor: '#0F8B8D',
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#0F8B8D',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  /* Meals Section */
  mealSection: {
    marginTop: 6,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181A',
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addMealBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F8B8D',
    marginLeft: 2,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F3F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  foodPlateWrapper: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  mealCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181A',
  },
  mealCardSubtitle: {
    fontSize: 12,
    color: '#8E9297',
    marginTop: 3,
  },
  mealRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  mealTimeText: {
    fontSize: 11,
    color: '#A0A5AA',
    fontWeight: '500',
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181A',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeSelectorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
  },
  typeSelectorBtnActive: {
    backgroundColor: '#18181A',
  },
  typeSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E9297',
  },
  typeSelectorTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181A',
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#18181A',
    marginBottom: 10,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F8B8D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
