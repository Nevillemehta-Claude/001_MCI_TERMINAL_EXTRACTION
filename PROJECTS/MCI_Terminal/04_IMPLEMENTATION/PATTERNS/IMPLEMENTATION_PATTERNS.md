# MCI IMPLEMENTATION PATTERNS

**Extracted from:** Session b8937bc2-ac10-4287-8ced-af96ac5f6f0b
**Extraction Date:** 2026-01-25
**Classification:** IMPLEMENTATION

---

## STATE MANAGEMENT PATTERN

### Zustand Store Architecture

```
tokenStore → scannerStore → ignitionStore → telemetryStore → shutdownStore
```

Each store follows this pattern:

```typescript
// Store Pattern
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  // State
  data: DataType;
  status: 'idle' | 'loading' | 'success' | 'error';

  // Actions
  action: () => void;
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: initialData,
      status: 'idle',

      action: () => {
        set({ status: 'loading' });
        // ... action logic
        set({ status: 'success', data: newData });
      },

      reset: () => set({ data: initialData, status: 'idle' }),
    }),
    { name: 'store-name' }
  )
);
```

---

## COMPONENT STATE PATTERN

### 7-State Component Pattern (CR-005)

```typescript
// All UXMI components implement this state pattern
type ComponentState =
  | 'idle'
  | 'hover'
  | 'active'
  | 'loading'
  | 'success'
  | 'error'
  | 'disabled';

interface ComponentProps {
  state: ComponentState;
  // ... other props
}
```

---

## PHASE TRANSITION PATTERN

### Phase Flow

```typescript
enum Phase {
  TOKEN_CAPTURE = 0,
  PRE_IGNITION = 1,
  IGNITION = 2,
  TELEMETRY = 3,
  SHUTDOWN = 4,
}

// Transition logic
function canTransition(from: Phase, to: Phase): boolean {
  const validTransitions = {
    [Phase.TOKEN_CAPTURE]: [Phase.PRE_IGNITION],
    [Phase.PRE_IGNITION]: [Phase.IGNITION, Phase.TOKEN_CAPTURE],
    [Phase.IGNITION]: [Phase.TELEMETRY, Phase.PRE_IGNITION],
    [Phase.TELEMETRY]: [Phase.SHUTDOWN],
    [Phase.SHUTDOWN]: [Phase.TOKEN_CAPTURE],
  };

  return validTransitions[from].includes(to);
}
```

---

## ERROR HANDLING PATTERN

### CR-003 Compliant Error Format

```typescript
interface MCIError {
  what: string;  // What went wrong
  why: string;   // Root cause
  how: string;   // Recovery action
  technicalDetails?: string;  // For developers
  code?: string;  // Error code
}

function formatError(error: Error): MCIError {
  return {
    what: 'Operation failed',
    why: error.message,
    how: 'Please retry or contact support',
    technicalDetails: error.stack,
  };
}

// Usage in ErrorDisplay component
<ErrorDisplay
  what={error.what}
  why={error.why}
  how={error.how}
  technicalDetails={error.technicalDetails}
/>
```

---

## TWO-STAGE SAFETY PATTERN

### For Ignition and Shutdown

```typescript
interface TwoStageControl {
  stage: 'idle' | 'armed' | 'executing' | 'complete';
  arm: () => void;
  execute: () => void;
  reset: () => void;
}

// Implementation
const useTwoStageControl = create<TwoStageControl>((set, get) => ({
  stage: 'idle',

  arm: () => {
    if (get().stage === 'idle') {
      set({ stage: 'armed' });
      // Auto-reset after timeout
      setTimeout(() => {
        if (get().stage === 'armed') {
          set({ stage: 'idle' });
        }
      }, 30000); // 30 second timeout
    }
  },

  execute: () => {
    if (get().stage === 'armed') {
      set({ stage: 'executing' });
      // ... execute action
      set({ stage: 'complete' });
    }
  },

  reset: () => set({ stage: 'idle' }),
}));
```

---

## REAL-TIME DATA PATTERN

### WebSocket with Fallback

```typescript
class TelemetryConnection {
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;

  connect() {
    try {
      // Try WebSocket first
      this.ws = new WebSocket('wss://...');
      this.ws.onmessage = this.handleMessage;
      this.ws.onerror = this.fallbackToSSE;
    } catch {
      this.fallbackToSSE();
    }
  }

  fallbackToSSE() {
    // Fall back to Server-Sent Events
    this.sse = new EventSource('/api/telemetry/stream');
    this.sse.onmessage = this.handleMessage;
    this.sse.onerror = this.fallbackToPolling;
  }

  fallbackToPolling() {
    // Last resort: polling
    setInterval(() => {
      fetch('/api/telemetry')
        .then(res => res.json())
        .then(this.handleMessage);
    }, 1000);
  }
}
```

---

## TIMING CONSTANTS PATTERN

### Centralized Timing

```typescript
// src/client/constants/timing.ts
export const TIMING = {
  // UXMI (CR-005)
  hover: 150,     // ms - transition to hover state
  active: 100,    // ms - button press feedback
  tooltip: 300,   // ms - delay before tooltip shows
  toast: 5000,    // ms - auto-dismiss duration

  // Reconnection
  reconnectDelay: 1000,
  reconnectMaxDelay: 30000,

  // Safety
  armTimeout: 30000,  // 30 seconds to execute after arming

  // Token (CR-004)
  tokenExpiryCheckInterval: 60000,  // Check every minute
};
```

---

## FILE STRUCTURE PATTERN

```
src/
├── client/
│   ├── components/
│   │   ├── phase0/           ← Token Capture components
│   │   ├── phase1/           ← Scanner components
│   │   ├── phase2/           ← Ignition components
│   │   ├── phase3/           ← Telemetry components
│   │   ├── phase4/           ← Shutdown components
│   │   └── uxmi/             ← UXMI component library
│   ├── stores/               ← Zustand stores
│   ├── hooks/                ← Custom React hooks
│   ├── utils/                ← Utility functions
│   └── constants/            ← Constants (timing, etc.)
│
├── server/
│   ├── routes/               ← API routes
│   ├── services/             ← Business logic
│   └── middleware/           ← Express middleware
│
└── shared/
    └── types/                ← Shared TypeScript types
```

---

## TESTING PATTERN

### Unit Test Structure

```typescript
// Component test pattern
describe('Button', () => {
  // Test all 7 states
  const states = ['idle', 'hover', 'active', 'loading', 'success', 'error', 'disabled'];

  states.forEach(state => {
    it(`renders correctly in ${state} state`, () => {
      render(<Button state={state}>Click me</Button>);
      // assertions
    });
  });

  // Test timing constants
  it('transitions to hover in 150ms', () => {
    // timing test
  });
});
```
