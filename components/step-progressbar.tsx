// Bottom step navigation bar with amber active pill, teal completed steps,
// and navy upcoming steps. Tapping a step only works if all prior steps are valid.
import { colors, radius, spacing, typography } from '@/styles';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from './ui/app-text';

export type Step = {
  key: number;
  label: string;
  icon: string;
};

export const FORM_STEPS: Step[] = [
  { key: 1, label: 'Essential', icon: '👤' },
  { key: 2, label: 'Medical',   icon: '🏥' },
  { key: 3, label: 'Contacts',  icon: '📞' },
  { key: 4, label: 'Identifiers', icon: '👁' },
];

type StepProgressBarProps = {
  currentStep: number;
  completedSteps: number[];
  onStepPress: (step: number) => void;
};

export function StepProgressBar({
  currentStep,
  completedSteps,
  onStepPress,
}: StepProgressBarProps) {
  return (
    <View style={styles.container}>
      {FORM_STEPS.map((step) => {
        const isActive = currentStep === step.key;
        const isCompleted = completedSteps.includes(step.key);
        const isAccessible = isCompleted || step.key === currentStep;

        return (
          <TouchableOpacity
            key={step.key}
            style={[
              styles.stepItem,
              isActive && styles.activeStepItem,
            ]}
            onPress={() => isAccessible && onStepPress(step.key)}
            activeOpacity={isAccessible ? 0.7 : 1}
          >
            <AppText
              style={[
                styles.icon,
                isActive && styles.activeIcon,
                isCompleted && !isActive && styles.completedIcon,
                !isCompleted && !isActive && styles.upcomingIcon,
              ]}
            >
              {isCompleted && !isActive ? '✓' : step.icon}
            </AppText>
            <AppText
              style={[
                styles.label,
                isActive && styles.activeLabel,
                isCompleted && !isActive && styles.completedLabel,
                !isCompleted && !isActive && styles.upcomingLabel,
              ]}
            >
              {step.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xxl,
    gap: 4,
  },
  activeStepItem: {
    backgroundColor: colors.inputSelection,
    paddingHorizontal: spacing.md,
  },
  icon: {
    fontSize: 18,
  },
  activeIcon: {
    fontSize: 18,
  },
  completedIcon: {
    fontSize: 16,
    color: colors.secondary,
  },
  upcomingIcon: {
    fontSize: 18,
    opacity: 0.4,
  },
  label: {
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.textPrimary,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  completedLabel: {
    color: colors.secondary,
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  upcomingLabel: {
    color: colors.textPrimary,
    fontSize: typography.tiny,
    opacity: 0.4,
  },
});