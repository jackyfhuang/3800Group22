import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from './shared';

export const addChildStyles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  container: {
    padding: spacing.xxl,
    backgroundColor: colors.white,
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
    color: colors.primary,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.large,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.black,
    letterSpacing: -0.5,
  },
  headerSubtext: {
    fontSize: typography.default,
    color: colors.midGray,
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
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: typography.default,
    color: colors.black,
    minHeight: 52,
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

  // ─── Secondary Button ─────────────────────────────────────────────────────
  secondaryButton: {
    marginTop: spacing.md,
    backgroundColor: '#111827',
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
    backgroundColor: '#f3f4f6',
  },
  captureCard: {
    backgroundColor: colors.white,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  captureTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing.xs + 2,
  },
  captureName: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: spacing.lg,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  captureLabel: {
    fontWeight: '600',
    color: '#4b5563',
  },
  captureValue: {
    color: '#111827',
  },
  captureSection: {
    marginTop: 14,
    marginBottom: spacing.xs + 2,
    fontWeight: '700',
    color: '#111827',
  },
  captureNotes: {
    color: '#111827',
    lineHeight: 20,
  },
});
