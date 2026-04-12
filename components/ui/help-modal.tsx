// Help modal — accessible from the info icon on the home screen.
// Contains usage tips and a link back to the disclaimer.
import { AppText } from '@/components/ui/app-text';
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { DisclaimerModal } from './disclaimer-modal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HelpModal({ visible, onClose }: Props) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="help-outline" size={24} color={palette.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.title}>Help & Info</AppText>
                <AppText style={styles.subtitle}>How to use ChildGuard</AppText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <MaterialIcons name="close" size={20} color={palette.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Feature tips */}
              <HelpItem
                icon="person-add"
                iconColor={palette.teal}
                iconBg={colors.secondaryLight}
                heading="Adding a Child Profile"
                text='Tap "Add New Child" on the home screen and complete the multi-step form. Each section is optional — fill in as much as you can.'
              />
              <HelpItem
                icon="edit"
                iconColor={palette.blue}
                iconBg={colors.primaryLight}
                heading="Editing or Deleting Profiles"
                text="Tap Edit on a profile card to update any details. Tap Delete to permanently remove a profile. Changes are saved immediately."
              />
              <HelpItem
                icon="local-police"
                iconColor={palette.red}
                iconBg={palette.redLight}
                heading="Emergency Quick View"
                text="The red banner on the home screen opens a quick-reference sheet designed to be shown to first responders instantly."
              />
              <HelpItem
                icon="visibility"
                iconColor={palette.navy}
                iconBg={colors.appBackground}
                heading="Viewing a Full Profile"
                text="Tap any child card to open their full profile. From there you can export a PDF to share with schools or caregivers."
              />
              <HelpItem
                icon="update"
                iconColor={palette.teal}
                iconBg={colors.secondaryLight}
                heading="Keeping Profiles Current"
                text="Review profiles regularly — especially height, weight, and clothing — so information is accurate when it matters most."
              />
              <HelpItem
                icon="lock"
                iconColor={palette.navy}
                iconBg={colors.appBackground}
                heading="Your Data Is Private"
                text="All data is stored locally on your device only. Nothing is sent to external servers or shared with third parties."
              />

              {/* Disclaimer link */}
              <TouchableOpacity
                style={styles.disclaimerLink}
                onPress={() => setShowDisclaimer(true)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="security" size={18} color={palette.teal} />
                <AppText style={styles.disclaimerLinkText}>Re-read the full disclaimer</AppText>
                <MaterialIcons name="chevron-right" size={18} color={palette.teal} />
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Nested disclaimer */}
      <DisclaimerModal
        visible={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
      />
    </>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function HelpItem({
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
    <View style={styles.item}>
      <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.itemHeading}>{heading}</AppText>
        <AppText style={styles.itemBody}>{text}</AppText>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '92%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: palette.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSubtle,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.appBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Help item
  item: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemHeading: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    marginBottom: 4,
  },
  itemBody: {
    fontSize: typography.body,
    color: colors.textSubtle,
    lineHeight: 20,
  },

  // Disclaimer link
  disclaimerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.secondaryLight,
    marginTop: spacing.sm,
  },
  disclaimerLinkText: {
    flex: 1,
    fontSize: typography.default,
    fontWeight: '600',
    color: palette.teal,
  },
});
