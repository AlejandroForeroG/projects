// Shared "cloud" store — localStorage-backed cross-platform data
// Simulates sync between Mobile and Web without a real backend

const STORE_KEY = 'alarm-app-cloud';

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getDefaults() {
  return {
    // Shared alarms (synced between mobile & web)
    sharedAlarms: [],
    // Motivational post-its (created in Web W2, shown in Mobile M6)
    postIts: [
      { id: 'p1', text: 'You are capable of amazing things.', color: '#FF6B5A', tags: ['motivation'], createdAt: '2026-01-15T08:00:00Z' },
      { id: 'p2', text: 'Today is a fresh start. Make it count.', color: '#2CCCA0', tags: ['morning'], createdAt: '2026-01-20T09:00:00Z' },
      { id: 'p3', text: 'Small steps lead to big changes.', color: '#8B7FE8', tags: ['motivation'], createdAt: '2026-02-01T10:00:00Z' },
      { id: 'p4', text: 'Meeting at 9 AM - prepare slide deck', color: '#FFD54F', tags: ['agenda'], createdAt: '2026-02-05T07:00:00Z', link: 'https://docs.example.com/slides' },
      { id: 'p5', text: 'Call dentist to reschedule appointment', color: '#FF6B5A', tags: ['agenda'], createdAt: '2026-02-06T11:00:00Z' },
    ],
    // Snooze events (from Mobile ring flow → Web analytics W3/W4)
    snoozeEvents: [],
    // Compliance data (what completed vs postponed)
    complianceEvents: [],
    // Sync metadata
    lastSync: new Date().toISOString(),
    syncConflicts: 0,
    connectedDevices: [
      { id: 'd1', name: 'iPhone 15 Pro', platform: 'mobile', lastSeen: '2026-02-07T08:30:00Z' },
      { id: 'd2', name: 'MacBook Pro', platform: 'web', lastSeen: '2026-02-07T08:45:00Z' },
    ],
    // Cloud backup
    backupStatus: { lastBackup: '2026-02-07T03:00:00Z', size: '2.4 MB', autoEnabled: true },
    // User profile
    profile: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar: null,
      timezone: 'America/New_York',
      language: 'en',
      wakeGoal: '06:30',
      sleepGoal: '22:30',
    },
    // Rules (W6)
    rules: [
      { id: 'r1', name: 'Early meeting shift', condition: 'Meeting before 9 AM', action: 'Move alarm 15 min earlier', enabled: true },
      { id: 'r2', name: 'Weekend sleep-in', condition: 'Saturday or Sunday', action: 'Delay alarm 1 hour', enabled: false },
    ],
    // Home automation (W13)
    homeAutomation: {
      connected: false,
      bridge: null,
      lights: [],
      wakeRamp: { enabled: false, duration: 15, startColor: '#FF6B5A', endColor: '#FFD54F' },
    },
    // Routines (W10)
    routines: [
      { id: 'rt1', name: 'Morning Workout', steps: ['Wake up', 'Stretch 5min', 'Run 20min', 'Shower'], imported: true },
      { id: 'rt2', name: 'Evening Wind-down', steps: ['No screens', 'Read 15min', 'Meditate 10min', 'Sleep'], imported: true },
    ],
  };
}

export function getCloudStore() {
  const existing = load();
  if (existing) return existing;
  const defaults = getDefaults();
  save(defaults);
  return defaults;
}

export function updateCloudStore(updates) {
  const current = getCloudStore();
  const updated = { ...current, ...updates, lastSync: new Date().toISOString() };
  save(updated);
  return updated;
}

export function addPostIt(postIt) {
  const store = getCloudStore();
  store.postIts = [...store.postIts, { ...postIt, id: 'p' + Date.now(), createdAt: new Date().toISOString() }];
  save(store);
  return store;
}

export function removePostIt(id) {
  const store = getCloudStore();
  store.postIts = store.postIts.filter(p => p.id !== id);
  save(store);
  return store;
}

export function addSnoozeEvent(event) {
  const store = getCloudStore();
  store.snoozeEvents = [...store.snoozeEvents, { ...event, id: 'se' + Date.now(), timestamp: new Date().toISOString() }];
  save(store);
  return store;
}

export function addComplianceEvent(event) {
  const store = getCloudStore();
  store.complianceEvents = [...store.complianceEvents, { ...event, id: 'ce' + Date.now(), timestamp: new Date().toISOString() }];
  save(store);
  return store;
}

export function addRule(rule) {
  const store = getCloudStore();
  store.rules = [...store.rules, { ...rule, id: 'r' + Date.now() }];
  save(store);
  return store;
}

export function updateRule(id, updates) {
  const store = getCloudStore();
  store.rules = store.rules.map(r => r.id === id ? { ...r, ...updates } : r);
  save(store);
  return store;
}

export function deleteRule(id) {
  const store = getCloudStore();
  store.rules = store.rules.filter(r => r.id !== id);
  save(store);
  return store;
}

export function updateProfile(updates) {
  const store = getCloudStore();
  store.profile = { ...store.profile, ...updates };
  save(store);
  return store;
}

export function addRoutine(routine) {
  const store = getCloudStore();
  store.routines = [...store.routines, { ...routine, id: 'rt' + Date.now(), imported: true }];
  save(store);
  return store;
}

export function resetCloudStore() {
  const defaults = getDefaults();
  save(defaults);
  return defaults;
}
