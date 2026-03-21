// Reusable screen header: back button | centered title | home button.
// Both buttons are off-white circles with an amber glow on press.
import { palette } from '@/constants/theme';
import { colors, spacing, typography } from '@/styles';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Called when the left (back) button is pressed */
  onLeftPress: () => void;
  /** Called when the right (home/security) button is pressed */
  onRightPress: () => void;
};

export function ScreenHeader({
  title,
  subtitle,
  onLeftPress,
  onRightPress,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Left — back */}
      <Pressable
        onPress={onLeftPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <MaterialIcons
          name="arrow-back-ios"
          size={18}
          color={palette.navy}
          style={{ marginLeft: 4 }}
        />
      </Pressable>

      {/* Center — title + optional subtitle */}
      <View style={styles.titleContainer}>
        <AppText style={styles.title}>{title}</AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>

      {/* Right — home / security */}
      <Pressable
        onPress={onRightPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <MaterialIcons name="security" size={20} color={palette.navy} />
      </Pressable>
    </View>
  );
}

// ─── Unsaved-changes confirmation helper (shared logic) ───────────────────────
export function confirmDiscard(onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const ok = (typeof window !== 'undefined' && window.confirm)
      ? window.confirm('Unsaved changes will be lost. Go back?')
      : true;
    if (ok) onConfirm();
  } else {
    const { Alert } = require('react-native');
    Alert.alert('Unsaved Changes', 'Your changes will not be saved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.offWhite,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    shadowColor: palette.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
    borderColor: palette.amber,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.large,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: 2,
  },
});
