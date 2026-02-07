import t from '../../theme.js';

export default function Field({ label, value, onChange, type = 'text', options }) {
  const base = {
    fontFamily: t.fonts.body,
    fontSize: '15px',
    padding: '10px 14px',
    border: t.chunkyBorder,
    borderRadius: t.radii.sm,
    background: t.colors.bg,
    color: t.colors.text,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };
  return (
    <div style={{ marginBottom: t.spacing.sm }}>
      <label style={{ fontFamily: t.fonts.display, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, display: 'block', marginBottom: '6px' }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={base} />
      )}
    </div>
  );
}
