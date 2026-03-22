import { render } from "@testing-library/react-native";
import React from "react";
import AddChildScreen from "../add_child";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock(
  "@react-native-async-storage/async-storage",
  () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }),
);

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(
    () => Promise.resolve({ granted: true }),
  ),
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
}));

describe("AddChildScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <AddChildScreen />,
    );

    // Check that the screen renders
    expect(
      getByText("Create Profile"),
    ).toBeTruthy();
  });

  it("renders form fields", () => {
    const { getByText } = render(
      <AddChildScreen />,
    );

    // Check for form fields
    expect(getByText("Full Name")).toBeTruthy();
    expect(getByText("Age")).toBeTruthy();
    expect(getByText("Gender")).toBeTruthy();
  });

  it("renders save button", () => {
    const { getByText } = render(
      <AddChildScreen />,
    );

    // Check for save button
    expect(
      getByText("Save Profile"),
    ).toBeTruthy();
  });
});
