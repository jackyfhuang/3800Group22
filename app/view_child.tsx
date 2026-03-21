import { ChildPassportCard } from "@/components/child-passport";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/app-text";
import { colors, radius, spacing, typography } from "@/styles";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildProfile = {
  fullName: string;
  imageUri?: string; // Added imageUri to type
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
  birthmarkImageUris?: string[];
  scarImageUris?: string[];
  identifyingFeatureImageUris?: string[];
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
  emergencyContacts?: {
    name: string;
    relationship: string;
    sex?: string;
    phone: string;
    address?: string;
  }[];
  id?: string;
};

// ─── Helper Components ────────────────────────────────────────────────────────
type InfoRowProps = {
  label: string;
  value: string | number | undefined;
};

function InfoRow({ label, value }: InfoRowProps) {
  if (value === undefined || value === "" || value === null) return null;
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

function FeatureImageStrip({ images }: { images?: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <View style={viewStyles.featurePhotosRow}>
      {images.slice(0, 3).map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={viewStyles.featurePhotoThumb}
        />
      ))}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ViewChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassport, setShowPassport] = useState(false);

  const loadChild = useCallback(
    async (childId: string) => {
      try {
        const childrenJson = await AsyncStorage.getItem("children_list");
        if (childrenJson) {
          const childrenList = JSON.parse(childrenJson);
          const foundChild = childrenList.find((c: any) => c.id === childId);
          if (foundChild) {
            setChild(foundChild);
          } else {
            Alert.alert("Error", "Child profile not found");
            router.back();
          }
        }
      } catch (error) {
        console.error("Error loading child:", error);
        Alert.alert("Error", "Failed to load child profile");
        router.back();
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (id) loadChild(id);
  }, [id, loadChild]);

  if (loading) {
    return (
      <View style={viewStyles.container}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (!child) return null;

  const hasIdentifyingFeatures =
    child.hasBirthmarks === "yes" ||
    child.hasScars === "yes" ||
    child.hasIdentifyingFeatures === "yes" ||
    !!child.birthmarkImageUris?.length ||
    !!child.scarImageUris?.length ||
    !!child.identifyingFeatureImageUris?.length ||
    !!child.lastKnownLocation ||
    (child.schoolDaycareType && child.schoolDaycareType !== "none") ||
    !!child.sportsTeams;

  const hasParentsInfo =
    !!child.parent1Name ||
    !!child.parent1Address ||
    !!child.parent1Phone ||
    !!child.parent2Name ||
    !!child.parent2Address ||
    !!child.parent2Phone;

  return (
    <SafeAreaView style={viewStyles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={viewStyles.contentContainer}>
        {/* Header */}
        <View style={viewStyles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={viewStyles.backButton}
          >
            <AppText style={viewStyles.backButtonText}>←</AppText>
          </TouchableOpacity>
          <AppText variant="heading" style={viewStyles.headerTitle}>
            Child Profile
          </AppText>
        </View>

        {/* Avatar with Dynamic Image */}
        <View style={viewStyles.avatarContainer}>
          <View style={viewStyles.avatarCircle}>
            {child.imageUri ? (
              <Image
                source={{ uri: child.imageUri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
              />
            ) : (
              <IconSymbol name="person.fill" size={48} color="#007AFF" />
            )}
          </View>
          <AppText variant="heading" style={viewStyles.childName}>
            {child.fullName || "Unnamed Child"}
          </AppText>
        </View>

        {/* Basic Info Section */}
        <Section title="Basic Information">
          <InfoRow label="Full Name" value={child.fullName} />
          <InfoRow
            label="Age"
            value={child.age ? `${child.age} years` : undefined}
          />
          <InfoRow
            label="Height"
            value={child.height ? `${child.height} cm` : undefined}
          />
          <InfoRow
            label="Weight"
            value={child.weight ? `${child.weight} kg` : undefined}
          />
          <InfoRow label="Gender" value={child.gender} />
        </Section>

        {/* Medical Info */}
        {child.medicalNotes && (
          <Section title="Medical Information">
            <AppText style={viewStyles.textBlockContent}>
              {child.medicalNotes}
            </AppText>
          </Section>
        )}

        {/* Identifying Features */}
        {hasIdentifyingFeatures && (
          <Section title="Identifying Features">
            {child.hasBirthmarks === "yes" &&
              (child.birthmarksDescription ||
                child.birthmarkImageUris?.length) && (
              <View style={viewStyles.contactCard}>
                <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                  Birthmarks
                </AppText>
                {child.birthmarksDescription ? (
                  <AppText style={viewStyles.textBlockContent}>
                    {child.birthmarksDescription}
                  </AppText>
                ) : null}
                <FeatureImageStrip images={child.birthmarkImageUris} />
              </View>
              )}

            {child.hasScars === "yes" &&
              (child.scarsDescription || child.scarImageUris?.length) && (
              <View style={viewStyles.contactCard}>
                <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                  Scars
                </AppText>
                {child.scarsDescription ? (
                  <AppText style={viewStyles.textBlockContent}>
                    {child.scarsDescription}
                  </AppText>
                ) : null}
                <FeatureImageStrip images={child.scarImageUris} />
              </View>
              )}

            {child.hasIdentifyingFeatures === "yes" &&
              (child.identifyingFeaturesDescription ||
                child.identifyingFeatureImageUris?.length) && (
                <View style={viewStyles.contactCard}>
                  <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                    Other Identifying Features
                  </AppText>
                  {child.identifyingFeaturesDescription ? (
                    <AppText style={viewStyles.textBlockContent}>
                      {child.identifyingFeaturesDescription}
                    </AppText>
                  ) : null}
                  <FeatureImageStrip images={child.identifyingFeatureImageUris} />
                </View>
              )}

            <InfoRow
              label="Last Known Location"
              value={child.lastKnownLocation}
            />
            {child.schoolDaycareType && child.schoolDaycareType !== "none" && (
              <InfoRow
                label={
                  child.schoolDaycareType === "school" ? "School" : "Daycare"
                }
                value={child.schoolDaycareName}
              />
            )}
            <InfoRow label="Sports Teams" value={child.sportsTeams} />
          </Section>
        )}

        {/* Parents Information */}
        {hasParentsInfo && (
          <Section title="Parents Information">
            {(child.parent1Name ||
              child.parent1Address ||
              child.parent1Phone) && (
              <View style={viewStyles.contactCard}>
                <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                  Parent 1
                </AppText>
                <InfoRow label="Name" value={child.parent1Name} />
                <InfoRow label="Address" value={child.parent1Address} />
                <InfoRow label="Phone" value={child.parent1Phone} />
              </View>
            )}

            {(child.parent2Name ||
              child.parent2Address ||
              child.parent2Phone) && (
              <View style={viewStyles.contactCard}>
                <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
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
        {child.emergencyContacts && child.emergencyContacts.length > 0 && (
          <Section title="Emergency Contacts">
            {child.emergencyContacts.map((contact, index) => (
              <View key={index} style={viewStyles.contactCard}>
                <AppText variant="fieldLabel" style={viewStyles.contactTitle}>
                  Contact {index + 1}
                </AppText>
                <InfoRow label="Name" value={contact.name} />
                <InfoRow label="Relationship" value={contact.relationship} />
                <InfoRow label="Phone" value={contact.phone} />
                <InfoRow label="Sex" value={contact.sex} />
                <InfoRow label="Address" value={contact.address} />
              </View>
            ))}
          </Section>
        )}

        {/* Passport Button */}
        <TouchableOpacity
          style={viewStyles.passportButton}
          onPress={() => setShowPassport(true)}
        >
          <IconSymbol name="doc.text" size={20} color={colors.white} />
          <AppText style={viewStyles.passportButtonText}>
            Generate Passport
          </AppText>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Passport Modal */}
      <Modal
        visible={showPassport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPassport(false)}
      >
        <View style={viewStyles.modalContainer}>
          <View style={viewStyles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPassport(false)}
              style={viewStyles.closeButton}
            >
              <AppText style={viewStyles.closeButtonText}>✕ Close</AppText>
            </TouchableOpacity>
          </View>
          {child && (
            <ChildPassportCard
              child={
                {
                  ...child,
                  id: child.id || id || "unknown",
                } as any
              }
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ... viewStyles remain the same as your original file
const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 28,
    color: colors.secondary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: typography.large,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.secondaryBorder,
    marginBottom: spacing.lg,
    overflow: "hidden", // Added to ensure image doesn't bleed out
  },
  childName: {
    fontSize: typography.title,
    fontWeight: "600",
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
    fontWeight: "700",
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
    fontWeight: "500",
  },
  textBlockContent: {
    fontSize: typography.default,
    color: colors.textPrimary,
    lineHeight: 22,
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
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featurePhotosRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: "wrap",
  },
  featurePhotoThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputBackground,
  },
  passportButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  passportButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: typography.default,
    fontWeight: "600",
  },
});
