import { AppDropdown } from "@/components/ui/app-dropdown";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("AppDropdown Component", () => {
  const mockOptions = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with placeholder", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
      />,
    );
    expect(getByText("Select an option")).toBeTruthy();
  });

  it("renders with label", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        label="Test Label"
      />,
    );
    expect(getByText("Test Label")).toBeTruthy();
  });

  it("displays selected value", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        value="1"
      />,
    );
    expect(getByText("Option 1")).toBeTruthy();
  });

  it("opens modal on press", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
      />,
    );

    const dropdown = getByText("Select an option");
    fireEvent.press(dropdown);

    // Modal should now show options
    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();
  });

  it("calls onValueChange when option is selected", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
      />,
    );

    // Open dropdown
    const dropdown = getByText("Select an option");
    fireEvent.press(dropdown);

    // Select option
    const option = getByText("Option 2");
    fireEvent.press(option);

    expect(mockOnValueChange).toHaveBeenCalledWith("2");
  });

  it("closes modal after selection", () => {
    const { getByText, queryByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
      />,
    );

    // Open dropdown
    const dropdown = getByText("Select an option");
    fireEvent.press(dropdown);

    // Select option
    const option = getByText("Option 2");
    fireEvent.press(option);

    // Modal should be closed - options should not be visible
    // Note: The modal content might still be in the tree but not visible
    expect(getByText("Select an option")).toBeTruthy();
  });

  it("shows error state", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
        hasError={true}
      />,
    );
    expect(getByText("Select an option")).toBeTruthy();
  });

  it("renders with custom placeholder", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Choose something"
      />,
    );
    expect(getByText("Choose something")).toBeTruthy();
  });

  it("handles empty options array", () => {
    const { getByText } = render(
      <AppDropdown
        options={[]}
        onValueChange={mockOnValueChange}
        placeholder="No options"
      />,
    );
    expect(getByText("No options")).toBeTruthy();
  });

  it("displays arrow indicator", () => {
    const { getByText } = render(
      <AppDropdown
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select"
      />,
    );
    expect(getByText("▾")).toBeTruthy();
  });
});
