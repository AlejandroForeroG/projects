import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';
import { NAV_ITEMS } from './constants.js';
import { DecoShape } from './components/index.js';
import { CalendarScreen, SnoozeScreen, WellbeingScreen, SettingsScreen } from './screens/index.js';

// ── Ensure fonts are loaded ─────────────────────────────────────────
import './constants.js';

const SCREEN_MAP = {
  calendar: CalendarScreen,
  snooze: SnoozeScreen,
  wellbeing: WellbeingScreen,
  settings: SettingsScreen,
};

const TITLES = {
  calendar: 'Schedule',
  snooze: 'Snooze History',
  wellbeing: 'Wellbeing',
  settings: 'Bedtime Settings',
};

const SUBTITLES = {
  calendar: 'Manage your alarms in a bento calendar view',
  snooze: 'Track your snoozing habits over time',
  wellbeing: 'Your sleep health at a glance',
  settings: 'Configure your bedtime routine',
};

export default function FloatingBentoV5({ state = {} }) {
  const [activeTab, setActiveTab] = useState('calendar');

  const ActiveScreen = SCREEN_MAP[activeTab];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: t.colors.bg,
      fontFamily: t.fonts.body,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative shapes */}
      <DecoShape shape="circle" size={250} color={t.colors.accentLight} top={-80} right={-60} opacity={0.08} />
      <DecoShape shape="circle" size={180} color={t.colors.purpleLight} bottom={-60} left={-40} opacity={0.1} />
      <DecoShape shape="square" size={120} color={t.colors.yellowLight} top={'40%'} right={-30} opacity={0.08} />
      <DecoShape shape="diamond" size={80} color={t.colors.tealLight} top={'25%'} left={-20} opacity={0.1} />

      {/* Floating pill navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: `${t.spacing.lg} ${t.spacing.md} ${t.spacing.sm}`,
        position: 'relative',
        zIndex: 100,
      }}>
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: t.colors.surface,
            border: t.chunkyBorder,
            borderRadius: t.radii.full,
            padding: '6px 8px',
            boxShadow: t.chunkyShadow,
          }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.key;
            return (
              <motion.button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: isActive ? '10px 22px' : '10px 16px',
                  borderRadius: t.radii.full,
                  border: isActive ? t.chunkyBorder : '3px solid transparent',
                  background: isActive ? t.colors.accent : 'transparent',
                  color: isActive ? t.colors.white : t.colors.textSecondary,
                  fontFamily: t.fonts.display,
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: isActive ? t.chunkyShadowSm : 'none',
                  transition: 'background 0.2s, color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                {isActive && <span>{item.label}</span>}
              </motion.button>
            );
          })}
        </motion.nav>
      </div>

      {/* Page title */}
      <div style={{
        textAlign: 'center',
        padding: `${t.spacing.sm} ${t.spacing.md} ${t.spacing.md}`,
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.h1
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: '28px',
            color: t.colors.text,
            margin: 0,
          }}
        >
          {NAV_ITEMS.find(n => n.key === activeTab)?.emoji}{' '}
          {TITLES[activeTab]}
        </motion.h1>
        <motion.p
          key={activeTab + '-sub'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: t.fonts.body,
            fontSize: '15px',
            color: t.colors.textMuted,
            margin: '4px 0 0',
          }}
        >
          {SUBTITLES[activeTab]}
        </motion.p>
      </div>

      {/* Content area */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: `0 ${t.spacing.lg} ${t.spacing.xxl}`,
        position: 'relative',
        zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveScreen state={state} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
