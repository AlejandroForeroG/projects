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
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] },
};

function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 28px 10px',
      fontSize: '11px',
      fontFamily: t.fonts.body,
      fontWeight: 400,
      color: t.colors.textMuted,
      letterSpacing: '0.02em',
    }}>
      <span>9:41</span>
      <span style={{ letterSpacing: '0.1em' }}>●●●○</span>
    </div>
  );
}

function LuxeButton({ children, onClick, variant = 'primary', style: extra = {}, ...props }) {
  const variants = {
    primary: {
      background: t.colors.accent,
      color: t.colors.bg,
      border: 'none',
      fontWeight: 600,
      letterSpacing: '0.12em',
    },
    secondary: {
      background: 'transparent',
      color: t.colors.accent,
      border: `1px solid ${t.colors.accent}`,
      fontWeight: 400,
      letterSpacing: '0.1em',
    },
    ghost: {
      background: 'transparent',
      color: t.colors.textMuted,
      border: 'none',
      fontWeight: 400,
      letterSpacing: '0.08em',
    },
    danger: {
      background: 'transparent',
      color: '#C45555',
      border: '1px solid #C45555',
      fontWeight: 500,
      letterSpacing: '0.1em',
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px 28px',
        borderRadius: t.radii.sm,
        fontSize: '12px',
        fontFamily: t.fonts.body,
        cursor: 'pointer',
        minHeight: '50px',
        textTransform: 'uppercase',
        ...variants[variant],
        ...extra,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Divider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '8px 0',
    }}>
      <div style={{ flex: 1, height: '1px', background: t.colors.border }} />
      <span style={{
        fontFamily: t.fonts.display,
        fontSize: '10px',
        color: t.colors.accent,
        fontStyle: 'italic',
      }}>
        ✦
      </span>
      <div style={{ flex: 1, height: '1px', background: t.colors.border }} />
    </div>
  );
}

function HomeScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm, simulateAlarm, openBedtimeReminder } = state;

  return (
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '10px',
            fontWeight: 500,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginBottom: '8px',
          }}>
            Rise Gently
          </div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontSize: '36px',
            fontWeight: 700,
            color: t.colors.text,
            margin: 0,
            lineHeight: 1.1,
            fontStyle: 'italic',
          }}>
            Your Alarms
          </h1>
          <Divider />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '28px' }}>
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => editAlarm(alarm)}
              style={{
                background: t.colors.surface,
                padding: '22px 24px',
                cursor: 'pointer',
                borderBottom: `1px solid ${t.colors.border}`,
                opacity: alarm.enabled ? 1 : 0.4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <div style={{
                      fontFamily: t.fonts.display,
                      fontSize: '32px',
                      fontWeight: 700,
                      color: t.colors.text,
                      lineHeight: 1,
                      fontStyle: 'italic',
                    }}>
                      {alarm.time}
                    </div>
                    <div style={{
                      fontFamily: t.fonts.display,
                      fontSize: '13px',
                      color: t.colors.accent,
                      fontStyle: 'italic',
                    }}>
                      {alarm.label}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '10px',
                    color: t.colors.textMuted,
                    marginTop: '6px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    {alarm.days.join(' · ')}
                  </div>
                </div>
                <div
                  role="switch"
                  aria-checked={alarm.enabled}
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggleAlarm(alarm.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleAlarm(alarm.id); } }}
                  style={{
                    width: '48px',
                    height: '26px',
                    borderRadius: t.radii.full,
                    background: alarm.enabled ? t.colors.accent : t.colors.disabled,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: alarm.enabled ? t.colors.bg : t.colors.textMuted,
                    position: 'absolute',
                    top: '3px',
                    left: alarm.enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <LuxeButton onClick={createNewAlarm}>
            New Alarm
          </LuxeButton>
          <LuxeButton variant="secondary" onClick={() => simulateAlarm()}>
            Simulate
          </LuxeButton>
          <LuxeButton variant="ghost" onClick={openBedtimeReminder}>
            Bedtime Ritual
          </LuxeButton>
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
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <button
            onClick={goHome}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.body,
              fontSize: '12px',
              color: t.colors.accent,
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Cancel
          </button>
          <span style={{
            fontFamily: t.fonts.display,
            fontSize: '14px',
            color: t.colors.textMuted,
            fontStyle: 'italic',
          }}>
            {editingAlarm.label ? 'Edit' : 'New'}
          </span>
          <button
            onClick={saveAlarm}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.body,
              fontSize: '12px',
              fontWeight: 600,
              color: t.colors.accent,
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Save
          </button>
        </div>

        {/* Time */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: `1px solid ${t.colors.border}`,
        }}>
          <input
            type="time"
            value={editingAlarm.time}
            onChange={(e) => updateEditingAlarm({ time: e.target.value })}
            aria-label="Alarm time"
            style={{
              fontFamily: t.fonts.display,
              fontSize: '52px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: t.colors.text,
              background: 'none',
              border: 'none',
              textAlign: 'center',
              width: '100%',
            }}
          />
        </div>

        {/* Label */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: t.fonts.body,
            fontSize: '10px',
            fontWeight: 500,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '8px',
          }}>
            Name
          </label>
          <input
            type="text"
            value={editingAlarm.label}
            onChange={(e) => updateEditingAlarm({ label: e.target.value })}
            placeholder="Morning ritual"
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 0,
              border: 'none',
              borderBottom: `1px solid ${t.colors.border}`,
              background: 'transparent',
              fontFamily: t.fonts.display,
              fontSize: '18px',
              fontStyle: 'italic',
              color: t.colors.text,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: t.fonts.body,
            fontSize: '10px',
            fontWeight: 500,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '8px',
          }}>
            Intention
          </label>
          <motion.div
            whileTap={{ scale: 0.99 }}
            onClick={openPurposeEditor}
            style={{
              padding: '16px 0',
              borderBottom: `1px solid ${t.colors.accent}`,
              cursor: 'pointer',
              fontFamily: t.fonts.display,
              fontSize: '16px',
              fontStyle: 'italic',
              color: editingAlarm.purpose ? t.colors.text : t.colors.textMuted,
              lineHeight: 1.5,
            }}
          >
            {editingAlarm.purpose || 'Set your morning intention...'}
          </motion.div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            fontFamily: t.fonts.body,
            fontSize: '10px',
            fontWeight: 500,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '10px',
          }}>
            Repeat
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {allDays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                aria-pressed={editingAlarm.days.includes(day)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: t.radii.sm,
                  border: `1px solid ${editingAlarm.days.includes(day) ? t.colors.accent : t.colors.border}`,
                  background: editingAlarm.days.includes(day) ? t.colors.accent : 'transparent',
                  color: editingAlarm.days.includes(day) ? t.colors.bg : t.colors.textMuted,
                  fontFamily: t.fonts.body,
                  fontSize: '10px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {day.substring(0, 2)}
              </button>
            ))}
          </div>
        </div>

        {editingAlarm.label && (
          <LuxeButton
            variant="danger"
            onClick={() => { deleteAlarm(editingAlarm.id); goHome(); }}
            style={{ marginBottom: '20px' }}
          >
            Delete
          </LuxeButton>
        )}
      </div>
    </motion.div>
  );
}

function PurposeEditorScreen({ state }) {
  const { editingAlarm, savePurpose, goBack, PURPOSE_TEMPLATES } = state;

  return (
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.body,
              fontSize: '12px',
              color: t.colors.accent,
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: t.fonts.display,
            fontSize: '28px',
            fontWeight: 700,
            color: t.colors.text,
            fontStyle: 'italic',
            marginBottom: '6px',
          }}>
            Your Intention
          </h2>
          <Divider />
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            color: t.colors.textMuted,
            lineHeight: 1.5,
            fontWeight: 300,
          }}>
            What matters most when you rise?
          </p>
        </div>

        <textarea
          value={editingAlarm?.purpose || ''}
          onChange={(e) => savePurpose(e.target.value)}
          placeholder="Write your intention..."
          rows={3}
          style={{
            width: '100%',
            padding: '16px 0',
            borderRadius: 0,
            border: 'none',
            borderBottom: `1px solid ${t.colors.border}`,
            background: 'transparent',
            fontFamily: t.fonts.display,
            fontSize: '16px',
            fontStyle: 'italic',
            color: t.colors.text,
            resize: 'none',
            marginBottom: '24px',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />

        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '10px',
          fontWeight: 500,
          color: t.colors.accent,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '14px',
        }}>
          Curated Intentions
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {PURPOSE_TEMPLATES.map((tmpl, i) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => savePurpose(tmpl.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0',
                border: 'none',
                borderBottom: `1px solid ${t.colors.border}`,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: t.fonts.display,
                fontSize: '14px',
                fontStyle: 'italic',
                color: editingAlarm?.purpose === tmpl.text ? t.colors.accent : t.colors.textSecondary,
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{tmpl.emoji}</span>
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
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Elegant gold line animation */}
      <motion.div
        animate={{ height: [`${fadeProgress}%`, `${fadeProgress}%`] }}
        style={{
          position: 'absolute',
          left: '32px',
          top: 0,
          width: '1px',
          background: `linear-gradient(180deg, transparent, ${t.colors.accent}, transparent)`,
        }}
      />
      <motion.div
        animate={{ height: [`${fadeProgress}%`, `${fadeProgress}%`] }}
        style={{
          position: 'absolute',
          right: '32px',
          top: 0,
          width: '1px',
          background: `linear-gradient(180deg, transparent, ${t.colors.accent}, transparent)`,
        }}
      />

      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '10px',
        fontWeight: 500,
        color: t.colors.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        marginBottom: '24px',
      }}>
        Gently Waking · {fadeProgress}%
      </div>

      <div style={{
        fontFamily: t.fonts.display,
        fontSize: '64px',
        fontWeight: 700,
        fontStyle: 'italic',
        color: t.colors.text,
        lineHeight: 1,
        marginBottom: '6px',
      }}>
        {ringingAlarm.time}
      </div>

      <div style={{
        fontFamily: t.fonts.display,
        fontSize: '16px',
        fontStyle: 'italic',
        color: t.colors.textSecondary,
        marginBottom: '32px',
      }}>
        {ringingAlarm.label}
      </div>

      {ringingAlarm.purpose && (
        <div style={{
          borderTop: `1px solid ${t.colors.accent}`,
          borderBottom: `1px solid ${t.colors.accent}`,
          padding: '20px 8px',
          marginBottom: '40px',
          maxWidth: '260px',
        }}>
          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '9px',
            fontWeight: 500,
            color: t.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            marginBottom: '10px',
          }}>
            Your Intention
          </div>
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '18px',
            fontStyle: 'italic',
            color: t.colors.text,
            lineHeight: 1.5,
          }}>
            "{ringingAlarm.purpose}"
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px' }}>
        <LuxeButton onClick={dismissAlarm}>
          I Am Awake
        </LuxeButton>
        <LuxeButton variant="secondary" onClick={snoozeAlarm}>
          Snooze
        </LuxeButton>
      </div>
    </motion.div>
  );
}

function SnoozePickerScreen({ state }) {
  const { confirmSnooze, goBack, SNOOZE_OPTIONS } = state;

  return (
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '10px',
        color: t.colors.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        marginBottom: '12px',
      }}>
        Duration
      </div>
      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '28px',
        fontWeight: 700,
        fontStyle: 'italic',
        color: t.colors.text,
        marginBottom: '28px',
      }}>
        Snooze
      </h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {SNOOZE_OPTIONS.map(mins => (
          <motion.button
            key={mins}
            whileTap={{ scale: 0.95 }}
            onClick={() => confirmSnooze(mins)}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: t.radii.sm,
              background: 'transparent',
              border: `1px solid ${t.colors.accent}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: t.fonts.display,
              fontSize: '26px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: t.colors.accent,
            }}>
              {mins}
            </span>
            <span style={{
              fontFamily: t.fonts.body,
              fontSize: '9px',
              color: t.colors.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              min
            </span>
          </motion.button>
        ))}
      </div>

      <LuxeButton variant="ghost" onClick={goBack}>
        Cancel
      </LuxeButton>
    </motion.div>
  );
}

function BedtimeReminderScreen({ state }) {
  const { bedtimeSnooze, bedtimeSleep, bedtimeDisable, goHome, notificationsEnabled, setNotificationsEnabled, BEDTIME_SNOOZE_OPTIONS } = state;

  if (!notificationsEnabled) {
    return (
      <motion.div {...fadeUp} style={{
        height: '100%',
        background: t.colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: t.fonts.display,
          fontSize: '40px',
          color: t.colors.textMuted,
          marginBottom: '20px',
          fontStyle: 'italic',
        }}>
          🔕
        </div>
        <h2 style={{
          fontFamily: t.fonts.display,
          fontSize: '22px',
          fontWeight: 700,
          fontStyle: 'italic',
          color: t.colors.text,
          marginBottom: '8px',
        }}>
          Notifications Off
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '13px',
          color: t.colors.textMuted,
          lineHeight: 1.5,
          marginBottom: '28px',
          fontWeight: 300,
        }}>
          Please enable notifications in your device settings to receive bedtime reminders.
        </p>
        <LuxeButton variant="secondary" onClick={() => setNotificationsEnabled(true)}>
          Enable
        </LuxeButton>
        <div style={{ marginTop: '8px', width: '100%' }}>
          <LuxeButton variant="ghost" onClick={goHome}>
            Return
          </LuxeButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} style={{
      height: '100%',
      background: `linear-gradient(180deg, ${t.colors.bg} 0%, #1A1510 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '10px',
        color: t.colors.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        marginBottom: '16px',
      }}>
        Evening Ritual
      </div>

      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '32px',
        fontWeight: 700,
        fontStyle: 'italic',
        color: t.colors.text,
        marginBottom: '6px',
      }}>
        Time to Rest
      </h2>
      <Divider />
      <p style={{
        fontFamily: t.fonts.display,
        fontSize: '14px',
        fontStyle: 'italic',
        color: t.colors.textMuted,
        marginBottom: '32px',
      }}>
        Your alarm awaits at 6:30 AM
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '260px' }}>
        <LuxeButton onClick={bedtimeSleep}>
          I'm Going to Sleep
        </LuxeButton>

        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '9px',
          color: t.colors.textMuted,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '12px',
          marginBottom: '4px',
        }}>
          Snooze
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {BEDTIME_SNOOZE_OPTIONS.map(mins => (
            <motion.button
              key={mins}
              whileTap={{ scale: 0.95 }}
              onClick={() => bedtimeSnooze(mins)}
              style={{
                flex: 1,
                padding: '14px 0',
                background: 'transparent',
                border: `1px solid ${t.colors.border}`,
                borderRadius: t.radii.sm,
                color: t.colors.accent,
                fontFamily: t.fonts.display,
                fontSize: '14px',
                fontStyle: 'italic',
                cursor: 'pointer',
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
            fontFamily: t.fonts.body,
            fontSize: '11px',
            color: t.colors.textMuted,
            cursor: 'pointer',
            marginTop: '12px',
            letterSpacing: '0.08em',
          }}
        >
          Disable for today
        </button>

        <button
          onClick={() => setNotificationsEnabled(false)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: t.fonts.body,
            fontSize: '9px',
            color: t.colors.textMuted,
            cursor: 'pointer',
            marginTop: '4px',
            opacity: 0.4,
          }}
        >
          test: disable notifications
        </button>
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
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, delay: 0.15 }}
        style={{
          fontFamily: t.fonts.display,
          fontSize: '40px',
          fontStyle: 'italic',
          color: t.colors.accent,
          marginBottom: '16px',
        }}
      >
        ✦
      </motion.div>
      <p style={{
        fontFamily: t.fonts.display,
        fontSize: '18px',
        fontWeight: 500,
        fontStyle: 'italic',
        color: t.colors.text,
        lineHeight: 1.5,
      }}>
        {feedbackMessage}
      </p>
    </motion.div>
  );
}

export default function V4App({ state }) {
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
