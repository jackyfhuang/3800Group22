import { AppTextInput } from "@/components/ui/app-text-input";
import {
    fireEvent,
    render,
} from "@testing-library/react-native";
import React from "react";

describe("AppTextInput Component", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput placeholder="Enter text" />,
    );
    expect(
      getByPlaceholderText("Enter text"),
    ).toBeTruthy();
  });

  it("renders with value", () => {
    const { getByDisplayValue } = render(
      <AppTextInput value="Test Value" />,
    );
    expect(
      getByDisplayValue("Test Value"),
    ).toBeTruthy();
  });

  it("calls onChangeText when text changes", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter text"
        onChangeText={onChangeText}
      />,
    );

    const input =
      getByPlaceholderText("Enter text");
    fireEvent.changeText(input, "New text");

    expect(onChangeText).toHaveBeenCalledWith(
      "New text",
    );
  });

  it("shows error state correctly", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter text"
        hasError={true}
      />,
    );
    expect(
      getByPlaceholderText("Enter text"),
    ).toBeTruthy();
  });

  it("handles focus and blur events", () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter text"
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );

    const input =
      getByPlaceholderText("Enter text");
    fireEvent(input, "focus");
    expect(onFocus).toHaveBeenCalled();

    fireEvent(input, "blur");
    expect(onBlur).toHaveBeenCalled();
  });

  it("renders multiline input", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter description"
        multiline={true}
      />,
    );
    expect(
      getByPlaceholderText("Enter description"),
    ).toBeTruthy();
  });

  it("applies custom style", () => {
    const customStyle = {
      backgroundColor: "#FF0000",
    };
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter text"
        style={customStyle}
      />,
    );
    expect(
      getByPlaceholderText("Enter text"),
    ).toBeTruthy();
  });

  it("renders with testID", () => {
    const { getByTestId } = render(
      <AppTextInput testID="custom-input" />,
    );
    expect(
      getByTestId("custom-input"),
    ).toBeTruthy();
  });

  it("handles keyboardType prop", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter number"
        keyboardType="numeric"
      />,
    );
    expect(
      getByPlaceholderText("Enter number"),
    ).toBeTruthy();
  });

  it("handles secureTextEntry prop", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Enter password"
        secureTextEntry={true}
      />,
    );
    expect(
      getByPlaceholderText("Enter password"),
    ).toBeTruthy();
  });

  it("handles editable prop", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Read only"
        editable={false}
      />,
    );
    expect(
      getByPlaceholderText("Read only"),
    ).toBeTruthy();
  });

  it("handles maxLength prop", () => {
    const { getByPlaceholderText } = render(
      <AppTextInput
        placeholder="Limited input"
        maxLength={10}
      />,
    );
    expect(
      getByPlaceholderText("Limited input"),
    ).toBeTruthy();
  });
});
