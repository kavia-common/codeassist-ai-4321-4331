# Frontend Testing (React + RTL)

- Install deps:
  npm ci

- Run tests in CI mode:
  CI=true npm test -- --watchAll=false

Notes:
- Network calls are mocked via global.fetch in tests
- JSDOM environment is configured via package.json jest fields and src/setupTests.js + jest.setup.js
- No live backend required
