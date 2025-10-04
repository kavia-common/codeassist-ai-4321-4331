# AI Copilot Frontend (Executive Gray)

A lightweight React app that provides a classic, business‑styled chat interface to interact with the AI Copilot backend. It supports three modes: Generate, Explain, and Debug.

## Features

- Executive Gray theme (primary #374151, secondary #9CA3AF, background #F9FAFB)
- Classic chat layout with header, conversation history, and fixed input bar
- Mode selector (Generate/Explain/Debug)
- Code block rendering for responses (``` fenced blocks)
- Accessible labels, aria-live updates, and loading state
- API helper with environment-based backend base URL
- Built-in Diagnostics panel to verify connectivity to backend

## Prerequisites

- Node.js 16+ and npm

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

Available variables:

- REACT_APP_BACKEND_BASE_URL (default http://localhost:3001)

Important: If the frontend is served over HTTPS (e.g., preview URLs), the backend must also be reachable via HTTPS to avoid mixed-content blocking. Set REACT_APP_BACKEND_BASE_URL to your HTTPS backend origin (e.g., https://<host>:3001). Use the provided .env.example as a starting point.

## API Integration

The app communicates with the backend’s REST endpoints:

- POST /generate
- POST /explain
- POST /debug

Configuration is centralized in `src/api.js`. The base URL is taken from `REACT_APP_BACKEND_BASE_URL` or falls back to `http://localhost:3001`.

## Diagnostics

Use the "Diagnostics" button in the header to:
- Run GET / (health)
- Send sample requests to POST /generate, /explain, /debug
- View results or precise error messages (CORS, mixed-content, missing key/model, etc.)

This executes calls from the browser using the configured `REACT_APP_BACKEND_BASE_URL`, helping identify mixed-content or CORS issues immediately.

## Project Structure

- `src/components/Header.js` - App header with title and connection info (+ Diagnostics)
- `src/components/MessageBubble.js` - User/assistant message bubbles with code blocks
- `src/components/InputBar.js` - Mode selector, textarea, and send button
- `src/api.js` - API helper (postGenerate, postExplain, postDebug)
- `src/App.js` - Main composition and state management
- `src/App.css` and `src/index.css` - Theme and layout styles

## Testing

```bash
npm test
```

## Build

```bash
npm run build
```

Outputs production assets into the `build` folder.

## Notes

- The app includes basic error handling. Errors from the backend are shown as an alert banner and echoed into the chat for visibility.
- No third-party UI or markdown libraries are used to keep the bundle lightweight.
