/**
 * WHOLE HARBOR WELLNESS — DESIGN TOKENS
 * Single Source of Truth for Visual Identity & Approved Stitch Design
 */

export const colors = {
  // Whole Harbor Wellness (WHW) Exact Palette
  ivory: '#fffdfb',   // Main Background
  blush: '#fff6f3',   // Secondary Background / Cards
  petal: '#f7e5e1',   // Soft Tinted Highlight
  rose: '#b87572',    // Primary Brand Button / Rose Accent
  deep: '#744241',    // Headings / Deep Rose-Plum / High Contrast
  ink: '#3f3030',     // Body Text / High Contrast Ink
  muted: '#7c6b69',   // Secondary & Muted Text
  line: '#ead2ce',    // Hairline Borders & Dividers
  gold: '#c99d73',    // Warm Gold Insignia Accent

  // Backward compatibility aliases
  warmIvory: '#fffdfb',
  softCream: '#fff6f3',
  warmSand: '#ead2ce',
  mutedTaupe: '#7c6b69',
  deepEspresso: '#744241',
  softCharcoal: '#3f3030',
  warmBronze: '#b87572',
  mutedGold: '#c99d73',
  accentHover: '#744241',
  mutedSage: '#7c6b69',
  deepOlive: '#b87572',
  warmTerracotta: '#c99d73'
} as const;

export const typography = {
  fonts: {
    display: '"Cormorant Garamond", Georgia, serif',
    body: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.05em',
    widest: '0.2em'
  }
} as const;

export const radius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px'
} as const;

export const shadows = {
  subtle: '0 1px 3px rgba(41, 35, 31, 0.05)',
  card: '0 4px 12px rgba(41, 35, 31, 0.04), 0 1px 2px rgba(41, 35, 31, 0.02)',
  elevated: '0 12px 28px rgba(41, 35, 31, 0.08), 0 4px 8px rgba(41, 35, 31, 0.04)',
  modal: '0 24px 48px rgba(41, 35, 31, 0.16)'
} as const;

export const designTokens = {
  colors,
  typography,
  radius,
  shadows
};

export default designTokens;
