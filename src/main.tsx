import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global styles
import "./styles/receipt.css";
import "./styles/bunny.css";
import "./styles/history.css";
import "./styles/settings.css";
import "./styles/onboarding.css";
import "./styles/bunny-walk.css";

import { BunnyWalk } from "./components/BunnyWalk";

const root = document.getElementById("root") as HTMLElement;

// Route: if the URL hash is #bunny-walk, render the desktop bunny walk window
// instead of the main app. This window is loaded by the Tauri "bunny-walk"
// window config with url: "index.html#bunny-walk".
if (window.location.hash === "#bunny-walk") {
  // Ensure the webview is fully transparent
  document.body.style.background = "transparent";
  document.documentElement.style.background = "transparent";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BunnyWalk />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
