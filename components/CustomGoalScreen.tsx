import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function CustomGoalScreen({ onSave }: { onSave: (goal: string) => void }) {
  const [customGoal, setCustomGoal] = useState('');
  const [goalType, setGoalType] = useState<string | null>(null);

  // Goal type options
  const goalTypes = [
    { id: 'physical', label: 'Physical Goal', icon: 'human' },
    { id: 'performance', label: 'Performance Goal', icon: 'speedometer' },
    { id: 'habit', label: 'Habit Formation', icon: 'calendar-check' },
    { id: 'other', label: 'Other', icon: 'star-outline' }
  ];

  // Handle save and return
  const handleSave = () => {
    if (customGoal.trim()) {
      onSave(customGoal);
      router.back();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Fitness Goal</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
        <Text style={styles.description}>
          Tell us about your specific fitness goal that wasn't listed in the options.
          This helps us personalize your experience.
        </Text>

        <Text style={styles.sectionTitle}>Goal Type</Text>
        <View style={styles.goalTypesContainer}>
          {goalTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.goalTypeOption,
                { backgroundColor: goalType === type.id ? 'rgba(255, 126, 69, 0.1)' : '#F5F5F5' }
              ]}
              onPress={() => setGoalType(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon as any}
                size={24}
                color={goalType === type.id ? '#FF7E45' : '#666'}
                style={styles.goalTypeIcon}
              />
              <Text
                style={[
                  styles.goalTypeLabel,
                  { color: goalType === type.id ? '#FF7E45' : '#333' }
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Describe your goal</Text>
        <TextInput
          style={styles.input}
          value={customGoal}
          onChangeText={setCustomGoal}
          placeholder="E.g., I want to improve my basketball skills, prepare for a hiking trip, etc."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.tipText}>
          <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#FF7E45" />
          {' '}Tip: Be specific about what you want to achieve to get the best recommendations.
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { opacity: customGoal.trim() ? 1 : 0.6 }]}
          onPress={handleSave}
          disabled={!customGoal.trim()}
        >
          <Text style={styles.saveButtonText}>Save Goal</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: Math.min(20, width * 0.055),
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: Math.max(16, width * 0.05),
  },
  description: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Math.min(18, width * 0.05),
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  goalTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  goalTypeOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTypeIcon: {
    marginBottom: 8,
  },
  goalTypeLabel: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: Math.min(16, width * 0.04),
    backgroundColor: '#F9F9F9',
    minHeight: 150,
  },
  tipText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7E45',
  },
  saveButtonText: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
    color: 'white',
  },
});
