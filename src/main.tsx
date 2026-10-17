import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global styles
import "./styles/receipt.css";
import "./styles/bunny.css";
import "./styles/history.css";
import "./styles/settings.css";
import "./styles/onboarding.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
