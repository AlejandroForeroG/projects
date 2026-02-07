import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import theme from './theme';
import { SCREENS } from '../../shared/useAlarmState';

// Load Google Fonts
const fontLink = document.createElement('link');
fontLink.href = `https://fonts.googleapis.com/css2?family=${theme.googleFonts}&display=swap`;
fontLink.rel = 'stylesheet';
if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

const t = theme;
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

// --- Shared Components ---
function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 24px 8px',
      fontSize: '12px',
      fontFamily: t.fonts.body,
      fontWeight: 600,
      color: t.colors.textSecondary,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span>●●●●○</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', style: extraStyle = {}, ...props }) {
  const styles = {
    primary: {
      background: t.colors.accent,
      color: t.colors.white,
      border: 'none',
      fontWeight: 600,
    },
    secondary: {
      background: t.colors.surface,
      color: t.colors.text,
      border: `1.5px solid ${t.colors.border}`,
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: t.colors.textSecondary,
      border: 'none',
      fontWeight: 500,
    },
    danger: {
      background: '#F5E6E2',
      color: t.colors.accentDark,
      border: 'none',
      fontWeight: 600,
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px 24px',
        borderRadius: t.radii.md,
        fontSize: '16px',
        fontFamily: t.fonts.body,
        cursor: 'pointer',
        minHeight: '52px',
        ...styles[variant],
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// --- Screens ---

function HomeScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm, simulateAlarm, openBedtimeReminder } = state;

  return (
    <motion.div {...pageTransition} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.md} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <h1 style={{
          fontFamily: t.fonts.display,
          fontSize: '32px',
          fontWeight: 900,
          color: t.colors.text,
          margin: '0 0 4px',
          fontStyle: 'italic',
        }}>
          Alarms
        </h1>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textMuted,
          margin: '0 0 28px',
        }}>
          Wake with intention
        </p>

        {/* Alarm List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => editAlarm(alarm)}
              style={{
                background: t.colors.surface,
                borderRadius: t.radii.md,
                padding: '18px 20px',
                cursor: 'pointer',
                border: `1.5px solid ${alarm.enabled ? t.colors.border : 'transparent'}`,
                opacity: alarm.enabled ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    fontFamily: t.fonts.display,
                    fontSize: '28px',
                    fontWeight: 700,
                    color: t.colors.text,
                    lineHeight: 1.1,
                  }}>
                    {alarm.time}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '14px',
                    color: t.colors.textSecondary,
                    marginTop: '4px',
                  }}>
                    {alarm.label}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '12px',
                    color: t.colors.textMuted,
                    marginTop: '2px',
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
                    width: '52px',
                    height: '30px',
                    borderRadius: '15px',
                    background: alarm.enabled ? t.colors.accent : t.colors.disabled,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: t.colors.white,
                    position: 'absolute',
                    top: '2px',
                    left: alarm.enabled ? '24px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button onClick={createNewAlarm}>
            + New Alarm
          </Button>
          <Button variant="secondary" onClick={() => simulateAlarm()}>
            ▶ Simulate Alarm
          </Button>
          <Button variant="ghost" onClick={openBedtimeReminder}>
            🌙 Bedtime Reminder
          </Button>
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
    <motion.div {...pageTransition} style={{
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
              fontFamily: t.fonts.body,
              fontSize: '16px',
              color: t.colors.accent,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            ← Cancel
          </button>
          <h2 style={{
            fontFamily: t.fonts.display,
            fontSize: '18px',
            fontWeight: 700,
            color: t.colors.text,
            margin: 0,
          }}>
            {editingAlarm.label ? 'Edit Alarm' : 'New Alarm'}
          </h2>
          <button
            onClick={saveAlarm}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: t.fonts.body,
              fontSize: '16px',
              fontWeight: 600,
              color: t.colors.accent,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            Save
          </button>
        </div>

        {/* Time Picker */}
        <div style={{
          background: t.colors.surface,
          borderRadius: t.radii.lg,
          padding: '28px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <input
            type="time"
            value={editingAlarm.time}
            onChange={(e) => updateEditingAlarm({ time: e.target.value })}
            aria-label="Alarm time"
            style={{
              fontFamily: t.fonts.display,
              fontSize: '48px',
              fontWeight: 700,
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
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '8px',
          }}>
            Label
          </label>
          <input
            type="text"
            value={editingAlarm.label}
            onChange={(e) => updateEditingAlarm({ label: e.target.value })}
            placeholder="e.g., Morning routine"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: t.radii.sm,
              border: `1.5px solid ${t.colors.border}`,
              background: t.colors.white,
              fontFamily: t.fonts.body,
              fontSize: '16px',
              color: t.colors.text,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '8px',
          }}>
            Purpose
          </label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={openPurposeEditor}
            style={{
              padding: '14px 18px',
              borderRadius: t.radii.sm,
              border: `1.5px dashed ${t.colors.accent}`,
              background: '#FEF5F0',
              cursor: 'pointer',
              fontFamily: t.fonts.body,
              fontSize: '15px',
              color: editingAlarm.purpose ? t.colors.text : t.colors.textMuted,
              lineHeight: 1.4,
            }}
          >
            {editingAlarm.purpose || 'Tap to set a morning intention...'}
          </motion.div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
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
                  height: '44px',
                  borderRadius: t.radii.sm,
                  border: editingAlarm.days.includes(day) ? 'none' : `1.5px solid ${t.colors.border}`,
                  background: editingAlarm.days.includes(day) ? t.colors.accent : t.colors.white,
                  color: editingAlarm.days.includes(day) ? t.colors.white : t.colors.textSecondary,
                  fontFamily: t.fonts.body,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {editingAlarm.label && (
          <Button
            variant="danger"
            onClick={() => { deleteAlarm(editingAlarm.id); goHome(); }}
            style={{ marginBottom: '20px' }}
          >
            Delete Alarm
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function PurposeEditorScreen({ state }) {
  const { editingAlarm, savePurpose, goBack, PURPOSE_TEMPLATES } = state;

  return (
    <motion.div {...pageTransition} style={{
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
              fontFamily: t.fonts.body,
              fontSize: '16px',
              color: t.colors.accent,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            ← Back
          </button>
          <h2 style={{
            fontFamily: t.fonts.display,
            fontSize: '18px',
            fontWeight: 700,
            color: t.colors.text,
            margin: 0,
          }}>
            Set Purpose
          </h2>
          <div style={{ width: '60px' }} />
        </div>

        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '15px',
          color: t.colors.textSecondary,
          lineHeight: 1.5,
          margin: '0 0 20px',
        }}>
          What's your intention when this alarm goes off? Choose a template or write your own.
        </p>

        {/* Custom Input */}
        <textarea
          value={editingAlarm?.purpose || ''}
          onChange={(e) => savePurpose(e.target.value)}
          placeholder="Write your own morning intention..."
          rows={3}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: t.radii.sm,
            border: `1.5px solid ${t.colors.border}`,
            background: t.colors.white,
            fontFamily: t.fonts.body,
            fontSize: '15px',
            color: t.colors.text,
            resize: 'none',
            marginBottom: '20px',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />

        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          fontWeight: 600,
          color: t.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          Or choose a template
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PURPOSE_TEMPLATES.map((tmpl, i) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => savePurpose(tmpl.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: t.radii.sm,
                border: `1.5px solid ${t.colors.border}`,
                background: editingAlarm?.purpose === tmpl.text ? '#FEF5F0' : t.colors.white,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: t.fonts.body,
                fontSize: '14px',
                color: t.colors.text,
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{tmpl.emoji}</span>
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
    <motion.div {...pageTransition} style={{
      height: '100%',
      background: `linear-gradient(180deg, ${t.colors.accent} 0%, ${t.colors.accentDark} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      {/* Fade-in indicator */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.1 + fadeProgress * 0.003})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.2 + fadeProgress * 0.005})`,
        }} />
      </motion.div>

      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '12px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '4px',
      }}>
        Sound fading in · {fadeProgress}%
      </div>

      {/* Progress bar */}
      <div style={{
        width: '120px',
        height: '3px',
        borderRadius: '2px',
        background: 'rgba(255,255,255,0.2)',
        marginBottom: '32px',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${fadeProgress}%` }}
          style={{
            height: '100%',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '2px',
          }}
        />
      </div>

      <div style={{
        fontFamily: t.fonts.display,
        fontSize: '56px',
        fontWeight: 900,
        color: t.colors.white,
        lineHeight: 1,
        marginBottom: '8px',
        fontStyle: 'italic',
      }}>
        {ringingAlarm.time}
      </div>

      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '16px',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '32px',
      }}>
        {ringingAlarm.label}
      </div>

      {/* Purpose */}
      {ringingAlarm.purpose && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: t.radii.md,
          padding: '20px 24px',
          marginBottom: '40px',
          maxWidth: '280px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            Your intention
          </div>
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '18px',
            fontWeight: 600,
            color: t.colors.white,
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}>
            {ringingAlarm.purpose}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '260px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={dismissAlarm}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: t.radii.full,
            background: t.colors.white,
            color: t.colors.accentDark,
            border: 'none',
            fontFamily: t.fonts.body,
            fontSize: '18px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          I'm Awake
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={snoozeAlarm}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: t.radii.full,
            background: 'rgba(255,255,255,0.15)',
            color: t.colors.white,
            border: '1.5px solid rgba(255,255,255,0.3)',
            fontFamily: t.fonts.body,
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Snooze
        </motion.button>
      </div>
    </motion.div>
  );
}

function SnoozePickerScreen({ state }) {
  const { confirmSnooze, goBack, SNOOZE_OPTIONS } = state;

  return (
    <motion.div {...pageTransition} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
    }}>
      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '28px',
        fontWeight: 900,
        color: t.colors.text,
        marginBottom: '8px',
        fontStyle: 'italic',
      }}>
        Snooze
      </h2>
      <p style={{
        fontFamily: t.fonts.body,
        fontSize: '15px',
        color: t.colors.textSecondary,
        marginBottom: '32px',
      }}>
        How long do you need?
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {SNOOZE_OPTIONS.map(mins => (
          <motion.button
            key={mins}
            whileTap={{ scale: 0.92 }}
            onClick={() => confirmSnooze(mins)}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: t.radii.lg,
              background: t.colors.surface,
              border: `1.5px solid ${t.colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: t.fonts.display,
              fontSize: '24px',
              fontWeight: 700,
              color: t.colors.text,
            }}>
              {mins}
            </span>
            <span style={{
              fontFamily: t.fonts.body,
              fontSize: '12px',
              color: t.colors.textMuted,
            }}>
              min
            </span>
          </motion.button>
        ))}
      </div>

      <Button variant="ghost" onClick={goBack}>
        Cancel
      </Button>
    </motion.div>
  );
}

function BedtimeReminderScreen({ state }) {
  const { bedtimeSnooze, bedtimeSleep, bedtimeDisable, goHome, notificationsEnabled, setNotificationsEnabled, BEDTIME_SNOOZE_OPTIONS } = state;

  if (!notificationsEnabled) {
    return (
      <motion.div {...pageTransition} style={{
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
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: t.colors.surfaceAlt,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '20px',
        }}>
          🔕
        </div>
        <h2 style={{
          fontFamily: t.fonts.display,
          fontSize: '22px',
          fontWeight: 700,
          color: t.colors.text,
          marginBottom: '8px',
        }}>
          Notifications Disabled
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '15px',
          color: t.colors.textSecondary,
          lineHeight: 1.5,
          marginBottom: '28px',
          maxWidth: '260px',
        }}>
          Enable notifications in your device settings to receive bedtime reminders.
        </p>
        <Button variant="secondary" onClick={() => setNotificationsEnabled(true)}>
          Enable Notifications
        </Button>
        <div style={{ marginTop: '12px', width: '100%' }}>
          <Button variant="ghost" onClick={goHome}>
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} style={{
      height: '100%',
      background: `linear-gradient(180deg, #1A1430 0%, #2C1810 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ fontSize: '48px', marginBottom: '16px' }}
      >
        🌙
      </motion.div>

      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '28px',
        fontWeight: 900,
        color: '#F5EDE0',
        marginBottom: '8px',
        fontStyle: 'italic',
      }}>
        Time to Sleep
      </h2>
      <p style={{
        fontFamily: t.fonts.body,
        fontSize: '15px',
        color: 'rgba(245, 237, 224, 0.7)',
        marginBottom: '36px',
      }}>
        Your alarm is set for 6:30 AM
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={bedtimeSleep}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: t.radii.full,
            background: '#F5EDE0',
            color: '#2C1810',
            border: 'none',
            fontFamily: t.fonts.body,
            fontSize: '17px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          I'm Going to Sleep
        </motion.button>

        {/* Snooze options */}
        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '12px',
          color: 'rgba(245, 237, 224, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginTop: '8px',
          marginBottom: '4px',
        }}>
          Snooze reminder
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {BEDTIME_SNOOZE_OPTIONS.map(mins => (
            <motion.button
              key={mins}
              whileTap={{ scale: 0.93 }}
              onClick={() => bedtimeSnooze(mins)}
              style={{
                flex: 1,
                padding: '14px 0',
                borderRadius: t.radii.md,
                background: 'rgba(245, 237, 224, 0.1)',
                border: '1px solid rgba(245, 237, 224, 0.2)',
                color: '#F5EDE0',
                fontFamily: t.fonts.body,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {mins}m
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={bedtimeDisable}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: t.radii.full,
            background: 'transparent',
            color: 'rgba(245, 237, 224, 0.5)',
            border: 'none',
            fontFamily: t.fonts.body,
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Disable for today
        </motion.button>

        <button
          onClick={() => setNotificationsEnabled(false)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: t.fonts.body,
            fontSize: '12px',
            color: 'rgba(245, 237, 224, 0.3)',
            cursor: 'pointer',
            marginTop: '4px',
            textDecoration: 'underline',
          }}
        >
          Test: disable notifications
        </button>
      </div>
    </motion.div>
  );
}

function FeedbackScreen({ state }) {
  const { feedbackMessage } = state;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.15 }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: t.colors.success,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '32px', color: t.colors.white }}>✓</span>
      </motion.div>
      <p style={{
        fontFamily: t.fonts.display,
        fontSize: '20px',
        fontWeight: 600,
        color: t.colors.text,
        lineHeight: 1.4,
        fontStyle: 'italic',
      }}>
        {feedbackMessage}
      </p>
    </motion.div>
  );
}

// --- Main V1 Export ---
export default function V1App({ state }) {
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
