import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { DAYS } from '../constants.js';
import { tileHeader, bodyText } from '../styles.js';
import { generateSnoozeHistory } from '../utils/data.js';
import { DecoShape, Tile } from '../components/index.js';

export default function SnoozeScreen() {
  const [snoozeData] = useState(generateSnoozeHistory);
  const [filter, setFilter] = useState('All');
  const maxMinutes = Math.max(...snoozeData.map(s => s.totalMinutes));
  const filteredData = filter === 'All' ? snoozeData : snoozeData.filter(s => s.count >= (filter === 'Heavy' ? 4 : 1) && s.count < (filter === 'Light' ? 3 : 99));
  const totalSnoozes = snoozeData.reduce((s, e) => s + e.count, 0);
  const avgMinutes = Math.round(snoozeData.reduce((s, e) => s + e.totalMinutes, 0) / snoozeData.length);

  const chartData = snoozeData.slice(0, 7).reverse();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto auto',
      gap: t.spacing.md,
      width: '100%',
    }}>
      {/* Large chart tile — 3 cols */}
      <Tile span="1 / span 3" rowSpan="1 / span 2" delay={0}>
        <DecoShape shape="circle" size={70} color={t.colors.purpleLight} top={-20} right={-20} opacity={0.3} />
        <DecoShape shape="square" size={25} color={t.colors.yellowLight} bottom={10} left={10} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '24px' }}>📊</span>
            Snooze History — Last 7 Days
          </div>
          {/* CSS bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: 200, padding: '10px 0', marginTop: t.spacing.sm }}>
            {chartData.map((entry, i) => {
              const pct = (entry.totalMinutes / maxMinutes) * 100;
              const colors = [t.colors.accent, t.colors.purple, t.colors.teal, t.colors.yellow, t.colors.accentLight, t.colors.purple, t.colors.teal];
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '12px', color: t.colors.text, marginBottom: '6px' }}>
                    {entry.totalMinutes}m
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.08 }}
                    style={{
                      width: '100%',
                      background: colors[i % colors.length],
                      borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                      border: t.chunkyBorder,
                      borderBottom: 'none',
                      minHeight: 8,
                    }}
                  />
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
          {/* Legend */}
          <div style={{ display: 'flex', gap: t.spacing.md, marginTop: t.spacing.sm, justifyContent: 'center' }}>
            <div style={{ ...bodyText, fontSize: '12px' }}><span style={{ color: t.colors.accent, fontWeight: 700 }}>■</span> Total snooze minutes per day</div>
          </div>
        </div>
      </Tile>

      {/* Filter tile */}
      <Tile span="4 / span 1" delay={0.1}>
        <DecoShape shape="circle" size={35} color={t.colors.tealLight} top={-10} right={-10} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '18px' }}>🎛️</span>
            Filter
          </div>
          {['All', 'Heavy', 'Light'].map(f => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                fontFamily: t.fonts.display,
                fontWeight: 600,
                fontSize: '14px',
                background: filter === f ? t.colors.accent : t.colors.bg,
                color: filter === f ? t.colors.white : t.colors.text,
                border: t.chunkyBorder,
                borderRadius: t.radii.sm,
                cursor: 'pointer',
                boxShadow: filter === f ? t.chunkyShadowSm : 'none',
              }}
            >
              {f === 'Heavy' ? '😫 ' : f === 'Light' ? '😌 ' : '📋 '}{f}
            </motion.button>
          ))}
        </div>
      </Tile>

      {/* Stats tile */}
      <Tile span="4 / span 1" delay={0.15}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>😴</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '24px', color: t.colors.purple }}>{totalSnoozes}</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted, marginBottom: '12px' }}>Total Snoozes</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.accent }}>{avgMinutes}m</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Avg / Day</div>
        </div>
      </Tile>

      {/* Individual snooze entry tiles */}
      {filteredData.slice(0, 8).map((entry, i) => (
        <Tile key={entry.id} span={`${(i % 4) + 1} / span 1`} delay={0.2 + i * 0.04}>
          <DecoShape shape={i % 2 === 0 ? 'circle' : 'diamond'} size={20} color={i % 3 === 0 ? t.colors.accentLight : i % 3 === 1 ? t.colors.purpleLight : t.colors.yellowLight} top={6} right={6} opacity={0.6} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '13px', color: t.colors.text }}>
                {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span style={{
                fontFamily: t.fonts.display,
                fontWeight: 700,
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: t.radii.full,
                background: entry.count >= 4 ? t.colors.accentLight : entry.count >= 2 ? t.colors.yellowLight : t.colors.tealLight,
                color: entry.count >= 4 ? t.colors.accentDark : entry.count >= 2 ? t.colors.text : t.colors.tealDark,
                border: `2px solid ${entry.count >= 4 ? t.colors.accent : entry.count >= 2 ? t.colors.yellow : t.colors.teal}`,
              }}>
                {entry.count}x
              </span>
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>{entry.alarmTime} — {entry.totalMinutes}m total</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted, fontStyle: 'italic', marginTop: '4px' }}>"{entry.reason}"</div>
          </div>
        </Tile>
      ))}
    </div>
  );
}
