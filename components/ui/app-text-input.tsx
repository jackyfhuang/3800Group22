// Base input component with amber selection highlight, themed placeholder
// color, and consistent input styling baked in. Use hasError prop to
// trigger the error border state. Border turns amber on focus.
import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';
import { colors, radius, spacing, typography } from '@/styles';

type AppTextInputProps = TextInputProps & {
  hasError?: boolean;
};

export function AppTextInput({
  hasError,
  style,
  multiline,
  onFocus,
  onBlur,
  ...props
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      selectionColor={colors.inputSelection}
      placeholderTextColor={colors.textSubtle}
      multiline={multiline}
      style={[
        styles.input,
        isFocused && styles.focusedInput,
        hasError && styles.errorInput,
        multiline && styles.textArea,
        // Suppress native focus outline on web only
        Platform.OS === 'web' &&
          ({ outlineWidth: 0, outlineStyle: 'none' } as any),
        style,
      ]}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  focusedInput: {
    borderColor: colors.inputSelection,
    shadowOpacity: 0.4,
  },
  errorInput: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1.5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.lg,
  },
});
