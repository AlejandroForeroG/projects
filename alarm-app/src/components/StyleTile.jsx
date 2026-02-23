import { useState } from 'react';
import mobileTheme from '../mobile/v5/theme';
import webTheme from '../web/theme';
import { PlatformCatalog } from './ComponentCatalog';

const baseFont = "'Sora', system-ui, sans-serif";

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

function SectionTitle({ title }) {
  return (
    <div style={{
      fontSize: '24px',
      fontWeight: 800,
      color: '#1A2B3C',
      marginBottom: '24px',
      borderBottom: '2px solid #E0E8EE',
      paddingBottom: '12px',
      fontFamily: baseFont,
    }}>
      {title}
    </div>
  );
}

function ColorSwatch({ name, hex }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
      <div style={{
        height: '32px',
        borderRadius: '6px',
        background: hex,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }} />
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#1A2B3C', fontFamily: baseFont, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
      <div style={{ fontSize: '9px', color: '#5A6E7F', fontFamily: baseFont, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hex}</div>
    </div>
  );
}

function TypographySample({ t }) {
  return (
    <div style={{ display: 'grid', gap: '12px', background: '#fff', padding: '16px', borderRadius: '16px', border: '2px solid #E0E8EE' }}>
      <div>
        <div style={{ fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800, color: t.colors.text }}>Encabezado 1</div>
        <div style={{ fontSize: '10px', color: t.colors.textSecondary, fontFamily: baseFont }}>{t.fonts.display} • 24px • 800</div>
      </div>
      <div>
        <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 700, color: t.colors.text }}>Encabezado 2</div>
        <div style={{ fontSize: '10px', color: t.colors.textSecondary, fontFamily: baseFont }}>{t.fonts.display} • 18px • 700</div>
      </div>
      <div>
        <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>Encabezado 3 / Subtítulo</div>
        <div style={{ fontSize: '10px', color: t.colors.textSecondary, fontFamily: baseFont }}>{t.fonts.display} • 14px • 600</div>
      </div>
      <div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.text, lineHeight: 1.4 }}>
          Texto de cuerpo. Este es un ejemplo de texto de párrafo utilizado para descripciones, explicaciones y contenido extenso.
        </div>
        <div style={{ fontSize: '10px', color: t.colors.textSecondary, fontFamily: baseFont, marginTop: '2px' }}>{t.fonts.body} • 12px • 400</div>
      </div>
      <div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '10px', fontWeight: 700, color: t.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sobrelínea / Versalitas
        </div>
      </div>
    </div>
  );
}

function TokensSample({ t }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '2px solid #E0E8EE' }}>
        <div style={{ fontWeight: 800, fontSize: '16px', color: '#1A2B3C', fontFamily: baseFont, marginBottom: '16px' }}>Radios de Borde</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(t.radii).map(([name, val]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: t.colors.teal, borderRadius: val }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A2B3C', fontFamily: baseFont }}>{name}</div>
                <div style={{ fontSize: '12px', color: '#5A6E7F', fontFamily: baseFont }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '2px solid #E0E8EE' }}>
        <div style={{ fontWeight: 800, fontSize: '16px', color: '#1A2B3C', fontFamily: baseFont, marginBottom: '16px' }}>Sombras y Bordes</div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            height: '60px',
            background: t.colors.surface,
            border: t.chunkyBorder || `3px solid ${t.colors.text}`,
            boxShadow: t.chunkyShadow || `5px 5px 0px ${t.colors.text}`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: baseFont,
            color: t.colors.text,
          }}>
            Sombra Gruesa (Chunky)
          </div>
          <div style={{ fontSize: '12px', color: '#5A6E7F', fontFamily: baseFont, marginTop: '8px' }}>
            Borde: {t.chunkyBorder || `3px solid ${t.colors.text}`}
            <br />
            Sombra: {t.chunkyShadow || `5px 5px 0px ${t.colors.text}`}
          </div>
        </div>

        <div>
          <div style={{
            height: '60px',
            background: t.colors.surface,
            border: t.chunkyBorder || `3px solid ${t.colors.text}`,
            boxShadow: t.chunkyShadowSm || `3px 3px 0px ${t.colors.text}`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            fontFamily: baseFont,
            color: t.colors.text,
          }}>
            Sombra Gruesa Pequeña
          </div>
          <div style={{ fontSize: '12px', color: '#5A6E7F', fontFamily: baseFont, marginTop: '8px' }}>
            Sombra: {t.chunkyShadowSm || `3px 3px 0px ${t.colors.text}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StyleTile() {
  const t = mobileTheme;

  // Group colors by category for better visualization
  const brandColors = ['accent', 'teal', 'yellow', 'purple'].map(k => ({ name: k, hex: t.colors[k] }));
  const neutralColors = ['text', 'textSecondary', 'textMuted', 'border', 'disabled'].map(k => ({ name: k, hex: t.colors[k] }));
  const surfaceColors = ['bg', 'surface', 'surfaceAlt'].map(k => ({ name: k, hex: t.colors[k] }));

  return (
    <section style={{
      width: '100%',
      maxWidth: '80vw',
      margin: '0 auto',
      padding: '40px 40px',
      fontFamily: baseFont,
      background: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)',
      minHeight: '70vh',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '40px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '32px', color: '#1E2A36', letterSpacing: '-0.5px' }}>Documento de Sistema de Diseño</h2>
          <p style={{ margin: '8px 0 0', color: '#5D6C7B', fontSize: '15px' }}>
            Style tile de la aplicación y componentes principales.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2.8fr)', gap: '48px', alignItems: 'start' }}>
        {/* Columna Izquierda: Style Tile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

          {/* Colors — todas las categorías en filas horizontales */}
          <div>
            <SectionTitle title="Paleta de Colores" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: 'Marca', colors: brandColors },
                { label: 'Neutros', colors: neutralColors },
                { label: 'Fondos', colors: surfaceColors },
              ].map(({ label, colors }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#5A6E7F', marginBottom: '8px', fontFamily: baseFont, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length}, 1fr)`, gap: '8px' }}>
                    {colors.map(c => <ColorSwatch key={c.name} name={c.name} hex={c.hex} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipografía */}
          <div>
            <SectionTitle title="Tipografía" />
            <TypographySample t={t} />
          </div>

          {/* Tokens */}
          <div>
            <SectionTitle title="Forma y Profundidad" />
            <TokensSample t={t} />
          </div>
        </div>

        {/* Columna Derecha: Componentes Principales */}
        <div>
          <SectionTitle title="Componentes Principales (Mobile y Web)" />
          <PlatformCatalog />
        </div>
      </div>

      {/* ── PROPUESTA DE DISEÑO ── */}
      <div style={{
        marginTop: '80px',
        paddingTop: '48px',
        borderTop: '3px solid #1A2B3C',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: baseFont,
            fontSize: '28px',
            fontWeight: 800,
            color: '#1A2B3C',
            margin: '0 0 8px',
            letterSpacing: '-0.5px',
          }}>
            Propuesta de Diseño
          </h2>
          <p style={{
            fontFamily: baseFont,
            fontSize: '15px',
            color: '#5A6E7F',
            margin: 0,
            fontWeight: 500,
          }}>
            Decisiones visuales basadas en investigación de usuarios y referentes de la industria.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}>

          {[
            {
              icon: '🎨',
              iconBg: '#FF6B5A',
              title: 'Brutalismo Colorido',
              text: <>Bordes gruesos, sombras sólidas y contrastes altos generan <strong>presencia física</strong>. Lejos del minimalismo genérico, la UI se siente honesta y con personalidad propia.</>,
            },
            {
              icon: '🎮',
              iconBg: '#FFD600',
              title: 'Inspiración Nintendo',
              text: <>Tipografía gruesa, color como navegación y microanimaciones táctiles. Cada acción debe sentirse como <strong>presionar un botón real</strong>, igual que en Switch.</>,
            },
            {
              icon: '🧸',
              iconBg: '#3CCCAD',
              title: 'Sensación de Juguete',
              text: <>Configurar una alarma debe sentirse como <strong>armar algo</strong>. Sombras de profundidad y botones que "bajan" al presionarse hacen la app invitante, no obligatoria.</>,
            },
            {
              icon: '✨',
              iconBg: '#8B7FEE',
              title: 'Audiencia Joven',
              text: <>Los usuarios jóvenes detectan interfaces "corporativas" de inmediato. Colores vivos e iconografía lúdica crean un <strong>vínculo emocional</strong> que va más allá de la función.</>,
            },
            {
              icon: 'Aa',
              iconBg: '#FF6B5A',
              title: 'Tipografía como Voz',
              text: <><strong>Sora</strong> es geométrica y amigable: moderna sin ser fría. Sus pesos altos capturan atención; combinada con <strong>Nunito</strong> en cuerpo, refuerza la dualidad seria-pero-cercana de la app.</>,
            },
          ].map(({ icon, iconBg, title, text }) => (
            <div key={title} style={{
              background: '#FFFBF5',
              border: '3px solid #1A2B3C',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '5px 5px 0px #1A2B3C',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: iconBg,
                border: '2px solid #1A2B3C',
                boxShadow: '2px 2px 0px #1A2B3C',
                fontSize: '20px',
                fontWeight: 800,
                fontFamily: baseFont,
                marginBottom: '16px',
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <h3 style={{
                fontFamily: baseFont,
                fontSize: '16px',
                fontWeight: 800,
                color: '#1A2B3C',
                margin: '0 0 10px',
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: baseFont,
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#3D4F5E',
                margin: 0,
                fontWeight: 500,
              }}>
                {text}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}