import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from '@/constants/theme';
import { useWallet } from '@/contexts/WalletContext';

// Retro Color Palette
const RetroColors = {
  background: '#FFF8DC', // Cornsilk
  surface: '#FAEBD7', // Antique White
  primary: '#FF6B35', // Retro Orange
  secondary: '#D2691E', // Chocolate
  accent: '#DAA520', // Goldenrod
  text: '#3E2723', // Dark Brown
  textSecondary: '#6D4C41', // Medium Brown
  border: '#8B4513', // Saddle Brown
  shadow: 'rgba(139, 69, 19, 0.3)',
};

export default function Show(): React.JSX.Element {
  const { userWalletAddress, isLoggedIn, walletData } = useWallet();
  const [customAddress, setCustomAddress] = useState<string>('');
  const [animationKey, setAnimationKey] = useState(0);
  
  const displayAddress = userWalletAddress || customAddress || '0x742d35Cc6634C0532925a3b8D404d0C8b7b8E5c2';

  // Reset animation key when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  // Animated Button Component with Popup Effect
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const AnimatedButton = ({ onPress, style, children, disabled = false }: any) => {
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
        shadowColor: RetroColors.border,
        shadowOpacity: shadowElevation.value > 0 ? 1 : 0.3,
        shadowOffset: { 
          width: 0, 
          height: shadowElevation.value > 0 ? 6 : 3 
        },
        shadowRadius: shadowElevation.value > 0 ? 8 : 0,
      };
    });

    const handlePressIn = () => {
      if (!disabled) {
        // Popup effect: scale up and lift - more pronounced
        scale.value = withSpring(1.08, { damping: 12, stiffness: 400 });
        translateY.value = withSpring(-6, { damping: 12, stiffness: 400 });
        shadowElevation.value = withSpring(12, { damping: 12, stiffness: 400 });
      }
    };

    const handlePressOut = () => {
      if (!disabled) {
        // Return to normal
        scale.value = withSpring(1, { damping: 12, stiffness: 400 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 400 });
        shadowElevation.value = withSpring(0, { damping: 12, stiffness: 400 });
      }
    };

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[style, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  };

  const generateRandomAddress = () => {
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const newAddress = '0x' + Array.from({ length: 40 }, () => randomHex()).join('');
    setCustomAddress(newAddress);
  };

  const copyPrivateKey = () => {
    if (!isLoggedIn || !walletData?.privateKey) {
      Alert.alert('Error', 'No private key available. Please create a wallet first.');
      return;
    }

    Alert.alert(
      'Private Key',
      `Your private key:\n\n${walletData.privateKey}\n\n⚠️ Keep this private key secure and never share it with anyone!`,
      [
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            Alert.alert('Copied', 'Private key copied to clipboard');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Animated.Text
        key={`title-${animationKey}`}
        entering={FadeInDown.delay(100).springify()}
        style={styles.title}
      >
        Wallet Address QR Code
      </Animated.Text>
      
      <Animated.View
        key={`qr-${animationKey}`}
        entering={ZoomIn.delay(200).springify()}
        style={styles.qrContainer}
      >
        <View style={styles.qrInnerBorder}>
          <QRCode
            value={displayAddress}
            size={200}
            color={RetroColors.text}
            backgroundColor="white"
          />
        </View>
      </Animated.View>

      <Animated.View
        key={`status-${animationKey}`}
        entering={FadeInUp.delay(300).springify()}
        style={styles.statusContainer}
      >
        <Text style={styles.statusText}>
          Status: {isLoggedIn ? "Wallet Connected" : "No Wallet"}
        </Text>
        {walletData && (
          <Text style={styles.createdText}>
            Created: {walletData.createdAt.toLocaleDateString()}
          </Text>
        )}
      </Animated.View>

      <Animated.View
        key={`address-${animationKey}`}
        entering={FadeInUp.delay(400).springify()}
        style={styles.addressContainer}
      >
        <Text style={styles.addressLabel}>
          {isLoggedIn ? "Your Wallet Address:" : "Custom Address:"}
        </Text>
        {isLoggedIn ? (
          <Text style={styles.walletAddressText}>{userWalletAddress}</Text>
        ) : (
          <TextInput
            style={styles.addressInput}
            value={customAddress}
            onChangeText={setCustomAddress}
            placeholder="Enter custom wallet address"
            placeholderTextColor={RetroColors.textSecondary}
            multiline
          />
        )}
      </Animated.View>

      {!isLoggedIn && (
        <Animated.View
          key={`button-${animationKey}`}
          entering={FadeInUp.delay(500).springify()}
          style={styles.buttonContainer}
        >
          <AnimatedButton onPress={generateRandomAddress} style={styles.generateButton}>
            <Text style={styles.buttonText}>Generate Random Address</Text>
          </AnimatedButton>
        </Animated.View>
      )}

      {isLoggedIn && (
        <Animated.View
          key={`button-${animationKey}`}
          entering={FadeInUp.delay(500).springify()}
          style={styles.buttonContainer}
        >
          <AnimatedButton onPress={copyPrivateKey} style={styles.copyPrivateKeyButton}>
            <Text style={styles.copyButtonText}>Export Private Key</Text>
          </AnimatedButton>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RetroColors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: RetroColors.text,
    marginBottom: 30,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: RetroColors.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  qrContainer: {
    padding: 8,
    backgroundColor: RetroColors.secondary,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 30,
  },
  qrInnerBorder: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: RetroColors.accent,
  },
  addressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: RetroColors.text,
    marginBottom: 10,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressInput: {
    borderWidth: 2,
    borderColor: RetroColors.border,
    borderRadius: 4,
    padding: 12,
    fontSize: 13,
    color: RetroColors.text,
    backgroundColor: RetroColors.surface,
    minHeight: 60,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 12,
    backgroundColor: RetroColors.surface,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: RetroColors.text,
    marginBottom: 5,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  createdText: {
    fontSize: 12,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
  },
  walletAddressText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: RetroColors.text,
    backgroundColor: RetroColors.surface,
    padding: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  generateButton: {
    backgroundColor: RetroColors.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  copyPrivateKeyButton: {
    backgroundColor: RetroColors.secondary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});