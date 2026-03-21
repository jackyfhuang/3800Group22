// First-launch disclaimer modal.
// Shown automatically on first install (AsyncStorage key 'disclaimer_accepted').
// Can be reopened at any time by the user.
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from './app-text';

const STORAGE_KEY = 'disclaimer_accepted';

export async function hasAcceptedDisclaimer(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

type Props = {
  visible: boolean;
  onAccept: () => void;
};

export function DisclaimerModal({ visible, onAccept }: Props) {
  const handleAccept = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    onAccept();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Icon + title */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <MaterialIcons name="security" size={36} color={palette.teal} />
            </View>
            <AppText style={styles.title}>Before You Begin</AppText>
            <AppText style={styles.subtitle}>Please read before using ChildGuard</AppText>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            showsVerticalScrollIndicator={false}
          >
            <DisclaimerItem
              icon="phone-in-talk"
              heading="Always call 911 first"
              text="ChildGuard is a preparedness and reference tool. In any emergency, contact emergency services immediately."
            />
            <DisclaimerItem
              icon="lock"
              heading="Your data stays on this device"
              text="All profile information is stored locally. Nothing is sent to external servers, shared with third parties, or backed up to the cloud."
            />
            <DisclaimerItem
              icon="update"
              heading="Keep profiles up to date"
              text="Regularly review each profile — especially height, weight, and clothing — so information is accurate when it matters most."
            />
            <DisclaimerItem
              icon="person"
              heading="Authorised use only"
              text="This app is intended for use by parents and legal guardians. Do not allow unauthorised individuals access to profile data."
            />
            <DisclaimerItem
              icon="info"
              heading="Not a substitute for official documents"
              text="ChildGuard does not replace official identification documents, medical records, or legal guardianship papers."
            />
          </ScrollView>

          {/* Accept */}
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.85}>
            <AppText style={styles.acceptText}>I Understand</AppText>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

// ── Small item inside the disclaimer ─────────────────────────────────────────
function DisclaimerItem({
  icon,
  heading,
  text,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  heading: string;
  text: string;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemIconWrap}>
        <MaterialIcons name={icon} size={20} color={palette.teal} />
      </View>
      <View style={styles.itemText}>
        <AppText style={styles.itemHeading}>{heading}</AppText>
        <AppText style={styles.itemBody}>{text}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    maxHeight: '90%',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondaryBorder,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: palette.navy,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Body scroll
  body: {
    marginBottom: spacing.xl,
  },

  // Disclaimer item
  item: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
  },
  itemHeading: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: 3,
  },
  itemBody: {
    fontSize: typography.body,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // Accept button
  acceptButton: {
    backgroundColor: palette.teal,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    shadowColor: palette.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    color: palette.white,
    fontSize: typography.button,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
