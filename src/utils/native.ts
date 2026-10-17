import { invoke } from '@tauri-apps/api/core';

// Check if running in Tauri
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isTauri()) {
    try {
      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === 'granted';
      }
      return granted;
    } catch (e) {
      console.warn("Tauri notification error", e);
    }
  }

  // Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  }
  return false;
}

export async function sendMorningNotification(title: string = "🐰 Good morning.", body: string = "Your receipt is waiting.\nLet's make today count.") {
  if (isTauri()) {
    try {
      const { sendNotification } = await import('@tauri-apps/plugin-notification');
      sendNotification({
        title,
        body,
      });
      return;
    } catch (e) {
      console.warn("Tauri sendNotification error", e);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export async function setAutostart(enableAutostart: boolean): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    const { enable, disable, isEnabled } = await import('@tauri-apps/plugin-autostart');
    const currentlyEnabled = await isEnabled();
    if (enableAutostart && !currentlyEnabled) {
      await enable();
    } else if (!enableAutostart && currentlyEnabled) {
      await disable();
    }
    return true;
  } catch (e) {
    console.warn("Autostart plugin error", e);
    return false;
  }
}

export async function checkAutostartEnabled(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    const { isEnabled } = await import('@tauri-apps/plugin-autostart');
    return await isEnabled();
  } catch (e) {
    return false;
  }
}

export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (isTauri()) {
    try {
      await invoke('toggle_always_on_top', { alwaysOnTop });
    } catch (e) {
      console.warn("setAlwaysOnTop error", e);
    }
  }
}

export async function minimizeWindow(): Promise<void> {
  if (isTauri()) {
    try {
      await invoke('hide_window');
    } catch (e) {
      console.warn("hide_window error", e);
    }
  }
}

export async function closeOrMinimize(minimizeToTray: boolean): Promise<void> {
  if (isTauri()) {
    try {
      if (minimizeToTray) {
        await invoke('hide_window');
      } else {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      }
    } catch (e) {
      console.warn("close window error", e);
    }
  }
}
