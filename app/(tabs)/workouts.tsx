import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { profileService } from '@/services/api';
import Storage from '@/utils/storage';

interface Exercise {
  id: number;
  name: string;
  repsOrDuration: string;
  instruction: string;
}

interface Workout {
  id: number;
  name: string;
  duration: string;
  durationMins: number;
  level: string;
  intensity: 'Gentle' | 'Light' | 'Moderate';
  equipment: string;
  targetArea: string;
  image: 'image1' | 'image2' | 'image3';
  description: string;
  exercises: Exercise[];
}

const workoutCategories = [
  { id: 1, title: 'Gentle Movement', icon: 'walk' },
  { id: 2, title: 'Strength & Bone', icon: 'weight-lifter' },
  { id: 3, title: 'Flexibility & Recovery', icon: 'yoga' },
  { id: 4, title: 'Energy & Vitality', icon: 'lightning-bolt' },
  { id: 5, title: 'Balance & Stability', icon: 'balance-scale' },
  { id: 6, title: 'Mindfulness & Breath', icon: 'meditation' },
];

const workoutsDatabase: Record<number, Workout[]> = {
  1: [
    {
      id: 101,
      name: 'Gentle Joint Mobility',
      duration: '15 min',
      durationMins: 15,
      level: 'All Levels',
      intensity: 'Gentle',
      equipment: 'Chair (optional)',
      targetArea: 'Full Body Joints',
      image: 'image1',
      description: 'Slow, fluid rotations to ease joint stiffness, promote circulation, and restore mobility.',
      exercises: [
        { id: 1, name: 'Shoulder Rolls', repsOrDuration: '10 slow circles back & forward', instruction: 'Breathe in as you lift your shoulders, exhale as you roll them down.' },
        { id: 2, name: 'Seated Torso Twists', repsOrDuration: '8 gentle reps each side', instruction: 'Sit tall, gently rotate through the upper torso without forcing.' },
        { id: 3, name: 'Ankle Pumps & Circles', repsOrDuration: '12 circles each foot', instruction: 'Point and flex ankles, circle slowly in both directions.' },
        { id: 4, name: 'Gentle Neck Tilts', repsOrDuration: '5 reps each side', instruction: 'Slowly lower ear toward shoulder, keeping shoulders relaxed.' },
        { id: 5, name: 'Calming Breathing Reset', repsOrDuration: '2 minutes', instruction: 'Inhale through the nose for 4 counts, exhale softly for 6 counts.' },
      ]
    },
    {
      id: 102,
      name: 'Supported Chair Movement',
      duration: '20 min',
      durationMins: 20,
      level: 'Beginner',
      intensity: 'Gentle',
      equipment: 'Sturdy Chair',
      targetArea: 'Core & Lower Body',
      image: 'image2',
      description: 'Zero floor transitions. Designed for low fatigue days when you need gentle, seated activation.',
      exercises: [
        { id: 1, name: 'Seated Marching', repsOrDuration: '20 gentle steps', instruction: 'Lift knees gently one at a time while maintaining upright posture.' },
        { id: 2, name: 'Seated Leg Extensions', repsOrDuration: '10 reps each leg', instruction: 'Straighten one leg slowly, hold for 2 seconds, and lower.' },
        { id: 3, name: 'Chair Cat-Cow Stretch', repsOrDuration: '8 cycles', instruction: 'Arch your back gently on inhale, round spine comfortably on exhale.' },
        { id: 4, name: 'Seated Side Reach', repsOrDuration: '6 reaches each side', instruction: 'Reach one arm overhead and slightly across, stretching your ribs.' },
      ]
    },
    {
      id: 103,
      name: 'Circulation & Walk Flow',
      duration: '12 min',
      durationMins: 12,
      level: 'Beginner',
      intensity: 'Light',
      equipment: 'Comfortable shoes',
      targetArea: 'Cardiovascular',
      image: 'image3',
      description: 'An easy indoor pacing workout to awaken legs, stimulate lymphatic flow, and lift mood.',
      exercises: [
        { id: 1, name: 'Easy Pace Walk', repsOrDuration: '3 minutes', instruction: 'Comfortable, rhythmic indoor or outdoor walk.' },
        { id: 2, name: 'Arm Swing Pacing', repsOrDuration: '3 minutes', instruction: 'Allow arms to swing naturally with relaxed breathing.' },
        { id: 3, name: 'Heel-to-Toe Walks', repsOrDuration: '2 minutes', instruction: 'Step carefully from heel to toe, strengthening ankles.' },
        { id: 4, name: 'Cool-Down Stride', repsOrDuration: '4 minutes', instruction: 'Gradually slow pace and take deep, restorative breaths.' },
      ]
    }
  ],
  2: [
    {
      id: 201,
      name: 'Bone Health & Posture',
      duration: '22 min',
      durationMins: 22,
      level: 'Beginner',
      intensity: 'Light',
      equipment: 'Light Weights or Water Bottles',
      targetArea: 'Spine & Hips',
      image: 'image2',
      description: 'Targeted bone-density exercises to support skeletal strength, postural muscles, and hip stability.',
      exercises: [
        { id: 1, name: 'Wall Push-Ups', repsOrDuration: '10 controlled reps', instruction: 'Hands on wall at chest height, bend elbows with strong core.' },
        { id: 2, name: 'Sit-to-Stand (Chair Squats)', repsOrDuration: '8 to 10 reps', instruction: 'Press through feet to stand tall from chair without rushing.' },
        { id: 3, name: 'Seated Back Rows', repsOrDuration: '12 reps', instruction: 'Pull elbows back gently, squeezing shoulder blades together.' },
        { id: 4, name: 'Standing Calf Raises', repsOrDuration: '15 reps', instruction: 'Hold wall for balance, lift heels up and lower gently.' },
      ]
    },
    {
      id: 202,
      name: 'Light Band Resistance',
      duration: '18 min',
      durationMins: 18,
      level: 'All Levels',
      intensity: 'Light',
      equipment: 'Resistance Band (Light)',
      targetArea: 'Arms & Upper Back',
      image: 'image3',
      description: 'Gentle isometric resistance to build lean muscle tone without putting strain on vulnerable joints.',
      exercises: [
        { id: 1, name: 'Band Pull-Aparts', repsOrDuration: '10 reps', instruction: 'Hold band in front of chest, draw hands apart smoothly.' },
        { id: 2, name: 'Supported Bicep Curls', repsOrDuration: '10 reps', instruction: 'Step lightly on band, curl hands up toward shoulders.' },
        { id: 3, name: 'Chest Opener Hold', repsOrDuration: '3 holds of 10s', instruction: 'Open chest wide with gentle tension on band.' },
      ]
    }
  ],
  3: [
    {
      id: 301,
      name: 'Restorative Bed/Mat Stretch',
      duration: '16 min',
      durationMins: 16,
      level: 'All Levels',
      intensity: 'Gentle',
      equipment: 'Mat or Bed',
      targetArea: 'Full Body Relaxation',
      image: 'image1',
      description: 'Slow soothing stretches that can be performed in bed or on a comfortable mat.',
      exercises: [
        { id: 1, name: 'Knee-to-Chest Hug', repsOrDuration: '30s each leg', instruction: 'Gently hug one knee toward chest, keeping opposite leg relaxed.' },
        { id: 2, name: 'Supine Spinal Twist', repsOrDuration: '45s each side', instruction: 'Let knees fall gently to one side, arms out like a T.' },
        { id: 3, name: 'Figure 4 Hip Stretch', repsOrDuration: '30s each side', instruction: 'Cross ankle over opposite knee, gently opening the hip.' },
        { id: 4, name: 'Child Pose with Pillow', repsOrDuration: '2 minutes', instruction: 'Rest hips back, forehead on soft pillow, slow deep breaths.' },
      ]
    },
    {
      id: 302,
      name: 'Lymphatic Drainage Flow',
      duration: '14 min',
      durationMins: 14,
      level: 'All Levels',
      intensity: 'Gentle',
      equipment: 'None',
      targetArea: 'Lymphatic System',
      image: 'image2',
      description: 'Rhythmic, gentle pumping movements that encourage fluid drainage and reduce heaviness.',
      exercises: [
        { id: 1, name: 'Deep Diaphragmatic Breaths', repsOrDuration: '10 slow breaths', instruction: 'Breathe into your belly to stimulate the deep lymphatic trunk.' },
        { id: 2, name: 'Gentle Shoulder & Arm Pumps', repsOrDuration: '15 repetitions', instruction: 'Slowly lift and lower arms with gentle wrist circles.' },
        { id: 3, name: 'Leg Elevation & Ankle Pumps', repsOrDuration: '2 minutes', instruction: 'Rest legs elevated on pillows while slowly flexing toes.' },
      ]
    }
  ],
  4: [
    {
      id: 401,
      name: 'Morning Vitality Boost',
      duration: '12 min',
      durationMins: 12,
      level: 'Beginner',
      intensity: 'Light',
      equipment: 'None',
      targetArea: 'Full Body Energy',
      image: 'image3',
      description: 'Gently wake up your nervous system, boost oxygen delivery, and shake off sluggishness.',
      exercises: [
        { id: 1, name: 'Sun Breath Reaches', repsOrDuration: '8 cycles', instruction: 'Sweep arms wide and high overhead with a full inhale, lower on exhale.' },
        { id: 2, name: 'Gentle Standing Hip Swings', repsOrDuration: '10 each side', instruction: 'Hold wall for support, swing leg gently front to back.' },
        { id: 3, name: 'Dynamic Torso Sways', repsOrDuration: '12 sways', instruction: 'Let arms swing freely from side to side with relaxed knees.' },
      ]
    }
  ],
  5: [
    {
      id: 501,
      name: 'Supported Balance & Stability',
      duration: '15 min',
      durationMins: 15,
      level: 'All Levels',
      intensity: 'Gentle',
      equipment: 'Countertop or Sturdy Chair',
      targetArea: 'Ankles, Feet & Core',
      image: 'image1',
      description: 'Build confidence and stability to prevent slips, strengthen stabilizer muscles, and improve posture.',
      exercises: [
        { id: 1, name: 'Single-Leg Balance (Supported)', repsOrDuration: '20s each leg', instruction: 'Keep fingers lightly on counter, lift one foot 2 inches off floor.' },
        { id: 2, name: 'Tandem Stance (Heel-to-Toe)', repsOrDuration: '30s each foot in front', instruction: 'Place one foot directly in front of other like walking a tightrope.' },
        { id: 3, name: 'Side Leg Lift with Support', repsOrDuration: '8 each side', instruction: 'Lift leg outward slowly without leaning upper body.' },
      ]
    }
  ],
  6: [
    {
      id: 601,
      name: 'Guided Calm & Breathwork',
      duration: '10 min',
      durationMins: 10,
      level: 'All Levels',
      intensity: 'Gentle',
      equipment: 'Quiet space',
      targetArea: 'Nervous System',
      image: 'image2',
      description: 'Soothe the autonomic nervous system, reduce cortisol, and ease muscle tension.',
      exercises: [
        { id: 1, name: '4-7-8 Relaxing Breath', repsOrDuration: '6 cycles', instruction: 'Inhale for 4s, hold gently for 7s, exhale slowly through mouth for 8s.' },
        { id: 2, name: 'Body Scan Release', repsOrDuration: '4 minutes', instruction: 'Bring awareness from feet to scalp, letting go of tension with each breath.' },
        { id: 3, name: 'Heart-Hand Mindfulness', repsOrDuration: '3 minutes', instruction: 'Place one hand on heart, one on belly. Feel your natural rhythm.' },
      ]
    }
  ]
};

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedWorkoutIds, setSavedWorkoutIds] = useState<number[]>([101]);

  // Modal Player State
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);

  const currentCategory = workoutCategories.find(c => c.id === selectedCategoryId) || workoutCategories[0];
  const allCategoryWorkouts = workoutsDatabase[selectedCategoryId] || [];

  const filteredWorkouts = allCategoryWorkouts.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.targetArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSaveWorkout = (id: number) => {
    setSavedWorkoutIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    setIsPlaying(false);
    setCurrentExerciseIndex(0);
    setCompletedExercises([]);
  };

  const handleStartWorkout = () => {
    setIsPlaying(true);
    setCurrentExerciseIndex(0);
    setCompletedExercises([]);
  };

  const handleCompleteExercise = (exerciseId: number) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises(prev => [...prev, exerciseId]);
    }

    if (activeWorkout && currentExerciseIndex < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;

    try {
      // Update backend / local stats
      await profileService.updateStats({
        workoutsCompleted: 1,
        totalMinutes: activeWorkout.durationMins,
        averageCaloriesBurned: activeWorkout.durationMins * 5
      });
    } catch (e) {
      console.log('Failed to update stats remotely:', e);
    }

    Alert.alert(
      '🌟 Session Complete!',
      `Wonderful work completing ${activeWorkout.name}! You logged ${activeWorkout.durationMins} minutes of gentle, nourishing movement.`,
      [{ text: 'Great!', onPress: () => setActiveWorkout(null) }]
    );
  };

  const getImageSource = (img: string) => {
    switch (img) {
      case 'image1':
        return require('@/assets/images/image1.png');
      case 'image2':
        return require('@/assets/images/image2.jpg');
      case 'image3':
        return require('@/assets/images/image3.jpg');
      default:
        return require('@/assets/images/image1.png');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenSubtitle}>SUPPORTIVE MOVEMENT</Text>
          <Text style={styles.screenTitle}>Workouts & Routines</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search gentle movement, mobility, yoga..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.categoryFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {workoutCategories.map(cat => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={18}
                  color={isSelected ? '#FFFFFF' : '#475569'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Workouts List */}
      <ScrollView
        style={styles.workoutsList}
        contentContainerStyle={[styles.workoutsListContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryInfoBar}>
          <Text style={styles.categorySectionTitle}>{currentCategory.title}</Text>
          <Text style={styles.workoutCountBadge}>{filteredWorkouts.length} routines</Text>
        </View>

        {filteredWorkouts.map((workout, index) => {
          const isSaved = savedWorkoutIds.includes(workout.id);

          return (
            <Animated.View key={workout.id} entering={FadeInDown.duration(350).delay(index * 70)}>
              <TouchableOpacity
                style={styles.workoutCard}
                activeOpacity={0.88}
                onPress={() => handleOpenWorkout(workout)}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={getImageSource(workout.image)} style={styles.cardImage} />
                  <View style={styles.durationTag}>
                    <Ionicons name="time-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.durationTagText}>{workout.duration}</Text>
                  </View>
                  <View style={styles.intensityTag}>
                    <Text style={styles.intensityTagText}>{workout.intensity}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{workout.name}</Text>
                    <TouchableOpacity
                      onPress={() => toggleSaveWorkout(workout.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isSaved ? '#FF6A3D' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {workout.description}
                  </Text>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="body-outline" size={13} color="#64748B" />
                      <Text style={styles.metaBadgeText}>{workout.targetArea}</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Ionicons name="fitness-outline" size={13} color="#64748B" />
                      <Text style={styles.metaBadgeText}>{workout.equipment}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActionRow}>
                    <Text style={styles.exerciseCountText}>
                      {workout.exercises.length} guided movements
                    </Text>
                    <View style={styles.startBadge}>
                      <Text style={styles.startBadgeText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={14} color="#FF6A3D" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {filteredWorkouts.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="magnify-remove-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>No routines match your search</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try searching for "stretching", "mobility", or clear your filter.
            </Text>
            <TouchableOpacity style={styles.resetSearchButton} onPress={() => setSearchQuery('')}>
              <Text style={styles.resetSearchText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Workout Detail & Player Modal */}
      {activeWorkout && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setActiveWorkout(null)}
        >
          <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setActiveWorkout(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {isPlaying ? 'Active Session' : 'Routine Overview'}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {!isPlaying ? (
                /* Workout Overview Mode */
                <View style={styles.overviewContainer}>
                  <Image source={getImageSource(activeWorkout.image)} style={styles.modalHeroImage} />

                  <View style={styles.modalTagsRow}>
                    <View style={styles.modalPillBadge}>
                      <Text style={styles.modalPillBadgeText}>{activeWorkout.intensity}</Text>
                    </View>
                    <View style={styles.modalPillBadge}>
                      <Text style={styles.modalPillBadgeText}>{activeWorkout.duration}</Text>
                    </View>
                    <View style={styles.modalPillBadge}>
                      <Text style={styles.modalPillBadgeText}>{activeWorkout.level}</Text>
                    </View>
                  </View>

                  <Text style={styles.modalWorkoutTitle}>{activeWorkout.name}</Text>
                  <Text style={styles.modalWorkoutDescription}>{activeWorkout.description}</Text>

                  <View style={styles.equipmentInfoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
                    <Text style={styles.equipmentInfoText}>
                      Equipment: <Text style={{ fontWeight: '700' }}>{activeWorkout.equipment}</Text>
                    </Text>
                  </View>

                  <Text style={styles.exerciseListHeader}>Guided Movements ({activeWorkout.exercises.length})</Text>

                  {activeWorkout.exercises.map((ex, idx) => (
                    <View key={ex.id} style={styles.exerciseItemCard}>
                      <View style={styles.exerciseNumberBubble}>
                        <Text style={styles.exerciseNumberText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseItemName}>{ex.name}</Text>
                        <Text style={styles.exerciseItemReps}>{ex.repsOrDuration}</Text>
                        <Text style={styles.exerciseItemInstruction}>{ex.instruction}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* Interactive Player Mode */
                <View style={styles.playerContainer}>
                  <View style={styles.playerProgressRow}>
                    <Text style={styles.playerProgressText}>
                      Movement {currentExerciseIndex + 1} of {activeWorkout.exercises.length}
                    </Text>
                    <Text style={styles.playerPercentText}>
                      {Math.round(((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.playerProgressBar}>
                    <View
                      style={[
                        styles.playerProgressBarFill,
                        { width: `${((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100}%` }
                      ]}
                    />
                  </View>

                  {/* Current Active Exercise Card */}
                  <View style={styles.currentExerciseHero}>
                    <View style={styles.currentStepBadge}>
                      <Text style={styles.currentStepBadgeText}>IN PROGRESS</Text>
                    </View>

                    <Text style={styles.currentExerciseTitle}>
                      {activeWorkout.exercises[currentExerciseIndex].name}
                    </Text>

                    <View style={styles.currentRepsBadge}>
                      <Ionicons name="repeat" size={16} color="#FF6A3D" />
                      <Text style={styles.currentRepsText}>
                        {activeWorkout.exercises[currentExerciseIndex].repsOrDuration}
                      </Text>
                    </View>

                    <View style={styles.instructionBox}>
                      <Text style={styles.instructionHeading}>Guidance & Form:</Text>
                      <Text style={styles.instructionBody}>
                        {activeWorkout.exercises[currentExerciseIndex].instruction}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.completeExerciseBtn}
                      activeOpacity={0.85}
                      onPress={() => handleCompleteExercise(activeWorkout.exercises[currentExerciseIndex].id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.completeExerciseBtnText}>
                        {currentExerciseIndex === activeWorkout.exercises.length - 1
                          ? 'Complete Workout'
                          : 'Complete & Next Movement'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Previous / Remaining movements list */}
                  <Text style={styles.allMovementsTitle}>All Session Movements</Text>
                  {activeWorkout.exercises.map((ex, idx) => {
                    const isDone = completedExercises.includes(ex.id);
                    const isCurrent = idx === currentExerciseIndex;

                    return (
                      <TouchableOpacity
                        key={ex.id}
                        style={[
                          styles.sessionMoveRow,
                          isCurrent && styles.sessionMoveRowCurrent,
                          isDone && styles.sessionMoveRowDone
                        ]}
                        onPress={() => setCurrentExerciseIndex(idx)}
                      >
                        <View style={[styles.sessionMoveCheck, isDone && styles.sessionMoveCheckDone]}>
                          {isDone ? (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          ) : (
                            <Text style={styles.sessionMoveIndex}>{idx + 1}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.sessionMoveName, isDone && styles.sessionMoveNameDone]}>
                            {ex.name}
                          </Text>
                          <Text style={styles.sessionMoveReps}>{ex.repsOrDuration}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Bottom Modal Floating CTA */}
            {!isPlaying && (
              <View style={[styles.modalBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                  style={styles.modalPrimaryActionBtn}
                  activeOpacity={0.85}
                  onPress={handleStartWorkout}
                >
                  <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.modalPrimaryActionText}>Begin Guided Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6A3D',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoryFilterWrapper: {
    paddingBottom: 10,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: '#FF6A3D',
    borderColor: '#FF6A3D',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  workoutsList: {
    flex: 1,
  },
  workoutsListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  categoryInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categorySectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  workoutCountBadge: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  durationTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  intensityTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityTagText: {
    color: '#FF6A3D',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  exerciseCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  startBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetSearchButton: {
    backgroundColor: '#FFF4EE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  resetSearchText: {
    color: '#FF6A3D',
    fontWeight: '700',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: 220,
  },
  modalScroll: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
  },
  modalHeroImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalTagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modalPillBadge: {
    backgroundColor: '#FFF4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalPillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  modalWorkoutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalWorkoutDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  equipmentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  equipmentInfoText: {
    fontSize: 13,
    color: '#0369A1',
  },
  exerciseListHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  exerciseItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  exerciseNumberBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  exerciseItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  exerciseItemReps: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6A3D',
    marginBottom: 4,
  },
  exerciseItemInstruction: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  modalBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  modalPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6A3D',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#FF6A3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  playerContainer: {
    padding: 20,
  },
  playerProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  playerProgressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  playerPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6A3D',
  },
  playerProgressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  playerProgressBarFill: {
    height: '100%',
    backgroundColor: '#FF6A3D',
    borderRadius: 3,
  },
  currentExerciseHero: {
    backgroundColor: '#FFF4EE',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 24,
  },
  currentStepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6A3D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  currentStepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  currentExerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  currentRepsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  currentRepsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C2410C',
  },
  instructionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  instructionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  instructionBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  completeExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6A3D',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeExerciseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  allMovementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sessionMoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  sessionMoveRowCurrent: {
    borderColor: '#FF6A3D',
    backgroundColor: '#FFF7ED',
  },
  sessionMoveRowDone: {
    opacity: 0.6,
  },
  sessionMoveCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionMoveCheckDone: {
    backgroundColor: '#10B981',
  },
  sessionMoveIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sessionMoveName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  sessionMoveNameDone: {
    textDecorationLine: 'line-through',
  },
  sessionMoveReps: {
    fontSize: 12,
    color: '#64748B',
  },
});
