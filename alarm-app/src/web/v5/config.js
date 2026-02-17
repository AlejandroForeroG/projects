import { CalendarScreen, SleepScreen, DashboardScreen, FilesScreen } from './screens/index.js';

/**
 * Configuración centralizada de pantallas de la aplicación
 */
export const SCREEN_CONFIG = {
  sleep: {
    component: SleepScreen,
    title: 'Sleep Tracking',
    subtitle: 'Track your snoozing habits and sleep patterns',
  },
  dashboard: {
    component: DashboardScreen,
    title: 'Dashboard',
    subtitle: 'Your sleep health insights at a glance',
  },
  calendar: {
    component: CalendarScreen,
    title: 'Calendar',
    subtitle: 'Manage your alarms in a calendar view',
  },
  files: {
    component: FilesScreen,
    title: 'Files',
    subtitle: 'Access and manage your sleep data files',
  },
};

/**
 * Obtiene el componente de pantalla para una clave dada
 */
export const getScreenComponent = (key) => {
  return SCREEN_CONFIG[key]?.component || null;
};

/**
 * Obtiene el título de pantalla para una clave dada
 */
export const getScreenTitle = (key) => {
  return SCREEN_CONFIG[key]?.title || '';
};

/**
 * Obtiene el subtítulo de pantalla para una clave dada
 */
export const getScreenSubtitle = (key) => {
  return SCREEN_CONFIG[key]?.subtitle || '';
};
