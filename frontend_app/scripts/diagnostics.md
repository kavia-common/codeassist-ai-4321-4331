# Frontend Connectivity Diagnostics

This project includes two ways to verify connectivity to the backend:

1) In-app Diagnostics
- Open the app
- Click the "Diagnostics" button in the header
- Click "Run Checks"
- Review logs for health and sample POST requests

2) Programmatic Checks (optional)
You can also programmatically verify connectivity from the browser console:

Example snippets:
- await window.__copilotDiag.health()
- await window.__copilotDiag.generate()
- await window.__copilotDiag.explain()
- await window.__copilotDiag.debug()

To enable these globals, add this snippet to src/index.js after imports and before render:

import { getHealth, postGenerate, postExplain, postDebug } from './api';
window.__copilotDiag = {
  health: () => getHealth(),
  generate: () => postGenerate({ prompt: 'Hello' }),
  explain: () => postExplain({ code: 'const x = 1;' }),
  debug: () => postDebug({ code: 'function f(){throw new Error(\"boom\")}; f();', error: 'boom' })
};

Note: If you prefer not to expose globals in production, only use this during development.

Mixed-content and CORS notes:
- If using HTTPS for frontend, set REACT_APP_BACKEND_BASE_URL to an HTTPS URL.
- Ensure backend CORS includes the exact frontend origin, including scheme and port.
