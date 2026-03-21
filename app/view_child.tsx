import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { colors, radius, spacing, typography } from '@/styles';

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildProfile = {
  fullName: string;
  age: number;
  height: number;
  weight: number;
  gender?: string;
  medicalNotes?: string;
  hasBirthmarks?: string;
  birthmarksDescription?: string;
  hasScars?: string;
  scarsDescription?: string;
  hasIdentifyingFeatures?: string;
  identifyingFeaturesDescription?: string;
  lastKnownLocation?: string;
  schoolDaycareType?: string;
  schoolDaycareName?: string;
  sportsTeams?: string;
  parent1Name?: string;
  parent1Address?: string;
  parent1Phone?: string;
  parent2Name?: string;
  parent2Address?: string;
  parent2Phone?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    sex?: string;
    phone: string;
    address?: string;
  }>;
  id?: string;
};

// ─── Helper Component ────────────────────────────────────────────────────────
type InfoRowProps = {
  label: string;
  value: string | number | undefined;
};

function InfoRow({ label, value }: InfoRowProps) {
  if (value === undefined || value === '' || value === null) return null;
  return (
    <View style={viewStyles.infoRow}>
      <AppText variant="fieldLabel" style={viewStyles.infoLabel}>
        {label}
      </AppText>
      <AppText style={viewStyles.infoValue}>{String(value)}</AppText>
    </View>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={viewStyles.section}>
      <AppText variant="heading" style={viewStyles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
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
      const childrenJson = await AsyncStorage.getItem('children_list');
      if (childrenJson) {
        const childrenList = JSON.parse(childrenJson);
        const foundChild = childrenList.find((c: any) => c.id === childId);
        if (foundChild) {
          setChild(foundChild);
        } else {
          Alert.alert('Error', 'Child profile not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading child:', error);
      Alert.alert('Error', 'Failed to load child profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={viewStyles.container}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={viewStyles.container}>
        <AppText>Child profile not found</AppText>
      </View>
    );
  }

  // Check if any fields in a section have values
  const hasBasicInfo =
    child.fullName ||
    child.age !== undefined ||
    child.height !== undefined ||
    child.weight !== undefined ||
    child.gender;

  const hasIdentifyingFeatures =
    child.hasBirthmarks === 'yes' ||
    child.hasScars === 'yes' ||
    child.hasIdentifyingFeatures === 'yes' ||
    child.lastKnownLocation ||
    child.schoolDaycareType ||
    child.sportsTeams;

  const hasParentInfo = child.parent1Name || child.parent2Name;

  const hasEmergencyContacts =
    child.emergencyContacts && child.emergencyContacts.length > 0;

  return (
    <ScrollView style={viewStyles.container} contentContainerStyle={viewStyles.contentContainer}>
      {/* Header */}
      <ScreenHeader
        title="Child Profile"
        onLeftPress={() => router.back()}
        onRightPress={() => router.replace('/(tabs)')}
      />

      {/* Avatar */}
      <View style={viewStyles.avatarContainer}>
        <View style={viewStyles.avatarCircle}>
          <IconSymbol name="person.fill" size={48} color="#007AFF" />
        </View>
        <AppText variant="heading" style={viewStyles.childName}>
          {child.fullName || 'Unnamed Child'}
        </AppText>
      </View>

      {/* Basic Information */}
      {hasBasicInfo && (
        <Section title="Basic Information">
          <InfoRow label="Full Name" value={child.fullName} />
          <InfoRow label="Age" value={child.age ? `${child.age} years` : undefined} />
          <InfoRow label="Height" value={child.height ? `${child.height} cm` : undefined} />
          <InfoRow label="Weight" value={child.weight ? `${child.weight} kg` : undefined} />
          <InfoRow label="Sex" value={child.gender} />
        </Section>
      )}

      {/* Medical Notes */}
      {child.medicalNotes && (
        <Section title="Medical Information">
          <View style={viewStyles.textBlock}>
            <AppText style={viewStyles.textBlockContent}>{child.medicalNotes}</AppText>
          </View>
        </Section>
      )}

      {/* Identifying Features */}
      {hasIdentifyingFeatures && (
        <Section title="Identifying Features">
          {child.hasBirthmarks === 'yes' && child.birthmarksDescription && (
            <View style={viewStyles.textBlock}>
              <AppText variant="fieldLabel" style={viewStyles.textBlockLabel}>
                Birthmarks
              </AppText>
              <AppText style={viewStyles.textBlockContent}>
                {child.birthmarksDescription}
              </AppText>
            </View>
          )}
          {child.hasScars === 'yes' && child.scarsDescription && (
            <View style={viewStyles.textBlock}>
              <AppText variant="fieldLabel" style={viewStyles.textBlockLabel}>
                Scars
              </AppText>
              <AppText style={viewStyles.textBlockContent}>
                {child.scarsDescription}
              </AppText>
            </View>
          )}
          {child.hasIdentifyingFeatures === 'yes' && child.identifyingFeaturesDescription && (
            <View style={viewStyles.textBlock}>
              <AppText variant="fieldLabel" style={viewStyles.textBlockLabel}>
                Other Identifying Features
              </AppText>
              <AppText style={viewStyles.textBlockContent}>
                {child.identifyingFeaturesDescription}
              </AppText>
            </View>
          )}
          <InfoRow label="Last Known Location" value={child.lastKnownLocation} />
          {child.schoolDaycareType && child.schoolDaycareType !== 'none' && (
            <InfoRow
              label={child.schoolDaycareType === 'school' ? 'School' : 'Daycare'}
              value={child.schoolDaycareName}
            />
          )}
          <InfoRow label="Sports Teams" value={child.sportsTeams} />
        </Section>
      )}

      {/* Parents Information */}
      {hasParentInfo && (
        <Section title="Parents Information">
          {child.parent1Name && (
            <View style={viewStyles.subsection}>
              <AppText variant="fieldLabel" style={viewStyles.subsectionTitle}>
                Parent 1
              </AppText>
              <InfoRow label="Name" value={child.parent1Name} />
              <InfoRow label="Address" value={child.parent1Address} />
              <InfoRow label="Phone" value={child.parent1Phone} />
            </View>
          )}
          {child.parent2Name && (
            <View style={viewStyles.subsection}>
              <AppText variant="fieldLabel" style={viewStyles.subsectionTitle}>
                Parent 2
              </AppText>
              <InfoRow label="Name" value={child.parent2Name} />
              <InfoRow label="Address" value={child.parent2Address} />
              <InfoRow label="Phone" value={child.parent2Phone} />
            </View>
          )}
        </Section>
      )}

      {/* Emergency Contacts */}
      {hasEmergencyContacts && (
        <Section title="Emergency Contacts">
          {child.emergencyContacts?.map((contact, index) => (
            <View key={index} style={viewStyles.contactCard}>
              <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                Contact {index + 1}
              </AppText>
              <InfoRow label="Name" value={contact.name} />
              <InfoRow label="Relationship" value={contact.relationship} />
              <InfoRow label="Sex" value={contact.sex} />
              <InfoRow label="Phone" value={contact.phone} />
              <InfoRow label="Address" value={contact.address} />
            </View>
          ))}
        </Section>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.secondaryBorder,
    marginBottom: spacing.lg,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: '600',
    color: colors.textName,
  },
  section: {
    marginBottom: spacing.xxxl,
    backgroundColor: colors.cardBackground,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    marginBottom: spacing.lg,
  },
  infoLabel: {
    marginBottom: spacing.xs,
    color: colors.textSubtle,
  },
  infoValue: {
    fontSize: typography.default,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  textBlock: {
    marginBottom: spacing.lg,
  },
  textBlockLabel: {
    marginBottom: spacing.xs,
    color: colors.textSubtle,
  },
  textBlockContent: {
    fontSize: typography.default,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  subsection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  subsectionTitle: {
    fontSize: typography.default,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  contactCard: {
    backgroundColor: colors.inputBackground,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  contactTitle: {
    fontSize: typography.default,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
