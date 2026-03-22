import { StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "./shared";

export const addChildStyles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  container: {
    padding: spacing.xxl,
    paddingBottom: 200, // clears progress bar + tab bar
    flexGrow: 1,
  },

  // ─── Form Row ─────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  // ─── Read-only Field ──────────────────────────────────────────────────────
  readOnlyField: {
    backgroundColor: colors.appBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    minHeight: 52,
    justifyContent: "center",
  },
  readOnlyText: {
    fontSize: typography.default,
    color: colors.textSubtle,
  },

  profilePhotoWrap: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  photoUploadCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  photoPreview: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  photoUploadText: {
    textAlign: "center",
    color: colors.textSubtle,
    fontSize: typography.body,
    paddingHorizontal: spacing.sm,
  },

  featurePhotosContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  featurePhotosRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  featurePhotoItem: {
    position: "relative",
  },
  featurePhotoThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputBackground,
  },
  featurePhotoRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  featurePhotoRemoveText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "700",
    lineHeight: 16,
  },
  featurePhotoAddButton: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.inputBackground,
  },
  featurePhotoAddText: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    fontWeight: "600",
    textAlign: "center",
  },

  // ─── Toggle Row (Glasses, Hearing Aids) ──────────────────────────────────
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.default,
    color: colors.textPrimary,
    fontWeight: "500",
    flex: 1,
  },

  // ─── Emergency Contact Card ───────────────────────────────────────────────
  contactCard: {
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  contactCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  contactCardTitle: {
    fontSize: typography.default,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  removeContactText: {
    fontSize: typography.body,
    color: colors.danger,
    fontWeight: "600",
  },

  // ─── Navigation Buttons ───────────────────────────────────────────────────
  navButtonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  navButtonBack: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.cardBackground,
  },
  navButtonBackText: {
    color: colors.secondary,
    fontSize: typography.button,
    fontWeight: "600",
  },
  navButtonNext: {
    flex: 2,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonNextText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "600",
  },

  // ─── Date Picker Button ───────────────────────────────────────────────────
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    minHeight: 52,
    shadowColor: colors.inputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  datePickerButtonError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
  },
  datePickerText: {
    fontSize: typography.default,
    color: colors.textOnLight,
    flex: 1,
  },
  datePickerPlaceholder: {
    fontSize: typography.default,
    color: colors.textSubtle,
    flex: 1,
  },
  datePickerIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },

  // ─── Progress Bar Wrapper ─────────────────────────────────────────────────
  progressBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    overflow: "visible",
  },

  // ─── Export Button ────────────────────────────────────────────────────────
  exportButton: {
    marginTop: spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // ─── Hidden Export Card ───────────────────────────────────────────────────
  hiddenCapture: {
    position: "absolute",
    top: -2000,
    left: 0,
    width: 800,
    padding: spacing.xxl,
    backgroundColor: colors.appBackground,
  },
  captureCard: {
    backgroundColor: colors.cardBackground,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  captureTitle: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  captureName: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.textName,
    marginBottom: spacing.lg,
  },
  captureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  captureLabel: {
    fontWeight: "600",
    color: colors.textSubtle,
  },
  captureValue: {
    color: colors.textOnLight,
  },
  captureSection: {
    marginTop: 14,
    marginBottom: spacing.xs + 2,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  captureNotes: {
    color: colors.textOnLight,
    lineHeight: 20,
  },
});
