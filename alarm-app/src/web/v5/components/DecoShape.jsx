import t from '../../theme.js';

export default function DecoShape({ shape = 'circle', size = 40, color = t.colors.accentLight, top, right, bottom, left, opacity = 0.5 }) {
  const pos = {};
  if (top !== undefined) pos.top = top;
  if (right !== undefined) pos.right = right;
  if (bottom !== undefined) pos.bottom = bottom;
  if (left !== undefined) pos.left = left;
  return (
    <div style={{
      position: 'absolute',
      ...pos,
      width: size,
      height: size,
      borderRadius: shape === 'circle' ? '50%' : shape === 'diamond' ? '4px' : t.radii.xs,
      background: color,
      opacity,
      transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}
