import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { closeOrMinimize, minimizeWindow, isTauri, showBunnyWalk, hideBunnyWalk } from './utils/native';
import { AppSettings } from './utils/storage';
import { playPrinterSound } from './utils/sound';

type NavTab = 'receipt' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('receipt');
  // Start false — we kick the animation on the first rAF after sound starts
  const [isPrinting, setIsPrinting] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // --- Bunny walk-in inactivity tracking ---
  // Interval is user-configurable via Settings. Cooldown prevents spam.
  const BUNNY_COOLDOWN = 10000; // minimum gap between bunny walks (fixed)

  const lastInteraction = useRef(Date.now());
  const lastBunnyWalk = useRef(0);
  const bunnyShowing = useRef(false);

  const {
    currentDate,
    tasks,
    setTasks,
    history,
    settings,
    updateSettings,
    leftoverTasks,
    carryOverLeftovers,
    dismissLeftovers,
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
    leftoverCount: leftoverTasks.length,
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

  // Printer animation on launch — useLayoutEffect runs synchronously before
  // the browser paints, so the sound starts before any frame is drawn.
  // We then kick the CSS animation on the very next rAF so audio and visual
  // are locked together with no perceptible gap.
  useLayoutEffect(() => {
    playPrinterSound(settings.soundEffects);
    const raf = requestAnimationFrame(() => {
      setIsPrinting(true);
    });
    const timer = setTimeout(() => setIsPrinting(false), 1500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reprint when window is restored from hidden (tray/minimized).
  // visibilitychange fires on genuine hide→show transitions, NOT on window drag.
  useEffect(() => {
    let wasHidden = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
      } else if (document.visibilityState === 'visible' && wasHidden) {
        wasHidden = false;
        playPrinterSound(settings.soundEffects);
        requestAnimationFrame(() => {
          setIsPrinting(true);
          setTimeout(() => setIsPrinting(false), 1500);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.soundEffects]);

  // Apply paper tint to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-tint', settings.paperTint);
  }, [settings.paperTint]);

  // --- Inactivity: reset timer on actual user interaction ---
  useEffect(() => {
    const resetInteraction = () => {
      if (bunnyShowing.current) {
        // User came back — dismiss the bunny
        hideBunnyWalk();
        bunnyShowing.current = false;
      }
      lastInteraction.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = [
      'mousedown', 'keydown', 'click', 'touchstart', 'wheel',
    ];
    events.forEach(e => window.addEventListener(e, resetInteraction, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInteraction));
    };
  }, []);

  // --- Poll for inactivity and trigger the bunny walk ---
  useEffect(() => {
    if (!isTauri()) return; // only works in Tauri (needs the separate window)
    if (!settings.bunnyWalkEnabled) return;

    const idleThresholdMs = settings.bunnyWalkInterval * 1000;

    const checkIdle = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastInteraction.current;
      const cooldownTime = now - lastBunnyWalk.current;

      if (
        idleTime > idleThresholdMs &&
        !bunnyShowing.current &&
        cooldownTime > BUNNY_COOLDOWN
      ) {
        bunnyShowing.current = true;
        lastBunnyWalk.current = now;
        showBunnyWalk();
        // The bunny walks out after ~6s — reset the flag after that
        setTimeout(() => {
          bunnyShowing.current = false;
        }, 7000);
      }
    }, 500);

    return () => clearInterval(checkIdle);
  }, [settings.bunnyWalkEnabled, settings.bunnyWalkInterval]);

  const header = formatDayHeader(currentDate);

  const handleMinimize = () => minimizeWindow();
  const handleClose = () => closeOrMinimize(settings.minimizeToTray);

  return (
    <div ref={shellRef} className={`app-shell${isPrinting ? ' printing' : ''}`}>
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
            {tab === 'receipt' ? 'Today' : tab === 'history' ? 'History' : 'Settings'}
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

          {/* Leftover tasks from yesterday */}
          {leftoverTasks.length > 0 && (
            <div className="leftover-banner">
              <div className="leftover-banner-header">
                <span className="leftover-banner-title">Yesterday's Unfinished</span>
                <span className="leftover-banner-count">
                  {leftoverTasks.length} task{leftoverTasks.length !== 1 ? 's' : ''} left over
                </span>
              </div>
              <div className="leftover-banner-tasks">
                {leftoverTasks.map(task => (
                  <div key={task.id} className="leftover-task-row">
                    <span className="leftover-task-dot">[ ]</span>
                    <span className="leftover-task-text">{task.text}</span>
                  </div>
                ))}
              </div>
              <div className="leftover-banner-actions">
                <button className="leftover-carry-btn" onClick={carryOverLeftovers}>
                  Carry Over
                </button>
                <button className="leftover-dismiss-btn" onClick={dismissLeftovers}>
                  Start Fresh
                </button>
              </div>
            </div>
          )}

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
