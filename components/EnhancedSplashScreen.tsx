import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { SplashScreen } from './SplashScreen';

const { width, height } = Dimensions.get('window');

export function EnhancedSplashScreen() {
  // State to track if there's an error with animations
  const [hasError, setHasError] = useState(false);

  // If there's an error, fall back to the regular splash screen
  if (hasError) {
    return <SplashScreen />;
  }
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

  // Bubble animation values - more bubbles for a richer effect
  const bubbleScales = Array.from({ length: 20 }, () => useSharedValue(0));
  const bubblePositions = Array.from({ length: 20 }, () => useSharedValue(0));
  const bubbleOpacity = useSharedValue(0);

  useEffect(() => {
    try {
      // Start with a delay to ensure the screen is blank at first
      const initialDelay = 500;

      // Animate each letter dropping from top with delay
      letterPositions.forEach((position, index) => {
        try {
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
        } catch (error) {
          console.error('Animation error for letter', index, error);
          setHasError(true);
        }
      });

      try {
        // Animate bubbles - start after a delay
        bubbleOpacity.value = withDelay(
          initialDelay,
          withTiming(1, { duration: 800 })
        );

        bubbleScales.forEach((scale, index) => {
          // Randomize when bubbles appear
          const bubbleDelay = initialDelay + Math.random() * 1500;

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
            withTiming(Math.random() * -250 - 50, { // Move higher
              duration: 3000 + Math.random() * 3000, // Slower rise
              easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            })
          );
        });
      } catch (error) {
        console.error('Animation error for bubbles', error);
        setHasError(true);
      }
    } catch (error) {
      console.error('General animation error', error);
      setHasError(true);
    }
  }, []);

  // Create animated styles for each letter
  const letterStyles = letterPositions.map((position, index) => {
    try {
      return useAnimatedStyle(() => ({
        opacity: letterOpacities[index].value,
        transform: [{ translateY: position.value }]
      }));
    } catch (error) {
      console.error('Error creating letter style', index, error);
      setHasError(true);
      return {};
    }
  });

  // Create animated styles for bubbles
  const bubbleStyles = bubbleScales.map((scale, index) => {
    try {
      return useAnimatedStyle(() => ({
        transform: [
          { scale: scale.value },
          { translateY: bubblePositions[index].value }
        ],
        opacity: bubbleOpacity.value * (0.4 + Math.random() * 0.6) // Varying opacity
      }));
    } catch (error) {
      console.error('Error creating bubble style', index, error);
      setHasError(true);
      return {};
    }
  });

  try {
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
                left: 20 + (index % 7) * (width / 7), // Better horizontal distribution
                bottom: 50 + (index % 10) * 80, // Better vertical distribution
                width: 15 + (index % 5) * 12, // Varying sizes
                height: 15 + (index % 5) * 12, // Matching height
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
  } catch (error) {
    console.error('Error rendering splash screen', error);
    setHasError(true);
    return <SplashScreen />;
  }
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
