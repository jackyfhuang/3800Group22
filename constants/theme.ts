import { Platform } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────
// All raw color values live here. Nothing else in the app should have hex codes.
export const palette = {
  // Brand
  blue: '#007AFF',
  blueLight: '#F0F7FF',
  blueBorder: '#E0F0FF',

  // Danger
  red: '#FF4444',
  redLight: '#FFF0F0',
  redBorder: '#FFE0E0',
  redBackground: '#FFF5F5',

  // Neutrals
  black: '#1a1a1a',
  darkGray: '#333',
  midGray: '#666',
  gray: '#999',
  lightGray: '#E8E8E8',
  subtleBorder: '#F0F0F0',
  offWhite: '#FAFAFA',
  white: '#fff',
  pureBlack: '#000',
} as const;

// ─── Semantic Colors ──────────────────────────────────────────────────────────
// Named by purpose, not by appearance. Use these throughout the app.
export const colors = {
  primary: palette.blue,
  primaryLight: palette.blueLight,
  primaryBorder: palette.blueBorder,
  primaryShadow: palette.blue,

  danger: palette.red,
  dangerLight: palette.redLight,
  dangerBorder: palette.redBorder,
  dangerBackground: palette.redBackground,

  black: palette.black,
  darkGray: palette.darkGray,
  midGray: palette.midGray,
  gray: palette.gray,
  lightGray: palette.lightGray,
  subtleBorder: palette.subtleBorder,
  offWhite: palette.offWhite,
  white: palette.white,
  cardShadow: palette.pureBlack,
} as const;

// ─── Theme (Light / Dark) ─────────────────────────────────────────────────────
// Used by ThemedText, ThemedView, and the navigation ThemeProvider.
export const Colors = {
  light: {
    text: palette.black,
    background: palette.white,
    tint: palette.blue,
    icon: palette.blue,
    tabIconDefault: palette.gray,
    tabIconSelected: palette.blue,
  },
  dark: {
    text: palette.black,
    background: palette.white,
    tint: palette.blue,
    icon: palette.blue,
    tabIconDefault: palette.gray,
    tabIconSelected: palette.blue,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 28,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  tiny: 12,
  small: 13,
  body: 14,
  default: 16,
  button: 17,
  subtitle: 18,
  title: 20,
  heading: 22,
  large: 32,
  hero: 36,
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
