import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/constants/theme";
import { ChildProfile } from "@/types/child";

const EXPORT_W = 1080;
const EXPORT_H = 1680;
const IDENTIFYING_TILE_SIZE = 149;
const { width: screenWidth } = Dimensions.get("window");
const PREVIEW_W = Math.max(280, screenWidth - 32);
const PREVIEW_SCALE = PREVIEW_W / EXPORT_W;
const PREVIEW_H = EXPORT_H * PREVIEW_SCALE;

type ExtendedChildProfile = ChildProfile & {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: string;
  ethnicity?: string;
  lifeThreatAllergies?: string;
  emergencyMedications?: string;
  communicationNeeds?: string;
  communicationNeedsOther?: string;
  languageSpoken?: string;
  unitSystem?: string;
  otherMedicalNotes?: string;
  skinColor?: string;
  skinColorOther?: string;
  heightFeet?: number;
  heightInches?: number;
  hasTrackingDevice?: string;
  trackingDeviceType?: string;
  trackingDeviceTypeOther?: string;
  trackingDeviceDetails?: string;
  schoolDaycareType?: string;
  schoolDaycareName?: string;
  sportsTeams?: string;
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
  guardian1?: { name?: string; phone?: string; address?: string };
  guardian2?: { name?: string; phone?: string; address?: string };
};

type Item = { label: string; value?: string | null };

interface Props {
  child: ChildProfile;
  onCapture?: (uri: string) => void;
}

const formatChoice = (value?: string | null) =>
  value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

const normalizeDate = (value?: string | null) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

const computeAge = (dob?: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
    age--;
  return age >= 0 ? age : null;
};

const boolToYesNo = (value?: boolean) => {
  if (value === undefined || value === null) return null;
  return value ? "Yes" : "No";
};

function InfoSection({ title, items }: { title: string; items: Item[] }) {
  const visible = items.filter(
    (item) => item.value && String(item.value).trim().length > 0,
  );
  if (visible.length === 0) return null;

  return (
    <View style={styles.sectionCard}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {visible.map((item, index) => (
        <View
          key={`${title}-${item.label}-${index}`}
          style={[
            styles.row,
            index < visible.length - 1 ? styles.rowBorder : undefined,
          ]}
        >
          <AppText style={styles.rowLabel}>{item.label}</AppText>
          <AppText style={styles.rowValue}>{item.value}</AppText>
        </View>
      ))}
    </View>
  );
}

function EmptyThumb() {
  return (
    <View style={styles.thumbEmpty}>
      <AppText style={styles.thumbEmptyText}>No Photo</AppText>
    </View>
  );
}

export function ChildPassportCard({ child, onCapture }: Props) {
  const [capturing, setCapturing] = useState(false);
  const exportRef = useRef<ViewShot>(null);

  const profile = child as ExtendedChildProfile;

  const displayName =
    child.fullName ||
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    "Unnamed Child";
  const displayDob = normalizeDate(profile.dateOfBirth);
  const displayAge = child.age ?? computeAge(profile.dateOfBirth);
  const displaySex = profile.sex || child.gender || null;
  const displayEyeColor =
    profile.eyeColor === "other" ? profile.eyeColorOther : profile.eyeColor;
  const displayHairColor =
    profile.hairColor === "other" ? profile.hairColorOther : profile.hairColor;
  const displayMedicalNotes =
    profile.otherMedicalNotes || child.medicalNotes || null;

  const guardian1 = profile.guardian1 ?? {
    name: child.parent1Name,
    phone: child.parent1Phone,
    address: child.parent1Address,
  };
  const guardian2 = profile.guardian2 ?? {
    name: child.parent2Name,
    phone: child.parent2Phone,
    address: child.parent2Address,
  };

  const featurePhotos = useMemo(
    () => [
      ...(child.birthmarkImageUris || []),
      ...(child.scarImageUris || []),
      ...(child.identifyingFeatureImageUris || []),
    ],
    [
      child.birthmarkImageUris,
      child.identifyingFeatureImageUris,
      child.scarImageUris,
    ],
  );

  const schoolLabel =
    profile.schoolDaycareType === "daycare"
      ? "Daycare"
      : profile.schoolDaycareType === "school"
        ? "School"
        : null;

  const displaySkinColor =
    profile.skinColor === "other" ? profile.skinColorOther : profile.skinColor;

  const displayHeight =
    profile.unitSystem === "metric"
      ? (child.height ? `${child.height} cm` : null)
      : profile.heightFeet != null
        ? `${profile.heightFeet} ft ${profile.heightInches ?? 0} in`
        : child.height
          ? `${child.height} cm`
          : null;

  const displayWeight = child.weight
    ? `${child.weight} ${profile.unitSystem === "metric" ? "kg" : "lbs"}`
    : null;

  const displayTrackingDevice =
    profile.hasTrackingDevice === "yes"
      ? profile.trackingDeviceType === "other"
        ? profile.trackingDeviceTypeOther
        : profile.trackingDeviceType
      : null;

  const identityItems: Item[] = [
    { label: "Full Name", value: displayName },
    { label: "Date of Birth", value: displayDob },
    {
      label: "Age",
      value:
        displayAge !== null && displayAge !== undefined
          ? `${displayAge} years`
          : null,
    },
    { label: "Sex", value: displaySex },
    { label: "Ethnicity", value: profile.ethnicity },
    { label: "Skin Color", value: formatChoice(displaySkinColor) },
    { label: "Language(s) Spoken", value: profile.languageSpoken },
    { label: "Height", value: displayHeight },
    { label: "Weight", value: displayWeight },
    { label: "Tracking Device", value: formatChoice(displayTrackingDevice) },
    { label: "Device Details", value: profile.hasTrackingDevice === "yes" ? profile.trackingDeviceDetails : null },
  ];

  const medicalItems: Item[] = [
    { label: "Life-Threat Allergies", value: profile.lifeThreatAllergies },
    { label: "Emergency Medications", value: profile.emergencyMedications },
    {
      label: "Communication",
      value:
        profile.communicationNeeds === "other"
          ? profile.communicationNeedsOther
          : formatChoice(profile.communicationNeeds),
    },
    { label: "Other Medical Notes", value: displayMedicalNotes },
    {
      label: "Birthmarks",
      value: child.hasBirthmarks
        ? child.hasBirthmarks === "yes"
          ? "Yes"
          : "No"
        : null,
    },
    {
      label: "Birthmarks Description",
      value: child.hasBirthmarks === "yes" ? child.birthmarksDescription : null,
    },
    {
      label: "Scars",
      value: child.hasScars ? (child.hasScars === "yes" ? "Yes" : "No") : null,
    },
    {
      label: "Scars Description",
      value: child.hasScars === "yes" ? child.scarsDescription : null,
    },
    {
      label: "Other Features",
      value: child.hasIdentifyingFeatures
        ? child.hasIdentifyingFeatures === "yes"
          ? "Yes"
          : "No"
        : null,
    },
    {
      label: "Other Features Description",
      value:
        child.hasIdentifyingFeatures === "yes"
          ? child.identifyingFeaturesDescription
          : null,
    },
  ];

  const visualItems: Item[] = [
    { label: "Eye Color", value: displayEyeColor },
    { label: "Hair Color", value: displayHairColor },
    { label: "Hair Style", value: profile.hairStyle },
    { label: "Wearing Headwear", value: boolToYesNo(profile.hasHat) },
    {
      label: "Headwear Color",
      value: profile.hasHat ? profile.hatColor : null,
    },
    { label: "Headwear Type", value: profile.hasHat ? profile.hatStyle : null },
    { label: "Top / Shirt", value: profile.topColor },
    { label: "Pants / Bottom", value: profile.pantsColor },
    { label: "Shoes Color", value: profile.shoesColor },
    { label: "Shoes Type", value: profile.shoesType },
    { label: "Wears Glasses", value: boolToYesNo(profile.hasGlasses) },
    { label: "Wears Hearing Aids", value: boolToYesNo(profile.hasHearingAids) },
    { label: "Other Sensory Needs", value: profile.otherSensoryNeeds },
  ];

  const locationItems: Item[] = [
    { label: "Last Known Location", value: child.lastKnownLocation },
    {
      label: schoolLabel || "School / Daycare",
      value: schoolLabel ? profile.schoolDaycareName : null,
    },
    { label: "Sports Teams", value: profile.sportsTeams },
  ];

  const guardianItems: Item[] = [
    { label: "Primary Contact 1", value: guardian1.name },
    { label: "Contact 1 Phone", value: guardian1.phone },
    { label: "Contact 1 Address", value: guardian1.address },
    { label: "Primary Contact 2", value: guardian2.name },
    { label: "Contact 2 Phone", value: guardian2.phone },
    { label: "Contact 2 Address", value: guardian2.address },
  ];

  const emergencyItems: Item[] = (child.emergencyContacts || []).flatMap(
    (contact, index) => [
      { label: `Contact ${index + 1} Name`, value: contact.name },
      { label: `Contact ${index + 1} Relation`, value: contact.relationship },
      { label: `Contact ${index + 1} Phone`, value: contact.phone },
      { label: `Contact ${index + 1} Address`, value: contact.address },
      { label: `Contact ${index + 1} Sex`, value: contact.sex },
    ],
  );

  const doCapture = async (): Promise<string | null> => {
    try {
      setCapturing(true);
      const uri = await exportRef.current?.capture?.();
      if (!uri) throw new Error("Capture failed");
      onCapture?.(uri);
      return uri;
    } catch {
      Alert.alert("Error", "Failed to generate passport image");
      return null;
    } finally {
      setCapturing(false);
    }
  };

  const share = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing not available");
      return;
    }
    const uri = await doCapture();
    if (uri) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: `${displayName} Passport`,
      });
    }
  };

  const save = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow photo access to save image");
      return;
    }
    const uri = await doCapture();
    if (!uri) return;
    const asset = await MediaLibrary.createAssetAsync(uri);
    let album = await MediaLibrary.getAlbumAsync("ChildGuard");
    if (!album) await MediaLibrary.createAlbumAsync("ChildGuard", asset, false);
    else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    Alert.alert("Saved", "Passport image saved to ChildGuard album");
  };

  const Poster = (
    <View style={styles.posterRoot}>
      <View style={styles.header}>
        <View>
          <AppText style={styles.title}>Child Safety Passport</AppText>
          <AppText style={styles.subtitle}>Generated by ChildGuard</AppText>
        </View>
        <View style={styles.idChip}>
          <AppText style={styles.idChipText}>
            ID {child.id?.slice(0, 8) || "N/A"}
          </AppText>
        </View>
      </View>

      <View style={styles.photoRow}>
        <View style={styles.mainPhotoWrap}>
          {child.imageUri ? (
            <Image
              source={{ uri: child.imageUri }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mainPhotoEmpty}>
              <AppText style={styles.mainPhotoEmptyText}>No Main Photo</AppText>
            </View>
          )}
        </View>

        <View style={styles.sidePhotosWrap}>
          <AppText style={styles.sidePhotosTitle}>Identifying Photos</AppText>
          <View style={styles.sidePhotosGrid}>
            {featurePhotos.map((uri, index) => (
              <Image
                key={`${uri}-${index}`}
                source={{ uri }}
                style={styles.thumb}
              />
            ))}
            {featurePhotos.length === 0 && (
              <View style={styles.sidePhotosEmptyWrap}>
                <EmptyThumb />
                <EmptyThumb />
                <EmptyThumb />
                <EmptyThumb />
                <EmptyThumb />
                <EmptyThumb />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.sectionsGrid}>
        <InfoSection title="Identity" items={identityItems} />
        <InfoSection title="Medical & Feature Details" items={medicalItems} />
        <InfoSection title="Visual Description" items={visualItems} />
        <InfoSection title="Location & Activities" items={locationItems} />
        <InfoSection title="Primary Guardians" items={guardianItems} />
        <InfoSection title="Emergency Contacts" items={emergencyItems} />
      </View>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>
          For emergency response use only
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ViewShot
        ref={exportRef}
        options={{ format: "jpg", quality: 1 }}
        style={styles.exportHidden}
      >
        <View style={{ width: EXPORT_W, height: EXPORT_H }}>{Poster}</View>
      </ViewShot>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.previewScrollContent}
      >
        <View style={styles.previewFrame}>
          <View
            style={[
              styles.previewScaled,
              {
                transform: [
                  { translateX: -(EXPORT_W * (1 - PREVIEW_SCALE)) / 2 },
                  { translateY: -(EXPORT_H * (1 - PREVIEW_SCALE)) / 2 },
                  { scale: PREVIEW_SCALE },
                ],
              },
            ]}
          >
            <View style={{ width: EXPORT_W, height: EXPORT_H }}>{Poster}</View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={share}
            disabled={capturing}
            activeOpacity={0.85}
          >
            {capturing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <AppText style={styles.primaryBtnText}>Share Passport</AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={save}
            disabled={capturing}
            activeOpacity={0.85}
          >
            <AppText style={styles.secondaryBtnText}>Save to Gallery</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  exportHidden: {
    position: "absolute",
    left: -9999,
    top: 0,
  },
  previewScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  previewFrame: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  previewScaled: {
    width: EXPORT_W,
    height: EXPORT_H,
  },
  posterRoot: {
    flex: 1,
    backgroundColor: "#F5F8FC",
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#11253C",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "600",
    color: "#4B6685",
  },
  idChip: {
    backgroundColor: "#E6F0FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  idChipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2059A6",
    letterSpacing: 0.5,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 20,
  },
  mainPhotoWrap: {
    width: 488,
    height: 360,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#DDE7F5",
    borderWidth: 2,
    borderColor: "#C9D8EE",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  mainPhotoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainPhotoEmptyText: {
    fontSize: 24,
    color: "#6B7E95",
    fontWeight: "700",
  },
  sidePhotosWrap: {
    width: 488,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#D9E5F5",
    padding: 12,
  },
  sidePhotosTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B3554",
    marginBottom: 12,
  },
  sidePhotosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  thumb: {
    width: IDENTIFYING_TILE_SIZE,
    height: IDENTIFYING_TILE_SIZE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E2F3",
    backgroundColor: "#EEF4FB",
    marginBottom: 6,
  },
  sidePhotosEmptyWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  thumbEmpty: {
    width: IDENTIFYING_TILE_SIZE,
    height: IDENTIFYING_TILE_SIZE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E2F3",
    backgroundColor: "#EEF4FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  thumbEmptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#67809E",
  },
  sectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  sectionCard: {
    width: 488,
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#DCE7F4",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A385B",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DCE7F4",
  },
  rowLabel: {
    width: 190,
    fontSize: 13,
    color: "#56708D",
    fontWeight: "700",
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    color: "#1B2E46",
    fontWeight: "600",
  },
  footer: {
    marginTop: 14,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#607A99",
    fontWeight: "600",
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondaryBorder,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.secondary,
    fontWeight: "700",
    fontSize: 16,
  },
});
