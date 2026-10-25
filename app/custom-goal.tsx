import { CustomGoalScreen } from '@/components/CustomGoalScreen';
import { router } from 'expo-router';
import React from 'react';

export default function CustomGoalPage() {
  // Handle saving the custom goal
  const handleSaveGoal = (goal: string) => {
    // In a real app, you would save this to state or context
    // For now, just navigate back to the profile setup
    router.back();
  };

  return <CustomGoalScreen onSave={handleSaveGoal} />;
}
