import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { AppText } from "@/components/ui/app-text";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";
import { ChildProfile } from "@/types/child";

interface ChildPassportProps {
  child: ChildProfile;
  onCapture?: (uri: string) => void;
}

// ─── Passport Card Component ─────────────────────────────────────────────────────
export function ChildPassportCard({
  child,
  onCapture,
}: ChildPassportProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] =
    useState(false);

  // Capture the passport as a JPG image
  const capturePassport = async (): Promise<
    string | null
  > => {
    if (!viewShotRef.current) return null;

    try {
      setIsCapturing(true);
      const uri =
        await viewShotRef.current.capture?.();
      if (uri && onCapture) {
        onCapture(uri);
      }
      return uri || null;
    } catch (error) {
      console.error(
        "Error capturing passport:",
        error,
      );
      Alert.alert(
        "Error",
        "Failed to capture passport image",
      );
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  // Share the passport as JPG
  const sharePassport = async () => {
    try {
      const isAvailable =
        await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device",
        );
        return;
      }

      const uri = await capturePassport();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Share ${child.fullName}'s Passport`,
        });
      }
    } catch (error) {
      console.error(
        "Error sharing passport:",
        error,
      );
      Alert.alert(
        "Error",
        "Failed to share passport",
      );
    }
  };

  // Save passport to device gallery as JPG
  const saveToGallery = async () => {
    try {
      // Request permissions
      const { status } =
        await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to save photos to your gallery",
        );
        return;
      }

      const uri = await capturePassport();
      if (uri) {
        // Save directly to media library
        const asset =
          await MediaLibrary.createAssetAsync(
            uri,
          );

        // Get or create album
        let album =
          await MediaLibrary.getAlbumAsync(
            "ChildGuard",
          );
        if (!album) {
          album =
            await MediaLibrary.createAlbumAsync(
              "ChildGuard",
              asset,
              false,
            );
        } else {
          await MediaLibrary.addAssetsToAlbumAsync(
            [asset],
            album,
            false,
          );
        }

        Alert.alert(
          "Saved!",
          `Passport saved to your photo gallery in the ChildGuard album`,
        );
      }
    } catch (error) {
      console.error(
        "Error saving passport:",
        error,
      );
      Alert.alert(
        "Error",
        "Failed to save passport to gallery",
      );
    }
  };

  // Export as JPG file to device storage
  const exportAsJpg = async () => {
    try {
      const uri = await capturePassport();
      if (uri) {
        // Copy to document directory with .jpg extension using new API
        const fileName = `child_passport_${child.id}_${Date.now()}.jpg`;
        const destinationDir =
          FileSystem.Paths.document;
        const destinationFile =
          new FileSystem.File(
            destinationDir,
            fileName,
          );

        // Copy the captured file to the destination
        await FileSystem.copyAsync({
          from: uri,
          to: destinationFile.uri,
        });
        Alert.alert(
          "Exported!",
          `Passport exported as JPG to:\n${fileName}\n\nYou can find this file in the app's documents folder.`,
          [
            { text: "OK" },
            {
              text: "Share Now",
              onPress: () => sharePassport(),
            },
          ],
        );
      }
    } catch (error) {
      console.error(
        "Error exporting passport:",
        error,
      );
      Alert.alert(
        "Error",
        "Failed to export passport",
      );
    }
  };

  return (
    <View style={passportStyles.container}>
      {/* Passport Header */}
      <View style={passportStyles.header}>
        <AppText
          variant="heading"
          style={passportStyles.headerTitle}
        >
          CHILD PASSPORT
        </AppText>
        <AppText
          style={passportStyles.headerSubtitle}
        >
          ChildGuard Verification
        </AppText>
      </View>

      {/* ViewShot for capturing the passport as JPG */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "jpg", quality: 0.9 }}
        style={passportStyles.passportCard}
      >
        {/* Photo Section */}
        <View style={passportStyles.photoSection}>
          <View style={passportStyles.photoFrame}>
            {child.imageUri ? (
              <Image
                source={{ uri: child.imageUri }}
                style={passportStyles.photo}
              />
            ) : (
              <View
                style={
                  passportStyles.photoPlaceholder
                }
              >
                <AppText
                  style={
                    passportStyles.photoPlaceholderText
                  }
                >
                  📷
                </AppText>
              </View>
            )}
          </View>
          <View style={passportStyles.photoLabel}>
            <AppText
              style={
                passportStyles.photoLabelText
              }
            >
              PHOTO
            </AppText>
          </View>
        </View>

        {/* Personal Information */}
        <View style={passportStyles.infoSection}>
          <View style={passportStyles.nameRow}>
            <AppText
              style={passportStyles.nameLabel}
            >
              NAME
            </AppText>
            <AppText
              style={passportStyles.nameValue}
            >
              {child.fullName || "N/A"}
            </AppText>
          </View>

          <View
            style={passportStyles.detailsGrid}
          >
            <View
              style={passportStyles.detailItem}
            >
              <AppText
                style={passportStyles.detailLabel}
              >
                AGE
              </AppText>
              <AppText
                style={passportStyles.detailValue}
              >
                {child.age
                  ? `${child.age} yrs`
                  : "N/A"}
              </AppText>
            </View>
            <View
              style={passportStyles.detailItem}
            >
              <AppText
                style={passportStyles.detailLabel}
              >
                HEIGHT
              </AppText>
              <AppText
                style={passportStyles.detailValue}
              >
                {child.height
                  ? `${child.height} cm`
                  : "N/A"}
              </AppText>
            </View>
            <View
              style={passportStyles.detailItem}
            >
              <AppText
                style={passportStyles.detailLabel}
              >
                WEIGHT
              </AppText>
              <AppText
                style={passportStyles.detailValue}
              >
                {child.weight
                  ? `${child.weight} kg`
                  : "N/A"}
              </AppText>
            </View>
            <View
              style={passportStyles.detailItem}
            >
              <AppText
                style={passportStyles.detailLabel}
              >
                GENDER
              </AppText>
              <AppText
                style={passportStyles.detailValue}
              >
                {child.gender || "N/A"}
              </AppText>
            </View>
          </View>

          {/* Medical Notes */}
          {child.medicalNotes && (
            <View
              style={
                passportStyles.medicalSection
              }
            >
              <AppText
                style={
                  passportStyles.medicalLabel
                }
              >
                MEDICAL NOTES
              </AppText>
              <AppText
                style={
                  passportStyles.medicalValue
                }
                numberOfLines={2}
              >
                {child.medicalNotes}
              </AppText>
            </View>
          )}

          {/* Identifying Features */}
          {(child.hasIdentifyingFeatures ===
            "yes" ||
            child.hasBirthmarks === "yes" ||
            child.hasScars === "yes") && (
            <View
              style={
                passportStyles.featuresSection
              }
            >
              <AppText
                style={
                  passportStyles.featuresLabel
                }
              >
                IDENTIFYING FEATURES
              </AppText>
              <AppText
                style={
                  passportStyles.featuresValue
                }
                numberOfLines={2}
              >
                {[
                  child.hasBirthmarks === "yes" &&
                    child.birthmarksDescription,
                  child.hasScars === "yes" &&
                    child.scarsDescription,
                  child.hasIdentifyingFeatures ===
                    "yes" &&
                    child.identifyingFeaturesDescription,
                ]
                  .filter(Boolean)
                  .join(" | ") || "None listed"}
              </AppText>
            </View>
          )}

          {/* Emergency Contact */}
          {child.emergencyContacts &&
            child.emergencyContacts.length >
              0 && (
              <View
                style={
                  passportStyles.emergencySection
                }
              >
                <AppText
                  style={
                    passportStyles.emergencyLabel
                  }
                >
                  EMERGENCY CONTACT
                </AppText>
                <AppText
                  style={
                    passportStyles.emergencyValue
                  }
                >
                  {
                    child.emergencyContacts[0]
                      .name
                  }{" "}
                  -{" "}
                  {
                    child.emergencyContacts[0]
                      .phone
                  }
                </AppText>
                {child.emergencyContacts[0]
                  .relationship && (
                  <AppText
                    style={
                      passportStyles.emergencyRelation
                    }
                  >
                    (
                    {
                      child.emergencyContacts[0]
                        .relationship
                    }
                    )
                  </AppText>
                )}
              </View>
            )}
        </View>

        {/* Passport Footer */}
        <View style={passportStyles.footer}>
          <AppText
            style={passportStyles.footerText}
          >
            ID: {child.id} | Generated:{" "}
            {new Date().toLocaleDateString()}
          </AppText>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View style={passportStyles.actions}>
        <TouchableOpacity
          style={passportStyles.shareButton}
          onPress={sharePassport}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator
              color={colors.white}
            />
          ) : (
            <AppText
              style={passportStyles.buttonText}
            >
              📤 Share Passport
            </AppText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={passportStyles.saveButton}
          onPress={saveToGallery}
          disabled={isCapturing}
        >
          <AppText
            style={passportStyles.saveButtonText}
          >
            💾 Save to Gallery
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={passportStyles.exportButton}
          onPress={exportAsJpg}
          disabled={isCapturing}
        >
          <AppText
            style={
              passportStyles.exportButtonText
            }
          >
            📄 Export as JPG
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────────
const passportStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: typography.small,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  passportCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  photoSection: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    alignItems: "center",
  },
  photoFrame: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.subtleBorder,
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  photoLabel: {
    marginLeft: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  photoLabelText: {
    color: colors.white,
    fontSize: typography.tiny,
    fontWeight: "700",
    letterSpacing: 1,
  },
  infoSection: {
    padding: spacing.lg,
  },
  nameRow: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    paddingBottom: spacing.md,
  },
  nameLabel: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  nameValue: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  detailItem: {
    width: "50%",
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.default,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  medicalSection: {
    backgroundColor: colors.redBackground,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  medicalLabel: {
    fontSize: typography.tiny,
    color: colors.danger,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  medicalValue: {
    fontSize: typography.small,
    color: colors.textPrimary,
  },
  featuresSection: {
    backgroundColor: colors.tealLight,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  featuresLabel: {
    fontSize: typography.tiny,
    color: colors.secondary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  featuresValue: {
    fontSize: typography.small,
    color: colors.textPrimary,
  },
  emergencySection: {
    backgroundColor: colors.blueLight,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  emergencyLabel: {
    fontSize: typography.tiny,
    color: colors.primary,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  emergencyValue: {
    fontSize: typography.default,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emergencyRelation: {
    fontSize: typography.small,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  footer: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: "center",
  },
  footerText: {
    fontSize: typography.tiny,
    color: colors.white,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: "center",
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "600",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "600",
  },
  exportButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: "center",
    flex: 1,
  },
  exportButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "600",
  },
});

export default ChildPassportCard;
