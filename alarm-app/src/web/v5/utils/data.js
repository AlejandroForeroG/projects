export function generateSnoozeHistory() {
  const entries = [];
  const reasons = ['Too cozy', 'Rainy day', 'Late night', 'Just 5 more min', 'Cat on lap', 'Bad dream recovery'];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    entries.push({
      id: i,
      date: d,
      count: Math.floor(Math.random() * 5) + 1,
      totalMinutes: Math.floor(Math.random() * 25) + 5,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      alarmTime: `${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM`,
    });
  }
  return entries;
}

export function generateWellbeingData() {
  return {
    score: Math.floor(Math.random() * 30) + 70,
    streak: Math.floor(Math.random() * 12) + 3,
    avgWake: '6:42 AM',
    avgSleep: '7h 18m',
    patterns: [
      { label: 'Mon', value: 85 },
      { label: 'Tue', value: 72 },
      { label: 'Wed', value: 90 },
      { label: 'Thu', value: 68 },
      { label: 'Fri', value: 77 },
      { label: 'Sat', value: 95 },
      { label: 'Sun', value: 88 },
    ],
    tips: [
      { emoji: '🌙', text: 'Your best sleep is on weekends' },
      { emoji: '⚡', text: 'Snoozing less this week — great job!' },
      { emoji: '🎯', text: 'Consistent wake time 5 days in a row' },
    ],
  };
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
