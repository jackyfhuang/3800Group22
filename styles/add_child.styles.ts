import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from './shared';

export const addChildStyles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  container: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl * 3,
    flexGrow: 1,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  headerContainer: {
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  backButtonText: {
    fontSize: 28,
    color: colors.secondary,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.large,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtext: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textSubtle,
  },

  // ─── Form Row ─────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: typography.default,
    color: colors.textSubtle,
  },

  // ─── Toggle Row (Glasses, Hearing Aids) ──────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.default,
    color: colors.textPrimary,
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactCardTitle: {
    fontSize: typography.default,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  removeContactText: {
    fontSize: typography.body,
    color: colors.danger,
    fontWeight: '600',
  },

  // ─── Navigation Buttons ───────────────────────────────────────────────────
  navButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  navButtonBack: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.cardBackground,
  },
  navButtonBackText: {
    color: colors.secondary,
    fontSize: typography.button,
    fontWeight: '600',
  },
  navButtonNext: {
    flex: 2,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
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
    fontWeight: '600',
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
    position: 'absolute',
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
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  captureName: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textName,
    marginBottom: spacing.lg,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  captureLabel: {
    fontWeight: '600',
    color: colors.textSubtle,
  },
  captureValue: {
    color: colors.textOnLight,
  },
  captureSection: {
    marginTop: 14,
    marginBottom: spacing.xs + 2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  captureNotes: {
    color: colors.textOnLight,
    lineHeight: 20,
  },
});