import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';

// Re-export tokens so the rest of the styles layer only needs to import from @/styles
export { colors, spacing, radius, typography };

// ─── Shared Component Styles ──────────────────────────────────────────────────
export const sharedStyles = StyleSheet.create({
  // Buttons
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
  dangerButton: {
    backgroundColor: colors.white,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: typography.button,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Labels
  fieldLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.midGray,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xs,
  },
});
