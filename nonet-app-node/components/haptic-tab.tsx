import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Create animated version of PlatformPressable
const AnimatedPlatformPressable = Animated.createAnimatedComponent(PlatformPressable);

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowElevation = useSharedValue(0);
  const borderWidth = useSharedValue(0);
  const backgroundColor = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      elevation: shadowElevation.value,
      shadowColor: '#F4A261', // Warm peach color from tab theme
      shadowOpacity: shadowElevation.value > 0 ? 0.3 : 0,
      shadowOffset: { 
        width: 0, 
        height: shadowElevation.value > 0 ? 4 : 0 
      },
      shadowRadius: shadowElevation.value > 0 ? 6 : 0,
      borderWidth: borderWidth.value,
      borderColor: '#E9C896', // Soft tan border
      backgroundColor: backgroundColor.value === 1 ? '#FFFFFF' : 'transparent',
      borderRadius: 20,
    };
  });

  const handlePressIn = (ev: any) => {
    // Optimized mobile tap effect: subtle scale and quick border
    scale.value = withSpring(1.05, { damping: 20, stiffness: 300 });
    translateY.value = withSpring(-2, { damping: 20, stiffness: 300 });
    shadowElevation.value = withSpring(4, { damping: 20, stiffness: 300 });
    borderWidth.value = withSpring(1.5, { damping: 20, stiffness: 300 });
    backgroundColor.value = withSpring(1, { damping: 20, stiffness: 300 });

    if (process.env.EXPO_OS === 'ios') {
      // Add a soft haptic feedback when pressing down on the tabs.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    // Quick return to normal for responsive feel
    scale.value = withSpring(1, { damping: 25, stiffness: 400 });
    translateY.value = withSpring(0, { damping: 25, stiffness: 400 });
    shadowElevation.value = withSpring(0, { damping: 25, stiffness: 400 });
    borderWidth.value = withSpring(0, { damping: 25, stiffness: 400 });
    backgroundColor.value = withSpring(0, { damping: 25, stiffness: 400 });

    props.onPressOut?.(ev);
  };

  return (
    <AnimatedPlatformPressable
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
}
