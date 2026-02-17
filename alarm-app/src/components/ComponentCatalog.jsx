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

function SegmentButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '13px',
        fontFamily: baseFont,
        background: active ? '#1A2B3C' : 'transparent',
        color: active ? '#fff' : '#5A6E7F',
      }}
    >
      {children}
    </button>
  );
}

function HandoffMeta({ name, platform, usage }) {
  return (
    <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {[name, platform, usage].map((item) => (
        <span
          key={item}
          style={{
            display: 'inline-flex',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            border: '1px solid #D6DEE6',
            color: '#44515E',
            background: '#F7FAFC',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function CatalogBlock({ title, name, platform, usage, children }) {
  return (
    <article
      style={{
        border: '2px solid #D9E2EB',
        borderRadius: '16px',
        padding: '14px',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2B37', marginBottom: '8px' }}>{title}</div>
      <HandoffMeta name={name} platform={platform} usage={usage} />
      {children}
    </article>
  );
}

function ButtonsSample({ platform }) {
  const { t, chunkyBorder, chunkyShadowSm } = getTokens(platform);
  const [active, setActive] = useState('primary');
  const variants = {
    primary: { background: t.colors.accent, color: t.colors.white, border: chunkyBorder, boxShadow: chunkyShadowSm },
    secondary: { background: t.colors.surface, color: t.colors.text, border: chunkyBorder, boxShadow: chunkyShadowSm },
    ghost: { background: 'transparent', color: t.colors.textSecondary, border: `2px solid ${t.colors.border}`, boxShadow: 'none' },
    danger: { background: '#FFE5E2', color: t.colors.accentDark, border: `3px solid ${t.colors.accentDark}`, boxShadow: `3px 3px 0px ${t.colors.accentDark}` },
  };

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.keys(variants).map((v) => (
          <button
            key={v}
            onClick={() => setActive(v)}
            style={{
              border: active === v ? `2px solid ${t.colors.text}` : `2px solid ${t.colors.border}`,
              borderRadius: '10px',
              background: '#fff',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          >
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button
          style={{
            ...variants[active],
            borderRadius: platform === 'mobile' ? t.radii.sm : '10px',
            padding: platform === 'mobile' ? '12px 18px' : '10px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: t.fonts.display,
          }}
        >
          Action Button
        </button>
        <button
          disabled
          style={{
            background: '#EFF2F5',
            color: '#A2AFBC',
            border: `2px solid ${t.colors.border}`,
            borderRadius: '10px',
            padding: '10px 16px',
            fontWeight: 700,
            cursor: 'not-allowed',
            fontFamily: t.fonts.display,
          }}
        >
          Disabled
        </button>
      </div>
    </div>
  );
}

function FieldsToggleSample({ platform }) {
  const { t, chunkyBorder } = getTokens(platform);
  const [value, setValue] = useState('07:30');
  const [enabled, setEnabled] = useState(true);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          border: chunkyBorder,
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '14px',
          fontFamily: t.fonts.display,
          color: t.colors.text,
          background: t.colors.surface,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: t.colors.textSecondary, fontWeight: 700 }}>Toggle / Slider</span>
        <button
          onClick={() => setEnabled((v) => !v)}
          style={{
            width: '56px',
            height: '32px',
            borderRadius: '100px',
            border: chunkyBorder,
            background: enabled ? t.colors.teal : t.colors.disabled,
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#fff',
              border: `2px solid ${t.colors.text}`,
              position: 'absolute',
              top: '3px',
              left: enabled ? '29px' : '4px',
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>
    </div>
  );
}

function SurfaceSample({ platform }) {
  const { t, frameRadius, chunkyBorder, chunkyShadow } = getTokens(platform);
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div style={{ border: chunkyBorder, boxShadow: chunkyShadow, borderRadius: '12px', padding: '12px', background: t.colors.surface }}>
        Card / Recuadro
      </div>
      <div style={{ border: `2px solid ${t.colors.border}`, borderRadius: '12px', padding: '12px', background: t.colors.surfaceAlt }}>
        Tile / List item
      </div>
      <div
        style={{
          border: chunkyBorder,
          borderRadius: frameRadius,
          height: platform === 'mobile' ? '150px' : '130px',
          background: platform === 'mobile' ? '#F0F7F5' : '#FFF8E1',
          boxShadow: chunkyShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: t.colors.textSecondary,
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        Screen block / Pantalla base
      </div>
    </div>
  );
}

function NavigationSample({ platform }) {
  const { t, chunkyBorder, chunkyShadowSm } = getTokens(platform);
  const mobileItems = ['alarms', 'sleep', 'morning', 'tools'];
  const webItems = ['dashboard', 'calendar', 'snooze', 'files'];
  const items = platform === 'mobile' ? mobileItems : webItems;
  const [active, setActive] = useState(items[0]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          style={{
            border: chunkyBorder,
            boxShadow: active === item ? chunkyShadowSm : 'none',
            borderRadius: '10px',
            padding: '8px 12px',
            background: active === item ? t.colors.accentLight : t.colors.surface,
            color: active === item ? t.colors.text : t.colors.textSecondary,
            fontSize: '12px',
            fontWeight: active === item ? 800 : 600,
            cursor: 'pointer',
            textTransform: 'capitalize',
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function HeaderSample({ platform }) {
  const { t } = getTokens(platform);
  return (
    <div style={{ display: 'grid', gap: '4px' }}>
      <div style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: t.colors.text }}>
        {platform === 'mobile' ? 'Sleep Tracking' : 'Dashboard'}
      </div>
      <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.textSecondary }}>
        {platform === 'mobile'
          ? 'Track your snoozing habits and sleep patterns'
          : 'Your sleep health insights at a glance'}
      </div>
    </div>
  );
}

function ModalOverlaySample({ platform }) {
  const { t, chunkyBorder } = getTokens(platform);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          border: chunkyBorder,
          borderRadius: '10px',
          padding: '8px 12px',
          background: t.colors.surface,
          cursor: 'pointer',
          fontFamily: t.fonts.display,
          fontWeight: 700,
          color: t.colors.text,
        }}
      >
        {open ? 'Hide overlay' : 'Open overlay'}
      </button>
      {open && (
        <div style={{ marginTop: '10px', border: chunkyBorder, borderRadius: '12px', background: t.colors.bg, padding: '12px' }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, color: t.colors.text, marginBottom: '6px' }}>Modal / Overlay</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>
            Estructura de bloque modal para handoff de diseño.
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCatalog({ platform }) {
  const platformLabel = platform === 'mobile' ? 'Mobile v5' : 'Web v1';
  const usage = platform === 'mobile' ? 'Flujos original mobile' : 'Flujos original web';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
      }}
    >
      <CatalogBlock title="Botones (variantes + estados)" name="Buttons" platform={platformLabel} usage={usage}>
        <ButtonsSample platform={platform} />
      </CatalogBlock>

      <CatalogBlock title="Campos + Toggle/Slider" name="FieldsToggle" platform={platformLabel} usage="Formularios y settings">
        <FieldsToggleSample platform={platform} />
      </CatalogBlock>

      <CatalogBlock title="Cards, Recuadros y Pantallas" name="Surfaces" platform={platformLabel} usage="Contenedores visuales">
        <SurfaceSample platform={platform} />
      </CatalogBlock>

      <CatalogBlock title="Navegación y estado activo" name="NavigationItems" platform={platformLabel} usage="Tabs/sidebar/nav">
        <NavigationSample platform={platform} />
      </CatalogBlock>

      <CatalogBlock title="Headers de pantalla" name="PageHeader" platform={platformLabel} usage="Jerarquía visual de vista">
        <HeaderSample platform={platform} />
      </CatalogBlock>

      <CatalogBlock title="Modal / Overlay" name="ModalOverlay" platform={platformLabel} usage="Edición y confirmaciones">
        <ModalOverlaySample platform={platform} />
      </CatalogBlock>
    </div>
  );
}

export default function ComponentCatalog() {
  const [platform, setPlatform] = useState('mobile');

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '8px 24px 40px',
        fontFamily: baseFont,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1E2A36' }}>Componentes</h2>
          <p style={{ margin: '4px 0 0', color: '#5D6C7B', fontSize: '13px' }}>
            Catálogo con estilo original de flujo para system design (Web y Mobile).
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            background: '#F0F3F6',
            borderRadius: '999px',
            padding: '4px',
            border: '2px solid #1A2B3C',
            boxShadow: '3px 3px 0px #1A2B3C',
            gap: '4px',
          }}
        >
          <SegmentButton active={platform === 'mobile'} onClick={() => setPlatform('mobile')}>Mobile</SegmentButton>
          <SegmentButton active={platform === 'web'} onClick={() => setPlatform('web')}>Web</SegmentButton>
        </div>
      </div>

      <PlatformCatalog platform={platform} />
    </section>
  );
}
