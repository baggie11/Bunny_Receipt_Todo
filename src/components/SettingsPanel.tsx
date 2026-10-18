import React, { useState, useEffect } from 'react';
import { AppSettings } from '../utils/storage';
import { setAutostart, requestNotificationPermission, isTauri } from '../utils/native';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
}

const TINTS: Array<{ key: AppSettings['paperTint']; label: string }> = [
  { key: 'classic',   label: 'Classic' },
  { key: 'warm',      label: 'Warm' },
  { key: 'parchment', label: 'Parchment' },
  { key: 'midnight',  label: 'Midnight' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  const [saved, setSaved] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState(settings.userBirthday);
  const [notifTimeInput, setNotifTimeInput] = useState(settings.notificationTime);

  // Sync external changes
  useEffect(() => {
    setBirthdayInput(settings.userBirthday);
    setNotifTimeInput(settings.notificationTime);
  }, [settings.userBirthday, settings.notificationTime]);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleToggle = (key: keyof AppSettings, value: boolean) => {
    onUpdate({ [key]: value });
    flash();

    // Side-effects
    if (key === 'startWithWindows') {
      setAutostart(value).catch(() => {});
    }
    if (key === 'morningNotification' && value) {
      requestNotificationPermission().catch(() => {});
    }
  };

  const handleBirthdayBlur = () => {
    const trimmed = birthdayInput.trim();
    // Validate MM-DD format
    const isValid = /^\d{2}-\d{2}$/.test(trimmed) || trimmed === '';
    const next = isValid ? trimmed : '';
    setBirthdayInput(next);
    if (next !== settings.userBirthday) {
      onUpdate({ userBirthday: next });
      flash();
    }
  };

  const handleNotifTimeBlur = () => {
    const trimmed = notifTimeInput.trim();
    const isValid = /^\d{2}:\d{2}$/.test(trimmed);
    const next = isValid ? trimmed : settings.notificationTime;
    setNotifTimeInput(next);
    if (next !== settings.notificationTime) {
      onUpdate({ notificationTime: next });
      flash();
    }
  };

  const handleTint = (tint: AppSettings['paperTint']) => {
    onUpdate({ paperTint: tint });
    flash();
  };

  const inTauri = isTauri();

  return (
    <div className="settings-view">
      <div className="settings-header">
        <div className="settings-title">Settings</div>
      </div>

      <div className="settings-scroll">

        {/* Appearance */}
        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-label-main">Paper Tint</span>
              <span className="settings-label-sub">Receipt color theme</span>
            </div>
            <div className="tint-selector">
              {TINTS.map(t => (
                <button
                  key={t.key}
                  className={`tint-btn tint-${t.key} ${settings.paperTint === t.key ? 'active' : ''}`}
                  onClick={() => handleTint(t.key)}
                  title={t.label}
                  aria-label={`${t.label} tint${settings.paperTint === t.key ? ' (active)' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-section-title">Notifications</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-label-main">Morning Reminder</span>
              <span className="settings-label-sub">Daily receipt nudge</span>
            </div>
            <label className="settings-toggle" aria-label="Morning notification">
              <input
                type="checkbox"
                checked={settings.morningNotification}
                onChange={e => handleToggle('morningNotification', e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-label-main">Reminder Time</span>
              <span className="settings-label-sub">HH:MM (24-hour)</span>
            </div>
            <input
              type="text"
              className="settings-text-input"
              value={notifTimeInput}
              onChange={e => setNotifTimeInput(e.target.value)}
              onBlur={handleNotifTimeBlur}
              placeholder="08:30"
              maxLength={5}
              aria-label="Notification time"
            />
          </div>
        </div>

        {/* Sound */}
        <div className="settings-section">
          <div className="settings-section-title">Sound</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-label-main">Sound Effects</span>
              <span className="settings-label-sub">Typewriter &amp; chimes</span>
            </div>
            <label className="settings-toggle" aria-label="Sound effects">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={e => handleToggle('soundEffects', e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </div>
        </div>

        {/* Bunny Companion */}
        {inTauri && (
          <div className="settings-section">
            <div className="settings-section-title">Bunny Companion</div>

            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-label-main">Bunny Check-in</span>
                <span className="settings-label-sub">Walk in to check on you</span>
              </div>
              <label className="settings-toggle" aria-label="Bunny check-in">
                <input
                  type="checkbox"
                  checked={settings.bunnyWalkEnabled}
                  onChange={e => handleToggle('bunnyWalkEnabled', e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            {settings.bunnyWalkEnabled && (
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-label-main">Check-in Interval</span>
                  <span className="settings-label-sub">Time before bunny visits</span>
                </div>
                <select
                  className="settings-text-input settings-select"
                  value={settings.bunnyWalkInterval}
                  onChange={e => {
                    onUpdate({ bunnyWalkInterval: Number(e.target.value) });
                    flash();
                  }}
                  aria-label="Check-in interval"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={1800}>30 minutes</option>
                  <option value={3600}>1 hour</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* System (Tauri-only) */}
        {inTauri && (
          <div className="settings-section">
            <div className="settings-section-title">System</div>

            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-label-main">Start with Windows</span>
                <span className="settings-label-sub">Launch on login</span>
              </div>
              <label className="settings-toggle" aria-label="Start with Windows">
                <input
                  type="checkbox"
                  checked={settings.startWithWindows}
                  onChange={e => handleToggle('startWithWindows', e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-label-main">Minimize to Tray</span>
                <span className="settings-label-sub">Keep running in background</span>
              </div>
              <label className="settings-toggle" aria-label="Minimize to tray">
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={e => handleToggle('minimizeToTray', e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-label">
                <span className="settings-label-main">Always on Top</span>
                <span className="settings-label-sub">Float above other windows</span>
              </div>
              <label className="settings-toggle" aria-label="Always on top">
                <input
                  type="checkbox"
                  checked={settings.alwaysOnTop}
                  onChange={e => handleToggle('alwaysOnTop', e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>
          </div>
        )}

        {/* Personal */}
        <div className="settings-section">
          <div className="settings-section-title">Personal</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-label-main">Birthday</span>
              <span className="settings-label-sub">MM-DD for a surprise 🎂</span>
            </div>
            <input
              type="text"
              className="settings-text-input"
              value={birthdayInput}
              onChange={e => setBirthdayInput(e.target.value)}
              onBlur={handleBirthdayBlur}
              placeholder="MM-DD"
              maxLength={5}
              aria-label="Birthday (MM-DD)"
            />
          </div>
        </div>

        <div className={`settings-saved-note ${saved ? 'visible' : ''}`}>
          ✓ saved
        </div>

        <div className="settings-version">Bunny Receipt v1.0.0</div>
      </div>
    </div>
  );
};
