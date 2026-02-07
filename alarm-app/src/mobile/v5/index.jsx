import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from './theme';
import { SCREENS, RINGTONES, ALARM_ACTIONS, PRIORITIES, ALARM_COLORS, GOOD_MORNING_ACTIONS } from '../../shared/useAlarmState';
import { getCloudStore } from '../../shared/cloudStore';

const fontLink = document.createElement('link');
fontLink.href = `https://fonts.googleapis.com/css2?family=${theme.googleFonts}&display=swap`;
fontLink.rel = 'stylesheet';
if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

const t = theme;
const popIn = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
  transition: { duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] },
};

const PROGRESSIVE_OPTIONS = [3, 5, 10, 15, 20, 30];

/* ───────── Shared Components ───────── */

function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 24px 8px',
      fontSize: '13px',
      fontFamily: t.fonts.body,
      fontWeight: 700,
      color: t.colors.text,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.teal }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.accent }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.yellow }} />
      </div>
    </div>
  );
}

function ChunkyButton({ children, onClick, variant = 'primary', color, style: extra = {}, ...props }) {
  const variants = {
    primary: {
      background: color || t.colors.accent,
      color: t.colors.white,
      border: `3px solid ${t.colors.text}`,
      fontWeight: 700,
      boxShadow: `4px 4px 0px ${t.colors.text}`,
    },
    secondary: {
      background: t.colors.surface,
      color: t.colors.text,
      border: `3px solid ${t.colors.text}`,
      fontWeight: 600,
      boxShadow: `4px 4px 0px ${t.colors.text}`,
    },
    ghost: {
      background: 'transparent',
      color: t.colors.textSecondary,
      border: 'none',
      fontWeight: 600,
      boxShadow: 'none',
    },
    danger: {
      background: '#FFE5E2',
      color: t.colors.accentDark,
      border: `3px solid ${t.colors.accentDark}`,
      fontWeight: 700,
      boxShadow: `4px 4px 0px ${t.colors.accentDark}`,
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97, boxShadow: `2px 2px 0px ${t.colors.text}`, y: 2, x: 2 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 24px',
        borderRadius: t.radii.sm,
        fontSize: '15px',
        fontFamily: t.fonts.display,
        cursor: 'pointer',
        minHeight: '52px',
        ...variants[variant],
        ...extra,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Badge({ children, color = t.colors.teal }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: t.radii.full,
      background: color,
      color: t.colors.white,
      fontFamily: t.fonts.body,
      fontSize: '11px',
      fontWeight: 700,
      border: `2px solid ${t.colors.text}`,
    }}>
      {children}
    </span>
  );
}

function Toggle({ enabled, onToggle, size = 'normal' }) {
  const w = size === 'small' ? 46 : 56;
  const h = size === 'small' ? 26 : 32;
  const knob = size === 'small' ? 18 : 22;
  const bw = size === 'small' ? 2 : 3;

  return (
    <div
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onToggle(e); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggle(e); } }}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: t.radii.full,
        background: enabled ? t.colors.teal : t.colors.disabled,
        border: `${bw}px solid ${t.colors.text}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: `${knob}px`,
        height: `${knob}px`,
        borderRadius: '50%',
        background: t.colors.white,
        border: `2px solid ${t.colors.text}`,
        position: 'absolute',
        top: `${(h - knob - bw * 2) / 2}px`,
        left: enabled ? `${w - knob - bw * 2 - (h - knob - bw * 2) / 2}px` : `${(h - knob - bw * 2) / 2}px`,
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <label style={{
      fontFamily: t.fonts.display,
      fontSize: '13px',
      fontWeight: 700,
      color: t.colors.text,
      display: 'block',
      marginBottom: '6px',
    }}>
      {children}
    </label>
  );
}

function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <>
      <StatusBar />
      <div style={{ padding: `0 ${t.spacing.lg}`, marginBottom: '16px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: t.colors.surfaceAlt,
              border: `2px solid ${t.colors.text}`,
              fontFamily: t.fonts.display,
              fontSize: '13px',
              fontWeight: 600,
              color: t.colors.text,
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: t.radii.sm,
              marginBottom: '12px',
            }}
          >
            ← Back
          </button>
        )}
        <h1 style={{
          fontFamily: t.fonts.display,
          fontSize: '24px',
          fontWeight: 800,
          color: t.colors.text,
          margin: '0 0 2px',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            color: t.colors.textSecondary,
            margin: 0,
            fontWeight: 500,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </>
  );
}

function FeatureCard({ icon, title, subtitle, color, onClick, enabled, onToggle }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: t.colors.surface,
        borderRadius: t.radii.md,
        padding: '16px',
        border: `3px solid ${t.colors.text}`,
        boxShadow: `4px 4px 0px ${t.colors.text}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '14px',
        background: color || t.colors.accent,
        border: `2px solid ${t.colors.text}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: t.fonts.display,
          fontSize: '15px',
          fontWeight: 700,
          color: t.colors.text,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          fontWeight: 500,
          color: t.colors.textSecondary,
          marginTop: '1px',
        }}>
          {subtitle}
        </div>
      </div>
      {onToggle !== undefined ? (
        <Toggle enabled={enabled} onToggle={(e) => { e.stopPropagation(); onToggle(); }} size="small" />
      ) : (
        <span style={{ fontFamily: t.fonts.display, fontSize: '16px', color: t.colors.textMuted }}>›</span>
      )}
    </motion.div>
  );
}

/* ───────── Bottom Tab Bar ───────── */

function BottomTabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'alarms', label: 'Alarms', icon: '⏰', color: t.colors.accent },
    { id: 'sleep', label: 'Sleep', icon: '🌙', color: t.colors.purple },
    { id: 'morning', label: 'Morning', icon: '☀️', color: t.colors.yellow },
    { id: 'tools', label: 'Tools', icon: '🛠️', color: t.colors.teal },
  ];

  return (
    <div style={{
      display: 'flex',
      borderTop: `3px solid ${t.colors.text}`,
      background: t.colors.surface,
      flexShrink: 0,
    }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 28px',
              background: active ? t.colors.surfaceAlt : 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {active && (
              <motion.div
                layoutId="tabIndicator"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '15%',
                  right: '15%',
                  height: '4px',
                  background: tab.color,
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}
            <span style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.icon}</span>
            <span style={{
              fontFamily: t.fonts.display,
              fontSize: '10px',
              fontWeight: active ? 800 : 600,
              color: active ? tab.color : t.colors.textMuted,
            }}>
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ───────── Home / Alarm List ───────── */

function HomeScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm } = state;

  return (
    <motion.div {...popIn} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-8px', right: '0',
            width: '50px', height: '50px', borderRadius: '50%',
            background: t.colors.yellow, border: `3px solid ${t.colors.text}`, opacity: 0.7,
          }} />
          <div style={{
            position: 'absolute', top: '15px', right: '35px',
            width: '30px', height: '30px', borderRadius: '6px',
            background: t.colors.teal, border: `3px solid ${t.colors.text}`, opacity: 0.5,
            transform: 'rotate(15deg)',
          }} />
          <h1 style={{
            fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800,
            color: t.colors.text, margin: '0 0 2px', position: 'relative',
          }}>
            Alarms!
          </h1>
          <p style={{
            fontFamily: t.fonts.body, fontSize: '14px',
            color: t.colors.textSecondary, margin: 0, fontWeight: 500,
          }}>
            Wake up on your terms
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, ease: [0.175, 0.885, 0.32, 1.275] }}
              onClick={() => editAlarm(alarm)}
              style={{
                background: t.colors.surface,
                borderRadius: t.radii.md,
                padding: '16px 18px',
                cursor: 'pointer',
                border: `3px solid ${t.colors.text}`,
                boxShadow: alarm.enabled ? `5px 5px 0px ${t.colors.text}` : 'none',
                opacity: alarm.enabled ? 1 : 0.5,
                transition: 'box-shadow 0.15s, opacity 0.15s',
                borderLeft: `6px solid ${alarm.color || t.colors.accent}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      fontFamily: t.fonts.display, fontSize: '26px', fontWeight: 800,
                      color: t.colors.text, lineHeight: 1.1,
                    }}>
                      {alarm.time}
                    </div>
                    {alarm.progressive && (
                      <span style={{
                        fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700,
                        color: t.colors.purple, background: '#F0EEFF',
                        padding: '2px 7px', borderRadius: t.radii.full,
                        border: `1.5px solid ${t.colors.purple}`,
                      }}>
                        FADE
                      </span>
                    )}
                    {alarm.priority === 'high' && (
                      <span style={{
                        fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700,
                        color: t.colors.accent, background: '#FFE5E2',
                        padding: '2px 7px', borderRadius: t.radii.full,
                        border: `1.5px solid ${t.colors.accent}`,
                      }}>
                        HIGH
                      </span>
                    )}
                    {alarm.priority === 'critical' && (
                      <span style={{
                        fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700,
                        color: '#fff', background: t.colors.accentDark,
                        padding: '2px 7px', borderRadius: t.radii.full,
                        border: `1.5px solid ${t.colors.accentDark}`,
                      }}>
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body, fontSize: '14px',
                    color: t.colors.textSecondary, marginTop: '4px', fontWeight: 600,
                  }}>
                    {alarm.label || 'Untitled alarm'}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {alarm.days.map(d => (
                      <Badge key={d} color={['Sat', 'Sun'].includes(d) ? t.colors.purple : t.colors.teal}>
                        {d}
                      </Badge>
                    ))}
                    {alarm.action && (
                      <Badge color={t.colors.yellow}>
                        {alarm.action.type === 'call' ? '📞' : alarm.action.type === 'task' ? '📋' : '📱'} Action
                      </Badge>
                    )}
                  </div>
                </div>
                <Toggle enabled={alarm.enabled} onToggle={() => toggleAlarm(alarm.id)} />
              </div>
            </motion.div>
          ))}
        </div>

        <ChunkyButton onClick={createNewAlarm} color={t.colors.accent}>
          + Create Alarm
        </ChunkyButton>
        <div style={{ height: '16px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Tab Header Component ───────── */

function TabHeader({ title, subtitle, decoColor, decoShape = 'circle' }) {
  return (
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: decoShape === 'circle' ? '-4px' : '-2px', right: '0',
        width: decoShape === 'circle' ? '40px' : '36px',
        height: decoShape === 'circle' ? '40px' : '36px',
        borderRadius: decoShape === 'circle' ? '50%' : decoShape === 'square' ? '10px' : '50% 50% 0 50%',
        background: decoColor,
        border: `3px solid ${t.colors.text}`,
        opacity: 0.6,
        transform: decoShape === 'square' ? 'rotate(12deg)' : decoShape === 'blob' ? 'rotate(-8deg)' : 'none',
      }} />
      <h1 style={{
        fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800,
        color: t.colors.text, margin: '0 0 2px', position: 'relative',
      }}>
        {title}
      </h1>
      <p style={{
        fontFamily: t.fonts.body, fontSize: '14px',
        color: t.colors.textSecondary, margin: 0, fontWeight: 500,
      }}>
        {subtitle}
      </p>
    </div>
  );
}

/* ───────── Sleep Tab ───────── */

function SleepTabScreen({ state }) {
  const {
    bedtimeEnabled, setBedtimeEnabled,
    navigate,
  } = state;

  return (
    <motion.div {...popIn} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <TabHeader title="Sleep" subtitle="Rest better, wake refreshed" decoColor={t.colors.purple} decoShape="circle" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FeatureCard
            icon="🌙"
            title="Bedtime Reminder"
            subtitle={bedtimeEnabled ? 'Active — tap to configure' : 'Off — tap to enable'}
            color="#1A1040"
            onClick={() => navigate(SCREENS.EXTRAS_BEDTIME)}
            enabled={bedtimeEnabled}
            onToggle={() => setBedtimeEnabled(!bedtimeEnabled)}
          />

          <FeatureCard
            icon="😴"
            title="Sleep Suggestions"
            subtitle="Smart bedtime recommendations"
            color={t.colors.purple}
            onClick={() => navigate(SCREENS.EXTRAS_SLEEP_SUGGEST)}
          />

          <FeatureCard
            icon="🔄"
            title="Sleep Cycle Calculator"
            subtitle="90-min cycle optimizer"
            color="#4DB6AC"
            onClick={() => navigate(SCREENS.EXTRAS_SLEEP_CALC)}
          />
        </div>

        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Morning Tab ───────── */

function MorningTabScreen({ state }) {
  const {
    briefingEnabled, setBriefingEnabled,
    goodMorningActions,
    navigate,
  } = state;

  const activeCount = goodMorningActions.length + (briefingEnabled ? 1 : 0);

  return (
    <motion.div {...popIn} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <TabHeader title="Morning" subtitle="Start the day right" decoColor={t.colors.yellow} decoShape="blob" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FeatureCard
            icon="☀️"
            title="Buenos Días"
            subtitle={activeCount > 0 ? `${activeCount} item${activeCount > 1 ? 's' : ''} configured` : 'Set up your wake-up screen'}
            color={t.colors.yellow}
            onClick={() => navigate(SCREENS.GOOD_MORNING_SETTINGS)}
          />

          <FeatureCard
            icon="🎙️"
            title="Morning Briefing"
            subtitle={briefingEnabled ? 'Active — agenda, weather & more' : 'Off — morning audio summary'}
            color={t.colors.purple}
            onClick={() => navigate(SCREENS.EXTRAS_BRIEFING)}
            enabled={briefingEnabled}
            onToggle={() => setBriefingEnabled(!briefingEnabled)}
          />

          <FeatureCard
            icon="💬"
            title="Motivational Library"
            subtitle="Browse & manage your post-its"
            color={t.colors.teal}
            onClick={() => navigate(SCREENS.EXTRAS_MOTIVATIONAL)}
          />
        </div>

        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Tools Tab ───────── */

function ToolsTabScreen({ state }) {
  const {
    focusModeEnabled, setFocusModeEnabled,
    smartSnoozeEnabled, setSmartSnoozeEnabled,
    navigate,
  } = state;

  return (
    <motion.div {...popIn} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <TabHeader title="Tools" subtitle="Smarter wake-up helpers" decoColor={t.colors.teal} decoShape="square" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <FeatureCard
            icon="🎯"
            title="Focus Mode"
            subtitle={focusModeEnabled ? 'Blocking distractions' : 'Off — block apps during sleep'}
            color={t.colors.accent}
            onClick={() => navigate(SCREENS.EXTRAS_FOCUS)}
            enabled={focusModeEnabled}
            onToggle={() => setFocusModeEnabled(!focusModeEnabled)}
          />

          <FeatureCard
            icon="📍"
            title="Smart Snooze (GPS)"
            subtitle={smartSnoozeEnabled ? 'Active — location-based snooze' : 'Off — geofence snooze'}
            color="#7986CB"
            onClick={() => navigate(SCREENS.EXTRAS_SMART_SNOOZE)}
            enabled={smartSnoozeEnabled}
            onToggle={() => setSmartSnoozeEnabled(!smartSnoozeEnabled)}
          />
        </div>

        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Legacy Extras Tab (kept for backwards compat) ───────── */

function ExtrasScreen({ state }) {
  return <SleepTabScreen state={state} />;
}

/* ───────── Extras: Bedtime Settings ───────── */

function ExtrasBedtimeScreen({ state }) {
  const {
    bedtimeEnabled, setBedtimeEnabled,
    bedtimeTime, setBedtimeTime,
    bedtimeDays, setBedtimeDays,
    openBedtimeReminder, goBack,
  } = state;

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const toggleBedtimeDay = (day) => {
    setBedtimeDays(bedtimeDays.includes(day) ? bedtimeDays.filter(d => d !== day) : [...bedtimeDays, day]);
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Bedtime Reminder" subtitle="Get notified when it's time to sleep" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{
          background: '#1A1040', borderRadius: t.radii.lg, padding: '20px',
          border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`, marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🌙</span>
              <div style={{ fontFamily: t.fonts.display, fontSize: '17px', fontWeight: 800, color: '#FFFBF5' }}>
                {bedtimeEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <Toggle enabled={bedtimeEnabled} onToggle={() => setBedtimeEnabled(!bedtimeEnabled)} size="small" />
          </div>

          {bedtimeEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bedtime
                </div>
                <div style={{ background: t.colors.purple, borderRadius: t.radii.md, padding: '14px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                  <input type="time" value={bedtimeTime} onChange={(e) => setBedtimeTime(e.target.value)} aria-label="Bedtime"
                    style={{ fontFamily: t.fonts.display, fontSize: '32px', fontWeight: 800, color: '#FFFBF5', background: 'none', border: 'none', textAlign: 'center', width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Remind on
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {allDays.map(day => {
                    const active = bedtimeDays.includes(day);
                    return (
                      <button key={day} onClick={() => toggleBedtimeDay(day)} aria-pressed={active}
                        style={{
                          flex: 1, height: '36px', borderRadius: '10px',
                          border: `2px solid ${active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
                          background: active ? t.colors.purple : 'rgba(255,255,255,0.06)',
                          color: active ? '#FFFBF5' : 'rgba(255,251,245,0.3)',
                          fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                        }}>
                        {day.substring(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={openBedtimeReminder}
                style={{
                  width: '100%', padding: '12px', borderRadius: t.radii.sm,
                  background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,251,245,0.7)', fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Preview Bedtime Reminder
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Focus Mode (M12) ───────── */

function ExtrasFocusScreen({ state }) {
  const {
    focusModeEnabled, setFocusModeEnabled,
    focusPermissionGranted, setFocusPermissionGranted,
    blockedApps, setBlockedApps, goBack,
  } = state;

  const allApps = ['Instagram', 'TikTok', 'Twitter/X', 'YouTube', 'Facebook', 'Snapchat', 'Reddit', 'Netflix'];
  const [showAddApp, setShowAddApp] = useState(false);

  const toggleApp = (app) => {
    setBlockedApps(blockedApps.includes(app) ? blockedApps.filter(a => a !== app) : [...blockedApps, app]);
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Focus Mode" subtitle="Block distracting apps during sleep hours" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        {!focusPermissionGranted ? (
          <div style={{
            background: t.colors.surface, borderRadius: t.radii.lg, padding: '24px', textAlign: 'center',
            border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: t.colors.text, marginBottom: '8px' }}>
              Permission Required
            </h3>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '20px', lineHeight: 1.5 }}>
              Focus Mode needs permission to manage app access during your sleep schedule.
            </p>
            <ChunkyButton onClick={() => setFocusPermissionGranted(true)} color={t.colors.teal}>
              Grant Permission
            </ChunkyButton>
          </div>
        ) : (
          <>
            <div style={{
              background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
              border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text }}>
                    Focus Mode
                  </div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textSecondary }}>
                    {focusModeEnabled ? `Blocking ${blockedApps.length} apps` : 'Currently off'}
                  </div>
                </div>
                <Toggle enabled={focusModeEnabled} onToggle={() => setFocusModeEnabled(!focusModeEnabled)} />
              </div>
            </div>

            <SectionLabel>Blocked Apps ({blockedApps.length})</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {allApps.map(app => {
                const blocked = blockedApps.includes(app);
                return (
                  <motion.div key={app} whileTap={{ scale: 0.98 }} onClick={() => toggleApp(app)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: t.radii.sm,
                      border: `2px solid ${blocked ? t.colors.accent : t.colors.border}`,
                      background: blocked ? '#FFF5F3' : t.colors.surface, cursor: 'pointer',
                    }}>
                    <span style={{ fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text }}>
                      {app}
                    </span>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: blocked ? t.colors.accent : t.colors.disabled,
                      border: `2px solid ${t.colors.text}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px', fontWeight: 800,
                    }}>
                      {blocked ? '✕' : ''}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Motivational Library (M6) ───────── */

function ExtrasMotivationalScreen({ state }) {
  const { goBack } = state;
  const [postIts, setPostIts] = useState(() => getCloudStore().postIts);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const colors = [t.colors.accent, t.colors.teal, t.colors.purple, t.colors.yellow, '#FF8A65', '#4DB6AC'];

  const addPostIt = () => {
    if (!newText.trim()) return;
    const newItem = { id: 'p' + Date.now(), text: newText, color: colors[Math.floor(Math.random() * colors.length)], tags: ['custom'], createdAt: new Date().toISOString() };
    const updated = [...postIts, newItem];
    setPostIts(updated);
    setNewText('');
    setShowAdd(false);
    // Sync to cloud store
    const store = getCloudStore();
    store.postIts = updated;
    localStorage.setItem('alarm-app-cloud', JSON.stringify(store));
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Motivational Library" subtitle="Post-its to brighten your mornings" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        {postIts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textMuted }}>No post-its yet. Add one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {postIts.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{
                  background: p.color + '20', borderRadius: t.radii.md, padding: '16px',
                  border: `2px solid ${p.color}`, borderLeft: `5px solid ${p.color}`,
                }}>
                <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text, lineHeight: 1.5 }}>
                  {p.text}
                </div>
                {p.tags && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {p.tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: t.fonts.display, fontSize: '10px', fontWeight: 700,
                        color: p.color, background: p.color + '15', padding: '2px 8px',
                        borderRadius: t.radii.full, border: `1px solid ${p.color}40`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {showAdd ? (
          <div style={{
            background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
            border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
          }}>
            <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Write something motivational..."
              rows={3} style={{
                width: '100%', padding: '12px', borderRadius: t.radii.sm,
                border: `2px solid ${t.colors.border}`, fontFamily: t.fonts.body,
                fontSize: '14px', resize: 'none', boxSizing: 'border-box', marginBottom: '10px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <ChunkyButton onClick={addPostIt} color={t.colors.teal} style={{ flex: 1, padding: '10px' }}>Save</ChunkyButton>
              <ChunkyButton variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px' }}>Cancel</ChunkyButton>
            </div>
          </div>
        ) : (
          <ChunkyButton onClick={() => setShowAdd(true)} color={t.colors.teal}>
            + Add Post-it
          </ChunkyButton>
        )}
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Morning Briefing (M13) ───────── */

function ExtrasBriefingScreen({ state }) {
  const { briefingEnabled, setBriefingEnabled, briefingSources, setBriefingSources, goBack } = state;
  const [showPreview, setShowPreview] = useState(false);

  const sources = [
    { key: 'agenda', label: 'Today\'s Agenda', icon: '📅', preview: '9:00 AM — Team standup\n10:30 AM — Design review\n2:00 PM — Client call' },
    { key: 'weather', label: 'Weather', icon: '🌤️', preview: 'Partly cloudy, 72°F. Low chance of rain.' },
    { key: 'traffic', label: 'Traffic', icon: '🚗', preview: 'Normal commute — 25 min to office.' },
    { key: 'news', label: 'Headlines', icon: '📰', preview: 'Tech stocks rally. New space mission launches Friday.' },
  ];

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Morning Briefing" subtitle="Wake up informed with an audio summary" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{
          background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
          border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text }}>
              Enable Briefing
            </div>
            <Toggle enabled={briefingEnabled} onToggle={() => setBriefingEnabled(!briefingEnabled)} />
          </div>
        </div>

        <SectionLabel>Content Sources</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {sources.map(src => (
            <div key={src.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderRadius: t.radii.sm,
              border: `2px solid ${briefingSources[src.key] ? t.colors.teal : t.colors.border}`,
              background: briefingSources[src.key] ? t.colors.surfaceAlt : t.colors.surface,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{src.icon}</span>
                <span style={{ fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text }}>
                  {src.label}
                </span>
              </div>
              <Toggle enabled={briefingSources[src.key]} onToggle={() => setBriefingSources({ ...briefingSources, [src.key]: !briefingSources[src.key] })} size="small" />
            </div>
          ))}
        </div>

        <ChunkyButton variant="secondary" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Hide Preview' : 'Preview Briefing'}
        </ChunkyButton>

        {showPreview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '16px', background: '#1A1040', borderRadius: t.radii.lg, padding: '20px', border: `3px solid ${t.colors.text}` }}>
            <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 800, color: '#FFFBF5', marginBottom: '12px' }}>
              🎙️ Good morning! Here's your briefing:
            </div>
            {sources.filter(s => briefingSources[s.key]).map(src => (
              <div key={src.key} style={{ marginBottom: '12px' }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.teal, marginBottom: '4px' }}>
                  {src.icon} {src.label}
                </div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: 'rgba(255,251,245,0.7)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {src.preview}
                </div>
              </div>
            ))}
            {sources.filter(s => briefingSources[s.key]).length === 0 && (
              <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: 'rgba(255,251,245,0.5)' }}>
                No sources enabled. Toggle some above!
              </div>
            )}
          </motion.div>
        )}
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Sleep Suggestions (M4) ───────── */

function ExtrasSleepSuggestScreen({ state }) {
  const { goBack, bedtimeTime } = state;
  const [wakeGoal, setWakeGoal] = useState('06:30');

  // Mock insights
  const mockHabits = {
    avgBedtime: '23:15',
    avgWakeTime: '06:45',
    avgSleep: '7h 30m',
    consistency: '72%',
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Sleep Suggestions" subtitle="Smart bedtime recommendations based on your habits" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{
          background: '#1A1040', borderRadius: t.radii.lg, padding: '20px',
          border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`, marginBottom: '16px',
        }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 800, color: '#FFFBF5', marginBottom: '14px' }}>
            Your Sleep Habits
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Avg Bedtime', value: mockHabits.avgBedtime, color: t.colors.purple },
              { label: 'Avg Wake', value: mockHabits.avgWakeTime, color: t.colors.teal },
              { label: 'Avg Sleep', value: mockHabits.avgSleep, color: t.colors.yellow },
              { label: 'Consistency', value: mockHabits.consistency, color: t.colors.accent },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: t.radii.sm, padding: '12px', textAlign: 'center',
                border: '2px solid rgba(255,255,255,0.12)',
              }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 600, color: 'rgba(255,251,245,0.5)', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
          border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
        }}>
          <SectionLabel>Your wake goal</SectionLabel>
          <div style={{ background: t.colors.yellow, borderRadius: t.radii.md, padding: '12px', textAlign: 'center', border: `2px solid ${t.colors.text}`, marginBottom: '14px' }}>
            <input type="time" value={wakeGoal} onChange={(e) => setWakeGoal(e.target.value)} aria-label="Wake goal"
              style={{ fontFamily: t.fonts.display, fontSize: '28px', fontWeight: 800, color: t.colors.text, background: 'none', border: 'none', textAlign: 'center', width: '100%' }}
            />
          </div>
          <div style={{
            background: t.colors.teal + '15', borderRadius: t.radii.sm, padding: '14px',
            border: `2px solid ${t.colors.teal}`,
          }}>
            <div style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: t.colors.teal, marginBottom: '4px' }}>
              Recommendation
            </div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 600, color: t.colors.text, lineHeight: 1.5 }}>
              Based on your habits, we suggest going to bed by <strong>22:30</strong> for 8 hours of sleep, or <strong>23:00</strong> for 7.5 hours.
            </div>
          </div>
        </div>
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Sleep Cycle Calculator (M7) ───────── */

function ExtrasSleepCalcScreen({ state }) {
  const { goBack } = state;
  const [mode, setMode] = useState('bedtime'); // 'bedtime' or 'wake'
  const [inputTime, setInputTime] = useState('06:30');

  const calcCycles = () => {
    const [h, m] = inputTime.split(':').map(Number);
    const results = [];
    for (let cycles = 3; cycles <= 6; cycles++) {
      const totalMin = cycles * 90 + 15; // 15 min to fall asleep
      const date = new Date(2026, 0, 1, h, m);
      if (mode === 'wake') {
        date.setMinutes(date.getMinutes() - totalMin);
      } else {
        date.setMinutes(date.getMinutes() + totalMin);
      }
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      results.push({ cycles, time: `${hh}:${mm}`, hours: ((cycles * 90) / 60).toFixed(1) });
    }
    return results;
  };

  const results = calcCycles();
  const cycleColors = [t.colors.textMuted, t.colors.yellow, t.colors.teal, t.colors.accent];

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Sleep Cycle Calculator" subtitle="Optimize wake times with 90-min cycles" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['bedtime', 'wake'].map(m => (
            <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '12px', borderRadius: t.radii.sm,
                border: `3px solid ${t.colors.text}`,
                background: mode === m ? t.colors.purple : t.colors.surface,
                color: mode === m ? '#fff' : t.colors.text,
                fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                boxShadow: mode === m ? `3px 3px 0px ${t.colors.text}` : 'none',
              }}>
              {m === 'bedtime' ? 'I go to bed at...' : 'I want to wake at...'}
            </motion.button>
          ))}
        </div>

        <div style={{ background: t.colors.yellow, borderRadius: t.radii.lg, padding: '16px', textAlign: 'center', border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`, marginBottom: '20px' }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.text, marginBottom: '4px', textTransform: 'uppercase' }}>
            {mode === 'bedtime' ? 'Bedtime' : 'Wake time'}
          </div>
          <input type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)}
            style={{ fontFamily: t.fonts.display, fontSize: '36px', fontWeight: 800, color: t.colors.text, background: 'none', border: 'none', textAlign: 'center', width: '100%' }}
          />
        </div>

        <SectionLabel>{mode === 'bedtime' ? 'Suggested wake times' : 'Suggested bedtimes'}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {results.map((r, i) => (
            <motion.div key={r.cycles}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: t.radii.md,
                border: `3px solid ${i >= 2 ? t.colors.text : t.colors.border}`,
                background: i >= 2 ? t.colors.surface : t.colors.surfaceAlt,
                boxShadow: i >= 2 ? `3px 3px 0px ${t.colors.text}` : 'none',
              }}>
              <div>
                <div style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: t.colors.text }}>{r.time}</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textSecondary }}>
                  {r.cycles} cycles — {r.hours}h sleep
                </div>
              </div>
              <Badge color={cycleColors[i]}>{r.cycles >= 5 ? 'Ideal' : r.cycles >= 4 ? 'Good' : 'Short'}</Badge>
            </motion.div>
          ))}
        </div>

        <div style={{
          background: t.colors.surfaceAlt, borderRadius: t.radii.sm, padding: '12px',
          border: `2px solid ${t.colors.border}`,
        }}>
          <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textSecondary, lineHeight: 1.5 }}>
            Each sleep cycle is ~90 minutes. We add 15 min to fall asleep. 5-6 cycles (7.5-9h) is recommended for adults.
          </div>
        </div>
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Extras: Smart Snooze GPS (M9) ───────── */

function ExtrasSmartSnoozeScreen({ state }) {
  const {
    smartSnoozeEnabled, setSmartSnoozeEnabled,
    gpsPermissionGranted, setGpsPermissionGranted,
    smartSnoozeLocation, setSmartSnoozeLocation, goBack,
  } = state;

  const presetLocations = [
    { name: 'Home', lat: 40.7128, lng: -74.006 },
    { name: 'Office', lat: 40.7580, lng: -73.9855 },
    { name: 'Gym', lat: 40.7484, lng: -73.9857 },
  ];

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Smart Snooze (GPS)" subtitle="Location-based snooze with geofencing" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        {!gpsPermissionGranted ? (
          <div style={{
            background: t.colors.surface, borderRadius: t.radii.lg, padding: '24px', textAlign: 'center',
            border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`,
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <h3 style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 800, color: t.colors.text, marginBottom: '8px' }}>
              Location Permission Required
            </h3>
            <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '20px', lineHeight: 1.5 }}>
              Smart Snooze uses your location to automatically snooze alarms when you arrive at a set destination.
            </p>
            <ChunkyButton onClick={() => setGpsPermissionGranted(true)} color={t.colors.teal}>
              Allow Location Access
            </ChunkyButton>
          </div>
        ) : (
          <>
            <div style={{
              background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
              border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: t.fonts.display, fontSize: '16px', fontWeight: 700, color: t.colors.text }}>
                    Smart Snooze
                  </div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textSecondary }}>
                    Snooze until arriving at {smartSnoozeLocation.name}
                  </div>
                </div>
                <Toggle enabled={smartSnoozeEnabled} onToggle={() => setSmartSnoozeEnabled(!smartSnoozeEnabled)} />
              </div>
            </div>

            <SectionLabel>Snooze destination</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {presetLocations.map(loc => (
                <motion.div key={loc.name} whileTap={{ scale: 0.98 }} onClick={() => setSmartSnoozeLocation(loc)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: t.radii.sm,
                    border: `3px solid ${smartSnoozeLocation.name === loc.name ? t.colors.text : t.colors.border}`,
                    background: smartSnoozeLocation.name === loc.name ? t.colors.surfaceAlt : t.colors.surface,
                    boxShadow: smartSnoozeLocation.name === loc.name ? `3px 3px 0px ${t.colors.text}` : 'none',
                    cursor: 'pointer',
                  }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: smartSnoozeLocation.name === loc.name ? t.colors.teal : t.colors.disabled,
                    border: `2px solid ${t.colors.text}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px',
                  }}>
                    📍
                  </div>
                  <div>
                    <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>{loc.name}</div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '11px', color: t.colors.textMuted }}>
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </div>
                  </div>
                  {smartSnoozeLocation.name === loc.name && (
                    <span style={{ marginLeft: 'auto', fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 800, color: t.colors.teal }}>✓</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Mock map */}
            <div style={{
              height: '140px', background: t.colors.surfaceAlt, borderRadius: t.radii.md,
              border: `3px solid ${t.colors.text}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '16px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🗺️</div>
                <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>
                  Geofence: {smartSnoozeLocation.name} (200m radius)
                </div>
              </div>
            </div>
          </>
        )}
        <div style={{ height: '20px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Create / Edit Alarm (enhanced) ───────── */

function CreateEditScreen({ state }) {
  const { editingAlarm, updateEditingAlarm, saveAlarm, openPurposeEditor, goHome, deleteAlarm, simulateAlarm } = state;
  if (!editingAlarm) return null;

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [showRingtonePicker, setShowRingtonePicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleDay = (day) => {
    const days = editingAlarm.days.includes(day)
      ? editingAlarm.days.filter(d => d !== day)
      : [...editingAlarm.days, day];
    updateEditingAlarm({ days });
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={goHome}
            style={{
              background: t.colors.surfaceAlt, border: `2px solid ${t.colors.text}`,
              fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 600,
              color: t.colors.text, cursor: 'pointer', padding: '6px 14px', borderRadius: t.radii.sm,
            }}>
            ← Back
          </button>
          <button onClick={saveAlarm}
            style={{
              background: t.colors.teal, border: `2px solid ${t.colors.text}`,
              fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700,
              color: t.colors.white, cursor: 'pointer', padding: '6px 18px', borderRadius: t.radii.sm,
              boxShadow: `3px 3px 0px ${t.colors.text}`,
            }}>
            Save ✓
          </button>
        </div>

        {/* Time */}
        <div style={{
          background: t.colors.yellow, borderRadius: t.radii.lg, padding: '24px', textAlign: 'center',
          marginBottom: '16px', border: `3px solid ${t.colors.text}`, boxShadow: `6px 6px 0px ${t.colors.text}`,
        }}>
          <input type="time" value={editingAlarm.time} onChange={(e) => updateEditingAlarm({ time: e.target.value })} aria-label="Alarm time"
            style={{
              fontFamily: t.fonts.display, fontSize: '44px', fontWeight: 800,
              color: t.colors.text, background: 'none', border: 'none', textAlign: 'center', width: '100%',
            }}
          />
        </div>

        {/* Label */}
        <div style={{ marginBottom: '14px' }}>
          <SectionLabel>Label</SectionLabel>
          <input type="text" value={editingAlarm.label} onChange={(e) => updateEditingAlarm({ label: e.target.value })}
            placeholder="What's it for?"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: t.radii.sm,
              border: `3px solid ${t.colors.text}`, background: t.colors.surface,
              fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text, boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Purpose (M1) */}
        <div style={{ marginBottom: '14px' }}>
          <SectionLabel>Purpose</SectionLabel>
          <motion.div whileTap={{ scale: 0.98 }} onClick={openPurposeEditor}
            style={{
              padding: '12px 16px', borderRadius: t.radii.sm, border: `3px dashed ${t.colors.accent}`,
              background: '#FFF5F3', cursor: 'pointer', fontFamily: t.fonts.body, fontSize: '14px',
              fontWeight: 500, color: editingAlarm.purpose ? t.colors.text : t.colors.textMuted, lineHeight: 1.4,
            }}>
            {editingAlarm.purpose || 'Tap to set your wake-up purpose!'}
          </motion.div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Days</SectionLabel>
          <div style={{ display: 'flex', gap: '5px' }}>
            {allDays.map(day => {
              const active = editingAlarm.days.includes(day);
              const isWeekend = ['Sat', 'Sun'].includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)} aria-pressed={active}
                  style={{
                    flex: 1, height: '42px', borderRadius: t.radii.sm,
                    border: `2px solid ${t.colors.text}`,
                    background: active ? (isWeekend ? t.colors.purple : t.colors.teal) : t.colors.surface,
                    color: active ? t.colors.white : t.colors.textMuted,
                    fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: active ? `2px 2px 0px ${t.colors.text}` : 'none',
                  }}>
                  {day.substring(0, 2)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ringtone Selector */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Ringtone</SectionLabel>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowRingtonePicker(!showRingtonePicker)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: t.radii.sm,
              border: `3px solid ${t.colors.text}`, background: t.colors.surface, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: t.colors.accent, border: `2px solid ${t.colors.text}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
              }}>🔔</span>
              <span style={{ fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text }}>
                {editingAlarm.ringtone || 'Sunrise Chime'}
              </span>
            </div>
            <span style={{
              fontFamily: t.fonts.display, fontSize: '14px', color: t.colors.textMuted,
              transform: showRingtonePicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s',
            }}>▾</span>
          </motion.button>
          <AnimatePresence>
            {showRingtonePicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: '6px', borderRadius: t.radii.sm, border: `2px solid ${t.colors.border}`, background: t.colors.surface, overflow: 'hidden' }}>
                  {RINGTONES.map((tone, i) => {
                    const selected = (editingAlarm.ringtone || 'Sunrise Chime') === tone;
                    const iconColors = [t.colors.accent, t.colors.teal, t.colors.purple, t.colors.yellow, t.colors.accentLight, t.colors.tealDark, t.colors.purple];
                    return (
                      <motion.button key={tone} whileTap={{ scale: 0.98 }}
                        onClick={() => { updateEditingAlarm({ ringtone: tone }); setShowRingtonePicker(false); }}
                        style={{
                          width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                          background: selected ? t.colors.surfaceAlt : 'transparent', border: 'none',
                          borderBottom: i < RINGTONES.length - 1 ? `1px solid ${t.colors.border}` : 'none',
                          cursor: 'pointer', textAlign: 'left',
                        }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: iconColors[i % iconColors.length],
                          border: selected ? `2px solid ${t.colors.text}` : `2px solid ${t.colors.border}`, flexShrink: 0,
                        }} />
                        <span style={{ fontFamily: t.fonts.body, fontSize: '14px', fontWeight: selected ? 700 : 500, color: selected ? t.colors.text : t.colors.textSecondary }}>
                          {tone}
                        </span>
                        {selected && <span style={{ marginLeft: 'auto', fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 800, color: t.colors.teal }}>✓</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progressive Alarm */}
        <div style={{
          marginBottom: '16px', background: t.colors.surface, borderRadius: t.radii.md,
          border: `3px solid ${editingAlarm.progressive ? t.colors.purple : t.colors.border}`,
          padding: '16px', boxShadow: editingAlarm.progressive ? `3px 3px 0px ${t.colors.text}` : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700, color: t.colors.text }}>Progressive Alarm</div>
              <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textSecondary, marginTop: '2px' }}>Sound fades in gradually</div>
            </div>
            <Toggle enabled={editingAlarm.progressive} onToggle={() => updateEditingAlarm({ progressive: !editingAlarm.progressive })} size="small" />
          </div>
          <AnimatePresence>
            {editingAlarm.progressive && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `2px dashed ${t.colors.border}` }}>
                  <div style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.textSecondary, marginBottom: '8px' }}>
                    Start fade-in before alarm
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PROGRESSIVE_OPTIONS.map((mins) => {
                      const selected = editingAlarm.progressiveMinutesBefore === mins;
                      return (
                        <motion.button key={mins} whileTap={{ scale: 0.93 }} onClick={() => updateEditingAlarm({ progressiveMinutesBefore: mins })}
                          style={{
                            padding: '8px 14px', borderRadius: t.radii.sm,
                            border: `2px solid ${selected ? t.colors.text : t.colors.border}`,
                            background: selected ? t.colors.purple : t.colors.surface,
                            color: selected ? t.colors.white : t.colors.textSecondary,
                            fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                            boxShadow: selected ? `2px 2px 0px ${t.colors.text}` : 'none',
                          }}>
                          {mins}m
                        </motion.button>
                      );
                    })}
                  </div>
                  <div style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 500, color: t.colors.textMuted, marginTop: '8px' }}>
                    Sound starts {editingAlarm.progressiveMinutesBefore} min before {editingAlarm.time}, reaching full volume at alarm time.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Settings Toggle (M2 extended: priority, color, action, long swipe) */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: t.radii.sm,
            border: `2px solid ${t.colors.border}`, background: t.colors.surfaceAlt,
            fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: t.colors.text,
            cursor: 'pointer', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
          <span>Advanced Settings</span>
          <span style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              {/* Priority */}
              <div style={{ marginBottom: '14px' }}>
                <SectionLabel>Priority</SectionLabel>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {PRIORITIES.map(p => (
                    <motion.button key={p.value} whileTap={{ scale: 0.93 }} onClick={() => updateEditingAlarm({ priority: p.value })}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: t.radii.sm,
                        border: `2px solid ${editingAlarm.priority === p.value ? t.colors.text : t.colors.border}`,
                        background: editingAlarm.priority === p.value ? p.color + '25' : t.colors.surface,
                        fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700,
                        color: editingAlarm.priority === p.value ? p.color : t.colors.textMuted,
                        cursor: 'pointer', boxShadow: editingAlarm.priority === p.value ? `2px 2px 0px ${t.colors.text}` : 'none',
                      }}>
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div style={{ marginBottom: '14px' }}>
                <SectionLabel>Color</SectionLabel>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ALARM_COLORS.map(c => (
                    <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => updateEditingAlarm({ color: c })}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px', background: c,
                        border: editingAlarm.color === c ? `3px solid ${t.colors.text}` : `2px solid ${t.colors.border}`,
                        cursor: 'pointer', boxShadow: editingAlarm.color === c ? `2px 2px 0px ${t.colors.text}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '14px', fontWeight: 800,
                      }}>
                      {editingAlarm.color === c ? '✓' : ''}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Alarm Action (M3) */}
              <div style={{ marginBottom: '14px' }}>
                <SectionLabel>Alarm Action (M3)</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <motion.button whileTap={{ scale: 0.98 }}
                    onClick={() => updateEditingAlarm({ action: null })}
                    style={{
                      padding: '10px 14px', borderRadius: t.radii.sm, textAlign: 'left',
                      border: `2px solid ${!editingAlarm.action ? t.colors.text : t.colors.border}`,
                      background: !editingAlarm.action ? t.colors.surfaceAlt : t.colors.surface,
                      fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text, cursor: 'pointer',
                    }}>
                    None
                  </motion.button>
                  {ALARM_ACTIONS.map(act => (
                    <motion.button key={act.type} whileTap={{ scale: 0.98 }}
                      onClick={() => updateEditingAlarm({ action: { type: act.type, label: act.label } })}
                      style={{
                        padding: '10px 14px', borderRadius: t.radii.sm, display: 'flex', alignItems: 'center', gap: '10px',
                        border: `2px solid ${editingAlarm.action?.type === act.type ? t.colors.text : t.colors.border}`,
                        background: editingAlarm.action?.type === act.type ? t.colors.surfaceAlt : t.colors.surface,
                        fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text, cursor: 'pointer',
                        boxShadow: editingAlarm.action?.type === act.type ? `2px 2px 0px ${t.colors.text}` : 'none',
                      }}>
                      <span>{act.icon}</span>
                      <span>{act.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Long Swipe Validation (M10) */}
              <div style={{
                marginBottom: '14px', background: t.colors.surface, borderRadius: t.radii.md,
                border: `2px solid ${editingAlarm.longSwipeEnabled ? t.colors.accent : t.colors.border}`, padding: '14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700, color: t.colors.text }}>Long Swipe to Snooze</div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: t.colors.textSecondary }}>Require hold gesture to confirm</div>
                  </div>
                  <Toggle enabled={editingAlarm.longSwipeEnabled} onToggle={() => updateEditingAlarm({ longSwipeEnabled: !editingAlarm.longSwipeEnabled })} size="small" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulate / Try it out */}
        <div style={{ marginBottom: '12px' }}>
          <ChunkyButton variant="secondary" onClick={() => simulateAlarm(editingAlarm)}
            style={{ background: t.colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>▶</span> Simulate Alarm
          </ChunkyButton>
        </div>

        {editingAlarm.label && (
          <ChunkyButton variant="danger" onClick={() => { deleteAlarm(editingAlarm.id); goHome(); }} style={{ marginBottom: '20px' }}>
            Delete
          </ChunkyButton>
        )}
        <div style={{ height: '16px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Purpose Editor ───────── */

function PurposeEditorScreen({ state }) {
  const { editingAlarm, savePurpose, goBack, PURPOSE_TEMPLATES } = state;

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={goBack}
            style={{
              background: t.colors.surfaceAlt, border: `2px solid ${t.colors.text}`,
              fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 600,
              color: t.colors.text, cursor: 'pointer', padding: '6px 14px', borderRadius: t.radii.sm,
            }}>
            ← Back
          </button>
        </div>
        <h2 style={{ fontFamily: t.fonts.display, fontSize: '22px', fontWeight: 800, color: t.colors.text, marginBottom: '4px' }}>Set Purpose</h2>
        <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '16px', fontWeight: 500 }}>
          What will morning-you need to hear?
        </p>
        <textarea value={editingAlarm?.purpose || ''} onChange={(e) => savePurpose(e.target.value)} placeholder="Type your own purpose..." rows={3}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: t.radii.sm, border: `3px solid ${t.colors.text}`,
            background: t.colors.surface, fontFamily: t.fonts.body, fontSize: '14px', fontWeight: 500,
            color: t.colors.text, resize: 'none', marginBottom: '16px', boxSizing: 'border-box', lineHeight: 1.5,
          }}
        />
        <div style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.text, marginBottom: '10px' }}>Quick picks:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PURPOSE_TEMPLATES.map((tmpl, i) => {
            const colors = [t.colors.accent, t.colors.teal, t.colors.purple, t.colors.yellow, t.colors.accentLight, t.colors.tealDark, t.colors.purple, t.colors.accent];
            return (
              <motion.button key={tmpl.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, ease: [0.175, 0.885, 0.32, 1.275] }}
                whileTap={{ scale: 0.98 }} onClick={() => savePurpose(tmpl.text)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: t.radii.sm,
                  border: `2px solid ${editingAlarm?.purpose === tmpl.text ? t.colors.text : t.colors.border}`,
                  background: editingAlarm?.purpose === tmpl.text ? t.colors.surfaceAlt : t.colors.surface,
                  cursor: 'pointer', textAlign: 'left', fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 500,
                  color: t.colors.text, lineHeight: 1.4,
                  boxShadow: editingAlarm?.purpose === tmpl.text ? `3px 3px 0px ${t.colors.text}` : 'none',
                }}>
                <span style={{
                  fontSize: '18px', flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px',
                  background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${t.colors.text}`,
                }}>{tmpl.emoji}</span>
                <span>{tmpl.text}</span>
              </motion.button>
            );
          })}
        </div>
        <div style={{ height: '16px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Alarm Ringing (enhanced with M3 action + M10 long swipe + M11 fade) ───────── */

function AlarmRingingScreen({ state }) {
  const { ringingAlarm, fadeProgress, dismissAlarm, snoozeAlarm } = state;
  if (!ringingAlarm) return null;

  const isProgressive = ringingAlarm.progressive;
  const hasAction = !!ringingAlarm.action;
  const hasLongSwipe = ringingAlarm.longSwipeEnabled;
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeHolding, setSwipeHolding] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState(false);

  // Long swipe hold handler
  useEffect(() => {
    if (!swipeHolding) { setSwipeProgress(0); return; }
    const interval = setInterval(() => {
      setSwipeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          snoozeAlarm();
          return 100;
        }
        return prev + 4;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [swipeHolding, snoozeAlarm]);

  return (
    <motion.div {...popIn} style={{
      height: '100%', background: t.colors.accent,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }} />
      <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
        style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.15)' }} />

      {isProgressive && (
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: t.radii.full, padding: '4px 14px', marginBottom: '8px', border: '2px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>PROGRESSIVE</span>
        </div>
      )}

      {/* Fade indicator (M11) */}
      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: t.radii.full, padding: '6px 16px', marginBottom: '24px', border: '2px solid rgba(255,255,255,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '80px', height: '8px', borderRadius: t.radii.full, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${fadeProgress}%` }} style={{ height: '100%', background: t.colors.white, borderRadius: t.radii.full }} />
          </div>
          <span style={{ fontFamily: t.fonts.display, fontSize: '12px', fontWeight: 700, color: t.colors.white }}>{fadeProgress}%</span>
        </div>
      </div>

      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        style={{ fontFamily: t.fonts.display, fontSize: '60px', fontWeight: 800, color: t.colors.white, lineHeight: 1, marginBottom: '6px', textShadow: '3px 3px 0px rgba(0,0,0,0.15)' }}>
        {ringingAlarm.time}
      </motion.div>

      <div style={{ fontFamily: t.fonts.body, fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '4px' }}>
        {ringingAlarm.label || 'Alarm'}
      </div>
      <div style={{ fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
        {ringingAlarm.ringtone || 'Sunrise Chime'}
      </div>

      {/* Purpose (M1) */}
      {ringingAlarm.purpose && (
        <div style={{
          background: t.colors.white, borderRadius: t.radii.md, padding: '18px 22px',
          marginBottom: '20px', maxWidth: '260px', border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`,
        }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: t.colors.accent, marginBottom: '6px' }}>YOUR PURPOSE</div>
          <div style={{ fontFamily: t.fonts.body, fontSize: '15px', fontWeight: 600, color: t.colors.text, lineHeight: 1.4 }}>{ringingAlarm.purpose}</div>
        </div>
      )}

      {/* Action button (M3) */}
      {hasAction && !actionConfirmed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: t.radii.md, padding: '12px 20px',
            marginBottom: '16px', border: '2px solid rgba(255,255,255,0.25)', maxWidth: '260px', width: '100%',
          }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            ALARM ACTION
          </div>
          <ChunkyButton onClick={() => setActionConfirmed(true)} color={t.colors.yellow}
            style={{ border: '2px solid rgba(255,255,255,0.3)', fontSize: '14px', padding: '10px' }}>
            {ringingAlarm.action.type === 'call' ? '📞' : '📋'} {ringingAlarm.action.label}
          </ChunkyButton>
        </motion.div>
      )}

      {actionConfirmed && (
        <div style={{
          background: t.colors.teal, borderRadius: t.radii.sm, padding: '10px 16px',
          marginBottom: '16px', border: '2px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: '13px', fontWeight: 700, color: '#fff' }}>
            ✓ Action confirmed!
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '240px' }}>
        <ChunkyButton onClick={dismissAlarm} color={t.colors.teal}>I'm Up!</ChunkyButton>

        {/* Long swipe snooze (M10) or regular snooze */}
        {hasLongSwipe ? (
          <div style={{ position: 'relative' }}>
            <motion.button
              onPointerDown={() => setSwipeHolding(true)}
              onPointerUp={() => setSwipeHolding(false)}
              onPointerLeave={() => setSwipeHolding(false)}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: t.radii.sm, fontSize: '15px',
                fontFamily: t.fonts.display, cursor: 'pointer', minHeight: '52px',
                background: 'rgba(255,255,255,0.95)', color: t.colors.text,
                border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, fontWeight: 700,
                position: 'relative', overflow: 'hidden',
              }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%',
                width: `${swipeProgress}%`, background: t.colors.purple + '30',
                borderRadius: t.radii.sm, transition: 'width 0.05s linear',
              }} />
              <span style={{ position: 'relative' }}>
                {swipeProgress > 0 ? `Hold... ${Math.round(swipeProgress)}%` : 'Hold to Snooze'}
              </span>
            </motion.button>
          </div>
        ) : (
          <ChunkyButton variant="secondary" onClick={snoozeAlarm} style={{ background: 'rgba(255,255,255,0.95)' }}>Snooze</ChunkyButton>
        )}
      </div>
    </motion.div>
  );
}

/* ───────── Snooze Picker ───────── */

function SnoozePickerScreen({ state }) {
  const { confirmSnooze, goBack, SNOOZE_OPTIONS } = state;

  return (
    <motion.div {...popIn} style={{
      height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 28px',
    }}>
      <h2 style={{ fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800, color: t.colors.text, marginBottom: '6px' }}>How long?</h2>
      <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, marginBottom: '24px', fontWeight: 500 }}>Pick your snooze time</p>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {SNOOZE_OPTIONS.map((mins, i) => {
          const colors = [t.colors.accent, t.colors.teal, t.colors.purple];
          return (
            <motion.button key={mins} whileTap={{ scale: 0.92, y: 3, x: 3 }} whileHover={{ y: -4 }}
              onClick={() => confirmSnooze(mins)}
              style={{
                width: '80px', height: '80px', borderRadius: t.radii.md,
                background: colors[i], border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <span style={{ fontFamily: t.fonts.display, fontSize: '24px', fontWeight: 800, color: t.colors.white }}>{mins}</span>
              <span style={{ fontFamily: t.fonts.body, fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>min</span>
            </motion.button>
          );
        })}
      </div>
      <ChunkyButton variant="ghost" onClick={goBack}>Cancel</ChunkyButton>
    </motion.div>
  );
}

/* ───────── Bedtime Reminder ───────── */

function BedtimeReminderScreen({ state }) {
  const { bedtimeSnooze, bedtimeSleep, bedtimeDisable, goHome, notificationsEnabled, setNotificationsEnabled, BEDTIME_SNOOZE_OPTIONS, bedtimeTime, alarms } = state;
  const firstEnabledAlarm = alarms.find(a => a.enabled);
  const alarmTimeDisplay = firstEnabledAlarm ? firstEnabledAlarm.time : '06:30';

  if (!notificationsEnabled) {
    return (
      <motion.div {...popIn} style={{
        height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: t.radii.md, background: t.colors.yellow,
          border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '18px',
        }}>🔕</div>
        <h2 style={{ fontFamily: t.fonts.display, fontSize: '20px', fontWeight: 800, color: t.colors.text, marginBottom: '6px' }}>Notifications Off</h2>
        <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: t.colors.textSecondary, lineHeight: 1.5, marginBottom: '24px', fontWeight: 500 }}>
          Turn on notifications so we can remind you when it's bedtime!
        </p>
        <ChunkyButton variant="secondary" onClick={() => setNotificationsEnabled(true)}>Enable Notifications</ChunkyButton>
        <div style={{ marginTop: '10px', width: '100%' }}>
          <ChunkyButton variant="ghost" onClick={goHome}>Go Back</ChunkyButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...popIn} style={{
      height: '100%', background: '#1A1040', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
          style={{
            position: 'absolute', top: `${15 + (i * 7) % 25}%`, left: `${10 + (i * 13) % 80}%`,
            width: '8px', height: '8px', borderRadius: '2px', background: t.colors.yellow, transform: 'rotate(45deg)',
          }} />
      ))}
      <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ fontSize: '52px', marginBottom: '14px' }}>🌙</motion.div>
      <h2 style={{ fontFamily: t.fonts.display, fontSize: '26px', fontWeight: 800, color: '#FFFBF5', marginBottom: '4px' }}>Bedtime!</h2>
      <p style={{ fontFamily: t.fonts.body, fontSize: '14px', color: 'rgba(255,251,245,0.5)', marginBottom: '28px', fontWeight: 500 }}>
        Alarm at {alarmTimeDisplay}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px' }}>
        <ChunkyButton onClick={bedtimeSleep} color={t.colors.purple}
          style={{ border: '3px solid rgba(255,255,255,0.3)', boxShadow: '4px 4px 0px rgba(255,255,255,0.15)' }}>Going to Sleep</ChunkyButton>
        <div style={{ fontFamily: t.fonts.display, fontSize: '11px', fontWeight: 700, color: 'rgba(255,251,245,0.4)', marginTop: '6px', marginBottom: '2px' }}>Or snooze:</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {BEDTIME_SNOOZE_OPTIONS.map((mins, i) => {
            const colors = [t.colors.accent, t.colors.teal, t.colors.yellow];
            return (
              <motion.button key={mins} whileTap={{ scale: 0.93 }} onClick={() => bedtimeSnooze(mins)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: t.radii.sm,
                  background: colors[i], border: '2px solid rgba(255,255,255,0.2)',
                  color: t.colors.white, fontFamily: t.fonts.display, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}>{mins}m</motion.button>
            );
          })}
        </div>
        <button onClick={bedtimeDisable}
          style={{ background: 'none', border: 'none', fontFamily: t.fonts.body, fontSize: '13px', color: 'rgba(255,251,245,0.35)', cursor: 'pointer', marginTop: '10px', fontWeight: 500 }}>
          Disable for today
        </button>
      </div>
    </motion.div>
  );
}

/* ───────── Feedback ───────── */

function FeedbackScreen({ state }) {
  const { feedbackMessage } = state;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: [0.175, 0.885, 0.32, 1.275] }}
      style={{
        height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center',
      }}>
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 8, delay: 0.1 }}
        style={{
          width: '80px', height: '80px', borderRadius: t.radii.md, background: t.colors.teal,
          border: `3px solid ${t.colors.text}`, boxShadow: `5px 5px 0px ${t.colors.text}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', fontSize: '36px',
        }}>✓</motion.div>
      <p style={{ fontFamily: t.fonts.display, fontSize: '18px', fontWeight: 700, color: t.colors.text, lineHeight: 1.4 }}>
        {feedbackMessage}
      </p>
    </motion.div>
  );
}

/* ───────── Good Morning Screen (Buenos Días) ───────── */

function GoodMorningScreen({ state }) {
  const { goHome, briefingEnabled, briefingSources, goodMorningActions, ringingAlarm } = state;
  const [revealedActions, setRevealedActions] = useState({});
  const [briefingExpanded, setBriefingExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const briefingSrcData = [
    { key: 'agenda', label: 'Today\'s Agenda', icon: '📅', preview: '9:00 AM — Team standup\n10:30 AM — Design review\n2:00 PM — Client call', color: t.colors.teal },
    { key: 'weather', label: 'Weather', icon: '🌤️', preview: 'Partly cloudy, 72°F. Low chance of rain this afternoon.', color: t.colors.yellow },
    { key: 'traffic', label: 'Traffic', icon: '🚗', preview: 'Normal commute — 25 min to office via I-95.', color: t.colors.accent },
    { key: 'news', label: 'Headlines', icon: '📰', preview: 'Tech stocks rally. New space mission launches Friday.', color: t.colors.purple },
  ];

  const activeSources = briefingSrcData.filter(s => briefingSources[s.key]);
  const activeActions = GOOD_MORNING_ACTIONS.filter(a => goodMorningActions.includes(a.id));

  const handleActionTap = (actionId) => {
    setRevealedActions(prev => ({ ...prev, [actionId]: !prev[actionId] }));
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => goHome(), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: dismissed ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{
        height: '100%',
        background: 'linear-gradient(168deg, #FFFBF5 0%, #FFF8E1 35%, #E6F9F3 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative floating shapes */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '30px', right: '-20px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: t.colors.yellow + '25', border: `2px solid ${t.colors.yellow}40`,
        }}
      />
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', top: '180px', left: '-30px',
          width: '80px', height: '80px', borderRadius: '20px',
          background: t.colors.teal + '18', border: `2px solid ${t.colors.teal}30`,
          transform: 'rotate(25deg)',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '120px', right: '-15px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: t.colors.purple + '15', border: `2px solid ${t.colors.purple}25`,
        }}
      />

      <StatusBar />

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${t.spacing.lg}` }}>
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{ marginBottom: '6px', marginTop: '8px' }}
        >
          <motion.div
            animate={{ rotate: [0, 12, -8, 0] }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
            style={{ fontSize: '40px', marginBottom: '4px', display: 'inline-block' }}
          >
            ☀️
          </motion.div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontSize: '28px',
            fontWeight: 800,
            color: t.colors.text,
            margin: '0 0 2px',
            lineHeight: 1.1,
          }}>
            Buenos días
          </h1>
          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            fontWeight: 500,
            color: t.colors.textSecondary,
            marginBottom: '4px',
          }}>
            {dateStr} · {timeStr}
          </div>
          {ringingAlarm && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: t.colors.teal + '18',
              borderRadius: t.radii.full,
              padding: '4px 12px',
              border: `1.5px solid ${t.colors.teal}40`,
            }}>
              <span style={{ fontSize: '12px' }}>✓</span>
              <span style={{
                fontFamily: t.fonts.display,
                fontSize: '11px',
                fontWeight: 700,
                color: t.colors.teal,
              }}>
                {ringingAlarm.label || 'Alarm'} dismissed
              </span>
            </div>
          )}
        </motion.div>

        {/* Briefing Section */}
        {briefingEnabled && activeSources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ marginBottom: '14px' }}
          >
            <div
              onClick={() => setBriefingExpanded(!briefingExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '10px',
                  background: t.colors.yellow,
                  border: `2px solid ${t.colors.text}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  🎙️
                </div>
                <span style={{
                  fontFamily: t.fonts.display,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: t.colors.text,
                }}>
                  Morning Briefing
                </span>
              </div>
              <motion.span
                animate={{ rotate: briefingExpanded ? 180 : 0 }}
                style={{
                  fontFamily: t.fonts.display,
                  fontSize: '14px',
                  color: t.colors.textMuted,
                }}
              >
                ▾
              </motion.span>
            </div>

            <AnimatePresence>
              {briefingExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    background: '#1A1040',
                    borderRadius: t.radii.md,
                    padding: '16px',
                    border: `3px solid ${t.colors.text}`,
                    boxShadow: `4px 4px 0px ${t.colors.text}`,
                  }}>
                    {activeSources.map((src, i) => (
                      <motion.div
                        key={src.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.12 }}
                        style={{
                          marginBottom: i < activeSources.length - 1 ? '14px' : 0,
                          paddingBottom: i < activeSources.length - 1 ? '14px' : 0,
                          borderBottom: i < activeSources.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '5px',
                        }}>
                          <span style={{ fontSize: '14px' }}>{src.icon}</span>
                          <span style={{
                            fontFamily: t.fonts.display,
                            fontSize: '12px',
                            fontWeight: 700,
                            color: src.color,
                            letterSpacing: '0.3px',
                          }}>
                            {src.label}
                          </span>
                        </div>
                        <div style={{
                          fontFamily: t.fonts.body,
                          fontSize: '13px',
                          color: 'rgba(255,251,245,0.7)',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-line',
                          paddingLeft: '22px',
                        }}>
                          {src.preview}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Actions Section */}
        {activeActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '10px',
                background: t.colors.accent,
                border: `2px solid ${t.colors.text}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>
                ⚡
              </div>
              <span style={{
                fontFamily: t.fonts.display,
                fontSize: '15px',
                fontWeight: 700,
                color: t.colors.text,
              }}>
                Quick Actions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {activeActions.map((action, i) => {
                const isRevealed = revealedActions[action.id];
                const actionColors = {
                  work_route: { bg: '#E8F5E9', accent: '#43A047', border: '#43A047' },
                  open_app: { bg: '#F3E5F5', accent: '#8E24AA', border: '#8E24AA' },
                  calendar: { bg: '#E3F2FD', accent: '#1E88E5', border: '#1E88E5' },
                };
                const c = actionColors[action.id] || { bg: t.colors.surfaceAlt, accent: t.colors.accent, border: t.colors.text };

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleActionTap(action.id)}
                      style={{
                        background: t.colors.surface,
                        borderRadius: t.radii.md,
                        border: `3px solid ${t.colors.text}`,
                        boxShadow: isRevealed ? 'none' : `4px 4px 0px ${t.colors.text}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      {/* Action Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '12px',
                            background: c.bg,
                            border: `2px solid ${c.accent}60`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px',
                          }}>
                            {action.icon}
                          </div>
                          <div>
                            <div style={{
                              fontFamily: t.fonts.display,
                              fontSize: '14px',
                              fontWeight: 700,
                              color: t.colors.text,
                            }}>
                              {action.label}
                            </div>
                            <div style={{
                              fontFamily: t.fonts.body,
                              fontSize: '11px',
                              fontWeight: 500,
                              color: t.colors.textSecondary,
                            }}>
                              {action.description}
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isRevealed ? 90 : 0 }}
                          style={{
                            width: '30px', height: '30px',
                            borderRadius: '10px',
                            background: isRevealed ? c.accent : c.bg,
                            border: `2px solid ${isRevealed ? c.accent : c.accent + '40'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                            color: isRevealed ? '#fff' : c.accent,
                            fontFamily: t.fonts.display,
                            fontWeight: 700,
                          }}
                        >
                          ▸
                        </motion.div>
                      </div>

                      {/* Simulation Panel */}
                      <AnimatePresence>
                        {isRevealed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              background: c.bg,
                              borderTop: `2px solid ${c.accent}30`,
                              padding: '14px 16px',
                            }}>
                              {/* Simulated loading bar */}
                              <div style={{
                                marginBottom: '10px',
                                height: '3px',
                                borderRadius: '4px',
                                background: c.accent + '20',
                                overflow: 'hidden',
                              }}>
                                <motion.div
                                  initial={{ width: '0%' }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 1.2, ease: 'easeOut' }}
                                  style={{
                                    height: '100%',
                                    background: c.accent,
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>

                              <div style={{
                                fontFamily: t.fonts.display,
                                fontSize: '13px',
                                fontWeight: 700,
                                color: c.accent,
                                marginBottom: '4px',
                              }}>
                                {action.simTitle}
                              </div>

                              {/* Action-specific simulation */}
                              {action.id === 'work_route' && (
                                <div>
                                  <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px',
                                  }}>
                                    <div style={{
                                      width: '8px', height: '8px', borderRadius: '50%',
                                      background: '#43A047', border: '2px solid #2E7D32',
                                    }} />
                                    <div style={{
                                      flex: 1, height: '2px', background: '#43A047',
                                      borderRadius: '2px', position: 'relative',
                                    }}>
                                      <motion.div
                                        animate={{ left: ['0%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                          position: 'absolute', top: '-3px',
                                          width: '8px', height: '8px',
                                          borderRadius: '50%', background: '#fff',
                                          border: '2px solid #43A047',
                                        }}
                                      />
                                    </div>
                                    <div style={{
                                      width: '8px', height: '8px', borderRadius: '2px',
                                      background: '#F44336', border: '2px solid #C62828',
                                    }} />
                                  </div>
                                  <div style={{
                                    fontFamily: t.fonts.body, fontSize: '12px',
                                    color: '#2E7D32', fontWeight: 600,
                                  }}>
                                    🟢 Light traffic · 25 min via I-95 N
                                  </div>
                                  <div style={{
                                    fontFamily: t.fonts.body, fontSize: '11px',
                                    color: '#5A6E7F', fontWeight: 500, marginTop: '2px',
                                  }}>
                                    Leave by 8:35 AM to arrive on time
                                  </div>
                                </div>
                              )}

                              {action.id === 'open_app' && (
                                <div>
                                  <div style={{
                                    display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap',
                                  }}>
                                    {['Spotify', 'News', 'Podcast'].map((app, j) => (
                                      <motion.div
                                        key={app}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + j * 0.1, type: 'spring', damping: 10 }}
                                        style={{
                                          padding: '6px 12px',
                                          borderRadius: t.radii.full,
                                          background: j === 0 ? '#8E24AA' : 'transparent',
                                          border: `2px solid ${j === 0 ? '#8E24AA' : '#8E24AA60'}`,
                                          fontFamily: t.fonts.display,
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          color: j === 0 ? '#fff' : '#8E24AA',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {app}
                                      </motion.div>
                                    ))}
                                  </div>
                                  <div style={{
                                    fontFamily: t.fonts.body, fontSize: '12px',
                                    color: '#6A1B9A', fontWeight: 600,
                                  }}>
                                    🎵 Your Daily Mix is ready
                                  </div>
                                </div>
                              )}

                              {action.id === 'calendar' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {[
                                    { time: '9:00', label: 'Team standup', c: '#1E88E5' },
                                    { time: '10:30', label: 'Design review', c: '#43A047' },
                                    { time: '2:00', label: 'Client call', c: '#F4511E' },
                                  ].map((evt, j) => (
                                    <motion.div
                                      key={j}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.15 + j * 0.1 }}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                      }}
                                    >
                                      <div style={{
                                        width: '4px', height: '24px',
                                        borderRadius: '2px', background: evt.c,
                                      }} />
                                      <div>
                                        <span style={{
                                          fontFamily: t.fonts.display, fontSize: '11px',
                                          fontWeight: 700, color: '#5A6E7F',
                                        }}>
                                          {evt.time} AM
                                        </span>
                                        <span style={{
                                          fontFamily: t.fonts.body, fontSize: '12px',
                                          fontWeight: 600, color: t.colors.text,
                                          marginLeft: '6px',
                                        }}>
                                          {evt.label}
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Dismiss / Continue to Home */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ paddingBottom: '24px' }}
        >
          <ChunkyButton onClick={handleDismiss} color={t.colors.teal}>
            Start My Day
          </ChunkyButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ───────── Good Morning Settings ───────── */

function GoodMorningSettingsScreen({ state }) {
  const {
    goBack, briefingEnabled, setBriefingEnabled,
    briefingSources, setBriefingSources,
    goodMorningActions, setGoodMorningActions,
    navigate,
  } = state;

  const briefingSrcData = [
    { key: 'agenda', label: 'Today\'s Agenda', icon: '📅' },
    { key: 'weather', label: 'Weather', icon: '🌤️' },
    { key: 'traffic', label: 'Traffic', icon: '🚗' },
    { key: 'news', label: 'Headlines', icon: '📰' },
  ];

  const toggleAction = (actionId) => {
    setGoodMorningActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  return (
    <motion.div {...popIn} style={{ height: '100%', background: t.colors.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Buenos Días" subtitle="Configure your wake-up experience" onBack={goBack} />
      <div style={{ padding: `0 ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>

        {/* Briefing Toggle */}
        <div style={{
          background: t.colors.surface, borderRadius: t.radii.md, padding: '16px',
          border: `3px solid ${t.colors.text}`, boxShadow: `4px 4px 0px ${t.colors.text}`, marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎙️</span>
              <div style={{ fontFamily: t.fonts.display, fontSize: '15px', fontWeight: 700, color: t.colors.text }}>
                Morning Briefing
              </div>
            </div>
            <Toggle enabled={briefingEnabled} onToggle={() => setBriefingEnabled(!briefingEnabled)} />
          </div>
          {briefingEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {briefingSrcData.map(src => (
                <div key={src.key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: t.radii.sm,
                  border: `2px solid ${briefingSources[src.key] ? t.colors.teal : t.colors.border}`,
                  background: briefingSources[src.key] ? t.colors.surfaceAlt : t.colors.surface,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{src.icon}</span>
                    <span style={{ fontFamily: t.fonts.body, fontSize: '13px', fontWeight: 600, color: t.colors.text }}>
                      {src.label}
                    </span>
                  </div>
                  <Toggle enabled={briefingSources[src.key]} onToggle={() => setBriefingSources({ ...briefingSources, [src.key]: !briefingSources[src.key] })} size="small" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wake-up Actions */}
        <SectionLabel>Wake-up Actions</SectionLabel>
        <div style={{
          fontFamily: t.fonts.body, fontSize: '12px', fontWeight: 500,
          color: t.colors.textSecondary, marginBottom: '10px', lineHeight: 1.4,
        }}>
          Select actions to show when your alarm goes off. Tap each to see a simulation.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {GOOD_MORNING_ACTIONS.map(action => {
            const isSelected = goodMorningActions.includes(action.id);
            const actionColors = {
              work_route: { bg: '#E8F5E9', accent: '#43A047' },
              open_app: { bg: '#F3E5F5', accent: '#8E24AA' },
              calendar: { bg: '#E3F2FD', accent: '#1E88E5' },
            };
            const c = actionColors[action.id] || { bg: t.colors.surfaceAlt, accent: t.colors.accent };

            return (
              <motion.div
                key={action.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleAction(action.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: t.radii.md,
                  background: isSelected ? c.bg : t.colors.surface,
                  border: `3px solid ${isSelected ? c.accent : t.colors.border}`,
                  boxShadow: isSelected ? `3px 3px 0px ${c.accent}40` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: isSelected ? c.accent + '20' : t.colors.surfaceAlt,
                    border: `2px solid ${isSelected ? c.accent : t.colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: t.fonts.display,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isSelected ? c.accent : t.colors.text,
                    }}>
                      {action.label}
                    </div>
                    <div style={{
                      fontFamily: t.fonts.body,
                      fontSize: '11px',
                      fontWeight: 500,
                      color: t.colors.textSecondary,
                    }}>
                      {action.description}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '26px', height: '26px',
                  borderRadius: '8px',
                  background: isSelected ? c.accent : 'transparent',
                  border: `2.5px solid ${isSelected ? c.accent : t.colors.disabled}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: 800,
                  transition: 'all 0.2s',
                }}>
                  {isSelected ? '✓' : ''}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview */}
        <ChunkyButton variant="secondary" onClick={() => {
          // Simulate a preview of Good Morning screen
          navigate(SCREENS.GOOD_MORNING);
        }}>
          Preview Buenos Días
        </ChunkyButton>

        <div style={{ height: '24px' }} />
      </div>
    </motion.div>
  );
}

/* ───────── Main V5 App ───────── */

export default function V5App({ state }) {
  const { screen, goHome, navigateExtras, navigateSleep, navigateMorning, navigateTools } = state;
  const [activeTab, setActiveTab] = useState('alarms');

  const TAB_SCREENS = [SCREENS.HOME, SCREENS.TAB_SLEEP, SCREENS.TAB_MORNING, SCREENS.TAB_TOOLS, SCREENS.EXTRAS];
  const showTabBar = TAB_SCREENS.includes(screen);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'alarms') goHome();
    else if (tab === 'sleep') navigateSleep();
    else if (tab === 'morning') navigateMorning();
    else if (tab === 'tools') navigateTools();
  };

  useEffect(() => {
    if (screen === SCREENS.HOME) setActiveTab('alarms');
    else if (screen === SCREENS.TAB_SLEEP || screen === SCREENS.EXTRAS) setActiveTab('sleep');
    else if (screen === SCREENS.TAB_MORNING) setActiveTab('morning');
    else if (screen === SCREENS.TAB_TOOLS) setActiveTab('tools');
  }, [screen]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {screen === SCREENS.HOME && <HomeScreen key="home" state={state} />}
          {screen === SCREENS.TAB_SLEEP && <SleepTabScreen key="sleep" state={state} />}
          {screen === SCREENS.TAB_MORNING && <MorningTabScreen key="morning" state={state} />}
          {screen === SCREENS.TAB_TOOLS && <ToolsTabScreen key="tools" state={state} />}
          {screen === SCREENS.EXTRAS && <ExtrasScreen key="extras" state={state} />}
          {screen === SCREENS.CREATE_EDIT && <CreateEditScreen key="edit" state={state} />}
          {screen === SCREENS.PURPOSE_EDITOR && <PurposeEditorScreen key="purpose" state={state} />}
          {screen === SCREENS.ALARM_RINGING && <AlarmRingingScreen key="ringing" state={state} />}
          {screen === SCREENS.SNOOZE_PICKER && <SnoozePickerScreen key="snooze" state={state} />}
          {screen === SCREENS.BEDTIME_REMINDER && <BedtimeReminderScreen key="bedtime" state={state} />}
          {screen === SCREENS.FEEDBACK && <FeedbackScreen key="feedback" state={state} />}
          {/* Extras sub-screens */}
          {screen === SCREENS.EXTRAS_BEDTIME && <ExtrasBedtimeScreen key="extras-bedtime" state={state} />}
          {screen === SCREENS.EXTRAS_FOCUS && <ExtrasFocusScreen key="extras-focus" state={state} />}
          {screen === SCREENS.EXTRAS_MOTIVATIONAL && <ExtrasMotivationalScreen key="extras-motiv" state={state} />}
          {screen === SCREENS.EXTRAS_BRIEFING && <ExtrasBriefingScreen key="extras-brief" state={state} />}
          {screen === SCREENS.EXTRAS_SLEEP_SUGGEST && <ExtrasSleepSuggestScreen key="extras-sleep-s" state={state} />}
          {screen === SCREENS.EXTRAS_SLEEP_CALC && <ExtrasSleepCalcScreen key="extras-sleep-c" state={state} />}
          {screen === SCREENS.EXTRAS_SMART_SNOOZE && <ExtrasSmartSnoozeScreen key="extras-gps" state={state} />}
          {screen === SCREENS.GOOD_MORNING && <GoodMorningScreen key="good-morning" state={state} />}
          {screen === SCREENS.GOOD_MORNING_SETTINGS && <GoodMorningSettingsScreen key="gm-settings" state={state} />}
        </AnimatePresence>
      </div>

      {showTabBar && (
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
