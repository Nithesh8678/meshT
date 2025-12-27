import React, { useState } from 'react';
import { Alert, View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
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

  const renderReceivedMessageCard = (state: MessageState) => {
    const progress = getProgressFor(state);
    return (
      <View key={`msg-${state.id}`} style={styles.messageCard}>
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
      </View>
    );
  };

  const allMessages = Array.from(masterState.values()).sort((a, b) => b.id - a.id);
  const currentBroadcast = getCurrentBroadcastInfo();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Mesh Node</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>
              {hasInternet ? '📡 Online' : '📶 BLE Mesh'}
            </Text>
          </View>
        </View>

        {/* Broadcast Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Broadcast</Text>
          
          <View style={styles.broadcastStatusBox}>
            <Text style={styles.broadcastLabel}>Broadcasting:</Text>
            <Text style={styles.broadcastText}>
              {isBroadcasting && currentBroadcast.text
                ? `🔊 ${currentBroadcast.text}`
                : '— not broadcasting —'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              if (isBroadcasting) stopBroadcasting();
              else startBroadcasting();
            }}
          >
            <Text style={styles.controlButtonText}>
              {isBroadcasting ? '⏸ Pause Broadcast' : '▶ Start Broadcast'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Message Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Broadcast New Message</Text>
          
          <RNTextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter message to broadcast..."
            placeholderTextColor={RetroColors.textSecondary}
            multiline
          />

          <TouchableOpacity
            style={[styles.broadcastButton, !message.trim() && styles.buttonDisabled]}
            onPress={handleStartUserBroadcast}
            disabled={!message.trim()}
          >
            <Text style={styles.buttonText}>Broadcast Message</Text>
          </TouchableOpacity>
        </View>

        {/* Network Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Network Messages</Text>
            <TouchableOpacity onPress={handleClearEverythingAndStop}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>

          {allMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>👂 Listening for messages...</Text>
            </View>
          ) : (
            allMessages.map((msg) => renderReceivedMessageCard(msg))
          )}
        </View>
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