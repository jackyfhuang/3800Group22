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
              const eye = child.eyeColor === 'other' ? child.eyeColorOther : child.eyeColor;
              const hair = child.hairColor === 'other' ? child.hairColorOther : child.hairColor;

              const hasPhysical =
                child.age !== undefined ||
                child.height !== undefined ||
                child.weight !== undefined ||
                eye || hair || child.sex;

              const hasContacts =
                child.guardian1?.phone || child.guardian2?.phone;

              return (
                <View key={child.id ?? i} style={modalStyles.card}>

                  {/* Name */}
                  <AppText style={modalStyles.childName}>{name}</AppText>
                  <View style={modalStyles.nameDivider} />

                  {/* ── Physical Section ───────────────────────────────────── */}
                  {hasPhysical && (
                    <View style={modalStyles.section}>
                      <SectionHeader label="Physical" icon="straighten" />
                      <View style={modalStyles.pillGrid}>
                        {child.age !== undefined && (
                          <StatPill label="Age" value={`${child.age} yrs`} />
                        )}
                        {child.sex && <StatPill label="Sex" value={child.sex} />}
                        {child.height !== undefined && (
                          <StatPill label="Height" value={`${child.height} cm`} />
                        )}
                        {child.weight !== undefined && (
                          <StatPill label="Weight" value={`${child.weight} kg`} />
                        )}
                        {eye && <StatPill label="Eyes" value={eye} />}
                        {hair && <StatPill label="Hair" value={hair} />}
                      </View>
                    </View>
                  )}

                  {/* ── Contact Section ────────────────────────────────────── */}
                  {hasContacts && (
                    <View style={modalStyles.section}>
                      <SectionHeader label="Contacts" icon="phone" />
                      <View style={modalStyles.contactList}>
                        {child.guardian1?.phone && (
                          <IconCardRow
                            icon="phone"
                            iconColor={palette.teal}
                            iconBg={colors.secondaryLight}
                            label={child.guardian1.name || 'Guardian 1'}
                            value={child.guardian1.phone.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3') || child.guardian1.phone}
                          />
                        )}
                        {child.guardian2?.phone && (
                          <IconCardRow
                            icon="phone"
                            iconColor={palette.teal}
                            iconBg={colors.secondaryLight}
                            label={child.guardian2.name || 'Guardian 2'}
                            value={child.guardian2.phone.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3') || child.guardian2.phone}
                          />
                        )}
                      </View>
                    </View>
                  )}

                  {/* ── Allergy Warning ────────────────────────────────────── */}
                  {child.lifeThreatAllergies && (
                    <View style={modalStyles.allergySection}>
                      <View style={modalStyles.allergyHeader}>
                        <MaterialIcons name="warning" size={16} color={palette.red} />
                        <AppText style={modalStyles.allergyLabel}>Life-Threatening Allergies</AppText>
                      </View>
                      <AppText style={modalStyles.allergyText}>
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

// ─── Helper components ────────────────────────────────────────────────────────
function SectionHeader({ label, icon }: { label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }) {
  return (
    <View style={helperStyles.sectionHeader}>
      <MaterialIcons name={icon} size={13} color={colors.textSubtle} />
      <AppText style={helperStyles.sectionLabel}>{label}</AppText>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={helperStyles.pill}>
      <AppText style={helperStyles.pillLabel}>{label}</AppText>
      <AppText style={helperStyles.pillValue}>{value}</AppText>
    </View>
  );
}

function IconCardRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <View style={helperStyles.contactRow}>
      <View style={[helperStyles.contactIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={helperStyles.contactLabel}>{label}</AppText>
        <AppText style={helperStyles.contactPhone}>{value}</AppText>
      </View>
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
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  contactList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  // Allergy
  allergySection: {
    marginTop: spacing.sm,
    backgroundColor: palette.redLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.redBorder,
    padding: spacing.md,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  allergyLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.red,
  },
  allergyText: {
    fontSize: typography.body,
    color: palette.navy,
    lineHeight: 20,
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
  pill: {
    backgroundColor: colors.appBackground,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    flexBasis: '31%',
    flexGrow: 0,
    flexShrink: 0,
  },
  pillLabel: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  pillValue: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.appBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: typography.tiny,
    fontWeight: '600',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navy,
    letterSpacing: 0.3,
  },
});
