// Full-screen onboarding gate shown on first install.
// Step 1: Disclaimer — must be acknowledged before proceeding.
// Step 2: How-to guide — introduces core app features.
// Sets AsyncStorage key 'onboarding_complete' when finished.
import { AppText } from '@/components/ui/app-text';
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export const ONBOARDING_KEY = 'onboarding_complete';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

type Props = { onComplete: () => void };

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToStep = (next: 0 | 1) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <View style={styles.stepBar}>
        <View style={[styles.stepDot, step === 0 && styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        {step === 0 ? (
          <DisclaimerStep onNext={() => goToStep(1)} />
        ) : (
          <HowToStep onFinish={handleFinish} onBack={() => goToStep(0)} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Step 1: Disclaimer ───────────────────────────────────────────────────────
function DisclaimerStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight, borderColor: colors.secondaryBorder }]}>
          <MaterialIcons name="security" size={36} color={palette.teal} />
        </View>
        <AppText style={styles.stepTitle}>Before You Begin</AppText>
        <AppText style={styles.stepSubtitle}>Please read and acknowledge the following</AppText>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BulletItem
          icon="phone-in-talk"
          heading="Always call 911 first"
          text="ChildGuard is a preparedness and reference tool. In any emergency, contact emergency services immediately."
        />
        <BulletItem
          icon="lock"
          heading="Your data stays on this device"
          text="All profile information is stored locally. Nothing is sent to external servers, shared with third parties, or backed up to the cloud."
        />
        <BulletItem
          icon="update"
          heading="Keep profiles up to date"
          text="Regularly review each profile — especially height, weight, and clothing — so information is accurate when it matters most."
        />
        <BulletItem
          icon="person"
          heading="Authorised use only"
          text="This app is intended for use by parents and legal guardians. Do not allow unauthorised individuals access to profile data."
        />
        <BulletItem
          icon="info"
          heading="Not a substitute for official documents"
          text="ChildGuard does not replace official identification documents, medical records, or legal guardianship papers."
        />
      </ScrollView>

      {/* CTA */}
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext} activeOpacity={0.85}>
        <AppText style={styles.primaryBtnText}>I Understand — Continue</AppText>
        <MaterialIcons name="arrow-forward" size={18} color={palette.white} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: How to use ───────────────────────────────────────────────────────
function HowToStep({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  return (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
          <MaterialIcons name="menu-book" size={36} color={palette.blue} />
        </View>
        <AppText style={styles.stepTitle}>How to Use ChildGuard</AppText>
        <AppText style={styles.stepSubtitle}>A quick overview to get you started</AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FeatureCard
          icon="person-add"
          iconColor={palette.teal}
          iconBg={colors.secondaryLight}
          heading="Add a Child Profile"
          text={`Tap "Add New Child" on the home screen. Fill in your child's details across multiple steps - personal info, appearance, clothing, and emergency contacts.`}
        />
        <FeatureCard
          icon="edit"
          iconColor={palette.blue}
          iconBg={colors.primaryLight}
          heading="Edit or Delete Profiles"
          text={`Tap Edit on any profile card to update information, or Delete to remove it. Keep details current so they're accurate in an emergency.`}
        />
        <FeatureCard
          icon="local-police"
          iconColor={palette.red}
          iconBg={palette.redLight}
          heading="Emergency Quick View"
          text={`The red Emergency Quick View banner on the home screen gives first responders instant access to your child's key details — no navigation needed.`}
        />
        <FeatureCard
          icon="visibility"
          iconColor={palette.navy}
          iconBg={colors.appBackground}
          heading="View Full Profile"
          text="Tap any child card to open their full profile. You can export it as a PDF to share with schools, caregivers, or authorities."
        />
        <FeatureCard
          icon="info-outline"
          iconColor={palette.teal}
          iconBg={colors.secondaryLight}
          heading="Help & Disclaimer"
          text='Tap the info icon in the top-right corner of the home screen at any time to re-read the disclaimer or review these tips.'
        />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={18} color={palette.navy} />
          <AppText style={styles.backBtnText}>Back</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onFinish} activeOpacity={0.85}>
          <AppText style={styles.primaryBtnText}>Get Started</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function BulletItem({
  icon,
  heading,
  text,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  heading: string;
  text: string;
}) {
  return (
    <View style={styles.bulletItem}>
      <View style={styles.bulletIcon}>
        <MaterialIcons name={icon} size={20} color={palette.teal} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.bulletHeading}>{heading}</AppText>
        <AppText style={styles.bulletBody}>{text}</AppText>
      </View>
    </View>
  );
}

function FeatureCard({
  icon,
  iconColor,
  iconBg,
  heading,
  text,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconBg: string;
  heading: string;
  text: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.featureHeading}>{heading}</AppText>
        <AppText style={styles.featureBody}>{text}</AppText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },

  // Step indicator
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cardBorder,
  },
  stepDotActive: {
    backgroundColor: palette.teal,
    width: 24,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.cardBorder,
  },

  // Step wrapper
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  stepTitle: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: palette.navy,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: typography.body,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Scroll area
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  // Disclaimer bullet items
  bulletItem: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  bulletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletHeading: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: 3,
  },
  bulletBody: {
    fontSize: typography.body,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // Feature cards (how-to)
  featureCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureHeading: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: 4,
  },
  featureBody: {
    fontSize: typography.body,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.teal,
    paddingVertical: 18,
    borderRadius: radius.lg,
    shadowColor: palette.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: palette.white,
    fontSize: typography.button,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.appBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  backBtnText: {
    fontSize: typography.button,
    fontWeight: '600',
    color: palette.navy,
  },
});
