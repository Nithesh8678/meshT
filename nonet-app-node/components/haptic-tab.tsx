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
    };
  });

  const handlePressIn = (ev: any) => {
    // Popup effect: scale up and lift
    scale.value = withSpring(1.1, { damping: 15, stiffness: 500 });
    translateY.value = withSpring(-4, { damping: 15, stiffness: 500 });
    shadowElevation.value = withSpring(8, { damping: 15, stiffness: 500 });

    if (process.env.EXPO_OS === 'ios') {
      // Add a soft haptic feedback when pressing down on the tabs.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    // Return to normal
    scale.value = withSpring(1, { damping: 15, stiffness: 500 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 500 });
    shadowElevation.value = withSpring(0, { damping: 15, stiffness: 500 });

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
