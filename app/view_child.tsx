import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';

// ─── Type (mirrors ChildFormData + computed fields) ───────────────────────────
type ChildProfile = {
  id?: string;
  // computed
  fullName?: string;
  age?: number;
  // step 1
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: string;
  ethnicity?: string;
  height?: number;
  weight?: number;
  // step 2
  lifeThreatAllergies?: string;
  emergencyMedications?: string;
  communicationNeeds?: string;
  languageSpoken?: string;
  otherMedicalNotes?: string;
  // step 3
  guardian1?: { name?: string; phone?: string; address?: string };
  guardian2?: { name?: string; phone?: string; address?: string };
  emergencyContacts?: Array<{
    name?: string;
    relationship?: string;
    phone?: string;
    address?: string;
  }>;
  // step 4
  eyeColor?: string;
  eyeColorOther?: string;
  hairColor?: string;
  hairColorOther?: string;
  hairStyle?: string;
  hasHat?: boolean;
  hatColor?: string;
  hatStyle?: string;
  topColor?: string;
  pantsColor?: string;
  shoesColor?: string;
  shoesType?: string;
  hasGlasses?: boolean;
  hasHearingAids?: boolean;
  otherSensoryNeeds?: string;
};

// ─── Helper components ────────────────────────────────────────────────────────

// Label on left (bold), value on right
function InfoRow({ label, value }: { label: string; value?: string | number | boolean }) {
  if (value === undefined || value === null || value === '' || value === false) return null;
  const display = typeof value === 'boolean' ? 'Yes' : String(value);
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={styles.infoValue}>{display}</AppText>
    </View>
  );
}

// Bold section heading with a full-width divider above it (except the first)
function SectionHeading({ title, first }: { title: string; first?: boolean }) {
  return (
    <>
      {!first && <View style={styles.divider} />}
      <AppText style={styles.sectionTitle}>{title}</AppText>
    </>
  );
}

// Subtle sub-group label
function GroupLabel({ title }: { title: string }) {
  return <AppText style={styles.groupLabel}>{title}</AppText>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ViewChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadChild(id);
  }, [id]);

  const loadChild = async (childId: string) => {
    try {
      const json = await AsyncStorage.getItem('children_list');
      if (json) {
        const list = JSON.parse(json);
        const found = list.find((c: any) => c.id === childId);
        if (found) { setChild(found); return; }
      }
      Alert.alert('Error', 'Child profile not found');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to load child profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.container}>
        <AppText>Child profile not found</AppText>
      </View>
    );
  }

  const displayName = child.fullName || `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim() || 'Unnamed Child';
  const eyeDisplay  = child.eyeColor === 'other' ? child.eyeColorOther : child.eyeColor;
  const hairDisplay = child.hairColor === 'other' ? child.hairColorOther : child.hairColor;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Child Profile"
        onLeftPress={() => router.back()}
        onRightPress={() => router.replace('/(tabs)')}
      />
    <ScrollView contentContainerStyle={styles.content}>
      {/* ── Single card containing everything ───────────────────────────────── */}
      <View style={styles.card}>

        {/* Avatar + name + age */}
        <View style={styles.avatar}>
          <View style={styles.avatarCircle}>
            <IconSymbol name="person.fill" size={48} color={palette.blue} />
          </View>
          <AppText style={styles.childName}>{displayName}</AppText>
          {child.age !== undefined && (
            <AppText style={styles.childAge}>{child.age} years old</AppText>
          )}
        </View>
        <View style={styles.divider} />

        {/* Essential ID */}
        <SectionHeading title="Essential ID" first />
        <InfoRow label="Date of Birth" value={child.dateOfBirth} />
        <InfoRow label="Sex"           value={child.sex} />
        <InfoRow label="Ethnicity"     value={child.ethnicity} />
        <InfoRow label="Height"        value={child.height !== undefined ? `${child.height} cm` : undefined} />
        <InfoRow label="Weight"        value={child.weight !== undefined ? `${child.weight} kg` : undefined} />

        {/* Medical */}
        {(child.lifeThreatAllergies || child.emergencyMedications ||
          child.communicationNeeds  || child.otherMedicalNotes) && (
          <>
            <SectionHeading title="Medical" />
            <InfoRow label="Life-Threatening Allergies" value={child.lifeThreatAllergies} />
            <InfoRow label="Emergency Medications"      value={child.emergencyMedications} />
            <InfoRow label="Communication Needs"        value={child.communicationNeeds} />
            {child.communicationNeeds === 'language_barrier' && (
              <InfoRow label="Language Spoken"          value={child.languageSpoken} />
            )}
            <InfoRow label="Other Medical Notes"        value={child.otherMedicalNotes} />
          </>
        )}

        {/* Contacts */}
        <SectionHeading title="Contacts" />
        {child.guardian1?.name && (
          <>
            <GroupLabel title="Primary Guardian 1" />
            <InfoRow label="Name"    value={child.guardian1.name} />
            <InfoRow label="Phone"   value={child.guardian1.phone} />
            <InfoRow label="Address" value={child.guardian1.address} />
          </>
        )}
        {child.guardian2?.name && (
          <>
            <GroupLabel title="Primary Guardian 2" />
            <InfoRow label="Name"    value={child.guardian2.name} />
            <InfoRow label="Phone"   value={child.guardian2.phone} />
            <InfoRow label="Address" value={child.guardian2.address} />
          </>
        )}
        {child.emergencyContacts && child.emergencyContacts.length > 0 && (
          <>
            <GroupLabel title="Additional Emergency Contacts" />
            {child.emergencyContacts.map((c, i) => (
              <View key={i} style={i > 0 ? styles.contactSpacer : undefined}>
                <AppText style={styles.contactIndex}>Contact {i + 1}</AppText>
                <InfoRow label="Name"         value={c.name} />
                <InfoRow label="Relationship" value={c.relationship} />
                <InfoRow label="Phone"        value={c.phone} />
                <InfoRow label="Address"      value={c.address} />
              </View>
            ))}
          </>
        )}

        {/* Visual ID */}
        <SectionHeading title="Visual ID" />
        <GroupLabel title="Appearance" />
        <InfoRow label="Eye Color"  value={eyeDisplay} />
        <InfoRow label="Hair Color" value={hairDisplay} />
        <InfoRow label="Hair Style" value={child.hairStyle} />

        <GroupLabel title="Clothing" />
        <InfoRow label="Top / Shirt"    value={child.topColor} />
        <InfoRow label="Pants / Bottom" value={child.pantsColor} />
        <InfoRow label="Shoes Color"    value={child.shoesColor} />
        <InfoRow label="Shoes Type"     value={child.shoesType} />
        {child.hasHat && (
          <>
            <InfoRow label="Hat Color" value={child.hatColor} />
            <InfoRow label="Hat Style" value={child.hatStyle} />
          </>
        )}

        {(child.hasGlasses || child.hasHearingAids || child.otherSensoryNeeds) && (
          <>
            <GroupLabel title="Sensory Needs" />
            <InfoRow label="Wears Glasses"      value={child.hasGlasses} />
            <InfoRow label="Wears Hearing Aids" value={child.hasHearingAids} />
            <InfoRow label="Other"              value={child.otherSensoryNeeds} />
          </>
        )}

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    padding: spacing.xxl,
  },

  // Avatar — inside the card
  avatar: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.sm,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.navy,
    textAlign: 'center',
  },
  childAge: {
    fontSize: typography.small,
    fontWeight: '500',
    color: palette.navy,
    marginTop: 2,
  },

  // Single card
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: palette.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  // Section heading + divider
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navyLight,
    letterSpacing: -0.1,
    marginBottom: spacing.sm,
  },

  // Group label
  groupLabel: {
    fontSize: typography.tiny,
    fontWeight: '600',
    color: palette.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  // Info row — label left (bold), value right
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.body,
    color: palette.navyLight,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },

  // Emergency contact spacing
  contactIndex: {
    fontSize: typography.small,
    fontWeight: '600',
    color: palette.navyLight,
    marginBottom: spacing.xs,
  },
  contactSpacer: {
    marginTop: spacing.sm,
  },
});
