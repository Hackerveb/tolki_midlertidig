import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    light: 'sans-serif-light',
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif-bold',
  },
  default: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily?.semibold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  h2: {
    fontFamily: fontFamily?.semibold,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  h3: {
    fontFamily: fontFamily?.medium,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  h4: {
    fontFamily: fontFamily?.medium,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  h5: {
    fontFamily: fontFamily?.medium,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  h6: {
    fontFamily: fontFamily?.medium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily?.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  body: {
    fontFamily: fontFamily?.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontFamily: fontFamily?.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  
  // Labels
  labelLarge: {
    fontFamily: fontFamily?.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fontFamily?.medium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamily?.medium,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
  
  // Buttons
  button: {
    fontFamily: fontFamily?.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  buttonLarge: {
    fontFamily: fontFamily?.medium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  
  // Caption
  caption: {
    fontFamily: fontFamily?.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
  },
  
  // Overline
  overline: {
    fontFamily: fontFamily?.regular,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 1.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  
  // Monospace (for code/numbers)
  mono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
};