import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from './theme';
import { SCREENS } from '../../shared/useAlarmState';

const fontLink = document.createElement('link');
fontLink.href = `https://fonts.googleapis.com/css2?family=${theme.googleFonts}&display=swap`;
fontLink.rel = 'stylesheet';
if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

const t = theme;
const glitch = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 20px 8px',
      fontSize: '11px',
      fontFamily: t.fonts.body,
      fontWeight: 400,
      color: t.colors.textMuted,
      letterSpacing: '0.05em',
    }}>
      <span>09:41</span>
      <span style={{ color: t.colors.accent, fontSize: '10px' }}>■■■■□</span>
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', style: extra = {}, ...props }) {
  const variants = {
    primary: {
      background: t.colors.accent,
      color: t.colors.bg,
      border: `2px solid ${t.colors.accent}`,
      fontWeight: 700,
    },
    secondary: {
      background: 'transparent',
      color: t.colors.accent,
      border: `2px solid ${t.colors.border}`,
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: t.colors.textMuted,
      border: '2px solid transparent',
      fontWeight: 400,
    },
    danger: {
      background: 'transparent',
      color: '#FF4444',
      border: '2px solid #FF4444',
      fontWeight: 700,
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98, x: 2 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 20px',
        borderRadius: t.radii.md,
        fontSize: '13px',
        fontFamily: t.fonts.display,
        cursor: 'pointer',
        minHeight: '48px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        ...variants[variant],
        ...extra,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: t.fonts.body,
      fontSize: '10px',
      fontWeight: 700,
      color: t.colors.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{
        width: '8px',
        height: '2px',
        background: t.colors.accent,
        display: 'inline-block',
      }} />
      {children}
    </div>
  );
}

// --- Screens ---

function HomeScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm, simulateAlarm, openBedtimeReminder } = state;

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.md} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '11px',
            fontWeight: 500,
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: '4px',
          }}>
            // system
          </div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontSize: '28px',
            fontWeight: 800,
            color: t.colors.text,
            margin: 0,
            lineHeight: 1.1,
          }}>
            ALARMS_
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => editAlarm(alarm)}
              style={{
                background: t.colors.surface,
                padding: '16px 18px',
                cursor: 'pointer',
                borderLeft: `3px solid ${alarm.enabled ? t.colors.accent : t.colors.disabled}`,
                opacity: alarm.enabled ? 1 : 0.4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{
                    fontFamily: t.fonts.display,
                    fontSize: '24px',
                    fontWeight: 800,
                    color: alarm.enabled ? t.colors.text : t.colors.textMuted,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {alarm.time}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '12px',
                    color: t.colors.textSecondary,
                    marginTop: '6px',
                    letterSpacing: '0.02em',
                  }}>
                    {alarm.label}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '10px',
                    color: t.colors.textMuted,
                    marginTop: '2px',
                    letterSpacing: '0.08em',
                  }}>
                    [{alarm.days.join('|')}]
                  </div>
                </div>
                <div
                  role="switch"
                  aria-checked={alarm.enabled}
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggleAlarm(alarm.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleAlarm(alarm.id); } }}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '2px',
                    background: alarm.enabled ? t.colors.accent : t.colors.disabled,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '1px',
                    background: alarm.enabled ? t.colors.bg : t.colors.textMuted,
                    position: 'absolute',
                    top: '3px',
                    left: alarm.enabled ? '23px' : '3px',
                    transition: 'left 0.15s',
                  }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Btn onClick={createNewAlarm}>
            [+] new_alarm
          </Btn>
          <Btn variant="secondary" onClick={() => simulateAlarm()}>
            {'>'} simulate
          </Btn>
          <Btn variant="ghost" onClick={openBedtimeReminder}>
            {'>'} bedtime_reminder
          </Btn>
        </div>
      </div>
    </motion.div>
  );
}

function CreateEditScreen({ state }) {
  const { editingAlarm, updateEditingAlarm, saveAlarm, openPurposeEditor, goHome, deleteAlarm } = state;
  if (!editingAlarm) return null;

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    const days = editingAlarm.days.includes(day)
      ? editingAlarm.days.filter(d => d !== day)
      : [...editingAlarm.days, day];
    updateEditingAlarm({ days });
  };

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={goHome}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '12px',
              color: t.colors.accent,
              cursor: 'pointer',
              padding: '8px 0',
              letterSpacing: '0.05em',
            }}
          >
            {'<'} CANCEL
          </button>
          <span style={{
            fontFamily: t.fonts.display,
            fontSize: '11px',
            fontWeight: 700,
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}>
            {editingAlarm.label ? 'edit' : 'new'}
          </span>
          <button
            onClick={saveAlarm}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '12px',
              fontWeight: 700,
              color: t.colors.accent,
              cursor: 'pointer',
              padding: '8px 0',
              letterSpacing: '0.05em',
            }}
          >
            SAVE {'>'}
          </button>
        </div>

        {/* Time */}
        <div style={{
          background: t.colors.surface,
          borderLeft: `3px solid ${t.colors.accent}`,
          padding: '24px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <input
            type="time"
            value={editingAlarm.time}
            onChange={(e) => updateEditingAlarm({ time: e.target.value })}
            aria-label="Alarm time"
            style={{
              fontFamily: t.fonts.display,
              fontSize: '42px',
              fontWeight: 800,
              color: t.colors.accent,
              background: 'none',
              border: 'none',
              textAlign: 'center',
              width: '100%',
              letterSpacing: '-0.02em',
            }}
          />
        </div>

        {/* Label */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>label</SectionLabel>
          <input
            type="text"
            value={editingAlarm.label}
            onChange={(e) => updateEditingAlarm({ label: e.target.value })}
            placeholder="alarm_name"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: t.radii.sm,
              border: `2px solid ${t.colors.border}`,
              background: t.colors.surface,
              fontFamily: t.fonts.display,
              fontSize: '14px',
              color: t.colors.text,
              boxSizing: 'border-box',
              letterSpacing: '0.02em',
            }}
          />
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>purpose</SectionLabel>
          <motion.div
            whileTap={{ scale: 0.99 }}
            onClick={openPurposeEditor}
            style={{
              padding: '12px 16px',
              borderRadius: t.radii.sm,
              border: `2px dashed ${t.colors.accent}`,
              background: t.colors.surface,
              cursor: 'pointer',
              fontFamily: t.fonts.body,
              fontSize: '13px',
              color: editingAlarm.purpose ? t.colors.text : t.colors.textMuted,
              lineHeight: 1.5,
              letterSpacing: '0.01em',
            }}
          >
            {editingAlarm.purpose || '> set intention_'}
          </motion.div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '24px' }}>
          <SectionLabel>repeat</SectionLabel>
          <div style={{ display: 'flex', gap: '4px' }}>
            {allDays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                aria-pressed={editingAlarm.days.includes(day)}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: t.radii.sm,
                  border: `2px solid ${editingAlarm.days.includes(day) ? t.colors.accent : t.colors.border}`,
                  background: editingAlarm.days.includes(day) ? t.colors.accent : 'transparent',
                  color: editingAlarm.days.includes(day) ? t.colors.bg : t.colors.textMuted,
                  fontFamily: t.fonts.display,
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                {day.substring(0, 2).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {editingAlarm.label && (
          <Btn
            variant="danger"
            onClick={() => { deleteAlarm(editingAlarm.id); goHome(); }}
            style={{ marginBottom: '20px' }}
          >
            [x] delete
          </Btn>
        )}
      </div>
    </motion.div>
  );
}

function PurposeEditorScreen({ state }) {
  const { editingAlarm, savePurpose, goBack, PURPOSE_TEMPLATES } = state;

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '12px',
              color: t.colors.accent,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {'<'} BACK
          </button>
          <span style={{
            fontFamily: t.fonts.display,
            fontSize: '11px',
            fontWeight: 700,
            color: t.colors.textMuted,
            letterSpacing: '0.15em',
          }}>
            PURPOSE
          </span>
          <div style={{ width: '50px' }} />
        </div>

        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          color: t.colors.textSecondary,
          lineHeight: 1.6,
          margin: '0 0 16px',
          letterSpacing: '0.02em',
        }}>
          // define your wake intention
        </p>

        <textarea
          value={editingAlarm?.purpose || ''}
          onChange={(e) => savePurpose(e.target.value)}
          placeholder="> type intention_"
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: t.radii.sm,
            border: `2px solid ${t.colors.border}`,
            background: t.colors.surface,
            fontFamily: t.fonts.display,
            fontSize: '13px',
            color: t.colors.accent,
            resize: 'none',
            marginBottom: '16px',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />

        <SectionLabel>templates</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {PURPOSE_TEMPLATES.map((tmpl, i) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ x: 4 }}
              onClick={() => savePurpose(tmpl.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 0,
                border: 'none',
                borderLeft: `3px solid ${editingAlarm?.purpose === tmpl.text ? t.colors.accent : t.colors.border}`,
                background: editingAlarm?.purpose === tmpl.text ? t.colors.surfaceAlt : t.colors.surface,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: t.fonts.body,
                fontSize: '12px',
                color: t.colors.text,
                lineHeight: 1.4,
                letterSpacing: '0.01em',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{tmpl.emoji}</span>
              {tmpl.text}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AlarmRingingScreen({ state }) {
  const { ringingAlarm, fadeProgress, dismissAlarm, snoozeAlarm } = state;
  if (!ringingAlarm) return null;

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scan line effect */}
      <motion.div
        animate={{ top: ['-2px', '100%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${t.colors.accent}, transparent)`,
          opacity: 0.3,
        }}
      />

      <div style={{
        fontFamily: t.fonts.display,
        fontSize: '10px',
        fontWeight: 700,
        color: t.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.25em',
        marginBottom: '4px',
      }}>
        // alarm active
      </div>

      {/* Fade indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '32px',
      }}>
        <div style={{
          width: '100px',
          height: '4px',
          background: t.colors.surface,
        }}>
          <motion.div
            animate={{ width: `${fadeProgress}%` }}
            style={{
              height: '100%',
              background: t.colors.accent,
            }}
          />
        </div>
        <span style={{
          fontFamily: t.fonts.display,
          fontSize: '10px',
          color: t.colors.accent,
          letterSpacing: '0.1em',
        }}>
          {fadeProgress}%
        </span>
      </div>

      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          fontFamily: t.fonts.display,
          fontSize: '64px',
          fontWeight: 800,
          color: t.colors.accent,
          lineHeight: 1,
          marginBottom: '8px',
          letterSpacing: '-0.04em',
        }}
      >
        {ringingAlarm.time}
      </motion.div>

      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '14px',
        color: t.colors.textSecondary,
        marginBottom: '28px',
        letterSpacing: '0.05em',
      }}>
        {ringingAlarm.label}
      </div>

      {ringingAlarm.purpose && (
        <div style={{
          borderLeft: `3px solid ${t.colors.accent}`,
          padding: '16px 20px',
          marginBottom: '36px',
          maxWidth: '260px',
          textAlign: 'left',
          background: t.colors.surface,
        }}>
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '9px',
            fontWeight: 700,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: '6px',
          }}>
            intention
          </div>
          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '14px',
            color: t.colors.text,
            lineHeight: 1.5,
          }}>
            {ringingAlarm.purpose}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '240px' }}>
        <Btn onClick={dismissAlarm}>
          [✓] I'M AWAKE
        </Btn>
        <Btn variant="secondary" onClick={snoozeAlarm}>
          [z] SNOOZE
        </Btn>
      </div>
    </motion.div>
  );
}

function SnoozePickerScreen({ state }) {
  const { confirmSnooze, goBack, SNOOZE_OPTIONS } = state;

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
    }}>
      <SectionLabel>select duration</SectionLabel>
      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '24px',
        fontWeight: 800,
        color: t.colors.text,
        margin: '8px 0 28px',
        letterSpacing: '-0.02em',
      }}>
        SNOOZE_
      </h2>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {SNOOZE_OPTIONS.map(mins => (
          <motion.button
            key={mins}
            whileTap={{ scale: 0.95 }}
            onClick={() => confirmSnooze(mins)}
            style={{
              width: '72px',
              height: '72px',
              background: t.colors.surface,
              border: `2px solid ${t.colors.border}`,
              borderRadius: t.radii.sm,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: t.fonts.display,
              fontSize: '22px',
              fontWeight: 800,
              color: t.colors.accent,
            }}>
              {mins}
            </span>
            <span style={{
              fontFamily: t.fonts.body,
              fontSize: '10px',
              color: t.colors.textMuted,
              letterSpacing: '0.1em',
            }}>
              MIN
            </span>
          </motion.button>
        ))}
      </div>

      <Btn variant="ghost" onClick={goBack}>
        {'<'} cancel
      </Btn>
    </motion.div>
  );
}

function BedtimeReminderScreen({ state }) {
  const { bedtimeSnooze, bedtimeSleep, bedtimeDisable, goHome, notificationsEnabled, setNotificationsEnabled, BEDTIME_SNOOZE_OPTIONS } = state;

  if (!notificationsEnabled) {
    return (
      <motion.div {...glitch} style={{
        height: '100%',
        background: t.colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: t.fonts.display,
          fontSize: '36px',
          marginBottom: '16px',
          color: t.colors.textMuted,
        }}>
          ⚠
        </div>
        <h2 style={{
          fontFamily: t.fonts.display,
          fontSize: '16px',
          fontWeight: 700,
          color: t.colors.text,
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}>
          NOTIFICATIONS_OFF
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          color: t.colors.textSecondary,
          lineHeight: 1.5,
          marginBottom: '24px',
          letterSpacing: '0.02em',
        }}>
          // enable in device settings to receive bedtime alerts
        </p>
        <Btn variant="secondary" onClick={() => setNotificationsEnabled(true)}>
          enable_notifications
        </Btn>
        <div style={{ marginTop: '8px', width: '100%' }}>
          <Btn variant="ghost" onClick={goHome}>
            {'<'} back
          </Btn>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...glitch} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(${t.colors.border} 1px, transparent 1px), linear-gradient(90deg, ${t.colors.border} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.15,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{
            fontFamily: t.fonts.display,
            fontSize: '10px',
            fontWeight: 700,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            marginBottom: '12px',
          }}
        >
          // bedtime protocol
        </motion.div>

        <h2 style={{
          fontFamily: t.fonts.display,
          fontSize: '24px',
          fontWeight: 800,
          color: t.colors.text,
          marginBottom: '6px',
        }}>
          TIME TO SLEEP_
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          color: t.colors.textMuted,
          marginBottom: '32px',
          letterSpacing: '0.05em',
        }}>
          alarm set → 06:30
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '260px' }}>
          <Btn onClick={bedtimeSleep}>
            [→] I'M GOING TO SLEEP
          </Btn>

          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '9px',
            color: t.colors.textMuted,
            letterSpacing: '0.15em',
            marginTop: '8px',
            marginBottom: '4px',
          }}>
            SNOOZE_REMINDER
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {BEDTIME_SNOOZE_OPTIONS.map(mins => (
              <motion.button
                key={mins}
                whileTap={{ scale: 0.95 }}
                onClick={() => bedtimeSnooze(mins)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: t.colors.surface,
                  border: `2px solid ${t.colors.border}`,
                  borderRadius: t.radii.sm,
                  color: t.colors.accent,
                  fontFamily: t.fonts.display,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                {mins}m
              </motion.button>
            ))}
          </div>

          <button
            onClick={bedtimeDisable}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '11px',
              color: t.colors.textMuted,
              cursor: 'pointer',
              marginTop: '12px',
              letterSpacing: '0.05em',
            }}
          >
            disable_today
          </button>

          <button
            onClick={() => setNotificationsEnabled(false)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.body,
              fontSize: '10px',
              color: t.colors.textMuted,
              cursor: 'pointer',
              marginTop: '4px',
              opacity: 0.5,
            }}
          >
            test: disable notifications
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FeedbackScreen({ state }) {
  const { feedbackMessage } = state;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: '100%',
        background: t.colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        style={{
          fontFamily: t.fonts.display,
          fontSize: '48px',
          color: t.colors.success,
          marginBottom: '16px',
        }}
      >
        ✓
      </motion.div>
      <p style={{
        fontFamily: t.fonts.display,
        fontSize: '14px',
        fontWeight: 500,
        color: t.colors.textSecondary,
        lineHeight: 1.5,
        letterSpacing: '0.02em',
      }}>
        {feedbackMessage}
      </p>
    </motion.div>
  );
}

export default function V2App({ state }) {
  const { screen } = state;

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {screen === SCREENS.HOME && <HomeScreen key="home" state={state} />}
        {screen === SCREENS.CREATE_EDIT && <CreateEditScreen key="edit" state={state} />}
        {screen === SCREENS.PURPOSE_EDITOR && <PurposeEditorScreen key="purpose" state={state} />}
        {screen === SCREENS.ALARM_RINGING && <AlarmRingingScreen key="ringing" state={state} />}
        {screen === SCREENS.SNOOZE_PICKER && <SnoozePickerScreen key="snooze" state={state} />}
        {screen === SCREENS.BEDTIME_REMINDER && <BedtimeReminderScreen key="bedtime" state={state} />}
        {screen === SCREENS.FEEDBACK && <FeedbackScreen key="feedback" state={state} />}
      </AnimatePresence>
    </div>
  );
}
