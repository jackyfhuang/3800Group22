import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Controller,
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';
import { AppText } from './app-text';
import { AppTextInput } from './app-text-input';
import { spacing } from '@/styles';
import { TextInputProps } from 'react-native';

// Combines a field label, AppTextInput, and inline error message into a
// single reusable form row. Wraps react-hook-form's Controller internally
// so individual screens don't need to repeat that boilerplate per field.

type FormFieldProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  containerStyle?: object;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  containerStyle,
  multiline,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="fieldLabel">{label}</AppText>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppTextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString()}
            hasError={!!error}
            multiline={multiline}
            {...inputProps}
          />
        )}
      />
      {error && <AppText variant="error">{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
});
