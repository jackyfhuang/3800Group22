import {
  colors,
  radius,
  spacing,
  typography,
} from "@/styles";
import React, {
  useRef,
  useState
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "./app-text";

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
  placeholder = "Select an option",
  hasError,
  label,
}: AppDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] =
    useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  // Get the selected option's label
  const selectedOption = options.find(
    (opt) => opt.value === value,
  );

  // Measure the button position for positioning the dropdown
  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow(
        (x, y, width, height) => {
          setButtonPosition({
            x,
            y,
            width,
            height,
          });
        },
      );
    }
  };

  const handleOpen = () => {
    measureButton();
    setIsOpen(true);
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  const handleOverlayPress = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText
          variant="fieldLabel"
          style={styles.label}
        >
          {label}
        </AppText>
      )}

      {/* Dropdown Button */}
      <View
        ref={buttonRef}
        style={[
          styles.button,
          hasError && styles.errorButton,
          isOpen && styles.buttonOpen,
        ]}
      >
        <TouchableOpacity
          style={styles.buttonContent}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <AppText
            style={[
              styles.buttonText,
              !selectedOption &&
                styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedOption
              ? selectedOption.label
              : placeholder}
          </AppText>
          <AppText style={styles.chevron}>
            {isOpen ? "▲" : "▼"}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={handleOverlayPress}
        >
          <View
            style={[
              styles.dropdown,
              {
                top:
                  buttonPosition.y +
                  buttonPosition.height +
                  4,
                left: buttonPosition.x,
                width: buttonPosition.width,
              },
            ]}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  option.value === value &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  handleSelect(option.value)
                }
                activeOpacity={0.7}
              >
                <AppText
                  style={[
                    styles.optionText,
                    option.value === value &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </AppText>
                {option.value === value && (
                  <AppText
                    style={styles.checkmark}
                  >
                    ✓
                  </AppText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
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
  button: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    minHeight: 52,
    justifyContent: "center",
    shadowColor: colors.inputShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonOpen: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  errorButton: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBackground,
  },
  buttonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    fontSize: typography.default,
    color: colors.textOnLight,
    flex: 1,
  },
  placeholderText: {
    color: colors.textSubtle,
  },
  chevron: {
    fontSize: 12,
    color: colors.textSubtle,
    marginLeft: spacing.sm,
    transform: [{ rotate: '0deg' }],
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 250,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: typography.default,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
});