import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Pressable,
} from "react-native";
import { CameraView, CameraType } from "expo-camera";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useWallet, ScannedAddress } from "@/contexts/WalletContext";

// Retro Color Palette - matching Wallet and Mesh pages
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

export default function Scan(): React.JSX.Element {
  const [isScanning, setIsScanning] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [animationKey, setAnimationKey] = useState(0);

  // Use wallet context
  const {
    scannedAddresses,
    addScannedAddress,
    clearScannedAddresses,
    removeScannedAddress,
  } = useWallet();

  // Reset animation key when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  const isValidWalletAddress = (address: string): boolean => {
    // Basic validation for Ethereum-style addresses
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethPattern.test(address);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isValidWalletAddress(data)) {
      Alert.alert(
        "Invalid Address",
        "The scanned QR code doesn't contain a valid wallet address."
      );
      return;
    }

    setIsScanning(false);

    // Automatically add to scanned addresses if not already present
    addScannedAddress(data);

    // Navigate directly to transaction page
    router.push({
      pathname: "/transaction",
      params: { toAddress: data },
    });
  };

  const clearAddresses = () => {
    Alert.alert(
      "Clear All Addresses",
      "Are you sure you want to clear all scanned addresses?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearScannedAddresses(),
        },
      ]
    );
  };

  // Animated Button Component with Popup Effect
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const AnimatedButton = ({
    onPress,
    style,
    children,
    disabled = false,
  }: any) => {
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

  const renderAddressItem = ({ item, index }: { item: ScannedAddress; index: number }) => (
    <Animated.View
      key={`${item.id}-${animationKey}`}
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.addressItem}
    >
      <View style={styles.addressInfo}>
        <Text
          style={styles.addressText}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {item.address}
        </Text>
        <Text style={styles.timestampText}>
          {item.timestamp.toLocaleString()}
        </Text>
      </View>
      <AnimatedButton
        onPress={() => {
          router.push({
            pathname: "/transaction",
            params: { toAddress: item.address },
          });
        }}
        style={styles.sendButton}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </AnimatedButton>
    </Animated.View>
  );

  // Camera permissions are now handled at wallet creation level
  // If user reaches this screen, we assume permissions are granted

  if (isScanning) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.cameraOverlay}>
            <Animated.View
              entering={FadeIn.delay(200).springify()}
              style={styles.scanFrame}
            />
            <Animated.Text
              entering={FadeInUp.delay(300).springify()}
              style={styles.scanInstruction}
            >
              Point your camera at a QR code containing a wallet address
            </Animated.Text>
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <AnimatedButton
                onPress={() => setIsScanning(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </AnimatedButton>
            </Animated.View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.Text
          key={`title-${animationKey}`}
          entering={FadeInDown.delay(100).springify()}
          style={styles.title}
        >
          QR Code Scanner
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <AnimatedButton
            onPress={() => setIsScanning(true)}
            style={styles.scanButton}
          >
            <Text style={styles.scanButtonText}>📷 Start Scanning</Text>
          </AnimatedButton>
        </Animated.View>

        <Animated.View
          key={`addresses-${animationKey}`}
          entering={FadeInUp.delay(300).springify()}
          style={styles.addressesSection}
        >
          <View style={styles.addressesHeader}>
            <Text style={styles.addressesTitle}>
              Scanned Addresses ({scannedAddresses.length})
            </Text>
            {scannedAddresses.length > 0 && (
              <AnimatedButton onPress={clearAddresses} style={styles.clearButtonContainer}>
                <Text style={styles.clearText}>Clear All</Text>
              </AnimatedButton>
            )}
          </View>

          {scannedAddresses.length === 0 ? (
            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.emptyState}
            >
              <Text style={styles.emptyText}>📭 No addresses scanned yet</Text>
              <Text style={styles.emptySubText}>
                Tap "Start Scanning" to scan your first QR code
              </Text>
            </Animated.View>
          ) : (
            <FlatList
              data={scannedAddresses}
              renderItem={({ item, index }) => renderAddressItem({ item, index })}
              keyExtractor={(item) => item.id}
              style={styles.addressesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RetroColors.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: RetroColors.text,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: RetroColors.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  scanButton: {
    backgroundColor: RetroColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 4,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: RetroColors.primary,
    borderRadius: 4,
    backgroundColor: "transparent",
    shadowColor: RetroColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanInstruction: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
    fontFamily: 'monospace',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: RetroColors.secondary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 30,
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressesSection: {
    flex: 1,
  },
  addressesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addressesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: RetroColors.text,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  clearText: {
    color: RetroColors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  addressesList: {
    flex: 1,
  },
  addressItem: {
    backgroundColor: RetroColors.surface,
    padding: 15,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressInfo: {
    flex: 1,
    marginRight: 10,
  },
  addressText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: RetroColors.text,
    marginBottom: 5,
    fontWeight: "600",
  },
  timestampText: {
    fontSize: 10,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
  },
  sendButton: {
    backgroundColor: RetroColors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: RetroColors.text,
    marginBottom: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  emptySubText: {
    fontSize: 12,
    color: RetroColors.textSecondary,
    textAlign: "center",
    fontFamily: 'monospace',
    paddingHorizontal: 20,
  },
  clearButtonContainer: {
    padding: 4,
  },
});