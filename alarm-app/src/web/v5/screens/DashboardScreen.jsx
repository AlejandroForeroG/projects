import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { tileHeader } from '../styles.js';
import { generateWellbeingData, generatePhoneUsageData } from '../utils/data.js';
import { DecoShape, Tile } from '../components/index.js';
import { DAYS } from '../constants.js';

export default function DashboardScreen() {
  const [data] = useState(generateWellbeingData);
  const [phoneData] = useState(generatePhoneUsageData);

  const scoreColor = data.score >= 85 ? t.colors.teal : data.score >= 70 ? t.colors.yellow : t.colors.accent;
  const scoreLabel = data.score >= 85 ? 'Excellent' : data.score >= 70 ? 'Good' : 'Needs Work';
  const scoreBg = data.score >= 85 ? t.colors.tealLight : data.score >= 70 ? t.colors.yellowLight : t.colors.accentLight;

  // Calcular estadísticas de uso de celular
  const phoneUsageDays = phoneData.filter(d => d.hadPhoneUsage).length;
  const avgSnoozesWithPhone = phoneData.filter(d => d.hadPhoneUsage).reduce((sum, d) => sum + d.snoozeCount, 0) / phoneUsageDays || 0;
  const avgSnoozesWithoutPhone = phoneData.filter(d => !d.hadPhoneUsage).reduce((sum, d) => sum + d.snoozeCount, 0) / (phoneData.length - phoneUsageDays) || 0;
  const maxSnoozes = Math.max(...phoneData.map(d => d.snoozeCount));
  
  // Últimos 7 días para la gráfica
  const chartData = phoneData.slice(-7);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto auto auto',
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

      {/* ━━━ NUEVA GRÁFICA: Celular nocturno vs Snoozes ━━━ */}
      <Tile span="1 / span 4" rowSpan="auto" delay={0.15}>
        <DecoShape shape="circle" size={60} color={t.colors.accentLight} top={-15} right={-15} opacity={0.3} />
        <DecoShape shape="square" size={30} color={t.colors.yellowLight} bottom={10} left={10} opacity={0.4} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '24px' }}>📱</span>
            Celular Nocturno vs. Snoozes Matutinos
          </div>
          <p style={{ 
            fontFamily: t.fonts.body, 
            fontSize: '13px', 
            color: t.colors.textMuted,
            marginTop: '4px',
            marginBottom: t.spacing.sm
          }}>
            Evidencia del impacto de las pantallas antes de dormir
          </p>
          
          {/* Gráfica de barras comparativa */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: 180, marginTop: t.spacing.sm }}>
            {chartData.map((entry, i) => {
              const pct = (entry.snoozeCount / maxSnoozes) * 100;
              const barColor = entry.hadPhoneUsage ? t.colors.accent : t.colors.teal;
              const barBg = entry.hadPhoneUsage ? t.colors.accentLight : t.colors.tealLight;
              
              return (
                <div key={i} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end' 
                }}>
                  {/* Icono de celular si hubo uso */}
                  <div style={{ 
                    height: '20px', 
                    marginBottom: '4px',
                    fontSize: '14px'
                  }}>
                    {entry.hadPhoneUsage ? '📱' : ''}
                  </div>
                  
                  {/* Cantidad de snoozes */}
                  <div style={{ 
                    fontFamily: t.fonts.display, 
                    fontWeight: 700, 
                    fontSize: '12px', 
                    color: t.colors.text, 
                    marginBottom: '6px' 
                  }}>
                    {entry.snoozeCount}
                  </div>
                  
                  {/* Barra */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 + i * 0.08 }}
                    style={{
                      width: '100%',
                      background: barColor,
                      borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                      border: t.chunkyBorder,
                      borderBottom: 'none',
                      minHeight: 8,
                      position: 'relative',
                    }}
                  >
                    {entry.hadPhoneUsage && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `repeating-linear-gradient(45deg, transparent, transparent 5px, ${barBg} 5px, ${barBg} 10px)`,
                        borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                      }} />
                    )}
                  </motion.div>
                  
                  {/* Día de la semana */}
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '11px',
                    color: t.colors.textMuted,
                    marginTop: '6px',
                    fontWeight: 600,
                  }}>
                    {DAYS[entry.date.getDay()]}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Leyenda y estadísticas */}
          <div style={{ 
            display: 'flex', 
            gap: t.spacing.md, 
            marginTop: t.spacing.md, 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: t.spacing.md, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: t.colors.accent, fontWeight: 700, fontSize: '16px' }}>■</span> 
                Con celular: <strong>{avgSnoozesWithPhone.toFixed(1)}</strong> snoozes avg
              </div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: t.colors.teal, fontWeight: 700, fontSize: '16px' }}>■</span> 
                Sin celular: <strong>{avgSnoozesWithoutPhone.toFixed(1)}</strong> snoozes avg
              </div>
            </div>
            <div style={{
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '13px',
              color: t.colors.white,
              background: t.colors.accent,
              padding: '6px 16px',
              borderRadius: t.radii.full,
              border: t.chunkyBorder,
            }}>
              📱 {phoneUsageDays} días con celular
            </div>
          </div>
        </div>
      </Tile>

      {/* Streak tile */}
      <Tile span="1 / span 1" delay={0.25}>
        <DecoShape shape="circle" size={40} color={t.colors.accentLight} top={-12} left={-12} opacity={0.4} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🔥</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '28px', color: t.colors.accent }}>{data.streak}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Day Streak</div>
        </div>
      </Tile>

      {/* Avg wake time tile */}
      <Tile span="2 / span 1" delay={0.3}>
        <DecoShape shape="diamond" size={20} color={t.colors.tealLight} bottom={6} right={6} opacity={0.6} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>⏰</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.teal }}>{data.avgWake}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Avg Wake</div>
        </div>
      </Tile>

      {/* Quick-link tiles */}
      <Tile span="3 / span 1" delay={0.35} style={{ background: t.colors.purpleLight, cursor: 'pointer' }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '13px', color: t.colors.purple }}>View Calendar</div>
        </div>
      </Tile>

      {/* Avg sleep tile */}
      <Tile span="4 / span 1" delay={0.4}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💤</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '18px', color: t.colors.purple }}>{data.avgSleep}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Avg Sleep</div>
        </div>
      </Tile>
    </div>
  );
}
