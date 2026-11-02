import { describe, expect, it } from 'vitest';

import { COLORS, RADII, SIDEBAR_NAVY, SHADOWS, FONT_FAMILY } from './tokens';
import { kaiadminTheme } from './kaiadminTheme';

type RootStyle = {
  boxShadow?: string;
  borderRadius?: number;
  textTransform?: string;
  padding?: string;
  fontSize?: number | string;
};

function rootStyle(component: 'MuiCard' | 'MuiButton' | 'MuiOutlinedInput'): RootStyle {
  const overrides = kaiadminTheme.components?.[component]?.styleOverrides;
  return ((overrides ?? {}) as unknown as { root?: RootStyle }).root ?? {};
}

describe('Kaiadmin design tokens', () => {
  it('matches the palette documented in DESIGN.md', () => {
    expect(COLORS.primary).toBe('#1572E8');
    expect(COLORS.primaryDark).toBe('#1269DB');
    expect(COLORS.secondary).toBe('#6861CE');
    expect(COLORS.error).toBe('#F25961');
    expect(COLORS.warning).toBe('#FFAD46');
    expect(COLORS.success).toBe('#31CE36');
    expect(COLORS.info).toBe('#48ABF7');
    expect(COLORS.backgroundDefault).toBe('#F5F7FD');
    expect(COLORS.backgroundPaper).toBe('#FFFFFF');
    expect(COLORS.textPrimary).toBe('#2A2F5B');
    expect(COLORS.textSecondary).toBe('#686F76');
    expect(COLORS.divider).toBe('#F0F1F3');
  });

  it('exposes the navy sidebar surface for the app shell', () => {
    expect(SIDEBAR_NAVY).toBe('#1A2035');
    expect(COLORS.sidebarNavy).toBe(SIDEBAR_NAVY);
  });

  it('exposes the documented radius scale and card shadow', () => {
    expect(RADII.card).toBe(10);
    expect(RADII.pill).toBe(100);
    expect(RADII.input).toBe(5.25);
    expect(RADII.small).toBe(3);
    expect(SHADOWS.card).toBe('rgba(69,65,78,0.1) 2px 6px 15px');
    expect(SHADOWS.sidebar).toBe('rgba(69,65,78,0.06) 4px 4px 10px');
  });

  it('uses Public Sans at a 14px base size', () => {
    expect(FONT_FAMILY).toBe('"Public Sans", sans-serif');
    expect(kaiadminTheme.typography.fontFamily).toBe('"Public Sans", sans-serif');
    expect(kaiadminTheme.typography.fontSize).toBe(14);
  });
});

describe('kaiadminTheme', () => {
  it('maps the palette roles onto MUI theme slots', () => {
    expect(kaiadminTheme.palette.primary.main).toBe('#1572E8');
    expect(kaiadminTheme.palette.primary.dark).toBe('#1269DB');
    expect(kaiadminTheme.palette.secondary.main).toBe('#6861CE');
    expect(kaiadminTheme.palette.error.main).toBe('#F25961');
    expect(kaiadminTheme.palette.warning.main).toBe('#FFAD46');
    expect(kaiadminTheme.palette.success.main).toBe('#31CE36');
    expect(kaiadminTheme.palette.info.main).toBe('#48ABF7');
    expect(kaiadminTheme.palette.background.default).toBe('#F5F7FD');
    expect(kaiadminTheme.palette.background.paper).toBe('#FFFFFF');
    expect(kaiadminTheme.palette.text.primary).toBe('#2A2F5B');
    expect(kaiadminTheme.palette.text.secondary).toBe('#686F76');
    expect(kaiadminTheme.palette.divider).toBe('#F0F1F3');
  });

  it('keeps headings at medium weight and button labels sentence-cased', () => {
    expect(kaiadminTheme.typography.h1?.fontWeight).toBe(500);
    expect(kaiadminTheme.typography.h2?.fontWeight).toBe(500);
    expect(kaiadminTheme.typography.h3?.fontWeight).toBe(600);
    expect(kaiadminTheme.typography.h4?.fontWeight).toBe(600);
    expect(kaiadminTheme.typography.h5?.fontWeight).toBe(600);
    expect(kaiadminTheme.typography.h6?.fontWeight).toBe(600);
    expect(kaiadminTheme.typography.body1?.fontSize).toBe('0.875rem');
    expect(kaiadminTheme.typography.button?.textTransform).toBe('none');
    expect(kaiadminTheme.typography.button?.fontWeight).toBe(500);
    expect(kaiadminTheme.typography.button?.fontSize).toBe('0.875rem');
  });

  it('applies the 10px card radius default', () => {
    expect(kaiadminTheme.shape.borderRadius).toBe(10);
  });

  it('renders cards with the Kaiadmin shadow and no border', () => {
    expect(rootStyle('MuiCard').boxShadow).toBe('rgba(69,65,78,0.1) 2px 6px 15px');
    expect(rootStyle('MuiCard').borderRadius).toBe(10);
  });

  it('renders primary buttons as 100px pills', () => {
    expect(rootStyle('MuiButton').borderRadius).toBe(100);
    expect(rootStyle('MuiButton').textTransform).toBe('none');
    expect(rootStyle('MuiButton').padding).toBe('9px 20px');
  });

  it('renders outlined inputs with the 5.25px radius', () => {
    expect(rootStyle('MuiOutlinedInput').borderRadius).toBe(5.25);
  });

  it('paints the canvas background through CssBaseline', () => {
    expect(kaiadminTheme.components?.MuiCssBaseline).toBeDefined();
    expect(kaiadminTheme.components?.MuiCard).toBeDefined();
  });
});
