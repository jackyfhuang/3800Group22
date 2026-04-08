// Combines a field label, AppTextInput, and inline error message into a
// single reusable form row. Wraps react-hook-form's Controller internally
// so individual screens don't need to repeat that boilerplate per field.
import { spacing } from "@/styles";
import { formatPhoneNumber } from "@/utils/phone";
import React from "react";
import { Control, Controller } from "react-hook-form";
import { StyleSheet, TextInputProps, View } from "react-native";
import { AppText } from "./app-text";
import { AppTextInput } from "./app-text-input";

type FormFieldProps = TextInputProps & {
  control: Control<any>;
  name: string;
  label: string;
  error?: string;
  containerStyle?: object;
};

export function FormField({
  control,
  name,
  label,
  error,
  containerStyle,
  multiline,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="fieldLabel">{label}</AppText>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          const handleChangeText = (text: string) => {
            if (inputProps.keyboardType === "phone-pad") {
              onChange(formatPhoneNumber(text));
              return;
            }

            onChange(text);
          };

          return (
            <AppTextInput
              onBlur={onBlur}
              onChangeText={handleChangeText}
              value={value?.toString() ?? ""}
              hasError={!!error}
              multiline={multiline}
              {...inputProps}
            />
          );
        }}
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
