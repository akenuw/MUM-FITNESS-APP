import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Define safe icon names that work across platforms
const ICON_DUMBBELL = 'dumbbell';
const ICON_WEIGHT = 'weight-lifter';

const slides = [
  {
    id: 1,
    iconName: ICON_DUMBBELL,
    title: 'FitTrack',
    description: 'Your ultimate gym companion',
    backgroundColor: '#FF7E45',
  },
  {
    id: 2,
    iconName: ICON_WEIGHT,
    title: 'Track Your Progress',
    description: 'Monitor your workouts, set goals, and achieve results',
    backgroundColor: '#FF7E45',
  },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  // Animation values
  const pandaScale = useSharedValue(1);
  const pandaRotation = useSharedValue(0);
  const cloudPosition = useSharedValue(0);
  const starOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate panda
    pandaScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    // Subtle rotation animation
    pandaRotation.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000 }),
        withTiming(3, { duration: 2000 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    // Animate clouds
    cloudPosition.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 3000 }),
        withTiming(-10, { duration: 3000 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    // Animate stars
    starOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const pandaAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: pandaScale.value },
        { rotate: `${pandaRotation.value}deg` }
      ],
    };
  });

  const cloudAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: cloudPosition.value }],
    };
  });

  const starAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: starOpacity.value,
    };
  });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Just call onComplete and let the parent component handle navigation
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => {
          // Create animated styles for each slide
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const animatedImageStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1, 0.8]
            );

            const translateX = interpolate(
              scrollX.value,
              inputRange,
              [width * 0.3, 0, -width * 0.3]
            );

            return {
              transform: [{ scale }, { translateX }],
            };
          });

          const animatedTextStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0, 1, 0]
            );

            const translateY = interpolate(
              scrollX.value,
              inputRange,
              [50, 0, 50]
            );

            return {
              opacity,
              transform: [{ translateY }],
            };
          });

          return (
            <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
              {/* Stars (only visible on first slide) */}
              {index === 0 && (
                <Animated.View style={[styles.starsContainer, starAnimatedStyle]}>
                  <Text style={styles.star}>✦</Text>
                  <Text style={[styles.star, { top: 50, left: 30 }]}>✦</Text>
                  <Text style={[styles.star, { top: 80, right: 40 }]}>✦</Text>
                  <Text style={[styles.star, { bottom: 120, right: 60 }]}>✦</Text>
                  <Text style={[styles.star, { bottom: 180, left: 50 }]}>✦</Text>
                </Animated.View>
              )}

              {/* Clouds */}
              <Animated.View style={[styles.cloudsContainer, cloudAnimatedStyle]}>
                <View style={[styles.cloud, { top: 80, left: 20 }]} />
                <View style={[styles.cloud, { top: 50, right: 40 }]} />
                <View style={[styles.cloud, { top: 120, left: 100 }]} />
              </Animated.View>

              {/* Main content */}
              <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
                <Animated.View style={[pandaAnimatedStyle, styles.iconCircle]}>
                  {slide.iconName === ICON_DUMBBELL ? (
                    <MaterialCommunityIcons
                      name={'dumbbell' as any}
                      size={100}
                      color="white"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={'weight-lifter' as any}
                      size={100}
                      color="white"
                    />
                  )}
                </Animated.View>
              </Animated.View>

              <Animated.View style={[styles.textContainer, animatedTextStyle]}>
                <Text style={styles.title}>{slide.title}</Text>
                {slide.description ? (
                  <Text style={styles.description}>{slide.description}</Text>
                ) : null}
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { opacity: index === currentIndex ? 1 : 0.3 }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Log in' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FF7E45',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cloud: {
    position: 'absolute',
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    color: 'white',
    fontSize: 20,
  },
});
