import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppText } from './app-text';
import { AppTextInput } from './app-text-input';
import { colors, radius, spacing, typography } from '@/styles';

type DropdownOption = {
  label: string;
  value: string;
};

type AppDropdownProps = {
  options: DropdownOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  label?: string;
};

export function AppDropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  hasError,
  label,
}: AppDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="fieldLabel" style={styles.label}>
          {label}
        </AppText>
      )}
      <TouchableOpacity
        style={[
          styles.dropdown,
          hasError && styles.errorDropdown,
          isOpen && styles.focusedDropdown,
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <AppText
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </AppText>
        <AppText style={styles.arrow}>▼</AppText>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <AppText
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  label: {
    marginBottom: spacing.sm,
  },
  dropdown: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.inputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  focusedDropdown: {
    borderColor: colors.inputSelection,
    shadowOpacity: 0.4,
  },
  errorDropdown: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
  },
  dropdownText: {
    fontSize: typography.default,
    color: colors.textOnLight,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSubtle,
  },
  arrow: {
    fontSize: 12,
    color: colors.textSubtle,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    minWidth: 280,
    maxWidth: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  selectedOption: {
    backgroundColor: colors.inputSelection + '20',
  },
  optionText: {
    fontSize: typography.default,
    color: colors.textOnLight,
  },
  selectedOptionText: {
    color: colors.inputSelection,
    fontWeight: '600',
  },
});
