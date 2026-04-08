import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenHeader } from "@/components/ui/screen-header";
import { palette } from "@/constants/theme";
import { colors, radius, spacing, typography } from "@/styles";
import { formatPhoneForDisplay } from "@/utils/phone";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ChildPassportCard } from "../components/child-passport";

type ChildProfile = {
  id?: string;
  fullName?: string;
  imageUri?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: string;
  ethnicity?: string;
  unitSystem?: string;
  height?: number;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  skinColor?: string;
  skinColorOther?: string;
  lifeThreatAllergies?: string;
  emergencyMedications?: string;
  communicationNeeds?: string;
  communicationNeedsOther?: string;
  languageSpoken?: string;
  otherMedicalNotes?: string;
  hasTrackingDevice?: string;
  trackingDeviceType?: string;
  trackingDeviceTypeOther?: string;
  trackingDeviceDetails?: string;
  guardian1?: { name?: string; phone?: string; address?: string };
  guardian2?: { name?: string; phone?: string; address?: string };
  emergencyContacts?: {
    name?: string;
    relationship?: string;
    phone?: string;
    address?: string;
    sex?: string;
  }[];
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
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean;
}) {
  if (value === undefined || value === null || value === "" || value === false)
    return null;
  const display = typeof value === "boolean" ? "Yes" : String(value);
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={styles.infoValue}>{display}</AppText>
    </View>
  );
}

function SectionHeading({ title, first }: { title: string; first?: boolean }) {
  return (
    <>
      {!first && <View style={styles.divider} />}
      <AppText style={styles.sectionTitle}>{title}</AppText>
    </>
  );
}

function GroupLabel({ title }: { title: string }) {
  return <AppText style={styles.groupLabel}>{title}</AppText>;
}

function FeatureImageStrip({
  title,
  images,
  onImagePress,
}: {
  title: string;
  images?: string[];
  onImagePress: (images: string[], index: number) => void;
}) {
  if (!images?.length) return null;
  return (
    <>
      <GroupLabel title={title} />
      <View style={styles.featurePhotosRow}>
        {images.slice(0, 3).map((uri, index) => (
          <TouchableOpacity
            key={`${uri}-${index}`}
            onPress={() => onImagePress(images, index)}
            activeOpacity={0.85}
          >
            <Image source={{ uri }} style={styles.featurePhotoThumb} />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

export default function ViewChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassport, setShowPassport] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const loadChild = async () => {
      if (!id) return;
      try {
        const json = await AsyncStorage.getItem("children_list");
        if (json) {
          const list = JSON.parse(json);
          const found = list.find((c: any) => c.id === id);
          if (found) {
            setChild(found);
            return;
          }
        }
        Alert.alert("Error", "Child profile not found");
        router.back();
      } catch {
        Alert.alert("Error", "Failed to load child profile");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadChild();
  }, [id, router]);

  const openImageViewer = (images: string[], index: number) => {
    if (!images.length) return;
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
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

  const displayName =
    child.fullName ||
    `${child.firstName ?? ""} ${child.lastName ?? ""}`.trim() ||
    "Unnamed Child";
  const eyeDisplay =
    child.eyeColor === "other" ? child.eyeColorOther : child.eyeColor;
  const hairDisplay =
    child.hairColor === "other" ? child.hairColorOther : child.hairColor;

  const hasLegacyFeatures =
    child.hasBirthmarks === "yes" ||
    child.hasScars === "yes" ||
    child.hasIdentifyingFeatures === "yes" ||
    child.hasBirthmarks === "no" ||
    child.hasScars === "no" ||
    child.hasIdentifyingFeatures === "no" ||
    !!child.birthmarkImageUris?.length ||
    !!child.scarImageUris?.length ||
    !!child.identifyingFeatureImageUris?.length ||
    !!child.lastKnownLocation ||
    !!child.sportsTeams ||
    !!child.schoolDaycareName ||
    (!!child.schoolDaycareType && child.schoolDaycareType !== "none");

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Child Profile"
        onLeftPress={() => router.back()}
        onRightPress={() => router.replace("/(tabs)")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <View style={styles.avatarCircle}>
              {child.imageUri ? (
                <TouchableOpacity
                  onPress={() => openImageViewer([child.imageUri!], 0)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: child.imageUri }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
              ) : (
                <IconSymbol name="person.fill" size={48} color={palette.blue} />
              )}
            </View>
            <AppText style={styles.childName}>{displayName}</AppText>
            {child.age !== undefined && (
              <AppText style={styles.childAge}>{child.age} years old</AppText>
            )}
          </View>

          <View style={styles.divider} />

          <SectionHeading title="Essential ID" first />
          <InfoRow label="Date of Birth" value={child.dateOfBirth} />
          <InfoRow label="Sex" value={child.sex} />
          <InfoRow label="Ethnicity" value={child.ethnicity} />
          <InfoRow
            label="Skin Color"
            value={
              child.skinColor === "other"
                ? child.skinColorOther
                : child.skinColor
            }
          />
          <InfoRow label="Language(s) Spoken" value={child.languageSpoken} />
          <InfoRow
            label="Height"
            value={
              child.unitSystem === "metric"
                ? child.height != null
                  ? `${child.height} cm`
                  : undefined
                : child.heightFeet != null
                  ? `${child.heightFeet} ft ${child.heightInches ?? 0} in`
                  : child.height != null
                    ? `${child.height} cm`
                    : undefined
            }
          />
          <InfoRow
            label="Weight"
            value={
              child.weight != null
                ? `${child.weight} ${child.unitSystem === "metric" ? "kg" : "lbs"}`
                : undefined
            }
          />
          {child.hasTrackingDevice === "yes" && (
            <>
              <GroupLabel title="Tracking Device" />
              <InfoRow
                label="Device Type"
                value={
                  child.trackingDeviceType === "other"
                    ? child.trackingDeviceTypeOther
                    : child.trackingDeviceType
                }
              />
              <InfoRow
                label="Device Details"
                value={child.trackingDeviceDetails}
              />
            </>
          )}

          {(child.lifeThreatAllergies ||
            child.emergencyMedications ||
            child.communicationNeeds ||
            child.otherMedicalNotes) && (
            <>
              <SectionHeading title="Medical" />
              <InfoRow
                label="Life-Threatening Allergies"
                value={child.lifeThreatAllergies}
              />
              <InfoRow
                label="Emergency Medications"
                value={child.emergencyMedications}
              />
              <InfoRow
                label="Communication Needs"
                value={
                  child.communicationNeeds === "other"
                    ? child.communicationNeedsOther
                    : child.communicationNeeds
                }
              />
              <InfoRow
                label="Other Medical Notes"
                value={child.otherMedicalNotes}
              />
            </>
          )}

          <SectionHeading title="Contacts" />
          {child.guardian1?.name && (
            <>
              <GroupLabel title="Primary Contact 1" />
              <InfoRow label="Name" value={child.guardian1.name} />
              <InfoRow
                label="Phone"
                value={formatPhoneForDisplay(child.guardian1.phone)}
              />
              <InfoRow label="Address" value={child.guardian1.address} />
            </>
          )}
          {child.guardian2?.name && (
            <>
              <GroupLabel title="Primary Contact 2" />
              <InfoRow label="Name" value={child.guardian2.name} />
              <InfoRow
                label="Phone"
                value={formatPhoneForDisplay(child.guardian2.phone)}
              />
              <InfoRow label="Address" value={child.guardian2.address} />
            </>
          )}
          {child.emergencyContacts?.length ? (
            <>
              <GroupLabel title="Additional Emergency Contacts" />
              {child.emergencyContacts.map((contact, index) => (
                <View
                  key={index}
                  style={index > 0 ? styles.contactSpacer : undefined}
                >
                  <AppText style={styles.contactIndex}>
                    Contact {index + 1}
                  </AppText>
                  <InfoRow label="Name" value={contact.name} />
                  <InfoRow label="Relationship" value={contact.relationship} />
                  <InfoRow
                    label="Phone"
                    value={formatPhoneForDisplay(contact.phone)}
                  />
                  <InfoRow label="Address" value={contact.address} />
                  <InfoRow label="Sex" value={contact.sex} />
                </View>
              ))}
            </>
          ) : null}

          <SectionHeading title="Visual ID" />
          <GroupLabel title="Appearance" />
          <InfoRow label="Eye Color" value={eyeDisplay} />
          <InfoRow label="Hair Color" value={hairDisplay} />
          <InfoRow label="Hair Style" value={child.hairStyle} />

          <GroupLabel title="Clothing" />
          <InfoRow label="Top / Shirt" value={child.topColor} />
          <InfoRow label="Pants / Bottom" value={child.pantsColor} />
          <InfoRow label="Shoes Color" value={child.shoesColor} />
          <InfoRow label="Shoes Type" value={child.shoesType} />
          {child.hasHat && (
            <>
              <InfoRow label="Hat Color" value={child.hatColor} />
              <InfoRow label="Hat Style" value={child.hatStyle} />
            </>
          )}

          {(child.hasGlasses ||
            child.hasHearingAids ||
            child.otherSensoryNeeds) && (
            <>
              <GroupLabel title="Sensory Needs" />
              <InfoRow label="Wears Glasses" value={child.hasGlasses} />
              <InfoRow
                label="Wears Hearing Aids"
                value={child.hasHearingAids}
              />
              <InfoRow label="Other" value={child.otherSensoryNeeds} />
            </>
          )}

          {hasLegacyFeatures && (
            <>
              <SectionHeading title="Additional Identifying Features" />

              <InfoRow
                label="Has Birthmarks"
                value={
                  child.hasBirthmarks
                    ? child.hasBirthmarks === "yes"
                      ? "Yes"
                      : "No"
                    : undefined
                }
              />

              {child.hasBirthmarks === "yes" || child.birthmarksDescription ? (
                <>
                  <GroupLabel title="Birthmarks" />
                  <InfoRow
                    label="Description"
                    value={child.birthmarksDescription}
                  />
                </>
              ) : null}
              <FeatureImageStrip
                title="Birthmark Photos"
                images={child.birthmarkImageUris}
                onImagePress={openImageViewer}
              />

              <InfoRow
                label="Has Scars"
                value={
                  child.hasScars
                    ? child.hasScars === "yes"
                      ? "Yes"
                      : "No"
                    : undefined
                }
              />

              {child.hasScars === "yes" || child.scarsDescription ? (
                <>
                  <GroupLabel title="Scars" />
                  <InfoRow label="Description" value={child.scarsDescription} />
                </>
              ) : null}
              <FeatureImageStrip
                title="Scar Photos"
                images={child.scarImageUris}
                onImagePress={openImageViewer}
              />

              <InfoRow
                label="Has Other Features"
                value={
                  child.hasIdentifyingFeatures
                    ? child.hasIdentifyingFeatures === "yes"
                      ? "Yes"
                      : "No"
                    : undefined
                }
              />

              {child.hasIdentifyingFeatures === "yes" ||
              child.identifyingFeaturesDescription ? (
                <>
                  <GroupLabel title="Other Features" />
                  <InfoRow
                    label="Description"
                    value={child.identifyingFeaturesDescription}
                  />
                </>
              ) : null}
              <FeatureImageStrip
                title="Other Feature Photos"
                images={child.identifyingFeatureImageUris}
                onImagePress={openImageViewer}
              />

              <InfoRow
                label="Last Known Location"
                value={child.lastKnownLocation}
              />
              {child.schoolDaycareType && child.schoolDaycareType !== "none" ? (
                <>
                  <InfoRow
                    label="School / Daycare Type"
                    value={
                      child.schoolDaycareType === "school"
                        ? "School"
                        : "Daycare"
                    }
                  />
                  <InfoRow
                    label={
                      child.schoolDaycareType === "school"
                        ? "School Name"
                        : "Daycare Name"
                    }
                    value={child.schoolDaycareName}
                  />
                </>
              ) : null}
              <InfoRow label="Sports Teams" value={child.sportsTeams} />
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.passportButton}
          onPress={() => setShowPassport(true)}
        >
          <IconSymbol name="doc.text" size={20} color={colors.white} />
          <AppText style={styles.passportButtonText}>Generate Passport</AppText>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showPassport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPassport(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowPassport(false)}
              style={styles.closeButton}
            >
              <AppText style={styles.closeButtonText}>✕ Close</AppText>
            </TouchableOpacity>
          </View>
          <ChildPassportCard
            child={
              {
                ...child,
                id: child.id || id || "unknown",
              } as any
            }
          />
        </View>
      </Modal>

      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              style={styles.imageViewerCloseButton}
            >
              <AppText style={styles.imageViewerCloseText}>✕</AppText>
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
            style={styles.imageViewerScroll}
          >
            {viewerImages.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={[styles.imageViewerPage, { width: screenWidth }]}
              >
                <Image
                  source={{ uri }}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {viewerImages.length > 1 && (
            <View style={styles.imageViewerCounterWrap}>
              <AppText style={styles.imageViewerCounterText}>
                {viewerIndex + 1} / {viewerImages.length}
              </AppText>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    padding: spacing.xxl,
  },
  avatar: {
    alignItems: "center",
    paddingBottom: spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: "700",
    color: palette.navy,
    textAlign: "center",
  },
  childAge: {
    fontSize: typography.small,
    fontWeight: "500",
    color: palette.navy,
    marginTop: 2,
  },
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
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.default,
    fontWeight: "700",
    color: palette.navyLight,
    letterSpacing: -0.1,
    marginBottom: spacing.sm,
  },
  groupLabel: {
    fontSize: typography.tiny,
    fontWeight: "600",
    color: palette.teal,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.body,
    color: palette.navyLight,
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },
  contactIndex: {
    fontSize: typography.small,
    fontWeight: "600",
    color: palette.navyLight,
    marginBottom: spacing.xs,
  },
  contactSpacer: {
    marginTop: spacing.sm,
  },
  featurePhotosRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
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
    marginTop: spacing.lg,
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
});
