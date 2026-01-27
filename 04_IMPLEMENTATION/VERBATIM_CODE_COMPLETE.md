# VERBATIM CODE BLOCKS - COMPLETE EXTRACTION

**Source:** b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
**Extraction Date:** 2026-01-25

---


## TYPESCRIPT CODE BLOCKS

### Block 1

```typescript
interface UXMIComponentProps {
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  disabledReason?: string; // REQUIRED if disabled=true
  ariaLabel?: string;
  shortcut?: string;
}
```

---
### Block 2

```typescript
expiry.setUTCHours(0, 30, 0, 0); // 6 AM IST = 00:30 UTC
```

---
### Block 3

```typescript
// CURRENT: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'SPY', 'QQQ']
// REQUIRED: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN']
```

---
### Block 4

```typescript
// CURRENT: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'SPY']
// REQUIRED: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']
```

---
### Block 5

```typescript
// CURRENT: CIA-SIE-START-STOP • MCI v1.0.0 • CR-005 Compliant
// REQUIRED: MCI • Mission Control Interface v1.0.0 • CR-005 Compliant
```

---
### Block 6

```typescript
"@/*" → "./src/*"

// Usage example:
import { tokenStore } from '@/stores/tokenStore';
// Resolves to: ./src/stores/tokenStore
```

---
### Block 7

```typescript
sentryEnabled = Boolean(
  env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
);
```

---
### Block 8

```typescript
'@' → './src'

// Usage:
import { tokenStore } from '@/stores/tokenStore';
```

---
### Block 9

```typescript
'/api' → 'http://localhost:3000'
```

---
### Block 10

```typescript
await expect(inputs).toHaveCount(3); // alpaca key, secret, polygon key
```

---
### Block 11

```typescript
await expect(inputs).toHaveCount(3); // kite api key, access token, user id
```

---

## JSON CODE BLOCKS

### Block 1

```json
{
  "last_ignition": "2026-01-16T10:30:00Z",
  "selected_model": "claude-3-5-sonnet-20241022",
  "backend_pid": 12345,
  "kite_token_expiry": "2026-01-17T06:00:00+05:30",
  "total_ai_spend_session": 0.45,
  "event_log": [...],
  "preferences": {
    "remember_model": true,
    "auto_reconnect": true,
    "theme": "dark"
  }
}
```

---
### Block 2

```json
"extends": "./tsconfig.json"
```

---
### Block 3

```json
"name": "mci"
"version": "1.0.0"
"lockfileVersion": 3
```

---

## BASH CODE BLOCKS

### Block 1

```bash
# Browser cache (if using Claude.ai web)
rm -rf ~/Library/Caches/com.anthropic.*

# Any temp files
rm -rf /tmp/claude-*
```

---
### Block 2

```bash
# Start Development
cd /Users/nevillemehta/Downloads/PROJECTS/01_MCI/04_IMPLEMENTATION/mci
bun install
bun run dev      # Frontend
bun run server   # Backend

# Production Build
bun run build
```

---
### Block 3

```bash
# Delete the cached tool results for this session
rm -rf ~/.claude/projects/-Users-nevillemehta/b8937bc2-ac10-4287-8ced-af96ac5f6f0b/tool-results/

# Or delete entire session history (nuclear option - loses ALL context)
rm ~/.claude/projects/-Users-nevillemehta/b8937bc2-ac10-4287-8ced-af96ac5f6f0b.jsonl
```

---
### Block 4

```bash
npm install vitest@latest @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
npm run test:mutation
```

---
