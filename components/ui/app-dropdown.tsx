import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AppText } from './app-text';
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
      <View>
        <TouchableOpacity
          style={[
            styles.dropdown,
            hasError && styles.errorDropdown,
            isOpen && styles.focusedDropdown,
          ]}
          onPress={() => setIsOpen(!isOpen)}
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
          <AppText style={[styles.arrow, isOpen && styles.arrowOpen]}>{'\u25BC'}</AppText>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                  index === options.length - 1 && styles.lastOption,
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
        )}
      </View>
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    transform: [{ rotate: '0deg' }],
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  optionsContainer: {
    marginTop: 0,
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    overflow: 'hidden',
  },
  option: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder + '40',
  },
  lastOption: {
    borderBottomWidth: 0,
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