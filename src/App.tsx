import { useEffect, useState } from 'react';
import { Minus, X } from 'lucide-react';

import { Bunny } from './components/Bunny';
import { Progress } from './components/Progress';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { HistoryView } from './components/HistoryView';
import { SettingsPanel } from './components/SettingsPanel';
import { Onboarding } from './components/Onboarding';

import { useDailyReceipt } from './hooks/useDailyReceipt';
import { useBunnyState } from './hooks/useBunnyState';
import { useTasks } from './hooks/useTasks';

import { formatDayHeader } from './utils/dates';
import { closeOrMinimize, minimizeWindow, isTauri } from './utils/native';
import { AppSettings } from './utils/storage';

type NavTab = 'receipt' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('receipt');

  const {
    currentDate,
    tasks,
    setTasks,
    history,
    settings,
    updateSettings,
  } = useDailyReceipt();

  // Show onboarding on first run
  const showOnboarding = !settings.hasSeenOnboarding;

  const handleOnboardingComplete = (partial: Partial<AppSettings>) => {
    updateSettings({ ...partial, hasSeenOnboarding: true });
  };

  const bunny = useBunnyState({
    tasks,
    history,
    userBirthday: settings.userBirthday,
    soundEnabled: settings.soundEffects,
  });

  const { addTask, toggleTask, deleteTask, editTask } = useTasks({
    tasks,
    setTasks,
    currentDate,
    soundEnabled: settings.soundEffects,
    onCheckTask: bunny.triggerTaskBounce,
    onAllCompleted: bunny.triggerTaskBounce,
  });

  // Listen for tray nav-to events (Tauri only)
  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;

    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('nav-to', event => {
        const target = event.payload as NavTab;
        if (target === 'receipt' || target === 'history' || target === 'settings') {
          setActiveTab(target);
        }
      }).then(fn => { unlisten = fn; });
    });

    return () => { unlisten?.(); };
  }, []);

  // Apply paper tint to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-tint', settings.paperTint);
  }, [settings.paperTint]);

  const header = formatDayHeader(currentDate);

  const handleMinimize = () => minimizeWindow();
  const handleClose = () => closeOrMinimize(settings.minimizeToTray);

  return (
    <div className="app-shell">
      {/* Onboarding overlay — shown on first launch */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Frameless title bar */}
      <div className="app-titlebar">
        <span className="app-titlebar-title">🐰 Bunny Receipt</span>
        <div className="app-titlebar-controls">
          <button
            className="titlebar-btn"
            onClick={handleMinimize}
            title="Minimize"
            aria-label="Minimize"
          >
            <Minus size={10} />
          </button>
          <button
            className="titlebar-btn close-btn"
            onClick={handleClose}
            title={settings.minimizeToTray ? 'Minimize to tray' : 'Close'}
            aria-label="Close"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="app-nav" role="tablist" aria-label="Navigation">
        {(['receipt', 'history', 'settings'] as NavTab[]).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'receipt' ? '📋 Today' : tab === 'history' ? '📜 History' : '⚙ Settings'}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      {activeTab === 'receipt' && (
        <div className="receipt-view" role="main">
          {/* Receipt header */}
          <div className="receipt-header">
            <div className="receipt-store-name">Bunny Receipt</div>
            <div className="receipt-tagline">daily task ledger</div>
            <div className="receipt-date-line">
              {header.dayOfWeek} · {header.formattedDate}
            </div>
          </div>

          <div className="receipt-divider">================================</div>

          {/* Greeting */}
          <div className="receipt-label-center">{header.greeting}</div>
          <div className="receipt-label-center" style={{ marginBottom: 4 }}>
            {header.subtitle}
          </div>

          <div className="receipt-divider">- - - - - - - - - - - - - - - -</div>

          {/* Bunny mascot */}
          <Bunny
            mood={bunny.mood}
            isBlinking={bunny.isBlinking}
            isEarWiggling={bunny.isEarWiggling}
            isBouncing={bunny.isBouncing}
            isCelebrating={bunny.isCelebrating}
            text={bunny.text}
            subtext={bunny.subtext}
            hasSpecialEasterEgg={bunny.hasSpecialEasterEgg}
            onPoke={bunny.pokeBunny}
          />

          <div className="receipt-divider">- - - - - - - - - - - - - - - -</div>

          {/* Progress bar */}
          <Progress
            completed={bunny.completed}
            total={bunny.total}
            percentage={bunny.percentage}
          />

          {/* Task list */}
          {tasks.length > 0 && (
            <div className="receipt-tasks-section">
              <div className="receipt-tasks-header">Items</div>
              <div className="receipt-tasks-list">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="receipt-divider">- - - - - - - - - - - - - - - -</div>

          {/* Task input */}
          <TaskInput onAddTask={addTask} />

          {/* Footer */}
          <div className="receipt-footer">
            <div className="receipt-footer-text">
              thank you · come again · 🐰
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <HistoryView history={history} />
      )}

      {activeTab === 'settings' && (
        <SettingsPanel settings={settings} onUpdate={updateSettings} />
      )}
    </div>
  );
}
