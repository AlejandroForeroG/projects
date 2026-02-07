export default function PhoneFrame({ children, version, onVersionChange, totalVersions = 5, singleVersion = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      fontFamily: "'Sora', system-ui, sans-serif",
      padding: '20px',
    }}>
      {/* Design Selector — hidden when singleVersion */}
      {!singleVersion && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          position: 'relative',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#666',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Design Version
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: totalVersions }, (_, i) => (
              <button
                key={i}
                onClick={() => onVersionChange(i + 1)}
                aria-label={`Switch to design version ${i + 1}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: version === i + 1 ? '2px solid #111' : '1px solid #ddd',
                  background: version === i + 1 ? '#111' : '#fff',
                  color: version === i + 1 ? '#fff' : '#666',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phone Frame */}
      <div style={{
        width: '375px',
        height: '812px',
        borderRadius: '44px',
        border: '8px solid #1a1a1a',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        background: '#000',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          background: '#1a1a1a',
          borderRadius: '0 0 20px 20px',
          zIndex: 100,
        }} />

        {/* Screen Content */}
        <div style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {children}
        </div>

        {/* Home Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '134px',
          height: '5px',
          borderRadius: '3px',
          background: 'rgba(255,255,255,0.3)',
          zIndex: 100,
        }} />
      </div>
    </div>
  );
}
