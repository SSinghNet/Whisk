export const COLORS = {
  background: '#f1f5f9',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',

  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  border: '#e2e8f0',
  borderSoft: '#f1f5f9',
  inputFill: '#f1f5f9',

  primary: '#4f46e5',
  primaryAlt: '#059669',
  primarySoft: '#eef2ff',
  success: '#16a34a',
  successSoft: '#ecfdf5',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
  info: '#3b82f6',
  disabled: '#94a3b8',

  overlay: 'rgba(15, 23, 42, 0.45)',
  cardShadow: '#0f172a',

  selectedBg: '#eef2ff',
  selectedBorder: '#4f46e5',

  placeholder: '#94a3b8',

  buttonText: '#ffffff',
};

// Theme object for consistent spacing and sizing
export const THEME = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  sizing: {
    radius: {
      sm: 8,
      md: 10,
      lg: 12,
      xl: 16,
      xxl: 20,
      full: 9999,
    },
    fab: 56,
    fabRadius: 18,
    buttonHeight: 48,
    minInputHeight: 48,
  },
  shadow: {
    light: {
      shadowColor: COLORS.cardShadow,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 13,
      base: 14,
      md: 15,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      xxxxl: 28,
      huge: 32,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};
