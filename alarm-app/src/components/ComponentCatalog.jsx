import { useState } from 'react';
import mobileTheme from '../mobile/v5/theme';
import webTheme from '../web/theme';

const baseFont = "'Sora', system-ui, sans-serif";

function getTokens(platform) {
  const t = platform === 'mobile' ? mobileTheme : webTheme;
  return {
    t,
    frameRadius: platform === 'mobile' ? t.radii.lg : t.radii.md,
    chunkyBorder: `3px solid ${t.colors.text}`,
    chunkyShadow: `4px 4px 0px ${t.colors.text}`,
    chunkyShadowSm: `3px 3px 0px ${t.colors.text}`,
  };
}

function CatalogBlock({ title, children }) {
  return (
    <article
      style={{
        border: '1px solid #D9E2EB',
        borderRadius: '16px',
        padding: '24px',
        background: '#fff',
        breakInside: 'avoid',
        marginBottom: '24px',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1F2B37', marginBottom: '16px', fontFamily: baseFont }}>
        {title}
      </div>
      <div style={{ display: 'grid', gap: '24px' }}>
        {children}
      </div>
    </article>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 700, color: '#5A6E7F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontFamily: baseFont }}>
      {children}
    </div>
  );
}

function ButtonsSample() {
  const { t, chunkyBorder, chunkyShadowSm } = getTokens('mobile');
  
  const ButtonVariants = ({ activeState }) => {
    const variants = {
      primary: { background: t.colors.accent, color: t.colors.white, border: chunkyBorder, boxShadow: chunkyShadowSm },
      secondary: { background: t.colors.surface, color: t.colors.text, border: chunkyBorder, boxShadow: chunkyShadowSm },
      ghost: { background: 'transparent', color: t.colors.textSecondary, border: `2px solid ${t.colors.border}`, boxShadow: 'none' },
      danger: { background: '#FFE5E2', color: t.colors.accentDark, border: `3px solid ${t.colors.accentDark}`, boxShadow: `3px 3px 0px ${t.colors.accentDark}` },
    };
    const variantLabels = {
      primary: 'Primario',
      secondary: 'Secundario',
      ghost: 'Fantasma',
      danger: 'Peligro'
    };

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {Object.keys(variants).map(v => (
          <button
            key={v}
            style={{
              ...variants[v],
              borderRadius: t.radii.sm,
              padding: '12px 20px',
              fontWeight: 700,
              fontFamily: t.fonts.display,
              cursor: activeState ? 'pointer' : 'not-allowed',
              opacity: activeState ? 1 : 0.6,
              transform: activeState ? 'none' : 'translateY(2px)',
              boxShadow: activeState ? variants[v].boxShadow : 'none',
            }}
          >
            {variantLabels[v]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <SectionLabel>Estado: Activo / Hover</SectionLabel>
        <ButtonVariants activeState={true} />
      </div>
      <div>
        <SectionLabel>Estado: Deshabilitado / Presionado</SectionLabel>
        <ButtonVariants activeState={false} />
      </div>
    </div>
  );
}

function InputsAndControlsSample() {
  const { t, chunkyBorder } = getTokens('mobile');

  const renderToggle = (enabled) => (
    <div style={{
      width: '56px', height: '32px', borderRadius: '100px',
      border: chunkyBorder, background: enabled ? t.colors.teal : t.colors.disabled,
      position: 'relative', cursor: 'pointer',
    }}>
      <span style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        border: `2px solid ${t.colors.text}`, position: 'absolute', top: '3px', left: enabled ? '29px' : '4px',
      }} />
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <SectionLabel>Campos de Texto</SectionLabel>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: t.colors.textSecondary, marginBottom: '4px', fontFamily: t.fonts.display }}>TEXTO BÁSICO</label>
            <input readOnly value="Ejemplo de input" style={{ width: '100%', boxSizing: 'border-box', border: chunkyBorder, borderRadius: '10px', padding: '10px 12px', fontSize: '14px', fontFamily: t.fonts.display, color: t.colors.text, background: t.colors.surface }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: t.colors.textSecondary, marginBottom: '4px', fontFamily: t.fonts.display }}>HORA (TIME)</label>
            <div style={{ background: t.colors.purple, borderRadius: t.radii.md, padding: '8px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800, color: '#FFFBF5' }}>07:30</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>Interruptores (Toggles)</SectionLabel>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderToggle(true)}
            <span style={{ fontSize: '13px', fontWeight: 700, color: t.colors.text, fontFamily: t.fonts.display }}>Activado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderToggle(false)}
            <span style={{ fontSize: '13px', fontWeight: 600, color: t.colors.textSecondary, fontFamily: t.fonts.display }}>Desactivado</span>
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>Sliders</SectionLabel>
        <div style={{ background: t.colors.surface, border: chunkyBorder, borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700 }}>Intensidad</span>
            <span style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 800, color: t.colors.teal }}>75%</span>
          </div>
          <div style={{ height: '12px', borderRadius: '6px', background: t.colors.surfaceAlt, border: `2px solid ${t.colors.border}`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', bottom: '-2px', width: '75%', background: t.colors.teal, borderRadius: '6px', border: `2px solid ${t.colors.text}` }} />
            <div style={{ position: 'absolute', top: '-6px', left: '75%', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', border: `2px solid ${t.colors.text}`, transform: 'translateX(-50%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TagsAndBadgesSample() {
  const { t } = getTokens('mobile');
  
  const badges = [
    { label: 'Alta', color: t.colors.accent },
    { label: 'Hecho', color: t.colors.teal },
    { label: 'Pendiente', color: t.colors.yellow },
    { label: 'Pospuesto', color: t.colors.purple },
  ];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <SectionLabel>Badges</SectionLabel>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {badges.map(b => (
            <span key={b.label} style={{
              display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: t.radii.full,
              background: b.color, color: t.colors.white, fontFamily: t.fonts.body, fontSize: '12px',
              fontWeight: 700, border: `2px solid ${t.colors.text}`, boxShadow: `2px 2px 0px ${t.colors.text}`
            }}>
              {b.label}
            </span>
          ))}
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: t.radii.full,
            background: t.colors.surface, color: t.colors.textSecondary, fontFamily: t.fonts.body, fontSize: '12px',
            fontWeight: 700, border: `2px solid ${t.colors.border}`
          }}>
            Neutral
          </span>
        </div>
      </div>
    </div>
  );
}

function NavigationSample() {
  const mobileT = getTokens('mobile').t;
  const webT = getTokens('web').t;

  const mobileTabs = [
    { id: 'alarms', label: 'Alarmas', icon: '⏰', color: mobileT.colors.accent, active: true },
    { id: 'sleep', label: 'Sueño', icon: '🌙', color: mobileT.colors.purple, active: false },
    { id: 'morning', label: 'Mañana', icon: '☀️', color: mobileT.colors.yellow, active: false },
  ];

  const webItems = [
    { id: 'dashboard', label: 'Panel', icon: '◈', color: webT.colors.yellow, active: true },
    { id: 'calendar', label: 'Calendario', icon: '31', color: webT.colors.accent, active: false },
    { id: 'snooze', label: 'Patrones Pospuestos', icon: 'Zz', color: webT.colors.teal, active: false },
  ];

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div>
        <SectionLabel>Navbar</SectionLabel>
        <div style={{ display: 'flex', borderTop: `3px solid ${mobileT.colors.text}`, background: mobileT.colors.surface, paddingBottom: '16px', borderRadius: '0 0 24px 24px' }}>
          {mobileTabs.map((tab) => (
            <div key={tab.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 0', position: 'relative' }}>
              {tab.active && (
                <div style={{ position: 'absolute', top: 0, width: '32px', height: '4px', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', background: tab.color }} />
              )}
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.icon}</span>
              <span style={{ fontSize: '11px', fontFamily: mobileT.fonts.display, fontWeight: tab.active ? 800 : 600, color: tab.active ? tab.color : mobileT.colors.textMuted }}>
                {tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Web sidebar</SectionLabel>
        <div style={{ background: webT.colors.purpleDark, padding: '24px 16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {webItems.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
              background: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '8px', position: 'relative',
            }}>
              {item.active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderRadius: '0 3px 3px 0', background: webT.colors.accent }} />}
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: item.active ? item.color : 'rgba(255,255,255,0.06)',
                border: item.active ? `2px solid ${webT.colors.text}` : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: webT.fonts.display, fontSize: '11px', fontWeight: 800,
                color: item.active ? webT.colors.white : 'rgba(255,251,245,0.5)',
                boxShadow: item.active ? `2px 2px 0px ${webT.colors.text}` : 'none',
              }}>{item.icon}</div>
              <span style={{ fontSize: '13px', fontFamily: webT.fonts.display, fontWeight: item.active ? 700 : 500, color: item.active ? '#FFFBF5' : 'rgba(255,251,245,0.5)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComplexCardsSample() {
  const mobileT = getTokens('mobile');
  const webT = getTokens('web');

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div>
        <SectionLabel>Tarjeta de Alarma Principal (Mobile)</SectionLabel>
        <div style={{
          background: mobileT.t.colors.surface, borderRadius: mobileT.t.radii.lg, padding: '24px 20px',
          border: mobileT.chunkyBorder, boxShadow: mobileT.chunkyShadow, position: 'relative', maxWidth: '340px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💼</span>
              <div>
                <div style={{ fontFamily: mobileT.t.fonts.display, fontSize: '16px', fontWeight: 800, color: mobileT.t.colors.text }}>Día de Trabajo</div>
                <div style={{ fontFamily: mobileT.t.fonts.body, fontSize: '13px', fontWeight: 600, color: mobileT.t.colors.textSecondary }}>Lun, Mar, Mié, Jue, Vie</div>
              </div>
            </div>
            <span style={{
              display: 'inline-flex', padding: '3px 10px', borderRadius: mobileT.t.radii.full,
              background: mobileT.t.colors.accent, color: mobileT.t.colors.white, fontFamily: mobileT.t.fonts.body,
              fontSize: '11px', fontWeight: 700, border: `2px solid ${mobileT.t.colors.text}`
            }}>Alta</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontFamily: mobileT.t.fonts.display, fontSize: '48px', fontWeight: 800, color: mobileT.t.colors.text, lineHeight: 1, letterSpacing: '-1px' }}>
              06:30
            </div>
            <div style={{ width: '56px', height: '32px', borderRadius: '100px', background: mobileT.t.colors.teal, border: mobileT.chunkyBorder, position: 'relative' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', border: `2px solid ${mobileT.t.colors.text}`, position: 'absolute', top: '3px', left: '29px' }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Tarjetas Analíticas / Dashboard (Web)</SectionLabel>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            flex: 1, background: webT.t.colors.surface, borderRadius: webT.t.radii.md, padding: webT.t.spacing.md,
            border: webT.chunkyBorder, boxShadow: webT.chunkyShadowSm, textAlign: 'center',
          }}>
            <div style={{ fontFamily: webT.t.fonts.display, fontSize: '32px', fontWeight: 800, color: webT.t.colors.teal }}>85%</div>
            <div style={{ fontFamily: webT.t.fonts.body, fontSize: '13px', fontWeight: 600, color: webT.t.colors.textSecondary, marginTop: '4px' }}>Puntaje de Sueño</div>
          </div>
          <div style={{
            flex: 1, background: webT.t.colors.surface, borderRadius: webT.t.radii.md, padding: webT.t.spacing.md,
            border: webT.chunkyBorder, boxShadow: webT.chunkyShadowSm, textAlign: 'center',
          }}>
            <div style={{ fontFamily: webT.t.fonts.display, fontSize: '32px', fontWeight: 800, color: webT.t.colors.purple }}>4</div>
            <div style={{ fontFamily: webT.t.fonts.body, fontSize: '13px', fontWeight: 600, color: webT.t.colors.textSecondary, marginTop: '4px' }}>Promedio Pospuestos</div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>List Items / Tiles (General)</SectionLabel>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: mobileT.t.colors.surfaceAlt,
          border: `2px solid ${mobileT.t.colors.border}`, borderRadius: mobileT.t.radii.md
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: mobileT.t.colors.yellow, border: mobileT.chunkyBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>☀️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: mobileT.t.fonts.display, fontSize: '15px', fontWeight: 700, color: mobileT.t.colors.text }}>Morning Routine</div>
            <div style={{ fontFamily: mobileT.t.fonts.body, fontSize: '12px', color: mobileT.t.colors.textSecondary, marginTop: '2px' }}>7 actions configured</div>
          </div>
          <span style={{ fontFamily: mobileT.t.fonts.display, fontSize: '16px', color: mobileT.t.colors.textMuted }}>›</span>
        </div>
      </div>
    </div>
  );
}

function HeadersAndEmptyStatesSample() {
  const webT = getTokens('web');
  const mobileT = getTokens('mobile');

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div>
        <SectionLabel>Encabezado de Pantalla (Mobile)</SectionLabel>
        <div style={{ background: mobileT.t.colors.bg, borderRadius: '16px', border: `2px solid ${mobileT.t.colors.border}`, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px 24px 8px', fontSize: '13px', fontFamily: mobileT.t.fonts.body,
            fontWeight: 700, color: mobileT.t.colors.text,
          }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mobileT.t.colors.teal }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mobileT.t.colors.accent }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mobileT.t.colors.yellow }} />
            </div>
          </div>
          <div style={{ padding: `0 ${mobileT.t.spacing.lg}`, marginBottom: '16px' }}>
            <button
              style={{
                background: mobileT.t.colors.surfaceAlt, border: `2px solid ${mobileT.t.colors.text}`,
                fontFamily: mobileT.t.fonts.display, fontSize: '13px', fontWeight: 600,
                color: mobileT.t.colors.text, cursor: 'pointer', padding: '6px 14px',
                borderRadius: mobileT.t.radii.sm, marginBottom: '12px',
              }}
            >
              ← Volver
            </button>
            <h1 style={{
              fontFamily: mobileT.t.fonts.display, fontSize: '24px', fontWeight: 800,
              color: mobileT.t.colors.text, margin: '0 0 2px',
            }}>
              Ajustes de Hora de Dormir
            </h1>
            <p style={{
              fontFamily: mobileT.t.fonts.body, fontSize: '13px', color: mobileT.t.colors.textSecondary,
              margin: 0, fontWeight: 500,
            }}>
              Configura tu recordatorio para dormir
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Encabezado de Página (Web)</SectionLabel>
        <div style={{ background: webT.t.colors.bg, padding: '24px', borderRadius: '16px', border: `2px solid ${webT.t.colors.border}` }}>
          <div style={{ marginBottom: webT.t.spacing.lg }}>
            <h1 style={{ fontFamily: webT.t.fonts.display, fontSize: '28px', fontWeight: 800, color: webT.t.colors.text, margin: '0 0 4px' }}>Panel Principal</h1>
            <p style={{ fontFamily: webT.t.fonts.body, fontSize: '15px', color: webT.t.colors.textSecondary, margin: 0, fontWeight: 500 }}>Tus datos de sueño de un vistazo</p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Estado Vacío (Empty State)</SectionLabel>
        <div style={{ background: webT.t.colors.surface, borderRadius: '16px', border: webT.chunkyBorder }}>
          <div style={{ textAlign: 'center', padding: `${webT.t.spacing.xl} ${webT.t.spacing.lg}` }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
            <div style={{ fontFamily: webT.t.fonts.display, fontSize: '16px', fontWeight: 700, color: webT.t.colors.text, marginBottom: '4px' }}>¡Todo despejado!</div>
            <div style={{ fontFamily: webT.t.fonts.body, fontSize: '14px', color: webT.t.colors.textMuted }}>No hay tareas pendientes en esta categoría</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalsAndOverlaysSample() {
  const { t, chunkyBorder, chunkyShadow } = getTokens('mobile');
  const ALL_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const activeDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <SectionLabel>Pantalla de Edición / Modal (Mobile)</SectionLabel>
        <div style={{
          background: t.colors.bg,
          borderRadius: t.radii.lg,
          border: chunkyBorder,
          boxShadow: '8px 8px 0px '+t.colors.text,
          padding: t.spacing.lg,
          position: 'relative'
        }}>
          {/* Header con Volver y Guardar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              style={{
                background: t.colors.surfaceAlt, border: `2px solid ${t.colors.text}`,
                fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 600,
                color: t.colors.text, cursor: 'pointer', padding: '6px 14px', borderRadius: t.radii.sm,
              }}>
              ← Volver
            </button>
            <button
              style={{
                background: t.colors.teal, border: `2px solid ${t.colors.text}`,
                fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700,
                color: t.colors.white, cursor: 'pointer', padding: '6px 18px', borderRadius: t.radii.sm,
                boxShadow: `3px 3px 0px ${t.colors.text}`,
              }}>
              Guardar ✓
            </button>
          </div>
          
          {/* Hora Grande Amarilla */}
          <div style={{ background: t.colors.yellow, borderRadius: t.radii.lg, padding: '24px', textAlign: 'center', marginBottom: '16px', border: chunkyBorder, boxShadow: chunkyShadow }}>
            <input type="time" readOnly value="07:30"
              style={{ fontFamily: t.fonts.display, fontSize: '44px', fontWeight: 800, color: t.colors.text, background: 'none', border: 'none', textAlign: 'center', width: '100%', outline: 'none' }} />
          </div>

          {/* Días */}
          <div style={{ marginBottom: '16px' }}>
            <SectionLabel>Días</SectionLabel>
            <div style={{ display: 'flex', gap: '5px' }}>
              {ALL_DAYS.map(day => { 
                const active = activeDays.includes(day); 
                const isW = ['Sáb','Dom'].includes(day);
                return (
                  <button key={day}
                    style={{ flex: 1, height: '42px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.text}`, background: active ? (isW ? t.colors.purple : t.colors.teal) : t.colors.surface, color: active ? t.colors.white : t.colors.textMuted, fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, cursor: 'pointer', boxShadow: active ? `2px 2px 0px ${t.colors.text}` : 'none' }}>
                    {day.substring(0,2)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Purpose (Propósito) */}
          <div style={{ marginBottom: '16px' }}>
            <SectionLabel>Propósito</SectionLabel>
            <div style={{
              padding: '12px 16px', borderRadius: t.radii.sm, border: `3px dashed ${t.colors.accent}`,
              background: '#FFF5F3', cursor: 'pointer', fontFamily: t.fonts.body, fontSize: '14px',
              fontWeight: 500, color: t.colors.text, lineHeight: 1.4,
            }}>
              ¡Es hora de conquistar el mundo!
            </div>
          </div>

          {/* Preview / Guardar / Eliminar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <button style={{ width: '100%', background: t.colors.surfaceAlt, border: `3px solid ${t.colors.text}`, padding: '14px 24px', borderRadius: t.radii.sm, fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 600, color: t.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `4px 4px 0px ${t.colors.text}`, cursor: 'pointer' }}>
              <span>▶</span> Preview Alarma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformCatalog() {
  return (
    <div style={{
      columns: '2 300px',
      columnGap: '24px',
    }}>
      <CatalogBlock title="Botones">
        <ButtonsSample />
      </CatalogBlock>

      <CatalogBlock title="Tags y Badges">
        <TagsAndBadgesSample />
      </CatalogBlock>

      <CatalogBlock title="Controles y Formularios">
        <InputsAndControlsSample />
      </CatalogBlock>

      <CatalogBlock title="Navegación">
        <NavigationSample />
      </CatalogBlock>

      <CatalogBlock title="Tarjetas y Componentes">
        <ComplexCardsSample />
      </CatalogBlock>

      <CatalogBlock title="Estructura y Estados Vacíos">
        <HeadersAndEmptyStatesSample />
      </CatalogBlock>

      <CatalogBlock title="Pantalla de Edición">
        <ModalsAndOverlaysSample />
      </CatalogBlock>
    </div>
  );
}
