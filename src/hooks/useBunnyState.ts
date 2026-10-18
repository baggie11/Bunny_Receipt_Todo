import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, DailyReceiptRecord } from '../utils/storage';
import { getBunnyState, BunnyStateResult } from '../utils/bunnyState';
import { isBirthdayToday, isEarlyCompletion } from '../utils/dates';
import { checkHasRepeatedTasks } from '../utils/storage';
import { playBunnyPokeSound } from '../utils/sound';

interface UseBunnyStateProps {
  tasks: Task[];
  history: Record<string, DailyReceiptRecord>;
  userBirthday?: string;
  soundEnabled?: boolean;
  leftoverCount?: number;
}

export function useBunnyState({
  tasks,
  history,
  userBirthday,
  soundEnabled = true,
  leftoverCount = 0,
}: UseBunnyStateProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isEarWiggling, setIsEarWiggling] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  const isBirthday = useMemo(() => isBirthdayToday(userBirthday), [userBirthday]);
  const isEarly = useMemo(() => isEarlyCompletion() && total > 0 && completed === total, [total, completed]);
  const hasRepeated = useMemo(() => checkHasRepeatedTasks(tasks, history), [tasks, history]);

  const bunnyState: BunnyStateResult = useMemo(() => {
    return getBunnyState(completed, total, {
      isBirthday,
      isEarly,
      hasRepeatedTasks: hasRepeated,
      leftoverCount,
    });
  }, [completed, total, isBirthday, isEarly, hasRepeated]);

  // Periodic subtle blinking animation (every 3 to 6 seconds)
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3500;
      blinkTimeout = setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (isMounted) {
            setIsBlinking(false);
            scheduleBlink();
          }
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Periodic ear wiggle (every 4 to 8 seconds)
  useEffect(() => {
    let wiggleTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleWiggle = () => {
      const delay = 4000 + Math.random() * 4000;
      wiggleTimeout = setTimeout(() => {
        if (!isMounted) return;
        setIsEarWiggling(true);
        setTimeout(() => {
          if (isMounted) {
            setIsEarWiggling(false);
            scheduleWiggle();
          }
        }, 400);
      }, delay);
    };

    scheduleWiggle();
    return () => {
      isMounted = false;
      clearTimeout(wiggleTimeout);
    };
  }, []);

  // Trigger bounce on task completion
  const triggerTaskBounce = useCallback(() => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 600);
  }, []);

  // User poking / clicking the bunny
  const pokeBunny = useCallback(() => {
    setIsBouncing(true);
    setIsEarWiggling(true);
    setPokeCount(prev => prev + 1);
    playBunnyPokeSound(soundEnabled);
    setTimeout(() => {
      setIsBouncing(false);
      setIsEarWiggling(false);
    }, 500);
  }, [soundEnabled]);

  return {
    ...bunnyState,
    completed,
    total,
    isBlinking,
    isEarWiggling,
    isBouncing,
    triggerTaskBounce,
    pokeBunny,
    pokeCount,
  };
}
