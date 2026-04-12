import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import ViewChildScreen from "../view_child";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "123" }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("@/components/child-image", () => ({
  ChildImageCard: ({ child }: { child: any }) => <>{child.fullName}</>,
}));

describe("ViewChildScreen", () => {
  const mockChild = {
    id: "123",
    fullName: "John Doe",
    age: 5,
    height: 100,
    weight: 20,
    gender: "male",
    otherMedicalNotes: "Allergic to peanuts",
    hasBirthmarks: "yes",
    birthmarksDescription: "Small birthmark on left arm",
    hasScars: "no",
    hasIdentifyingFeatures: "yes",
    identifyingFeaturesDescription: "Glasses",
    lastKnownLocation: "Home",
    schoolDaycareType: "Daycare",
    schoolDaycareName: "Sunshine Daycare",
    sportsTeams: "Soccer",
    parent1Name: "Jane Doe",
    parent1Address: "123 Main St",
    parent1Phone: "(123) 456-7890",
    parent2Name: "John Sr",
    emergencyContacts: [
      {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "(123) 456-7890",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );

    const { getByTestId } = render(<ViewChildScreen />);
    // Screen should render without crashing
    expect(getByTestId).toBeDefined();
  });

  it("renders child information when loaded", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([mockChild]),
    );

    const { getAllByText } = render(<ViewChildScreen />);

    await waitFor(() => {
      // There are multiple elements with "John Doe"
      expect(getAllByText("John Doe").length).toBeGreaterThan(0);
    });
  });

  it("displays age information", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([mockChild]),
    );

    const { getByText } = render(<ViewChildScreen />);

    await waitFor(() => {
      expect(getByText("5 years old")).toBeTruthy();
    });
  });

  it("displays height and weight", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([mockChild]),
    );

    const { getByText } = render(<ViewChildScreen />);

    await waitFor(() => {
      expect(getByText("100 cm")).toBeTruthy();
      expect(getByText("20 lbs")).toBeTruthy();
    });
  });

  it("displays medical notes when present", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([mockChild]),
    );

    const { getByText } = render(<ViewChildScreen />);

    await waitFor(() => {
      expect(getByText("Allergic to peanuts")).toBeTruthy();
    });
  });

  it("displays emergency contacts", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([mockChild]),
    );

    const { getByText } = render(<ViewChildScreen />);

    await waitFor(() => {
      expect(getByText("Mother")).toBeTruthy();
      expect(getByText("(123) 456-7890")).toBeTruthy();
    });
  });
});
