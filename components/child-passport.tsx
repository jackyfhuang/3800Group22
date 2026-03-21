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
          {child.fullName || "—"}
        </AppText>
        {child.age ? (
          <View style={ph.tagRow}>
            <View style={ph.tag}>
              <AppText style={ph.tagText}>{child.age} yrs</AppText>
            </View>
            {child.gender ? (
              <View style={ph.tag}>
                <AppText style={ph.tagText}>{child.gender}</AppText>
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
      <Row label="Full name" value={child.fullName} />
      <Row label="Age" value={child.age ? `${child.age} years old` : null} />
      <Row label="Gender" value={child.gender} />
      <Row label="Height" value={child.height ? `${child.height} cm` : null} />
      <Row label="Weight" value={child.weight ? `${child.weight} kg` : null} />
      <Row
        label={child.schoolDaycareType === "daycare" ? "Daycare" : "School"}
        value={
          child.schoolDaycareType && child.schoolDaycareType !== "none"
            ? child.schoolDaycareName
            : null
        }
      />
      <Row label="Sports" value={child.sportsTeams} />
      <Row label="Last Seen" value={child.lastKnownLocation} last />
    </InfoShell>
  );

  // ── Slide: Medical ──────────────────────────────────────────────────────────

  const SlideMedical = () => {
    const hasAny =
      child.medicalNotes ||
      child.hasBirthmarks === "yes" ||
      child.hasScars === "yes" ||
      child.hasIdentifyingFeatures === "yes" ||
      child.lastKnownLocation;

    return (
      <InfoShell slideKey="medical" label="MEDICAL & FEATURES">
        {!hasAny ? (
          <View style={empty.wrap}>
            <AppText style={empty.icon}>🩺</AppText>
            <AppText style={empty.text}>No medical info on record</AppText>
          </View>
        ) : null}

        {child.medicalNotes ? (
          <Block
            icon="🏥"
            title="Medical Notes"
            accentColor="#E05252"
            bgColor="#FFF0F0"
          >
            <AppText style={bodyText}>{child.medicalNotes}</AppText>
          </Block>
        ) : null}

        {child.hasBirthmarks === "yes" ||
        child.hasScars === "yes" ||
        child.hasIdentifyingFeatures === "yes" ? (
          <Block
            icon="🔍"
            title="Identifying Features"
            accentColor="#35B57B"
            bgColor="#EDFAF3"
          >
            {child.hasBirthmarks === "yes" && child.birthmarksDescription ? (
              <AppText style={bodyText}>
                <AppText style={boldText}>Birthmarks — </AppText>
                {child.birthmarksDescription}
              </AppText>
            ) : null}
            {child.hasScars === "yes" && child.scarsDescription ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Scars — </AppText>
                {child.scarsDescription}
              </AppText>
            ) : null}
            {child.hasIdentifyingFeatures === "yes" &&
            child.identifyingFeaturesDescription ? (
              <AppText style={[bodyText, { marginTop: DS.sp(1) }]}>
                <AppText style={boldText}>Other — </AppText>
                {child.identifyingFeaturesDescription}
              </AppText>
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
    const hasParents = !!(
      child.parent1Name ||
      child.parent1Phone ||
      child.parent1Address ||
      child.parent2Name ||
      child.parent2Phone ||
      child.parent2Address
    );

    return (
      <InfoShell slideKey="contacts" label="EMERGENCY CONTACTS">
        {!hasContacts && !hasParents ? (
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

        {hasParents ? (
          <View style={[ct.card, { borderLeftColor: DS.inkLight }]}>
            <AppText style={ct.parentLabel}>Parents / Guardians</AppText>
            {child.parent1Name || child.parent1Phone || child.parent1Address ? (
              <View style={ct.parentRow}>
                <AppText style={ct.parentName}>
                  {child.parent1Name || "Parent 1"}
                </AppText>
                {child.parent1Phone ? (
                  <AppText style={ct.phone}>📞 {child.parent1Phone}</AppText>
                ) : null}
                {child.parent1Address ? (
                  <AppText style={ct.addr}>🏠 {child.parent1Address}</AppText>
                ) : null}
              </View>
            ) : null}
            {child.parent2Name || child.parent2Phone || child.parent2Address ? (
              <View style={[ct.parentRow, { marginTop: DS.sp(2) }]}>
                <AppText style={ct.parentName}>
                  {child.parent2Name || "Parent 2"}
                </AppText>
                {child.parent2Phone ? (
                  <AppText style={ct.phone}>📞 {child.parent2Phone}</AppText>
                ) : null}
                {child.parent2Address ? (
                  <AppText style={ct.addr}>🏠 {child.parent2Address}</AppText>
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
            {child.fullName || "—"}
          </AppText>
          {child.age ? (
            <AppText
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 8,
              }}
            >
              {child.age} yrs · {child.gender || ""}
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
          ["Name", child.fullName],
          ["Age", child.age ? `${child.age} yrs` : null],
          ["Height", child.height ? `${child.height} cm` : null],
          ["Weight", child.weight ? `${child.weight} kg` : null],
          [
            child.schoolDaycareType === "daycare" ? "Daycare" : "School",
            child.schoolDaycareType && child.schoolDaycareType !== "none"
              ? child.schoolDaycareName
              : null,
          ],
          ["Sports", child.sportsTeams],
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
        {child.medicalNotes ? (
          <AppText
            style={{
              fontSize: 8,
              color: DS.ink,
              marginBottom: 4,
            }}
            numberOfLines={3}
          >
            {child.medicalNotes}
          </AppText>
        ) : null}
        {child.hasBirthmarks === "yes" && child.birthmarksDescription ? (
          <ExportRow label="Marks" value={child.birthmarksDescription} />
        ) : null}
        {child.hasScars === "yes" && child.scarsDescription ? (
          <ExportRow label="Scars" value={child.scarsDescription} />
        ) : null}
        {child.hasIdentifyingFeatures === "yes" &&
        child.identifyingFeaturesDescription ? (
          <ExportRow
            label="Other"
            value={child.identifyingFeaturesDescription}
          />
        ) : null}
        {child.lastKnownLocation ? (
          <ExportRow label="Last Seen" value={child.lastKnownLocation} />
        ) : null}
        {!child.medicalNotes &&
        child.hasBirthmarks !== "yes" &&
        child.hasScars !== "yes" &&
        child.hasIdentifyingFeatures !== "yes" &&
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
        {child.parent1Name ? (
          <ExportRow
            label="Parent 1"
            value={
              child.parent1Name +
              (child.parent1Phone ? ` · ${child.parent1Phone}` : "")
            }
          />
        ) : null}
        {child.parent1Address ? (
          <ExportRow label="P1 Addr" value={child.parent1Address} />
        ) : null}
        {child.parent2Name ? (
          <ExportRow
            label="Parent 2"
            value={
              child.parent2Name +
              (child.parent2Phone ? ` · ${child.parent2Phone}` : "")
            }
          />
        ) : null}
        {child.parent2Address ? (
          <ExportRow label="P2 Addr" value={child.parent2Address} />
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
