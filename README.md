# Bunny Receipt

A daily task manager that keeps a receipt of your day. Small steps, every day. Built with Tauri + React + TypeScript.

---

## Usage Guide

### Adding tasks

Type a task in the input at the bottom of the receipt and press **Enter** (or click ↵). Tasks appear as receipt line items with a timestamp.

### Completing tasks

Click the **[ ]** checkbox next to any task to mark it complete. A small confetti burst fires on each check, and a bigger celebration triggers when you clear the whole list. Click a checked task again to uncheck it.

### Editing tasks

**Double-click** any incomplete task text to edit it inline. Press **Enter** to save or **Escape** to cancel. You can also click the pencil icon that appears on hover.

### Deleting tasks

Hover over a task and click the **×** button on the right.

### The bunny

Your bunny reacts to your progress — tired at 0%, hopeful as you start, excited past halfway, ecstatic near the end, and full celebration at 100%. Click the bunny anytime to poke it.

### History

Switch to the **History** tab to browse past days. Each entry shows a mini progress bar and completion percentage. Click any day to see its full task list.

### Settings

Switch to the **Settings** tab to configure:

| Setting | Description |
|---|---|
| Paper Tint | Four receipt color themes: Classic, Warm, Parchment, Midnight |
| Morning Reminder | Daily notification to open your receipt |
| Reminder Time | Time for the morning notification (HH:MM, 24-hour) |
| Sound Effects | Typewriter clicks and chimes on task actions |
| Start with Windows | Launch automatically on login (requires installed build) |
| Minimize to Tray | Closing the window hides to system tray instead of quitting |
| Always on Top | Float the window above all other apps |
| Birthday | Set your birthday (MM-DD) for a special surprise |

### System tray

When running, Bunny Receipt lives in the system tray. Left-click the icon to toggle the window. Right-click for a menu with quick access to the receipt, history, settings, and quit.

---

## Running & Building

### Development

```powershell
npm install
npm run tauri dev
```

Requires [Rust](https://rustup.rs/) and the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

### Production build

```powershell
npm run tauri build
```

Produces an installer in `src-tauri/target/release/bundle/`. Install it to enable the **Start with Windows** autostart feature.

### Frontend only (no native features)

```powershell
npm run dev
```

Opens at `http://localhost:1420`. Tauri-specific features (notifications, autostart, tray) won't work in the browser.
