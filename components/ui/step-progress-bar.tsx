// Floating pill-style step progress bar.
// Thin connector line with animated teal fill, numbered nodes, checkmarks for completed steps.
import { palette } from '@/constants/theme';
import { colors, spacing, typography } from '@/styles';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './app-text';

export type Step = {
  key: number;
  label: string;
};

export const FORM_STEPS: Step[] = [
  { key: 1, label: 'Essential'   },
  { key: 2, label: 'Medical'     },
  { key: 3, label: 'Contacts'    },
  { key: 4, label: 'Identifiers' },
];

// ── Layout constants ─────────────────────────────────────────────────────────
const SCREEN_WIDTH   = Dimensions.get('window').width;
const NODE_SIZE      = 38;
const PILL_PAD_V     = 10;
const PILL_PAD_H     = 20;
const PILL_HEIGHT    = NODE_SIZE + PILL_PAD_V * 2;
const PILL_WIDTH     = SCREEN_WIDTH - 48;
const CONNECTOR_H    = 5;
const ACTIVE_COLOR   = palette.teal;    // matches the form's action color

const LEFT_EDGE  = PILL_PAD_H + NODE_SIZE / 2;
const RIGHT_EDGE = PILL_WIDTH - PILL_PAD_H - NODE_SIZE / 2;
const GAP        = (RIGHT_EDGE - LEFT_EDGE) / (FORM_STEPS.length - 1);

const NODE_POSITIONS = FORM_STEPS.map((_, i) => LEFT_EDGE + i * GAP);

// ── Animation config ─────────────────────────────────────────────────────────
const FILL_CONFIG   = { duration: 400, easing: Easing.out(Easing.cubic) } as const;
const SPRING_CONFIG = { damping: 16, stiffness: 240 } as const;

// ── Types ────────────────────────────────────────────────────────────────────
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

  // ── Connector fill (0 → 1) — driven by currentStep so it reverses on back ─
  const fill0 = useSharedValue(currentStep > 1 ? 1 : 0);
  const fill1 = useSharedValue(currentStep > 2 ? 1 : 0);
  const fill2 = useSharedValue(currentStep > 3 ? 1 : 0);

  useEffect(() => {
    fill0.value = withTiming(currentStep > 1 ? 1 : 0, FILL_CONFIG);
    fill1.value = withTiming(currentStep > 2 ? 1 : 0, FILL_CONFIG);
    fill2.value = withTiming(currentStep > 3 ? 1 : 0, FILL_CONFIG);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const fillStyle0 = useAnimatedStyle(() => ({ width: `${fill0.value * 100}%` as any }));
  const fillStyle1 = useAnimatedStyle(() => ({ width: `${fill1.value * 100}%` as any }));
  const fillStyle2 = useAnimatedStyle(() => ({ width: `${fill2.value * 100}%` as any }));
  const fillStyles = [fillStyle0, fillStyle1, fillStyle2];

  // ── Node scale spring ────────────────────────────────────────────────────
  const scale0 = useSharedValue(currentStep === 1 ? 1.15 : 1);
  const scale1 = useSharedValue(currentStep === 2 ? 1.15 : 1);
  const scale2 = useSharedValue(currentStep === 3 ? 1.15 : 1);
  const scale3 = useSharedValue(currentStep === 4 ? 1.15 : 1);

  useEffect(() => {
    scale0.value = withSpring(currentStep === 1 ? 1.15 : 1, SPRING_CONFIG);
    scale1.value = withSpring(currentStep === 2 ? 1.15 : 1, SPRING_CONFIG);
    scale2.value = withSpring(currentStep === 3 ? 1.15 : 1, SPRING_CONFIG);
    scale3.value = withSpring(currentStep === 4 ? 1.15 : 1, SPRING_CONFIG);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const nodeAnimStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: scale0.value }] }));
  const nodeAnimStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }] }));
  const nodeAnimStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }] }));
  const nodeAnimStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: scale3.value }] }));
  const nodeAnimStyles = [nodeAnimStyle0, nodeAnimStyle1, nodeAnimStyle2, nodeAnimStyle3];

  return (
    <View style={styles.outerWrapper}>

      {/* ── Pill ── */}
      <View style={styles.pill}>

        {/* Connector tracks + animated fills */}
        {FORM_STEPS.slice(0, -1).map((_, i) => {
          const lineLeft  = NODE_POSITIONS[i]     + NODE_SIZE / 2;
          const lineRight = NODE_POSITIONS[i + 1] - NODE_SIZE / 2;
          return (
            <View
              key={`track-${i}`}
              style={[styles.connectorTrack, {
                left:  lineLeft,
                width: lineRight - lineLeft,
                top:   PILL_HEIGHT / 2 - CONNECTOR_H / 2,
              }]}
            >
              <Animated.View style={[styles.connectorFill, fillStyles[i]]} />
            </View>
          );
        })}

        {/* Nodes */}
        {FORM_STEPS.map((step, i) => {
          const isActive     = currentStep === step.key;
          // Only show checkmark for steps strictly behind the current position
          const isCompleted  = completedSteps.includes(step.key) && step.key < currentStep;
          const isNext       = step.key === currentStep + 1;
          const isAccessible = step.key < currentStep || isActive || isNext;
          const cx           = NODE_POSITIONS[i];

          return (
            <Animated.View
              key={step.key}
              style={[styles.nodeWrapper, { left: cx - NODE_SIZE / 2 }, nodeAnimStyles[i]]}
            >
              {/* Active outer ring */}
              {isActive && <View style={styles.activeRing} />}

              <TouchableOpacity
                style={[
                  styles.node,
                  isActive                        && styles.nodeActive,
                  isCompleted                     && styles.nodeCompleted,
                  isNext && !isCompleted          && styles.nodeNext,
                  !isActive && !isCompleted && !isNext && styles.nodeIncomplete,
                ]}
                onPress={() => isAccessible && onStepPress(step.key)}
                activeOpacity={isAccessible ? 0.7 : 1}
              >
                {isCompleted ? (
                  <AppText style={styles.checkmark}>✓</AppText>
                ) : (
                  <AppText style={[
                    styles.stepNumber,
                    isActive ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}>
                    {step.key}
                  </AppText>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Labels row ── */}
      <View style={styles.labelsRow}>
        {FORM_STEPS.map((step, i) => {
          const isActive    = currentStep === step.key;
          const isCompleted = completedSteps.includes(step.key) && step.key < currentStep;
          const cx          = NODE_POSITIONS[i];
          return (
            <View key={`label-${step.key}`} style={[styles.labelWrapper, { left: cx - 36 }]}>
              <AppText style={[
                styles.label,
                isActive                       && styles.labelActive,
                isCompleted && !isActive       && styles.labelCompleted,
                !isCompleted && !isActive      && styles.labelInactive,
              ]}>
                {step.label}
              </AppText>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // ── Wrapper ───────────────────────────────────────────────────────────────
  outerWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  // ── Pill ─────────────────────────────────────────────────────────────────
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: palette.navy,
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 12,
  },

  // ── Connector ────────────────────────────────────────────────────────────
  connectorTrack: {
    position: 'absolute',
    height: CONNECTOR_H,
    borderRadius: CONNECTOR_H / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    backgroundColor: ACTIVE_COLOR,
    borderRadius: CONNECTOR_H / 2,
  },

  // ── Node ─────────────────────────────────────────────────────────────────
  nodeWrapper: {
    position: 'absolute',
    top: (PILL_HEIGHT - NODE_SIZE) / 2,
    width: NODE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRing: {
    position: 'absolute',
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: (NODE_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: ACTIVE_COLOR,
    top: -4,
    left: -4,
    opacity: 0.55,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeActive: {
    backgroundColor: ACTIVE_COLOR,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeCompleted: {
    backgroundColor: ACTIVE_COLOR,
    opacity: 0.75,
  },
  nodeNext: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
  },
  nodeIncomplete: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // ── Node content ─────────────────────────────────────────────────────────
  checkmark: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.white,
  },
  stepNumber: {
    fontSize: typography.small,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: palette.white,
  },
  stepNumberInactive: {
    color: 'rgba(255, 255, 255, 0.35)',
  },

  // ── Labels ────────────────────────────────────────────────────────────────
  labelsRow: {
    width: PILL_WIDTH,
    height: 20,
    marginTop: spacing.sm,
  },
  labelWrapper: {
    position: 'absolute',
    width: 72,
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  labelActive: {
    color: ACTIVE_COLOR,
  },
  labelCompleted: {
    color: ACTIVE_COLOR,
    opacity: 0.7,
  },
  labelInactive: {
    color: colors.textPrimary,
    opacity: 0.35,
  },
});
