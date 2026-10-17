export interface Task {
  id: string;
  text: string;
  completed: boolean;
  created_at: number;
  completed_at?: number;
  date: string; // YYYY-MM-DD
}

export interface DailyReceiptRecord {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completedCount: number;
  totalCount: number;
  archivedAt: number;
}

export interface AppSettings {
  startWithWindows: boolean;
  minimizeToTray: boolean;
  alwaysOnTop: boolean;
  morningNotification: boolean;
  notificationTime: string; // "08:30"
  soundEffects: boolean;
  userBirthday: string; // "MM-DD" e.g. "10-03"
  hasSeenOnboarding: boolean;
  paperTint: 'classic' | 'warm' | 'parchment' | 'midnight';
}

const STORAGE_KEYS = {
  CURRENT_TASKS: 'bunny_receipt_current_tasks',
  CURRENT_DATE: 'bunny_receipt_current_date',
  HISTORY: 'bunny_receipt_history',
  SETTINGS: 'bunny_receipt_settings',
  LAST_NOTIFICATION_DATE: 'bunny_receipt_last_notif_date',
};

export const DEFAULT_SETTINGS: AppSettings = {
  startWithWindows: false,
  minimizeToTray: true,
  alwaysOnTop: false,
  morningNotification: true,
  notificationTime: "08:30",
  soundEffects: true,
  userBirthday: "",
  hasSeenOnboarding: false,
  paperTint: 'classic',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

export function loadStoredTasks(date: string): Task[] {
  try {
    const storedDate = localStorage.getItem(STORAGE_KEYS.CURRENT_DATE);
    const storedTasksRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_TASKS);

    if (storedDate === date && storedTasksRaw) {
      return JSON.parse(storedTasksRaw);
    }
  } catch (e) {
    console.error("Failed to load tasks", e);
  }
  return [];
}

export function saveStoredTasks(date: string, tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DATE, date);
    localStorage.setItem(STORAGE_KEYS.CURRENT_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks", e);
  }
}

export function loadHistory(): Record<string, DailyReceiptRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load history", e);
  }
  return {};
}

export function saveHistory(history: Record<string, DailyReceiptRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

export function archiveDayReceipt(date: string, tasks: Task[]): void {
  if (!date) return;
  const history = loadHistory();
  const completedCount = tasks.filter(t => t.completed).length;
  history[date] = {
    date,
    tasks,
    completedCount,
    totalCount: tasks.length,
    archivedAt: Date.now()
  };
  saveHistory(history);
}

export function getLastNotificationDate(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION_DATE);
}

export function setLastNotificationDate(dateStr: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION_DATE, dateStr);
}

export function checkHasRepeatedTasks(currentTasks: Task[], history: Record<string, DailyReceiptRecord>): boolean {
  if (currentTasks.length === 0) return false;
  const pastTaskTexts = new Set<string>();
  Object.values(history).forEach(record => {
    record.tasks.forEach(t => pastTaskTexts.add(t.text.trim().toLowerCase()));
  });
  return currentTasks.some(t => pastTaskTexts.has(t.text.trim().toLowerCase()));
}
