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
<<<<<<< HEAD
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
=======
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
>>>>>>> dev
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

<<<<<<< HEAD
function FeatureImageStrip({
  images,
  onImagePress,
}: {
  images?: string[];
  onImagePress: (images: string[], index: number) => void;
}) {
  if (!images || images.length === 0) return null;

  return (
    <View style={viewStyles.featurePhotosRow}>
      {images.slice(0, 3).map((uri, index) => (
        <TouchableOpacity
          key={`${uri}-${index}`}
          onPress={() => onImagePress(images, index)}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri }}
            style={viewStyles.featurePhotoThumb}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
=======
// Subtle sub-group label
function GroupLabel({ title }: { title: string }) {
  return <AppText style={styles.groupLabel}>{title}</AppText>;
>>>>>>> dev
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
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  const openImageViewer = useCallback((images: string[], index: number) => {
    if (!images.length) return;
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

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
<<<<<<< HEAD
  }, [id, loadChild]);
=======
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
>>>>>>> dev

  if (loading) {
    return (
      <View style={styles.container}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

<<<<<<< HEAD
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
              <TouchableOpacity
                onPress={() => openImageViewer([child.imageUri!], 0)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: child.imageUri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                />
              </TouchableOpacity>
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
                <FeatureImageStrip
                  images={child.birthmarkImageUris}
                  onImagePress={openImageViewer}
                />
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
                <FeatureImageStrip
                  images={child.scarImageUris}
                  onImagePress={openImageViewer}
                />
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
                  <FeatureImageStrip
                    images={child.identifyingFeatureImageUris}
                    onImagePress={openImageViewer}
                  />
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

      {/* Fullscreen Image Viewer */}
      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={viewStyles.imageViewerOverlay}>
          <View style={viewStyles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              style={viewStyles.imageViewerCloseButton}
            >
              <AppText style={viewStyles.imageViewerCloseText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: viewerIndex * screenWidth, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const x = event.nativeEvent.contentOffset.x;
              const nextIndex = Math.round(x / screenWidth);
              setViewerIndex(nextIndex);
            }}
            style={viewStyles.imageViewerScroll}
          >
            {viewerImages.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[viewStyles.imageViewerPage, { width: screenWidth }]}
              >
                <Image
                  source={{ uri }}
                  style={viewStyles.imageViewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {viewerImages.length > 1 && (
            <View style={viewStyles.imageViewerCounterWrap}>
              <AppText style={viewStyles.imageViewerCounterText}>
                {viewerIndex + 1} / {viewerImages.length}
              </AppText>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ... viewStyles remain the same as your original file
const viewStyles = StyleSheet.create({
=======
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
>>>>>>> dev
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    padding: spacing.xxl,
  },
<<<<<<< HEAD
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
=======

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
>>>>>>> dev
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
<<<<<<< HEAD
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
=======
    fontSize: typography.default,
    fontWeight: '700',
    color: palette.navyLight,
    letterSpacing: -0.1,
    marginBottom: spacing.sm,
>>>>>>> dev
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
<<<<<<< HEAD
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
=======
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
>>>>>>> dev
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
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },
  imageViewerHeader: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: "flex-end",
  },
  imageViewerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  imageViewerCloseText: {
    color: colors.white,
    fontSize: typography.default,
    fontWeight: "700",
  },
  imageViewerScroll: {
    flex: 1,
  },
  imageViewerPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: {
    width: "100%",
    height: "85%",
  },
  imageViewerCounterWrap: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  imageViewerCounterText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "600",
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
