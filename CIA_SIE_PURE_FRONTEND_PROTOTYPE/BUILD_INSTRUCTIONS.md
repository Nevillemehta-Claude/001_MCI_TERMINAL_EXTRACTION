# PROTOTYPE BUILD INSTRUCTIONS

**Authority:** PAD-FX1 Section 5
**Classification:** EXECUTION-ONLY

---

## QUICK START

### Option 1: Using npm
```bash
cd /Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE
npm install
npm run dev
```

### Option 2: Using Bun
```bash
cd /Users/nevillemehta/Downloads/001_MCI_TERMINAL_EXTRACTION/12_APPLICATION_CODE
bun install
bun run dev
```

---

## EXPECTED OUTPUT

After running `npm run dev` or `bun run dev`:

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open `http://localhost:5173` in your browser.

---

## PRODUCTION BUILD

```bash
npm run build
```

Output will be in `dist/` directory.

---

## TESTING

### Unit Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

---

## VERIFICATION

After starting the prototype, verify:

1. **Simulation Badge Visible** — Amber "SIMULATION" badge at top
2. **Token Timer Active** — Shows countdown to 6:00 AM IST
3. **Phase Navigation** — Can navigate through phases 0-4
4. **UXMI States** — Buttons show hover/active/loading states
5. **Error Format** — Any errors display WHAT/WHY/HOW

---

## ENVIRONMENT VARIABLES

Create `.env` file (optional for development):

```env
VITE_API_URL=http://localhost:3000
VITE_SIMULATION_MODE=true
```

---

## TROUBLESHOOTING

### Port Already in Use
```bash
lsof -i :5173
kill -9 <PID>
```

### Dependencies Not Installing
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run typecheck
```

---

*Build instructions verified: 2026-01-29*
