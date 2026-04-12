// Themed dropdown component. Supports two modes:
// - Form mode: pass control + name for react-hook-form integration
// - Standalone mode: pass value + onValueChange for uncontrolled use
import { colors, radius, spacing, typography } from "@/styles";
import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "./app-text";

export type DropdownOption = {
  label: string;
  value: string;
};

type BaseProps = {
  label: string;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  containerStyle?: object;
};

type FormModeProps = BaseProps & {
  control: Control<any>;
  name: string;
  value?: never;
  onValueChange?: never;
};

type StandaloneModeProps = BaseProps & {
  control?: never;
  name?: never;
  value: string;
  onValueChange: (value: string) => void;
};

type AppDropdownProps = FormModeProps | StandaloneModeProps;

export function AppDropdown({
  label,
  options,
  placeholder = "Select",
  error,
  containerStyle,
  control,
  name,
  value: standaloneValue,
  onValueChange: standaloneOnChange,
}: AppDropdownProps) {
  const [open, setOpen] = useState(false);

  const renderDropdown = (
    value: string | undefined,
    onChange: (v: string) => void,
  ) => {
    const selected = options.find((o) => o.value === value);

    return (
      <View style={[styles.container, containerStyle]}>
        <AppText variant="fieldLabel">{label}</AppText>

        <TouchableOpacity
          style={[styles.trigger, !!error && styles.errorTrigger]}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <AppText
            style={selected ? styles.selectedText : styles.placeholderText}
          >
            {selected ? selected.label : placeholder}
          </AppText>
          <AppText style={styles.chevron}>▾</AppText>
        </TouchableOpacity>

        {error && <AppText variant="error">{error}</AppText>}

        <Modal visible={open} transparent animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          >
            <View style={styles.sheet}>
              <AppText variant="heading" style={styles.sheetTitle}>
                {label}
              </AppText>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <AppText
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </AppText>
                    {item.value === value && (
                      <AppText style={styles.checkmark}>✓</AppText>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // Form-integrated mode
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) =>
          renderDropdown(value as string, onChange)
        }
      />
    );
  }

  // Standalone mode
  return renderDropdown(standaloneValue, standaloneOnChange!);
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.inputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  errorTrigger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
  },
  placeholderText: {
    fontSize: typography.default,
    color: colors.textSubtle,
    flex: 1,
  },
  selectedText: {
    fontSize: typography.default,
    color: colors.textOnLight,
    flex: 1,
  },
  chevron: {
    fontSize: 16,
    color: colors.textSubtle,
    marginLeft: spacing.sm,
  },

  // ── Modal Sheet ────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: "60%",
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetTitle: {
    fontSize: typography.title,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  selectedOption: {
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.sm,
  },
  optionText: {
    fontSize: typography.default,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.secondary,
    fontWeight: "600",
  },
  checkmark: {
    color: colors.secondary,
    fontSize: typography.default,
    fontWeight: "700",
  },
});
