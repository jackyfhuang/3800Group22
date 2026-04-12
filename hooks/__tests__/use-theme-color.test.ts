import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("@/constants/theme", () => ({
  Colors: {
    light: {
      text: "#000000",
      background: "#ffffff",
      tint: "#007AFF",
      icon: "#007AFF",
      tabIconDefault: "#000000",
      tabIconSelected: "#007AFF",
    },
    dark: {
      text: "#ffffff",
      background: "#000000",
      tint: "#007AFF",
      icon: "#007AFF",
      tabIconDefault: "#ffffff",
      tabIconSelected: "#007AFF",
    },
  },
}));

describe("useThemeColor Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return light theme color when color scheme is light", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "light",
    );

    const { result } = renderHook(() =>
      useThemeColor({}, "text"),
    );

    expect(result.current).toBe("#000000");
  });

  it("should return dark theme color when color scheme is dark", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "dark",
    );

    const { result } = renderHook(() =>
      useThemeColor({}, "text"),
    );

    expect(result.current).toBe("#ffffff");
  });

  it("should return color from props when provided for light theme", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "light",
    );

    const { result } = renderHook(() =>
      useThemeColor(
        { light: "#FF0000", dark: "#00FF00" },
        "text",
      ),
    );

    expect(result.current).toBe("#FF0000");
  });

  it("should return color from props when provided for dark theme", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "dark",
    );

    const { result } = renderHook(() =>
      useThemeColor(
        { light: "#FF0000", dark: "#00FF00" },
        "text",
      ),
    );

    expect(result.current).toBe("#00FF00");
  });

  it("should prefer props over theme colors", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "light",
    );

    const { result } = renderHook(() =>
      useThemeColor({ light: "#FF0000" }, "text"),
    );

    expect(result.current).toBe("#FF0000");
  });

  it("should return theme color when props are not provided", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "light",
    );

    const { result } = renderHook(() =>
      useThemeColor({}, "background"),
    );

    expect(result.current).toBe("#ffffff");
  });

  it("should handle null color scheme gracefully", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      null,
    );

    const { result } = renderHook(() =>
      useThemeColor({}, "text"),
    );

    // Default to light theme when null
    expect(result.current).toBe("#000000");
  });

  it("should work with different color names", () => {
    (useColorScheme as jest.Mock).mockReturnValue(
      "light",
    );

    const { result: textResult } = renderHook(
      () => useThemeColor({}, "text"),
    );
    expect(textResult.current).toBe("#000000");

    const { result: backgroundResult } =
      renderHook(() =>
        useThemeColor({}, "background"),
      );
    expect(backgroundResult.current).toBe(
      "#ffffff",
    );

    const { result: tintResult } = renderHook(
      () => useThemeColor({}, "tint"),
    );
    expect(tintResult.current).toBe("#007AFF");
  });
});
