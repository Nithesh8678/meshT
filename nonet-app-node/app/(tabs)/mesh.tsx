import React, { useState } from 'react';
import { Alert, View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, Pressable } from 'react-native';
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
import { Text } from 'react-native-paper';
import { useBle } from '@/contexts/BleContext';
import { MessageState } from '@/utils/bleUtils';

// Retro Color Palette - matching Wallet page
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
  success: '#2E7D32', // Dark Green
  successLight: '#c8e6c9',
  warning: '#F57C00', // Orange
  warningLight: '#ffe0b2',
};

const MeshScreen = () => {
  const [message, setMessage] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  const {
    isBroadcasting,
    hasInternet,
    masterState,
    broadcastMessage,
    startBroadcasting,
    stopBroadcasting,
    clearAllAndStop,
    getCurrentBroadcastInfo,
    getProgressFor,
  } = useBle();

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

  const handleStartUserBroadcast = async () => {
    try {
      await broadcastMessage(message);
      setMessage('');
    } catch (err) {
      Alert.alert(
        'Error',
        (err as Error).message || 'Failed to encode message'
      );
    }
  };

  const handleClearEverythingAndStop = () => {
    if (masterState.size === 0 && !isBroadcasting) {
      return;
    }

    Alert.alert(
      'Clear Everything & Stop',
      'This will clear received messages, clear the broadcast queue, and stop broadcasting. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all & stop',
          style: 'destructive',
          onPress: clearAllAndStop,
        },
      ]
    );
  };

  const renderReceivedMessageCard = (state: MessageState, index: number) => {
    const progress = getProgressFor(state);
    return (
      <Animated.View
        key={`msg-${state.id}-${animationKey}`}
        entering={FadeInDown.delay(index * 50).springify()}
        style={styles.messageCard}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle}>
            {state.isAck ? '↪ Response' : '→ Request'}
          </Text>
        </View>

        <Text style={styles.messageText} numberOfLines={3}>
          {state.fullMessage || (state.isComplete ? '(Decoded)' : '(Incomplete)')}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>{`Chunks: ${progress.received}/${progress.total}`}</Text>
            <Text style={styles.progressText}>{`${progress.percent}%`}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
          </View>

          <View style={styles.chunkContainer}>
            {Array.from({ length: state.totalChunks }, (_, i) => {
              const idx = i + 1;
              const have = state.chunks.has(idx);
              return (
                <View
                  key={idx}
                  style={[
                    styles.chunkBadge,
                    have ? styles.chunkHave : styles.chunkMissing,
                  ]}
                >
                  <Text style={[styles.chunkText, have ? styles.chunkTextHave : styles.chunkTextMissing]}>
                    {idx}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  };

  const allMessages = Array.from(masterState.values()).sort((a, b) => b.id - a.id);
  const currentBroadcast = getCurrentBroadcastInfo();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <Animated.View
          key={`header-${animationKey}`}
          entering={FadeInDown.delay(100).springify()}
          style={styles.headerSection}
        >
          <Text style={styles.mainTitle}>Mesh Node</Text>
          
          <Animated.View
            entering={ZoomIn.delay(200).springify()}
            style={styles.statusContainer}
          >
            <Text style={styles.statusLabel}>
              {hasInternet ? '📡 Online' : '📶 BLE Mesh'}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Broadcast Section */}
        <Animated.View
          key={`broadcast-${animationKey}`}
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Current Broadcast</Text>
          
          <Animated.View
            entering={FadeIn.delay(400).springify()}
            style={styles.broadcastStatusBox}
          >
            <Text style={styles.broadcastLabel}>Broadcasting:</Text>
            <Text style={styles.broadcastText}>
              {isBroadcasting && currentBroadcast.text
                ? `🔊 ${currentBroadcast.text}`
                : '— not broadcasting —'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <AnimatedButton
              onPress={() => {
                if (isBroadcasting) stopBroadcasting();
                else startBroadcasting();
              }}
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>
                {isBroadcasting ? '⏸ Pause Broadcast' : '▶ Start Broadcast'}
              </Text>
            </AnimatedButton>
          </Animated.View>
        </Animated.View>

        {/* New Message Section */}
        <Animated.View
          key={`message-${animationKey}`}
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Broadcast New Message</Text>
          
          <Animated.View entering={FadeIn.delay(500).springify()}>
            <RNTextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter message to broadcast..."
              placeholderTextColor={RetroColors.textSecondary}
              multiline
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).springify()}>
            <AnimatedButton
              onPress={handleStartUserBroadcast}
              disabled={!message.trim()}
              style={[styles.broadcastButton, !message.trim() && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Broadcast Message</Text>
            </AnimatedButton>
          </Animated.View>
        </Animated.View>

        {/* Network Messages Section */}
        <Animated.View
          key={`network-${animationKey}`}
          entering={FadeInUp.delay(500).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Network Messages</Text>
            <AnimatedButton onPress={handleClearEverythingAndStop} style={styles.clearButtonContainer}>
              <Text style={styles.clearButton}>Clear</Text>
            </AnimatedButton>
          </View>

          {allMessages.length === 0 ? (
            <Animated.View
              entering={FadeIn.delay(600)}
              style={styles.emptyState}
            >
              <Text style={styles.emptyStateText}>👂 Listening for messages...</Text>
            </Animated.View>
          ) : (
            allMessages.map((msg, index) => renderReceivedMessageCard(msg, index))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RetroColors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: RetroColors.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: RetroColors.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 15,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: RetroColors.surface,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: RetroColors.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: RetroColors.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  clearButtonContainer: {
    padding: 4,
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
    color: RetroColors.primary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  broadcastStatusBox: {
    backgroundColor: RetroColors.surface,
    padding: 15,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    marginBottom: 15,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  broadcastLabel: {
    fontSize: 12,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  broadcastText: {
    fontSize: 14,
    fontWeight: '700',
    color: RetroColors.text,
    fontFamily: 'monospace',
  },
  controlButton: {
    backgroundColor: RetroColors.secondary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: RetroColors.border,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    borderWidth: 2,
    borderColor: RetroColors.border,
    borderRadius: 4,
    padding: 12,
    fontSize: 13,
    color: RetroColors.text,
    backgroundColor: RetroColors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 15,
  },
  broadcastButton: {
    backgroundColor: RetroColors.primary,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: RetroColors.surface,
    padding: 15,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RetroColors.border,
    marginBottom: 15,
    shadowColor: RetroColors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  messageHeader: {
    marginBottom: 10,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: RetroColors.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13,
    color: RetroColors.text,
    fontFamily: 'monospace',
    marginBottom: 12,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 11,
    color: RetroColors.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: RetroColors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: RetroColors.accent,
  },
  chunkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  chunkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    margin: 3,
    borderWidth: 2,
  },
  chunkHave: {
    backgroundColor: RetroColors.successLight,
    borderColor: RetroColors.success,
  },
  chunkMissing: {
    backgroundColor: RetroColors.warningLight,
    borderColor: RetroColors.warning,
  },
  chunkText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chunkTextHave: {
    color: RetroColors.success,
  },
  chunkTextMissing: {
    color: RetroColors.warning,
  },
});

export default MeshScreen;