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
const softSlide = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -15, scale: 0.98 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 28px 10px',
      fontSize: '12px',
      fontFamily: t.fonts.body,
      fontWeight: 500,
      color: t.colors.textMuted,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span>☁</span>
      </div>
    </div>
  );
}

function PillButton({ children, onClick, variant = 'primary', style: extra = {}, ...props }) {
  const variants = {
    primary: {
      background: t.colors.gradient2,
      color: t.colors.white,
      border: 'none',
      fontWeight: 600,
      boxShadow: `0 8px 24px ${t.colors.shadow}`,
    },
    secondary: {
      background: t.colors.surface,
      color: t.colors.accent,
      border: `2px solid ${t.colors.border}`,
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: t.colors.textMuted,
      border: 'none',
      fontWeight: 500,
    },
    danger: {
      background: '#FFF0F0',
      color: '#E05A5A',
      border: 'none',
      fontWeight: 600,
    },
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px 28px',
        borderRadius: t.radii.full,
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

function HomeScreen({ state }) {
  const { alarms, toggleAlarm, editAlarm, createNewAlarm, simulateAlarm, openBedtimeReminder } = state;

  return (
    <motion.div {...softSlide} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        {/* Header with gradient blob */}
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: t.colors.gradient1,
            opacity: 0.5,
            filter: 'blur(25px)',
          }} />
          <h1 style={{
            fontFamily: t.fonts.display,
            fontSize: '30px',
            fontWeight: 700,
            color: t.colors.text,
            margin: '0 0 6px',
            position: 'relative',
          }}>
            Good morning
          </h1>
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '14px',
            color: t.colors.textMuted,
            margin: 0,
            fontWeight: 300,
          }}>
            Your gentle alarms
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {alarms.map((alarm, i) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => editAlarm(alarm)}
              style={{
                background: alarm.enabled ? t.colors.surface : t.colors.surfaceAlt,
                borderRadius: t.radii.md,
                padding: '20px 22px',
                cursor: 'pointer',
                boxShadow: alarm.enabled ? `0 4px 20px ${t.colors.shadow}` : 'none',
                opacity: alarm.enabled ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    fontFamily: t.fonts.display,
                    fontSize: '32px',
                    fontWeight: 700,
                    color: alarm.enabled ? t.colors.text : t.colors.textMuted,
                    lineHeight: 1.1,
                  }}>
                    {alarm.time}
                  </div>
                  <div style={{
                    fontFamily: t.fonts.body,
                    fontSize: '13px',
                    color: t.colors.textSecondary,
                    marginTop: '6px',
                    fontWeight: 400,
                  }}>
                    {alarm.label}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginTop: '8px',
                  }}>
                    {alarm.days.map(d => (
                      <span key={d} style={{
                        fontFamily: t.fonts.body,
                        fontSize: '10px',
                        fontWeight: 500,
                        color: t.colors.accent,
                        background: t.colors.lavender,
                        padding: '2px 8px',
                        borderRadius: t.radii.full,
                      }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  role="switch"
                  aria-checked={alarm.enabled}
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggleAlarm(alarm.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleAlarm(alarm.id); } }}
                  style={{
                    width: '54px',
                    height: '32px',
                    borderRadius: t.radii.full,
                    background: alarm.enabled ? t.colors.gradient2 : t.colors.disabled,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    flexShrink: 0,
                  }}
                >
                  <motion.div
                    animate={{ left: alarm.enabled ? '24px' : '3px' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: t.colors.white,
                      position: 'absolute',
                      top: '3px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PillButton onClick={createNewAlarm}>
            ✦ Add Alarm
          </PillButton>
          <PillButton variant="secondary" onClick={() => simulateAlarm()}>
            ♪ Try Alarm
          </PillButton>
          <PillButton variant="ghost" onClick={openBedtimeReminder}>
            ☽ Bedtime
          </PillButton>
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
    <motion.div {...softSlide} style={{
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
              background: t.colors.surfaceAlt,
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '14px',
              color: t.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: t.radii.full,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveAlarm}
            style={{
              background: t.colors.gradient2,
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '14px',
              fontWeight: 600,
              color: t.colors.white,
              cursor: 'pointer',
              padding: '8px 20px',
              borderRadius: t.radii.full,
            }}
          >
            Save ✓
          </button>
        </div>

        {/* Time */}
        <div style={{
          background: t.colors.gradient1,
          borderRadius: t.radii.lg,
          padding: '32px',
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
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            fontFamily: t.fonts.display,
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
          }}>
            Label
          </label>
          <input
            type="text"
            value={editingAlarm.label}
            onChange={(e) => updateEditingAlarm({ label: e.target.value })}
            placeholder="What's this alarm for?"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: t.radii.md,
              border: `2px solid ${t.colors.border}`,
              background: t.colors.surface,
              fontFamily: t.fonts.body,
              fontSize: '15px',
              color: t.colors.text,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            fontFamily: t.fonts.display,
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textSecondary,
            display: 'block',
            marginBottom: '8px',
          }}>
            Morning Intention
          </label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={openPurposeEditor}
            style={{
              padding: '16px 20px',
              borderRadius: t.radii.md,
              background: t.colors.surfaceAlt,
              border: `2px dashed ${t.colors.accentLight}`,
              cursor: 'pointer',
              fontFamily: t.fonts.body,
              fontSize: '14px',
              color: editingAlarm.purpose ? t.colors.text : t.colors.textMuted,
              lineHeight: 1.5,
            }}
          >
            {editingAlarm.purpose || 'Tap to choose your intention ✦'}
          </motion.div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontFamily: t.fonts.display,
            fontSize: '13px',
            fontWeight: 600,
            color: t.colors.textSecondary,
            display: 'block',
            marginBottom: '10px',
          }}>
            Repeat on
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
                  borderRadius: t.radii.full,
                  border: 'none',
                  background: editingAlarm.days.includes(day) ? t.colors.gradient2 : t.colors.surfaceAlt,
                  color: editingAlarm.days.includes(day) ? t.colors.white : t.colors.textMuted,
                  fontFamily: t.fonts.display,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {day.substring(0, 2)}
              </button>
            ))}
          </div>
        </div>

        {editingAlarm.label && (
          <PillButton
            variant="danger"
            onClick={() => { deleteAlarm(editingAlarm.id); goHome(); }}
            style={{ marginBottom: '20px' }}
          >
            Delete Alarm
          </PillButton>
        )}
      </div>
    </motion.div>
  );
}

function PurposeEditorScreen({ state }) {
  const { editingAlarm, savePurpose, goBack, PURPOSE_TEMPLATES } = state;

  return (
    <motion.div {...softSlide} style={{
      height: '100%',
      background: t.colors.bg,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />
      <div style={{ padding: `${t.spacing.sm} ${t.spacing.lg}`, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={goBack}
            style={{
              background: t.colors.surfaceAlt,
              border: 'none',
              fontFamily: t.fonts.display,
              fontSize: '14px',
              color: t.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: t.radii.full,
            }}
          >
            ← Back
          </button>
        </div>

        <h2 style={{
          fontFamily: t.fonts.display,
          fontSize: '24px',
          fontWeight: 700,
          color: t.colors.text,
          marginBottom: '8px',
        }}>
          Set Your Intention
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textMuted,
          lineHeight: 1.5,
          marginBottom: '20px',
          fontWeight: 300,
        }}>
          This will greet you when you wake up
        </p>

        <textarea
          value={editingAlarm?.purpose || ''}
          onChange={(e) => savePurpose(e.target.value)}
          placeholder="Write something kind for morning-you..."
          rows={3}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: t.radii.md,
            border: `2px solid ${t.colors.border}`,
            background: t.colors.surface,
            fontFamily: t.fonts.body,
            fontSize: '14px',
            color: t.colors.text,
            resize: 'none',
            marginBottom: '20px',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />

        <div style={{
          fontFamily: t.fonts.display,
          fontSize: '12px',
          fontWeight: 600,
          color: t.colors.textMuted,
          marginBottom: '12px',
        }}>
          Quick picks
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PURPOSE_TEMPLATES.map((tmpl, i) => (
            <motion.button
              key={tmpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => savePurpose(tmpl.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: t.radii.md,
                border: 'none',
                background: editingAlarm?.purpose === tmpl.text ? t.colors.lavender : t.colors.surface,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: t.fonts.body,
                fontSize: '13px',
                color: t.colors.text,
                lineHeight: 1.4,
                boxShadow: editingAlarm?.purpose === tmpl.text ? `0 2px 12px ${t.colors.shadow}` : 'none',
              }}
            >
              <span style={{
                fontSize: '20px',
                flexShrink: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: t.colors.gradient1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {tmpl.emoji}
              </span>
              <span>{tmpl.text}</span>
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
    <motion.div {...softSlide} style={{
      height: '100%',
      background: 'linear-gradient(180deg, #E8DFFF 0%, #FFDDC9 50%, #F8F5FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      {/* Breathing circle */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: t.colors.gradient2,
          opacity: 0.3,
          position: 'absolute',
          filter: 'blur(30px)',
        }}
      />

      {/* Fade indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
        position: 'relative',
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: i * 10 < fadeProgress ? t.colors.accent : t.colors.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '12px',
        color: t.colors.textMuted,
        marginBottom: '28px',
        fontWeight: 300,
      }}>
        Sound gently rising · {fadeProgress}%
      </div>

      <motion.div
        style={{
          fontFamily: t.fonts.display,
          fontSize: '56px',
          fontWeight: 700,
          color: t.colors.text,
          lineHeight: 1,
          marginBottom: '8px',
          position: 'relative',
        }}
      >
        {ringingAlarm.time}
      </motion.div>

      <div style={{
        fontFamily: t.fonts.body,
        fontSize: '15px',
        color: t.colors.textSecondary,
        marginBottom: '28px',
        fontWeight: 400,
      }}>
        {ringingAlarm.label}
      </div>

      {ringingAlarm.purpose && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: t.radii.lg,
            padding: '22px 26px',
            marginBottom: '36px',
            maxWidth: '280px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '11px',
            fontWeight: 600,
            color: t.colors.accentLight,
            marginBottom: '8px',
          }}>
            Your intention for today
          </div>
          <div style={{
            fontFamily: t.fonts.display,
            fontSize: '17px',
            fontWeight: 600,
            color: t.colors.text,
            lineHeight: 1.4,
          }}>
            {ringingAlarm.purpose}
          </div>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px', position: 'relative' }}>
        <PillButton onClick={dismissAlarm}>
          I'm Awake ☀
        </PillButton>
        <PillButton variant="secondary" onClick={snoozeAlarm}>
          A little more sleep...
        </PillButton>
      </div>
    </motion.div>
  );
}

function SnoozePickerScreen({ state }) {
  const { confirmSnooze, goBack, SNOOZE_OPTIONS } = state;

  return (
    <motion.div {...softSlide} style={{
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
        fontSize: '26px',
        fontWeight: 700,
        color: t.colors.text,
        marginBottom: '8px',
      }}>
        How long?
      </h2>
      <p style={{
        fontFamily: t.fonts.body,
        fontSize: '14px',
        color: t.colors.textMuted,
        marginBottom: '28px',
        fontWeight: 300,
      }}>
        Pick a snooze duration
      </p>

      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
        {SNOOZE_OPTIONS.map(mins => (
          <motion.button
            key={mins}
            whileTap={{ scale: 0.92 }}
            whileHover={{ y: -4 }}
            onClick={() => confirmSnooze(mins)}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: t.radii.lg,
              background: t.colors.gradient1,
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${t.colors.shadow}`,
            }}
          >
            <span style={{
              fontFamily: t.fonts.display,
              fontSize: '26px',
              fontWeight: 700,
              color: t.colors.text,
            }}>
              {mins}
            </span>
            <span style={{
              fontFamily: t.fonts.body,
              fontSize: '11px',
              color: t.colors.textMuted,
              fontWeight: 400,
            }}>
              min
            </span>
          </motion.button>
        ))}
      </div>

      <PillButton variant="ghost" onClick={goBack}>
        Never mind
      </PillButton>
    </motion.div>
  );
}

function BedtimeReminderScreen({ state }) {
  const { bedtimeSnooze, bedtimeSleep, bedtimeDisable, goHome, notificationsEnabled, setNotificationsEnabled, BEDTIME_SNOOZE_OPTIONS } = state;

  if (!notificationsEnabled) {
    return (
      <motion.div {...softSlide} style={{
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
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: t.colors.gradient1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
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
          Notifications Off
        </h2>
        <p style={{
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textMuted,
          lineHeight: 1.5,
          marginBottom: '28px',
          fontWeight: 300,
        }}>
          Turn on notifications so we can gently remind you when it's bedtime.
        </p>
        <PillButton variant="secondary" onClick={() => setNotificationsEnabled(true)}>
          Enable Notifications
        </PillButton>
        <div style={{ marginTop: '10px', width: '100%' }}>
          <PillButton variant="ghost" onClick={goHome}>
            Go Back
          </PillButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...softSlide} style={{
      height: '100%',
      background: 'linear-gradient(180deg, #1E1040 0%, #2D1865 50%, #4A2080 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
    }}>
      {/* Stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: Math.random() * 2 }}
          style={{
            position: 'absolute',
            top: `${10 + Math.random() * 30}%`,
            left: `${10 + Math.random() * 80}%`,
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: '#fff',
          }}
        />
      ))}

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ fontSize: '52px', marginBottom: '16px' }}
      >
        ☽
      </motion.div>

      <h2 style={{
        fontFamily: t.fonts.display,
        fontSize: '28px',
        fontWeight: 700,
        color: '#F8F5FF',
        marginBottom: '6px',
      }}>
        Time for bed
      </h2>
      <p style={{
        fontFamily: t.fonts.body,
        fontSize: '14px',
        color: 'rgba(248, 245, 255, 0.6)',
        marginBottom: '32px',
        fontWeight: 300,
      }}>
        Alarm set for 6:30 AM
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={bedtimeSleep}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: t.radii.full,
            background: 'rgba(255,255,255,0.95)',
            color: '#2D1865',
            border: 'none',
            fontFamily: t.fonts.display,
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Going to sleep ☁
        </motion.button>

        <div style={{
          fontFamily: t.fonts.body,
          fontSize: '11px',
          color: 'rgba(248, 245, 255, 0.4)',
          marginTop: '8px',
          marginBottom: '4px',
          fontWeight: 400,
        }}>
          Or snooze the reminder
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
                borderRadius: t.radii.full,
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: '#F8F5FF',
                fontFamily: t.fonts.display,
                fontSize: '14px',
                fontWeight: 600,
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
            fontSize: '13px',
            color: 'rgba(248, 245, 255, 0.4)',
            cursor: 'pointer',
            marginTop: '10px',
            fontWeight: 400,
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
            fontSize: '10px',
            color: 'rgba(248, 245, 255, 0.2)',
            cursor: 'pointer',
            marginTop: '4px',
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
        transition={{ type: 'spring', damping: 10, delay: 0.15 }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: t.colors.gradient1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          fontSize: '32px',
        }}
      >
        ✦
      </motion.div>
      <p style={{
        fontFamily: t.fonts.display,
        fontSize: '18px',
        fontWeight: 600,
        color: t.colors.text,
        lineHeight: 1.4,
      }}>
        {feedbackMessage}
      </p>
    </motion.div>
  );
}

export default function V3App({ state }) {
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
