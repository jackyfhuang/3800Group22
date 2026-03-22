import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/constants/theme";
import { ChildProfile } from "@/types/child";

// ─── Design tokens ─────────────────────────────────────────────────────────────
// All slides share this locked system — nothing deviates from it.

const DS = {
  // Palette
  ink: "#111318", // primary text
  inkMid: "#5A5F6E", // secondary text / labels
  inkLight: "#9EA5B5", // tertiary / placeholders
  surface: "#F7F8FA", // slide background
  white: "#FFFFFF",
  border: "#E4E7EE", // subtle dividers
  accent: colors.primary, // interactive / accent (from app theme)

  // Slide accent tints (one per slide — same saturation level)
  tints: {
    photo: { bg: "#111318", text: "#FFFFFF" }, // dark/photo
    details: {
      bg: "#F7F8FA",
      pill: "#EEF2FF",
      dot: "#4F6BED",
    },
    medical: {
      bg: "#F7F8FA",
      pill: "#FFF0F0",
      dot: "#E05252",
    },
    contacts: {
      bg: "#F7F8FA",
      pill: "#EDFAF3",
      dot: "#35B57B",
    },
  },

  // Typography (numeric px)
  size: {
    hero: 28,
    title: 17,
    base: 14,
    small: 12,
    micro: 10,
  },

  // Spacing multiplier
  sp: (n: number) => n * 4,

  // Border radius
  card: 20,
  pill: 8,
  chip: 6,
};

// ─── Dimensions ────────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 40;
const CARD_H = CARD_W * 1.38;

// ─── Types ─────────────────────────────────────────────────────────────────────

type SlideKey = "photo" | "details" | "medical" | "contacts";
const SLIDE_KEYS: SlideKey[] = ["photo", "details", "medical", "contacts"];

interface Props {
  child: ChildProfile;
  onCapture?: (uri: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ChildPassportCard({ child, onCapture }: Props) {
  const [idx, setIdx] = useState(0);
  const [capturing, setCapturing] = useState(false);

  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const exportRef = useRef<ViewShot>(null);

  const profile = child as ChildProfile & {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    sex?: string;
    ethnicity?: string;
    lifeThreatAllergies?: string;
    emergencyMedications?: string;
    communicationNeeds?: string;
    languageSpoken?: string;
    otherMedicalNotes?: string;
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

  const formatChoice = (value?: string | null) =>
    value
      ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  const normalizeDate = (value?: string | null) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split("T")[0];
  };

  const computeAge = (dob?: string | null) => {
    if (!dob) return null;
    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()))
      age--;
    return age >= 0 ? age : null;
  };

  const boolToYesNo = (value?: boolean) => {
    if (value === undefined || value === null) return null;
    return value ? "Yes" : "No";
  };

  const displayName =
    child.fullName ||
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    "—";
  const displaySex = profile.sex || child.gender || null;
  const displayDob = normalizeDate(profile.dateOfBirth);
  const displayAge = child.age ?? computeAge(profile.dateOfBirth);
  const displayMedicalNotes =
    profile.otherMedicalNotes || child.medicalNotes || null;
  const displayEyeColor =
    profile.eyeColor === "other" ? profile.eyeColorOther : profile.eyeColor;
  const displayHairColor =
    profile.hairColor === "other" ? profile.hairColorOther : profile.hairColor;
  const displaySchoolLabel =
    profile.schoolDaycareType === "daycare"
      ? "Daycare"
      : profile.schoolDaycareType === "school"
        ? "School"
        : null;

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

  const transition = useCallback(
    (next: number, dir: "left" | "right") => {
      const out = dir === "left" ? -24 : 24;
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: out,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateX.setValue(-out);
        setIdx(next);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [opacity, translateX],
  );

  // Auto-advance
  useEffect(() => {
    const t = setInterval(
      () => transition((idx + 1) % SLIDE_KEYS.length, "left"),
      5000,
    );
    return () => clearInterval(t);
  }, [idx, transition]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 12,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40 && idx < SLIDE_KEYS.length - 1)
          transition(idx + 1, "left");
        else if (g.dx > 40 && idx > 0) transition(idx - 1, "right");
      },
    }),
  ).current;

  // ── Shared slide shell ──────────────────────────────────────────────────────
  // Every content slide (non-photo) uses this wrapper for identical padding/header

  const InfoShell = ({
    slideKey,
    label,
    children,
  }: {
    slideKey: Exclude<SlideKey, "photo">;
    label: string;
    children: React.ReactNode;
  }) => {
    const dot = DS.tints[slideKey].dot;
    const pill = DS.tints[slideKey].pill;
    return (
      <View
        style={[
          shell.wrap,
          {
            backgroundColor: DS.tints[slideKey].bg,
          },
        ]}
      >
        {/* Section label pill */}
        <View style={[shell.pill, { backgroundColor: pill }]}>
          <View style={[shell.pillDot, { backgroundColor: dot }]} />
          <AppText style={[shell.pillText, { color: dot }]}>{label}</AppText>
        </View>
        {children}
      </View>
    );
  };

  const shell = StyleSheet.create({
    wrap: {
      flex: 1,
      paddingTop: DS.sp(14), // 56 — clears the progress bar
      paddingHorizontal: DS.sp(6),
      paddingBottom: DS.sp(5),
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderRadius: 100,
      paddingHorizontal: DS.sp(3),
      paddingVertical: DS.sp(1.5),
      marginBottom: DS.sp(5),
      gap: DS.sp(1.5),
    },
    pillDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    pillText: {
      fontSize: DS.size.micro,
      fontWeight: "700",
      letterSpacing: 1.2,
    },
  });

  // ── Row — reusable label+value row ──────────────────────────────────────────

  const Row = ({
    label,
    value,
    last,
  }: {
    label: string;
    value?: string | number | null;
    last?: boolean;
  }) => {
    if (!value) return null;
    return (
      <View style={[rowSt.row, !last && rowSt.rowBorder]}>
        <AppText style={rowSt.label}>{label}</AppText>
        <AppText style={rowSt.value} numberOfLines={2}>
          {String(value)}
        </AppText>
      </View>
    );
  };

  const rowSt = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: DS.sp(3),
      gap: DS.sp(3),
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: DS.border,
    },
    label: {
      fontSize: DS.size.micro,
      color: DS.inkLight,
      fontWeight: "600",
      letterSpacing: 0.6,
      width: 80,
      paddingTop: 2,
    },
    value: {
      fontSize: DS.size.base,
      color: DS.ink,
      fontWeight: "500",
      flex: 1,
      lineHeight: 20,
    },
  });

  // ── Block — colored callout block ───────────────────────────────────────────

  const Block = ({
    icon,
    title,
    accentColor,
    bgColor,
    children,
  }: {
    icon: string;
    title: string;
    accentColor: string;
    bgColor: string;
    children: React.ReactNode;
  }) => (
    <View
      style={[
        blk.wrap,
        {
          backgroundColor: bgColor,
          borderLeftColor: accentColor,
        },
      ]}
    >
      <View style={blk.titleRow}>
        <AppText style={blk.icon}>{icon}</AppText>
        <AppText style={[blk.title, { color: accentColor }]}>{title}</AppText>
      </View>
      {children}
    </View>
  );

  const blk = StyleSheet.create({
    wrap: {
      borderLeftWidth: 3,
      borderRadius: DS.pill,
      padding: DS.sp(4),
      marginBottom: DS.sp(3),
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: DS.sp(2),
      marginBottom: DS.sp(2),
    },
    icon: { fontSize: 16 },
    title: {
      fontSize: DS.size.small,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
  });

  // ── Slide: Photo ────────────────────────────────────────────────────────────

  const SlidePhoto = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: DS.tints.photo.bg,
      }}
    >
      {child.imageUri ? (
        <Image
          source={{ uri: child.imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, ph.placeholder]}>
          <AppText style={ph.icon}>📷</AppText>
          <AppText style={ph.none}>No Photo</AppText>
        </View>
      )}
      {/* scrim */}
      <View style={ph.scrim} />
      <View style={ph.meta}>
        <AppText style={ph.name} numberOfLines={2}>
          {displayName}
        </AppText>
        {displayAge !== null && displayAge !== undefined ? (
          <View style={ph.tagRow}>
            <View style={ph.tag}>
              <AppText style={ph.tagText}>{displayAge} yrs</AppText>
            </View>
            {displaySex ? (
              <View style={ph.tag}>
                <AppText style={ph.tagText}>{displaySex}</AppText>
              </View>
            ) : null}
            {child.height ? (
              <View style={ph.tag}>
                <AppText style={ph.tagText}>{child.height} cm</AppText>
              </View>
            ) : null}
          </View>
        ) : null}
        <AppText style={ph.id}>
          ID · {child.id?.substring(0, 8) || "N/A"}
        </AppText>
      </View>
    </View>
  );

  const ph = StyleSheet.create({
    placeholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    icon: { fontSize: 52 },
    none: {
      fontSize: DS.size.base,
      color: "rgba(255,255,255,0.4)",
      marginTop: DS.sp(2),
    },
    scrim: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 220,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    meta: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: DS.sp(6),
    },
    name: {
      fontSize: DS.size.hero,
      fontWeight: "800",
      color: DS.white,
      lineHeight: 34,
      marginBottom: DS.sp(3),
    },
    tagRow: {
      flexDirection: "row",
      gap: DS.sp(2),
      marginBottom: DS.sp(3),
      flexWrap: "wrap",
    },
    tag: {
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 100,
      paddingHorizontal: DS.sp(3),
      paddingVertical: DS.sp(1),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    tagText: {
      fontSize: DS.size.small,
      color: DS.white,
      fontWeight: "600",
    },
    id: {
      fontSize: DS.size.micro,
      color: "rgba(255,255,255,0.38)",
      letterSpacing: 1.5,
    },
  });

  // ── Slide: Details ──────────────────────────────────────────────────────────

  const SlideDetails = () => (
    <InfoShell slideKey="details" label="PERSONAL DETAILS">
      <Row label="Full name" value={displayName} />
      <Row label="Date of Birth" value={displayDob} />
      <Row
        label="Age"
        value={
          displayAge !== null && displayAge !== undefined
            ? `${displayAge} years old`
            : null
        }
      />
      <Row label="Sex" value={displaySex} />
      <Row label="Ethnicity" value={profile.ethnicity} />
      <Row label="Height" value={child.height ? `${child.height} cm` : null} />
      <Row label="Weight" value={child.weight ? `${child.weight} kg` : null} />
      <Row
        label="Communication"
        value={formatChoice(profile.communicationNeeds)}
      />
      <Row
        label="Language"
        value={
          profile.communicationNeeds === "language_barrier"
            ? profile.languageSpoken
            : null
        }
      />
      <Row label="Eye Color" value={displayEyeColor} />
      <Row label="Hair Color" value={displayHairColor} />
      <Row label="Hair Style" value={profile.hairStyle} />
      <Row label="Wearing Headwear" value={boolToYesNo(profile.hasHat)} />
      <Row
        label="Headwear Color"
        value={profile.hasHat ? profile.hatColor : null}
      />
      <Row
        label="Headwear Type"
        value={profile.hasHat ? profile.hatStyle : null}
      />
      <Row label="Top / Shirt" value={profile.topColor} />
      <Row label="Pants / Bottom" value={profile.pantsColor} />
      <Row label="Shoes Color" value={profile.shoesColor} />
      <Row label="Shoes Type" value={profile.shoesType} />
      <Row label="Wears Glasses" value={boolToYesNo(profile.hasGlasses)} />
      <Row
        label="Wears Hearing Aids"
        value={boolToYesNo(profile.hasHearingAids)}
      />
      <Row label="Other Sensory Needs" value={profile.otherSensoryNeeds} />
      <Row
        label={displaySchoolLabel || "School / Daycare"}
        value={displaySchoolLabel ? profile.schoolDaycareName : null}
      />
      <Row label="Sports Teams" value={profile.sportsTeams} />
      <Row label="Last Known Location" value={child.lastKnownLocation} last />
    </InfoShell>
  );

  // ── Slide: Medical ──────────────────────────────────────────────────────────

  const SlideMedical = () => {
    const hasAny =
      profile.lifeThreatAllergies ||
      profile.emergencyMedications ||
      profile.communicationNeeds ||
      profile.languageSpoken ||
      displayMedicalNotes ||
      child.hasBirthmarks === "yes" ||
      child.hasScars === "yes" ||
      child.hasIdentifyingFeatures === "yes" ||
      !!child.birthmarkImageUris?.length ||
      !!child.scarImageUris?.length ||
      !!child.identifyingFeatureImageUris?.length ||
      child.lastKnownLocation;

    return (
      <InfoShell slideKey="medical" label="MEDICAL & FEATURES">
        {!hasAny ? (
          <View style={empty.wrap}>
            <AppText style={empty.icon}>🩺</AppText>
            <AppText style={empty.text}>No medical info on record</AppText>
          </View>
        ) : null}

        {profile.lifeThreatAllergies ||
        profile.emergencyMedications ||
        displayMedicalNotes ? (
          <Block
            icon="🏥"
            title="Medical Notes"
            accentColor="#E05252"
            bgColor="#FFF0F0"
          >
            {profile.lifeThreatAllergies ? (
              <AppText style={bodyText}>
                <AppText style={boldText}>
                  Life-Threatening Allergies —{" "}
                </AppText>
                {profile.lifeThreatAllergies}
              </AppText>
            ) : null}
            {profile.emergencyMedications ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Emergency Medications — </AppText>
                {profile.emergencyMedications}
              </AppText>
            ) : null}
            {displayMedicalNotes ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Other Medical Notes — </AppText>
                {displayMedicalNotes}
              </AppText>
            ) : null}
          </Block>
        ) : null}

        {profile.communicationNeeds || profile.languageSpoken ? (
          <Block
            icon="💬"
            title="Communication"
            accentColor="#4F6BED"
            bgColor="#EEF2FF"
          >
            {profile.communicationNeeds ? (
              <AppText style={bodyText}>
                <AppText style={boldText}>Needs — </AppText>
                {formatChoice(profile.communicationNeeds)}
              </AppText>
            ) : null}
            {profile.communicationNeeds === "language_barrier" &&
            profile.languageSpoken ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Language — </AppText>
                {profile.languageSpoken}
              </AppText>
            ) : null}
          </Block>
        ) : null}

        {child.hasBirthmarks === "yes" ||
        child.hasScars === "yes" ||
        child.hasIdentifyingFeatures === "yes" ||
        child.hasBirthmarks === "no" ||
        child.hasScars === "no" ||
        child.hasIdentifyingFeatures === "no" ||
        !!child.birthmarkImageUris?.length ||
        !!child.scarImageUris?.length ||
        !!child.identifyingFeatureImageUris?.length ? (
          <Block
            icon="🔍"
            title="Identifying Features"
            accentColor="#35B57B"
            bgColor="#EDFAF3"
          >
            {child.hasBirthmarks ? (
              <AppText style={bodyText}>
                <AppText style={boldText}>Has Birthmarks — </AppText>
                {child.hasBirthmarks === "yes" ? "Yes" : "No"}
              </AppText>
            ) : null}
            {child.hasBirthmarks === "yes" && child.birthmarksDescription ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Birthmarks — </AppText>
                {child.birthmarksDescription}
              </AppText>
            ) : null}
            {child.hasScars ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Has Scars — </AppText>
                {child.hasScars === "yes" ? "Yes" : "No"}
              </AppText>
            ) : null}
            {child.hasScars === "yes" && child.scarsDescription ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Scars — </AppText>
                {child.scarsDescription}
              </AppText>
            ) : null}
            {child.hasIdentifyingFeatures ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Has Other Features — </AppText>
                {child.hasIdentifyingFeatures === "yes" ? "Yes" : "No"}
              </AppText>
            ) : null}
            {child.hasIdentifyingFeatures === "yes" &&
            child.identifyingFeaturesDescription ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Other — </AppText>
                {child.identifyingFeaturesDescription}
              </AppText>
            ) : null}

            {child.birthmarkImageUris?.length ? (
              <View style={featureThumbStyles.group}>
                <AppText style={featureThumbStyles.label}>
                  Birthmark Photos
                </AppText>
                {renderFeatureThumbs(child.birthmarkImageUris)}
              </View>
            ) : null}

            {child.scarImageUris?.length ? (
              <View style={featureThumbStyles.group}>
                <AppText style={featureThumbStyles.label}>Scar Photos</AppText>
                {renderFeatureThumbs(child.scarImageUris)}
              </View>
            ) : null}

            {child.identifyingFeatureImageUris?.length ? (
              <View style={featureThumbStyles.group}>
                <AppText style={featureThumbStyles.label}>
                  Other Feature Photos
                </AppText>
                {renderFeatureThumbs(child.identifyingFeatureImageUris)}
              </View>
            ) : null}
          </Block>
        ) : null}

        {child.lastKnownLocation ? (
          <Block
            icon="📍"
            title="Last Known Location"
            accentColor="#4F6BED"
            bgColor="#EEF2FF"
          >
            <AppText style={bodyText}>{child.lastKnownLocation}</AppText>
          </Block>
        ) : null}
      </InfoShell>
    );
  };

  // ── Slide: Contacts ─────────────────────────────────────────────────────────

  const SlideContacts = () => {
    const hasContacts = (child.emergencyContacts?.length ?? 0) > 0;
    const hasGuardians = !!(
      guardian1?.name ||
      guardian1?.phone ||
      guardian1?.address ||
      guardian2?.name ||
      guardian2?.phone ||
      guardian2?.address
    );

    return (
      <InfoShell slideKey="contacts" label="EMERGENCY CONTACTS">
        {!hasContacts && !hasGuardians ? (
          <View style={empty.wrap}>
            <AppText style={empty.icon}>📋</AppText>
            <AppText style={empty.text}>No contacts on record</AppText>
          </View>
        ) : null}

        {child.emergencyContacts?.map((c, i) => (
          <View
            key={i}
            style={[
              ct.card,
              {
                borderLeftColor: DS.tints.contacts.dot,
              },
            ]}
          >
            <View style={ct.header}>
              <View
                style={[
                  ct.badge,
                  {
                    backgroundColor: DS.tints.contacts.dot,
                  },
                ]}
              >
                <AppText style={ct.badgeText}>{i + 1}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={ct.name}>{c.name}</AppText>
                {c.relationship ? (
                  <AppText style={ct.rel}>{c.relationship}</AppText>
                ) : null}
              </View>
            </View>
            <AppText style={ct.phone}>📞 {c.phone}</AppText>
            {c.sex ? <AppText style={ct.meta}>⚥ {c.sex}</AppText> : null}
            {c.address ? (
              <AppText style={ct.addr}>🏠 {c.address}</AppText>
            ) : null}
          </View>
        ))}

        {hasGuardians ? (
          <View style={[ct.card, { borderLeftColor: DS.inkLight }]}>
            <AppText style={ct.parentLabel}>Primary Guardians</AppText>
            {guardian1?.name || guardian1?.phone || guardian1?.address ? (
              <View style={ct.parentRow}>
                <AppText style={ct.parentName}>
                  {guardian1?.name || "Guardian 1"}
                </AppText>
                {guardian1?.phone ? (
                  <AppText style={ct.phone}>📞 {guardian1.phone}</AppText>
                ) : null}
                {guardian1?.address ? (
                  <AppText style={ct.addr}>🏠 {guardian1.address}</AppText>
                ) : null}
              </View>
            ) : null}
            {guardian2?.name || guardian2?.phone || guardian2?.address ? (
              <View style={[ct.parentRow, { marginTop: DS.sp(2) }]}>
                <AppText style={ct.parentName}>
                  {guardian2?.name || "Guardian 2"}
                </AppText>
                {guardian2?.phone ? (
                  <AppText style={ct.phone}>📞 {guardian2.phone}</AppText>
                ) : null}
                {guardian2?.address ? (
                  <AppText style={ct.addr}>🏠 {guardian2.address}</AppText>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
      </InfoShell>
    );
  };

  const ct = StyleSheet.create({
    card: {
      backgroundColor: DS.white,
      borderRadius: DS.chip,
      borderLeftWidth: 3,
      padding: DS.sp(4),
      marginBottom: DS.sp(3),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: DS.sp(3),
      marginBottom: DS.sp(2),
    },
    badge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      color: DS.white,
      fontSize: DS.size.small,
      fontWeight: "700",
    },
    name: {
      fontSize: DS.size.base,
      fontWeight: "700",
      color: DS.ink,
    },
    rel: {
      fontSize: DS.size.small,
      color: DS.inkMid,
      marginTop: 1,
    },
    phone: {
      fontSize: DS.size.small,
      color: DS.ink,
      marginTop: DS.sp(1),
    },
    meta: {
      fontSize: DS.size.small,
      color: DS.inkMid,
      marginTop: DS.sp(1),
    },
    addr: {
      fontSize: DS.size.small,
      color: DS.inkMid,
      marginTop: DS.sp(1),
    },
    parentLabel: {
      fontSize: DS.size.small,
      fontWeight: "700",
      color: DS.inkMid,
      letterSpacing: 0.6,
      marginBottom: DS.sp(2),
    },
    parentRow: { gap: 2 },
    parentName: {
      fontSize: DS.size.base,
      fontWeight: "600",
      color: DS.ink,
    },
  });

  // ── Shared text styles ──────────────────────────────────────────────────────

  const bodyText: any = {
    fontSize: DS.size.small,
    color: DS.ink,
    lineHeight: 19,
  };
  const boldText: any = { fontWeight: "700" };

  const featureThumbStyles = StyleSheet.create({
    group: {
      marginTop: DS.sp(2),
    },
    label: {
      fontSize: DS.size.micro,
      color: DS.inkLight,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: DS.sp(1),
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: DS.sp(1.5),
    },
    thumb: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: DS.border,
      backgroundColor: DS.white,
    },
  });

  const renderFeatureThumbs = (uris?: string[]) => {
    if (!uris || uris.length === 0) return null;

    return (
      <View style={featureThumbStyles.row}>
        {uris.slice(0, 3).map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={featureThumbStyles.thumb}
          />
        ))}
      </View>
    );
  };

  const empty = StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: DS.sp(2),
    },
    icon: { fontSize: 36, opacity: 0.35 },
    text: {
      fontSize: DS.size.base,
      color: DS.inkLight,
      fontStyle: "italic",
    },
  });

  // ── Slide renderer ──────────────────────────────────────────────────────────

  const renderSlide = (key: SlideKey) => {
    switch (key) {
      case "photo":
        return <SlidePhoto />;
      case "details":
        return <SlideDetails />;
      case "medical":
        return <SlideMedical />;
      case "contacts":
        return <SlideContacts />;
    }
  };

  // ── Export: 2×2 grid ─────────────────────────────────────────────────────────

  const HALF = CARD_W / 2;

  const exportFeaturePhotoStyles = StyleSheet.create({
    group: {
      marginBottom: 4,
    },
    label: {
      fontSize: 7,
      color: DS.inkLight,
      marginBottom: 2,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    row: {
      flexDirection: "row",
      gap: 4,
      flexWrap: "wrap",
    },
    thumb: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: DS.border,
      backgroundColor: DS.white,
    },
  });

  const renderExportFeaturePhotoGroup = (label: string, uris?: string[]) => {
    if (!uris || uris.length === 0) return null;

    return (
      <View style={exportFeaturePhotoStyles.group}>
        <AppText style={exportFeaturePhotoStyles.label}>{label}</AppText>
        <View style={exportFeaturePhotoStyles.row}>
          {uris.slice(0, 3).map((uri, index) => (
            <Image
              key={`${label}-${uri}-${index}`}
              source={{ uri }}
              style={exportFeaturePhotoStyles.thumb}
            />
          ))}
        </View>
      </View>
    );
  };

  const ExportGrid = () => (
    <View
      style={{
        width: CARD_W,
        height: CARD_W,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {/* ① Photo tile */}
      <View
        style={{
          width: HALF,
          height: HALF,
          overflow: "hidden",
          backgroundColor: DS.ink,
        }}
      >
        {child.imageUri ? (
          <Image
            source={{ uri: child.imageUri }}
            style={{ width: HALF, height: HALF }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText style={{ fontSize: 28 }}>📷</AppText>
          </View>
        )}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.52)",
            padding: 8,
          }}
        >
          <AppText
            style={{
              color: DS.white,
              fontSize: 10,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {displayName}
          </AppText>
          {displayAge !== null && displayAge !== undefined ? (
            <AppText
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 8,
              }}
            >
              {displayAge} yrs · {displaySex || ""}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* ② Details tile */}
      <ExportTile
        bg="#F7F8FA"
        label="DETAILS"
        labelColor={DS.tints.details.dot}
      >
        {[
          ["Name", displayName],
          ["DOB", displayDob],
          [
            "Age",
            displayAge !== null && displayAge !== undefined
              ? `${displayAge} yrs`
              : null,
          ],
          ["Sex", displaySex],
          ["Ethnicity", profile.ethnicity],
          ["Height", child.height ? `${child.height} cm` : null],
          ["Weight", child.weight ? `${child.weight} kg` : null],
          ["Eye", displayEyeColor],
          ["Hair", displayHairColor],
          [
            displaySchoolLabel || "School/Daycare",
            displaySchoolLabel ? profile.schoolDaycareName : null,
          ],
          ["Sports", profile.sportsTeams],
          ["Last Seen", child.lastKnownLocation],
        ]
          .filter(([, v]) => v)
          .map(([l, v]) => (
            <ExportRow
              key={l as string}
              label={l as string}
              value={v as string}
            />
          ))}
      </ExportTile>

      {/* ③ Medical tile */}
      <ExportTile
        bg="#FFF8F8"
        label="MEDICAL"
        labelColor={DS.tints.medical.dot}
      >
        {profile.lifeThreatAllergies ? (
          <AppText
            style={{
              fontSize: 8,
              color: DS.ink,
              marginBottom: 4,
            }}
            numberOfLines={3}
          >
            Allergies: {profile.lifeThreatAllergies}
          </AppText>
        ) : null}
        {profile.emergencyMedications ? (
          <ExportRow label="Meds" value={profile.emergencyMedications} />
        ) : null}
        {profile.communicationNeeds ? (
          <ExportRow
            label="Comms"
            value={formatChoice(profile.communicationNeeds) || ""}
          />
        ) : null}
        {profile.communicationNeeds === "language_barrier" &&
        profile.languageSpoken ? (
          <ExportRow label="Language" value={profile.languageSpoken} />
        ) : null}
        {displayMedicalNotes ? (
          <ExportRow label="Notes" value={displayMedicalNotes} />
        ) : null}
        {child.hasBirthmarks === "yes" && child.birthmarksDescription ? (
          <ExportRow label="Marks" value={child.birthmarksDescription} />
        ) : null}
        {child.hasBirthmarks ? (
          <ExportRow
            label="Birthmarks"
            value={child.hasBirthmarks === "yes" ? "Yes" : "No"}
          />
        ) : null}
        {child.hasScars === "yes" && child.scarsDescription ? (
          <ExportRow label="Scars" value={child.scarsDescription} />
        ) : null}
        {child.hasScars ? (
          <ExportRow
            label="Scars?"
            value={child.hasScars === "yes" ? "Yes" : "No"}
          />
        ) : null}
        {child.hasIdentifyingFeatures === "yes" &&
        child.identifyingFeaturesDescription ? (
          <ExportRow
            label="Other"
            value={child.identifyingFeaturesDescription}
          />
        ) : null}
        {child.hasIdentifyingFeatures ? (
          <ExportRow
            label="Other?"
            value={child.hasIdentifyingFeatures === "yes" ? "Yes" : "No"}
          />
        ) : null}
        {renderExportFeaturePhotoGroup(
          "Marks Photos",
          child.birthmarkImageUris,
        )}
        {renderExportFeaturePhotoGroup("Scars Photos", child.scarImageUris)}
        {renderExportFeaturePhotoGroup(
          "Other Photos",
          child.identifyingFeatureImageUris,
        )}
        {child.lastKnownLocation ? (
          <ExportRow label="Last Seen" value={child.lastKnownLocation} />
        ) : null}
        {!profile.lifeThreatAllergies &&
        !profile.emergencyMedications &&
        !profile.communicationNeeds &&
        !profile.languageSpoken &&
        !displayMedicalNotes &&
        child.hasBirthmarks !== "yes" &&
        child.hasScars !== "yes" &&
        child.hasIdentifyingFeatures !== "yes" &&
        !(child.birthmarkImageUris?.length ?? 0) &&
        !(child.scarImageUris?.length ?? 0) &&
        !(child.identifyingFeatureImageUris?.length ?? 0) &&
        !child.lastKnownLocation ? (
          <AppText
            style={{
              fontSize: 8,
              color: DS.inkLight,
              fontStyle: "italic",
            }}
          >
            No medical info
          </AppText>
        ) : null}
      </ExportTile>

      {/* ④ Contacts tile */}
      <ExportTile
        bg="#F5FFF9"
        label="CONTACTS"
        labelColor={DS.tints.contacts.dot}
      >
        {child.emergencyContacts?.slice(0, 2).map((c, i) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <AppText
              style={{
                fontSize: 8,
                fontWeight: "700",
                color: DS.ink,
              }}
              numberOfLines={1}
            >
              {c.name}
            </AppText>
            <AppText
              style={{
                fontSize: 7,
                color: DS.inkMid,
              }}
            >
              {c.phone}
              {c.relationship ? ` · ${c.relationship}` : ""}
              {c.sex ? ` · ${c.sex}` : ""}
            </AppText>
            {c.address ? (
              <AppText
                style={{
                  fontSize: 7,
                  color: DS.inkLight,
                }}
                numberOfLines={1}
              >
                {c.address}
              </AppText>
            ) : null}
          </View>
        ))}
        {guardian1?.name ? (
          <ExportRow
            label="G1"
            value={
              guardian1.name + (guardian1.phone ? ` · ${guardian1.phone}` : "")
            }
          />
        ) : null}
        {guardian1?.address ? (
          <ExportRow label="G1 Addr" value={guardian1.address} />
        ) : null}
        {guardian2?.name ? (
          <ExportRow
            label="G2"
            value={
              guardian2.name + (guardian2.phone ? ` · ${guardian2.phone}` : "")
            }
          />
        ) : null}
        {guardian2?.address ? (
          <ExportRow label="G2 Addr" value={guardian2.address} />
        ) : null}
      </ExportTile>
    </View>
  );

  const ExportTile = ({
    bg,
    label,
    labelColor,
    children,
  }: {
    bg: string;
    label: string;
    labelColor: string;
    children: React.ReactNode;
  }) => (
    <View
      style={{
        width: HALF,
        height: HALF,
        backgroundColor: bg,
        padding: 10,
      }}
    >
      <AppText
        style={{
          fontSize: 8,
          fontWeight: "800",
          color: labelColor,
          letterSpacing: 1.2,
          marginBottom: 7,
        }}
      >
        {label}
      </AppText>
      {children}
    </View>
  );

  const ExportRow = ({ label, value }: { label: string; value: string }) => (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 3,
      }}
    >
      <AppText
        style={{
          fontSize: 7,
          color: DS.inkLight,
          width: 40,
        }}
        numberOfLines={1}
      >
        {label}
      </AppText>
      <AppText
        style={{
          fontSize: 8,
          fontWeight: "600",
          color: DS.ink,
          flex: 1,
        }}
        numberOfLines={1}
      >
        {value}
      </AppText>
    </View>
  );

  // ── Actions ─────────────────────────────────────────────────────────────────

  const doCapture = async (): Promise<string | null> => {
    try {
      setCapturing(true);
      const uri = await exportRef.current?.capture?.();
      if (!uri) throw new Error();
      if (onCapture) onCapture(uri);
      return uri;
    } catch {
      Alert.alert("Error", "Failed to capture passport image");
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
    if (uri)
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: `${child.fullName}'s Passport`,
      });
  };

  const save = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow photo access to save");
      return;
    }
    const uri = await doCapture();
    if (!uri) return;
    const asset = await MediaLibrary.createAssetAsync(uri);
    let album = await MediaLibrary.getAlbumAsync("ChildGuard");
    if (!album) await MediaLibrary.createAlbumAsync("ChildGuard", asset, false);
    else await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    Alert.alert("Saved!", "Saved to your ChildGuard album");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={s.container}>
      {/* Hidden export */}
      <ViewShot
        ref={exportRef}
        options={{ format: "jpg", quality: 0.95 }}
        style={s.exportView}
      >
        <ExportGrid />
      </ViewShot>

      {/* Card */}
      <View style={s.card} {...pan.panHandlers}>
        {/* Progress bars */}
        <View style={s.bars}>
          {SLIDE_KEYS.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={s.barHit}
              onPress={() => transition(i, i > idx ? "left" : "right")}
              activeOpacity={0.7}
            >
              <View style={[s.bar, i <= idx && s.barFilled]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Animated content */}
        <Animated.View
          style={[
            { flex: 1 },
            {
              opacity,
              transform: [{ translateX }],
            },
          ]}
        >
          {renderSlide(SLIDE_KEYS[idx])}
        </Animated.View>
      </View>

      {/* Dots + arrows */}
      <View style={s.nav}>
        <TouchableOpacity
          style={[s.arrow, idx === 0 && s.arrowOff]}
          onPress={() => idx > 0 && transition(idx - 1, "right")}
          disabled={idx === 0}
          activeOpacity={0.7}
        >
          <AppText style={s.arrowText}>‹</AppText>
        </TouchableOpacity>

        <View style={s.dots}>
          {SLIDE_KEYS.map((_, i) => (
            <TouchableOpacity
              key={i}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 8,
                right: 8,
              }}
              onPress={() => transition(i, i > idx ? "left" : "right")}
              activeOpacity={0.7}
            >
              <View style={[s.dot, i === idx && s.dotOn]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.arrow, idx === SLIDE_KEYS.length - 1 && s.arrowOff]}
          onPress={() =>
            idx < SLIDE_KEYS.length - 1 && transition(idx + 1, "left")
          }
          disabled={idx === SLIDE_KEYS.length - 1}
          activeOpacity={0.7}
        >
          <AppText style={s.arrowText}>›</AppText>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={share}
          disabled={capturing}
          activeOpacity={0.85}
        >
          {capturing ? (
            <ActivityIndicator color={DS.white} />
          ) : (
            <AppText style={s.btnPrimaryText}>Share Passport</AppText>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.btnSecondary}
          onPress={save}
          disabled={capturing}
          activeOpacity={0.85}
        >
          <AppText style={s.btnSecondaryText}>Save to Gallery</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Root styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.appBackground,
  },
  exportView: {
    position: "absolute",
    left: -9999,
    top: 0,
  },

  // Card
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: DS.card,
    overflow: "hidden",
    backgroundColor: DS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
  },

  // Progress bars
  bars: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    gap: 5,
    zIndex: 10,
  },
  barHit: { flex: 1, paddingVertical: 6 },
  bar: {
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  barFilled: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  // Navigation
  nav: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 20,
  },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowOff: { backgroundColor: DS.border },
  arrowText: {
    color: DS.white,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "300",
  },
  dots: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.border,
  },
  dotOn: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS.accent,
  },

  // Buttons
  actions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
    width: "100%",
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: DS.accent,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: DS.white,
    fontSize: DS.size.base,
    fontWeight: "700",
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: DS.white,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: DS.border,
  },
  btnSecondaryText: {
    color: DS.ink,
    fontSize: DS.size.base,
    fontWeight: "600",
  },
});

export default ChildPassportCard;
