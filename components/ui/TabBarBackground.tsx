// This is a component for web and Android where the tab bar is generally opaque.
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  return <View style={StyleSheet.absoluteFill} />;
}

export function useBottomTabOverflow() {
  return 0;
}
