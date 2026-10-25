import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Storage from '@/utils/storage';

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
    type: 'Breakfast',
    name: 'Warm Rolled Oats with Blueberries & Chia',
    calories: 340,
    protein: 12,
    carbs: 58,
    fat: 7,
    time: '8:30 AM',
  },
  {
    id: 2,
    type: 'Lunch',
    name: 'Steamed Wild Salmon with Quinoa & Greens',
    calories: 480,
    protein: 36,
    carbs: 42,
    fat: 16,
    time: '1:15 PM',
  },
  {
    id: 3,
    type: 'Snacks',
    name: 'Green Recovery Smoothie (Spinach, Apple, Ginger)',
    calories: 160,
    protein: 4,
    carbs: 34,
    fat: 1,
    time: '4:00 PM',
  },
];

const wholesomeSuggestions = [
  { name: 'Poached Eggs on Sourdough Toast', type: 'Breakfast' as const, calories: 310, protein: 18, carbs: 28, fat: 12 },
  { name: 'Lentil Vegetable Soup with Herbs', type: 'Lunch' as const, calories: 360, protein: 16, carbs: 54, fat: 5 },
  { name: 'Baked Sweet Potato & Grilled Chicken', type: 'Dinner' as const, calories: 440, protein: 38, carbs: 45, fat: 9 },
  { name: 'Handful of Walnuts & Chamomile Tea', type: 'Snacks' as const, calories: 180, protein: 4, carbs: 6, fat: 17 },
  { name: 'Greek Yogurt with Drizzle of Honey', type: 'Breakfast' as const, calories: 210, protein: 17, carbs: 22, fat: 4 },
];

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [waterCups, setWaterCups] = useState<number>(4);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Meal Form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customType, setCustomType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');

  useEffect(() => {
    loadSavedNutrition();
  }, []);

  const loadSavedNutrition = () => {
    const saved = Storage.get<MealItem[] | null>('logged_meals', null);
    if (saved && Array.isArray(saved) && (saved as MealItem[]).length > 0) {
      setMeals(saved);
    } else {
      setMeals(defaultMeals);
      Storage.set('logged_meals', defaultMeals);
    }

    const savedWater = Storage.get('today_water_glasses', null);
    if (savedWater !== null) {
      setWaterCups(Number(savedWater));
    }
  };

  const handleToggleCup = (index: number) => {
    const newCups = index + 1 === waterCups ? index : index + 1;
    setWaterCups(newCups);
    Storage.set('today_water_glasses', newCups);
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const calorieGoal = 1850;
  const proteinGoal = 85;
  const carbsGoal = 210;
  const fatGoal = 60;

  const filteredMeals = selectedType === 'All'
    ? meals
    : meals.filter(m => m.type === selectedType);

  const handleAddCustomMeal = () => {
    if (!customName.trim()) {
      Alert.alert('Missing Name', 'Please provide a name for this meal.');
      return;
    }

    const newMeal: MealItem = {
      id: Date.now(),
      type: customType,
      name: customName.trim(),
      calories: parseInt(customCalories) || 250,
      protein: parseInt(customProtein) || 12,
      carbs: 30,
      fat: 8,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    Storage.set('logged_meals', updated);

    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setShowAddModal(false);
  };

  const handlePickSuggestion = (s: typeof wholesomeSuggestions[0]) => {
    const newMeal: MealItem = {
      id: Date.now(),
      type: s.type,
      name: s.name,
      calories: s.calories,
      protein: s.protein,
      carbs: s.carbs,
      fat: s.fat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    Storage.set('logged_meals', updated);
    setShowAddModal(false);
  };

  const handleDeleteMeal = (id: number) => {
    const updated = meals.filter(m => m.id !== id);
    setMeals(updated);
    Storage.set('logged_meals', updated);
  };

  const handleScanPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to media library
        const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== 'granted') {
          Alert.alert('Permission Needed', 'Camera or photo library permission is needed to analyze meal images.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Simulated smart nutritional recognition
        const analyzedMeal: MealItem = {
          id: Date.now(),
          type: 'Lunch',
          name: 'Nourishing Roasted Greens & Grain Plate',
          calories: 420,
          protein: 22,
          carbs: 48,
          fat: 14,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        Alert.alert(
          'Meal Recognized 🥗',
          'Nourishing Roasted Greens & Grain Plate\n\n• Calories: 420 kcal\n• Protein: 22g\n• Fiber & Healthy Fats: Optimal\n\nAdd this to your daily log?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add to Log',
              onPress: () => {
                const updated = [analyzedMeal, ...meals];
                setMeals(updated);
                Storage.set('logged_meals', updated);
              }
            }
          ]
        );
      }
    } catch (err) {
      console.log('Error opening camera:', err);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenSubtitle}>DAILY NOURISHMENT</Text>
          <Text style={styles.screenTitle}>Nutrition & Hydration</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8} onPress={handleScanPhoto}>
            <Ionicons name="camera-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Calorie & Energy Overview Card */}
        <Animated.View entering={FadeInDown.duration(350).delay(100)}>
          <View style={styles.energyCard}>
            <View style={styles.energyCardHeader}>
              <View>
                <Text style={styles.energyLabel}>Energy Ingested Today</Text>
                <View style={styles.energyValuesRow}>
                  <Text style={styles.caloriesNumber}>{totalCalories}</Text>
                  <Text style={styles.caloriesGoalText}>/ {calorieGoal} kcal target</Text>
                </View>
              </View>
              <View style={styles.remainingPill}>
                <Text style={styles.remainingNumber}>{Math.max(calorieGoal - totalCalories, 0)}</Text>
                <Text style={styles.remainingText}>kcal left</Text>
              </View>
            </View>

            <View style={styles.calorieProgressBar}>
              <View
                style={[
                  styles.calorieProgressBarFill,
                  { width: `${Math.min((totalCalories / calorieGoal) * 100, 100)}%` }
                ]}
              />
            </View>

            {/* Macronutrients Grid */}
            <View style={styles.macrosRow}>
              {/* Protein */}
              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Protein</Text>
                  <Text style={styles.macroAmount}>{totalProtein}g</Text>
                </View>
                <View style={styles.macroTrack}>
                  <View
                    style={[
                      styles.macroFill,
                      { width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%`, backgroundColor: '#FF6A3D' }
                    ]}
                  />
                </View>
                <Text style={styles.macroGoalSub}>Goal: {proteinGoal}g</Text>
              </View>

              {/* Carbs */}
              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Carbs</Text>
                  <Text style={styles.macroAmount}>{totalCarbs}g</Text>
                </View>
                <View style={styles.macroTrack}>
                  <View
                    style={[
                      styles.macroFill,
                      { width: `${Math.min((totalCarbs / carbsGoal) * 100, 100)}%`, backgroundColor: '#2E7D32' }
                    ]}
                  />
                </View>
                <Text style={styles.macroGoalSub}>Goal: {carbsGoal}g</Text>
              </View>

              {/* Healthy Fats */}
              <View style={styles.macroCol}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>Fats</Text>
                  <Text style={styles.macroAmount}>{totalFat}g</Text>
                </View>
                <View style={styles.macroTrack}>
                  <View
                    style={[
                      styles.macroFill,
                      { width: `${Math.min((totalFat / fatGoal) * 100, 100)}%`, backgroundColor: '#0284C7' }
                    ]}
                  />
                </View>
                <Text style={styles.macroGoalSub}>Goal: {fatGoal}g</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Hydration Tracker */}
        <Animated.View entering={FadeInDown.duration(350).delay(180)} style={styles.sectionWrapper}>
          <View style={styles.hydrationCard}>
            <View style={styles.hydrationHeader}>
              <View style={styles.hydrationIconBadge}>
                <MaterialCommunityIcons name="water" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.hydrationTitle}>Hydration Tracker</Text>
                <Text style={styles.hydrationSubtitle}>
                  {waterCups} of 8 cups logged • {waterCups * 250} ml
                </Text>
              </View>
              <Text style={styles.hydrationTapHint}>Tap to log</Text>
            </View>

            <View style={styles.cupsRow}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                const filled = i < waterCups;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.cupBubble, filled && styles.cupBubbleFilled]}
                    activeOpacity={0.7}
                    onPress={() => handleToggleCup(i)}
                  >
                    <MaterialCommunityIcons
                      name={filled ? 'cup-water' : 'cup-outline'}
                      size={20}
                      color={filled ? '#FFFFFF' : '#94A3B8'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Meal Filter Pills */}
        <Animated.View entering={FadeInDown.duration(350).delay(260)} style={styles.sectionWrapper}>
          <View style={styles.mealsHeaderRow}>
            <Text style={styles.sectionHeading}>Today's Nourishment</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.addMealAction}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterPillsRow}>
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(type => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Meals List */}
          {filteredMeals.map((meal, idx) => (
            <Animated.View key={meal.id} entering={FadeInDown.duration(300).delay(idx * 50)}>
              <View style={styles.mealCard}>
                <View style={styles.mealTypeBadge}>
                  <Text style={styles.mealTypeBadgeText}>{meal.type}</Text>
                  <Text style={styles.mealTimeText}>{meal.time}</Text>
                </View>

                <View style={styles.mealMainRow}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteMeal(meal.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>

                <View style={styles.mealNutrientsRow}>
                  <Text style={styles.nutrientTag}>{meal.calories} kcal</Text>
                  <Text style={styles.nutrientDot}>•</Text>
                  <Text style={styles.nutrientTag}>{meal.protein}g protein</Text>
                  <Text style={styles.nutrientDot}>•</Text>
                  <Text style={styles.nutrientTag}>{meal.carbs}g carbs</Text>
                  <Text style={styles.nutrientDot}>•</Text>
                  <Text style={styles.nutrientTag}>{meal.fat}g fat</Text>
                </View>
              </View>
            </Animated.View>
          ))}

          {filteredMeals.length === 0 && (
            <View style={styles.emptyMealsBox}>
              <MaterialCommunityIcons name="food-apple-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyMealsTitle}>No items logged in {selectedType}</Text>
              <TouchableOpacity style={styles.quickAddEmptyBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.quickAddEmptyText}>Log a {selectedType} meal</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Gentle Nutrition Guidance Card */}
        <Animated.View entering={FadeInDown.duration(350).delay(320)} style={styles.sectionWrapper}>
          <View style={styles.wisdomCard}>
            <View style={styles.wisdomHeader}>
              <Ionicons name="bulb-outline" size={18} color="#D97706" />
              <Text style={styles.wisdomTitle}>Supportive Nutrition Tip</Text>
            </View>
            <Text style={styles.wisdomText}>
              Spread protein intake across smaller, frequent portions throughout your day to preserve muscle mass and support gentle recovery without burdening digestion.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add Meal Bottom Sheet Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Log Nourishment</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Meal Type Selector */}
              <Text style={styles.inputSectionLabel}>Meal Category</Text>
              <View style={styles.typeSelectorRow}>
                {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeButton, customType === t && styles.typeButtonActive]}
                    onPress={() => setCustomType(t)}
                  >
                    <Text style={[styles.typeButtonText, customType === t && styles.typeButtonTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Inputs */}
              <Text style={styles.inputSectionLabel}>Custom Item</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="Item name (e.g. Avocado Toast)"
                placeholderTextColor="#94A3B8"
                value={customName}
                onChangeText={setCustomName}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Calories (kcal)</Text>
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="e.g. 350"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={customCalories}
                    onChangeText={setCustomCalories}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="e.g. 15"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveCustomBtn} onPress={handleAddCustomMeal}>
                <Text style={styles.saveCustomBtnText}>Add Custom Item</Text>
              </TouchableOpacity>

              {/* Wholesome Suggestions */}
              <Text style={[styles.inputSectionLabel, { marginTop: 22 }]}>Wholesome Ideas</Text>
              {wholesomeSuggestions.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionRow}
                  activeOpacity={0.7}
                  onPress={() => handlePickSuggestion(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionMeta}>
                      {item.type} • {item.calories} kcal • {item.protein}g protein
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color="#FF6A3D" />
                </TouchableOpacity>
              ))}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6A3D',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  energyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  energyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  energyLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  energyValuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  caloriesGoalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 6,
  },
  remainingPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  remainingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  remainingText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  calorieProgressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  calorieProgressBarFill: {
    height: '100%',
    backgroundColor: '#FF6A3D',
    borderRadius: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroTitle: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  macroAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  macroTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoalSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionWrapper: {
    marginBottom: 18,
  },
  hydrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  hydrationIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hydrationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  hydrationSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  hydrationTapHint: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  cupsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  cupBubble: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupBubbleFilled: {
    backgroundColor: '#0284C7',
  },
  mealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  addMealAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#FF6A3D',
    borderColor: '#FF6A3D',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6A3D',
    letterSpacing: 0.4,
  },
  mealTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  mealMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  mealNutrientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nutrientTag: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  nutrientDot: {
    marginHorizontal: 6,
    color: '#CBD5E1',
    fontSize: 12,
  },
  emptyMealsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyMealsTitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 12,
  },
  quickAddEmptyBtn: {
    backgroundColor: '#FFF4EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickAddEmptyText: {
    color: '#FF6A3D',
    fontSize: 13,
    fontWeight: '700',
  },
  wisdomCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  wisdomTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  wisdomText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
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
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeButtonActive: {
    backgroundColor: '#FF6A3D',
    borderColor: '#FF6A3D',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  sheetInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  saveCustomBtn: {
    backgroundColor: '#FF6A3D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  saveCustomBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  suggestionMeta: {
    fontSize: 12,
    color: '#64748B',
  },
});
