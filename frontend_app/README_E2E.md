# End-to-End (E2E) Tests with Playwright

This folder contains Playwright-based E2E tests that exercise the React frontend against the FastAPI backend.

Assumptions:
- Services are already running (we do not start servers in tests):
  - Frontend: http://localhost:3000
  - Backend:  http://localhost:3001
- You can override the base URLs with environment variables:
  - E2E_BASE_URL: base URL for the frontend (default http://localhost:3000)
  - BASE_BACKEND_URL: base URL for the backend (default http://localhost:3001)

Key files:
- playwright.config.ts — config with retries, artifacts on failure, and baseURL handling
- tests/e2e/chat.spec.ts — covers:
  - Rendering the app header and initial state
  - Main chat flow (sending prompt and receiving response) — requires live backend
  - Error handling when backend is down (simulated)
  - Fallback test that intercepts network requests (works without backend)

## Install

From the frontend_app directory:

1) Install Node dependencies (non-interactive):
   npm ci

2) Install Playwright browsers:
   npx playwright install --with-deps

Note: In CI, `--with-deps` ensures required packages are installed in the runner environment.

## Running Locally

Ensure both servers are running first:
- Frontend (CRA):
  npm start
  (Serves at http://localhost:3000)

- Backend (FastAPI):
  uvicorn src.api.main:app --reload --port 3001
  (Serves at http://localhost:3001)

Run the E2E tests in headless mode:
  npm run e2e

Run the E2E tests in headed mode (opens browser):
  npm run e2e:headed

Override base URLs if needed:
  E2E_BASE_URL=http://127.0.0.1:3000 BASE_BACKEND_URL=http://127.0.0.1:3001 npm run e2e

## Running in CI

Use the CI script which sets:
- CI mode (retries enabled in playwright.config.ts)
- Playwright config for artifacts on failure

Example:
  npm run e2e:ci

Ensure your CI job starts or has access to running frontend/backend services at the specified ports, or use the fallback intercepting test by keeping the backend unavailable (the intercept test will still pass).

## Notes on Mocking External OpenAI Calls

- The backend already contains unit tests that mock OpenAI calls.
- For E2E, we do not hit external OpenAI. We either:
  1) Run the backend normally with a dummy OPENAI_API_KEY and a local or non-calling configuration; or
  2) Use Playwright `page.route` to intercept backend requests (`/generate`, `/explain`, `/debug`) and return mocked responses. The file `tests/e2e/chat.spec.ts` contains a fallback test doing exactly this.

## Troubleshooting

- Mixed Content (HTTPS frontend, HTTP backend):
  The frontend guards against mixed content. If you see errors, ensure the backend is reachable via HTTPS or adjust `REACT_APP_BACKEND_BASE_URL`.

- CORS:
  Ensure the backend CORS includes the exact frontend origin, including scheme and port.

- Ports in Use:
  If ports 3000/3001 are taken, either stop the other services or override the base URLs using environment variables.

- Artifacts:
  On failures (especially in CI), check Playwright traces/screenshots/videos in the test output folder or the Playwright HTML report if configured.
