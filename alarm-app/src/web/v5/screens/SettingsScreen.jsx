import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { DAYS } from '../constants.js';
import { tileHeader } from '../styles.js';
import { DecoShape, Tile, Toggle } from '../components/index.js';

export default function SettingsScreen() {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5]);
  const [smartWake, setSmartWake] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [gradualVolume, setGradualVolume] = useState(true);
  const [windDown, setWindDown] = useState(false);

  function toggleDay(d) {
    setActiveDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  // Calculate sleep duration
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);
  let sleepMins = (wH * 60 + wM) - (bH * 60 + bM);
  if (sleepMins <= 0) sleepMins += 24 * 60;
  const sleepH = Math.floor(sleepMins / 60);
  const sleepM = sleepMins % 60;

  // Arc visualization angles
  const bedAngle = ((bH % 12) + bM / 60) / 12 * 360 - 90;
  const wakeAngle = ((wH % 12) + wM / 60) / 12 * 360 - 90;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto auto',
      gap: t.spacing.md,
      width: '100%',
    }}>
      {/* Schedule visualization tile — 2x2 */}
      <Tile span="1 / span 2" rowSpan="1 / span 2" delay={0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <DecoShape shape="circle" size={100} color={t.colors.purpleLight} top={-25} right={-25} opacity={0.25} />
        <DecoShape shape="diamond" size={30} color={t.colors.yellowLight} bottom={10} left={10} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '24px' }}>🌙</span>
            Sleep Schedule
          </div>
          {/* Clock visualization */}
          <div style={{ position: 'relative', width: 200, height: 200, margin: '10px auto' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Outer ring */}
              <circle cx="100" cy="100" r="90" fill="none" stroke={t.colors.border} strokeWidth="3" />
              {/* Sleep arc */}
              {(() => {
                const r = 90;
                const startRad = (bedAngle * Math.PI) / 180;
                const endRad = (wakeAngle * Math.PI) / 180;
                const x1 = 100 + r * Math.cos(startRad);
                const y1 = 100 + r * Math.sin(startRad);
                const x2 = 100 + r * Math.cos(endRad);
                const y2 = 100 + r * Math.sin(endRad);
                const largeArc = sleepMins > 360 ? 1 : 0;
                return (
                  <path
                    d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={t.colors.purple}
                    strokeWidth="10"
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                );
              })()}
              {/* Hour markers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const x1 = 100 + 80 * Math.cos(angle);
                const y1 = 100 + 80 * Math.sin(angle);
                const x2 = 100 + 88 * Math.cos(angle);
                const y2 = 100 + 88 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.colors.text} strokeWidth="2" strokeLinecap="round" />;
              })}
              {/* Bed icon position */}
              {(() => {
                const rad = (bedAngle * Math.PI) / 180;
                const x = 100 + 70 * Math.cos(rad);
                const y = 100 + 70 * Math.sin(rad);
                return <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18">🌙</text>;
              })()}
              {/* Wake icon position */}
              {(() => {
                const rad = (wakeAngle * Math.PI) / 180;
                const x = 100 + 70 * Math.cos(rad);
                const y = 100 + 70 * Math.sin(rad);
                return <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18">☀️</text>;
              })()}
              {/* Center */}
              <circle cx="100" cy="100" r="35" fill={t.colors.surface} stroke={t.colors.text} strokeWidth="3" />
              <text x="100" y="95" textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.display} fontWeight="800" fontSize="16" fill={t.colors.text}>
                {sleepH}h {sleepM}m
              </text>
              <text x="100" y="112" textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.body} fontSize="10" fill={t.colors.textMuted}>
                sleep
              </text>
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: t.spacing.lg, marginTop: '8px' }}>
            <div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Bedtime</div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.purple }}>{bedtime}</div>
            </div>
            <div style={{ width: 2, background: t.colors.border }} />
            <div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Wake Up</div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.yellow }}>{wakeTime}</div>
            </div>
          </div>
        </div>
      </Tile>

      {/* Time picker tile — bedtime */}
      <Tile span="3 / span 1" delay={0.1}>
        <DecoShape shape="circle" size={35} color={t.colors.purpleLight} top={-10} right={-10} opacity={0.5} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '18px' }}>🌙</span>
            Bedtime
          </div>
          <input
            type="time"
            value={bedtime}
            onChange={e => setBedtime(e.target.value)}
            style={{
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '24px',
              color: t.colors.purple,
              background: t.colors.purpleLight,
              border: t.chunkyBorder,
              borderRadius: t.radii.sm,
              padding: '12px 16px',
              width: '100%',
              boxSizing: 'border-box',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>
      </Tile>

      {/* Time picker tile — wake */}
      <Tile span="4 / span 1" delay={0.15}>
        <DecoShape shape="diamond" size={25} color={t.colors.yellowLight} top={-6} right={-6} opacity={0.6} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '18px' }}>☀️</span>
            Wake Up
          </div>
          <input
            type="time"
            value={wakeTime}
            onChange={e => setWakeTime(e.target.value)}
            style={{
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '24px',
              color: t.colors.yellow,
              background: t.colors.yellowLight,
              border: t.chunkyBorder,
              borderRadius: t.radii.sm,
              padding: '12px 16px',
              width: '100%',
              boxSizing: 'border-box',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>
      </Tile>

      {/* Day selector tile — 2 cols */}
      <Tile span="3 / span 2" delay={0.2}>
        <DecoShape shape="square" size={30} color={t.colors.tealLight} top={-8} left={-8} opacity={0.4} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '18px' }}>📆</span>
            Active Days
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DAYS.map((day, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleDay(i)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: t.radii.sm,
                  border: t.chunkyBorder,
                  background: activeDays.includes(i) ? t.colors.accent : t.colors.bg,
                  color: activeDays.includes(i) ? t.colors.white : t.colors.text,
                  fontFamily: t.fonts.display,
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: activeDays.includes(i) ? t.chunkyShadowSm : 'none',
                }}
              >
                {day}
              </motion.button>
            ))}
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted, marginTop: '10px' }}>
            {activeDays.length === 7 ? 'Every day' : activeDays.length === 5 && !activeDays.includes(0) && !activeDays.includes(6) ? 'Weekdays' : `${activeDays.length} days selected`}
          </div>
        </div>
      </Tile>

      {/* Toggle tile — 2 cols */}
      <Tile span="1 / span 2" delay={0.25}>
        <DecoShape shape="circle" size={40} color={t.colors.accentLight} top={-12} right={-12} opacity={0.3} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '18px' }}>⚙️</span>
            Preferences
          </div>
          <Toggle on={smartWake} onToggle={() => setSmartWake(v => !v)} label="Smart Wake" />
          <Toggle on={sounds} onToggle={() => setSounds(v => !v)} label="Alarm Sounds" />
          <Toggle on={vibration} onToggle={() => setVibration(v => !v)} label="Vibration" />
          <Toggle on={gradualVolume} onToggle={() => setGradualVolume(v => !v)} label="Gradual Volume" />
          <Toggle on={windDown} onToggle={() => setWindDown(v => !v)} label="Wind-Down Reminder" />
        </div>
      </Tile>

      {/* Smart wake info tile */}
      <Tile span="3 / span 1" delay={0.3} style={{ background: t.colors.tealLight }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧠</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.tealDark, marginBottom: '4px' }}>Smart Wake</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary, lineHeight: 1.4 }}>
            Wakes you during light sleep within a 30-min window
          </div>
        </div>
      </Tile>

      {/* Sleep goal tile */}
      <Tile span="4 / span 1" delay={0.35} style={{ background: t.colors.purpleLight }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.purple, marginBottom: '4px' }}>Sleep Goal</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '22px', color: t.colors.purpleDark }}>8h 0m</div>
        </div>
      </Tile>
    </div>
  );
}
