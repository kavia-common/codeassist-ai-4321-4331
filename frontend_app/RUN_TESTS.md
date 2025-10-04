# Running Frontend Tests

This project uses Create React App with Jest and React Testing Library preconfigured.

Run in non-interactive CI mode:
```bash
CI=true npm test -- --watchAll=false
```

Notes:
- Tests mock network calls via `global.fetch`.
- No live backend is required.
