import { AppText } from "@/components/ui/app-text";
import { render } from "@testing-library/react-native";
import React from "react";

describe("AppText Component", () => {
  it("renders with default variant (body)", () => {
    const { getByText } = render(
      <AppText>Hello World</AppText>,
    );
    const textElement = getByText("Hello World");
    expect(textElement).toBeTruthy();
  });

  it("renders with heading variant", () => {
    const { getByText } = render(
      <AppText variant="heading">
        Heading Text
      </AppText>,
    );
    const textElement = getByText("Heading Text");
    expect(textElement).toBeTruthy();
  });

  it("renders with subtitle variant", () => {
    const { getByText } = render(
      <AppText variant="subtitle">
        Subtitle Text
      </AppText>,
    );
    const textElement = getByText(
      "Subtitle Text",
    );
    expect(textElement).toBeTruthy();
  });

  it("renders with body variant", () => {
    const { getByText } = render(
      <AppText variant="body">Body Text</AppText>,
    );
    const textElement = getByText("Body Text");
    expect(textElement).toBeTruthy();
  });

  it("renders with label variant", () => {
    const { getByText } = render(
      <AppText variant="label">
        Label Text
      </AppText>,
    );
    const textElement = getByText("Label Text");
    expect(textElement).toBeTruthy();
  });

  it("renders with error variant", () => {
    const { getByText } = render(
      <AppText variant="error">
        Error Text
      </AppText>,
    );
    const textElement = getByText("Error Text");
    expect(textElement).toBeTruthy();
  });

  it("renders with fieldLabel variant", () => {
    const { getByText } = render(
      <AppText variant="fieldLabel">
        Field Label Text
      </AppText>,
    );
    const textElement = getByText(
      "Field Label Text",
    );
    expect(textElement).toBeTruthy();
  });

  it("renders with detail variant", () => {
    const { getByText } = render(
      <AppText variant="detail">
        Detail Text
      </AppText>,
    );
    const textElement = getByText("Detail Text");
    expect(textElement).toBeTruthy();
  });

  it("renders with detailValue variant", () => {
    const { getByText } = render(
      <AppText variant="detailValue">
        Detail Value Text
      </AppText>,
    );
    const textElement = getByText(
      "Detail Value Text",
    );
    expect(textElement).toBeTruthy();
  });

  it("applies custom style", () => {
    const customStyle = {
      color: "#FF0000",
      fontSize: 24,
    };
    const { getByText } = render(
      <AppText style={customStyle}>
        Styled Text
      </AppText>,
    );
    const textElement = getByText("Styled Text");
    expect(textElement).toBeTruthy();
  });

  it("passes additional props to Text component", () => {
    const { getByTestId } = render(
      <AppText testID="custom-text">
        Test ID Text
      </AppText>,
    );
    expect(
      getByTestId("custom-text"),
    ).toBeTruthy();
  });
});
