import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';

// Load Google Fonts dynamically
const fontLink = document.createElement('link');
fontLink.href = `https://fonts.googleapis.com/css2?family=${t.googleFonts}&display=swap`;
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// ── Helper constants ──────────────────────────────────────────────
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' };
const NAV_ITEMS = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'history', label: 'Snooze History' },
  { key: 'wellbeing', label: 'Wellbeing' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

// ── Mock data generators ──────────────────────────────────────────
function generateSnoozeHistory() {
  const labels = ['Morning routine', 'Get ready', 'Weekend gentle wake', 'Workout alarm', 'Meditation'];
  const entries = [];
  const now = Date.now();
  for (let i = 0; i < 35; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now - daysAgo * 86400000);
    const snoozeCount = Math.floor(Math.random() * 5);
    const totalMinutes = snoozeCount * (5 + Math.floor(Math.random() * 11));
    entries.push({
      id: `sh-${i}`,
      date,
      daysAgo,
      alarmLabel: labels[Math.floor(Math.random() * labels.length)],
      alarmTime: `${String(5 + Math.floor(Math.random() * 5)).padStart(2, '0')}:${String(Math.floor(Math.random() * 12) * 5).padStart(2, '0')}`,
      snoozeCount,
      totalMinutes,
      dismissed: snoozeCount === 0,
      snoozeTimes: Array.from({ length: snoozeCount }, () => 5 + Math.floor(Math.random() * 11)),
    });
  }
  return entries.sort((a, b) => b.date - a.date);
}

function generateWellbeingData() {
  return {
    avgWake: '6:42 AM',
    consistency: 78,
    snoozeRate: 34,
    totalAlarms: 47,
    streakDays: 5,
    bestDay: 'Tuesday',
    weeklyTrend: [65, 70, 72, 68, 78, 80, 78],
    trendLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  };
}

// ── Style helpers ─────────────────────────────────────────────────
const card = {
  background: t.colors.surface,
  border: t.chunkyBorder,
  borderRadius: t.radii.md,
  boxShadow: t.chunkyShadow,
  padding: t.spacing.lg,
};

const cardSm = {
  ...card,
  boxShadow: t.chunkyShadowSm,
  padding: t.spacing.md,
};

const pill = (active) => ({
  padding: '8px 22px',
  borderRadius: t.radii.full,
  border: active ? t.chunkyBorder : '2px solid transparent',
  background: active ? t.colors.accent : 'transparent',
  color: active ? t.colors.white : t.colors.text,
  fontFamily: t.fonts.body,
  fontWeight: active ? 700 : 600,
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: active ? t.chunkyShadowSm : 'none',
});

const btnPrimary = {
  padding: '12px 28px',
  borderRadius: t.radii.full,
  border: t.chunkyBorder,
  background: t.colors.accent,
  color: t.colors.white,
  fontFamily: t.fonts.body,
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
  boxShadow: t.chunkyShadowSm,
  transition: 'all 0.15s ease',
};

const btnSecondary = {
  ...btnPrimary,
  background: t.colors.surface,
  color: t.colors.text,
};

const btnDanger = {
  ...btnPrimary,
  background: '#FFF0EE',
  color: t.colors.accentDark,
};

const btnSmall = {
  padding: '8px 18px',
  borderRadius: t.radii.full,
  border: t.chunkyBorder,
  fontFamily: t.fonts.body,
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  boxShadow: t.chunkyShadowSm,
  transition: 'all 0.15s ease',
};

// ── Transition variants ───────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemFade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

// ── Weekly calendar helpers ───────────────────────────────────────
function getWeekDates(refDate) {
  const d = new Date(refDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime12(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Toggle switch component ───────────────────────────────────────
function Toggle({ on, onToggle, size = 'md' }) {
  const w = size === 'sm' ? 44 : 54;
  const h = size === 'sm' ? 26 : 30;
  const knob = size === 'sm' ? 20 : 24;
  return (
    <div
      onClick={onToggle}
      style={{
        width: w, height: h,
        borderRadius: t.radii.full,
        border: `2px solid ${t.colors.text}`,
        background: on ? t.colors.success : t.colors.disabled,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: on ? w - knob - 6 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: knob, height: knob,
          borderRadius: '50%',
          background: t.colors.white,
          border: `2px solid ${t.colors.text}`,
          position: 'absolute',
          top: (h - knob - 4) / 2 + 1,
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════
export default function TopNavDashboard({ state }) {
  const [activeNav, setActiveNav] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState(7);
  const [expandedSnooze, setExpandedSnooze] = useState(null);

  const snoozeHistory = useMemo(() => generateSnoozeHistory(), []);
  const wellbeing = useMemo(() => generateWellbeingData(), []);

  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(refDate);

  // Filter alarms for selected day
  const selectedDayName = ALL_DAYS[(selectedDate.getDay() + 6) % 7]; // 0=Sun => index 6
  const dayAlarms = (state.alarms || []).filter(a => a.days && a.days.includes(selectedDayName));

  const filteredHistory = snoozeHistory.filter(e => e.daysAgo <= historyFilter);

  // Side panel alarm editing
  function openCreatePanel() {
    state.createNewAlarm();
    setSidePanelOpen(true);
  }

  function openEditPanel(alarm) {
    state.editAlarm(alarm);
    setSidePanelOpen(true);
  }

  function closeSidePanel() {
    setSidePanelOpen(false);
  }

  function handleSave() {
    state.saveAlarm();
    setSidePanelOpen(false);
  }

  function handleDelete(id) {
    state.deleteAlarm(id);
    setSidePanelOpen(false);
  }

  // ── Render top nav ──────────────────────────────────────────────
  const renderNav = () => (
    <div style={{
      width: '100%',
      height: 60,
      background: t.colors.surface,
      borderBottom: t.chunkyBorder,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${t.spacing.lg}`,
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* App name */}
      <div style={{
        fontFamily: t.fonts.display,
        fontWeight: 800,
        fontSize: '22px',
        color: t.colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: 160,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: t.radii.sm,
          background: t.colors.accent,
          border: t.chunkyBorder,
          boxShadow: t.chunkyShadowSm,
          color: t.colors.white,
          fontSize: '18px',
        }}>
          A
        </span>
        Alarm App
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {NAV_ITEMS.map(item => (
          <motion.button
            key={item.key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveNav(item.key)}
            style={pill(activeNav === item.key)}
          >
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Settings icon */}
      <div style={{ minWidth: 160, display: 'flex', justifyContent: 'flex-end' }}>
        <motion.button
          whileHover={{ scale: 1.08, rotate: 30 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setActiveNav('settings')}
          style={{
            width: 40,
            height: 40,
            borderRadius: t.radii.sm,
            border: activeNav === 'settings' ? t.chunkyBorder : `2px solid ${t.colors.border}`,
            background: activeNav === 'settings' ? t.colors.surfaceAlt : t.colors.surface,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: activeNav === 'settings' ? t.chunkyShadowSm : 'none',
            transition: 'all 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={t.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M18.4 5l-1.7 1M3.3 14l-1.7 1M19 10h-2M3 10H1M18.4 15l-1.7-1M3.3 6l-1.7-1" />
          </svg>
        </motion.button>
      </div>
    </div>
  );

  // ── W1: Calendar Schedule ───────────────────────────────────────
  const renderCalendar = () => (
    <motion.div {...fadeSlide} style={{ display: 'flex', gap: t.spacing.lg, alignItems: 'flex-start' }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Week strip */}
        <div style={{ ...card, marginBottom: t.spacing.lg, padding: t.spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setWeekOffset(o => o - 1)}
              style={{ ...btnSmall, background: t.colors.surface, color: t.colors.text, padding: '6px 14px' }}
            >
              &larr;
            </motion.button>
            <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '16px', color: t.colors.text }}>
              {MONTH_NAMES[weekDates[0].getMonth()]} {weekDates[0].getDate()} - {MONTH_NAMES[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[6].getFullYear()}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }}
                style={{ ...btnSmall, background: t.colors.tealLight, color: t.colors.tealDark, padding: '6px 14px' }}
              >
                Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWeekOffset(o => o + 1)}
                style={{ ...btnSmall, background: t.colors.surface, color: t.colors.text, padding: '6px 14px' }}
              >
                &rarr;
              </motion.button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const dayLabel = ALL_DAYS[i];
              const hasAlarms = (state.alarms || []).some(a => a.days && a.days.includes(dayLabel));
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '12px 8px',
                    borderRadius: t.radii.sm,
                    border: isSelected ? t.chunkyBorder : `2px solid ${isToday ? t.colors.accent : 'transparent'}`,
                    background: isSelected ? t.colors.accent : isToday ? t.colors.accentLight + '22' : 'transparent',
                    color: isSelected ? t.colors.white : t.colors.text,
                    cursor: 'pointer',
                    fontFamily: t.fonts.body,
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? t.chunkyShadowSm : 'none',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>{dayLabel}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: t.fonts.display }}>{date.getDate()}</span>
                  {hasAlarms && (
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: isSelected ? t.colors.white : t.colors.accent,
                    }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Day header + create button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.md }}>
          <div>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '22px', color: t.colors.text, margin: 0 }}>
              {DAY_NAMES_FULL[selectedDate.getDay()]}'s Alarms
            </h2>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: '4px 0 0' }}>
              {dayAlarms.length} alarm{dayAlarms.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreatePanel}
            style={btnPrimary}
          >
            + New Alarm
          </motion.button>
        </div>

        {/* Alarm list */}
        <motion.div variants={stagger} initial="initial" animate="animate">
          {dayAlarms.length === 0 ? (
            <motion.div variants={itemFade} style={{ ...card, textAlign: 'center', padding: t.spacing.xl }}>
              <div style={{ fontSize: '40px', marginBottom: t.spacing.sm }}>-</div>
              <p style={{ fontFamily: t.fonts.body, fontSize: '16px', color: t.colors.textSecondary, margin: 0 }}>
                No alarms for this day. Create one to get started.
              </p>
            </motion.div>
          ) : (
            dayAlarms.map(alarm => (
              <motion.div
                key={alarm.id}
                variants={itemFade}
                whileHover={{ y: -2 }}
                style={{ ...card, marginBottom: t.spacing.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => openEditPanel(alarm)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.md }}>
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: t.radii.sm,
                    background: alarm.enabled ? t.colors.accent : t.colors.disabled,
                    border: t.chunkyBorder,
                    boxShadow: t.chunkyShadowSm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: t.fonts.display, fontWeight: 800, fontSize: '14px',
                    color: alarm.enabled ? t.colors.white : t.colors.textMuted,
                  }}>
                    {formatTime12(alarm.time).split(' ')[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '18px', color: t.colors.text }}>
                      {alarm.label || 'Untitled Alarm'}
                    </div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary, marginTop: '2px' }}>
                      {formatTime12(alarm.time)} &middot; {alarm.days.join(', ')}
                    </div>
                    {alarm.purpose && (
                      <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted, marginTop: '4px', fontStyle: 'italic' }}>
                        {alarm.purpose.length > 60 ? alarm.purpose.slice(0, 60) + '...' : alarm.purpose}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm }} onClick={e => e.stopPropagation()}>
                  {alarm.progressive && (
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: t.radii.full,
                      background: t.colors.purpleLight,
                      color: t.colors.purple,
                      fontFamily: t.fonts.body,
                      fontSize: '11px',
                      fontWeight: 700,
                      border: `2px solid ${t.colors.purple}`,
                    }}>
                      Progressive
                    </span>
                  )}
                  <Toggle on={alarm.enabled} onToggle={() => state.toggleAlarm(alarm.id)} />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Side panel for create/edit */}
      <AnimatePresence>
        {sidePanelOpen && state.editingAlarm && (
          <motion.div
            initial={{ opacity: 0, x: 40, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 380 }}
            exit={{ opacity: 0, x: 40, width: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ flexShrink: 0, overflow: 'hidden' }}
          >
            <div style={{ ...card, width: 380, boxSizing: 'border-box', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
                <h3 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '18px', margin: 0, color: t.colors.text }}>
                  {state.alarms.find(a => a.id === state.editingAlarm.id) ? 'Edit Alarm' : 'New Alarm'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeSidePanel}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: `2px solid ${t.colors.border}`,
                    background: t.colors.surface, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', color: t.colors.textSecondary,
                  }}
                >
                  x
                </motion.button>
              </div>

              {/* Time picker */}
              <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '6px', display: 'block' }}>Time</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: t.spacing.md }}>
                <select
                  value={state.editingAlarm.time.split(':')[0]}
                  onChange={e => state.updateEditingAlarm({ time: `${e.target.value}:${state.editingAlarm.time.split(':')[1]}` })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: t.radii.xs,
                    border: t.chunkyBorder, fontFamily: t.fonts.display,
                    fontWeight: 700, fontSize: '20px', background: t.colors.surface,
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '24px', alignSelf: 'center' }}>:</span>
                <select
                  value={state.editingAlarm.time.split(':')[1]}
                  onChange={e => state.updateEditingAlarm({ time: `${state.editingAlarm.time.split(':')[0]}:${e.target.value}` })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: t.radii.xs,
                    border: t.chunkyBorder, fontFamily: t.fonts.display,
                    fontWeight: 700, fontSize: '20px', background: t.colors.surface,
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Label */}
              <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '6px', display: 'block' }}>Label</label>
              <input
                type="text"
                value={state.editingAlarm.label}
                onChange={e => state.updateEditingAlarm({ label: e.target.value })}
                placeholder="Alarm name..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: t.radii.xs,
                  border: t.chunkyBorder, fontFamily: t.fonts.body, fontSize: '15px',
                  background: t.colors.surface, boxSizing: 'border-box',
                  marginBottom: t.spacing.md, outline: 'none',
                }}
              />

              {/* Purpose */}
              <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '6px', display: 'block' }}>Purpose</label>
              <textarea
                value={state.editingAlarm.purpose}
                onChange={e => state.updateEditingAlarm({ purpose: e.target.value })}
                placeholder="Why does this alarm matter?"
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: t.radii.xs,
                  border: t.chunkyBorder, fontFamily: t.fonts.body, fontSize: '14px',
                  background: t.colors.surface, boxSizing: 'border-box',
                  marginBottom: t.spacing.md, outline: 'none', resize: 'vertical',
                }}
              />

              {/* Day selector */}
              <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '6px', display: 'block' }}>Repeat</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: t.spacing.md, flexWrap: 'wrap' }}>
                {ALL_DAYS.map(day => {
                  const active = state.editingAlarm.days.includes(day);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        const days = active
                          ? state.editingAlarm.days.filter(d => d !== day)
                          : [...state.editingAlarm.days, day];
                        state.updateEditingAlarm({ days });
                      }}
                      style={{
                        width: 40, height: 40,
                        borderRadius: t.radii.xs,
                        border: active ? t.chunkyBorder : `2px solid ${t.colors.border}`,
                        background: active ? t.colors.accent : t.colors.surface,
                        color: active ? t.colors.white : t.colors.textSecondary,
                        fontFamily: t.fonts.body, fontWeight: 700, fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: active ? t.chunkyShadowSm : 'none',
                      }}
                    >
                      {DAY_LABELS[day]}
                    </motion.button>
                  );
                })}
              </div>

              {/* Progressive toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
                <div>
                  <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.text }}>Progressive Wake</div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Gradual fade-in before alarm</div>
                </div>
                <Toggle on={state.editingAlarm.progressive} onToggle={() => state.updateEditingAlarm({ progressive: !state.editingAlarm.progressive })} size="sm" />
              </div>

              {/* Ringtone selector */}
              <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '6px', display: 'block' }}>Sound</label>
              <select
                value={state.editingAlarm.ringtone}
                onChange={e => state.updateEditingAlarm({ ringtone: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: t.radii.xs,
                  border: t.chunkyBorder, fontFamily: t.fonts.body, fontSize: '14px',
                  background: t.colors.surface, cursor: 'pointer',
                  marginBottom: t.spacing.lg, boxSizing: 'border-box',
                }}
              >
                {(state.RINGTONES || ['Sunrise Chime', 'Gentle Waves', 'Bird Song', 'Soft Piano', 'Wind Bells', 'Morning Dew', 'Classic Buzz']).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  style={{ ...btnPrimary, flex: 1, textAlign: 'center' }}
                >
                  Save
                </motion.button>
                {state.alarms.find(a => a.id === state.editingAlarm.id) && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDelete(state.editingAlarm.id)}
                    style={{ ...btnDanger, padding: '12px 18px' }}
                  >
                    Delete
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ── W3: Snooze History ──────────────────────────────────────────
  const renderHistory = () => {
    const totalSnoozes = filteredHistory.reduce((s, e) => s + e.snoozeCount, 0);
    const totalMins = filteredHistory.reduce((s, e) => s + e.totalMinutes, 0);
    const avgSnooze = filteredHistory.length > 0 ? (totalMins / filteredHistory.length).toFixed(1) : 0;
    const cleanWakes = filteredHistory.filter(e => e.dismissed).length;

    return (
      <motion.div {...fadeSlide}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.lg }}>
          <div>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '24px', color: t.colors.text, margin: 0 }}>
              Snooze History
            </h2>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: '4px 0 0' }}>
              Track your snooze patterns and improve your mornings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[7, 30].map(days => (
              <motion.button
                key={days}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHistoryFilter(days)}
                style={{
                  ...btnSmall,
                  background: historyFilter === days ? t.colors.accent : t.colors.surface,
                  color: historyFilter === days ? t.colors.white : t.colors.text,
                }}
              >
                {days} Days
              </motion.button>
            ))}
          </div>
        </div>

        {/* Summary cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing.sm, marginBottom: t.spacing.lg }}>
          {[
            { label: 'Total Snoozes', value: totalSnoozes, color: t.colors.accent, bg: t.colors.accentLight + '33' },
            { label: 'Total Minutes Lost', value: `${totalMins}m`, color: t.colors.purple, bg: t.colors.purpleLight },
            { label: 'Avg per Alarm', value: `${avgSnooze}m`, color: t.colors.yellow, bg: t.colors.yellowLight },
            { label: 'Clean Wakes', value: cleanWakes, color: t.colors.success, bg: t.colors.tealLight },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemFade} style={{ ...cardSm, background: stat.bg, textAlign: 'center' }}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '28px', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginTop: '4px' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* History entries */}
        <motion.div variants={stagger} initial="initial" animate="animate">
          {filteredHistory.map(entry => {
            const isExpanded = expandedSnooze === entry.id;
            const dateStr = `${MONTH_NAMES[entry.date.getMonth()]} ${entry.date.getDate()}`;
            return (
              <motion.div
                key={entry.id}
                variants={itemFade}
                layout
                style={{ ...cardSm, marginBottom: t.spacing.xs, cursor: 'pointer' }}
                onClick={() => setExpandedSnooze(isExpanded ? null : entry.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm }}>
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: t.radii.xs,
                      border: t.chunkyBorder,
                      background: entry.dismissed ? t.colors.tealLight : t.colors.accentLight + '44',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: t.fonts.display, fontWeight: 800, fontSize: '13px',
                      color: entry.dismissed ? t.colors.tealDark : t.colors.accentDark,
                      boxShadow: t.chunkyShadowSm,
                    }}>
                      {entry.alarmTime}
                    </div>
                    <div>
                      <div style={{ fontFamily: t.fonts.display, fontWeight: 600, fontSize: '15px', color: t.colors.text }}>
                        {entry.alarmLabel}
                      </div>
                      <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>
                        {dateStr} &middot; {entry.daysAgo === 0 ? 'Today' : entry.daysAgo === 1 ? 'Yesterday' : `${entry.daysAgo} days ago`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.sm }}>
                    {entry.dismissed ? (
                      <span style={{
                        padding: '4px 12px', borderRadius: t.radii.full,
                        background: t.colors.tealLight, color: t.colors.tealDark,
                        fontFamily: t.fonts.body, fontWeight: 700, fontSize: '12px',
                        border: `2px solid ${t.colors.teal}`,
                      }}>Clean Wake</span>
                    ) : (
                      <span style={{
                        padding: '4px 12px', borderRadius: t.radii.full,
                        background: t.colors.yellowLight, color: '#B8860B',
                        fontFamily: t.fonts.body, fontWeight: 700, fontSize: '12px',
                        border: `2px solid ${t.colors.yellow}`,
                      }}>{entry.snoozeCount}x snoozed</span>
                    )}
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      style={{ fontSize: '14px', color: t.colors.textMuted }}
                    >
                      v
                    </motion.span>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: t.spacing.sm,
                        paddingTop: t.spacing.sm,
                        borderTop: `2px dashed ${t.colors.border}`,
                      }}>
                        {entry.dismissed ? (
                          <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: 0 }}>
                            Great job! You woke up without snoozing.
                          </p>
                        ) : (
                          <>
                            <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '8px' }}>
                              Snooze timeline:
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {entry.snoozeTimes.map((min, si) => (
                                <div key={si} style={{
                                  padding: '6px 14px',
                                  borderRadius: t.radii.xs,
                                  background: t.colors.yellowLight,
                                  border: `2px solid ${t.colors.yellow}`,
                                  fontFamily: t.fonts.body,
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  color: '#B8860B',
                                }}>
                                  +{min}m
                                </div>
                              ))}
                            </div>
                            <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginTop: '8px' }}>
                              Total delay: {entry.totalMinutes} minutes
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    );
  };

  // ── W11: Wellbeing Dashboard ────────────────────────────────────
  const renderWellbeing = () => (
    <motion.div {...fadeSlide}>
      <div style={{ marginBottom: t.spacing.lg }}>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '24px', color: t.colors.text, margin: 0 }}>
          Wellbeing Dashboard
        </h2>
        <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: '4px 0 0' }}>
          Your sleep and wake patterns at a glance
        </p>
      </div>

      {/* 2x2 stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing.md, marginBottom: t.spacing.lg }}>
        {/* Avg Wake Time */}
        <motion.div variants={itemFade} style={{ ...card, background: t.colors.accentLight + '22' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '8px' }}>
                Average Wake Time
              </div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '36px', color: t.colors.accent }}>
                {wellbeing.avgWake}
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: t.radii.sm,
              background: t.colors.accent, border: t.chunkyBorder,
              boxShadow: t.chunkyShadowSm,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', color: t.colors.white,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginTop: t.spacing.sm }}>
            Best day: {wellbeing.bestDay}
          </div>
        </motion.div>

        {/* Consistency */}
        <motion.div variants={itemFade} style={{ ...card, background: t.colors.tealLight }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '8px' }}>
                Wake Consistency
              </div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '36px', color: t.colors.teal }}>
                {wellbeing.consistency}%
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: t.radii.sm,
              background: t.colors.teal, border: t.chunkyBorder,
              boxShadow: t.chunkyShadowSm,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.colors.white,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: t.spacing.sm, background: t.colors.white, borderRadius: t.radii.full, height: 12, border: `2px solid ${t.colors.text}`, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${wellbeing.consistency}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: t.colors.teal, borderRadius: t.radii.full }}
            />
          </div>
        </motion.div>

        {/* Snooze Rate */}
        <motion.div variants={itemFade} style={{ ...card, background: t.colors.yellowLight }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '8px' }}>
                Snooze Rate
              </div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '36px', color: '#B8860B' }}>
                {wellbeing.snoozeRate}%
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: t.radii.sm,
              background: t.colors.yellow, border: t.chunkyBorder,
              boxShadow: t.chunkyShadowSm,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.colors.text,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.colors.text} strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginTop: t.spacing.sm }}>
            {wellbeing.snoozeRate <= 30 ? 'Great! Keep it up.' : 'Try to reduce snoozing for better sleep.'}
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div variants={itemFade} style={{ ...card, background: t.colors.purpleLight }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '8px' }}>
                On-Time Streak
              </div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '36px', color: t.colors.purple }}>
                {wellbeing.streakDays} days
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: t.radii.sm,
              background: t.colors.purple, border: t.chunkyBorder,
              boxShadow: t.chunkyShadowSm,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.colors.white,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginTop: t.spacing.sm }}>
            Personal best: 12 days
          </div>
        </motion.div>
      </div>

      {/* Weekly trend bar chart */}
      <motion.div variants={itemFade} style={{ ...card, marginBottom: t.spacing.lg }}>
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '18px', color: t.colors.text, margin: `0 0 ${t.spacing.md}` }}>
          Weekly Consistency Trend
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: 140, paddingBottom: '28px', position: 'relative' }}>
          {wellbeing.weeklyTrend.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: t.fonts.body, fontWeight: 700, fontSize: '12px', color: t.colors.textSecondary }}>
                {val}%
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${val * 1.1}px` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{
                  width: '100%',
                  background: val >= 75 ? t.colors.teal : val >= 50 ? t.colors.yellow : t.colors.accent,
                  borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                  border: t.chunkyBorder,
                  borderBottom: 'none',
                  minHeight: 4,
                }}
              />
              <span style={{
                fontFamily: t.fonts.body, fontWeight: 600, fontSize: '12px',
                color: t.colors.textMuted, position: 'absolute', bottom: 0,
              }}>
                {wellbeing.trendLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: t.spacing.md }}>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveNav('calendar')}
          style={{
            ...card,
            flex: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing.sm,
            background: t.colors.surfaceAlt,
            border: t.chunkyBorder,
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: t.radii.xs,
            background: t.colors.accent, border: t.chunkyBorder,
            boxShadow: t.chunkyShadowSm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.colors.white, fontSize: '20px',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="16" height="14" rx="2" />
              <path d="M2 8h16M6 2v4M14 2v4" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '15px', color: t.colors.text }}>
              View Calendar
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary }}>
              Manage your alarms
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveNav('history')}
          style={{
            ...card,
            flex: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing.sm,
            background: t.colors.surfaceAlt,
            border: t.chunkyBorder,
          }}
        >
          <div style={{
            width: 42, height: 42, borderRadius: t.radii.xs,
            background: t.colors.purple, border: t.chunkyBorder,
            boxShadow: t.chunkyShadowSm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.colors.white,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l3 2" />
              <path d="M4 2l-2 2M16 2l2 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '15px', color: t.colors.text }}>
              Snooze History
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary }}>
              Analyze patterns
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  // ── Settings (Bedtime) ──────────────────────────────────────────
  const renderSettings = () => {
    const bedHour = state.bedtimeTime ? state.bedtimeTime.split(':')[0] : '22';
    const bedMin = state.bedtimeTime ? state.bedtimeTime.split(':')[1] : '30';

    return (
      <motion.div {...fadeSlide} style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: t.spacing.lg }}>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '24px', color: t.colors.text, margin: 0 }}>
            Bedtime Settings
          </h2>
          <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: '4px 0 0' }}>
            Configure your bedtime reminder to build better sleep habits
          </p>
        </div>

        {/* Enable toggle card */}
        <motion.div variants={itemFade} style={{ ...card, marginBottom: t.spacing.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '18px', color: t.colors.text }}>
                Bedtime Reminder
              </div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginTop: '4px' }}>
                Get notified when it's time to wind down
              </div>
            </div>
            <Toggle on={state.bedtimeEnabled} onToggle={() => state.setBedtimeEnabled(!state.bedtimeEnabled)} />
          </div>
        </motion.div>

        {/* Time picker card */}
        <AnimatePresence>
          {state.bedtimeEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ ...card, marginBottom: t.spacing.md }}>
                <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '10px', display: 'block' }}>
                  Bedtime
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: t.spacing.lg }}>
                  <select
                    value={bedHour}
                    onChange={e => state.setBedtimeTime(`${e.target.value}:${bedMin}`)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: t.radii.sm,
                      border: t.chunkyBorder,
                      fontFamily: t.fonts.display,
                      fontWeight: 800,
                      fontSize: '28px',
                      background: t.colors.surface,
                      cursor: 'pointer',
                      boxShadow: t.chunkyShadowSm,
                      textAlign: 'center',
                      width: 100,
                    }}
                  >
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '32px', color: t.colors.text }}>:</span>
                  <select
                    value={bedMin}
                    onChange={e => state.setBedtimeTime(`${bedHour}:${e.target.value}`)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: t.radii.sm,
                      border: t.chunkyBorder,
                      fontFamily: t.fonts.display,
                      fontWeight: 800,
                      fontSize: '28px',
                      background: t.colors.surface,
                      cursor: 'pointer',
                      boxShadow: t.chunkyShadowSm,
                      textAlign: 'center',
                      width: 100,
                    }}
                  >
                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div style={{ marginLeft: '12px' }}>
                    <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '16px', color: t.colors.text }}>
                      {formatTime12(state.bedtimeTime)}
                    </div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>
                      Reminder time
                    </div>
                  </div>
                </div>

                {/* Day selector */}
                <label style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '10px', display: 'block' }}>
                  Active Days
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ALL_DAYS.map(day => {
                    const active = state.bedtimeDays.includes(day);
                    return (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          const days = active
                            ? state.bedtimeDays.filter(d => d !== day)
                            : [...state.bedtimeDays, day];
                          state.setBedtimeDays(days);
                        }}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: t.radii.sm,
                          border: active ? t.chunkyBorder : `2px solid ${t.colors.border}`,
                          background: active ? t.colors.purple : t.colors.surface,
                          color: active ? t.colors.white : t.colors.textSecondary,
                          fontFamily: t.fonts.display,
                          fontWeight: 700,
                          fontSize: '15px',
                          cursor: 'pointer',
                          boxShadow: active ? t.chunkyShadowSm : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                        }}
                      >
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>{DAY_LABELS[day]}</span>
                        <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.7 }}>{day}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Info card */}
              <motion.div variants={itemFade} style={{
                ...card,
                background: t.colors.purpleLight,
                display: 'flex',
                gap: t.spacing.sm,
                alignItems: 'flex-start',
                marginBottom: t.spacing.md,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: t.radii.xs,
                  background: t.colors.purple, border: t.chunkyBorder,
                  boxShadow: t.chunkyShadowSm,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: t.colors.white, fontSize: '18px',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="9" r="8" />
                    <path d="M9 5v4M9 13h.01" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '15px', color: t.colors.purple, marginBottom: '4px' }}>
                    How it works
                  </div>
                  <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
                    You will receive a gentle notification at your set bedtime. You can snooze the reminder,
                    mark yourself as going to sleep, or dismiss it for the night. Consistent bedtimes
                    lead to better mornings.
                  </p>
                </div>
              </motion.div>

              {/* Quick presets */}
              <motion.div variants={itemFade} style={{ ...card }}>
                <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '16px', color: t.colors.text, marginBottom: t.spacing.sm }}>
                  Quick Presets
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Early Bird', time: '21:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
                    { label: 'Night Owl', time: '23:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
                    { label: 'Weekends', time: '00:00', days: ['Fri', 'Sat'] },
                    { label: 'Every Night', time: '22:00', days: ALL_DAYS },
                  ].map(preset => (
                    <motion.button
                      key={preset.label}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        state.setBedtimeTime(preset.time);
                        state.setBedtimeDays(preset.days);
                      }}
                      style={{
                        ...btnSmall,
                        background: t.colors.surfaceAlt,
                        color: t.colors.text,
                        padding: '10px 18px',
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{preset.label}</span>
                      <span style={{ fontWeight: 400, marginLeft: '6px', color: t.colors.textMuted }}>
                        {formatTime12(preset.time)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disabled state */}
        {!state.bedtimeEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              ...card,
              textAlign: 'center',
              padding: t.spacing.xl,
              background: t.colors.surfaceAlt,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: t.radii.md,
              background: t.colors.disabled, border: t.chunkyBorder,
              boxShadow: t.chunkyShadowSm,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', marginBottom: t.spacing.sm,
              color: t.colors.textMuted,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.colors.textMuted} strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <p style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '16px', color: t.colors.textSecondary, margin: 0 }}>
              Bedtime reminder is turned off
            </p>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textMuted, margin: '8px 0 0' }}>
              Toggle it on above to set your bedtime schedule
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ── Main render ─────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: t.colors.bg,
      fontFamily: t.fonts.body,
      color: t.colors.text,
    }}>
      {renderNav()}

      <div style={{
        padding: t.spacing.xl,
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <AnimatePresence mode="wait">
          {activeNav === 'calendar' && <motion.div key="calendar">{renderCalendar()}</motion.div>}
          {activeNav === 'history' && <motion.div key="history">{renderHistory()}</motion.div>}
          {activeNav === 'wellbeing' && <motion.div key="wellbeing">{renderWellbeing()}</motion.div>}
          {activeNav === 'settings' && <motion.div key="settings">{renderSettings()}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
