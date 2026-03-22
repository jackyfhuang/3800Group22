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
  height?: number;
  weight?: number;
  eyeColor?: string;
  eyeColorOther?: string;
  hairColor?: string;
  hairColorOther?: string;
  lifeThreatAllergies?: string;
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
          {/* Header */}
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

          {/* Profiles */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {profiles.map((child, i) => {
              const name =
                child.fullName ||
                `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() ||
                'Unnamed';
              const eye = child.eyeColor === 'other' ? child.eyeColorOther : child.eyeColor;
              const hair = child.hairColor === 'other' ? child.hairColorOther : child.hairColor;

              return (
                <View key={child.id ?? i} style={modalStyles.card}>
                  <AppText style={modalStyles.childName}>{name}</AppText>

                  {/* Stat pills — two rows of 3, each pill equal width */}
                  <View style={modalStyles.pillRow}>
                    {child.age !== undefined && <StatPill label="Age" value={`${child.age} yrs`} />}
                    {child.height !== undefined && <StatPill label="Height" value={`${child.height} cm`} />}
                    {child.weight !== undefined && <StatPill label="Weight" value={`${child.weight} kg`} />}
                  </View>
                  {(eye || hair || child.sex) && (
                    <View style={modalStyles.pillRow}>
                      <StatPill label="Eyes"   value={eye  || '—'} />
                      <StatPill label="Hair"   value={hair || '—'} />
                      <StatPill label="Sex"    value={child.sex || '—'} />
                    </View>
                  )}

                  {/* Info rows */}
                  {(child.dateOfBirth || child.guardian1?.phone || child.guardian2?.phone) && (
                    <View style={modalStyles.divider} />
                  )}
                  {child.dateOfBirth && (
                    <InfoRow label="Date of Birth" value={child.dateOfBirth} />
                  )}
                  {child.guardian1?.phone && (
                    <InfoRow label="Guardian 1 Phone" value={child.guardian1.phone} highlight />
                  )}
                  {child.guardian2?.phone && (
                    <InfoRow label="Guardian 2 Phone" value={child.guardian2.phone} highlight />
                  )}

                  {/* Allergy warning */}
                  {child.lifeThreatAllergies && (
                    <View style={modalStyles.allergyRow}>
                      <MaterialIcons name="warning" size={14} color={palette.red} />
                      <AppText style={modalStyles.allergyText}>
                        <AppText style={{ fontWeight: '700' }}>Allergies: </AppText>
                        {child.lifeThreatAllergies}
                      </AppText>
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

// ─── Small helpers ─────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={modalStyles.pill}>
      <AppText style={modalStyles.pillLabel}>{label}</AppText>
      <AppText style={modalStyles.pillValue}>{value}</AppText>
    </View>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={modalStyles.infoRow}>
      <AppText style={modalStyles.infoLabel}>{label}</AppText>
      <AppText style={[modalStyles.infoValue, highlight && modalStyles.infoHighlight]}>
        {value}
      </AppText>
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
    color: palette.red,
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
    backgroundColor: colors.appBackground,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.navy,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  pillValue: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.navy,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  infoLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.navy,
  },
  infoValue: {
    fontSize: typography.body,
    color: palette.navyLight,
  },
  infoHighlight: {
    fontWeight: '700',
    color: palette.teal,
  },
  allergyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: palette.redBackground,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.redBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  allergyText: {
    fontSize: typography.body,
    color: palette.red,
    flex: 1,
    lineHeight: 20,
  },
});
