import { Platform } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────
// All raw color values live here. Nothing else in the app should have hex codes.
export const palette = {
  // Brand
  navy: '#182835',
  navyLight: '#4A6FA5',
  blue: '#007AFF',
  teal: '#119DA4',
  amber: '#f2c180',
  offWhite: '#f4f4f4',

  // Danger
  red: '#FF4444',
  redLight: '#FFF0F0',
  redBorder: '#FFE0E0',
  redBackground: '#FFF5F5',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  lightBorder: '#E8E8E8',
  subtleBorder: '#F0F0F0',

  // Teal tints
  tealLight: '#EAF7F7',
  tealBorder: '#B2E0E2',

  // Blue tints
  blueLight: '#F0F7FF',
  blueBorder: '#E0F0FF',
} as const;

// ─── Semantic Colors (Light Theme) ────────────────────────────────────────────
// Named by purpose, not by appearance. Use these throughout the app.
export const colors = {
  // Backgrounds
  appBackground: palette.offWhite,
  cardBackground: palette.white,
  inputBackground: palette.white,
  tabBarBackground: palette.white,

  // Actions
  primary: palette.blue,
  primaryLight: palette.blueLight,
  primaryBorder: palette.blueBorder,
  primaryShadow: palette.blue,

  secondary: palette.teal,
  secondaryLight: palette.tealLight,
  secondaryBorder: palette.tealBorder,

  // Danger
  danger: palette.red,
  dangerLight: palette.redLight,
  dangerBorder: palette.redBorder,
  dangerBackground: palette.redBackground,

  // Text
  textPrimary: palette.navy,
  textName: palette.navyLight,
  textSubtle: palette.teal,
  textOnDark: palette.white,
  textOnLight: palette.navy,

  // Shadows
  cardShadow: palette.amber,
  inputShadow: palette.amber,

  // Borders
  cardBorder: palette.lightBorder,
  subtleBorder: palette.subtleBorder,

  // Misc
  white: palette.white,
  black: palette.black,
} as const;

// ─── Theme (Light / Dark) ─────────────────────────────────────────────────────
// Used by ThemedText, ThemedView, and the navigation ThemeProvider.
export const Colors = {
  light: {
    text: palette.navy,
    background: palette.offWhite,
    tint: palette.blue,
    icon: palette.blue,
    tabIconDefault: palette.navy,
    tabIconSelected: palette.blue,
  },
  dark: {
    text: palette.white,
    background: palette.navy,
    tint: palette.blue,
    icon: palette.blue,
    tabIconDefault: palette.offWhite,
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
