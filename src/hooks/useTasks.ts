import { useCallback } from 'react';
import { Task } from '../utils/storage';
import {
  playCheckSound,
  playUncheckSound,
  playTypewriterSound,
  playCelebrationSound,
} from '../utils/sound';
import confetti from 'canvas-confetti';

interface UseTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentDate: string;
  soundEnabled: boolean;
  onCheckTask?: () => void;
  onAllCompleted?: () => void;
}

export function useTasks({
  tasks,
  setTasks,
  currentDate,
  soundEnabled,
  onCheckTask,
  onAllCompleted,
}: UseTasksProps) {
  const addTask = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        text: trimmed,
        completed: false,
        created_at: Date.now(),
        date: currentDate,
      };

      setTasks(prev => [...prev, newTask]);
      playTypewriterSound(soundEnabled);
    },
    [currentDate, setTasks, soundEnabled]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks(prev => {
        const target = prev.find(t => t.id === id);
        if (!target) return prev;

        const willBeCompleted = !target.completed;
        const updated = prev.map(t =>
          t.id === id
            ? {
                ...t,
                completed: willBeCompleted,
                completed_at: willBeCompleted ? Date.now() : undefined,
              }
            : t
        );

        if (willBeCompleted) {
          playCheckSound(soundEnabled);
          onCheckTask?.();

          // Tiny particle burst near the task
          try {
            confetti({
              particleCount: 18,
              spread: 45,
              origin: { y: 0.65 },
              colors: ['#4a453f', '#7d7468', '#b5a995', '#e2dacb'],
              ticks: 120,
              gravity: 1.2,
              scalar: 0.6,
            });
          } catch (e) {
            // Ignore if canvas confetti not supported in mock
          }

          // Check if all tasks are now completed
          const remainingIncomplete = updated.filter(t => !t.completed);
          if (remainingIncomplete.length === 0 && updated.length > 0) {
            playCelebrationSound(soundEnabled);
            onAllCompleted?.();

            // Bigger celebratory confetti shower
            setTimeout(() => {
              try {
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.5 },
                  colors: ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'],
                  ticks: 200,
                  gravity: 0.9,
                  scalar: 0.8,
                });
              } catch (e) {}
            }, 250);
          }
        } else {
          playUncheckSound(soundEnabled);
        }

        return updated;
      });
    },
    [setTasks, soundEnabled, onCheckTask, onAllCompleted]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      playTypewriterSound(soundEnabled);
    },
    [setTasks, soundEnabled]
  );

  const editTask = useCallback(
    (id: string, newText: string) => {
      const trimmed = newText.trim();
      if (!trimmed) {
        deleteTask(id);
        return;
      }
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, text: trimmed } : t))
      );
      playTypewriterSound(soundEnabled);
    },
    [deleteTask, setTasks, soundEnabled]
  );

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  };
}
