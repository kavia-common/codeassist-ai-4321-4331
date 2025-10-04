import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// PUBLIC_INTERFACE
// Diagnostics helpers: expose minimal API to window for quick e2e checks from console.
// This uses the configured REACT_APP_BACKEND_BASE_URL and will surface mixed-content/CORS/network errors.
import { getHealth, postGenerate, postExplain, postDebug } from './api';
if (typeof window !== 'undefined') {
  window.__copilotDiag = {
    /** Runs GET / */
    health: () => getHealth(),
    /** Runs POST /generate with a simple prompt */
    generate: () => postGenerate({ prompt: 'Say hello' }),
    /** Runs POST /explain with a small code sample */
    explain: () => postExplain({ code: 'const x = 1;' }),
    /** Runs POST /debug with a tiny code snippet and errorContext */
    debug: () => postDebug({ code: "function f(){ throw new Error('boom'); } f();", error: 'boom' })
  };
  // Brief console hint
  // eslint-disable-next-line no-console
  console.log('[AI Copilot] Diagnostics available on window.__copilotDiag: health(), generate(), explain(), debug()');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
