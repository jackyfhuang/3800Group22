import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from './shared';

export const addChildStyles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  container: {
    padding: spacing.xxl,
    backgroundColor: colors.appBackground,
    flexGrow: 1,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  headerContainer: {
    marginBottom: spacing.xxxl,
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

  // ─── Form Fields ──────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: typography.default,
    color: colors.textOnLight,
    minHeight: 52,
    shadowColor: colors.inputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.lg,
  },
  errorInput: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1.5,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.tiny,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
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
