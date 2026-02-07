import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';

/* ── Google Fonts (module-level) ── */
if (typeof document !== 'undefined') {
  const id = 'gf-neo-retro-v3';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${t.googleFonts}&display=swap`;
    document.head.appendChild(link);
  }
}

/* ── Mock data generators ── */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function startDay(y, m) { return new Date(y, m, 1).getDay(); }

function generateSnoozeHistory() {
  const entries = [];
  const now = Date.now();
  for (let i = 0; i < 42; i++) {
    const d = new Date(now - i * 86400000 * Math.random() * 14);
    entries.push({
      id: i,
      date: d,
      dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: `${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM`,
      duration: [5, 9, 10, 15][Math.floor(Math.random() * 4)],
      count: 1 + Math.floor(Math.random() * 4),
      alarmLabel: ['Morning Workout', 'Work Alarm', 'School Run', 'Meditation'][Math.floor(Math.random() * 4)],
    });
  }
  entries.sort((a, b) => b.date - a.date);
  return entries;
}

function generateWellbeingData() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({
      label: DAYS[d.getDay()],
      sleepHours: 5.5 + Math.random() * 3,
      snoozeCount: Math.floor(Math.random() * 5),
      onTime: Math.random() > 0.35,
      mood: Math.floor(1 + Math.random() * 5),
    });
  }
  return {
    days,
    avgSleep: +(days.reduce((s, d) => s + d.sleepHours, 0) / 7).toFixed(1),
    totalSnoozes: days.reduce((s, d) => s + d.snoozeCount, 0),
    onTimeRate: Math.round(days.filter(d => d.onTime).length / 7 * 100),
    avgMood: +(days.reduce((s, d) => s + d.mood, 0) / 7).toFixed(1),
    streak: 3 + Math.floor(Math.random() * 10),
  };
}

const MOCK_SNOOZE = generateSnoozeHistory();
const MOCK_WELLBEING = generateWellbeingData();

/* ── Nav items ── */
const NAV_ITEMS = [
  { key: 'calendar', icon: '\uD83D\uDCC5', tip: 'Calendar' },
  { key: 'history', icon: '\uD83D\uDCA4', tip: 'Snooze History' },
  { key: 'wellbeing', icon: '\uD83D\uDC9A', tip: 'Wellbeing' },
  { key: 'settings', icon: '\uD83C\uDF19', tip: 'Settings' },
];

/* ── Animations ── */
const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

const cardHover = {
  scale: 1.015,
  boxShadow: t.chunkyShadow,
  transition: { duration: 0.15 },
};

/* ── Shared compact styles ── */
const S = {
  splitContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  leftPanel: {
    width: 300,
    minWidth: 260,
    borderRight: `2px solid ${t.colors.border}`,
    background: t.colors.surface,
    overflowY: 'auto',
    padding: t.spacing.sm,
    display: 'flex',
    flexDirection: 'column',
  },
  rightPanel: {
    flex: 1,
    overflowY: 'auto',
    padding: t.spacing.sm,
    background: t.colors.bg,
  },
  sectionTitle: {
    fontFamily: t.fonts.display,
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: t.colors.textSecondary,
    marginBottom: 8,
  },
  compactCard: {
    background: t.colors.surface,
    border: t.chunkyBorder,
    borderRadius: t.radii.xs,
    padding: '10px 12px',
    marginBottom: 8,
    cursor: 'pointer',
  },
  badge: (bg, color) => ({
    display: 'inline-block',
    background: bg,
    color: color || t.colors.text,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: t.fonts.display,
    padding: '2px 8px',
    borderRadius: t.radii.full,
    border: `2px solid ${t.colors.text}`,
  }),
  input: {
    fontFamily: t.fonts.body,
    fontSize: 13,
    padding: '6px 10px',
    border: t.chunkyBorder,
    borderRadius: t.radii.xs,
    outline: 'none',
    background: t.colors.bg,
    color: t.colors.text,
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: (accent = false) => ({
    fontFamily: t.fonts.display,
    fontWeight: 700,
    fontSize: 12,
    padding: '6px 14px',
    border: t.chunkyBorder,
    borderRadius: t.radii.xs,
    cursor: 'pointer',
    background: accent ? t.colors.accent : t.colors.surface,
    color: accent ? t.colors.white : t.colors.text,
    boxShadow: t.chunkyShadowSm,
    transition: 'transform 0.1s, box-shadow 0.1s',
  }),
};

/* ================================================================
   SCREEN 1 — Calendar Schedule (W1)
   ================================================================ */
function CalendarScreen({ state }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTime, setEditTime] = useState('');

  const alarms = state?.alarms || [
    { id: 1, time: '06:30', label: 'Morning Workout', enabled: true, days: [1, 2, 3, 4, 5] },
    { id: 2, time: '07:15', label: 'Work Alarm', enabled: true, days: [1, 2, 3, 4, 5] },
    { id: 3, time: '08:00', label: 'School Run', enabled: false, days: [1, 2, 3, 4, 5] },
    { id: 4, time: '09:30', label: 'Weekend Brunch', enabled: true, days: [0, 6] },
  ];

  const numDays = daysInMonth(viewYear, viewMonth);
  const firstDay = startDay(viewYear, viewMonth);
  const selectedDow = new Date(viewYear, viewMonth, selectedDay).getDay();

  const dayAlarms = alarms.filter(a => a.days && a.days.includes(selectedDow));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
    setSelectedDay(1);
  };

  const startEdit = (a) => { setEditingId(a.id); setEditLabel(a.label); setEditTime(a.time); };
  const cancelEdit = () => setEditingId(null);

  return (
    <div style={S.splitContainer}>
      {/* Left — Mini Calendar */}
      <div style={S.leftPanel}>
        <div style={{ ...S.sectionTitle, marginBottom: 12 }}>Calendar</div>
        {/* Month Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth}
            style={{ ...S.btn(), padding: '4px 10px', fontSize: 14 }}>&lsaquo;</motion.button>
          <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 14, color: t.colors.text }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth}
            style={{ ...S.btn(), padding: '4px 10px', fontSize: 14 }}>&rsaquo;</motion.button>
        </div>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, textAlign: 'center', marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 10, color: t.colors.textMuted,
              textTransform: 'uppercase', padding: '2px 0' }}>{d.slice(0, 2)}</div>
          ))}
        </div>

        {/* Day Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, textAlign: 'center' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: numDays }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSel = day === selectedDay;
            const dow = new Date(viewYear, viewMonth, day).getDay();
            const hasAlarm = alarms.some(a => a.enabled && a.days && a.days.includes(dow));
            return (
              <motion.button key={day} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDay(day)}
                style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                  fontFamily: t.fonts.display, fontWeight: isSel ? 800 : 600, fontSize: 12,
                  border: isSel ? t.chunkyBorder : isToday ? `2px solid ${t.colors.accent}` : '2px solid transparent',
                  borderRadius: t.radii.xs,
                  background: isSel ? t.colors.accent : 'transparent',
                  color: isSel ? t.colors.white : isToday ? t.colors.accent : t.colors.text,
                  cursor: 'pointer', position: 'relative',
                  boxShadow: isSel ? t.chunkyShadowSm : 'none',
                }}>
                {day}
                {hasAlarm && !isSel && (
                  <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: t.colors.teal }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ marginTop: 14, padding: 10, background: t.colors.surfaceAlt, borderRadius: t.radii.xs,
          border: `2px solid ${t.colors.border}` }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text, marginBottom: 4 }}>
            {MONTHS[viewMonth]} {selectedDay}
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary }}>
            {dayAlarms.length} alarm{dayAlarms.length !== 1 ? 's' : ''} scheduled
          </div>
        </div>
      </div>

      {/* Right — Day Alarms */}
      <div style={S.rightPanel}>
        <div style={S.sectionTitle}>
          {DAYS[selectedDow]}, {MONTHS[viewMonth]} {selectedDay} &mdash; Alarms
        </div>
        <AnimatePresence mode="wait">
          {dayAlarms.length === 0 ? (
            <motion.div key="empty" {...panelVariants} style={{ fontFamily: t.fonts.body, fontSize: 13,
              color: t.colors.textMuted, padding: 20, textAlign: 'center' }}>
              No alarms for this day.
            </motion.div>
          ) : (
            <motion.div key={`${viewMonth}-${selectedDay}`} {...panelVariants}>
              {dayAlarms.map(a => (
                <motion.div key={a.id} whileHover={cardHover}
                  style={{ ...S.compactCard, opacity: a.enabled ? 1 : 0.55 }}>
                  {editingId === a.id ? (
                    /* Inline edit mode */
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input value={editTime} onChange={e => setEditTime(e.target.value)}
                          style={{ ...S.input, width: 90 }} placeholder="HH:MM" />
                        <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                          style={S.input} placeholder="Label" />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={S.btn(true)} onClick={cancelEdit}>Save</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={S.btn()} onClick={cancelEdit}>Cancel</motion.button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onClick={() => startEdit(a)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 18,
                          color: a.enabled ? t.colors.text : t.colors.textMuted }}>{a.time}</span>
                        <span style={{ fontFamily: t.fonts.body, fontSize: 13, color: t.colors.textSecondary }}>
                          {a.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.enabled
                          ? <span style={S.badge(t.colors.tealLight, t.colors.teal)}>ON</span>
                          : <span style={S.badge(t.colors.bg, t.colors.textMuted)}>OFF</span>
                        }
                        <span style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}
                          title="Edit">&#9998;</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick-add stub */}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ ...S.btn(true), marginTop: 10, width: '100%', textAlign: 'center', padding: '10px 0', fontSize: 13 }}>
          + Add Alarm
        </motion.button>
      </div>
    </div>
  );
}

/* ================================================================
   SCREEN 2 — Snooze History (W3)
   ================================================================ */
function SnoozeHistoryScreen() {
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterLabel, setFilterLabel] = useState('All');

  const filtered = useMemo(() => {
    const s = new Date(rangeStart), e = new Date(rangeEnd);
    e.setHours(23, 59, 59);
    return MOCK_SNOOZE.filter(en => {
      const inRange = en.date >= s && en.date <= e;
      const matchLabel = filterLabel === 'All' || en.alarmLabel === filterLabel;
      return inRange && matchLabel;
    });
  }, [rangeStart, rangeEnd, filterLabel]);

  const totalSnoozes = filtered.reduce((s, e) => s + e.count, 0);
  const totalMinutes = filtered.reduce((s, e) => s + e.duration * e.count, 0);
  const avgPerDay = filtered.length > 0 ? (totalSnoozes / Math.max(1, new Set(filtered.map(e => e.dateStr)).size)).toFixed(1) : '0';
  const labels = ['All', ...new Set(MOCK_SNOOZE.map(e => e.alarmLabel))];

  return (
    <div style={S.splitContainer}>
      {/* Left — Filters + Stats */}
      <div style={S.leftPanel}>
        <div style={S.sectionTitle}>Date Range</div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontFamily: t.fonts.body, fontSize: 11, color: t.colors.textSecondary, display: 'block', marginBottom: 3 }}>From</label>
          <input type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} style={S.input} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: t.fonts.body, fontSize: 11, color: t.colors.textSecondary, display: 'block', marginBottom: 3 }}>To</label>
          <input type="date" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} style={S.input} />
        </div>

        <div style={S.sectionTitle}>Alarm Filter</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
          {labels.map(l => (
            <motion.button key={l} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setFilterLabel(l)}
              style={{
                fontFamily: t.fonts.display, fontWeight: 700, fontSize: 10, padding: '4px 10px',
                borderRadius: t.radii.full, cursor: 'pointer',
                border: filterLabel === l ? t.chunkyBorder : `2px solid ${t.colors.border}`,
                background: filterLabel === l ? t.colors.accent : t.colors.surface,
                color: filterLabel === l ? t.colors.white : t.colors.textSecondary,
                boxShadow: filterLabel === l ? t.chunkyShadowSm : 'none',
              }}>
              {l}
            </motion.button>
          ))}
        </div>

        <div style={S.sectionTitle}>Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Total Snoozes', value: totalSnoozes, bg: t.colors.accentLight },
            { label: 'Minutes Lost', value: totalMinutes, bg: t.colors.yellowLight },
            { label: 'Avg / Day', value: avgPerDay, bg: t.colors.tealLight },
            { label: 'Entries', value: filtered.length, bg: t.colors.purpleLight },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: t.radii.xs, padding: '8px 10px',
              border: `2px solid ${t.colors.border}` }}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 18, color: t.colors.text }}>{s.value}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: 10, color: t.colors.textSecondary }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Snooze Log */}
      <div style={S.rightPanel}>
        <div style={S.sectionTitle}>Snooze Log ({filtered.length} entries)</div>
        <AnimatePresence mode="wait">
          <motion.div key={`${rangeStart}-${rangeEnd}-${filterLabel}`} {...panelVariants}>
            {filtered.length === 0 ? (
              <div style={{ fontFamily: t.fonts.body, fontSize: 13, color: t.colors.textMuted, padding: 20, textAlign: 'center' }}>
                No snooze events in this range.
              </div>
            ) : filtered.map(e => (
              <motion.div key={e.id} whileHover={cardHover}
                onClick={() => setSelectedEntry(selectedEntry === e.id ? null : e.id)}
                style={{ ...S.compactCard, borderLeft: `4px solid ${e.count >= 3 ? t.colors.accent : t.colors.teal}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 13, color: t.colors.text }}>
                      {e.time}
                    </span>
                    <span style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary, marginLeft: 8 }}>
                      {e.dateStr}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={S.badge(e.count >= 3 ? t.colors.accentLight : t.colors.tealLight,
                      e.count >= 3 ? t.colors.accentDark : t.colors.teal)}>
                      {e.count}x
                    </span>
                    <span style={S.badge(t.colors.yellowLight, t.colors.text)}>
                      {e.duration * e.count}m
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {selectedEntry === e.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${t.colors.border}`,
                        fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary }}>
                        <div><strong>Alarm:</strong> {e.alarmLabel}</div>
                        <div><strong>Snooze interval:</strong> {e.duration} min</div>
                        <div><strong>Times snoozed:</strong> {e.count}</div>
                        <div><strong>Total delay:</strong> {e.duration * e.count} min</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================================================================
   SCREEN 3 — Wellbeing Dashboard (W11)
   ================================================================ */
function WellbeingScreen() {
  const data = MOCK_WELLBEING;
  const maxSleep = 10;
  const maxSnooze = 5;

  const tips = [
    { icon: '\uD83C\uDF1F', text: 'Try a consistent wake time to boost on-time rate', color: t.colors.yellowLight },
    { icon: '\uD83E\uDDD8', text: 'Wind down 30 min before bed for better sleep quality', color: t.colors.purpleLight },
    { icon: '\u2615', text: 'Avoid caffeine 6 hours before sleep', color: t.colors.tealLight },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: t.spacing.sm }}>
      <div style={S.sectionTitle}>Wellbeing Dashboard</div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Avg Sleep', value: `${data.avgSleep}h`, icon: '\uD83D\uDECF\uFE0F', bg: t.colors.purpleLight, accent: t.colors.purple },
          { label: 'Snoozes', value: data.totalSnoozes, icon: '\uD83D\uDCA4', bg: t.colors.accentLight, accent: t.colors.accent },
          { label: 'On-Time', value: `${data.onTimeRate}%`, icon: '\u2705', bg: t.colors.tealLight, accent: t.colors.teal },
          { label: 'Avg Mood', value: `${data.avgMood}/5`, icon: '\uD83D\uDE0A', bg: t.colors.yellowLight, accent: t.colors.yellow },
          { label: 'Streak', value: `${data.streak}d`, icon: '\uD83D\uDD25', bg: t.colors.surfaceAlt, accent: t.colors.teal },
        ].map(m => (
          <motion.div key={m.label} whileHover={cardHover}
            style={{
              background: m.bg, border: t.chunkyBorder, borderRadius: t.radii.xs,
              padding: '12px 14px', boxShadow: t.chunkyShadowSm,
            }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 22, color: t.colors.text }}>
              {m.value}
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: 11, color: t.colors.textSecondary }}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Sleep Hours Bar Chart */}
        <div style={{ background: t.colors.surface, border: t.chunkyBorder, borderRadius: t.radii.xs,
          padding: 14, boxShadow: t.chunkyShadowSm }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text, marginBottom: 10 }}>
            Sleep Hours (7 Days)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
            {data.days.map((d, i) => {
              const pct = Math.min((d.sleepHours / maxSleep) * 100, 100);
              const isGood = d.sleepHours >= 7;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 9, color: t.colors.textSecondary,
                    marginBottom: 3 }}>
                    {d.sleepHours.toFixed(1)}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: isGood ? t.colors.teal : t.colors.accent,
                      border: `2px solid ${t.colors.text}`,
                      minHeight: 4,
                    }}
                  />
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 600, fontSize: 9, color: t.colors.textMuted,
                    marginTop: 4 }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
          {/* 7h reference line */}
          <div style={{ position: 'relative', marginTop: -((7 / maxSleep) * 120 + 20) }}>
            <div style={{ borderTop: `1px dashed ${t.colors.textMuted}`, width: '100%', position: 'absolute', left: 0 }} />
          </div>
        </div>

        {/* Snooze Count Bar Chart */}
        <div style={{ background: t.colors.surface, border: t.chunkyBorder, borderRadius: t.radii.xs,
          padding: 14, boxShadow: t.chunkyShadowSm }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text, marginBottom: 10 }}>
            Snooze Count (7 Days)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
            {data.days.map((d, i) => {
              const pct = Math.min((d.snoozeCount / maxSnooze) * 100, 100);
              const isBad = d.snoozeCount >= 3;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 9, color: t.colors.textSecondary,
                    marginBottom: 3 }}>
                    {d.snoozeCount}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: isBad ? t.colors.accent : t.colors.purple,
                      border: `2px solid ${t.colors.text}`,
                      minHeight: d.snoozeCount > 0 ? 4 : 0,
                    }}
                  />
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 600, fontSize: 9, color: t.colors.textMuted,
                    marginTop: 4 }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* On-Time + Mood Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* On-Time Dots */}
        <div style={{ background: t.colors.surface, border: t.chunkyBorder, borderRadius: t.radii.xs,
          padding: 14, boxShadow: t.chunkyShadowSm }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text, marginBottom: 10 }}>
            On-Time Wake-Up
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {data.days.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: d.onTime ? t.colors.teal : t.colors.accentLight,
                    border: `2px solid ${t.colors.text}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                  }}>
                  {d.onTime ? '\u2713' : '\u2717'}
                </motion.div>
                <span style={{ fontFamily: t.fonts.display, fontSize: 9, fontWeight: 600, color: t.colors.textMuted }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div style={{ background: t.colors.surface, border: t.chunkyBorder, borderRadius: t.radii.xs,
          padding: 14, boxShadow: t.chunkyShadowSm }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text, marginBottom: 10 }}>
            Morning Mood
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {data.days.map((d, i) => {
              const moods = ['\uD83D\uDE29', '\uD83D\uDE1F', '\uD83D\uDE10', '\uD83D\uDE42', '\uD83D\uDE04'];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ fontSize: 22 }}>
                    {moods[d.mood - 1]}
                  </motion.div>
                  <span style={{ fontFamily: t.fonts.display, fontSize: 9, fontWeight: 600, color: t.colors.textMuted }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips / Quick Actions */}
      <div style={S.sectionTitle}>Tips & Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {tips.map((tip, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, boxShadow: t.chunkyShadow }}
            style={{
              background: tip.color, border: t.chunkyBorder, borderRadius: t.radii.xs,
              padding: '10px 12px', boxShadow: t.chunkyShadowSm, cursor: 'pointer',
            }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{tip.icon}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.text, lineHeight: 1.4 }}>
              {tip.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   SCREEN 4 — Settings (Bedtime)
   ================================================================ */
function SettingsScreen() {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [enableDays, setEnableDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [windDown, setWindDown] = useState(30);
  const [reminder, setReminder] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggleDay = (d) => {
    setEnableDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // parse hours for visualization
  const bedH = parseInt(bedtime.split(':')[0], 10);
  const bedM = parseInt(bedtime.split(':')[1], 10);
  const wakeH = parseInt(wakeTime.split(':')[0], 10);
  const wakeM = parseInt(wakeTime.split(':')[1], 10);
  const bedTotal = bedH * 60 + bedM;
  const wakeTotal = wakeH * 60 + wakeM;
  const sleepMins = wakeTotal < bedTotal ? (1440 - bedTotal + wakeTotal) : (wakeTotal - bedTotal);
  const sleepHrs = (sleepMins / 60).toFixed(1);

  // Clock visualization angles
  const bedAngle = ((bedTotal % 720) / 720) * 360 - 90;
  const wakeAngle = ((wakeTotal % 720) / 720) * 360 - 90;

  return (
    <div style={S.splitContainer}>
      {/* Left — Bedtime Schedule Viz */}
      <div style={S.leftPanel}>
        <div style={S.sectionTitle}>Bedtime Schedule</div>

        {/* Clock-style visualization */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', border: t.chunkyBorder,
            background: t.colors.purpleLight, position: 'relative', boxShadow: t.chunkyShadowSm }}>
            {/* Hour markers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * 360 - 90;
              const rad = angle * Math.PI / 180;
              const x = 90 + 72 * Math.cos(rad);
              const y = 90 + 72 * Math.sin(rad);
              return (
                <div key={i} style={{
                  position: 'absolute', left: x - 8, top: y - 8, width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fonts.display, fontWeight: 700, fontSize: 9, color: t.colors.textSecondary,
                }}>
                  {i === 0 ? 12 : i}
                </div>
              );
            })}
            {/* Sleep arc — simplified with SVG */}
            <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0 }}>
              {(() => {
                const r = 58;
                const cx = 90, cy = 90;
                const startRad = bedAngle * Math.PI / 180;
                const endRad = wakeAngle * Math.PI / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = (sleepMins / 60) > 6 ? 1 : 0;
                return (
                  <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none" stroke={t.colors.purple} strokeWidth="10" strokeLinecap="round" opacity="0.6" />
                );
              })()}
            </svg>
            {/* Bed icon */}
            {(() => {
              const rad = bedAngle * Math.PI / 180;
              const x = 90 + 58 * Math.cos(rad);
              const y = 90 + 58 * Math.sin(rad);
              return (
                <div style={{ position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20,
                  background: t.colors.purple, borderRadius: '50%', border: `2px solid ${t.colors.text}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {'\uD83C\uDF19'}
                </div>
              );
            })()}
            {/* Wake icon */}
            {(() => {
              const rad = wakeAngle * Math.PI / 180;
              const x = 90 + 58 * Math.cos(rad);
              const y = 90 + 58 * Math.sin(rad);
              return (
                <div style={{ position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20,
                  background: t.colors.yellow, borderRadius: '50%', border: `2px solid ${t.colors.text}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {'\u2600\uFE0F'}
                </div>
              );
            })()}
            {/* Center label */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              textAlign: 'center' }}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 20, color: t.colors.text }}>
                {sleepHrs}h
              </div>
              <div style={{ fontFamily: t.fonts.body, fontSize: 9, color: t.colors.textSecondary }}>sleep</div>
            </div>
          </div>
        </div>

        {/* Schedule details */}
        <div style={{ background: t.colors.surfaceAlt, borderRadius: t.radii.xs, padding: 10,
          border: `2px solid ${t.colors.border}`, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary }}>Bedtime</span>
            <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 13, color: t.colors.purple }}>{bedtime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary }}>Wake-up</span>
            <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 13, color: t.colors.yellow }}>{wakeTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary }}>Wind-down</span>
            <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 13, color: t.colors.teal }}>{windDown} min</span>
          </div>
        </div>

        {/* Active days */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: t.fonts.display, fontWeight: 700, fontSize: 9,
              background: enableDays.includes(i) ? t.colors.purple : t.colors.bg,
              color: enableDays.includes(i) ? t.colors.white : t.colors.textMuted,
              border: `2px solid ${enableDays.includes(i) ? t.colors.text : t.colors.border}`,
            }}>
              {d.slice(0, 2)}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Edit Form */}
      <div style={S.rightPanel}>
        <div style={S.sectionTitle}>Edit Bedtime Schedule</div>

        <div style={{ ...S.compactCard, border: t.chunkyBorder, boxShadow: t.chunkyShadowSm }}>
          {/* Bedtime */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text,
              display: 'block', marginBottom: 6 }}>
              {'\uD83C\uDF19'} Bedtime
            </label>
            <input type="time" value={bedtime} onChange={e => { setBedtime(e.target.value); setSaved(false); }}
              style={S.input} />
          </div>

          {/* Wake time */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text,
              display: 'block', marginBottom: 6 }}>
              {'\u2600\uFE0F'} Wake-Up Time
            </label>
            <input type="time" value={wakeTime} onChange={e => { setWakeTime(e.target.value); setSaved(false); }}
              style={S.input} />
          </div>

          {/* Active Days */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text,
              display: 'block', marginBottom: 6 }}>
              Active Days
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS.map((d, i) => (
                <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => toggleDay(i)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                    fontFamily: t.fonts.display, fontWeight: 700, fontSize: 11,
                    background: enableDays.includes(i) ? t.colors.purple : t.colors.surface,
                    color: enableDays.includes(i) ? t.colors.white : t.colors.textMuted,
                    border: enableDays.includes(i) ? t.chunkyBorder : `2px solid ${t.colors.border}`,
                    boxShadow: enableDays.includes(i) ? t.chunkyShadowSm : 'none',
                  }}>
                  {d.slice(0, 2)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wind-down */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text,
              display: 'block', marginBottom: 6 }}>
              Wind-Down Duration
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[15, 30, 45, 60].map(m => (
                <motion.button key={m} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setWindDown(m); setSaved(false); }}
                  style={{
                    ...S.btn(windDown === m),
                    flex: 1,
                  }}>
                  {m}m
                </motion.button>
              ))}
            </div>
          </div>

          {/* Reminder toggle */}
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 12, color: t.colors.text }}>
              Bedtime Reminder
            </label>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setReminder(!reminder); setSaved(false); }}
              style={{
                width: 48, height: 26, borderRadius: t.radii.full, cursor: 'pointer',
                border: t.chunkyBorder, padding: 2,
                background: reminder ? t.colors.teal : t.colors.disabled,
                display: 'flex', alignItems: 'center',
                justifyContent: reminder ? 'flex-end' : 'flex-start',
              }}>
              <motion.div layout style={{
                width: 18, height: 18, borderRadius: '50%',
                background: t.colors.white, border: `2px solid ${t.colors.text}`,
              }} />
            </motion.button>
          </div>

          {/* Save */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            style={{
              ...S.btn(true), width: '100%', padding: '10px 0', fontSize: 13, textAlign: 'center',
              background: saved ? t.colors.teal : t.colors.accent,
            }}>
            {saved ? '\u2713 Saved!' : 'Save Schedule'}
          </motion.button>
        </div>

        {/* Sleep tip */}
        <div style={{ marginTop: 14, background: t.colors.purpleLight, border: `2px solid ${t.colors.border}`,
          borderRadius: t.radii.xs, padding: '10px 12px' }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: 11, color: t.colors.purple, marginBottom: 4 }}>
            {'\uD83D\uDCA1'} Sleep Tip
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: 12, color: t.colors.textSecondary, lineHeight: 1.4 }}>
            Adults need 7-9 hours of sleep. Your current schedule provides{' '}
            <strong style={{ color: parseFloat(sleepHrs) >= 7 ? t.colors.teal : t.colors.accent }}>
              {sleepHrs} hours
            </strong>.
            {parseFloat(sleepHrs) < 7
              ? ' Consider an earlier bedtime.'
              : ' Great job keeping a healthy sleep schedule!'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN — Compact Icon Rail Layout
   ================================================================ */
export default function CompactIconRailV3({ state = {} }) {
  const [activeNav, setActiveNav] = useState('calendar');
  const [hoveredNav, setHoveredNav] = useState(null);

  const renderScreen = () => {
    switch (activeNav) {
      case 'calendar': return <CalendarScreen state={state} />;
      case 'history': return <SnoozeHistoryScreen />;
      case 'wellbeing': return <WellbeingScreen />;
      case 'settings': return <SettingsScreen />;
      default: return null;
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      fontFamily: t.fonts.body,
      background: t.colors.bg,
      color: t.colors.text,
      overflow: 'hidden',
    }}>
      {/* ── Icon Rail ── */}
      <div style={{
        width: 64,
        minWidth: 64,
        background: t.colors.surface,
        borderRight: t.chunkyBorder,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 4,
        boxShadow: `3px 0 0 ${t.colors.text}`,
        zIndex: 10,
      }}>
        {/* App logo / brand */}
        <div style={{
          width: 40, height: 40, borderRadius: t.radii.xs, background: t.colors.accent,
          border: t.chunkyBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, marginBottom: 14, boxShadow: t.chunkyShadowSm,
        }}>
          {'\u23F0'}
        </div>

        {/* Nav Items */}
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.key;
          const isHovered = hoveredNav === item.key;
          return (
            <div key={item.key} style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredNav(item.key)}
              onMouseLeave={() => setHoveredNav(null)}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveNav(item.key)}
                style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, cursor: 'pointer',
                  border: isActive ? t.chunkyBorder : '2px solid transparent',
                  borderRadius: t.radii.xs,
                  background: isActive ? t.colors.accent : 'transparent',
                  boxShadow: isActive ? t.chunkyShadowSm : 'none',
                  transition: 'background 0.15s, border 0.15s',
                }}
                aria-label={item.tip}
              >
                {item.icon}
              </motion.button>
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute',
                      left: 52,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: t.colors.text,
                      color: t.colors.white,
                      fontFamily: t.fonts.display,
                      fontWeight: 700,
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: t.radii.xs,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 100,
                      boxShadow: t.chunkyShadowSm,
                    }}>
                    {item.tip}
                    {/* Arrow */}
                    <div style={{
                      position: 'absolute',
                      left: -5,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0, height: 0,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderRight: `5px solid ${t.colors.text}`,
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom indicator */}
        <div style={{
          width: 32, height: 3, borderRadius: t.radii.full,
          background: t.colors.accent, marginBottom: 14,
        }} />
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Compact top bar */}
        <div style={{
          height: 42,
          minHeight: 42,
          background: t.colors.surface,
          borderBottom: `2px solid ${t.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: 14, color: t.colors.text }}>
            {NAV_ITEMS.find(n => n.key === activeNav)?.tip}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: t.fonts.body, fontSize: 11, color: t.colors.textMuted }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: t.colors.teal,
              border: `2px solid ${t.colors.text}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12, fontFamily: t.fonts.display, fontWeight: 700,
              color: t.colors.white,
            }}>
              A
            </div>
          </div>
        </div>

        {/* Screen Content with Transitions */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
