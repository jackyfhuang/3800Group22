import { colors, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type AppTextVariant =
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'error'
  | 'fieldLabel'
  | 'detail'
  | 'detailValue';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
};

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
  heading: {
    fontSize: typography.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  body: {
    fontSize: typography.default,
    color: colors.textPrimary,
  },
  label: {
    fontSize: typography.default,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  error: {
    fontSize: typography.tiny,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  detail: {
    fontSize: typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.default,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
