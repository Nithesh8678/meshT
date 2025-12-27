import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { NeoBrutalButton, NeoBrutalCard } from '@/components/NeoBrutalismComponents';
import { useWallet } from '@/contexts/WalletContext';

const { width } = Dimensions.get('window');

const RetroColors = {
  background: '#FFF8DC', 
  surface: '#FAEBD7', 
  primary: '#FF6B35', 
  secondary: '#D2691E', 
  accent: '#DAA520', 
  text: '#3E2723', 
  textSecondary: '#6D4C41', 
  border: '#000000', // Harder black for sexier contrast
  shadow: '#000000',
};

export default function AboutPage(): React.JSX.Element {
  const { isLoggedIn } = useWallet();
  
  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION - Overlapping Elements */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>V1.0 PROTOCOL</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/logo.1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>MESH<Text style={{color: RetroColors.primary}}>T</Text></Text>
          <View style={styles.heroSubBox}>
            <Text style={styles.subtitle}>OFFLINE CRYPTO. NO INTERNET? NO PROBLEM.</Text>
          </View>
        </View>

        

        {/* MISSION - "Tape" Style Box */}
        <View style={styles.missionContainer}>
          <View style={[styles.tape, { transform: [{ rotate: '-2deg' }] }]} />
          <NeoBrutalCard style={styles.missionCard}>
            <Text style={styles.description}>
              MeshT creates a peer-to-peer network with nearby devices, allowing your transaction to <Text style={styles.boldText}>"hop"</Text> until it reaches a gateway. 
            </Text>
          </NeoBrutalCard>
        </View>

        {/* FEATURES - Staggered Grid */}
        <View style={styles.featureGrid}>
           <View style={styles.featureRow}>
              <View style={[styles.featureBox, { backgroundColor: RetroColors.primary, flex: 1.2 }]}>
                 <MaterialIcons name="bluetooth" size={32} color="white" />
                 <Text style={styles.featureLabel}>BLE MESH</Text>
              </View>
              <View style={[styles.featureBox, { backgroundColor: RetroColors.accent, flex: 1 }]}>
                 <MaterialIcons name="security" size={32} color="black" />
                 <Text style={styles.featureLabel}>MULTI-CHAIN</Text>
              </View>
           </View>
           <View style={styles.featureRow}>
              <View style={[styles.featureBox, { backgroundColor: 'white', flex: 1 }]}>
                 <MaterialIcons name="account-balance-wallet" size={32} color="black" />
                 <Text style={styles.featureLabel}>EIP-3009</Text>
              </View>
              <View style={[styles.featureBox, { backgroundColor: RetroColors.secondary, flex: 1.5 }]}>
                 <MaterialIcons name="device-hub" size={32} color="white" />
                 <Text style={styles.featureLabel}>OFFLINE RELAY</Text>
              </View>
           </View>
        </View>

        {/* PROCESS - Vertical Timeline with Line */}
        <View style={styles.processSection}>
           <Text style={styles.sectionHeading}>THE PROTOCOL</Text>
           <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              {[
                "Sign transaction offline",
                "Fragment via BLE packets",
                "Mesh relay via peers",
                "Gateway broadcast to chain"
              ].map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    <Text style={styles.timelineNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.timelineText}>{step}</Text>
                </View>
              ))}
           </View>
        </View>

        <View style={styles.footer}>
          <NeoBrutalButton 
            title="LAUNCH NETWORK"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RetroColors.background,
  },
  scrollView: { flex: 1 },
  
  // Hero Styles
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  heroBadge: {
    backgroundColor: RetroColors.text,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '5deg' }],
    zIndex: 10,
    marginBottom: -10,
  },
  heroBadgeText: {
    color: RetroColors.background,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
  },
  logoContainer: {
    borderWidth: 3,
    borderColor: RetroColors.border,
    padding: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logo: { width: 100, height: 100 },
  heroTitle: {
    fontSize: 64,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: -2,
    marginTop: 10,
  },
  heroSubBox: {
    backgroundColor: RetroColors.accent,
    padding: 8,
    borderWidth: 2,
    borderColor: RetroColors.border,
    marginTop: -10,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Mission Styles
  missionContainer: {
    padding: 25,
    marginTop: 20,
  },
  tape: {
    position: 'absolute',
    top: 15,
    left: 40,
    right: 40,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  missionCard: {
    backgroundColor: 'white',
    zIndex: 2,
    padding: 20,
  },
  description: {
    fontFamily: 'monospace',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  boldText: { fontWeight: '900', textDecorationLine: 'underline' },

  // Grid Styles
  featureGrid: {
    padding: 20,
    gap: 15,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 15,
    height: 100,
  },
  featureBox: {
    borderWidth: 3,
    borderColor: RetroColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
  },
  featureLabel: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },

  // Timeline Styles
  processSection: {
    padding: 25,
  },
  sectionHeading: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  timelineContainer: {
    paddingLeft: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 34,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: RetroColors.border,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  timelineDot: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: RetroColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineNumber: {
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  timelineText: {
    fontFamily: 'monospace',
    marginLeft: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: {
    padding: 25,
    paddingBottom: 60,
  },
  continueButton: {
    backgroundColor: RetroColors.primary,
    height: 70,
  }
});