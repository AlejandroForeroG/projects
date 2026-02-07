// Web v4 — "Bold Tab Strip"
// Full-width tab navigation with magazine-style content sections
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';

/* ---------- Google Fonts Loader ---------- */
if (typeof document !== 'undefined') {
  const id = 'gf-bold-tab-strip';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${t.googleFonts}&display=swap`;
    document.head.appendChild(link);
  }
}

/* ---------- Constants / Mock Data ---------- */
const TABS = [
  { key: 'calendar', label: 'Schedule' },
  { key: 'history', label: 'Snooze History' },
  { key: 'wellbeing', label: 'Wellbeing' },
  { key: 'settings', label: 'Settings' },
];

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function generateSnoozeHistory() {
  const labels = ['Morning routine', 'Get ready', 'Weekend gentle wake', 'Nap alarm', 'Focus break'];
  const reasons = ['Too tired', 'Needed 5 more minutes', 'Was in deep sleep', 'Raining outside', 'Cozy blanket'];
  const entries = [];
  const now = Date.now();
  for (let i = 0; i < 28; i++) {
    const ts = now - i * 1000 * 60 * 60 * (6 + Math.random() * 18);
    const d = new Date(ts);
    const snoozeCount = Math.floor(Math.random() * 4) + 1;
    const snoozeDur = [5, 10, 15][Math.floor(Math.random() * 3)];
    entries.push({
      id: `sh-${i}`,
      date: d,
      dateStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timeStr: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      label: labels[i % labels.length],
      snoozeCount,
      totalMinutes: snoozeCount * snoozeDur,
      snoozeDuration: snoozeDur,
      reason: reasons[i % reasons.length],
      dismissed: Math.random() > 0.3,
    });
  }
  return entries;
}

function generateWellbeingData() {
  return {
    sleepScore: 78,
    avgSnooze: 1.4,
    onTimeRate: 82,
    streakDays: 5,
    totalSnoozesWeek: 9,
    totalSnoozesMonth: 31,
    avgSleepHours: 7.2,
    bestDay: 'Wednesday',
    worstDay: 'Monday',
    weeklyTrend: [65, 72, 80, 74, 85, 78, 82],
    insights: [
      'You wake up most consistently on Wednesdays. Consider replicating that routine on other days.',
      'Your snooze rate drops by 40% when you go to bed before 10:30 PM.',
      'Morning sunlight exposure correlates with your best wake-up scores.',
    ],
    metrics: [
      { label: 'Avg. Sleep', value: '7.2h', color: t.colors.teal, bg: t.colors.tealLight },
      { label: 'On-Time Rate', value: '82%', color: t.colors.accent, bg: t.colors.accentLight },
      { label: 'Streak', value: '5 days', color: t.colors.purple, bg: t.colors.purpleLight },
      { label: 'Snoozes / Week', value: '9', color: t.colors.yellow, bg: t.colors.yellowLight },
      { label: 'Best Day', value: 'Wed', color: t.colors.teal, bg: t.colors.tealLight },
      { label: 'Worst Day', value: 'Mon', color: t.colors.accent, bg: t.colors.accentLight },
    ],
  };
}

const SNOOZE_DATA = generateSnoozeHistory();
const WELLBEING_DATA = generateWellbeingData();

/* ---------- Utility ---------- */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0
}

function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  return { h, m };
}

function formatHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh} ${ampm}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/* ---------- Animations ---------- */
const tabContent = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

const drawerVariants = {
  hidden: { x: '100%', opacity: 0.5 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

/* =============================================
   MAIN COMPONENT
   ============================================= */
export default function BoldTabStrip({ state }) {
  const {
    alarms, editingAlarm, toggleAlarm, createNewAlarm, editAlarm, saveAlarm,
    deleteAlarm, updateEditingAlarm, bedtimeEnabled, setBedtimeEnabled,
    bedtimeTime, setBedtimeTime, bedtimeDays, setBedtimeDays,
  } = state;

  const [activeTab, setActiveTab] = useState('calendar');
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAlarm, setDrawerAlarm] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('7d');
  const [expandedEntry, setExpandedEntry] = useState(null);

  // Build set of alarm-days for the current calendar month
  const alarmDaySet = useMemo(() => {
    const set = new Set();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    alarms.forEach((a) => {
      if (!a.enabled) return;
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(calYear, calMonth, d);
        const dayName = ALL_DAYS[(dt.getDay() + 6) % 7]; // 0=Mon
        if (a.days.includes(dayName)) set.add(d);
      }
    });
    return set;
  }, [alarms, calYear, calMonth]);

  // Calendar day click -> open drawer
  const openDayDrawer = (day) => {
    const dt = new Date(calYear, calMonth, day);
    const dayName = ALL_DAYS[(dt.getDay() + 6) % 7];
    const dayAlarms = alarms.filter((a) => a.days.includes(dayName));
    setDrawerAlarm({ day, dayName, date: dt, alarms: dayAlarms });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerAlarm(null);
  };

  const handleNewAlarmFromDrawer = () => {
    createNewAlarm();
    closeDrawer();
  };

  const handleEditFromDrawer = (alarm) => {
    editAlarm(alarm);
    closeDrawer();
  };

  // Filtered snooze history
  const filteredHistory = useMemo(() => {
    const cutoff = historyFilter === '7d' ? 7 : 30;
    const limit = Date.now() - cutoff * 24 * 60 * 60 * 1000;
    return SNOOZE_DATA.filter((e) => e.date.getTime() >= limit);
  }, [historyFilter]);

  /* ---- Styles ---- */
  const s = {
    root: {
      width: '100%',
      minHeight: '100vh',
      background: t.colors.bg,
      fontFamily: t.fonts.body,
      color: t.colors.text,
      position: 'relative',
      overflow: 'hidden',
    },
    tabBar: {
      display: 'flex',
      width: '100%',
      borderBottom: `2px solid ${t.colors.border}`,
      background: t.colors.surface,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    tab: (active) => ({
      flex: 1,
      padding: '18px 8px 14px',
      textAlign: 'center',
      fontFamily: t.fonts.display,
      fontWeight: active ? 800 : 600,
      fontSize: '15px',
      letterSpacing: '0.02em',
      color: active ? t.colors.accent : t.colors.textSecondary,
      cursor: 'pointer',
      borderBottom: active ? `4px solid ${t.colors.accent}` : '4px solid transparent',
      transition: 'all 0.2s',
      userSelect: 'none',
      background: 'none',
      border: 'none',
      borderBottomStyle: 'solid',
      borderBottomWidth: '4px',
      borderBottomColor: active ? t.colors.accent : 'transparent',
    }),
    content: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: `${t.spacing.xl} ${t.spacing.lg}`,
    },
    sectionTitle: {
      fontFamily: t.fonts.display,
      fontSize: '42px',
      fontWeight: 800,
      lineHeight: 1.1,
      margin: `0 0 ${t.spacing.sm} 0`,
      color: t.colors.text,
    },
    subtitle: {
      fontFamily: t.fonts.body,
      fontSize: '17px',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.lg,
      lineHeight: 1.5,
    },
  };

  return (
    <div style={s.root}>
      {/* Tab Bar */}
      <div style={s.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            style={s.tab(activeTab === tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...tabContent} style={s.content}>
          {activeTab === 'calendar' && (
            <CalendarScreen
              alarms={alarms}
              calYear={calYear}
              calMonth={calMonth}
              setCalYear={setCalYear}
              setCalMonth={setCalMonth}
              alarmDaySet={alarmDaySet}
              openDayDrawer={openDayDrawer}
              toggleAlarm={toggleAlarm}
            />
          )}
          {activeTab === 'history' && (
            <HistoryScreen
              filter={historyFilter}
              setFilter={setHistoryFilter}
              entries={filteredHistory}
              expandedEntry={expandedEntry}
              setExpandedEntry={setExpandedEntry}
            />
          )}
          {activeTab === 'wellbeing' && <WellbeingScreen data={WELLBEING_DATA} />}
          {activeTab === 'settings' && (
            <SettingsScreen
              bedtimeEnabled={bedtimeEnabled}
              setBedtimeEnabled={setBedtimeEnabled}
              bedtimeTime={bedtimeTime}
              setBedtimeTime={setBedtimeTime}
              bedtimeDays={bedtimeDays}
              setBedtimeDays={setBedtimeDays}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Drawer Overlay + Panel */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              style={{
                position: 'fixed',
                inset: 0,
                background: t.colors.overlay,
                zIndex: 200,
              }}
            />
            <motion.div
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '420px',
                maxWidth: '90vw',
                height: '100vh',
                background: t.colors.surface,
                zIndex: 201,
                boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <DrawerContent
                drawerAlarm={drawerAlarm}
                onClose={closeDrawer}
                onNew={handleNewAlarmFromDrawer}
                onEdit={handleEditFromDrawer}
                toggleAlarm={toggleAlarm}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =============================================
   W1 — Calendar Schedule
   ============================================= */
function CalendarScreen({ alarms, calYear, calMonth, setCalYear, setCalMonth, alarmDaySet, openDayDrawer, toggleAlarm }) {
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <h1 style={{ fontFamily: t.fonts.display, fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Schedule
      </h1>
      <p style={{ fontFamily: t.fonts.body, fontSize: '17px', color: t.colors.textSecondary, margin: `${t.spacing.xs} 0 ${t.spacing.xl}` }}>
        Tap a day to view or create alarms.
      </p>

      {/* Month Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: t.spacing.lg,
      }}>
        <button onClick={prevMonth} style={navBtnStyle}>&larr;</button>
        <span style={{
          fontFamily: t.fonts.display, fontSize: '26px', fontWeight: 700, color: t.colors.text,
        }}>
          {MONTH_NAMES[calMonth]} {calYear}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>&rarr;</button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {dayHeaders.map((d) => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700,
            fontSize: '13px', color: t.colors.textMuted, padding: '8px 0',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;
          const hasAlarm = alarmDaySet.has(day);
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openDayDrawer(day)}
              style={{
                position: 'relative',
                background: isToday ? t.colors.accent : t.colors.surface,
                color: isToday ? t.colors.white : t.colors.text,
                border: isToday ? 'none' : t.chunkyBorder,
                borderRadius: t.radii.sm,
                padding: '14px 4px 18px',
                fontFamily: t.fonts.display,
                fontWeight: 700,
                fontSize: '18px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isToday ? t.chunkyShadowAccent : 'none',
                minHeight: '56px',
              }}
            >
              {day}
              {hasAlarm && (
                <span style={{
                  position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: isToday ? t.colors.white : t.colors.accent,
                }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Alarms Summary below calendar */}
      <div style={{ marginTop: t.spacing.xl }}>
        <h2 style={{ fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 700, margin: `0 0 ${t.spacing.md}` }}>
          Active Alarms
        </h2>
        {alarms.filter((a) => a.enabled).length === 0 && (
          <p style={{ color: t.colors.textMuted, fontSize: '15px' }}>No active alarms.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.sm }}>
          {alarms.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing.md,
                padding: t.spacing.md,
                background: t.colors.surface,
                border: t.chunkyBorder,
                borderRadius: t.radii.md,
                boxShadow: a.enabled ? t.chunkyShadowSm : 'none',
                opacity: a.enabled ? 1 : 0.55,
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800,
                color: a.enabled ? t.colors.accent : t.colors.textMuted,
                minWidth: '90px',
              }}>
                {a.time}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{a.label || 'Untitled'}</div>
                <div style={{ fontSize: '13px', color: t.colors.textSecondary, marginTop: '2px' }}>
                  {a.days.join(', ')}
                </div>
              </div>
              <ToggleSwitch checked={a.enabled} onChange={() => toggleAlarm(a.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Drawer Content ---- */
function DrawerContent({ drawerAlarm, onClose, onNew, onEdit, toggleAlarm }) {
  if (!drawerAlarm) return null;
  const { day, dayName, date, alarms: dayAlarms } = drawerAlarm;
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: `${t.spacing.lg} ${t.spacing.lg} ${t.spacing.md}`,
        borderBottom: `2px solid ${t.colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{
              fontFamily: t.fonts.display, fontSize: '32px', fontWeight: 800,
              margin: 0, lineHeight: 1.1, color: t.colors.text,
            }}>
              {dayName}
            </h2>
            <p style={{ fontFamily: t.fonts.body, fontSize: '15px', color: t.colors.textSecondary, margin: '4px 0 0' }}>
              {dateStr}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '28px', color: t.colors.textMuted, padding: '4px', lineHeight: 1,
          }}>
            &times;
          </button>
        </div>
      </div>

      {/* Alarms list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: t.spacing.lg }}>
        {dayAlarms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: t.spacing.xl, color: t.colors.textMuted }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px' }}>&#128164;</p>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No alarms on this day</p>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>Create one to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.md }}>
            {dayAlarms.map((a) => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.01 }}
                style={{
                  padding: t.spacing.md,
                  background: t.colors.bg,
                  border: t.chunkyBorder,
                  borderRadius: t.radii.md,
                  cursor: 'pointer',
                  boxShadow: t.chunkyShadowSm,
                }}
                onClick={() => onEdit(a)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: t.fonts.display, fontSize: '26px', fontWeight: 800,
                    color: a.enabled ? t.colors.accent : t.colors.textMuted,
                  }}>
                    {a.time}
                  </span>
                  <ToggleSwitch checked={a.enabled} onChange={(e) => { e.stopPropagation(); toggleAlarm(a.id); }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '8px' }}>
                  {a.label || 'Untitled'}
                </div>
                {a.purpose && (
                  <div style={{ fontSize: '13px', color: t.colors.textSecondary, marginTop: '4px', lineHeight: 1.4 }}>
                    {a.purpose}
                  </div>
                )}
                <div style={{
                  fontSize: '12px', color: t.colors.textMuted, marginTop: '8px',
                  display: 'flex', gap: '6px', flexWrap: 'wrap',
                }}>
                  {a.days.map((d) => (
                    <span key={d} style={{
                      padding: '2px 8px', borderRadius: t.radii.xs,
                      background: t.colors.surfaceAlt, fontWeight: 600,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: t.spacing.lg, borderTop: `2px solid ${t.colors.border}` }}>
        <button
          onClick={onNew}
          style={{
            width: '100%', padding: '16px',
            background: t.colors.accent, color: t.colors.white,
            border: t.chunkyBorder, borderRadius: t.radii.md,
            fontFamily: t.fonts.display, fontWeight: 700, fontSize: '16px',
            cursor: 'pointer', boxShadow: t.chunkyShadow,
          }}
        >
          + New Alarm
        </button>
      </div>
    </div>
  );
}

/* =============================================
   W3 — Snooze History
   ============================================= */
function HistoryScreen({ filter, setFilter, entries, expandedEntry, setExpandedEntry }) {
  return (
    <div>
      <h1 style={{ fontFamily: t.fonts.display, fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Snooze History
      </h1>
      <p style={{ fontFamily: t.fonts.body, fontSize: '17px', color: t.colors.textSecondary, margin: `${t.spacing.xs} 0 ${t.spacing.lg}` }}>
        A chronological look at your snooze patterns.
      </p>

      {/* Sticky Filter Bar */}
      <div style={{
        position: 'sticky', top: '58px', zIndex: 50,
        background: t.colors.bg, padding: `${t.spacing.sm} 0 ${t.spacing.md}`,
        display: 'flex', alignItems: 'center', gap: t.spacing.sm,
        borderBottom: `2px solid ${t.colors.border}`,
        marginBottom: t.spacing.lg,
      }}>
        <span style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.textSecondary, marginRight: '4px' }}>
          Period:
        </span>
        {['7d', '30d'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: t.radii.full,
              border: filter === f ? t.chunkyBorder : `2px solid ${t.colors.border}`,
              background: filter === f ? t.colors.accent : t.colors.surface,
              color: filter === f ? t.colors.white : t.colors.text,
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: filter === f ? t.chunkyShadowSm : 'none',
              transition: 'all 0.2s',
            }}
          >
            {f === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '14px', color: t.colors.textMuted, fontWeight: 600 }}>
          {entries.length} event{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '36px' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute', left: '14px', top: 0, bottom: 0,
          width: '3px', background: t.colors.border, borderRadius: '2px',
        }} />

        {entries.map((entry, idx) => {
          const isExpanded = expandedEntry === entry.id;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              style={{ position: 'relative', marginBottom: t.spacing.md }}
            >
              {/* Node dot */}
              <div style={{
                position: 'absolute', left: '-28px', top: '18px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: entry.dismissed ? t.colors.teal : t.colors.accent,
                border: `3px solid ${t.colors.bg}`,
                boxShadow: `0 0 0 2px ${entry.dismissed ? t.colors.teal : t.colors.accent}`,
                zIndex: 1,
              }} />

              {/* Card */}
              <div
                onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                style={{
                  background: t.colors.surface,
                  border: t.chunkyBorder,
                  borderRadius: t.radii.md,
                  padding: t.spacing.md,
                  cursor: 'pointer',
                  boxShadow: isExpanded ? t.chunkyShadow : t.chunkyShadowSm,
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700,
                      color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {entry.dateStr}
                    </div>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800,
                      color: t.colors.text, marginTop: '4px',
                    }}>
                      {entry.timeStr}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px',
                      color: entry.dismissed ? t.colors.teal : t.colors.accent,
                    }}>
                      {entry.dismissed ? 'Dismissed' : 'Snoozed'}
                    </div>
                    <div style={{
                      fontSize: '26px', fontFamily: t.fonts.display, fontWeight: 800,
                      color: t.colors.text,
                    }}>
                      {entry.snoozeCount}x
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing.sm, marginTop: t.spacing.sm,
                }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: t.radii.full,
                    background: t.colors.surfaceAlt, fontSize: '13px', fontWeight: 600,
                  }}>
                    {entry.label}
                  </span>
                  <span style={{ fontSize: '13px', color: t.colors.textMuted }}>
                    +{entry.totalMinutes} min total
                  </span>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      variants={expandVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: t.spacing.md,
                        paddingTop: t.spacing.md,
                        borderTop: `2px solid ${t.colors.border}`,
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing.sm }}>
                          <DetailField label="Snooze Duration" value={`${entry.snoozeDuration} min each`} />
                          <DetailField label="Total Delay" value={`${entry.totalMinutes} minutes`} />
                          <DetailField label="Reason" value={entry.reason} />
                          <DetailField label="Outcome" value={entry.dismissed ? 'Eventually dismissed' : 'Still snoozing'} />
                        </div>
                        <div style={{
                          marginTop: t.spacing.md,
                          padding: t.spacing.sm,
                          background: t.colors.yellowLight,
                          borderRadius: t.radii.sm,
                          fontSize: '14px',
                          fontStyle: 'italic',
                          color: t.colors.text,
                          borderLeft: `4px solid ${t.colors.yellow}`,
                        }}>
                          Tip: Try placing your phone across the room to reduce snooze temptation.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <div style={{
            textAlign: 'center', padding: t.spacing.xxl,
            color: t.colors.textMuted, fontSize: '16px',
          }}>
            No snooze events in this period. Great job!
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: '12px', fontWeight: 700, color: t.colors.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: t.colors.text }}>
        {value}
      </div>
    </div>
  );
}

/* =============================================
   W11 — Wellbeing Dashboard
   ============================================= */
function WellbeingScreen({ data }) {
  const trendMax = Math.max(...data.weeklyTrend);
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      <h1 style={{ fontFamily: t.fonts.display, fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Wellbeing
      </h1>
      <p style={{ fontFamily: t.fonts.body, fontSize: '17px', color: t.colors.textSecondary, margin: `${t.spacing.xs} 0 ${t.spacing.xl}` }}>
        Your sleep and wake patterns at a glance.
      </p>

      {/* Hero Stat */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          background: `linear-gradient(135deg, ${t.colors.purpleDark} 0%, ${t.colors.accent} 100%)`,
          border: t.chunkyBorder,
          borderRadius: t.radii.lg,
          padding: `${t.spacing.xxl} ${t.spacing.xl}`,
          color: t.colors.white,
          textAlign: 'center',
          boxShadow: t.chunkyShadow,
          marginBottom: t.spacing.xl,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8,
          marginBottom: t.spacing.sm,
        }}>
          Sleep Score
        </div>
        <div style={{
          fontFamily: t.fonts.display, fontSize: '96px', fontWeight: 800, lineHeight: 1,
        }}>
          {data.sleepScore}
        </div>
        <div style={{
          fontFamily: t.fonts.body, fontSize: '16px', opacity: 0.8, marginTop: t.spacing.sm,
        }}>
          out of 100 — {data.sleepScore >= 80 ? 'Excellent' : data.sleepScore >= 60 ? 'Good' : 'Needs improvement'}
        </div>
      </motion.div>

      {/* Weekly Trend Bar Chart */}
      <div style={{
        background: t.colors.surface,
        border: t.chunkyBorder,
        borderRadius: t.radii.md,
        padding: t.spacing.lg,
        marginBottom: t.spacing.xl,
        boxShadow: t.chunkyShadowSm,
      }}>
        <h3 style={{ fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 700, margin: `0 0 ${t.spacing.md}` }}>
          Weekly Trend
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
          {data.weeklyTrend.map((val, i) => {
            const pct = (val / trendMax) * 100;
            const barColor = val >= 80 ? t.colors.teal : val >= 65 ? t.colors.yellow : t.colors.accent;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: t.colors.textSecondary, marginBottom: '4px' }}>
                  {val}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    background: barColor,
                    borderRadius: `${t.radii.xs} ${t.radii.xs} 0 0`,
                    border: t.chunkyBorder,
                    borderBottom: 'none',
                    minHeight: '4px',
                  }}
                />
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: t.colors.textMuted,
                  marginTop: '6px', textTransform: 'uppercase',
                }}>
                  {trendDays[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards — 3 column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: t.spacing.md,
        marginBottom: t.spacing.xl,
      }}>
        {data.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            style={{
              background: m.bg,
              border: t.chunkyBorder,
              borderRadius: t.radii.md,
              padding: t.spacing.lg,
              textAlign: 'center',
              boxShadow: t.chunkyShadowSm,
            }}
          >
            <div style={{
              fontFamily: t.fonts.display, fontSize: '36px', fontWeight: 800,
              color: m.color, lineHeight: 1,
            }}>
              {m.value}
            </div>
            <div style={{
              fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700,
              color: t.colors.textSecondary, marginTop: t.spacing.sm,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {m.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pull-Quotes / Insights */}
      <h2 style={{
        fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800,
        margin: `0 0 ${t.spacing.lg}`,
      }}>
        Insights
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing.md }}>
        {data.insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.35 }}
            style={{
              padding: `${t.spacing.lg} ${t.spacing.xl}`,
              background: t.colors.surface,
              border: t.chunkyBorder,
              borderLeft: `6px solid ${[t.colors.purple, t.colors.teal, t.colors.accent][i % 3]}`,
              borderRadius: t.radii.md,
              boxShadow: t.chunkyShadowSm,
            }}
          >
            <div style={{
              fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 700,
              lineHeight: 1.45, color: t.colors.text, fontStyle: 'italic',
            }}>
              &ldquo;{insight}&rdquo;
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Summary Row */}
      <div style={{
        display: 'flex', gap: t.spacing.md, marginTop: t.spacing.xl,
        padding: t.spacing.lg,
        background: t.colors.surfaceAlt,
        border: t.chunkyBorder,
        borderRadius: t.radii.md,
        boxShadow: t.chunkyShadowSm,
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color: t.colors.teal }}>
            {data.avgSnooze}
          </div>
          <div style={{ fontSize: '13px', color: t.colors.textSecondary, fontWeight: 600, marginTop: '4px' }}>
            Avg Snoozes / Day
          </div>
        </div>
        <div style={{ width: '2px', background: t.colors.border }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color: t.colors.accent }}>
            {data.totalSnoozesMonth}
          </div>
          <div style={{ fontSize: '13px', color: t.colors.textSecondary, fontWeight: 600, marginTop: '4px' }}>
            Snoozes This Month
          </div>
        </div>
        <div style={{ width: '2px', background: t.colors.border }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color: t.colors.purple }}>
            {data.onTimeRate}%
          </div>
          <div style={{ fontSize: '13px', color: t.colors.textSecondary, fontWeight: 600, marginTop: '4px' }}>
            On-Time Rate
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   Settings (Bedtime)
   ============================================= */
function SettingsScreen({ bedtimeEnabled, setBedtimeEnabled, bedtimeTime, setBedtimeTime, bedtimeDays, setBedtimeDays }) {
  const { h, m } = parseTime(bedtimeTime);

  const adjustHour = (delta) => {
    let newH = (h + delta + 24) % 24;
    setBedtimeTime(`${pad2(newH)}:${pad2(m)}`);
  };
  const adjustMin = (delta) => {
    let newM = (m + delta + 60) % 60;
    setBedtimeTime(`${pad2(h)}:${pad2(newM)}`);
  };

  const toggleDay = (day) => {
    setBedtimeDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;

  return (
    <div>
      <h1 style={{ fontFamily: t.fonts.display, fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Settings
      </h1>
      <p style={{ fontFamily: t.fonts.body, fontSize: '17px', color: t.colors.textSecondary, margin: `${t.spacing.xs} 0 ${t.spacing.xl}` }}>
        Configure your bedtime reminder for better rest.
      </p>

      {/* Prominent Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: t.spacing.lg,
        background: bedtimeEnabled
          ? `linear-gradient(135deg, ${t.colors.purpleDark} 0%, ${t.colors.purple} 100%)`
          : t.colors.surface,
        border: t.chunkyBorder,
        borderRadius: t.radii.lg,
        boxShadow: t.chunkyShadow,
        marginBottom: t.spacing.xl,
        transition: 'background 0.3s',
      }}>
        <div>
          <div style={{
            fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800,
            color: bedtimeEnabled ? t.colors.white : t.colors.text,
          }}>
            Bedtime Reminder
          </div>
          <div style={{
            fontFamily: t.fonts.body, fontSize: '15px',
            color: bedtimeEnabled ? 'rgba(255,255,255,0.7)' : t.colors.textSecondary,
            marginTop: '4px',
          }}>
            {bedtimeEnabled ? 'Active — you will be reminded nightly' : 'Disabled — no reminders'}
          </div>
        </div>
        <ToggleSwitch
          checked={bedtimeEnabled}
          onChange={() => setBedtimeEnabled(!bedtimeEnabled)}
          large
        />
      </div>

      {/* Large Visual Time Display */}
      <div style={{
        background: t.colors.surface,
        border: t.chunkyBorder,
        borderRadius: t.radii.lg,
        padding: `${t.spacing.xxl} ${t.spacing.xl}`,
        textAlign: 'center',
        boxShadow: t.chunkyShadow,
        marginBottom: t.spacing.xl,
        opacity: bedtimeEnabled ? 1 : 0.45,
        pointerEvents: bedtimeEnabled ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }}>
        <div style={{
          fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: t.colors.textMuted, marginBottom: t.spacing.md,
        }}>
          Bedtime
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing.md,
        }}>
          {/* Hour */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => adjustHour(1)} style={spinnerBtnStyle}>&#9650;</button>
            <div style={{
              fontFamily: t.fonts.display, fontSize: '80px', fontWeight: 800,
              color: t.colors.text, lineHeight: 1, minWidth: '120px',
            }}>
              {pad2(displayH)}
            </div>
            <button onClick={() => adjustHour(-1)} style={spinnerBtnStyle}>&#9660;</button>
          </div>

          <div style={{
            fontFamily: t.fonts.display, fontSize: '72px', fontWeight: 800,
            color: t.colors.accent, lineHeight: 1, marginTop: '-8px',
          }}>
            :
          </div>

          {/* Minute */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => adjustMin(5)} style={spinnerBtnStyle}>&#9650;</button>
            <div style={{
              fontFamily: t.fonts.display, fontSize: '80px', fontWeight: 800,
              color: t.colors.text, lineHeight: 1, minWidth: '120px',
            }}>
              {pad2(m)}
            </div>
            <button onClick={() => adjustMin(-5)} style={spinnerBtnStyle}>&#9660;</button>
          </div>

          {/* AM/PM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: t.spacing.sm }}>
            <button
              onClick={() => { if (h >= 12) adjustHour(-12); }}
              style={{
                ...ampmBtnBase,
                background: ampm === 'AM' ? t.colors.accent : t.colors.surfaceAlt,
                color: ampm === 'AM' ? t.colors.white : t.colors.textSecondary,
                border: t.chunkyBorder,
                boxShadow: ampm === 'AM' ? t.chunkyShadowSm : 'none',
              }}
            >
              AM
            </button>
            <button
              onClick={() => { if (h < 12) adjustHour(12); }}
              style={{
                ...ampmBtnBase,
                background: ampm === 'PM' ? t.colors.accent : t.colors.surfaceAlt,
                color: ampm === 'PM' ? t.colors.white : t.colors.textSecondary,
                border: t.chunkyBorder,
                boxShadow: ampm === 'PM' ? t.chunkyShadowSm : 'none',
              }}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector — Large clickable blocks */}
      <div style={{
        background: t.colors.surface,
        border: t.chunkyBorder,
        borderRadius: t.radii.lg,
        padding: t.spacing.lg,
        boxShadow: t.chunkyShadow,
        marginBottom: t.spacing.xl,
        opacity: bedtimeEnabled ? 1 : 0.45,
        pointerEvents: bedtimeEnabled ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }}>
        <div style={{
          fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: t.colors.textMuted, marginBottom: t.spacing.md,
        }}>
          Active Days
        </div>
        <div style={{ display: 'flex', gap: t.spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          {ALL_DAYS.map((day) => {
            const active = bedtimeDays.includes(day);
            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleDay(day)}
                style={{
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: t.fonts.display,
                  fontWeight: 800,
                  fontSize: '16px',
                  borderRadius: t.radii.sm,
                  border: t.chunkyBorder,
                  cursor: 'pointer',
                  background: active ? t.colors.accent : t.colors.surface,
                  color: active ? t.colors.white : t.colors.textMuted,
                  boxShadow: active ? t.chunkyShadowSm : 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Additional Settings */}
      <div style={{
        background: t.colors.surface,
        border: t.chunkyBorder,
        borderRadius: t.radii.lg,
        padding: t.spacing.lg,
        boxShadow: t.chunkyShadowSm,
      }}>
        <h3 style={{
          fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 700,
          margin: `0 0 ${t.spacing.md}`,
        }}>
          Preferences
        </h3>

        <SettingsRow label="Wind-down notification" sublabel="Get a gentle reminder 30 min before bedtime" defaultOn />
        <SettingsRow label="Do Not Disturb" sublabel="Automatically enable DND during bedtime hours" defaultOn={false} />
        <SettingsRow label="Screen dimming" sublabel="Reduce screen brightness as bedtime approaches" defaultOn />
        <SettingsRow label="Sleep sounds" sublabel="Play calming sounds when bedtime begins" defaultOn={false} />
      </div>

      {/* Summary Card */}
      <div style={{
        marginTop: t.spacing.xl,
        padding: t.spacing.lg,
        background: t.colors.surfaceAlt,
        border: t.chunkyBorder,
        borderRadius: t.radii.md,
        boxShadow: t.chunkyShadowSm,
        display: 'flex',
        alignItems: 'center',
        gap: t.spacing.lg,
      }}>
        <div style={{
          fontFamily: t.fonts.display, fontSize: '40px', fontWeight: 800,
          color: bedtimeEnabled ? t.colors.purple : t.colors.textMuted,
          minWidth: '100px', textAlign: 'center',
        }}>
          {bedtimeEnabled ? `${displayH}:${pad2(m)}` : '--:--'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            {bedtimeEnabled ? 'Bedtime reminder is set' : 'Bedtime reminder is off'}
          </div>
          <div style={{ fontSize: '14px', color: t.colors.textSecondary, marginTop: '4px' }}>
            {bedtimeEnabled
              ? `Active on ${bedtimeDays.length === 7 ? 'every day' : bedtimeDays.join(', ')}`
              : 'Enable the toggle above to set your schedule'}
          </div>
        </div>
        <div style={{
          fontSize: '14px', fontWeight: 700,
          color: bedtimeEnabled ? t.colors.teal : t.colors.textMuted,
          padding: '6px 14px',
          background: bedtimeEnabled ? t.colors.tealLight : t.colors.surfaceAlt,
          borderRadius: t.radii.full,
          border: `2px solid ${bedtimeEnabled ? t.colors.teal : t.colors.border}`,
        }}>
          {bedtimeEnabled ? 'Active' : 'Off'}
        </div>
      </div>
    </div>
  );
}

/* ---- Settings Row Sub-component ---- */
function SettingsRow({ label, sublabel, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${t.spacing.sm} 0`,
      borderBottom: `1px solid ${t.colors.borderLight}`,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '15px' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '13px', color: t.colors.textSecondary, marginTop: '2px' }}>{sublabel}</div>}
      </div>
      <ToggleSwitch checked={on} onChange={() => setOn(!on)} />
    </div>
  );
}

/* =============================================
   Shared UI Pieces
   ============================================= */

/* -- Toggle Switch -- */
function ToggleSwitch({ checked, onChange, large }) {
  const w = large ? 60 : 48;
  const h = large ? 32 : 26;
  const knob = large ? 26 : 20;
  const pad = 3;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(e); }}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${h}px`,
        background: checked ? t.colors.accent : t.colors.disabled,
        border: `2px solid ${checked ? t.colors.accentDark : t.colors.border}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? w - knob - pad * 2 - 4 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: `${pad}px`,
          left: `${pad}px`,
          width: `${knob}px`,
          height: `${knob}px`,
          borderRadius: '50%',
          background: t.colors.white,
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}
      />
    </div>
  );
}

/* -- Shared button styles -- */
const navBtnStyle = {
  background: t.colors.surface,
  border: t.chunkyBorder,
  borderRadius: t.radii.sm,
  padding: '10px 18px',
  fontFamily: t.fonts.display,
  fontWeight: 700,
  fontSize: '20px',
  cursor: 'pointer',
  color: t.colors.text,
  boxShadow: t.chunkyShadowSm,
};

const spinnerBtnStyle = {
  background: t.colors.surfaceAlt,
  border: `2px solid ${t.colors.border}`,
  borderRadius: t.radii.sm,
  width: '48px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '16px',
  color: t.colors.textSecondary,
  fontFamily: t.fonts.display,
  fontWeight: 700,
};

const ampmBtnBase = {
  padding: '8px 14px',
  borderRadius: t.radii.sm,
  fontFamily: t.fonts.display,
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
};
