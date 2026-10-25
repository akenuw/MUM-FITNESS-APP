import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export function TermsAndConditionsScreen() {
  // Handle going back to login screen
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Terms and Conditions for FitTrack</Text>
        <Text style={styles.date}>Effective Date: May 1, 2023</Text>

        <Text style={styles.paragraph}>
          Welcome to FitTrack! These Terms and Conditions ("Terms") govern your use of our mobile application and related services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, do not use our Services.
        </Text>

        <Text style={styles.sectionTitle}>1. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old or have the permission of a parent or legal guardian to use this app. By using the app, you confirm that you meet this requirement.
        </Text>

        <Text style={styles.sectionTitle}>2. 7-Day Free Trial</Text>
        <Text style={styles.paragraph}>
          We offer new users a 7-day free trial of our premium features.
        </Text>
        <Text style={styles.paragraph}>
          The free trial begins from the moment you activate it within the app.
        </Text>
        <Text style={styles.paragraph}>
          During the trial, you will have access to all premium features without being charged.
        </Text>
        <Text style={styles.paragraph}>
          At the end of the 7-day trial period, your subscription will automatically renew into a paid subscription unless you cancel before the trial ends.
        </Text>
        <Text style={styles.paragraph}>
          You can cancel your trial at any time in your account settings to avoid charges.
        </Text>
        <Text style={styles.paragraph}>
          Each user is eligible for only one free trial unless otherwise stated.
        </Text>

        <Text style={styles.sectionTitle}>3. Subscription and Payments</Text>
        <Text style={styles.paragraph}>
          After the trial, a recurring subscription fee will be charged based on the plan selected (monthly, quarterly, or annually).
        </Text>
        <Text style={styles.paragraph}>
          Subscription fees are non-refundable unless required by law.
        </Text>
        <Text style={styles.paragraph}>
          Your subscription will automatically renew unless you cancel before the end of the current billing period.
        </Text>
        <Text style={styles.paragraph}>
          You can manage or cancel your subscription through your device's app store (Google Play or Apple App Store).
        </Text>
        <Text style={styles.paragraph}>
          We reserve the right to change our pricing and will notify you in advance.
        </Text>

        <Text style={styles.sectionTitle}>4. Health Disclaimer</Text>
        <Text style={styles.paragraph}>
          Our Services are designed to support your health and fitness goals but do not constitute medical advice.
        </Text>
        <Text style={styles.paragraph}>
          Always consult with your physician or qualified healthcare provider before starting any fitness program.
        </Text>
        <Text style={styles.paragraph}>
          Use of the app is at your own risk. FitTrack is not liable for any injuries or health issues that may arise from following exercises or nutrition suggestions within the app.
        </Text>

        <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          By using the app, you agree to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide accurate and complete information when creating an account.</Text>
        <Text style={styles.bulletPoint}>• Use the app only for lawful and personal fitness purposes.</Text>
        <Text style={styles.bulletPoint}>• Not share your login credentials or allow others to use your account.</Text>
        <Text style={styles.bulletPoint}>• Respect the intellectual property and community guidelines of the platform.</Text>

        <Text style={styles.sectionTitle}>6. Prohibited Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Use the app to harm, threaten, or harass others.</Text>
        <Text style={styles.bulletPoint}>• Upload or share misleading, false, or offensive content.</Text>
        <Text style={styles.bulletPoint}>• Interfere with the security, functionality, or operation of the app.</Text>
        <Text style={styles.bulletPoint}>• Reverse-engineer or tamper with any portion of the app.</Text>

        <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content within the app, including workouts, videos, images, text, and branding, are the intellectual property of FitTrack or its licensors. You may not copy, distribute, or use any content without permission.
        </Text>

        <Text style={styles.sectionTitle}>8. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Our Privacy Policy explains how we collect, use, and protect your personal data. By using the app, you also agree to the terms in our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          We may suspend or terminate your access to the app at our discretion if you violate these Terms. You may also delete your account at any time. Subscription fees are not refundable upon termination unless required by law.
        </Text>

        <Text style={styles.sectionTitle}>10. Disclaimers and Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The app is provided "as is" and "as available". We make no guarantees that the app will meet your expectations, operate without interruptions, or be error-free. To the fullest extent permitted by law, FitTrack shall not be liable for any damages resulting from your use of or inability to use the app.
        </Text>

        <Text style={styles.sectionTitle}>11. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of the United States. Any disputes will be resolved in the courts of California.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, contact us at:
        </Text>
        <Text style={styles.contactInfo}>Email: support@fittrack.com</Text>
        <Text style={styles.contactInfo}>Phone: (555) 123-4567</Text>
        <Text style={styles.contactInfo}>Address: 123 Fitness Street, San Francisco, CA 94105</Text>

        <Text style={styles.finalNote}>
          By continuing to use the app, you confirm that you have read, understood, and agree to these Terms and Conditions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactInfo: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 4,
  },
  finalNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 24,
    marginBottom: 40,
  },
});
