import { useEffect, useRef, useState } from 'react';
import { isTauri, hideBunnyWalk, showMainWindow } from '../utils/native';

const MESSAGES = [
  'Hey... you still there?',
  'Don\'t forget your tasks!',
  'Just checking in!',
  'You\'ve got this!',
  'Come add to your receipt!',
  'I miss you already!',
  'Your tasks are waiting...',
  'Need a little nudge?',
  'One step at a time!',
];

type Phase = 'waiting' | 'walking-in' | 'talking' | 'walking-out';

export function BunnyWalk() {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [message, setMessage] = useState('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timersRef.current.push(t);
  };

  const handleClick = () => {
    clearTimers();
    setPhase('walking-out');
    addTimer(() => {
      setPhase('waiting');
      hideBunnyWalk();
      showMainWindow();
    }, 600);
  };

  const startWalk = () => {
    clearTimers();
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setPhase('walking-in');

    // After walk-in completes, show speech bubble
    addTimer(() => setPhase('talking'), 1500);
    // After talking, walk out
    addTimer(() => setPhase('walking-out'), 4500);
    // After walk-out, hide the window
    addTimer(() => {
      setPhase('waiting');
      hideBunnyWalk();
    }, 5700);
  };

  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;

    import('@tauri-apps/api/event').then(({ listen }) => {
      listen('bunny-walk-start', () => startWalk()).then(fn => { unlisten = fn; });
    });

    return () => {
      clearTimers();
      unlisten?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'waiting') {
    return <div className="bunny-walk-root" />;
  }

  const showBubble = phase === 'talking';

  return (
    <div className="bunny-walk-root">
      <div className="bunny-walk-scene">
        {/* Speech bubble */}
        <div className={`bunny-walk-bubble${showBubble ? ' visible' : ''}`}>
          <span className="bunny-walk-bubble-text">{message}</span>
        </div>

        {/* Bunny */}
        <div
          className={`bunny-walk-bunny ${phase}`}
          onClick={handleClick}
          role="button"
          aria-label="Click to open Bunny Receipt"
        >
          <div className="bunny-walk-bunny-inner">
            <svg viewBox="0 0 100 90" className="bunny-walk-svg" xmlns="http://www.w3.org/2000/svg">
              {/* Shadow */}
              <ellipse cx="50" cy="86" rx="22" ry="2.5" fill="rgba(0,0,0,0.12)" />

              {/* Ears */}
              <g className="bunny-walk-ears">
                <path
                  d="M 38 38 C 32 18 35 6 42 8 C 48 10 46 22 44 38 Z"
                  fill="#ffffff" stroke="#262320" strokeWidth="2.5" strokeLinejoin="round"
                />
                <path
                  d="M 40 32 C 37 22 38 14 41 14"
                  fill="none" stroke="#f7b5b5" strokeWidth="2" strokeLinecap="round"
                />
                <path
                  d="M 58 38 C 56 22 54 10 60 8 C 68 6 70 18 62 38 Z"
                  fill="#ffffff" stroke="#262320" strokeWidth="2.5" strokeLinejoin="round"
                />
                <path
                  d="M 61 14 C 64 14 64 22 61 32"
                  fill="none" stroke="#f7b5b5" strokeWidth="2" strokeLinecap="round"
                />
              </g>

              {/* Head */}
              <path
                d="M 32 40 C 26 50 26 62 34 68 C 40 73 60 73 66 68 C 74 62 74 50 68 40 C 62 33 38 33 32 40 Z"
                fill="#ffffff" stroke="#262320" strokeWidth="2.5" strokeLinejoin="round"
              />

              {/* Cheeks */}
              <ellipse cx="36" cy="58" rx="3" ry="2" fill="#ffb3ba" opacity="0.6" />
              <ellipse cx="64" cy="58" rx="3" ry="2" fill="#ffb3ba" opacity="0.6" />

              {/* Eyes (hopeful — round with gleam) */}
              <ellipse cx="42" cy="53" rx="3" ry="3.5" fill="#262320" />
              <circle cx="41" cy="51.5" r="1.2" fill="#ffffff" />
              <ellipse cx="58" cy="53" rx="3" ry="3.5" fill="#262320" />
              <circle cx="57" cy="51.5" r="1.2" fill="#ffffff" />

              {/* Nose */}
              <polygon points="48,60 50,58 52,60 50,62" fill="#f4a261" />

              {/* Mouth (smile) */}
              <path
                d="M 47 62 Q 50 65 53 62"
                fill="none" stroke="#262320" strokeWidth="1.8" strokeLinecap="round"
              />

              {/* Whiskers */}
              <line x1="30" y1="61" x2="22" y2="59" stroke="#262320" strokeWidth="1" strokeLinecap="round" />
              <line x1="30" y1="64" x2="22" y2="66" stroke="#262320" strokeWidth="1" strokeLinecap="round" />
              <line x1="70" y1="61" x2="78" y2="59" stroke="#262320" strokeWidth="1" strokeLinecap="round" />
              <line x1="70" y1="64" x2="78" y2="66" stroke="#262320" strokeWidth="1" strokeLinecap="round" />

              {/* Paws */}
              <ellipse cx="42" cy="76" rx="5" ry="3" fill="#ffffff" stroke="#262320" strokeWidth="2" />
              <ellipse cx="58" cy="76" rx="5" ry="3" fill="#ffffff" stroke="#262320" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
