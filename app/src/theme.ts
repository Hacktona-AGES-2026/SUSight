import { StyleSheet, TextStyle } from 'react-native';

// Tokens from the Figma "Pulse" styles. Swap the palette here; screens only use these names.
export const colors = {
  textPrimary: '#1c1c1e',
  textSecondary: '#636366',
  textMuted: '#3a3a3c',
  surface: '#ffffff',
  black: '#111111',
  divider: '#e8e8ed',
  chevron: '#c7c7cc',
  chip: '#ebebef',
  accentInk: '#a3205b',
  accentInkStrong: '#7a1b4a',
  accentAction: '#f5a3c4',
  accentMedium: '#c42c6d',
  accentHighlight: '#f9d6e4',
  accentSoft: '#fce6ee',
  dangerInk: '#9c1f52',
  dangerSoft: '#fdeef4',
  dot: '#d6336c',
  splashTop: '#f8f9d6',
  scrim: 'rgba(0,0,0,0.35)',
};

const font = (fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight'] = '400') => ({
  fontSize,
  lineHeight,
  fontWeight,
  color: colors.textPrimary,
});

export const type = StyleSheet.create({
  largeTitle: font(34, 41, '700'),
  title: font(22, 28, '600'),
  title3: font(20, 25, '600'),
  body: font(17, 22),
  bodyStrong: font(17, 22, '600'),
  subtitle: font(15, 20),
  subtitleStrong: font(15, 20, '600'),
  note: font(13, 18),
  noteStrong: font(13, 18, '600'),
  caption: font(12, 16, '500'),
  tab: font(11, 13, '500'),
});

export const shadow = {
  shadowColor: '#1a0d14',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
