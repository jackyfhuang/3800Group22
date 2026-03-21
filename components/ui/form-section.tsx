// Styled section wrapper with a title and optional subtitle.
// Used to group related fields within each step of the form.
import { colors, radius, spacing } from '@/styles';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './app-text';

type FormSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleAccent} />
        <View>
          <AppText variant="heading" style={styles.title}>{title}</AppText>
          {subtitle && (
            <AppText variant="subtitle" style={styles.subtitle}>{subtitle}</AppText>
          )}
        </View>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  titleAccent: {
    width: 4,
    height: 32,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSubtle,
    marginTop: 2,
  },
  content: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
});