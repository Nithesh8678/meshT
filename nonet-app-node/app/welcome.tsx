import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Alert, TouchableOpacity, Image } from "react-native";
import {
  Text,
  ActivityIndicator,
} from "react-native-paper";
import { router } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import { useWallet, WalletData } from "@/contexts/WalletContext";
import { requestBluetoothPermissions } from "@/utils/permissions";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

// Retro Color Palette - matching Mesh page
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

export default function WelcomePage(): React.JSX.Element {
  const { isLoggedIn, createWallet } = useWallet();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  useEffect(() => {
    // Check if user already has a wallet and redirect to tabs
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn]);

  // Callback function that gets triggered after wallet is successfully created
  const onWalletCreated = async (walletData: WalletData): Promise<void> => {
    try {
      console.log(
        "🚀 Wallet creation callback triggered for address:",
        walletData.address
      );

      // TODO: Callback for wallet creation
    } catch (error) {
      console.error("❌ Error in wallet creation callback:", error);
      // Don't throw - let wallet creation succeed even if API calls fail
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreatingWallet(true);

      console.log("🔐 Starting wallet creation with permission requests...");

      // 1. Request Camera Permission - Native dialog with timeout
      console.log("📷 Requesting camera permission...");
      try {
        const cameraResult = await Promise.race([
          requestCameraPermission(),
          new Promise<any>((_, reject) =>
            setTimeout(
              () => reject(new Error("Camera permission timeout")),
              10000
            )
          ),
        ]);
        console.log("Camera permission result:", cameraResult.status);
      } catch (cameraError) {
        console.warn(
          "⚠️ Camera permission error (continuing anyway):",
          cameraError
        );
      }

      // 2. Request Bluetooth Permissions - Native dialogs with timeout
      console.log("📶 Requesting Bluetooth permissions...");
      try {
        const bluetoothGranted = await Promise.race([
          requestBluetoothPermissions(),
          new Promise<boolean>((_, reject) =>
            setTimeout(
              () => reject(new Error("Bluetooth permission timeout")),
              10000
            )
          ),
        ]);
        console.log("Bluetooth permission result:", bluetoothGranted);
      } catch (bluetoothError) {
        console.warn(
          "⚠️ Bluetooth permission error (continuing anyway):",
          bluetoothError
        );
      }

      // Create wallet regardless of permission results
      // App will work with limited functionality if permissions denied
      console.log("🔐 Creating wallet...");
      await createWallet(onWalletCreated);

      console.log("✅ Wallet created, navigating to app...");
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Error creating wallet:", error);
      Alert.alert("Error", "Failed to create wallet. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.headerSection}
        >
          <Animated.View 
            entering={ZoomIn.delay(400).springify()}
            style={styles.logoCard}
          >
            <Image 
              source={require('@/assets/images/logo.1.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Animated.Text 
            entering={FadeInUp.delay(600).springify()}
            style={styles.appTitle}
          >
            MESHT
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInUp.delay(700).springify()}
            style={styles.subtitle}
          >
            DECENTRALIZED MESH NETWORK
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInUp.delay(800).springify()}
            style={styles.description}
          >
            Send crypto transactions offline using Bluetooth mesh networking
          </Animated.Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View 
          entering={FadeInDown.delay(900).springify()}
          style={styles.featuresSection}
        >
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>📡 MESH NETWORK</Text>
          </View>
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>🔐 MULTI-CHAIN</Text>
          </View>
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>⚡ BLE PROTOCOL</Text>
          </View>
        </Animated.View>

        {/* Action Section */}
        <Animated.View 
          entering={FadeInDown.delay(1000).springify()}
          style={styles.actionSection}
        >
          <TouchableOpacity
            onPress={handleCreateWallet}
            disabled={isCreatingWallet}
            style={[styles.createButton, isCreatingWallet && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isCreatingWallet ? "CREATING WALLET..." : "START YOUR JOURNEY"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.actionSubtitle}>
            Create a wallet to begin offline transactions
          </Text>

          {isCreatingWallet && (
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              style={styles.loadingContainer}
            >
              <ActivityIndicator
                size="large"
                color={RetroColors.primary}
              />
              <Text style={styles.loadingText}>
                SETTING UP PERMISSIONS & WALLET...
              </Text>
            </Animated.View>
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
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 60,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoCard: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: RetroColors.surface,
    borderRadius: 4,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoIcon: {
    width: 140,
    height: 140,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: RetroColors.text,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 3,
    textShadowColor: RetroColors.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: RetroColors.textSecondary,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: RetroColors.textSecondary,
    fontFamily: "monospace",
    marginHorizontal: 20,
  },

  // Features Section
  featuresSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  featureBadge: {
    backgroundColor: RetroColors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 12,
  },
  featureBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: RetroColors.text,
    fontFamily: "monospace",
    textAlign: "center",
  },

  // Action Section
  actionSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: RetroColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    width: "100%",
    maxWidth: 300,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 13,
    color: RetroColors.textSecondary,
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    backgroundColor: RetroColors.surface,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: RetroColors.text,
    fontWeight: "700",
    fontFamily: "monospace",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
