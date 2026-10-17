import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayDateString, isBirthdayToday } from '../utils/dates';
import {
  Task,
  DailyReceiptRecord,
  AppSettings,
  loadStoredTasks,
  saveStoredTasks,
  loadHistory,
  archiveDayReceipt,
  loadSettings,
  saveSettings,
  getLastNotificationDate,
  setLastNotificationDate,
} from '../utils/storage';
import { sendMorningNotification, setAlwaysOnTop } from '../utils/native';

export function useDailyReceipt() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks(getTodayDateString()));
  const [history, setHistory] = useState<Record<string, DailyReceiptRecord>>(() => loadHistory());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [viewingHistoryDate, setViewingHistoryDate] = useState<string | null>(null);

  // Sync tasks to local storage whenever tasks change
  useEffect(() => {
    saveStoredTasks(currentDate, tasks);
  }, [currentDate, tasks]);

  // Keep history updated in state and storage
  const refreshHistory = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      if (newSettings.alwaysOnTop !== undefined) {
        setAlwaysOnTop(newSettings.alwaysOnTop);
      }
      return updated;
    });
  }, []);

  // Midnight / Date-change detection
  const currentDateRef = useRef(currentDate);
  const tasksRef = useRef(tasks);
  currentDateRef.current = currentDate;
  tasksRef.current = tasks;

  useEffect(() => {
    const checkDateChange = () => {
      const today = getTodayDateString();
      if (today !== currentDateRef.current) {
        // A new day has started! Archive yesterday's receipt if it had tasks
        if (tasksRef.current.length > 0) {
          archiveDayReceipt(currentDateRef.current, tasksRef.current);
        }
        // Switch to new day with fresh tasks
        setCurrentDate(today);
        setTasks(loadStoredTasks(today));
        refreshHistory();

        // Check if morning notification should be sent for today
        const currentSettings = loadSettings();
        const lastNotif = getLastNotificationDate();
        if (currentSettings.morningNotification && lastNotif !== today) {
          setLastNotificationDate(today);
          const bday = isBirthdayToday(currentSettings.userBirthday);
          if (bday) {
            sendMorningNotification("🐰 Happy Birthday!", "Your birthday receipt is waiting.\nLet's make today special! 🎂");
          } else {
            sendMorningNotification();
          }
        }
      }
    };

    const interval = setInterval(checkDateChange, 30000); // Check every 30s
    window.addEventListener('focus', checkDateChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDateChange);
    };
  }, [refreshHistory]);

  return {
    currentDate,
    tasks,
    setTasks,
    history,
    refreshHistory,
    settings,
    updateSettings,
    viewingHistoryDate,
    setViewingHistoryDate,
  };
}
