import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from './shared';

export const homeStyles = StyleSheet.create({
  // ─── Layout ───────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    padding: spacing.xl,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    marginBottom: spacing.xxxl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.default,
    color: colors.midGray,
    marginTop: spacing.xs,
  },

  // ─── Add Button ───────────────────────────────────────────────────────────
  addButton: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },

  // ─── Empty State ──────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.default,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ─── Child Cards ──────────────────────────────────────────────────────────
  childrenList: {
    gap: spacing.lg,
  },
  childCardContent: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  childInfoContainer: {
    flex: 1,
  },
  childInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  childName: {
    fontSize: typography.title,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },

  // ─── Child Detail Pills ───────────────────────────────────────────────────
  childDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  detailItem: {
    minWidth: 80,
  },
  detailLabel: {
    fontSize: typography.tiny,
    color: colors.gray,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: typography.default,
    fontWeight: '600',
    color: colors.darkGray,
  },

  // ─── Medical Notes ────────────────────────────────────────────────────────
  notesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  notesLabel: {
    fontSize: typography.tiny,
    color: colors.gray,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: typography.body,
    color: colors.midGray,
    lineHeight: 20,
  },

  // ─── Card Action Buttons ──────────────────────────────────────────────────
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    padding: spacing.md,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
