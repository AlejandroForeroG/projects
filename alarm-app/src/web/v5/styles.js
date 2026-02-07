import t from '../theme.js';

export const tileBase = {
  background: t.colors.surface,
  border: t.chunkyBorder,
  borderRadius: t.radii.lg,
  boxShadow: t.chunkyShadow,
  padding: t.spacing.md,
  position: 'relative',
  overflow: 'hidden',
  cursor: 'default',
};

export const tileHeader = {
  fontFamily: t.fonts.display,
  fontWeight: 700,
  fontSize: '15px',
  color: t.colors.text,
  marginBottom: t.spacing.sm,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const bodyText = {
  fontFamily: t.fonts.body,
  fontSize: '14px',
  color: t.colors.textSecondary,
  lineHeight: 1.5,
};
