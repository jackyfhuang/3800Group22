import {
    colors,
    Colors,
    Fonts,
    palette,
    radius,
    spacing,
    typography,
} from "@/constants/theme";

describe("Theme Constants", () => {
  describe("palette", () => {
    it("should have brand colors", () => {
      expect(palette.navy).toBe("#182835");
      expect(palette.navyLight).toBe("#4A6FA5");
      expect(palette.blue).toBe("#007AFF");
      expect(palette.teal).toBe("#119DA4");
      expect(palette.amber).toBe("#f2c180");
      expect(palette.offWhite).toBe("#f4f4f4");
    });

    it("should have danger colors", () => {
      expect(palette.red).toBe("#FF4444");
      expect(palette.redLight).toBe("#FFF0F0");
      expect(palette.redBorder).toBe("#FFE0E0");
      expect(palette.redBackground).toBe("#FFF5F5");
    });

    it("should have neutral colors", () => {
      expect(palette.black).toBe("#000000");
      expect(palette.white).toBe("#FFFFFF");
      expect(palette.lightBorder).toBe("#E8E8E8");
      expect(palette.subtleBorder).toBe("#F0F0F0");
    });

    it("should have teal tints", () => {
      expect(palette.tealLight).toBe("#EAF7F7");
      expect(palette.tealBorder).toBe("#B2E0E2");
    });

    it("should have blue tints", () => {
      expect(palette.blueLight).toBe("#F0F7FF");
      expect(palette.blueBorder).toBe("#E0F0FF");
    });
  });

  describe("colors (light theme)", () => {
    it("should have background colors", () => {
      expect(colors.appBackground).toBe(palette.offWhite);
      expect(colors.cardBackground).toBe(palette.white);
      expect(colors.inputBackground).toBe(palette.white);
      expect(colors.tabBarBackground).toBe(palette.white);
    });

    it("should have action colors", () => {
      expect(colors.primary).toBe(palette.blue);
      expect(colors.primaryLight).toBe(palette.blueLight);
      expect(colors.primaryBorder).toBe(palette.blueBorder);
      expect(colors.secondary).toBe(palette.teal);
      expect(colors.secondaryLight).toBe(palette.tealLight);
      expect(colors.secondaryBorder).toBe(palette.tealBorder);
    });

    it("should have danger colors", () => {
      expect(colors.danger).toBe(palette.red);
      expect(colors.dangerLight).toBe(palette.redLight);
      expect(colors.dangerBorder).toBe(palette.redBorder);
      expect(colors.dangerBackground).toBe(palette.redBackground);
    });

    it("should have text colors", () => {
      expect(colors.textPrimary).toBe(palette.navy);
      expect(colors.textName).toBe(palette.navyLight);
      expect(colors.textSubtle).toBe(palette.teal);
      expect(colors.textOnDark).toBe(palette.white);
      expect(colors.textOnLight).toBe(palette.navy);
    });

    it("should have shadow colors", () => {
      expect(colors.cardShadow).toBe(palette.amber);
      expect(colors.inputShadow).toBe(palette.amber);
      expect(colors.inputSelection).toBe(palette.amber);
    });

    it("should have border colors", () => {
      expect(colors.cardBorder).toBe(palette.lightBorder);
      expect(colors.subtleBorder).toBe(palette.subtleBorder);
    });

    it("should have misc colors", () => {
      expect(colors.white).toBe(palette.white);
      expect(colors.black).toBe(palette.black);
    });
  });

  describe("Colors (theme)", () => {
    it("should have light theme colors", () => {
      expect(Colors.light.text).toBe(palette.navy);
      expect(Colors.light.background).toBe(palette.offWhite);
      expect(Colors.light.tint).toBe(palette.blue);
      expect(Colors.light.icon).toBe(palette.blue);
      expect(Colors.light.tabIconDefault).toBe(palette.navy);
      expect(Colors.light.tabIconSelected).toBe(palette.blue);
    });

    it("should have dark theme colors", () => {
      expect(Colors.dark.text).toBe(palette.white);
      expect(Colors.dark.background).toBe(palette.navy);
      expect(Colors.dark.tint).toBe(palette.blue);
      expect(Colors.dark.icon).toBe(palette.blue);
      expect(Colors.dark.tabIconDefault).toBe(palette.offWhite);
      expect(Colors.dark.tabIconSelected).toBe(palette.blue);
    });
  });

  describe("spacing", () => {
    it("should have correct spacing values", () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(12);
      expect(spacing.lg).toBe(16);
      expect(spacing.xl).toBe(20);
      expect(spacing.xxl).toBe(24);
      expect(spacing.xxxl).toBe(40);
    });

    it("should have ascending spacing values", () => {
      expect(spacing.xs).toBeLessThan(spacing.sm);
      expect(spacing.sm).toBeLessThan(spacing.md);
      expect(spacing.md).toBeLessThan(spacing.lg);
      expect(spacing.lg).toBeLessThan(spacing.xl);
      expect(spacing.xl).toBeLessThan(spacing.xxl);
      expect(spacing.xxl).toBeLessThan(spacing.xxxl);
    });
  });

  describe("radius", () => {
    it("should have correct radius values", () => {
      expect(radius.sm).toBe(10);
      expect(radius.md).toBe(12);
      expect(radius.lg).toBe(14);
      expect(radius.xl).toBe(16);
      expect(radius.xxl).toBe(28);
    });

    it("should have ascending radius values", () => {
      expect(radius.sm).toBeLessThan(radius.md);
      expect(radius.md).toBeLessThan(radius.lg);
      expect(radius.lg).toBeLessThan(radius.xl);
      expect(radius.xl).toBeLessThan(radius.xxl);
    });
  });

  describe("typography", () => {
    it("should have correct font size values", () => {
      expect(typography.tiny).toBe(12);
      expect(typography.small).toBe(13);
      expect(typography.body).toBe(14);
      expect(typography.default).toBe(16);
      expect(typography.button).toBe(17);
      expect(typography.subtitle).toBe(20);
      expect(typography.title).toBe(20);
      expect(typography.heading).toBe(22);
      expect(typography.large).toBe(32);
      expect(typography.hero).toBe(36);
    });

    it("should have ascending font size values", () => {
      expect(typography.tiny).toBeLessThan(typography.small);
      expect(typography.small).toBeLessThan(typography.body);
      expect(typography.body).toBeLessThan(typography.default);
      expect(typography.default).toBeLessThan(typography.button);
    });
  });

  describe("Fonts", () => {
    it("should have font definitions", () => {
      // Fonts uses Platform.select, so we check the structure
      const fontKeys = Object.keys(Fonts);
      expect(fontKeys.length).toBeGreaterThan(0);
    });

    it("should have font configuration", () => {
      // Check that Fonts has the expected structure
      const fontKeys = Object.keys(Fonts);
      expect(fontKeys.length).toBeGreaterThan(0);

      // Fonts should be an object with platform-specific configs
      expect(typeof Fonts).toBe("object");
    });
  });
});
