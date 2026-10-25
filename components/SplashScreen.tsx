import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
  // Animation values for each letter - they will drop from top
  const letterPositions = [
    useSharedValue(-300), // F
    useSharedValue(-300), // i
    useSharedValue(-300), // t
    useSharedValue(-300), // T
    useSharedValue(-300), // r
    useSharedValue(-300), // a
    useSharedValue(-300), // c
    useSharedValue(-300), // k
  ];

  // Opacity values to ensure letters are initially invisible
  const letterOpacities = [
    useSharedValue(0), // F
    useSharedValue(0), // i
    useSharedValue(0), // t
    useSharedValue(0), // T
    useSharedValue(0), // r
    useSharedValue(0), // a
    useSharedValue(0), // c
    useSharedValue(0), // k
  ];

  // Bubble animation values - more bubbles
  const bubbleScales = Array.from({ length: 15 }, () => useSharedValue(0));
  const bubblePositions = Array.from({ length: 15 }, () => useSharedValue(0));

  useEffect(() => {
    // Start with a delay to ensure the screen is blank at first
    const initialDelay = 500;

    // Animate each letter dropping from top with delay
    letterPositions.forEach((position, index) => {
      // Make letter visible first
      letterOpacities[index].value = withDelay(
        initialDelay + index * 250, // Stagger the visibility
        withTiming(1, { duration: 100 }) // Quick fade in
      );

      // Then animate the drop
      position.value = withDelay(
        initialDelay + index * 250, // Same delay as opacity
        withTiming(0, {
          duration: 1000, // Slower drop for more dramatic effect
          easing: Easing.bounce // Bounce effect when reaching final position
        })
      );
    });

    // Animate bubbles - start after a delay
    bubbleScales.forEach((scale, index) => {
      // Randomize when bubbles appear
      const bubbleDelay = initialDelay + Math.random() * 1000;

      scale.value = withDelay(
        bubbleDelay,
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
      );

      // Random floating animation - bubbles rise up
      bubblePositions[index].value = withDelay(
        bubbleDelay,
        withTiming(Math.random() * -200 - 50, { // Move higher
          duration: 3000 + Math.random() * 2000, // Slower rise
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
      );
    });
  }, []);

  // Create animated styles for each letter
  const letterStyles = letterPositions.map((position, index) =>
    useAnimatedStyle(() => ({
      opacity: letterOpacities[index].value,
      transform: [{ translateY: position.value }]
    }))
  );

  // Create animated styles for bubbles
  const bubbleStyles = bubbleScales.map((scale, index) =>
    useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: bubblePositions[index].value }
      ],
      opacity: scale.value
    }))
  );

  return (
    <View style={styles.container}>
      {/* Bubbles - distributed across the screen */}
      {bubbleStyles.map((style, index) => (
        <Animated.View
          key={`bubble-${index}`}
          style={[
            styles.bubble,
            style,
            {
              left: 20 + (index % 5) * (width / 5), // Distribute horizontally
              bottom: 100 + (index % 7) * 100, // Distribute vertically
              width: 15 + (index % 4) * 15, // Varying sizes
              height: 15 + (index % 4) * 15, // Matching height
            }
          ]}
        />
      ))}

      {/* FitTrack text with letter animation - centered in the middle of screen */}
      <View style={styles.textContainer}>
        <View style={styles.letterRow}>
          {['F', 'i', 't', 'T', 'r', 'a', 'c', 'k'].map((letter, index) => (
            <Animated.Text
              key={`letter-${index}`}
              style={[styles.letter, letterStyles[index]]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7E45', // Orange background
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 64, // Much bigger text
    fontWeight: '900', // Extra bold
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
