import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { tileHeader } from '../styles.js';
import { generateWellbeingData } from '../utils/data.js';
import { DecoShape, Tile } from '../components/index.js';

export default function WellbeingScreen() {
  const [data] = useState(generateWellbeingData);

  const scoreColor = data.score >= 85 ? t.colors.teal : data.score >= 70 ? t.colors.yellow : t.colors.accent;
  const scoreLabel = data.score >= 85 ? 'Excellent' : data.score >= 70 ? 'Good' : 'Needs Work';
  const scoreBg = data.score >= 85 ? t.colors.tealLight : data.score >= 70 ? t.colors.yellowLight : t.colors.accentLight;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto auto',
      gap: t.spacing.md,
      width: '100%',
    }}>
      {/* Hero score tile — 2x2 */}
      <Tile span="1 / span 2" rowSpan="1 / span 2" delay={0} style={{ background: scoreBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <DecoShape shape="circle" size={120} color={scoreColor} top={-30} right={-30} opacity={0.15} />
        <DecoShape shape="circle" size={60} color={scoreColor} bottom={-15} left={-15} opacity={0.2} />
        <DecoShape shape="diamond" size={25} color={t.colors.white} top={20} left={20} opacity={0.6} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌟</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '64px', color: scoreColor, lineHeight: 1 }}>
            {data.score}
          </div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '20px', color: t.colors.text, marginTop: '8px' }}>
            {scoreLabel}
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginTop: '4px' }}>
            Sleep Wellbeing Score
          </div>
          <div style={{
            marginTop: t.spacing.md,
            background: t.colors.white,
            border: t.chunkyBorder,
            borderRadius: t.radii.full,
            padding: '8px 20px',
            display: 'inline-block',
          }}>
            <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '13px', color: t.colors.text }}>
              🔥 {data.streak} day streak
            </span>
          </div>
        </div>
      </Tile>

      {/* Pattern tile — 2 cols */}
      <Tile span="3 / span 2" delay={0.1}>
        <DecoShape shape="square" size={30} color={t.colors.purpleLight} top={-8} right={-8} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '20px' }}>📈</span>
            Weekly Pattern
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: 100, marginTop: '8px' }}>
            {data.patterns.map((p, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${p.value}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 + i * 0.06 }}
                  style={{
                    width: '100%',
                    background: p.value >= 85 ? t.colors.teal : p.value >= 70 ? t.colors.purple : t.colors.accent,
                    borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                    border: t.chunkyBorder,
                    borderBottom: 'none',
                    minHeight: 4,
                  }}
                />
                <div style={{ fontFamily: t.fonts.display, fontWeight: 600, fontSize: '10px', color: t.colors.textMuted, marginTop: '4px' }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Tile>

      {/* Streak tile */}
      <Tile span="3 / span 1" delay={0.2}>
        <DecoShape shape="circle" size={40} color={t.colors.accentLight} top={-12} left={-12} opacity={0.4} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🔥</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '28px', color: t.colors.accent }}>{data.streak}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Day Streak</div>
        </div>
      </Tile>

      {/* Avg wake time tile */}
      <Tile span="4 / span 1" delay={0.25}>
        <DecoShape shape="diamond" size={20} color={t.colors.tealLight} bottom={6} right={6} opacity={0.6} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>⏰</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.teal }}>{data.avgWake}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Avg Wake</div>
        </div>
      </Tile>

      {/* Tips tiles */}
      {data.tips.map((tip, i) => (
        <Tile key={i} span={i === 0 ? '1 / span 2' : `${i * 2 + 1} / span ${i === 2 ? 2 : 1}`} delay={0.3 + i * 0.06}>
          <DecoShape shape={i % 2 === 0 ? 'circle' : 'square'} size={30} color={i === 0 ? t.colors.purpleLight : i === 1 ? t.colors.tealLight : t.colors.yellowLight} top={-8} right={-8} opacity={0.5} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>{tip.emoji}</div>
            <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.text, lineHeight: 1.4 }}>{tip.text}</div>
          </div>
        </Tile>
      ))}

      {/* Quick-link tiles */}
      <Tile span="3 / span 1" delay={0.5} style={{ background: t.colors.purpleLight, cursor: 'pointer' }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '13px', color: t.colors.purple }}>View Schedule</div>
        </div>
      </Tile>

      {/* Avg sleep tile */}
      <Tile span="4 / span 1" delay={0.55}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💤</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '18px', color: t.colors.purple }}>{data.avgSleep}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Avg Sleep</div>
        </div>
      </Tile>
    </div>
  );
}
