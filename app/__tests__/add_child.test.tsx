import { render } from "@testing-library/react-native";
import React from "react";
import AddChildScreen from "../(tabs)/add_child";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true }),
  ),
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe("AddChildScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(<AddChildScreen />);

    // Check that the screen renders
    expect(getByText("Essential ID")).toBeTruthy();
  });

  it("renders form fields", () => {
    const { getByText } = render(<AddChildScreen />);

    // Check for form fields
    expect(getByText("First Name")).toBeTruthy();
    expect(getByText("Last Name")).toBeTruthy();
    expect(getByText("Date of Birth")).toBeTruthy();
  });

  it("renders save button", () => {
    const { getByText } = render(<AddChildScreen />);

    // Step 1 should show next button
    expect(getByText("Next →")).toBeTruthy();
  });
});
