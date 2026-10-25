import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { profileService } from '../services/api';

const { width } = Dimensions.get('window');

// Fitness goals options
const fitnessGoals = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'scale-bathroom' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'arm-flex' },
  { id: 'improve_fitness', label: 'Improve Fitness', icon: 'heart-pulse' },
  { id: 'increase_strength', label: 'Increase Strength', icon: 'weight-lifter' },
  { id: 'improve_health', label: 'Improve Health', icon: 'heart' },
  { id: 'increase_endurance', label: 'Increase Endurance', icon: 'run-fast' },
  { id: 'improve_flexibility', label: 'Improve Flexibility', icon: 'yoga' }
];

// Fitness levels
const fitnessLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

// Workout frequency options
const workoutFrequencies = [
  { id: '1-2', label: '1-2 times per week' },
  { id: '3-4', label: '3-4 times per week' },
  { id: '5+', label: '5+ times per week' }
];

export function ProfileSetupScreen() {
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showCustomGoalInput, setShowCustomGoalInput] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const totalSteps = 3;

  // State for loading
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!name) {
      Alert.alert('Missing Information', 'Please enter your name');
      setCurrentStep(1);
      return;
    }

    if (selectedGoals.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one fitness goal');
      setCurrentStep(2);
      return;
    }

    if (!selectedLevel) {
      Alert.alert('Missing Information', 'Please select your fitness level');
      setCurrentStep(3);
      return;
    }

    if (!selectedFrequency) {
      Alert.alert('Missing Information', 'Please select your workout frequency');
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    try {
      // Prepare profile data
      const profileData = {
        name,
        age: age ? parseInt(age) : undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitnessGoals: selectedGoals,
        customGoal: customGoal || undefined,
        fitnessLevel: selectedLevel,
        workoutFrequency: selectedFrequency
      };

      // Call the API to create profile
      await profileService.createProfile(profileData);

      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go to next step
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Go to previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              { backgroundColor: index + 1 <= currentStep ? '#FF7E45' : '#E0E0E0' }
            ]}
          />
        ))}
      </View>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>
              Let's start with some basic information to personalize your experience.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Height"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Weight"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.stepTitle}>Fitness Goals</Text>
            <Text style={styles.stepDescription}>
              What are your fitness goals? Select all that apply to you.
            </Text>

            <View style={styles.optionsContainer}>
              {fitnessGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      { backgroundColor: isSelected ? 'rgba(255, 126, 69, 0.1)' : 'transparent' }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                      } else {
                        setSelectedGoals([...selectedGoals, goal.id]);
                      }
                    }}
                  >
                    <View style={[
                      styles.goalIconContainer,
                      { backgroundColor: isSelected ? '#FF7E45' : '#F0F0F0' }
                    ]}>
                      <MaterialCommunityIcons
                        name={goal.icon as any}
                        size={24}
                        color={isSelected ? 'white' : '#666'}
                      />
                    </View>
                    <Text style={[
                      styles.goalLabel,
                      { color: isSelected ? '#FF7E45' : '#333' }
                    ]}>
                      {goal.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color="#FF7E45"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Custom Goal Option */}
              <TouchableOpacity
                style={styles.customGoalOption}
                onPress={() => router.push('/custom-goal')}
              >
                <View style={styles.customGoalIconContainer}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="#FF7E45"
                  />
                </View>
                <Text style={styles.customGoalText}>
                  I don't see my fitness goal
                </Text>
              </TouchableOpacity>

              {/* Display custom goal if entered */}
              {customGoal ? (
                <View style={styles.customGoalContainer}>
                  <View style={styles.customGoalHeader}>
                    <Text style={styles.customGoalLabel}>Your custom goal:</Text>
                    <TouchableOpacity onPress={() => setCustomGoal('')}>
                      <MaterialCommunityIcons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.customGoalText}>{customGoal}</Text>
                </View>
              ) : null}
            </View>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.stepTitle}>Experience & Availability</Text>
            <Text style={styles.stepDescription}>
              Tell us about your fitness experience and how often you plan to work out.
            </Text>

            <Text style={styles.sectionTitle}>Fitness Level</Text>
            <View style={styles.optionsRow}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelOption,
                    { backgroundColor: selectedLevel === level.id ? '#FF7E45' : '#F0F0F0' }
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                >
                  <Text style={[
                    styles.levelLabel,
                    { color: selectedLevel === level.id ? 'white' : '#333' }
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Workout Frequency</Text>
            <View style={styles.frequencyContainer}>
              {workoutFrequencies.map((frequency) => (
                <TouchableOpacity
                  key={frequency.id}
                  style={[
                    styles.frequencyOption,
                    { borderColor: selectedFrequency === frequency.id ? '#FF7E45' : '#E0E0E0' }
                  ]}
                  onPress={() => setSelectedFrequency(frequency.id)}
                >
                  <View style={[
                    styles.radioButton,
                    { borderColor: selectedFrequency === frequency.id ? '#FF7E45' : '#999' }
                  ]}>
                    {selectedFrequency === frequency.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.frequencyLabel}>{frequency.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          {renderStepIndicators()}
        </View>

        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePreviousStep}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, { flex: currentStep > 1 ? 2 : 1 }]}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading && currentStep === totalSteps ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Finish' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Math.max(16, width * 0.05), // Responsive padding
    paddingBottom: 120, // Extra space for footer
  },
  header: {
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 20, // Safe area for iOS
  },
  title: {
    fontSize: Math.min(28, width * 0.07), // Responsive font size
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: width * 0.08, // Responsive width
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  stepTitle: {
    fontSize: Math.min(22, width * 0.06), // Responsive font size
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: Math.min(16, width * 0.04), // Responsive font size
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Math.min(16, width * 0.04), // Responsive font size
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: Math.min(16, width * 0.04), // Responsive font size
    backgroundColor: '#F9F9F9',
    minHeight: 48, // Minimum touch target size
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionsContainer: {
    marginTop: 8,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 70, // Ensure enough touch area
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalLabel: {
    fontSize: Math.min(16, width * 0.04), // Responsive font size
    flex: 1,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
  },
  // Custom goal styles
  customGoalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF7E45',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 126, 69, 0.05)',
    minHeight: 70,
  },
  customGoalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customGoalText: {
    fontSize: Math.min(16, width * 0.04),
    color: '#FF7E45',
    fontWeight: '500',
    flex: 1,
  },
  customGoalContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF7E45',
    backgroundColor: 'rgba(255, 126, 69, 0.05)',
  },
  customGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customGoalLabel: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  customGoalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: Math.min(16, width * 0.04),
    backgroundColor: '#FFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  customGoalButton: {
    backgroundColor: '#FF7E45',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  customGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Math.min(16, width * 0.04),
  },
  sectionTitle: {
    fontSize: Math.min(18, width * 0.05),
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  levelOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 56, // Ensure enough touch area
  },
  levelLabel: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
  },
  frequencyContainer: {
    marginTop: 8,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    minHeight: 60, // Ensure enough touch area
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF7E45',
  },
  frequencyLabel: {
    fontSize: Math.min(16, width * 0.04),
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area for iOS
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#F0F0F0',
    minHeight: 56, // Ensure enough touch area
  },
  backButtonText: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7E45',
    minHeight: 56, // Ensure enough touch area
  },
  nextButtonText: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: 'white',
  },
});
