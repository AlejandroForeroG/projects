import { useState, useCallback } from 'react';
import { addSnoozeEvent, addComplianceEvent } from './cloudStore';

const DEFAULT_ALARMS = [
  {
    id: '1',
    time: '06:30',
    label: 'Morning routine',
    purpose: 'Start the day with intention — stretch, breathe, hydrate.',
    enabled: true,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    progressive: false,
    progressiveMinutesBefore: 5,
    ringtone: 'Sunrise Chime',
    priority: 'normal',
    color: '#FF6B5A',
    action: null,
    longSwipeEnabled: false,
  },
  {
    id: '2',
    time: '07:15',
    label: 'Get ready',
    purpose: 'Time to prepare for the day ahead. No rush.',
    enabled: true,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    progressive: true,
    progressiveMinutesBefore: 10,
    ringtone: 'Gentle Waves',
    priority: 'high',
    color: '#2CCCA0',
    action: null,
    longSwipeEnabled: false,
  },
  {
    id: '3',
    time: '09:00',
    label: 'Weekend gentle wake',
    purpose: 'A calm start to a free day. What do you want today?',
    enabled: false,
    days: ['Sat', 'Sun'],
    progressive: true,
    progressiveMinutesBefore: 15,
    ringtone: 'Bird Song',
    priority: 'low',
    color: '#8B7FE8',
    action: { type: 'call', label: 'Call Mom' },
    longSwipeEnabled: true,
  },
];

export const RINGTONES = [
  'Sunrise Chime',
  'Gentle Waves',
  'Bird Song',
  'Soft Piano',
  'Wind Bells',
  'Morning Dew',
  'Classic Buzz',
];

const PURPOSE_TEMPLATES = [
  { id: 't1', emoji: '🧘', text: 'Start with calm — breathe and stretch before anything else.' },
  { id: 't2', emoji: '💧', text: 'Hydrate first. A glass of water before screens.' },
  { id: 't3', emoji: '🌅', text: 'Watch the morning light. No phone for 10 minutes.' },
  { id: 't4', emoji: '📝', text: 'Write down one thing you\'re grateful for today.' },
  { id: 't5', emoji: '🏃', text: 'Move your body. A short walk or stretch session.' },
  { id: 't6', emoji: '☕', text: 'Make your favorite morning drink mindfully.' },
  { id: 't7', emoji: '🎵', text: 'Listen to something that lifts your mood.' },
  { id: 't8', emoji: '🧠', text: 'Set one clear intention for today.' },
];

const SNOOZE_OPTIONS = [5, 10, 15];
const BEDTIME_SNOOZE_OPTIONS = [15, 30, 60];

export const SCREENS = {
  HOME: 'home',
  CREATE_EDIT: 'create_edit',
  PURPOSE_EDITOR: 'purpose_editor',
  ALARM_RINGING: 'alarm_ringing',
  SNOOZE_PICKER: 'snooze_picker',
  BEDTIME_REMINDER: 'bedtime_reminder',
  FEEDBACK: 'feedback',
  EXTRAS: 'extras',
  // Tab sections
  TAB_SLEEP: 'tab_sleep',
  TAB_MORNING: 'tab_morning',
  TAB_TOOLS: 'tab_tools',
  // Extras sub-screens
  EXTRAS_BEDTIME: 'extras_bedtime',
  EXTRAS_FOCUS: 'extras_focus',
  EXTRAS_MOTIVATIONAL: 'extras_motivational',
  EXTRAS_BRIEFING: 'extras_briefing',
  EXTRAS_SLEEP_SUGGEST: 'extras_sleep_suggest',
  EXTRAS_SLEEP_CALC: 'extras_sleep_calc',
  EXTRAS_SMART_SNOOZE: 'extras_smart_snooze',
  GOOD_MORNING: 'good_morning',
  GOOD_MORNING_SETTINGS: 'good_morning_settings',
};

export const ALARM_ACTIONS = [
  { type: 'call', label: 'Call someone', icon: '📞' },
  { type: 'task', label: 'Start a task', icon: '📋' },
  { type: 'open_app', label: 'Open app', icon: '📱' },
  { type: 'message', label: 'Send message', icon: '💬' },
];

export const GOOD_MORNING_ACTIONS = [
  { id: 'work_route', label: 'Work Route', icon: '🗺️', description: 'Check commute & traffic', simTitle: 'Route to Work', simDetail: '25 min via I-95 N — Light traffic' },
  { id: 'open_app', label: 'Open App', icon: '📱', description: 'Launch a favorite app', simTitle: 'Opening Spotify', simDetail: 'Your Daily Mix is ready' },
  { id: 'calendar', label: 'Calendar', icon: '📅', description: 'See today\'s schedule', simTitle: 'Today\'s Agenda', simDetail: '3 events — first at 9:00 AM' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#8B7FE8' },
  { value: 'normal', label: 'Normal', color: '#2CCCA0' },
  { value: 'high', label: 'High', color: '#FF6B5A' },
  { value: 'critical', label: 'Critical', color: '#E04535' },
];

export const ALARM_COLORS = [
  '#FF6B5A', '#2CCCA0', '#8B7FE8', '#FFD54F', '#FF8A65', '#4DB6AC', '#7986CB', '#AED581',
];

export function useAlarmState() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [alarms, setAlarms] = useState(DEFAULT_ALARMS);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [screenHistory, setScreenHistory] = useState([]);

  // Bedtime config state
  const [bedtimeEnabled, setBedtimeEnabled] = useState(true);
  const [bedtimeTime, setBedtimeTime] = useState('22:30');
  const [bedtimeDays, setBedtimeDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun']);

  // Focus Mode (M12)
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [focusPermissionGranted, setFocusPermissionGranted] = useState(false);
  const [blockedApps, setBlockedApps] = useState(['Instagram', 'TikTok', 'Twitter/X']);

  // Morning Briefing (M13)
  const [briefingEnabled, setBriefingEnabled] = useState(false);
  const [briefingSources, setBriefingSources] = useState({
    agenda: true,
    weather: true,
    traffic: false,
    news: false,
  });

  // Good Morning Actions
  const [goodMorningActions, setGoodMorningActions] = useState(['work_route', 'calendar']);

  // Smart Snooze GPS (M9)
  const [smartSnoozeEnabled, setSmartSnoozeEnabled] = useState(false);
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState(false);
  const [smartSnoozeLocation, setSmartSnoozeLocation] = useState({ name: 'Home', lat: 40.7128, lng: -74.006 });

  const navigate = useCallback((newScreen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(newScreen);
  }, [screen]);

  const goBack = useCallback(() => {
    setScreenHistory(prev => {
      const newHistory = [...prev];
      const previous = newHistory.pop();
      if (previous) {
        setScreen(previous);
      }
      return newHistory;
    });
  }, []);

  const goHome = useCallback(() => {
    setScreenHistory([]);
    setScreen(SCREENS.HOME);
  }, []);

  const createNewAlarm = useCallback(() => {
    const newAlarm = {
      id: Date.now().toString(),
      time: '07:00',
      label: '',
      purpose: '',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      progressive: false,
      progressiveMinutesBefore: 5,
      ringtone: 'Sunrise Chime',
      priority: 'normal',
      color: '#FF6B5A',
      action: null,
      longSwipeEnabled: false,
    };
    setEditingAlarm(newAlarm);
    navigate(SCREENS.CREATE_EDIT);
  }, [navigate]);

  const editAlarm = useCallback((alarm) => {
    setEditingAlarm({
      progressive: false,
      progressiveMinutesBefore: 5,
      ringtone: 'Sunrise Chime',
      priority: 'normal',
      color: '#FF6B5A',
      action: null,
      longSwipeEnabled: false,
      ...alarm,
    });
    navigate(SCREENS.CREATE_EDIT);
  }, [navigate]);

  const saveAlarm = useCallback(() => {
    if (!editingAlarm) return;
    setAlarms(prev => {
      const exists = prev.find(a => a.id === editingAlarm.id);
      if (exists) {
        return prev.map(a => a.id === editingAlarm.id ? editingAlarm : a);
      }
      return [...prev, editingAlarm];
    });
    setEditingAlarm(null);
    goHome();
  }, [editingAlarm, goHome]);

  const deleteAlarm = useCallback((id) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id) => {
    setAlarms(prev => prev.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  }, []);

  const simulateAlarm = useCallback((alarm) => {
    const target = alarm || alarms.find(a => a.enabled) || alarms[0];
    setRingingAlarm(target);
    setFadeProgress(0);
    navigate(SCREENS.ALARM_RINGING);

    const isProgressive = target.progressive;
    const speed = isProgressive ? 200 : 100;
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
      }
      setFadeProgress(progress);
    }, speed);
  }, [alarms, navigate]);

  const dismissAlarm = useCallback(() => {
    if (ringingAlarm) {
      addComplianceEvent({
        alarmId: ringingAlarm.id,
        alarmLabel: ringingAlarm.label,
        alarmTime: ringingAlarm.time,
        status: 'completed',
      });
    }
    // Show Good Morning screen if briefing or actions are configured
    if (briefingEnabled || goodMorningActions.length > 0) {
      navigate(SCREENS.GOOD_MORNING);
    } else {
      setFeedbackMessage('Alarm dismissed. Have a wonderful morning.');
      navigate(SCREENS.FEEDBACK);
      setTimeout(() => goHome(), 2000);
    }
  }, [navigate, goHome, ringingAlarm, briefingEnabled, goodMorningActions]);

  const snoozeAlarm = useCallback(() => {
    navigate(SCREENS.SNOOZE_PICKER);
  }, [navigate]);

  const confirmSnooze = useCallback((minutes) => {
    if (ringingAlarm) {
      addSnoozeEvent({
        alarmId: ringingAlarm.id,
        alarmLabel: ringingAlarm.label,
        alarmTime: ringingAlarm.time,
        snoozeDuration: minutes,
      });
      addComplianceEvent({
        alarmId: ringingAlarm.id,
        alarmLabel: ringingAlarm.label,
        alarmTime: ringingAlarm.time,
        status: 'snoozed',
        snoozeDuration: minutes,
      });
    }
    setFeedbackMessage(`Snoozed for ${minutes} minutes. Rest a little more.`);
    navigate(SCREENS.FEEDBACK);
    setTimeout(() => goHome(), 2000);
  }, [navigate, goHome, ringingAlarm]);

  const openBedtimeReminder = useCallback(() => {
    navigate(SCREENS.BEDTIME_REMINDER);
  }, [navigate]);

  const bedtimeSnooze = useCallback((minutes) => {
    setFeedbackMessage(`Reminder snoozed for ${minutes} minutes.`);
    navigate(SCREENS.FEEDBACK);
    setTimeout(() => goHome(), 2000);
  }, [navigate, goHome]);

  const bedtimeSleep = useCallback(() => {
    setFeedbackMessage('Good night. Sleep well.');
    navigate(SCREENS.FEEDBACK);
    setTimeout(() => goHome(), 2000);
  }, [navigate, goHome]);

  const bedtimeDisable = useCallback(() => {
    setFeedbackMessage('Bedtime reminder disabled for today.');
    navigate(SCREENS.FEEDBACK);
    setTimeout(() => goHome(), 2000);
  }, [navigate, goHome]);

  const openPurposeEditor = useCallback(() => {
    navigate(SCREENS.PURPOSE_EDITOR);
  }, [navigate]);

  const savePurpose = useCallback((purpose) => {
    setEditingAlarm(prev => ({ ...prev, purpose }));
    goBack();
  }, [goBack]);

  const updateEditingAlarm = useCallback((updates) => {
    setEditingAlarm(prev => ({ ...prev, ...updates }));
  }, []);

  const navigateExtras = useCallback(() => {
    setScreenHistory([]);
    setScreen(SCREENS.EXTRAS);
  }, []);

  const navigateSleep = useCallback(() => {
    setScreenHistory([]);
    setScreen(SCREENS.TAB_SLEEP);
  }, []);

  const navigateMorning = useCallback(() => {
    setScreenHistory([]);
    setScreen(SCREENS.TAB_MORNING);
  }, []);

  const navigateTools = useCallback(() => {
    setScreenHistory([]);
    setScreen(SCREENS.TAB_TOOLS);
  }, []);

  return {
    screen,
    alarms,
    editingAlarm,
    ringingAlarm,
    feedbackMessage,
    notificationsEnabled,
    fadeProgress,
    navigate,
    goBack,
    goHome,
    createNewAlarm,
    editAlarm,
    saveAlarm,
    deleteAlarm,
    toggleAlarm,
    simulateAlarm,
    dismissAlarm,
    snoozeAlarm,
    confirmSnooze,
    openBedtimeReminder,
    bedtimeSnooze,
    bedtimeSleep,
    bedtimeDisable,
    openPurposeEditor,
    savePurpose,
    updateEditingAlarm,
    setNotificationsEnabled,
    navigateExtras,
    navigateSleep,
    navigateMorning,
    navigateTools,
    bedtimeEnabled,
    setBedtimeEnabled,
    bedtimeTime,
    setBedtimeTime,
    bedtimeDays,
    setBedtimeDays,
    PURPOSE_TEMPLATES,
    SNOOZE_OPTIONS,
    BEDTIME_SNOOZE_OPTIONS,
    RINGTONES,
    // Focus Mode
    focusModeEnabled, setFocusModeEnabled,
    focusPermissionGranted, setFocusPermissionGranted,
    blockedApps, setBlockedApps,
    // Morning Briefing
    briefingEnabled, setBriefingEnabled,
    briefingSources, setBriefingSources,
    // Smart Snooze GPS
    smartSnoozeEnabled, setSmartSnoozeEnabled,
    gpsPermissionGranted, setGpsPermissionGranted,
    smartSnoozeLocation, setSmartSnoozeLocation,
    // Good Morning Actions
    goodMorningActions, setGoodMorningActions,
  };
}
