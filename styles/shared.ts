import { colors, radius, spacing, typography } from '@/constants/theme';
import { StyleSheet } from 'react-native';

// Re-export tokens so the rest of the styles layer only needs to import from @/styles
export { colors, radius, spacing, typography };

// ─── Shared Component Styles ──────────────────────────────────────────────────
export const sharedStyles = StyleSheet.create({
  // ─── Buttons ──────────────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dangerButton: {
    backgroundColor: colors.dangerLight,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.dangerBorder,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: typography.button,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ─── Labels ───────────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textSubtle,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ─── Cards ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: spacing.xs,
  },

  // ─── Tab Bar ──────────────────────────────────────────────────────────────
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    borderTopWidth: 0,
    height: 80,
    paddingBottom: 10,
    paddingTop: 8,
    bottom: -15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    borderRadius: radius.lg,
  },
});
