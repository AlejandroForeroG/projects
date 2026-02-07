import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { DAYS, MONTHS } from '../constants.js';
import { tileHeader, bodyText } from '../styles.js';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/data.js';
import { DecoShape, Tile, ModalOverlay, Field, PillButton } from '../components/index.js';

export default function CalendarScreen({ state }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [editAlarm, setEditAlarm] = useState(null);
  const [formLabel, setFormLabel] = useState('');
  const [formTime, setFormTime] = useState('07:00');
  const [formRepeat, setFormRepeat] = useState('Daily');

  const alarms = state?.alarms || [
    { id: 1, time: '06:30', label: 'Morning Run', enabled: true, days: [1, 2, 3, 4, 5] },
    { id: 2, time: '07:15', label: 'Work Alarm', enabled: true, days: [1, 2, 3, 4, 5] },
    { id: 3, time: '09:00', label: 'Weekend Brunch', enabled: false, days: [0, 6] },
    { id: 4, time: '22:00', label: 'Wind Down', enabled: true, days: [0, 1, 2, 3, 4, 5, 6] },
  ];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const alarmsForDay = useMemo(() => {
    const dayOfWeek = new Date(viewYear, viewMonth, selectedDay).getDay();
    return alarms.filter(a => a.days && a.days.includes(dayOfWeek));
  }, [selectedDay, viewMonth, viewYear, alarms]);

  function openCreate() {
    setEditAlarm(null);
    setFormLabel('');
    setFormTime('07:00');
    setFormRepeat('Daily');
    setModalOpen(true);
  }

  function openEdit(alarm) {
    setEditAlarm(alarm);
    setFormLabel(alarm.label);
    setFormTime(alarm.time);
    setFormRepeat('Daily');
    setModalOpen(true);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto auto auto',
        gap: t.spacing.md,
        width: '100%',
      }}>
        {/* Large calendar tile — spans 3 cols, 2 rows */}
        <Tile span="1 / span 3" rowSpan="1 / span 2" delay={0}>
          <DecoShape shape="circle" size={80} color={t.colors.purpleLight} top={-25} right={-20} opacity={0.35} />
          <DecoShape shape="diamond" size={20} color={t.colors.yellow} bottom={12} right={16} opacity={0.6} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
              <div style={tileHeader}>
                <span style={{ fontSize: '24px' }}>📅</span>
                {MONTHS[viewMonth]} {viewYear}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={prevMonth} style={{ background: t.colors.bg, border: t.chunkyBorder, borderRadius: t.radii.full, width: 32, height: 32, cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◀</motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={nextMonth} style={{ background: t.colors.bg, border: t.chunkyBorder, borderRadius: t.radii.full, width: 32, height: 32, cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</motion.button>
              </div>
            </div>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '11px', color: t.colors.textMuted, textAlign: 'center', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = day === selectedDay;
                const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
                const hasAlarm = alarms.some(a => a.days && a.days.includes(dayOfWeek) && a.enabled);
                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: t.radii.sm,
                      cursor: 'pointer',
                      background: isSelected ? t.colors.accent : isToday ? t.colors.yellowLight : 'transparent',
                      border: isSelected ? t.chunkyBorder : isToday ? `2px solid ${t.colors.yellow}` : '2px solid transparent',
                      boxShadow: isSelected ? t.chunkyShadowSm : 'none',
                      fontFamily: t.fonts.display,
                      fontWeight: isSelected || isToday ? 700 : 500,
                      fontSize: '14px',
                      color: isSelected ? t.colors.white : t.colors.text,
                      position: 'relative',
                    }}
                  >
                    {day}
                    {hasAlarm && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: isSelected ? t.colors.white : t.colors.teal,
                        marginTop: 2,
                      }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Tile>

        {/* Alarm list tile — right column, spans 2 rows */}
        <Tile span="4 / span 1" rowSpan="1 / span 2" delay={0.1} style={{ display: 'flex', flexDirection: 'column' }}>
          <DecoShape shape="square" size={35} color={t.colors.tealLight} top={-10} right={-10} opacity={0.5} />
          <div style={{ ...tileHeader, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            Alarms for Day {selectedDay}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
            {alarmsForDay.length === 0 ? (
              <div style={{ ...bodyText, textAlign: 'center', padding: t.spacing.lg, color: t.colors.textMuted }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>😴</div>
                No alarms this day
              </div>
            ) : (
              alarmsForDay.map((alarm, i) => (
                <motion.div
                  key={alarm.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4, background: t.colors.bg }}
                  onClick={() => openEdit(alarm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: t.radii.sm,
                    border: `2px solid ${t.colors.border}`,
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '18px', color: t.colors.text }}>{alarm.time}</div>
                    <div style={{ fontFamily: t.fonts.body, fontSize: '13px', color: t.colors.textSecondary }}>{alarm.label}</div>
                  </div>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: alarm.enabled ? t.colors.teal : t.colors.disabled,
                    border: t.chunkyBorder,
                  }} />
                </motion.div>
              ))
            )}
          </div>
        </Tile>

        {/* Stats mini tile */}
        <Tile span="1 / span 1" delay={0.2}>
          <DecoShape shape="circle" size={50} color={t.colors.yellowLight} top={-15} left={-15} opacity={0.5} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🔔</div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '28px', color: t.colors.accent }}>{alarms.filter(a => a.enabled).length}</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Active Alarms</div>
          </div>
        </Tile>

        {/* Next alarm tile */}
        <Tile span="2 / span 1" delay={0.25}>
          <DecoShape shape="diamond" size={25} color={t.colors.accentLight} top={8} right={8} opacity={0.5} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>⏳</div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.purple }}>06:30 AM</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Next Alarm</div>
          </div>
        </Tile>

        {/* Upcoming summary */}
        <Tile span="3 / span 1" delay={0.3}>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>📊</div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '20px', color: t.colors.teal }}>5 days</div>
            <div style={{ fontFamily: t.fonts.body, fontSize: '12px', color: t.colors.textMuted }}>Wake Streak</div>
          </div>
        </Tile>

        {/* Create new tile */}
        <Tile span="4 / span 1" delay={0.35} onClick={openCreate} style={{ cursor: 'pointer', background: t.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '32px', color: t.colors.white }}>+</div>
            <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.white }}>New Alarm</div>
          </div>
        </Tile>
      </div>

      {/* Create/Edit Modal */}
      <ModalOverlay open={modalOpen} onClose={() => setModalOpen(false)} title={editAlarm ? 'Edit Alarm' : 'New Alarm'}>
        <Field label="Label" value={formLabel} onChange={setFormLabel} />
        <Field label="Time" value={formTime} onChange={setFormTime} type="time" />
        <Field label="Repeat" value={formRepeat} onChange={setFormRepeat} options={['Daily', 'Weekdays', 'Weekends', 'Once']} />
        <div style={{ marginTop: t.spacing.md, display: 'flex', gap: '12px' }}>
          <PillButton label={editAlarm ? 'Save Changes' : 'Create Alarm'} onClick={() => setModalOpen(false)} />
          {editAlarm && <PillButton label="Delete" color={t.colors.bg} textColor={t.colors.accentDark} onClick={() => setModalOpen(false)} small />}
        </div>
      </ModalOverlay>
    </>
  );
}
