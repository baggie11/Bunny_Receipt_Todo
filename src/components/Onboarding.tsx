import React, { useState } from 'react';
import { Bunny } from './Bunny';
import { AppSettings } from '../utils/storage';
import { requestNotificationPermission } from '../utils/native';

interface OnboardingProps {
  onComplete: (partial: Partial<AppSettings>) => void;
}

type Step = 'welcome' | 'birthday' | 'notifications';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [birthdayInput, setBirthdayInput] = useState('');
  const [collected, setCollected] = useState<Partial<AppSettings>>({});

  const stepIndex: Record<Step, number> = { welcome: 0, birthday: 1, notifications: 2 };
  const totalSteps = 3;

  const finish = (extra: Partial<AppSettings> = {}) => {
    onComplete({ ...collected, ...extra, hasSeenOnboarding: true });
  };

  const handleWelcomeContinue = () => setStep('birthday');

  const handleBirthdayContinue = () => {
    const trimmed = birthdayInput.trim();
    const isValid = /^\d{2}-\d{2}$/.test(trimmed);
    const birthday = isValid ? trimmed : '';
    setCollected(prev => ({ ...prev, userBirthday: birthday }));
    setStep('notifications');
  };

  const handleNotifYes = async () => {
    await requestNotificationPermission();
    finish({ morningNotification: true });
  };

  const handleNotifNo = () => {
    finish({ morningNotification: false });
  };

  const currentIndex = stepIndex[step];

  return (
    <div className="onboarding-overlay">
      {step === 'welcome' && (
        <div className="onboarding-step">
          <div className="onboarding-bunny-area">
            <Bunny
              mood="hopeful"
              isBlinking={false}
              isEarWiggling={false}
              isBouncing={false}
              isCelebrating={false}
              text="Hello! I'm your bunny."
              subtext="Let's get you set up."
            />
          </div>

          <div className="onboarding-divider">
            - - - - - - - - - - - - - - - -
          </div>

          <div className="onboarding-title">Welcome to<br />Bunny Receipt</div>
          <div className="onboarding-subtitle">
            A daily task list that keeps a receipt of your day.
            Small steps, every day.
          </div>

          <div className="onboarding-actions">
            <button
              className="onboarding-primary-btn"
              onClick={handleWelcomeContinue}
            >
              Let's go →
            </button>
          </div>
        </div>
      )}

      {step === 'birthday' && (
        <div className="onboarding-step">
          <div className="onboarding-bunny-area">
            <Bunny
              mood="excited"
              isBlinking={false}
              isEarWiggling={false}
              isBouncing={false}
              isCelebrating={false}
              text="When's your birthday?"
              subtext="I'll do something special."
            />
          </div>

          <div className="onboarding-divider">
            - - - - - - - - - - - - - - - -
          </div>

          <div className="onboarding-field-label">Birthday (optional)</div>
          <input
            type="text"
            className="onboarding-input"
            value={birthdayInput}
            onChange={e => setBirthdayInput(e.target.value)}
            placeholder="MM-DD"
            maxLength={5}
            aria-label="Birthday month and day"
            autoFocus
          />
          <div className="onboarding-hint">e.g. 10-03 for October 3rd</div>

          <div className="onboarding-actions">
            <button
              className="onboarding-primary-btn"
              onClick={handleBirthdayContinue}
            >
              Continue →
            </button>
            <button
              className="onboarding-skip-btn"
              onClick={() => {
                setCollected(prev => ({ ...prev, userBirthday: '' }));
                setStep('notifications');
              }}
            >
              skip
            </button>
          </div>
        </div>
      )}

      {step === 'notifications' && (
        <div className="onboarding-step">
          <div className="onboarding-bunny-area">
            <Bunny
              mood="happy"
              isBlinking={false}
              isEarWiggling={false}
              isBouncing={false}
              isCelebrating={false}
              text="Morning reminders?"
              subtext="I'll nudge you to start your day."
            />
          </div>

          <div className="onboarding-divider">
            - - - - - - - - - - - - - - - -
          </div>

          <div className="onboarding-subtitle">
            Get a gentle reminder each morning to open your receipt and plan your day.
          </div>

          <div className="onboarding-actions">
            <button
              className="onboarding-primary-btn"
              onClick={handleNotifYes}
            >
              Yes, remind me
            </button>
            <button
              className="onboarding-skip-btn"
              onClick={handleNotifNo}
            >
              no thanks
            </button>
          </div>
        </div>
      )}

      {/* Step dots */}
      <div className="onboarding-dots">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`onboarding-dot ${i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};
