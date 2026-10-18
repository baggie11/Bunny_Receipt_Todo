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
  getStoredDate,
} from '../utils/storage';
import { sendMorningNotification, setAlwaysOnTop } from '../utils/native';

export function useDailyReceipt() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks(getTodayDateString()));
  const [history, setHistory] = useState<Record<string, DailyReceiptRecord>>(() => loadHistory());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [viewingHistoryDate, setViewingHistoryDate] = useState<string | null>(null);
  const [leftoverTasks, setLeftoverTasks] = useState<Task[]>([]);

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

  // Carry over leftover tasks to today
  const carryOverLeftovers = useCallback(() => {
    if (leftoverTasks.length === 0) return;
    const today = getTodayDateString();
    const carriedOver: Task[] = leftoverTasks.map(t => ({
      ...t,
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      completed: false,
      created_at: Date.now(),
      completed_at: undefined,
      date: today,
    }));
    setTasks(prev => [...prev, ...carriedOver]);
    setLeftoverTasks([]);
  }, [leftoverTasks, setTasks]);

  // Dismiss leftover tasks (start fresh)
  const dismissLeftovers = useCallback(() => {
    setLeftoverTasks([]);
  }, []);

  // On mount: handle the case where the app was closed overnight.
  // If the stored date is not today, archive the old day's tasks and
  // compute leftover (incomplete) tasks to offer carry-over.
  useEffect(() => {
    const today = getTodayDateString();
    const storedDate = getStoredDate();

    if (storedDate && storedDate !== today) {
      // Load the old day's tasks from storage
      const oldTasks = loadStoredTasks(storedDate);
      if (oldTasks.length > 0) {
        archiveDayReceipt(storedDate, oldTasks);
        const incomplete = oldTasks.filter(t => !t.completed);
        if (incomplete.length > 0) {
          setLeftoverTasks(incomplete);
        }
      }
      // Clear storage for the new day
      saveStoredTasks(today, []);
      refreshHistory();

      // Send morning notification (with leftover info if applicable)
      const currentSettings = loadSettings();
      const lastNotif = getLastNotificationDate();
      if (currentSettings.morningNotification && lastNotif !== today) {
        setLastNotificationDate(today);
        const incomplete = oldTasks.filter(t => !t.completed);
        const bday = isBirthdayToday(currentSettings.userBirthday);
        if (incomplete.length > 0) {
          sendMorningNotification(
            "Your bunny missed you",
            `You have ${incomplete.length} unfinished task${incomplete.length !== 1 ? 's' : ''} from yesterday.\nLet's pick up where we left off.`
          );
        } else if (bday) {
          sendMorningNotification("Happy Birthday!", "Your birthday receipt is waiting.");
        } else {
          sendMorningNotification();
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // Track unfinished tasks for carry-over offer
          const incomplete = tasksRef.current.filter(t => !t.completed);
          if (incomplete.length > 0) {
            setLeftoverTasks(incomplete);
          }
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
          const incomplete = tasksRef.current.filter(t => !t.completed);
          const bday = isBirthdayToday(currentSettings.userBirthday);
          if (incomplete.length > 0) {
            sendMorningNotification(
              "Your bunny missed you",
              `You have ${incomplete.length} unfinished task${incomplete.length !== 1 ? 's' : ''} from yesterday.\nLet's pick up where we left off.`
            );
          } else if (bday) {
            sendMorningNotification("Happy Birthday!", "Your birthday receipt is waiting.");
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
    leftoverTasks,
    carryOverLeftovers,
    dismissLeftovers,
  };
}
