import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';
import {
  getCloudStore, updateCloudStore, addPostIt, removePostIt,
  addRule, updateRule, deleteRule, updateProfile, addRoutine,
} from '../../shared/cloudStore.js';

/* ───────── Load Google Fonts ───────── */
const fontLink = document.createElement('link');
fontLink.href = `https://fonts.googleapis.com/css2?family=${t.googleFonts}&display=swap`;
fontLink.rel = 'stylesheet';
if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

/* ───────── Animation Presets ───────── */
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
};

/* ───────── Date Helpers ───────── */
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

/* ───────── Mock Data Generators ───────── */
function generateSnoozeHistory() {
  const entries = [];
  const now = new Date();
  const labels = ['Morning routine','Get ready','Weekend gentle wake','Workout alarm','Meeting prep'];
  const reasons = ['Tired','Cold outside','Bad sleep','Stayed up late','Just 5 more min','Heavy rain'];
  for (let i = 0; i < 45; i++) {
    const date = new Date(now); date.setDate(date.getDate() - i);
    const count = Math.random() > 0.35 ? Math.floor(Math.random() * 4) + 1 : 0;
    if (count > 0) {
      entries.push({
        id: `sh-${i}`, date: date.toISOString().split('T')[0], dateObj: new Date(date),
        alarmLabel: labels[Math.floor(Math.random() * labels.length)],
        alarmTime: `0${6 + Math.floor(Math.random() * 3)}:${Math.random() > 0.5 ? '30' : '00'}`,
        snoozeCount: count, totalSnoozeMinutes: count * (5 + Math.floor(Math.random() * 11)),
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        dismissedAt: `0${6 + Math.floor(Math.random() * 3)}:${10 + Math.floor(Math.random() * 50)}`,
        completed: Math.random() > 0.3,
      });
    }
  }
  return entries;
}

function generateWellbeingData(snoozeHistory, alarms) {
  const last7 = snoozeHistory.filter(e => (new Date() - e.dateObj) / 86400000 <= 7);
  const last30 = snoozeHistory.filter(e => (new Date() - e.dateObj) / 86400000 <= 30);
  const totalSnoozes7 = last7.reduce((s, e) => s + e.snoozeCount, 0);
  const totalSnoozes30 = last30.reduce((s, e) => s + e.snoozeCount, 0);
  const avgSnoozeTime7 = last7.length > 0 ? Math.round(last7.reduce((s, e) => s + e.totalSnoozeMinutes, 0) / last7.length) : 0;
  const daysWithNoSnooze7 = 7 - last7.length;
  const consistencyPercent = Math.round((daysWithNoSnooze7 / 7) * 100);
  const enabledAlarms = alarms.filter(a => a.enabled).length;
  const sleepScore = Math.max(0, Math.min(100, 100 - totalSnoozes7 * 5 - avgSnoozeTime7));
  return { sleepScore, totalSnoozes7, totalSnoozes30, avgSnoozeTime7, consistencyPercent, daysWithNoSnooze7, enabledAlarms, streakDays: daysWithNoSnooze7, last7, last30 };
}

function generatePendingTasks() {
  return [
    { id: 'pt1', title: 'Review quarterly report', urgency: 'critical', status: 'pending', dueDate: '2026-02-07', alarm: '08:00' },
    { id: 'pt2', title: 'Schedule dentist appointment', urgency: 'medium', status: 'pending', dueDate: '2026-02-08', alarm: '09:00' },
    { id: 'pt3', title: 'Submit expense report', urgency: 'high', status: 'pending', dueDate: '2026-02-07', alarm: '10:00' },
    { id: 'pt4', title: 'Buy birthday gift', urgency: 'low', status: 'pending', dueDate: '2026-02-10', alarm: null },
    { id: 'pt5', title: 'Prepare presentation slides', urgency: 'critical', status: 'pending', dueDate: '2026-02-07', alarm: '07:30' },
    { id: 'pt6', title: 'Call plumber', urgency: 'medium', status: 'overdue', dueDate: '2026-02-05', alarm: null },
  ];
}

/* ───────── Shared UI Components ───────── */

function ChunkyButton({ children, onClick, variant = 'primary', color, style: extra = {} }) {
  const variants = {
    primary: { background: color || t.colors.accent, color: t.colors.white, border: t.chunkyBorder, fontWeight: 700, boxShadow: t.chunkyShadowSm },
    secondary: { background: t.colors.surface, color: t.colors.text, border: t.chunkyBorder, fontWeight: 600, boxShadow: t.chunkyShadowSm },
    ghost: { background: 'transparent', color: t.colors.textSecondary, border: '2px solid ' + t.colors.border, fontWeight: 600, boxShadow: 'none' },
    danger: { background: '#FFE5E2', color: t.colors.accentDark, border: `3px solid ${t.colors.accentDark}`, fontWeight: 700, boxShadow: `3px 3px 0px ${t.colors.accentDark}` },
  };
  return (
    <motion.button whileHover={{ y: -2, boxShadow: t.chunkyShadow }} whileTap={{ scale: 0.97, boxShadow: '1px 1px 0px ' + t.colors.text, y: 2, x: 2 }}
      onClick={onClick} style={{ padding: '12px 24px', borderRadius: t.radii.sm, fontSize: '14px', fontFamily: t.fonts.display, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'box-shadow 0.15s', ...variants[variant], ...extra }}>
      {children}
    </motion.button>
  );
}

function Badge({ children, color = t.colors.teal }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: t.radii.full, background: color, color: t.colors.white, fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 700, border: `2px solid ${t.colors.text}` }}>{children}</span>;
}

function Toggle({ enabled, onToggle, size = 'normal' }) {
  const w = size === 'small' ? 46 : 56; const h = size === 'small' ? 26 : 32;
  const knob = size === 'small' ? 18 : 22; const bw = size === 'small' ? 2 : 3;
  return (
    <div role="switch" aria-checked={enabled} tabIndex={0} onClick={(e) => { e.stopPropagation(); onToggle(e); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggle(e); } }}
      style={{ width: `${w}px`, height: `${h}px`, borderRadius: t.radii.full, background: enabled ? t.colors.teal : t.colors.disabled, border: `${bw}px solid ${t.colors.text}`, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: `${knob}px`, height: `${knob}px`, borderRadius: '50%', background: t.colors.white, border: `2px solid ${t.colors.text}`, position: 'absolute', top: `${(h-knob-bw*2)/2}px`, left: enabled ? `${w-knob-bw*2-(h-knob-bw*2)/2}px` : `${(h-knob-bw*2)/2}px`, transition: 'left 0.2s' }} />
    </div>
  );
}

function Card({ children, style: extra = {}, onClick }) {
  return (
    <motion.div whileHover={onClick ? { y: -2, boxShadow: t.chunkyShadow } : {}} onClick={onClick}
      style={{ background: t.colors.surface, borderRadius: t.radii.md, padding: t.spacing.md, border: t.chunkyBorder, boxShadow: t.chunkyShadowSm, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.15s, transform 0.15s', ...extra }}>
      {children}
    </motion.div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: t.spacing.lg }}>
      <h1 style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color: t.colors.text, margin: '0 0 4px' }}>{title}</h1>
      {subtitle && <p style={{ fontFamily: t.fonts.body, fontSize: '15px', color: t.colors.textSecondary, margin: 0, fontWeight: 500 }}>{subtitle}</p>}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: `${t.spacing.xl} ${t.spacing.lg}` }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textMuted }}>{subtitle}</div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <Card style={{ textAlign: 'center', background: bg || t.colors.surface }}>
      <div style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 600, color: t.colors.textSecondary, marginTop: '2px' }}>{label}</div>
    </Card>
  );
}

/* ───────── Alarm Modal ───────── */

function AlarmModal({ alarm, onClose, onSave, onDelete, onUpdate }) {
  if (!alarm) return null;
  const toggleDay = (day) => { const days = alarm.days.includes(day) ? alarm.days.filter(d => d !== day) : [...alarm.days, day]; onUpdate({ days }); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: t.colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: t.spacing.lg }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.175,0.885,0.32,1.275] }} onClick={(e) => e.stopPropagation()}
        style={{ background: t.colors.bg, borderRadius: t.radii.lg, border: t.chunkyBorder, boxShadow: '8px 8px 0px '+t.colors.text, width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto', padding: t.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
          <h2 style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: t.colors.text, margin: 0 }}>{alarm.label ? 'Edit Alarm' : 'New Alarm'}</h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: t.radii.xs, border: t.chunkyBorder, background: t.colors.surface, cursor: 'pointer', fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</motion.button>
        </div>
        <div style={{ background: t.colors.yellow, borderRadius: t.radii.md, padding: t.spacing.md, textAlign: 'center', marginBottom: t.spacing.md, border: t.chunkyBorder, boxShadow: t.chunkyShadow }}>
          <input type="time" value={alarm.time} onChange={(e) => onUpdate({ time: e.target.value })} aria-label="Alarm time"
            style={{ fontFamily: t.fonts.display, fontSize: '40px', fontWeight: 800, color: t.colors.text, background: 'none', border: 'none', textAlign: 'center', width: '100%' }} />
        </div>
        <div style={{ marginBottom: t.spacing.sm }}>
          <label style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: t.colors.text, display: 'block', marginBottom: '6px' }}>Label</label>
          <input type="text" value={alarm.label} onChange={(e) => onUpdate({ label: e.target.value })} placeholder="What is this alarm for?"
            style={{ width: '100%', padding: '12px 16px', borderRadius: t.radii.sm, border: t.chunkyBorder, background: t.colors.surface, fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: t.spacing.sm }}>
          <label style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: t.colors.text, display: 'block', marginBottom: '6px' }}>Repeat</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {ALL_DAYS.map(day => { const active = alarm.days.includes(day); const isW = ['Sat','Sun'].includes(day);
              return <motion.button key={day} whileTap={{ scale: 0.9 }} onClick={() => toggleDay(day)} aria-pressed={active}
                style={{ flex: 1, height: '40px', borderRadius: t.radii.xs, border: `2px solid ${t.colors.text}`, background: active ? (isW ? t.colors.purple : t.colors.teal) : t.colors.surface, color: active ? t.colors.white : t.colors.textMuted, fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: active ? `2px 2px 0px ${t.colors.text}` : 'none' }}>{day.substring(0,2)}</motion.button>;
            })}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: t.colors.surface, borderRadius: t.radii.sm, border: `2px solid ${alarm.progressive ? t.colors.purple : t.colors.border}`, marginBottom: t.spacing.md }}>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700, color: t.colors.text }}>Progressive Alarm</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary, fontWeight: 500 }}>Sound fades in gradually</div>
          </div>
          <Toggle enabled={alarm.progressive} onToggle={() => onUpdate({ progressive: !alarm.progressive })} size="small" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ChunkyButton onClick={onSave} color={t.colors.teal} style={{ flex: 1 }}>Save Alarm</ChunkyButton>
          {alarm.label && <ChunkyButton variant="danger" onClick={() => { onDelete(alarm.id); onClose(); }} style={{ flex: 0 }}>Delete</ChunkyButton>}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────── W11: Wellbeing Dashboard ───────── */

function WellbeingScreen({ state, onNavigate }) {
  const snoozeHistory = useMemo(() => generateSnoozeHistory(), []);
  const wellbeing = useMemo(() => generateWellbeingData(snoozeHistory, state.alarms), [snoozeHistory, state.alarms]);
  const scoreColor = wellbeing.sleepScore >= 70 ? t.colors.teal : wellbeing.sleepScore >= 40 ? t.colors.yellow : t.colors.accent;
  const scoreLabel = wellbeing.sleepScore >= 70 ? 'Great' : wellbeing.sleepScore >= 40 ? 'Fair' : 'Needs Work';

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Wellbeing Dashboard" subtitle="Your sleep and wake-up health at a glance" />
      <Card style={{ marginBottom: t.spacing.md, background: t.colors.purpleDark, border: `3px solid ${t.colors.purple}`, boxShadow: `5px 5px 0px ${t.colors.purple}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing.lg, position: 'relative' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: `5px solid ${scoreColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: t.fonts.display, fontSize: '36px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{wellbeing.sleepScore}</div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.5)', textTransform: 'uppercase' }}>Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: '#FFFBF5', marginBottom: '4px' }}>Sleep Score</div>
            <div style={{ display: 'inline-flex', padding: '3px 12px', borderRadius: t.radii.full, background: scoreColor, border: `2px solid ${t.colors.text}`, marginBottom: '8px' }}>
              <span style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.white }}>{scoreLabel}</span>
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 500, color: 'rgba(255,251,245,0.5)', lineHeight: 1.4 }}>Based on snooze patterns and consistency over 7 days.</div>
          </div>
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <StatCard label="Snoozes (7d)" value={wellbeing.totalSnoozes7} color={t.colors.accent} bg={t.colors.accentLight+'25'} />
        <StatCard label="Consistency" value={wellbeing.consistencyPercent+'%'} color={t.colors.teal} bg={t.colors.tealLight} />
        <StatCard label="Clean Days" value={wellbeing.streakDays} color={t.colors.yellow} bg={t.colors.yellowLight} />
      </div>
      <Card>
        <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Quick Links</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { id: 'calendar', icon: '31', label: 'Calendar', color: t.colors.accent, bg: t.colors.accentLight+'30' },
            { id: 'snooze', icon: 'Zz', label: 'Snooze History', color: t.colors.teal, bg: t.colors.tealLight },
            { id: 'compliance', icon: '✓', label: 'Compliance', color: t.colors.purple, bg: t.colors.purpleLight },
          ].map(link => (
            <motion.button key={link.id} whileHover={{ y: -2, boxShadow: t.chunkyShadow }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(link.id)}
              style={{ padding: '16px', borderRadius: t.radii.sm, border: t.chunkyBorder, background: link.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: t.chunkyShadowSm }}>
              <div style={{ width: '42px', height: '42px', borderRadius: t.radii.xs, background: link.color, border: `2px solid ${t.colors.text}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: t.colors.white, fontFamily: t.fonts.display, fontWeight: 800 }}>{link.icon}</div>
              <span style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.text }}>{link.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────── W1: Calendar Schedule ───────── */

function CalendarScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm, editingAlarm, updateEditingAlarm, saveAlarm, deleteAlarm } = state;
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [showModal, setShowModal] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const selectedDate = new Date(viewYear, viewMonth, selectedDay);
  const selectedDayName = DAY_LABELS[selectedDate.getDay()];
  const alarmsForDay = alarms.filter(a => a.days.includes(selectedDayName));

  const daysWithAlarms = useMemo(() => {
    const result = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      if (alarms.some(a => a.enabled && a.days.includes(DAY_LABELS[date.getDay()]))) result.add(d);
    }
    return result;
  }, [alarms, viewYear, viewMonth, daysInMonth]);

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(viewYear-1); setViewMonth(11); } else setViewMonth(viewMonth-1); setSelectedDay(1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(viewYear+1); setViewMonth(0); } else setViewMonth(viewMonth+1); setSelectedDay(1); };
  const openCreateModal = () => { createNewAlarm(); setTimeout(() => setShowModal(true), 0); };
  const openEditModal = (alarm) => { editAlarm(alarm); setTimeout(() => setShowModal(true), 0); };

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(<div key={`e-${i}`} style={{ aspectRatio: '1', borderRadius: t.radii.xs }} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === today; const isSelected = d === selectedDay; const hasAlarm = daysWithAlarms.has(d);
    calendarCells.push(
      <motion.button key={d} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setSelectedDay(d)}
        style={{ aspectRatio: '1', borderRadius: t.radii.xs, border: isSelected ? t.chunkyBorder : isToday ? `2px solid ${t.colors.accent}` : `2px solid ${t.colors.border}`, background: isSelected ? t.colors.accent : isToday ? t.colors.accentLight+'30' : t.colors.surface, color: isSelected ? t.colors.white : t.colors.text, fontFamily: t.fonts.display, fontSize: '14px', fontWeight: isSelected || isToday ? 800 : 600, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSelected ? t.chunkyShadowSm : 'none' }}>
        {d}
        {hasAlarm && <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: isSelected ? t.colors.white : t.colors.teal, border: isSelected ? 'none' : `1px solid ${t.colors.text}` }} />}
      </motion.button>
    );
  }

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Calendar Schedule" subtitle="View and manage your alarms by date" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth} style={{ width: '36px', height: '36px', borderRadius: t.radii.xs, border: t.chunkyBorder, background: t.colors.surface, cursor: 'pointer', fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 700, color: t.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</motion.button>
          <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: t.colors.text }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth} style={{ width: '36px', height: '36px', borderRadius: t.radii.xs, border: t.chunkyBorder, background: t.colors.surface, cursor: 'pointer', fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 700, color: t.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</motion.button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {DAY_LABELS.map(l => <div key={l} style={{ textAlign: 'center', fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.textMuted, padding: '4px 0', textTransform: 'uppercase' }}>{l.substring(0,2)}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>{calendarCells}</div>
      </Card>
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 800, color: t.colors.text }}>{MONTH_NAMES[viewMonth]} {selectedDay}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary }}>{selectedDayName} — {alarmsForDay.length} alarm{alarmsForDay.length !== 1 ? 's' : ''}</div>
          </div>
          <ChunkyButton onClick={openCreateModal} style={{ padding: '8px 16px', fontSize: '13px' }}>+ Add</ChunkyButton>
        </div>
        {alarmsForDay.length === 0 && <div style={{ textAlign: 'center', padding: t.spacing.lg, fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textMuted }}>No alarms scheduled for this day.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alarmsForDay.map((alarm, i) => (
            <motion.div key={alarm.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => openEditModal(alarm)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: t.radii.sm, border: `2px solid ${alarm.enabled ? t.colors.text : t.colors.border}`, background: alarm.enabled ? t.colors.surface : t.colors.surfaceHover, cursor: 'pointer', opacity: alarm.enabled ? 1 : 0.55, boxShadow: alarm.enabled ? t.chunkyShadowSm : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: t.colors.text }}>{alarm.time}</div>
                <div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>{alarm.label || 'Untitled alarm'}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {alarm.days.map(d => <Badge key={d} color={['Sat','Sun'].includes(d) ? t.colors.purple : t.colors.teal}>{d}</Badge>)}
                    {alarm.progressive && <Badge color={t.colors.purple}>FADE</Badge>}
                  </div>
                </div>
              </div>
              <Toggle enabled={alarm.enabled} onToggle={() => toggleAlarm(alarm.id)} size="small" />
            </motion.div>
          ))}
        </div>
      </Card>
      <AnimatePresence>
        {showModal && state.editingAlarm && <AlarmModal alarm={state.editingAlarm} onClose={() => setShowModal(false)} onSave={() => { saveAlarm(); setShowModal(false); }} onDelete={deleteAlarm} onUpdate={updateEditingAlarm} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── W3: Snooze History ───────── */

function SnoozeHistoryScreen() {
  const snoozeHistory = useMemo(() => generateSnoozeHistory(), []);
  const [range, setRange] = useState(7);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const filtered = useMemo(() => snoozeHistory.filter(e => (new Date() - e.dateObj) / 86400000 <= range), [snoozeHistory, range]);
  const totalSnoozes = filtered.reduce((s, e) => s + e.snoozeCount, 0);
  const avgMinutes = filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + e.totalSnoozeMinutes, 0) / filtered.length) : 0;

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Snooze Patterns" subtitle="Track your snooze habits over time" />
      <div style={{ display: 'flex', gap: '10px', marginBottom: t.spacing.md }}>
        {[7, 30].map(days => (
          <motion.button key={days} whileTap={{ scale: 0.95 }} onClick={() => { setRange(days); setSelectedEntry(null); }}
            style={{ padding: '10px 24px', borderRadius: t.radii.full, border: t.chunkyBorder, background: range === days ? t.colors.accent : t.colors.surface, color: range === days ? t.colors.white : t.colors.text, fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: range === days ? t.chunkyShadowSm : 'none' }}>{days} Days</motion.button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <StatCard label="Total Snoozes" value={totalSnoozes} color={t.colors.accent} bg={t.colors.accentLight+'30'} />
        <StatCard label="Avg / Day" value={avgMinutes+'m'} color={t.colors.teal} bg={t.colors.tealLight} />
        <StatCard label="Snooze Days" value={filtered.length} color={t.colors.purple} bg={t.colors.purpleLight} />
      </div>
      <AnimatePresence>
        {selectedEntry && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: t.spacing.md }}>
            <Card style={{ background: t.colors.purpleDark, border: `3px solid ${t.colors.purple}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.purple, textTransform: 'uppercase', marginBottom: '6px' }}>Detail</div>
                  <div style={{ fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 800, color: '#FFFBF5', marginBottom: '4px' }}>{selectedEntry.date}</div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: 'rgba(255,251,245,0.7)' }}>{selectedEntry.alarmLabel} at {selectedEntry.alarmTime}</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedEntry(null)} style={{ width: '28px', height: '28px', borderRadius: t.radii.xs, border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: '#FFFBF5', fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</motion.button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: t.spacing.sm }}>
                {[{ v: selectedEntry.snoozeCount, l: 'Snoozes', c: t.colors.accent }, { v: selectedEntry.totalSnoozeMinutes+'m', l: 'Total Time', c: t.colors.yellow }, { v: selectedEntry.dismissedAt, l: 'Got Up', c: t.colors.teal }].map(s => (
                  <div key={s.l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: t.radii.sm, padding: '12px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 600, color: 'rgba(255,251,245,0.5)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Card>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Snooze Log</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.7fr 0.8fr 1fr', gap: '8px', padding: '8px 12px', background: t.colors.surfaceAlt, borderRadius: t.radii.xs, marginBottom: '6px' }}>
          {['Date','Alarm','Count','Time','Reason'].map(h => <div key={h} style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase' }}>{h}</div>)}
        </div>
        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: t.spacing.lg, fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textMuted }}>No snooze data. Great job!</div>}
          {filtered.map((entry, i) => {
            const isS = selectedEntry?.id === entry.id;
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedEntry(isS ? null : entry)}
                style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.7fr 0.8fr 1fr', gap: '8px', padding: '10px 12px', cursor: 'pointer', borderRadius: t.radii.xs, background: isS ? t.colors.purpleLight : i%2===0 ? 'transparent' : t.colors.surfaceHover, border: isS ? `2px solid ${t.colors.purple}` : '2px solid transparent' }}>
                <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text }}>{entry.date}</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 500, color: t.colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.alarmLabel}</div>
                <div><Badge color={entry.snoozeCount >= 3 ? t.colors.accent : entry.snoozeCount >= 2 ? t.colors.yellow : t.colors.teal}>{entry.snoozeCount}x</Badge></div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text }}>{entry.totalSnoozeMinutes}m</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.reason}</div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────── W4: Compliance History ───────── */

function ComplianceScreen() {
  const history = useMemo(() => generateSnoozeHistory(), []);
  const completed = history.filter(e => e.completed);
  const postponed = history.filter(e => !e.completed);
  const [tab, setTab] = useState('all');

  const shown = tab === 'completed' ? completed : tab === 'postponed' ? postponed : history;
  const completionRate = history.length > 0 ? Math.round((completed.length / history.length) * 100) : 0;

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Compliance History" subtitle="What you completed vs. postponed" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <StatCard label="Completion Rate" value={completionRate+'%'} color={t.colors.teal} bg={t.colors.tealLight} />
        <StatCard label="Completed" value={completed.length} color={t.colors.teal} bg={t.colors.tealLight} />
        <StatCard label="Postponed" value={postponed.length} color={t.colors.accent} bg={t.colors.accentLight+'30'} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: t.spacing.md }}>
        {['all','completed','postponed'].map(v => (
          <motion.button key={v} whileTap={{ scale: 0.95 }} onClick={() => setTab(v)}
            style={{ padding: '8px 18px', borderRadius: t.radii.full, border: t.chunkyBorder, background: tab === v ? (v === 'completed' ? t.colors.teal : v === 'postponed' ? t.colors.accent : t.colors.text) : t.colors.surface, color: tab === v ? '#fff' : t.colors.text, fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{v}</motion.button>
        ))}
      </div>
      <Card>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {shown.map((entry, i) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < shown.length - 1 ? `1px solid ${t.colors.border}` : 'none' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.completed ? t.colors.teal : t.colors.accent, border: `2px solid ${t.colors.text}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>{entry.alarmLabel}</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>{entry.date} at {entry.alarmTime}</div>
              </div>
              <Badge color={entry.completed ? t.colors.teal : t.colors.accent}>{entry.completed ? 'Done' : 'Snoozed'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────── W5: Pending History ───────── */

function PendingScreen() {
  const tasks = useMemo(() => generatePendingTasks(), []);
  const [filter, setFilter] = useState('all');
  const urgencyColors = { critical: t.colors.accentDark, high: t.colors.accent, medium: t.colors.yellow, low: t.colors.teal };
  const shown = filter === 'all' ? tasks : tasks.filter(t => t.urgency === filter);

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Pending History" subtitle="Review accumulated tasks by urgency" />
      <div style={{ display: 'flex', gap: '8px', marginBottom: t.spacing.md, flexWrap: 'wrap' }}>
        {['all','critical','high','medium','low'].map(v => (
          <motion.button key={v} whileTap={{ scale: 0.95 }} onClick={() => setFilter(v)}
            style={{ padding: '8px 16px', borderRadius: t.radii.full, border: `2px solid ${filter === v ? t.colors.text : t.colors.border}`, background: filter === v ? (urgencyColors[v] || t.colors.text) : t.colors.surface, color: filter === v ? '#fff' : t.colors.text, fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{v}</motion.button>
        ))}
      </div>
      <Card>
        {shown.length === 0 ? <EmptyState icon="✨" title="All clear!" subtitle="No pending tasks in this category" /> :
        shown.map((task, i) => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < shown.length - 1 ? `1px solid ${t.colors.border}` : 'none' }}>
            <div style={{ width: '8px', height: '40px', borderRadius: '4px', background: urgencyColors[task.urgency], flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>{task.title}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Due: {task.dueDate} {task.alarm ? `- Alarm at ${task.alarm}` : ''}</div>
            </div>
            <Badge color={urgencyColors[task.urgency]}>{task.urgency}</Badge>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

/* ───────── W7: Critical Panel ───────── */

function CriticalPanelScreen() {
  const tasks = useMemo(() => generatePendingTasks().filter(t => t.urgency === 'critical' || t.status === 'overdue'), []);
  const [dismissed, setDismissed] = useState([]);

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Critical Panel" subtitle="Urgent tasks for today" />
      {tasks.filter(t => !dismissed.includes(t.id)).length === 0 ? (
        <Card><EmptyState icon="🎯" title="All handled!" subtitle="No critical or overdue tasks right now" /></Card>
      ) : tasks.filter(t => !dismissed.includes(t.id)).map(task => (
        <Card key={task.id} style={{ marginBottom: t.spacing.sm, borderLeft: `6px solid ${t.colors.accentDark}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text }}>{task.title}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginTop: '4px' }}>Due: {task.dueDate}</div>
            </div>
            <Badge color={task.status === 'overdue' ? t.colors.accentDark : t.colors.accent}>{task.status === 'overdue' ? 'OVERDUE' : 'CRITICAL'}</Badge>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <ChunkyButton color={t.colors.teal} style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setDismissed([...dismissed, task.id])}>Mark Done</ChunkyButton>
            <ChunkyButton variant="ghost" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setDismissed([...dismissed, task.id])}>Dismiss</ChunkyButton>
          </div>
        </Card>
      ))}
    </motion.div>
  );
}

/* ───────── W10: Import Routines ───────── */

function ImportRoutinesScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      const updated = addRoutine({ name: 'Imported Routine ' + (cloud.routines.length + 1), steps: ['Step 1', 'Step 2', 'Step 3'] });
      setCloud(updated);
      setImporting(false);
      setImported(true);
      setTimeout(() => setImported(false), 2000);
    }, 1500);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Import Routines" subtitle="Upload or import routine templates" />
      <Card style={{ marginBottom: t.spacing.md, textAlign: 'center', padding: t.spacing.xl, border: `3px dashed ${t.colors.border}`, boxShadow: 'none' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
        <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text, marginBottom: '8px' }}>Drop a file or click to import</div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted, marginBottom: '16px' }}>Supports JSON, CSV, or text files</div>
        <ChunkyButton onClick={handleImport} color={t.colors.teal}>{importing ? 'Importing...' : imported ? '✓ Imported!' : 'Import File'}</ChunkyButton>
      </Card>
      <Card>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Existing Routines ({cloud.routines.length})</div>
        {cloud.routines.map((r, i) => (
          <div key={r.id} style={{ padding: '12px 0', borderBottom: i < cloud.routines.length - 1 ? `1px solid ${t.colors.border}` : 'none' }}>
            <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>{r.name}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted, marginTop: '4px' }}>{r.steps.length} steps: {r.steps.join(' → ')}</div>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

/* ───────── W8: Export CSV ───────── */

function ExportCSVScreen() {
  const [exported, setExported] = useState(false);
  const csvPreview = `date,alarm_time,alarm_label,snooze_count,total_minutes,reason
2026-02-07,06:30,Morning routine,2,15,Tired
2026-02-06,07:15,Get ready,1,5,Cold outside
2026-02-05,06:30,Morning routine,3,25,Bad sleep
2026-02-04,06:30,Morning routine,0,0,
2026-02-03,07:15,Get ready,1,10,Stayed up late`;

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Export Sleep Data" subtitle="Download your sleep data as CSV" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>CSV Preview</div>
        <div style={{ background: t.colors.surfaceAlt, borderRadius: t.radii.sm, padding: '14px', border: `2px solid ${t.colors.border}`, fontFamily: 'monospace', fontSize: '12px', color: t.colors.text, whiteSpace: 'pre', overflowX: 'auto', lineHeight: 1.6 }}>
          {csvPreview}
        </div>
      </Card>
      <ChunkyButton onClick={() => { setExported(true); setTimeout(() => setExported(false), 2000); }} color={t.colors.teal}>
        {exported ? '✓ Downloaded!' : 'Export CSV'}
      </ChunkyButton>
    </motion.div>
  );
}

/* ───────── W9: Routine Backups ───────── */

function BackupsScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [backing, setBacking] = useState(false);

  const backupNow = () => {
    setBacking(true);
    setTimeout(() => {
      const updated = updateCloudStore({ backupStatus: { ...cloud.backupStatus, lastBackup: new Date().toISOString(), size: '2.6 MB' } });
      setCloud(updated);
      setBacking(false);
    }, 2000);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Routine Backups" subtitle="Manual and scheduled backup management" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text }}>Auto Backup</div>
          <Toggle enabled={cloud.backupStatus.autoEnabled} onToggle={() => { const u = updateCloudStore({ backupStatus: { ...cloud.backupStatus, autoEnabled: !cloud.backupStatus.autoEnabled } }); setCloud(u); }} />
        </div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>Last backup: {new Date(cloud.backupStatus.lastBackup).toLocaleString()}</div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>Size: {cloud.backupStatus.size}</div>
      </Card>
      <ChunkyButton onClick={backupNow} color={t.colors.teal}>{backing ? 'Backing up...' : 'Backup Now'}</ChunkyButton>
    </motion.div>
  );
}

/* ───────── W14: Profile ───────── */

function ProfileScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    const u = updateProfile({ [field]: value });
    setCloud(u);
  };
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const fields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'timezone', label: 'Timezone', type: 'text' },
    { key: 'language', label: 'Language', type: 'text' },
    { key: 'wakeGoal', label: 'Wake Goal', type: 'time' },
    { key: 'sleepGoal', label: 'Sleep Goal', type: 'time' },
  ];

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Profile" subtitle="Manage your account and preferences" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: t.spacing.md }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: t.colors.accent, border: t.chunkyBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            {cloud.profile.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 800, color: t.colors.text }}>{cloud.profile.name}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary }}>{cloud.profile.email}</div>
          </div>
        </div>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.textSecondary, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{f.label}</label>
            <input type={f.type} value={cloud.profile[f.key]} onChange={(e) => update(f.key, e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.border}`, background: t.colors.surface, fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.text, boxSizing: 'border-box' }} />
          </div>
        ))}
        <ChunkyButton onClick={save} color={t.colors.teal}>{saved ? '✓ Saved!' : 'Save Profile'}</ChunkyButton>
      </Card>
    </motion.div>
  );
}

/* ───────── W15: Sync ───────── */

function SyncScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [syncing, setSyncing] = useState(false);

  const syncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      const u = updateCloudStore({ lastSync: new Date().toISOString(), syncConflicts: 0 });
      setCloud(u);
      setSyncing(false);
    }, 2000);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Sync Between Devices" subtitle="Keep your data in sync across platforms" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: t.spacing.sm }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.teal, border: `2px solid ${t.colors.text}` }} />
          <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>Sync Status: Connected</div>
        </div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary, marginBottom: '4px' }}>Last sync: {new Date(cloud.lastSync).toLocaleString()}</div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: cloud.syncConflicts > 0 ? t.colors.accent : t.colors.textMuted }}>Conflicts: {cloud.syncConflicts}</div>
      </Card>
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Connected Devices</div>
        {cloud.connectedDevices.map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${t.colors.border}` }}>
            <span style={{ fontSize: '20px' }}>{d.platform === 'mobile' ? '📱' : '💻'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>{d.name}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Last seen: {new Date(d.lastSeen).toLocaleString()}</div>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.colors.teal }} />
          </div>
        ))}
      </Card>
      <ChunkyButton onClick={syncNow} color={t.colors.teal}>{syncing ? 'Syncing...' : 'Sync Now'}</ChunkyButton>
    </motion.div>
  );
}

/* ───────── W17: Cloud Backup ───────── */

function CloudBackupScreen() {
  const [cloud] = useState(() => getCloudStore());

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Cloud Backup" subtitle="Monitor your cloud storage status" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        <StatCard label="Storage Used" value={cloud.backupStatus.size} color={t.colors.teal} bg={t.colors.tealLight} />
        <StatCard label="Auto Backup" value={cloud.backupStatus.autoEnabled ? 'ON' : 'OFF'} color={cloud.backupStatus.autoEnabled ? t.colors.teal : t.colors.accent} bg={cloud.backupStatus.autoEnabled ? t.colors.tealLight : t.colors.accentLight+'30'} />
        <StatCard label="Last Backup" value={new Date(cloud.backupStatus.lastBackup).toLocaleDateString()} color={t.colors.purple} bg={t.colors.purpleLight} />
      </div>
      <Card>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Storage Breakdown</div>
        {[{ label: 'Alarms & Settings', size: '0.8 MB', pct: 33 }, { label: 'Sleep History', size: '1.2 MB', pct: 50 }, { label: 'Post-its & Notes', size: '0.4 MB', pct: 17 }].map(item => (
          <div key={item.label} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text }}>{item.label}</span>
              <span style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textMuted }}>{item.size}</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: t.colors.border, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: t.colors.teal, borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

/* ───────── W16: Dark Mode ───────── */

function DarkModeScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Dark Mode" subtitle="Toggle the web app theme" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text }}>Dark Mode</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>Currently {darkMode ? 'enabled' : 'disabled'}</div>
          </div>
          <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
        </div>
      </Card>
      <Card style={darkMode ? { background: '#1A1040', border: `3px solid ${t.colors.purple}` } : {}}>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: darkMode ? '#FFFBF5' : t.colors.text, marginBottom: t.spacing.sm }}>Preview</div>
        <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: darkMode ? 'rgba(255,251,245,0.7)' : t.colors.textSecondary, lineHeight: 1.5 }}>
          This is a preview of how the app looks in {darkMode ? 'dark' : 'light'} mode. The outer page background stays white.
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <div style={{ flex: 1, height: '40px', borderRadius: t.radii.sm, background: darkMode ? t.colors.accent : t.colors.accent, border: `2px solid ${darkMode ? 'rgba(255,255,255,0.3)' : t.colors.text}` }} />
          <div style={{ flex: 1, height: '40px', borderRadius: t.radii.sm, background: darkMode ? t.colors.teal : t.colors.teal, border: `2px solid ${darkMode ? 'rgba(255,255,255,0.3)' : t.colors.text}` }} />
          <div style={{ flex: 1, height: '40px', borderRadius: t.radii.sm, background: darkMode ? t.colors.purple : t.colors.purple, border: `2px solid ${darkMode ? 'rgba(255,255,255,0.3)' : t.colors.text}` }} />
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────── W6: Rules ───────── */

function RulesScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: '' });

  const handleAdd = () => {
    if (!newRule.name) return;
    const u = addRule({ ...newRule, enabled: true });
    setCloud(u);
    setNewRule({ name: '', condition: '', action: '' });
    setShowAdd(false);
  };

  const toggleRule = (id) => {
    const rule = cloud.rules.find(r => r.id === id);
    const u = updateRule(id, { enabled: !rule.enabled });
    setCloud(u);
  };

  const removeRule = (id) => {
    const u = deleteRule(id);
    setCloud(u);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Global Rules" subtitle="Automate alarm behavior with conditions" />
      {cloud.rules.map(rule => (
        <Card key={rule.id} style={{ marginBottom: t.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>{rule.name}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary, marginTop: '4px' }}>IF: {rule.condition}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.teal, marginTop: '2px' }}>THEN: {rule.action}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Toggle enabled={rule.enabled} onToggle={() => toggleRule(rule.id)} size="small" />
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeRule(rule.id)}
                style={{ width: '28px', height: '28px', borderRadius: t.radii.xs, border: `2px solid ${t.colors.accent}`, background: '#FFE5E2', cursor: 'pointer', fontFamily: t.fonts.display, fontSize: '12px', color: t.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</motion.button>
            </div>
          </div>
        </Card>
      ))}
      {showAdd ? (
        <Card style={{ marginBottom: t.spacing.sm }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>New Rule</div>
          {[{ key: 'name', placeholder: 'Rule name', label: 'Name' }, { key: 'condition', placeholder: 'e.g. Meeting before 9 AM', label: 'IF condition' }, { key: 'action', placeholder: 'e.g. Move alarm earlier 15 min', label: 'THEN action' }].map(f => (
            <div key={f.key} style={{ marginBottom: '10px' }}>
              <label style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{f.label}</label>
              <input type="text" value={newRule[f.key]} onChange={(e) => setNewRule({ ...newRule, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ width: '100%', padding: '10px 14px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.border}`, fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.text, boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px' }}>
            <ChunkyButton onClick={handleAdd} color={t.colors.teal} style={{ flex: 1, padding: '10px' }}>Save Rule</ChunkyButton>
            <ChunkyButton variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px' }}>Cancel</ChunkyButton>
          </div>
        </Card>
      ) : (
        <ChunkyButton onClick={() => setShowAdd(true)} color={t.colors.accent}>+ Add Rule</ChunkyButton>
      )}
    </motion.div>
  );
}

/* ───────── W2: Post-it Editor ───────── */

function PostItEditorScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [showAdd, setShowAdd] = useState(false);
  const [newPostIt, setNewPostIt] = useState({ text: '', color: '#FF6B5A', tags: '' });
  const colors = ['#FF6B5A','#2CCCA0','#8B7FE8','#FFD54F','#FF8A65','#4DB6AC'];

  const handleAdd = () => {
    if (!newPostIt.text) return;
    const u = addPostIt({ text: newPostIt.text, color: newPostIt.color, tags: newPostIt.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setCloud(u);
    setNewPostIt({ text: '', color: '#FF6B5A', tags: '' });
    setShowAdd(false);
  };

  const handleRemove = (id) => {
    const u = removePostIt(id);
    setCloud(u);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Post-it Editor" subtitle="Create notes that sync to Mobile motivational library" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
        {cloud.postIts.map(p => (
          <Card key={p.id} style={{ background: p.color + '15', borderColor: p.color, position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemove(p.id)}
              style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${p.color}`, background: '#fff', cursor: 'pointer', fontSize: '10px', fontWeight: 800, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</motion.button>
            <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text, lineHeight: 1.5, marginBottom: '8px', paddingRight: '24px' }}>{p.text}</div>
            {p.tags && <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {p.tags.map(tag => <span key={tag} style={{ fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700, color: p.color, background: p.color + '20', padding: '2px 8px', borderRadius: t.radii.full }}>{tag}</span>)}
            </div>}
            {p.link && <div style={{ fontFamily: t.fonts.body, fontSize: '11px', color: t.colors.teal, marginTop: '6px' }}>🔗 {p.link}</div>}
          </Card>
        ))}
      </div>
      {showAdd ? (
        <Card style={{ marginBottom: t.spacing.sm }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>New Post-it</div>
          <textarea value={newPostIt.text} onChange={(e) => setNewPostIt({ ...newPostIt, text: e.target.value })} placeholder="Write your note..." rows={3}
            style={{ width: '100%', padding: '10px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.border}`, fontFamily: t.fonts.body, fontSize: '14px', resize: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Color</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {colors.map(c => <button key={c} onClick={() => setNewPostIt({ ...newPostIt, color: c })} style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, border: newPostIt.color === c ? `3px solid ${t.colors.text}` : `2px solid ${t.colors.border}`, cursor: 'pointer' }} />)}
            </div>
          </div>
          <input type="text" value={newPostIt.tags} onChange={(e) => setNewPostIt({ ...newPostIt, tags: e.target.value })} placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: '10px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.border}`, fontFamily: t.fonts.body, fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <ChunkyButton onClick={handleAdd} color={t.colors.teal} style={{ flex: 1, padding: '10px' }}>Save</ChunkyButton>
            <ChunkyButton variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px' }}>Cancel</ChunkyButton>
          </div>
        </Card>
      ) : (
        <ChunkyButton onClick={() => setShowAdd(true)} color={t.colors.accent}>+ New Post-it</ChunkyButton>
      )}
    </motion.div>
  );
}

/* ───────── W12: Value Suggestions ───────── */

function SuggestionsScreen() {
  const [suggestions] = useState([
    { id: 's1', text: 'Try waking 15 min earlier to avoid morning rush', type: 'motivation', confidence: 88 },
    { id: 's2', text: 'Add a stretching routine to your morning alarm', type: 'motivation', confidence: 75 },
    { id: 's3', text: 'Schedule a recurring meeting prep alarm for Mondays', type: 'agenda', confidence: 92 },
    { id: 's4', text: 'Your sleep consistency improves on days you exercise', type: 'motivation', confidence: 80 },
    { id: 's5', text: 'Block social media during first 30 min after waking', type: 'agenda', confidence: 70 },
  ]);
  const [accepted, setAccepted] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  const active = suggestions.filter(s => !accepted.includes(s.id) && !dismissed.includes(s.id));
  const motivationPct = 44;
  const agendaPct = 56;

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Value Suggestions" subtitle="AI recommendations based on your patterns" />
      <Card style={{ marginBottom: t.spacing.md }}>
        <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Suggestion Mix</div>
        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${t.colors.text}`, marginBottom: '8px' }}>
          <div style={{ width: `${motivationPct}%`, background: t.colors.accent }} />
          <div style={{ width: `${agendaPct}%`, background: t.colors.teal }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.accent, fontWeight: 700 }}>{motivationPct}% Motivation</span>
          <span style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.teal, fontWeight: 700 }}>{agendaPct}% Agenda</span>
        </div>
      </Card>
      {active.length === 0 ? (
        <Card><EmptyState icon="🎉" title="All reviewed!" subtitle="Check back later for new suggestions" /></Card>
      ) : active.map(s => (
        <Card key={s.id} style={{ marginBottom: t.spacing.sm, borderLeft: `6px solid ${s.type === 'motivation' ? t.colors.accent : t.colors.teal}` }}>
          <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text, lineHeight: 1.5, marginBottom: '8px' }}>{s.text}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge color={s.type === 'motivation' ? t.colors.accent : t.colors.teal}>{s.type} — {s.confidence}%</Badge>
            <div style={{ display: 'flex', gap: '8px' }}>
              <ChunkyButton color={t.colors.teal} onClick={() => setAccepted([...accepted, s.id])} style={{ padding: '6px 14px', fontSize: '12px' }}>Accept</ChunkyButton>
              <ChunkyButton variant="ghost" onClick={() => setDismissed([...dismissed, s.id])} style={{ padding: '6px 14px', fontSize: '12px' }}>Dismiss</ChunkyButton>
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  );
}

/* ───────── W13: Home Automation ───────── */

function HomeAutomationScreen() {
  const [cloud, setCloud] = useState(() => getCloudStore());
  const [connecting, setConnecting] = useState(false);
  const ha = cloud.homeAutomation;

  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      const u = updateCloudStore({
        homeAutomation: {
          ...ha, connected: true, bridge: 'Philips Hue Bridge (Living Room)',
          lights: [{ id: 'l1', name: 'Bedroom Main', selected: true }, { id: 'l2', name: 'Bedroom Nightstand', selected: true }, { id: 'l3', name: 'Hallway', selected: false }],
        },
      });
      setCloud(u);
      setConnecting(false);
    }, 2000);
  };

  const toggleLight = (id) => {
    const lights = ha.lights.map(l => l.id === id ? { ...l, selected: !l.selected } : l);
    const u = updateCloudStore({ homeAutomation: { ...ha, lights } });
    setCloud(u);
  };

  const toggleRamp = () => {
    const u = updateCloudStore({ homeAutomation: { ...ha, wakeRamp: { ...ha.wakeRamp, enabled: !ha.wakeRamp.enabled } } });
    setCloud(u);
  };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Home Automation" subtitle="Connect Philips Hue for wake-up lighting" />
      {!ha.connected ? (
        <Card style={{ textAlign: 'center', padding: t.spacing.xl }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💡</div>
          <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 700, color: t.colors.text, marginBottom: '8px' }}>Connect Your Lights</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '20px' }}>Link your Philips Hue Bridge to simulate a sunrise wake-up.</div>
          <ChunkyButton onClick={connect} color={t.colors.yellow}>{connecting ? 'Connecting...' : 'Connect Hue Bridge'}</ChunkyButton>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: t.spacing.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: t.spacing.sm }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.teal, border: `2px solid ${t.colors.text}` }} />
              <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>Connected: {ha.bridge}</div>
            </div>
            <div style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: t.colors.textSecondary, marginBottom: '8px' }}>Select Lights</div>
            {ha.lights.map(light => (
              <div key={light.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${t.colors.border}` }}>
                <span style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text }}>💡 {light.name}</span>
                <Toggle enabled={light.selected} onToggle={() => toggleLight(light.id)} size="small" />
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
              <div>
                <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>Wake Light Ramp</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary }}>Gradually brighten lights before alarm</div>
              </div>
              <Toggle enabled={ha.wakeRamp.enabled} onToggle={toggleRamp} />
            </div>
            {ha.wakeRamp.enabled && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1, height: '40px', borderRadius: t.radii.sm, background: `linear-gradient(90deg, ${ha.wakeRamp.startColor}, ${ha.wakeRamp.endColor})`, border: `2px solid ${t.colors.text}` }} />
                <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary, display: 'flex', alignItems: 'center' }}>{ha.wakeRamp.duration} min ramp</div>
              </div>
            )}
          </Card>
        </>
      )}
    </motion.div>
  );
}

/* ───────── Settings (Bedtime) — preserved from original ───────── */

function SettingsScreen({ state }) {
  const { bedtimeEnabled, setBedtimeEnabled, bedtimeTime, setBedtimeTime, bedtimeDays, setBedtimeDays } = state;
  const toggleDay = (day) => { setBedtimeDays(bedtimeDays.includes(day) ? bedtimeDays.filter(d => d !== day) : [...bedtimeDays, day]); };

  return (
    <motion.div {...pageTransition} style={{ height: '100%', overflowY: 'auto', padding: t.spacing.lg }}>
      <PageHeader title="Bedtime Settings" subtitle="Configure your bedtime reminder" />
      <Card style={{ marginBottom: t.spacing.md, background: t.colors.purpleDark, border: `3px solid ${t.colors.purple}`, boxShadow: `5px 5px 0px ${t.colors.purple}`, position: 'relative', overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} animate={{ scale: [1,1.4,1], opacity: [0.2,0.6,0.2] }} transition={{ repeat: Infinity, duration: 2.5+i*0.4, delay: i*0.3 }}
            style={{ position: 'absolute', top: `${10+(i*17)%40}%`, right: `${5+(i*11)%30}%`, width: '6px', height: '6px', borderRadius: '1px', background: t.colors.yellow, transform: 'rotate(45deg)' }} />
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '26px' }}>🌙</span>
            <div>
              <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: '#FFFBF5' }}>Bedtime Reminder</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 500, color: 'rgba(255,251,245,0.5)' }}>Get notified when it is time to sleep</div>
            </div>
          </div>
          <Toggle enabled={bedtimeEnabled} onToggle={() => setBedtimeEnabled(!bedtimeEnabled)} />
        </div>
        <AnimatePresence>
          {bedtimeEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ marginBottom: t.spacing.md }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>Bedtime</div>
                <div style={{ background: t.colors.purple, borderRadius: t.radii.md, padding: t.spacing.md, textAlign: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                  <input type="time" value={bedtimeTime} onChange={(e) => setBedtimeTime(e.target.value)} style={{ fontFamily: t.fonts.display, fontSize: '40px', fontWeight: 800, color: '#FFFBF5', background: 'none', border: 'none', textAlign: 'center', width: '100%' }} />
                </div>
              </div>
              <div style={{ marginBottom: t.spacing.sm }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>Remind On</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {ALL_DAYS.map(day => {
                    const active = bedtimeDays.includes(day);
                    return <motion.button key={day} whileTap={{ scale: 0.9 }} onClick={() => toggleDay(day)}
                      style={{ flex: 1, height: '44px', borderRadius: t.radii.xs, border: `2px solid ${active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}`, background: active ? t.colors.purple : 'rgba(255,255,255,0.06)', color: active ? '#FFFBF5' : 'rgba(255,251,245,0.3)', fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{day.substring(0,2)}</motion.button>;
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      <Card>
        <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 800, color: t.colors.text, marginBottom: t.spacing.sm }}>Alarm Overview</div>
        {state.alarms.map(alarm => (
          <div key={alarm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: alarm.enabled ? t.colors.surface : t.colors.surfaceHover, borderRadius: t.radii.sm, border: `2px solid ${alarm.enabled ? t.colors.border : t.colors.borderLight}`, opacity: alarm.enabled ? 1 : 0.55, marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: t.colors.text }}>{alarm.time}</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.textSecondary }}>{alarm.label || 'Untitled'}</div>
            </div>
            <Badge color={alarm.enabled ? t.colors.teal : t.colors.disabled}>{alarm.enabled ? 'ON' : 'OFF'}</Badge>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

/* ───────── Sidebar Navigation ───────── */

const NAV_SECTIONS = [
  { type: 'item', id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { type: 'item', id: 'calendar', label: 'Calendar', icon: '31' },
  { type: 'header', label: 'SLEEP' },
  { type: 'item', id: 'bedtime', label: 'Bedtime', icon: '☾' },
  { type: 'item', id: 'snooze', label: 'Snooze Patterns', icon: 'Zz' },
  { type: 'item', id: 'compliance', label: 'Compliance', icon: '✓' },
  { type: 'header', label: 'TOOLS' },
  { type: 'item', id: 'rules', label: 'Rules', icon: '⚡' },
  { type: 'item', id: 'postit', label: 'Post-it Editor', icon: '📝' },
  { type: 'item', id: 'suggestions', label: 'Suggestions', icon: '✦' },
  { type: 'item', id: 'automation', label: 'Home Automation', icon: '💡' },
  { type: 'header', label: 'TASKS' },
  { type: 'item', id: 'critical', label: 'Critical Panel', icon: '!!' },
  { type: 'item', id: 'pending', label: 'Pending History', icon: '☰' },
  { type: 'header', label: 'DATA' },
  { type: 'item', id: 'import', label: 'Import Routines', icon: '↑' },
  { type: 'item', id: 'export', label: 'Export CSV', icon: '↓' },
  { type: 'item', id: 'backups', label: 'Backups', icon: '◎' },
  { type: 'header', label: 'SETTINGS' },
  { type: 'item', id: 'sync', label: 'Sync', icon: '⟳' },
  { type: 'item', id: 'cloud', label: 'Cloud Backup', icon: '☁' },
  { type: 'item', id: 'darkmode', label: 'Dark Mode', icon: '◐' },
];

const iconColorMap = {
  dashboard: t.colors.yellow, calendar: t.colors.accent, snooze: t.colors.teal, compliance: t.colors.purple,
  critical: t.colors.accentDark, pending: t.colors.yellow, import: t.colors.teal, export: t.colors.teal,
  backups: t.colors.purple, profile: t.colors.accent, sync: t.colors.teal, cloud: t.colors.purple,
  darkmode: t.colors.text, bedtime: t.colors.purple, rules: t.colors.yellow, postit: t.colors.accent,
  suggestions: t.colors.teal, automation: t.colors.yellow,
};

function Sidebar({ activeSection, onNavigate, profileName }) {
  const initial = profileName ? profileName.charAt(0).toUpperCase() : 'A';
  return (
    <div style={{
      width: '220px', minWidth: '220px', height: '100%', background: t.colors.purpleDark,
      borderRight: t.chunkyBorder, display: 'flex', flexDirection: 'column', fontFamily: t.fonts.display, overflow: 'hidden',
    }}>
      <div style={{ padding: `${t.spacing.lg} ${t.spacing.md}`, borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: t.radii.sm, background: t.colors.accent, border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: t.colors.white, boxShadow: '3px 3px 0px rgba(255,255,255,0.12)' }}>A!</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFBF5', lineHeight: 1.1 }}>Alarms!</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 500, color: 'rgba(255,251,245,0.4)', marginTop: '2px' }}>Web Dashboard</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 10px', borderRadius: t.radii.sm, cursor: 'pointer',
            background: activeSection === 'profile' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
            border: activeSection === 'profile' ? '2px solid rgba(255,255,255,0.25)' : '2px solid rgba(255,255,255,0.08)',
            transition: 'background 0.15s, border 0.15s',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: t.colors.accent, border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 800, color: '#fff',
            boxShadow: '2px 2px 0px rgba(255,255,255,0.12)', flexShrink: 0,
          }}>{initial}</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFBF5', lineHeight: 1.2 }}>{profileName || 'Profile'}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '10px', fontWeight: 500, color: 'rgba(255,251,245,0.4)' }}>View profile</div>
          </div>
        </motion.button>
      </div>
      <nav style={{ padding: `${t.spacing.xs} 0`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {NAV_SECTIONS.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} style={{
                  padding: '14px 16px 4px', fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700,
                  color: 'rgba(255,251,245,0.25)', letterSpacing: '1px',
                }}>
                  {item.label}
                </div>
              );
            }
            const active = activeSection === item.id;
            return (
              <motion.button key={item.id} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.15s',
                }}>
                {active && <motion.div layoutId="sidebarIndicator" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderRadius: '0 3px 3px 0', background: t.colors.accent }} />}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: active ? (iconColorMap[item.id] || t.colors.accent) : 'rgba(255,255,255,0.06)',
                  border: active ? `2px solid ${t.colors.text}` : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 800,
                  color: active ? t.colors.white : 'rgba(255,251,245,0.5)', flexShrink: 0,
                  boxShadow: active ? `2px 2px 0px ${t.colors.text}` : 'none',
                }}>{item.icon}</div>
                <span style={{ fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? '#FFFBF5' : 'rgba(255,251,245,0.5)', transition: 'color 0.15s' }}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.md}`, borderTop: '2px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 500, color: 'rgba(255,251,245,0.25)', textAlign: 'center' }}>Web v1 - Neo-Retro Pop</div>
      </div>
    </div>
  );
}

/* ───────── Main Component ───────── */

export default function WebV1ClassicSidebar({ state }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [cloud] = useState(() => getCloudStore());

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: t.colors.bg, fontFamily: t.fonts.body, overflow: 'hidden' }}>
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} profileName={cloud.profile.name} />
      <div style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative', background: t.colors.bg }}>
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' && <WellbeingScreen key="dashboard" state={state} onNavigate={setActiveSection} />}
          {activeSection === 'calendar' && <CalendarScreen key="calendar" state={state} />}
          {activeSection === 'snooze' && <SnoozeHistoryScreen key="snooze" />}
          {activeSection === 'compliance' && <ComplianceScreen key="compliance" />}
          {activeSection === 'critical' && <CriticalPanelScreen key="critical" />}
          {activeSection === 'pending' && <PendingScreen key="pending" />}
          {activeSection === 'import' && <ImportRoutinesScreen key="import" />}
          {activeSection === 'export' && <ExportCSVScreen key="export" />}
          {activeSection === 'backups' && <BackupsScreen key="backups" />}
          {activeSection === 'profile' && <ProfileScreen key="profile" />}
          {activeSection === 'sync' && <SyncScreen key="sync" />}
          {activeSection === 'cloud' && <CloudBackupScreen key="cloud" />}
          {activeSection === 'darkmode' && <DarkModeScreen key="darkmode" />}
          {activeSection === 'bedtime' && <SettingsScreen key="bedtime" state={state} />}
          {activeSection === 'rules' && <RulesScreen key="rules" />}
          {activeSection === 'postit' && <PostItEditorScreen key="postit" />}
          {activeSection === 'suggestions' && <SuggestionsScreen key="suggestions" />}
          {activeSection === 'automation' && <HomeAutomationScreen key="automation" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
