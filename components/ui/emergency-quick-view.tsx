// Emergency Quick View — card banner + full-screen modal.
// Card lives on the home screen; tapping opens the modal with key child info.
import { AppText } from '@/components/ui/app-text';
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Shared type (minimal — only fields used for emergency display) ───────────
export type EmergencyChild = {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: string;
  sex?: string;
  ethnicity?: string;
  skinColor?: string;
  skinColorOther?: string;
  languageSpoken?: string;
  unitSystem?: string;
  height?: number;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  hasTrackingDevice?: string;
  trackingDeviceType?: string;
  trackingDeviceTypeOther?: string;
  trackingDeviceDetails?: string;
  guardian1?: { name?: string; phone?: string };
  guardian2?: { name?: string; phone?: string };
};

// ─── Banner card ──────────────────────────────────────────────────────────────
export function EmergencyQuickViewCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [cardStyles.card, pressed && cardStyles.cardPressed]}
      onPress={onPress}
    >
      <View style={cardStyles.iconWrap}>
        <MaterialIcons name="local-police" size={24} color={palette.red} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={cardStyles.title}>Emergency Quick View</AppText>
        <AppText style={cardStyles.subtitle}>Tap to show key info to first responders</AppText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={palette.red} />
    </Pressable>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function EmergencyQuickViewModal({
  visible,
  profiles,
  onClose,
}: {
  visible: boolean;
  profiles: EmergencyChild[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={modalStyles.header}>
            <View style={modalStyles.iconWrap}>
              <MaterialIcons name="local-police" size={24} color={palette.red} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={modalStyles.title}>Emergency Quick View</AppText>
              <AppText style={modalStyles.subtitle}>Show this screen to emergency services</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color={palette.navy} />
            </TouchableOpacity>
          </View>

          {/* ── Profiles ───────────────────────────────────────────────────── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {profiles.map((child, i) => {
              const name =
                child.fullName ||
                `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() ||
                'Unnamed';
              const skin = child.skinColor === 'other' ? child.skinColorOther : child.skinColor;
              const heightDisplay =
                child.unitSystem === 'metric'
                  ? child.height != null ? `${child.height} cm` : undefined
                  : child.heightFeet != null
                    ? `${child.heightFeet} ft ${child.heightInches ?? 0} in`
                    : child.height != null ? `${child.height} cm` : undefined;
              const weightDisplay =
                child.weight != null
                  ? `${child.weight} ${child.unitSystem === 'metric' ? 'kg' : 'lbs'}`
                  : undefined;
              const deviceType =
                child.trackingDeviceType === 'other'
                  ? child.trackingDeviceTypeOther
                  : child.trackingDeviceType;

              return (
                <View key={child.id ?? i} style={modalStyles.card}>

                  {/* Name */}
                  <AppText style={modalStyles.childName}>{name}</AppText>
                  <View style={modalStyles.nameDivider} />

                  {/* ── Essential ID ───────────────────────────────────────── */}
                  <View style={modalStyles.section}>
                    <SectionHeader label="Essential ID" icon="badge" />
                    <View style={modalStyles.infoList}>
                      {child.dateOfBirth && <InfoLine label="Date of Birth" value={child.dateOfBirth} />}
                      {child.sex && <InfoLine label="Sex" value={child.sex} />}
                      {child.ethnicity && <InfoLine label="Ethnicity" value={child.ethnicity} />}
                      {skin && <InfoLine label="Skin Color" value={skin} />}
                      {child.languageSpoken && <InfoLine label="Language(s) Spoken" value={child.languageSpoken} />}
                      {heightDisplay && <InfoLine label="Height" value={heightDisplay} />}
                      {weightDisplay && <InfoLine label="Weight" value={weightDisplay} />}
                    </View>
                  </View>

                  {/* ── Tracking Device ────────────────────────────────────── */}
                  {child.hasTrackingDevice === 'yes' && (
                    <View style={modalStyles.section}>
                      <SectionHeader label="Tracking Device" icon="location-on" />
                      <View style={modalStyles.infoList}>
                        {deviceType && <InfoLine label="Device Type" value={deviceType} />}
                        {child.trackingDeviceDetails && <InfoLine label="Details" value={child.trackingDeviceDetails} />}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function SectionHeader({ label, icon }: { label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }) {
  return (
    <View style={helperStyles.sectionHeader}>
      <MaterialIcons name={icon} size={13} color={colors.textSubtle} />
      <AppText style={helperStyles.sectionLabel}>{label}</AppText>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={helperStyles.infoLine}>
      <AppText style={helperStyles.infoLineLabel}>{label}</AppText>
      <AppText style={helperStyles.infoLineValue}>{value}</AppText>
    </View>
  );
}

// ─── Card styles ──────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.redLight,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: palette.redBorder,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.lg,
    shadowColor: palette.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.redBackground,
    borderWidth: 1,
    borderColor: palette.redBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
  },
  subtitle: {
    fontSize: typography.body,
    color: palette.navy,
    marginTop: 2,
    fontWeight: '500',
  },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
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
  scrollContent: {
    paddingBottom: spacing.xxxl,
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
    backgroundColor: palette.redBackground,
    borderWidth: 1,
    borderColor: palette.redBorder,
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

  // Child card
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.navy,
    marginBottom: spacing.md,
  },
  nameDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  infoList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },

});

// ─── Helper styles ────────────────────────────────────────────────────────────
const helperStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.tiny,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  infoLineLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  infoLineValue: {
    fontSize: typography.body,
    color: palette.navyLight,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
});
